// @ts-check

import {  DeliveryDiscountSelectionStrategy} from '../generated/api';

/**
 * @typedef {import("../generated/api").DeliveryInput} RunInput
 * @typedef {import("../generated/api").CartDeliveryOptionsDiscountsGenerateRunResult} CartDeliveryOptionsDiscountsGenerateRunResult
 */
/**
 * generateDeliveryRun
 * @param {RunInput} input - The DeliveryInput
 * @returns {CartDeliveryOptionsDiscountsGenerateRunResult} - The function result with discounts.
 */
export function generateDeliveryRun(input) {
  const firstDeliveryGroup = input.cart.deliveryGroups[0];
  if (!firstDeliveryGroup) {
      throw new Error('No delivery groups found');
  }
  return {
      operations: [
          {
              deliveryDiscountsAdd: {
                  candidates: [
                      {
                          message: 'FREE DELIVERY',
                          targets: [
                              {
                                  deliveryGroup: {
                                      id: firstDeliveryGroup.id,
                                  },
                              },
                          ],
                          value: {
                              percentage: {
                                  value: 100,
                              },
                          },
                      },
                  ],
                  selectionStrategy: DeliveryDiscountSelectionStrategy.All,
              },
          },
      ],
  };
}