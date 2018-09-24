# serverless-hapi

Use hapi with the [serverless framework](https://github.com/serverless/serverless).

Works with Amazon Lambda and Azure Functions.

## Usage

A simple usage example:

```typescript
import * as hapi from 'hapi'
import {serverlessHapi} from 'serverless-hapi'

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

export const hello = serverlessHapi(app())
```

For more examples, check out the [example folder](https://github.com/drager/serverless-hapi/tree/master/example).

## Features and bugs

Please file feature requests and bugs at the [issue tracker][tracker].

[tracker]: https://github.com/drager/serverless-hapi/issues
