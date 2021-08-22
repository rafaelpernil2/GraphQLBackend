
import { Resolvers, ResultDbObject } from "allotr-graphql-schema-types";
import { MongoDBSingleton } from "../../utils/mongodb-singleton";
export const UserResolvers: Resolvers = {
    Query: {
        results: async () => {
            const db = await MongoDBSingleton.getInstance().db;
            // Find all results
            const dbOutput = await db.collection<ResultDbObject>('results').find()

            if (dbOutput == null) {
                return [];
            }

            return dbOutput.toArray() || [];
        }
    }
}