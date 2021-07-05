import { IResolvers } from "graphql-tools";
import { AuthenticateResponse, MutationRegisterArgs, QueryLoginArgs } from "graphql-root/generated";
import { PubSubSingleton } from "../PubSubSingleton";
export const UserResolvers: IResolvers = {
    Query: {
        async login(_: void, args: QueryLoginArgs, { pubsub }): Promise<AuthenticateResponse> {
            return { token: "Ok" }
        }
    },
    Mutation: {
        async register(_: void, args: MutationRegisterArgs): Promise<AuthenticateResponse> {
            return { token: "Registered :D" }
        }
    },
    Subscription: {
        newUpdate: {
            subscribe: () => PubSubSingleton.getInstance().asyncIterator("TEST")
        }
    }
}