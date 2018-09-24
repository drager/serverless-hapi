import {APIGatewayEvent, Context} from 'aws-lambda'
import * as hapi from 'hapi'
import {serverlessHapi} from '../../src/index'

const app = () => {
  const server = new hapi.Server()
  server.connection()

  server.route({
    method: 'GET',
    path: '/hello',
    handler: (_request, reply) => reply({message: 'Hello from hapi!'}),
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
  callback: (error?: Error | null | undefined, result?: any) => void
) => void = serverlessHapi(app(), onInitError)
