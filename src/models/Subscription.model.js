import {Schema,model} from "mongoose";

const subscriptionSchema = new Schema(
    {
        subscriber: {
            type: Schema.Types.ObjectId, // who is subscribing
            ref: "User"
        },
        channel: {
            type: Schema.Types.ObjectId, // which user chanel subscribe
            ref: "User"
        }

    },
    {timestamps: true}
);

export const Subscription = model("Subscription",subscriptionSchema);