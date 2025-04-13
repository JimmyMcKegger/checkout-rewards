/** @type { ActionRun } */
export const run = async ({ params, logger, api, connections }) => {
	logger.info("Creating customer points metafield definition in Shopify");

	try {
		// Get the current shop ID from the Shopify connection
		const shopId = connections.shopify.currentShop?.id?.toString();

		if (!shopId) {
			logger.error("No shop ID available in current context");
			throw new Error("No shop ID available");
		}

		// https://shopify.dev/docs/api/admin-graphql/2025-01/mutations/metafieldDefinitionCreate?language=remix
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
        pin: true
			},
		};

		const result = await api.enqueue(api.writeToShopify, {
			shopId,
			mutation,
			variables,
		});

		logger.info("Customer points metafield definition created!", {
			result,
		});
    // save the metafield definition to the database

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
