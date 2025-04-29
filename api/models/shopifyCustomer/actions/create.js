import { applyParams, save, ActionOptions } from "gadget-server";
import { preventCrossShopDataAccess } from "gadget-server/shopify";

/** @type { ActionRun } */
export const run = async ({ params, record, logger, api, connections }) => {
  applyParams(params, record);
  await preventCrossShopDataAccess(params, record);
  await save(record);
};

/** @type { ActionOnSuccess } */
export const onSuccess = async ({ params, record, logger, api, connections }) => {
  logger.info("PARAMS", params);
  logger.info("RECORD", record);

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
          ownerId: `gid://shopify/Customer/${record.id}`,
          type: "number_integer",
          value: "0",
        },
      ],
    }
  );

  logger.info(response);
};

/** @type { ActionOptions } */
export const options = { actionType: "create" };
