/** @type { ActionRun } */
export const run = async ({ params, logger, api, connections }) => {
	const { namespace, key, ownerType } = params;

	const shopId = connections.shopify.currentShopId;
	logger.info(`shopId: ${shopId}`);

	logger.info(`query metafield ${namespace} : ${key}, on ${ownerType}`);

	// query to fetch metafield definitions
	const query = `
      query getMetafieldDefinitions($ownerType: MetafieldOwnerType!, $namespace: String, $key: String) {
    metafieldDefinitions(
      ownerType: $ownerType
      namespace: $namespace
      key: $key
      first: 1
    ) {
      edges {
        node {
          id
          name
          namespace
          key
          description
          ownerType
          type {
            name
          }
          validations {
            name
            value
          }
        }
      }
    }
  }
  `;

	const variables = {
		namespace,
		key,
		ownerType,
	};

	// logger.info(`variables: ${JSON.stringify(variables)}`);

	try {
		// get shopify shop
		const shopify = await connections.shopify.forShopId(shopId);

		const response = await shopify.graphql(query, variables);

		if (response?.metafieldDefinitions?.edges?.length > 0) {
			// Return the metafield definitions
			return response.metafieldDefinitions.edges.map((edge) => edge.node);
		}

		return undefined;
	} catch (error) {
		logger.error("Error looking for metafield definitions", {
			error: error.message,
			namespace,
			key,
			ownerType,
		});
		throw error;
	}
};

/** @type { import("gadget-server").ActionOptions } */
export const options = {
	returnType: true,
};

export const params = {
	namespace: { type: "string" },
	key: { type: "string" },
	ownerType: { type: "string" },
};
