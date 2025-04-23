/** @type { ActionRun } */
export const run = async ({ params, logger, api, connections }) => {
	try {
		const { shopId, functionId } = params;

		if (!shopId) {
			logger.error("Missing required parameter: shopId");
			throw new Error("shopId is required");
		}

		if (!functionId) {
			logger.error("Missing required parameter: functionId");
			throw new Error("functionId is required");
		}

		logger.info(
			`Creating discount using shopId: ${shopId} and functionId: ${functionId}`
		);

		const shopify = await connections.shopify.forShopId(shopId);

		logger.info("GOT A SHOPIFY CONNECTION");

		// create automatic discount
		let mutationResult;

		try {
			logger.info("CREATING DISCOUNT");

			// discountAutomaticAppCreate mutation
			// https://shopify.dev/docs/api/admin-graphql/latest/mutations/discountAutomaticAppCreate?example=create-an-automatic-product-discount-thats-managed-by-an-app&language=graphql
			const mutation = `#graphql
        mutation discountAutomaticAppCreate($id: String!, $startsAt: DateTime!) {
          discountAutomaticAppCreate(
            automaticAppDiscount: {
              title: "Checkout Rewards Discount"
              functionId: $id
              startsAt: $startsAt
            }
          ) {
            automaticAppDiscount {
              discountId
              title
              startsAt
              endsAt
              status
              appDiscountType {
                appKey
                functionId
              }
              combinesWith {
                orderDiscounts
                productDiscounts
                shippingDiscounts
              }
            }
            userErrors {
              field
              message
            }
          }
        }`;

			const variables = {
				id: functionId,
				startsAt: new Date().toISOString(),
			};

			// Create the discount
			logger.info("Creating discount with function ID:", functionId);
			mutationResult = await shopify.graphql(mutation, variables);
			logger.info("Discount creation mutation completed");

			// Check for user errors in the mutation response
			if (mutationResult.discountAutomaticAppCreate?.userErrors?.length > 0) {
				const errors = mutationResult.discountAutomaticAppCreate.userErrors;
				logger.error("Discount creation returned user errors:", errors);
				throw new Error(
					`Discount creation failed: ${errors.map((e) => e.message).join(", ")}`
				);
			}

			logger.info(
				"Discount created successfully with ID:",
				mutationResult.discountAutomaticAppCreate?.automaticAppDiscount
					?.discountId
			);
		} catch (mutationError) {
			logger.error("Error in discount creation mutation:", {
				error: mutationError.message,
				stack: mutationError.stack,
			});
			throw new Error(`Failed to create discount: ${mutationError.message}`);
		}

		return {
			success: true,
			discountResult: mutationResult,
		};
	} catch (error) {
		logger.error("Error in createAutomaticAppDiscount action", {
			error: error.message,
			stack: error.stack,
		});
		throw error;
	}
};

/**
 * parameters this action accepts
 * @type {{ shopId: { type: string }, functionId: { type: string } }}
 */
export const params = {
	shopId: { type: "string" },
	functionId: { type: "string" },
};
