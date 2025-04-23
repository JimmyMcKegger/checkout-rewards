/** @type { ActionRun } */
export const run = async ({ params, logger, api, connections }) => {
  try {
    logger.info("queryFunctions action started");
    const shopId = params.shopId || connections.shopify.currentShop?.id?.toString();

    if (!shopId) {
      logger.error("No shop ID available");
      throw new Error("shopId is required");
    }

    logger.info(`Using shop ID: ${shopId}`);

    const shopify = await connections.shopify.forShopId(shopId);
    logger.info("Shopify connection established successfully");

    // query functions
    let functionId;
    try {
      logger.info("Shopify Functions...");
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

      const shopifyFunctionsData = result.shopifyFunctions;

      if (!shopifyFunctionsData) {
        throw new Error("shopifyFunctions not found in response");
      }

      // Find the discount function
      const discountFunction = shopifyFunctionsData.nodes.find(
        node => node.apiType === "discount"
      );

      if (!discountFunction) {
        // List what functions we did find to help debug
        logger.error("Available functions:",
          shopifyFunctionsData.nodes.map(node => ({title: node.title, apiType: node.apiType})));
        throw new Error("No discount function found");
      }

      functionId = discountFunction.id;

      if (!functionId) {
        throw new Error("Function ID is missing");
      }

      logger.info(`Found discount function ID: ${functionId}`);

      return functionId;


    } catch (queryError) {
      logger.error("Error finding discount function:", queryError);
      throw queryError;
    }
  } catch (error) {
    logger.error("Error in queryFunctions action:", error);
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
