# Concept
Promise to be a, dynamic and interoperable model, modelling tool with abstraction concept mapping over ontological knowledge graph, allowing integration of data sources and top, middle, low and application level ontologies.

*On this project we had the **backend** code.*

It's a [Node.js](https://nodejs.org) project that serves the [concept-client](https://github.com/giuliano-marinelli/concept-client) via [Express.js](https://expressjs.com) and connect to a [MongoDB](https://www.mongodb.com/) database.

## Setup
1. Install [Node.js](https://nodejs.org) and [MongoDB](https://www.mongodb.com)
2. From project root folder install all the dependencies: `npm install`
3. For serve [concept-client](https://github.com/giuliano-marinelli/concept-client), it must be located at sibling folder of this project, as shown:
```
concept
└─ concept-client
└─ concept-server
   └─ uploads (this is where server saves users uploaded files)
```

## Run
### Development
Run `npm run watch`: executes [concurrently](https://www.npmjs.com/package/concurrently) MongoDB instance ([mongod](https://www.mongodb.com/docs/manual/reference/program/mongod/)), Typescript compilation with Watch mode ([tsc](https://www.typescriptlang.org/docs/handbook/compiler-options.html) -w) that generates **dist** folder at the project root folder, and Node monitoring ([nodemon](https://www.npmjs.com/package/nodemon)) for execute server and restart it on changes. Then server be listening at [localhost:3000](http://localhost:3000). Any change automatically compiles Typescript and restart server.

### Production
Run `npm run build`: executes Typescript compilation ([tsc](https://www.typescriptlang.org/docs/handbook/compiler-options.html)) that generates **dist** folder at the project root folder. Then it can be executed using `npm start` that do `node` command to start listening at [localhost:3000](http://localhost:3000).
