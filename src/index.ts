import {APIGatewayEvent, Callback, Context} from 'aws-lambda'
import {InjectedResponseObject, Server} from 'hapi'

export type UserOptions = {
  readonly filterHeaders?: boolean
  readonly stringifyBody?: boolean
}

export type OnInitError = (error: Error) => void

type QueryStrings = {readonly [name: string]: string}

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
  callback,
  onInitError,
  userOptions,
  serverOptions,
}: {
  readonly server: Server
  readonly callback: Callback
  readonly onInitError: OnInitError
  readonly userOptions: UserOptions
  readonly serverOptions: any
}): void {
  server.initialize(
    error =>
      error
        ? onInitError(error)
        : server.inject(
            serverOptions,
            (hapiResponse: InjectedResponseObject) => {
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

                return userOptions.filterHeaders
                  ? headers
                  : hapiResponse.headers
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

              const response = !callback ? {res: data} : data

              callback(null, response)
            }
          )
  )
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
): (event: APIGatewayEvent, context: Context, callback: Callback) => void {
  return (event: APIGatewayEvent, _context: Context, callback: Callback) => {
    const azEvent = event as any

    const queryStrings = event.queryStringParameters

    const serverOptions = {
      method: event.httpMethod || (azEvent.req && azEvent.req.method),
      url: buildFullUrl(event, queryStrings),
      headers: event.headers || (azEvent.req && azEvent.req.headers),
      payload: event.body || (azEvent.req && azEvent.req.body),
    }

    setupServer({server, callback, onInitError, serverOptions, userOptions})
  }
}
