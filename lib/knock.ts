import { Knock } from "@knocklabs/node";

export const knock = new Knock(process.env.KNOCK_SECRET_KEY);
