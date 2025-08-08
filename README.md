# Concept

_On this project we had the **backend** code._

It's a [Nest](https://nestjs.com/) project that serves the [concept-client](https://github.com/giuliano-marinelli/concept-client) via [Express](https://expressjs.com). It uses [GraphQL]() for query the application endpoints, [JWT](https://jwt.io/) for authentication via token, with [device-detector-js](https://github.com/etienne-martin/device-detector-js) for secure sessions, [CASL](https://casl.js.org/) for authorization management, [TypeORM](https://typeorm.io/) for database schema and queries, and [class-validator](https://github.com/typestack/class-validator) for specific attributes validations. By default it's connected to a [PostgreSQL](https://www.postgresql.org/) datasource, but it can be used with most databases (including [MySQL](https://www.mysql.com/), [MongoDB](https://www.mongodb.com/), [SQLServer](https://www.microsoft.com/es-es/sql-server), [MariaDB](https://mariadb.org/), etc).

## Setup

1. Install [Node.js](https://nodejs.org)
2. Install [pnpm](https://pnpm.io): `npm install -g pnpm@latest`
3. Install the DBMS you want, by default install [PostgreSQL](https://www.postgresql.org/)
4. From project root folder install all the dependencies: `pnpm install`
5. For serve [concept-client](https://github.com/giuliano-marinelli/concept-client), it must be located at sibling folder of this project, as shown:

```
concept
└─ concept-client
└─ concept-server
   └─ uploads (this is where server saves users uploaded files)
```

## Run

### Development

Run `pnpm start`: execute [nest start](https://docs.nestjs.com/cli/usages#nest-start) that compiles and runs the server and put it listening at [localhost:4000](http://localhost:4000)

Run `pnpm watch`: execute [nest start --watch](https://docs.nestjs.com/cli/usages#nest-start) that compiles and runs the server and put it listening at [localhost:4000](http://localhost:4000) and any change automatically re-compiles and restart server.

### Development of [@dynamic-glsp](https://www.npmjs.com/settings/dynamic-glsp/packages) all-in-one

For develop [concept-server](https://github.com/giuliano-marinelli/concept-server) along with their main packages [@dynamic-glsp/server](https://www.npmjs.com/package/@dynamic-glsp/server) and [@dynamic-glsp/protocol](https://www.npmjs.com/package/@dynamic-glsp/protocol). It packages must be located along side concept project, as shown:

```
concept
└─ concept-client
└─ concept-server

@dynamic-glsp
└─ client
└─ server
└─ protocol
```

If packages are not available locally it will use the registry uploaded ones.
Only if the packages are available locally you can use the next command:

Run `pnpm watch:all`: execute `concurrently` watch mode over [concept-server](https://github.com/giuliano-marinelli/concept-server), [@dynamic-glsp/server](https://www.npmjs.com/package/@dynamic-glsp/server) and [@dynamic-glsp/protocol](https://www.npmjs.com/package/@dynamic-glsp/protocol). Any changes on sub-packages re-compiles them and re-install them on server, and re-compile and restart server.

### Production

Run `pnpm build`: execute [nest build](https://docs.nestjs.com/cli/usages#nest-build) that generates **dist** folder at the project root folder for been used with node command.

Run `pnpm prod`: execute `node` command over **dist/main** folder to start server listening at [localhost:4000](http://localhost:4000).
