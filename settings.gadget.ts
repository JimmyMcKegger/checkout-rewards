import type { GadgetSettings } from "gadget-server";

export const settings: GadgetSettings = {
  type: "gadget/settings/v1",
  frameworkVersion: "v1.3.0",
  plugins: {
    connections: {
      shopify: {
        apiVersion: "2025-01",
        enabledModels: [
          "shopifyBillingAddress",
          "shopifyCart",
          "shopifyCartLineItem",
          "shopifyCheckout",
          "shopifyCheckoutAppliedGiftCard",
          "shopifyCheckoutLineItem",
          "shopifyCheckoutShippingRate",
          "shopifyCustomer",
          "shopifyOrder",
          "shopifyOrderLineItem",
          "shopifyShippingAddress",
        ],
        type: "partner",
        scopes: [
          "read_customers",
          "read_orders",
          "read_products",
          "read_metaobject_definitions",
          "read_payment_customizations",
          "unauthenticated_read_checkouts",
          "unauthenticated_read_customer_tags",
          "unauthenticated_read_customers",
          "unauthenticated_read_metaobjects",
          "unauthenticated_read_product_inventory",
          "unauthenticated_read_product_tags",
        ],
      },
    },
  },
};
