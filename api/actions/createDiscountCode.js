/**
 * Create a discount code using the Admin API
 * @type { ActionRun }
 */
export const run = async ({ params, logger, api, connections }) => {
	logger.info("Creating a discount code - incoming params:", { params });

	try {
		const shopId =
			params.shopId || connections.shopify.currentShop?.id?.toString();

		if (!shopId) {
			logger.error("No shop ID available");
			return {
				success: false,
				apiError: "No shop ID available",
			};
		}

		logger.info("Using shop ID:", shopId);

		// Validate required parameters
		if (!params.title) {
			logger.error("Missing required parameter: title");
			return {
				success: false,
				errors: { title: "Discount title is required" },
			};
		}

		if (!params.code) {
			logger.error("Missing required parameter: code");
			return {
				success: false,
				errors: { code: "Discount code is required" },
			};
		}

		if (!params.discountValue) {
			logger.error("Missing required parameter: discountValue");
			return {
				success: false,
				errors: { discountValue: "Discount value is required" },
			};
		}


		let discountValue;
		if (params.discountType === "percentage") {
			discountValue = {
				percentage: parseFloat(params.discountValue) / 100,
			};
		} else {
			discountValue = {
				fixedAmount: {
					amount: parseFloat(params.discountValue),
				},
			};
		}

		logger.info("Calculated discount value:", discountValue);

		const basicCodeDiscount = {
			title: params.title,
			code: params.code.toUpperCase() || "CHECKOUTREWARDS" + Math.floor(Math.random() * 1000),
			startsAt: params.startDate || new Date().toISOString(),
			endsAt: params.endDate || null,
			customerGets: {
				value: discountValue,
				items: { all: true },
			},
		};


/*     {
      "basicCodeDiscount": {
        "title": "10% off selected items",
        "code": "10FORYOU",
        "startsAt": "2025-01-01T00:00:00Z",
        "endsAt": "2025-12-31T23:59:59Z",
        "customerSelection": {
          "all": true
        },
        "customerGets": {
          "value": {
            "percentage": 0.1
          },
          "items": {
            "all": true
          }
        },
        "minimumRequirement": {
          "subtotal": {
            "greaterThanOrEqualToSubtotal": "50.0"
          }
        },
        "usageLimit": 100
      }
    } */


		// mutation for creating a discount code
		const mutation = `#graphql
  mutation CreateDiscountCode($basicCodeDiscount: DiscountCodeBasicInput!) {
	discountCodeBasicCreate(basicCodeDiscount: $basicCodeDiscount) {
		codeDiscountNode {
			id
			codeDiscount {
				... on DiscountCodeBasic {
					title
					codesCount {
						count
					}
					startsAt
					endsAt
					customerGets {
						value {
							... on DiscountPercentage {
								percentage
							}
							... on DiscountAmount {
								amount {
									amount
									currencyCode
								}
							}
						}
					}
					usageLimit
					appliesOncePerCustomer
				}
			}
		}
		userErrors {
			field
			message
		}
	}
}`;

		const variables = {
			basicCodeDiscount,
		};

		const result = await api.enqueue(api.writeToShopify, {
			shopId,
			mutation,
			variables,
		});

		logger.info("Got result from Shopify API:", result);

		// user errors
		const userErrors =
			result.body?.data?.discountCodeBasicCreate?.userErrors || [];
		if (userErrors.length > 0) {
			logger.error("Discount code creation errors:", userErrors);

			// Convert API errors to a format that's easy to work with in the UI
			const errors = userErrors.reduce((acc, error) => {
				acc[error.field] = error.message;
				return acc;
			}, {});

			return {
				success: false,
				errors,
				apiError: userErrors[0].message,
			};
		}

		return {
			success: true,
			discountId:
				result.body?.data?.discountCodeBasicCreate?.codeDiscountNode?.id,
			message: `Discount code "${params.code}" created successfully.`,
			result: result.body?.data?.discountCodeBasicCreate,
		};
	} catch (error) {
		logger.error("Error creating discount code:", {
			error: error.message,
			stack: error.stack,
		});

		return {
			success: false,
			apiError: error.message || "An error occurred creating the discount.",
		};
	}
};

/**
 * Define the parameters this action accepts
 */
export const params = {
	shopId: { type: "string", optional: true },
	title: { type: "string" },
	code: { type: "string" },
	discountType: { type: "string" },
	discountValue: { type: "string" },
	pointsRequired: { type: "string" },
	minimumPurchase: { type: "string", optional: true },
	usageLimit: { type: "string", optional: true },
	onePerCustomer: { type: "boolean", optional: true },
	startDate: { type: "string", optional: true },
	endDate: { type: "string", optional: true },
};
