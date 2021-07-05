import 'graphql-import-node';
import * as userTypeDefs from "./schemas/user.graphql"
import * as emptyTypeDefs from "./schemas/empty.graphql"
import { makeExecutableSchema } from "@graphql-tools/schema";
import { DIRECTIVES } from '@graphql-codegen/typescript-mongodb';
import resolvers from "./resolver/resolversMap";
import { GraphQLSchema } from "graphql";

const schema: GraphQLSchema = makeExecutableSchema({
    typeDefs: [DIRECTIVES, emptyTypeDefs, userTypeDefs],
    resolvers
});

export default schema;