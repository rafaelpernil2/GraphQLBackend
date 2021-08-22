import express from "express";
import https from "https";
import fs from "fs";
import { graphqlHTTP } from "express-graphql";
import * as core from 'express-serve-static-core';
import { execute, subscribe } from 'graphql';
import schema from "./graphql/schemasMap";
import { EnvLoader } from "./utils/env-loader";
import { MongoDBSingleton } from "./utils/mongodb-singleton";


require('dotenv').config();

const { IS_HTTPS, HTTPS_PORT } = EnvLoader.getInstance().loadedVariables;

MongoDBSingleton.getInstance()


// EXPRESS and GraphQL HTTP initialization

const expressServer = express();
expressServer.use(graphqlHTTP({ schema, graphiql: true }));


const wssPath = '/subscriptions'

// HTTPS / WSS
let httpServer: core.Express | https.Server = expressServer;
// if (IS_HTTPS) {
//     const privateKey = fs.readFileSync(SSL_KEY_FILE);
//     const certificate = fs.readFileSync(SSL_CRT_FILE);
//     const credentials = { key: privateKey, cert: certificate };
//     httpServer = https.createServer(credentials, expressServer)
// }

const server = httpServer.listen(HTTPS_PORT, () => {
    console.log(`GraphQL server running using ${Boolean(IS_HTTPS) ? "HTTPS" : "HTTP"} on port ${HTTPS_PORT}`);
});

