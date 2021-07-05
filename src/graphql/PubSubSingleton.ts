import { PubSub } from "graphql-subscriptions";

export class PubSubSingleton {
    private static pubSub: PubSub;
    public static getInstance() {
        if (PubSubSingleton.pubSub == null) {
            PubSubSingleton.pubSub = new PubSub();
        }
        return PubSubSingleton.pubSub;
    }
}