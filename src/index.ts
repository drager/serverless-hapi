import {APIGatewayEvent, Context} from 'aws-lambda'
import {Server} from 'hapi'

export type UserOptions = {
  readonly filterHeaders?: boolean
  readonly stringifyBody?: boolean
}

export type OnInitError = (error: Error) => void

export type ResponseData = {
  readonly statusCode: number
  readonly body: string | object | undefined
  readonly headers: {readonly [name: string]: string}
}

type QueryStrings = {readonly [name: string]: string}

type ServerOptions = {
  readonly method: string
  readonly url: string
  readonly headers: {readonly [name: string]: string}
  readonly payload: Object
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
}: {
  readonly server: Server
  readonly onInitError: OnInitError
  readonly userOptions: UserOptions
  readonly serverOptions: ServerOptions
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
        headers: {...headers, ['set-cookie']: setCookieHeader},
      }

      return data
    })
    .catch(onInitError)
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
  return (event: APIGatewayEvent, _context: Context) => {
    const azEvent = event as any

    const queryStrings = event.queryStringParameters

    const serverOptions = {
      method: event.httpMethod || (azEvent.req && azEvent.req.method),
      url: buildFullUrl(event, queryStrings),
      headers: event.headers || (azEvent.req && azEvent.req.headers),
      payload: event.body || (azEvent.req && azEvent.req.body),
    }

    return setupServer({
      server,
      onInitError,
      serverOptions,
      userOptions,
    })
  }
}
