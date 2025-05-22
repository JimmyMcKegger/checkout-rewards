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

  const shopId =
    params.shopId || connections.shopify.currentShop?.id?.toString();

  if (!shopId) {
    logger.error("No shop ID found");
    return record;
  }

  logger.info("record");
  logger.info(JSON.stringify(record));

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

  //logger.info(`shopData: ${JSON.stringify(shopData)}`);

  // get the points to reward
  const pointsToReward = shopData?.checkoutRewardsPointsRewarded || 1;
  //logger.info(`pointsToReward: ${pointsToReward}`);

  // get the currency value to reward
  const currencyValueToReward = shopData?.checkoutRewardsCurrencyValue || 1;
  //logger.info(`currencyValueToReward: ${currencyValueToReward}`);

  // validate the discount code
  const discountCode = shopData?.checkoutRewardsDiscountCode.toUpperCase();
  //logger.info(`discountCode: ${discountCode}`);

  const customer = await api.shopifyCustomer.findOne(record.customer, {
    select: {
      id: true,
      points: true,
    },
  });
  //logger.info(`CUSTOMRE: ${JSON.stringify(customer)}`);

  const currentPoints = customer?.points || 0;
  //logger.info(`currentPoints: ${currentPoints}`);

  const ordeDiscountCodes =
    record.discountCodes?.map((code) => code.code) || [];
  //logger.info(`ordeDiscountCodes: ${JSON.stringify(ordeDiscountCodes)}`);

  const appDiscoutnUsed = ordeDiscountCodes.find(
    (code) => code === discountCode
  );
  //logger.info(`appDiscoutnUsed: ${appDiscoutnUsed}`);

  // get the points required to use the discount code
  const pointsRequired = shopData?.checkoutRewardsPointsRequired;
  //logger.info(`pointsRequired: ${pointsRequired}`);

  // check if the discount code is used
  if (appDiscoutnUsed) {
    pointsToSubtract += pointsRequired;
  }

  // add points to the customer based on order total
  const orderTotal = parseInt(record?.totalPrice);
  //logger.info(`orderTotal: ${orderTotal}`);

  pointsToAdd += parseInt(orderTotal / currencyValueToReward);

  //logger.info(`pointsToAdd: ${pointsToAdd}`);
  //logger.info(`pointsToSubtract: ${pointsToSubtract}`);

  const finalPoints = currentPoints + pointsToAdd - pointsToSubtract;
  //logger.info(`finalPoints: ${finalPoints}`);


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
            ownerId: `gid://shopify/Customer/${customer.id}`,
            type: "number_integer",
            value: `${finalPoints}`,
          },
        ],
      }
    );

    logger.info(JSON.stringify(response));
  } catch (error) {
    logger.error(`customer points metafield update error: ${error.message}`);
  }

  return record;
};

/** @type { ActionOptions } */
export const options = { actionType: "create" };
