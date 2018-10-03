import {APIGatewayEvent, Callback, Context} from 'aws-lambda'
import * as Bell from 'bell'
import * as hapi from 'hapi'
import {serverlessHapi, ResponseData} from '../../src/index'

const app = async (): Promise<hapi.Server> => {
  const server = new hapi.Server()

  await server.register(Bell)

  server.auth.strategy('facebook', 'bell', {
    provider: 'facebook',
    password: 'cookie_encryption_password_secure',
    isSecure: false,
    // You'll need to go to https://developers.facebook.com/ and set up a
    // Website application to get started
    // Once you create your app, fill out Settings and set the App Domains
    // Under Settings >> Advanced, set the Valid OAuth redirect URIs to include http://<yourdomain.com>/bell/door
    // and enable Client OAuth Login
    clientId: 'test',
    clientSecret: 'test',
  })

  server.route({
    method: ['GET', 'POST'],
    path: '/bell',
    options: {
      auth: {
        strategy: 'facebook',
        mode: 'try',
      },
      handler: (request: any) =>
        !request.auth.isAuthenticated
          ? {
              error:
                'Authentication failed due to: ' + request.auth.error.message,
            }
          : request.auth.credentials,
    },
  })
  return server
}

const onInitError = (error: Error) => {
  console.error(error)
  throw error
}

export const bell: (
  event: APIGatewayEvent,
  context: Context,
  callback: Callback
) => Promise<ResponseData> = async (event, context, _callback) => {
  try {
    const server = await app()

    return serverlessHapi(server, onInitError)(event, context)
  } catch (error) {
    console.error(error)
    return error
  }
}
