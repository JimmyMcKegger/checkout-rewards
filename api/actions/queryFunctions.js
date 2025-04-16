/** @type { ActionRun } */
export const run = async ({ params, logger, api, connections }) => {
  try {
    // Get the shop ID
    const shopId = params.shopId || connections.shopify.currentShop?.id?.toString();

    if (!shopId) {
      logger.error("No shop ID");
      throw new Error("shopId is required");
    }

    // Shopify client
    const shopify = await connections.shopify.forShopId(shopId);

    // GraphQL query
    const result = await shopify.graphql(`
      query {
        shopifyFunctions(first: 25) {
          nodes {
            app {
              title
            }
            apiType
            title
            id
          }
        }
      }
    `);

    logger.info("Shopify Functions query");
    logger.info(JSON.stringify(result, null, 2));

    return result;
  } catch (error) {
    logger.error("Error in queryFunctions action", {
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
};

/**
 * Define the parameters this action accepts
 * @type {{ shopId: { type: string } }}
 */
export const params = {
  shopId: { type: "string" }
};
