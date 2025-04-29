import { applyParams, save, ActionOptions, preventCrossShopDataAccess, SavePrePuchaseProductShopifyShopActionContext } from "gadget-server";
import { preventCrossShopDataAccess } from "gadget-server/shopify";

/** @type { ActionRun } */
export const run = async ({ params, record, logger, api, connections }) => {
  applyParams(params, record);
  await preventCrossShopDataAccess(params, record);
  await save(record);
};

/** @type { ActionOnSuccess } */
export const onSuccess = async ({ params, record, logger, api, connections }) => {
  const { productId } = params;

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
          namespace: "checkout_rewards",
          key: "freeGift",
          ownerId: `gid://shopify/Shop/${record.id}`,
          type: "product_reference",
          value: productId,
        },
      ],
    }
  );

  logger.info({ response }, "add metafield response");
};

/** @type { ActionOptions } */
export const options = {
  actionType: "update",
  triggers: { api: true },
};
