import { Client } from "@gadget-client/checkout-rewards-app";

export const api = new Client({
  environment: "Development",
  apiKey: process.env.GADGET_API_KEY,
});
