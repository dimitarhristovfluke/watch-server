## How to start apps:

For bot:

> node dist/bot/server.js

For client:

> npm run start

For server:

> npm run server-dev

Summary :
Add Typescript and reload server after code changes
Create sample Express server
Add TSLint
Add Prettier
Airbnb code styling
Husky to prevent unformatted code commits

### Step 1. Add TypeScript

$ npm init
$ npm i -D typescript ts-node-dev

### Generate tsconfig.json configuration file:

$ $(npm bin)/tsc --init

### Update tsconfig.json, “outDir” is where our build goes.

...
// "outFile": "./",
"outDir": "./build" /_ Redirect output structure to the directory _/,
// "rootDir": "./",
...

### Update package.json, add a dev, build and start script:

"scripts": {
"build": "tsc",
"start": "NODE_ENV=production node ./build/index.js",
"dev": "ts-node-dev --respawn --transpileOnly ./src/index.ts",
...
},

### Step 2. Create sample Express App

$ npm i -S express
$ npm i -D @types/express

### Test web server

# Development Mode hot reload

\$ npm run dev

# Build

\$ npm run build

# Prodution: Build + Start server

\$ npm start

### Step 3. Add TSLint

TSLint checks TypeScript code for readability, maintainability, and functionality errors.
Install the plugin: “TSLint” by Microsoft.

\$ npm i -D tslint

### 4.2 Add Prettier

### Creating the React Frontend

create-react-app client

### 4.3 Install CORS

npm i cors --save

### 4.4 Install Body-Parser

npm i body-parser --save

### 4.5 Install Morgan

Morgan is basically a logger, on any requests being made, it generates logs automatically.

npm i morgan --save

### 4.6 Install Types for Morgan (for TypeScript)

npm install @types/morgan

### 4.7 Install Types for Cors (for Typescript)

npm install @types/cors
