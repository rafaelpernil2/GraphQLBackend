import express from "express";
import https from "https";
import fs from "fs";
import { graphqlHTTP } from "express-graphql";
import * as core from 'express-serve-static-core';
import ws, { AddressInfo } from "ws";
import { useServer } from "graphql-ws/lib/use/ws"
import { execute, subscribe } from 'graphql';
import cors from "cors";
import mongoose from "mongoose"
import schema from "./graphql/schemasMap";
import { PubSubSingleton } from "./graphql/PubSubSingleton";
import { ResultModel, ResultMongoose } from "./graphql/generated"
import { EnvLoader } from "./utils/env-loader";
require('dotenv').config();

const {
    MONGO_DB_ENDPOINT,
    IS_HTTPS,
    SSL_CRT_FILE,
    SSL_KEY_FILE,
    HTTPS_PORT
} = EnvLoader.getInstance().loadedVariables;

// MONGODB Connection
mongoose.connect(MONGO_DB_ENDPOINT, { useNewUrlParser: true, useUnifiedTopology: true });
!mongoose.connection ? console.log("Error connecting to MongoDB") : console.log("MongoDB connected successfully");

// EXPRESS and GraphQL HTTP initialization

const expressServer = express();
expressServer.use(cors());
expressServer.use(graphqlHTTP({ schema, graphiql: true }));


const wssPath = '/subscriptions'

// HTTPS / WSS
let httpServer: core.Express | https.Server = expressServer;
if (IS_HTTPS) {
    const privateKey = fs.readFileSync(SSL_KEY_FILE);
    const certificate = fs.readFileSync(SSL_CRT_FILE);
    const credentials = { key: privateKey, cert: certificate };
    httpServer = https.createServer(credentials, expressServer)
}

const server = httpServer.listen(HTTPS_PORT, () => {
    console.log(`GraphQL server running using ${Boolean(IS_HTTPS) ? "HTTPS" : "HTTP"} on port ${HTTPS_PORT}`);

    const wsServer = new ws.Server({ server, path: wssPath });
    useServer({ schema, execute, subscribe }, wsServer);
    console.log(`WebSockets server running ${Boolean(IS_HTTPS) ? "using SSL" : "without SSL"} on port ${HTTPS_PORT} at ${wssPath}`);
});


// CODE FOR BASIC TESTING OF THE ARCHITECTURE

const getResult = async (id: number): Promise<ResultMongoose | null> => ResultModel.findOne({ id }).exec();
const getIdList = async (): Promise<number[]> => (await ResultModel.find({}).exec()).map(result => result.id).filter(value => value != null);
let idListPromise = getIdList();
let index = 0;

setInterval(async () => {
    const idList = await idListPromise;
    try {
        const id = idList[index];
        // I know this is useless, it's just to prove that it works
        const dbResponse = await getResult(id);
        if (!dbResponse) {
            throw new Error("There's no valid value!");
        }
        PubSubSingleton.getInstance().publish("TEST", { newUpdate: { result: dbResponse.result } })
        index = (index + 1) % (idList.length);
    } catch (error) {
        index = 0;
    }
}, 1000)