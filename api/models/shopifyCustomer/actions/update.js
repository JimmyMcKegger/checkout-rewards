import { applyParams, save, ActionOptions } from "gadget-server";
import { preventCrossShopDataAccess } from "gadget-server/shopify";

/** @type { ActionRun } */
export const run = async ({ params, record, logger, api, connections }) => {
  applyParams(params, record);
  await preventCrossShopDataAccess(params, record);

  const customerId = record.customerId;

  if (customerId) {
    try {
      // customer's rewards.points metafield
      const response = await connections.shopify.graphql(`
        query getPoints($customerId: ID!) {
          customer(id: $customerId) {
            metafield(namespace: "rewards", key: "points") {
              value
            }
          }
        }
      `, {
        variables: {
          customerId: `gid://shopify/Customer/${customerId}`
        }
      });

      // get points value
      const numPoints = response.data.customer?.metafield?.value;
      if (numPoints) {

        // get number of points
        record.points = parseInt(pointsMetafield.value) || 0;
        logger.info(`Retrieved rewards points: ${record.rewardsPoints} for customer ${customerId}`);
      } else {
        logger.info(`No rewards.points metafield on ${customerId}`);

        record.rewardsPoints = 0;
      }
    } catch (error) {
      logger.error(`Error fetching customer metafield: ${error.message}`);
    }
  }

  await save(record);
};

/** @type { ActionOnSuccess } */
export const onSuccess = async ({ params, record, logger, api, connections }) => {
  // Your logic goes here
};

/** @type { ActionOptions } */
export const options = { actionType: "update" };
