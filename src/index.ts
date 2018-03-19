import {APIGatewayEvent, Callback, Context} from 'aws-lambda'
import {InjectedResponseObject, Server} from 'hapi'

export function serverlessHapi(
  server: Server,
): (event: APIGatewayEvent, context: Context, callback: Callback) => void {
  return (event: APIGatewayEvent, _context: Context, callback: Callback) => {
    const azEvent = event as any
    const options = {
      method: event.httpMethod || (azEvent.req && azEvent.req.method),
      url:
        event.path ||
        (azEvent.req && (azEvent.req.url || azEvent.req.originalUrl)),
      headers: event.headers || (azEvent.req && azEvent.req.headers),
    }
    server.inject(options, (hapiResponse: InjectedResponseObject) => {
      const doneCallback = callback || azEvent.done

      const statusCode = hapiResponse.statusCode
      const body = hapiResponse.result
      const data = {statusCode, body}
      const response = !callback ? {res: data} : data

      doneCallback(null, response)
    })
  }
}
