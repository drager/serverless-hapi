# serverless-hapi simple example

Example showing a simple example of using serverless-hapi.

## Run
The example can be run for both **AWS** and **Azure**.

### AWS
1. Run `yarn install` to install dependencies.
2. Run `yarn start:aws` to run the local development server.
3. Navigate to [http://localhost:3000/hello](http://localhost:3000/hello).

### Azure
1. Run `yarn install` to install dependencies.
2. Run `yarn start:azure` to run the local development server.
3. Navigate to [http://localhost:3000/hello](http://localhost:3000/hello).

### Google Cloud Platform
If you want to try out the example with GCP, then you need to comment out some code
in the [handler.ts](https://github.com/drager/serverless-hapi/blob/2.0.x/example/bell/handler.ts).
file, see the comments in there. After that, proceed with the steps below.

1. Run `yarn install` to install dependencies.
2. Run `./node_modules/.bin/functions start` to run the local development server. 
3. Run `yarn start:gcp` to build and deploy the function locally.
4. Navigate to [http://localhost:8010/1/us-central1/bell](http://localhost:8010/1/us-central1/bell).
