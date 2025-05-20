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
	logger.info("onSuccess");

	logger.info("record");
	logger.info(JSON.stringify(record));

	let pointsToAdd = 0;
	let pointsToSubtract = 0;

	const shopId =
		params.shopId || connections.shopify.currentShop?.id?.toString();

	const shop = await api.shopifyShop.findById(shopId);
	logger.info(`shop: ${JSON.stringify(shop)}`);

	const discountCode = shop.checkoutRewardsDiscountCode;
	logger.info(`discountCode: ${discountCode}`);

	const customer = await api.shopifyCustomer.findById(record.customerId);
	logger.info(`customer: ${JSON.stringify(customer)}`);

	const currentPoints = customer?.points || 0;
	logger.info(`currentPoints: ${currentPoints}`);

	const ordeDiscountCodes = record.discountCodes.map((code) => code.code);
	logger.info(`ordeDiscountCodes: ${JSON.stringify(ordeDiscountCodes)}`);

	const appDiscoutnUsed = ordeDiscountCodes.find(
		(code) => code === discountCode
	);
	logger.info(`appDiscoutnUsed: ${appDiscoutnUsed}`);

	// add points to the customer based on order total
	const orderTotal = parseInt(record?.totalPrice);
	logger.info(`orderTotal: ${orderTotal}`);

	pointsToAdd += orderTotal;

	logger.info(`pointsToAdd: ${pointsToAdd}`);
	logger.info(`pointsToSubtract: ${pointsToSubtract}`);

	const finalPoints = currentPoints + pointsToAdd - pointsToSubtract;
	logger.info(`finalPoints: ${finalPoints}`);

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
					ownerId: `gid://shopify/Customer/${customer.id}`,
					type: "number_integer",
					value: `${finalPoints}`,
				},
			],
		}
	);

	logger.info(JSON.stringify(response));

	return record;
};

/** @type { ActionOptions } */
export const options = { actionType: "create" };
