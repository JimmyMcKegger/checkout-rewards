import { applyParams, save, ActionOptions } from "gadget-server";
import { preventCrossShopDataAccess } from "gadget-server/shopify";

/** @type { ActionRun } */
export const run = async ({ params, record, logger, api, connections }) => {
	applyParams(params, record);
	await preventCrossShopDataAccess(params, record);
	await save(record);
};

/** @type { ActionOnSuccess } */
export const onSuccess = async ({
	params,
	record,
	logger,
	api,
	connections,
}) => {
	const shopId =
		params.shopId || connections.shopify.currentShop?.id?.toString();

	let pointsToAdd = 0;
	let pointsToSubtract = 0;

	// fetch shop data
	const shopData = await api.shopifyShop.findOne(shopId, {
		select: {
			checkoutRewardsPointsRewarded: true,
			checkoutRewardsCurrencyValue: true,
			checkoutRewardsDiscountCode: true,
			checkoutRewardsPointsRequired: true,
		},
	});

	// get the points to reward
	const pointsToReward = shopData?.checkoutRewardsPointsRewarded || 1;

	// get the currency value to reward
	const currencyValueToReward = shopData?.checkoutRewardsCurrencyValue || 1;

	// validate the discount code
	const discountCode = shopData?.checkoutRewardsDiscountCode.toUpperCase();
	const query = `
  query getOrderCustomer($id: ID!) {
    order(id: $id) {
      customer {
        id
        metafield(namespace: "rewards", key: "points") {
          value
        }
      }
    }
  }`;

	const variables = {
		id: `gid://shopify/Order/${record.id}`,
	};

	const response = await connections.shopify.current?.graphql(query, variables);

	const customer = response?.order?.customer;
	const customerGid = customer?.id;
	const customerPoints = parseInt(customer?.metafield?.value) || 0;

	const currentPoints = customerPoints || 0;

	const ordeDiscountCodes =
		record.discountCodes?.map((code) => code.code) || [];

	const appDiscoutnUsed = ordeDiscountCodes.find(
		(code) => code === discountCode
	);
	logger.info(`appDiscoutnUsed: ${appDiscoutnUsed}`);

	// get the points required to use the discount code
	const pointsRequired = shopData?.checkoutRewardsPointsRequired;

	// check if the discount code is used
	if (appDiscoutnUsed) {
		pointsToSubtract += pointsRequired;
	}

	// add points to the customer based on order total
	const orderTotal = parseInt(record?.totalPrice);

	pointsToAdd += parseInt(orderTotal / currencyValueToReward);

	const finalPoints = currentPoints + pointsToAdd - pointsToSubtract;

	// set the points back to the shopify customer metafield
	try {
		const response = await connections.shopify.current?.graphql(
			`mutation setMetafield($metafields: [MetafieldsSetInput!]!) {
				metafieldsSet(metafields: $metafields) {
					metafields {
						id
						value
						ownerType
						key
						namespace
					}
					userErrors {
						field
						message
					}
				}
			}
			`,
			{
				metafields: [
					{
						namespace: "rewards",
						key: "points",
						ownerId: `${customerGid}`,
						type: "number_integer",
						value: `${finalPoints}`,
					},
				],
			}
		);
	} catch (error) {
		logger.error(`customer points metafield update error: ${error.message}`);
	}

	return record;
};

/** @type { ActionOptions } */
export const options = { actionType: "create" };
