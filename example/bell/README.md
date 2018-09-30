# serverless-hapi bell example

Example showing how to use hapi and bell with serverless-hapi.

## Run
The example can be run for both **AWS** and **Azure**.

### AWS
1. Run `yarn install` to install dependencies.
2. Run `yarn start:aws` to run the local development server.
3. Navigate to [http://localhost:3000/bell](http://localhost:3000/bell).

### Azure
1. Run `yarn install` to install dependencies.
2. Run `yarn start:azure` to run the local development server.
3. Navigate to [http://localhost:3000/bell](http://localhost:3000/bell).

### Google Cloud Platform
If you want to try out the example with GCP, then you need to comment out some code
in [handler.ts](https://github.com/drager/serverless-hapi/blob/2.0.x/example/bell/handler.ts).
See the comments in the file for more information. After that, proceed with the steps below.

1. Run `yarn install` to install dependencies.
2. Run `./node_modules/.bin/functions start` to run the local development server. 
3. Run `yarn start:gcp` to build and deploy the function locally.
4. Navigate to [http://localhost:8010/1/us-central1/bell](http://localhost:8010/1/us-central1/bell).
