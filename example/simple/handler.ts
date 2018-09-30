import {APIGatewayEvent, Context} from 'aws-lambda'
import * as hapi from 'hapi'
import {serverlessHapi} from '../../src/index'

const app = () => {
  const server = new hapi.Server()
  server.connection()

  server.route({
    method: 'GET',
    // Uncomment this line if you want to try it with Google Cloud Platform.
    // and comment out the other path below.
    //path: '/',
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
) => void = serverlessHapi(
  app(),
  onInitError
  // Uncomment the lines below if you want to try it with Google Cloud Platform.
  //{
  //filterHeaders: true,
  //stringifyBody: false,
  //}
)
