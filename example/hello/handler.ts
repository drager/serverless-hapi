import {APIGatewayEvent, Callback, Context} from 'aws-lambda'
import * as hapi from 'hapi'
import {serverlessHapi, ResponseData} from '../../src/index'

const app = () => {
  const server = new hapi.Server()

  server.route({
    method: 'GET',
    path: '/hello',
    handler: _request => ({message: 'Hello from hapi!'}),
  })

  return server
}

const onInitError = (error: Error) => {
  console.error(error)
  throw error
}

export const hello: (
  event: APIGatewayEvent,
  context: Context,
  callback: Callback
) => Promise<ResponseData | Error> = serverlessHapi(app(), onInitError)
