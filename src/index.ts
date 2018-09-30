import {APIGatewayEvent, Context} from 'aws-lambda'
import {Server} from 'hapi'

export type UserOptions = {
  readonly filterHeaders?: boolean
  readonly stringifyBody?: boolean
}

export type OnInitError = (error: Error) => void

type Data = {
  readonly statusCode: number
  readonly body: string | object | undefined
  readonly headers: {readonly [name: string]: string}
}

export type ResponseData =
  | {
      readonly res?: Data
    }
  | Data

type QueryStrings = {readonly [name: string]: string}

type ServerOptions = {
  readonly method: string
  readonly url: string
  readonly headers: {readonly [name: string]: string}
  readonly payload: Object
}

enum Provider {
  AWS,
  AZURE,
  GCP,
}

function buildQueryString(queryStrings: QueryStrings): string {
  return Object.keys(queryStrings)
    .map(key => `${key}=${queryStrings[key]}`)
    .join('&')
}

function getUrl(event: APIGatewayEvent): string {
  const azEvent = event as any

  return (
    event.path || (azEvent.req && (azEvent.req.url || azEvent.req.originalUrl))
  )
}

function buildFullUrl(
  event: APIGatewayEvent,
  queryStrings: QueryStrings | null
): string {
  const url = getUrl(event)
  return !!queryStrings ? `${url}?${buildQueryString(queryStrings)}` : url
}

function setupServer({
  server,
  onInitError,
  userOptions,
  serverOptions,
  provider,
}: {
  readonly server: Server
  readonly onInitError: OnInitError
  readonly userOptions: UserOptions
  readonly serverOptions: ServerOptions
  readonly provider: Provider
}): Promise<ResponseData | void> {
  return server
    .initialize()
    .then(async () => {
      const hapiResponse = await server.inject(serverOptions)
      const statusCode = hapiResponse.statusCode
      const body = hapiResponse.result

      // We need to remove hapi's content-encoding, transfer-encoding
      // because lambda usually set's these.
      // We filter away them by default but this can be changed
      // by setting the `filterHeaders option to false.
      const getHeaders = () => {
        const {
          headers: {
            ['content-encoding']: _,
            ['transfer-encoding']: __,
            ...headers
          },
        } = hapiResponse
        return userOptions.filterHeaders ? headers : hapiResponse.headers
      }

      const headers = getHeaders()
      const cookieHeader = headers['set-cookie']

      // Lambda get's in trouble if we send back an array...
      const setCookieHeader = Array.isArray(cookieHeader)
        ? cookieHeader[0]
        : cookieHeader

      const data = {
        statusCode,
        body: userOptions.stringifyBody
          ? typeof body === 'string'
            ? body
            : JSON.stringify(body)
          : body,
        headers: !!setCookieHeader
          ? {...headers, ['set-cookie']: setCookieHeader}
          : headers,
      }

      return provider == Provider.AZURE ? {res: data} : data
    })
    .catch(onInitError)
}

function getProvider(event: APIGatewayEvent | any): Provider {
  return !!event.done ? Provider.AZURE : Provider.AWS
}

export function serverlessHapi(
  server: Server,
  // Function to be called when `server.initialize` fails.
  // According to the hapi documentation we should abort as soon as this
  // function is called and contains an error. This is because the server
  // is considered to be in an undefined state. It is recommended to assert
  // that no error has been returned. Read more at hapi's documentation:
  // https://github.com/hapijs/hapi/blob/v16/API.md#serverinitializecallback
  onInitError: OnInitError,
  userOptions: UserOptions = {filterHeaders: true, stringifyBody: true}
): (event: APIGatewayEvent, context: Context) => Promise<ResponseData | void> {
  return (event: APIGatewayEvent | any, _context: Context) => {
    const provider = getProvider(event)

    const queryStrings =
      provider === Provider.AWS ? event.queryStringParameters : event.query

    const defaultOptions = {
      method: event.httpMethod,
      url: buildFullUrl(event, queryStrings),
      headers: event.headers,
      payload: event.body,
    }

    const serverOptions =
      provider === Provider.AWS
        ? defaultOptions
        : provider === Provider.AZURE
          ? {
              ...defaultOptions,
              method: event.req && event.req.method,
              headers: event.req && event.req.headers,
              payload: event.req && event.req.body,
            }
          : {
              ...defaultOptions,
              method: event.method,
            }

    return setupServer({
      server,
      onInitError,
      serverOptions,
      userOptions,
      provider,
    })
  }
}
