/** @type { ActionRun } */
export const run = async ({ params, logger, api, connections }) => {
	logger.info("Creating customer points metafield definition in Shopify");

	try {
		const shopId = connections.shopify.currentShopId;
		logger.info(`shopId: ${shopId}`);

		// https://shopify.dev/docs/api/admin-graphql/2025-04/mutations/metafieldDefinitionCreate?language=remix
		// CreateMetafieldDefinition mutation
		const mutation = `#graphql
    mutation CreateMetafieldDefinition($definition: MetafieldDefinitionInput!) {
      metafieldDefinitionCreate(definition: $definition) {
        createdDefinition {
          id
          namespace
          key
        }
        userErrors {
          field
          message
          code
        }
      }
    }`;

		const variables = {
			definition: {
				name: "Points",
				namespace: "rewards",
				key: "points",
				description: "Customer reward points",
				type: "number_integer",
				ownerType: "CUSTOMER",
				pin: true,
			},
		};

		const result = await shopify.graphql(mutation, variables);

		logger.info("CreateMetafieldDefinition result", {
			result,
		});

		return result;
	} catch (error) {
		logger.error("Error creating rewards points metafield definition", {
			error: error.message,
			stack: error.stack,
		});
		throw error;
	}
};

/**
 * @typedef {Object} MetafieldDefinitionResult
 * @property {boolean} success
 * @property {Array} errors
 * @property {Object|null} result
 */

/**
 * Result of writeToShopify action.
 * @returns {Promise<MetafieldDefinitionResult>}
 */
