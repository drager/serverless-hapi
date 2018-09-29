# serverless-hapi

Use hapi with the [serverless framework](https://github.com/serverless/serverless).

Works with Amazon Lambda and Azure Functions.

## Usage

A simple usage example:

```typescript
import {APIGatewayEvent, Callback, Context} from 'aws-lambda'
import * as hapi from 'hapi'
import {serverlessHapi, ResponseData} from 'serverless-hapi'

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
) => Promise<ResponseData | void> = serverlessHapi(app(), onInitError)
```

For more examples, check out the [example folder](https://github.com/drager/serverless-hapi/tree/master/example).

## Features and bugs

Please file feature requests and bugs at the [issue tracker][tracker].

[tracker]: https://github.com/drager/serverless-hapi/issues
