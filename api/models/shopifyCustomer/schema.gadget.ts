import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "shopifyCustomer" model, go to https://checkout-rewards-app.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "DataModel-Shopify-Customer",
  fields: {
    points: {
      type: "number",
      shopifyMetafield: {
        privateMetafield: false,
        namespace: "rewards",
        key: "points",
        metafieldType: "number_integer",
        allowMultipleEntries: false,
      },
      default: 0,
      validations: { numberRange: { min: 0, max: null } },
      storageKey: "HZn8SV0SSeU8",
    },
  },
  shopify: {
    fields: [
      "acceptsMarketing",
      "acceptsMarketingUpdatedAt",
      "checkouts",
      "currency",
      "dataSaleOptOut",
      "email",
      "emailMarketingConsent",
      "firstName",
      "lastName",
      "lastOrder",
      "lastOrderName",
      "locale",
      "marketingOptInLevel",
      "multipassIdentifier",
      "note",
      "orders",
      "phone",
      "shop",
      "shopifyCreatedAt",
      "shopifyState",
      "shopifyUpdatedAt",
      "smsMarketingConsent",
      "statistics",
      "tags",
      "taxExempt",
      "taxExemptions",
      "verifiedEmail",
    ],
  },
};
