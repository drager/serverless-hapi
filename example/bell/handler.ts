import {APIGatewayEvent, Context} from 'aws-lambda'
import * as Bell from 'bell'
import * as hapi from 'hapi'
import {serverlessHapi} from '../../src/index'

const app = () => {
  const server = new hapi.Server()
  server.connection()

  server.register(Bell, error => {
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
      location: server.info.uri,
    })

    server.route({
      method: ['GET', 'POST'],
      path: '/bell',
      config: {
        auth: {
          strategy: 'facebook',
          mode: 'try',
        },
        handler: (request, reply) => {
          if (!request.auth.isAuthenticated) {
            return reply({
              error:
                'Authentication failed due to: ' + request.auth.error.message,
            })
          }
          return reply(request.auth.credentials)
        },
      },
    })
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
  callback: (error?: Error | null | undefined, result?: any) => void
) => void = serverlessHapi(app(), onInitError)
