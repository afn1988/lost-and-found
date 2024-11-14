# NodeJS Skeleton for Airport AI

This repository includes a NodeJS / Express / MongoDB skeleton app.

## Setup

### Requirements
Make sure you have MongoDB installed and running on your computer as well as NodeJS/NPM installed.

### Steps
On the root of this app, run the following command to install dependencies:
```
npm install
```

On the root of this app, run the following command to run the application:
```
npm start
```

If everything is ok, you should see a 'Hello world!' message when you go to 'http://localhost:3000' on your browser.

-----
# Notes on Project

The project uses:
- TypeScript support
- Express.js framework
- MongoDB with Mongoose ODM
- JWT Authentication
- OpenAI integration
- Swagger API documentation
- Pino logging
- Input validation with Zod
- Security middlewares with Helmet
- Testing setup with Mocha and Chai
- ESLint for code quality
- Hot reloading for development

----
### Setup 
1. Clone the repository
2. npm install
3. Create environment files:
Create env/.env.development and env/.env.test files following .env.example example

### Scripts Quick Reference

- `npm start` → Runs compiled app in production from dist/app.js
- `npm run dev` → Runs development server with hot reload using ts-node-dev
- `npm run build` → Compiles TypeScript to JavaScript using tsc
- `npm test` → Runs Mocha tests with TypeScript support (for Unix/Mac)
- `npm run test-win` → Runs tests on Windows systems with debugging enabled 
- `npm run lint` → Checks code quality with ESLint
- `npm run lint:fix` → Automatically fixes ESLint issues in .ts files
