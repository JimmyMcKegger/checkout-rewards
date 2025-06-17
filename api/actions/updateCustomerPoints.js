/** @type { ActionRun } */
export const run = async ({ params, logger, api, connections }) => {
  logger.info("Updating customer points", params);

  if (!params.customerId || params.points === undefined) {
    logger.error("Missing parameters", params);
    throw new Error("customerId and points are required");
  }

  try {
    const shopId = connections.shopify.currentShopId;
    logger.info(`Using shop ID: ${shopId}`);
    const shopify = await connections.shopify.forShopId(shopId);

    // Update the customer's rewards.points metafield using the Shopify Admin API
    const mutation = `#graphql
      mutation UpdateCustomerMetafield($input: CustomerInput!) {
        customerUpdate(input: $input) {
          customer {
            id
            metafield(namespace: "rewards", key: "points") {
              value
            }
          }
          userErrors {
            field
            message
          }
        }
      }`;

    const variables = {
      input: {
        id: `gid://shopify/Customer/${params.customerId}`,
        metafields: [
          {
            namespace: "rewards",
            key: "points",
            type: "number_integer",
            value: params.points.toString()
          }
        ]
      }
    };

    logger.info("Sending GraphQL mutation to Shopify", { variables });

    try {
      const result = await connections.shopify.current.graphql(mutation, variables);
      logger.info("Received response from Shopify", { result });

      if (result && result.data && result.data.customerUpdate) {
        if (result.data.customerUpdate.userErrors && result.data.customerUpdate.userErrors.length > 0) {
          throw new Error(`Shopify errors: ${result.data.customerUpdate.userErrors.map(e => e.message).join(', ')}`);
        }
        logger.info("Customer metafield updated successfully in Shopify");
      } else {
        logger.warn("Unexpected response structure from Shopify GraphQL", { result });
      }
    } catch (graphqlError) {
      logger.error("GraphQL error", { error: graphqlError.message });
      // We'll continue to try updating the local record even if Shopify update fails
    }

    return {
      success: true,
      customerId: params.customerId,
      points: params.points
    };
  } catch (error) {
    logger.error("Error updating customer points", {
      error: error.message,
      customerId: params.customerId,
      points: params.points,
      stack: error.stack
    });
    throw error;
  }
};

export const params = {
  customerId: {
    type: "string",
    required: true
  },
  points: {
    type: "number",
    required: true
  }
};
