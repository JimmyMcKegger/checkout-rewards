/**
 * Create a discount code using the Admin API
 * @type { ActionRun }
 */
export const run = async ({ params, logger, api, connections }) => {
	logger.info("Creating a discount code with params:", {
		title: params.title,
		code: params.code,
		discountType: params.discountType,
		discountValue: params.discountValue,
	});

	try {
		// check parameters
		if (
			!params.title ||
			!params.code ||
			!params.discountType ||
			!params.discountValue
		) {
			return {
				success: false,
				errors: {
					paramsError:
						"Discount title, code, discount type and discount value are required",
				},
			};
		}

		// check Shopify connection
		if (!connections.shopify.current) {
			return {
				success: false,
				apiError:
					"Not connected to Shopify. Please ensure your app is properly installed on your store.",
			};
		}

		// calculate discount value based on type
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
		const minimumRequirement = params?.minimumRequirement ? {
			subtotal: {
				greaterThanOrEqualToSubtotal:
					params.minimumRequirement,
			},
		} : null;

		// Create basic discount structure
		const basicCodeDiscount = {
			title: params.title,
			code:
				params.code.toUpperCase() ||
				"CHECKOUTREWARDS" + Math.floor(Math.random() * 1000),
			startsAt: params.startDate || new Date().toISOString(),
			endsAt: params.endDate || null,
			customerSelection: {
				all: true,
			},
			customerGets: {
				value: discountValue,
				items: { all: true },
			},
			appliesOncePerCustomer: params.onePerCustomer === true,
			minimumRequirement: minimumRequirement || null,
			usageLimit: parseInt(params?.usageLimit) || null,
		};

		// discountCodeBasicCreate mutation
		// https://shopify.dev/docs/api/admin-graphql/latest/mutations/discountCodeBasicCreate
		const mutation = `
		mutation discountCodeBasicCreate($basicCodeDiscount: DiscountCodeBasicInput!) {
			discountCodeBasicCreate(basicCodeDiscount: $basicCodeDiscount) {
				codeDiscountNode {
					id
					codeDiscount {
						... on DiscountCodeBasic {
							title
							codes(first: 1) {
								nodes {
									code
								}
							}
							status
							summary
						}
					}
				}
				userErrors {
					field
					message
					code
				}
			}
		}`;

		const response = await connections.shopify.current.graphql(mutation, {
			basicCodeDiscount,
		});

		// Check for GraphQL errors
		if (response.errors && response.errors.length > 0) {
			return {
				success: false,
				apiError: response.errors.map((err) => err.message).join("; "),
				errors: response.errors.reduce((acc, err) => {
					acc[err.path?.join(".") || "general"] = err.message;
					return acc;
				}, {}),
			};
		}

		// check for userErrors
		const userErrors = response.data?.discountCodeBasicCreate?.userErrors || [];
		if (userErrors.length > 0) {
			// all error messages
			const errors = userErrors.map(error => error.message);

			return {
				success: false,
				errors,
				apiError: errors.join(", "),
			};
		}

		// discount details
		const codeDiscountNode =
			response.data?.discountCodeBasicCreate?.codeDiscountNode;
		const discountId = codeDiscountNode?.id || null;
		const discountCode =
			codeDiscountNode?.codeDiscount?.codes?.nodes?.[0]?.code || params.code;

		// success response
		return {
			success: true,
			discountId,
			code: discountCode,
			message: `Discount code "${discountCode}" created successfully.`,
			title: codeDiscountNode?.codeDiscount?.title || params.title,
			status: codeDiscountNode?.codeDiscount?.status || "ACTIVE",
			summary: codeDiscountNode?.codeDiscount?.summary || "",
		};
	} catch (error) {
		return {
			success: false,
			apiError: error.message,
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
	minimumRequirement: { type: "string", optional: true },
	usageLimit: { type: "string", optional: true },
	onePerCustomer: { type: "boolean", optional: true },
	startDate: { type: "string", optional: true },
	endDate: { type: "string", optional: true },
};

/** @type { ActionOnSuccess } */
export const onSuccess = async ({
	params,
	record,
	logger,
	api,
	connections,
}) => {
	try {
		const shopId = connections.shopify.currentShop.id;

		// TODO: save the discount code's % and point cost into metafields

		// the discount code
		const discountCode = record?.code || params.code;
		if (!discountCode) {
			logger.error("No discount code found");
			return;
		}

		// set the metafield
		const metafieldsMutation = `
			mutation MetafieldsSet($metafields: [MetafieldsSetInput!]!) {
				metafieldsSet(metafields: $metafields) {
					metafields {
						id
						namespace
						key
						value
					}
					userErrors {
						field
						message
						code
					}
				}
			}
		`;

		const response = await connections.shopify.current.graphql(
			metafieldsMutation,
			{
				metafields: [
					{
						namespace: "checkout_rewards",
						key: "discount_code",
						ownerId: `gid://shopify/Shop/${shopId}`,
						type: "single_line_text_field",
						value: discountCode,
					},
				],
			}
		);

		// log errors
		if (response.data?.metafieldsSet?.userErrors?.length > 0) {
			const errors = response.data.metafieldsSet.userErrors;
			logger.error({ errors }, "Failed to create metafield");
			return;
		}

		logger.info("Successfully saved discount code to shop metafield");
	} catch (error) {
		logger.error({
			error: error.message,
			fullError: error,
		});
	}
};
