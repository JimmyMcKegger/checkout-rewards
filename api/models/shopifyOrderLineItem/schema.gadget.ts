import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "shopifyOrderLineItem" model, go to https://checkout-rewards-app.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "DataModel-Shopify-OrderLineItem",
  fields: {
    fulfillmentService: {
      type: "string",
      storageKey:
        "ModelField-DataModel-Shopify-OrderLineItem-fulfillment_service::FieldStorageEpoch-DataModel-Shopify-OrderLineItem-fulfillment_service-initial",
    },
    fulfillmentStatus: {
      type: "string",
      storageKey:
        "ModelField-DataModel-Shopify-OrderLineItem-fulfillment_status::FieldStorageEpoch-DataModel-Shopify-OrderLineItem-fulfillment_status-initial",
    },
  },
  shopify: {
    fields: [
      "attributedStaffs",
      "currentQuantity",
      "discountAllocations",
      "fulfillableQuantity",
      "giftCard",
      "grams",
      "name",
      "order",
      "price",
      "priceSet",
      "product",
      "productExists",
      "properties",
      "quantity",
      "requiresShipping",
      "shop",
      "sku",
      "taxLines",
      "taxable",
      "title",
      "totalDiscount",
      "totalDiscountSet",
      "variant",
      "variantInventoryManagement",
      "variantTitle",
      "vendor",
    ],
  },
};
