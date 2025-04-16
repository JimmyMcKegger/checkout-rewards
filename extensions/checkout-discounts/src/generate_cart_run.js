// @ts-check

import {
  OrderDiscountSelectionStrategy,
  ProductDiscountSelectionStrategy,
} from '../generated/api';

/**
 * @typedef {import("../generated/api").CartInput} CartInput
 * @typedef {import("../generated/api").CartLinesDiscountsGenerateRunResult} CartLinesDiscountsGenerateRunResult
 */

/**
 * generateCartRun
 * @param {CartInput} input
 * @returns {CartLinesDiscountsGenerateRunResult}
 */
export function generateCartRun(input) {
    console.log('generateCartRun', { input });

    const maxCartLine = input.cart.lines.reduce((maxLine, line) => {
        if (line.cost.subtotalAmount > maxLine.cost.subtotalAmount) {
            return line;
        }
        return maxLine;
    }, input.cart.lines[0]);


    return {
        operations: [
            {
                orderDiscountsAdd: {
                    candidates: [
                        {
                            message: '10% OFF ORDER',
                            targets: [
                                {
                                    orderSubtotal: {
                                        excludedCartLineIds: [],
                                    },
                                },
                            ],
                            value: {
                                percentage: {
                                    value: 10,
                                },
                            },
                        },
                    ],
                    selectionStrategy: OrderDiscountSelectionStrategy.First,
                },
            },
            {
                productDiscountsAdd: {
                    candidates: [
                        {
                            message: '20% OFF PRODUCT',
                            targets: [
                                {
                                    cartLine: {
                                        id: maxCartLine.id,
                                    },
                                },
                            ],
                            value: {
                                percentage: {
                                    value: 20,
                                },
                            },
                        },
                    ],
                    selectionStrategy: ProductDiscountSelectionStrategy.First,
                },
            },
        ],
    };
}
