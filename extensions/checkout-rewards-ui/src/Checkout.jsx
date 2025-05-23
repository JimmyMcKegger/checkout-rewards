import { useEffect, useState, useCallback } from "react";
import {
	reactExtension,
	Banner,
	BlockStack,
	Checkbox,
	Text,
	useApi,
	useCustomer,
	useTranslate,
	useAppMetafields,
	useInstructions,
	useApplyDiscountCodeChange,
	useCartLines,
	Divider,
	InlineLayout,
} from "@shopify/ui-extensions-react/checkout";

// This file hosts both teh Checkout and Thank you pages

// Checkout page
const checkoutRender = reactExtension(
	"purchase.checkout.reductions.render-after",
	() => <CheckoutExtension />
);
export { checkoutRender };

// Thank you page
const thankYouRender = reactExtension(
	"purchase.thank-you.customer-information.render-after",
	() => <ThankYouExtension />
);
export { thankYouRender };

// CHECKOUT PAGE
function CheckoutExtension() {
	const translate = useTranslate();
	const { query } = useApi();
	const customer = useCustomer();
	const cartLines = useCartLines();
	const { discounts } = useInstructions() || {};
	const applyDiscountCodeChange = useApplyDiscountCodeChange();

	// State management
	const [hasAddedDiscountCode, setHasAddedDiscountCode] = useState(false);
	const [customerPoints, setCustomerPoints] = useState(0);
	const [isLoading, setIsLoading] = useState(true);
	const [checkboxEnabled, setCheckboxEnabled] = useState(false);

	// if customer is logged in
	const isLoggedIn = !!customer;

	// get metafields
	const pointsMetafields = useAppMetafields({
		type: "customer",
		namespace: "rewards",
		key: "points",
	});

	const discountCodeMetafields = useAppMetafields({
		type: "shop",
		namespace: "checkout_rewards",
		key: "discount_code",
	});

	const percentageValueMetafields = useAppMetafields({
		type: "shop",
		namespace: "checkout_rewards",
		key: "percentage_value",
	});

	const pointsRequiredMetafields = useAppMetafields({
		type: "shop",
		namespace: "checkout_rewards",
		key: "points_required",
	});

	// combined effect for loading and customer points
	useEffect(() => {
		// customer points from metafields
		if (isLoggedIn) {
			const customerId = customer.id;
			const pointsMetafieldValue = pointsMetafields.find(
				({ target }) => `gid://shopify/Customer/${target.id}` === customerId
			);

			if (pointsMetafieldValue?.metafield?.value) {
				const customerPoints =
					parseInt(pointsMetafieldValue.metafield.value) || 0;
				const requiredPoints =
					parseInt(pointsRequiredMetafields[0]?.metafield?.value) || 0;

				setCustomerPoints(customerPoints);

				if (customerPoints >= requiredPoints) {
					setCheckboxEnabled(true);
				}
			}
		}

		// loading delay
		const delay = setTimeout(() => {
			setIsLoading(false);
		}, 300);

		// cleanup function
		// https://react.dev/reference/react/useEffect#my-cleanup-logic-runs-even-though-my-component-didnt-unmount
		return () => clearTimeout(delay);
	}, [customer, pointsMetafields, isLoggedIn, pointsRequiredMetafields]);

	// handlers using useCallbacks
	const handleCheckboxChange = useCallback(
		(newValue) => {
			setHasAddedDiscountCode(newValue);
			console.log("handleCheckboxChange newValue", newValue);

			applyDiscountCodeChange({
				code: discountCodeMetafields[0]?.metafield?.value,
				type: newValue ? "addDiscountCode" : "removeDiscountCode",
			});
		},
		[applyDiscountCodeChange, discountCodeMetafields]
	);

	// rendering values
	const customerName = customer?.firstName || customer?.email || "";
	const welcomeMessage = `${translate("welcomeBackMessage")}, ${customerName}!`;

	return (
		<BlockStack spacing="loose">
			{!isLoggedIn && (
				<Banner title={translate("welcome")} status="info">
					<Text size="medium">{translate("notLoggedIn")}</Text>
				</Banner>
			)}
			{isLoggedIn && (
				<>
					{isLoading && (
						<BlockStack spacing="loose">
							<Banner title="Checkout Rewards">
								<Text>Loading rewards...</Text>
							</Banner>
						</BlockStack>
					)}

					{!isLoading && (
						// renders for logged in customers
						<BlockStack spacing="loose">
							<BlockStack border="dotted" padding="tight">
								<Banner title="Checkout Rewards">
									<Text>{welcomeMessage}</Text>
								</Banner>
								<Text>You have {customerPoints} points!</Text>

								{discounts?.canUpdateDiscountCodes ? (
									<Checkbox
										checked={hasAddedDiscountCode}
										onChange={handleCheckboxChange}
										disabled={!checkboxEnabled}
									>
										{checkboxEnabled && (
											<Text>
												{`Redeem ${pointsRequiredMetafields[0]?.metafield?.value} points for a ${percentageValueMetafields[0]?.metafield?.value}% discount?`}
											</Text>
										)}
										{!checkboxEnabled && (
											<Text>
												{`Next reward available at ${pointsRequiredMetafields[0]?.metafield?.value} points`}
											</Text>
										)}
									</Checkbox>
								) : (
									<Banner status="warning">
										Checkout Rewards discounts are unavailable
									</Banner>
								)}
							</BlockStack>
						</BlockStack>
					)}
				</>
			)}
		</BlockStack>
	);
}

// THANK YOU PAGE
function ThankYouExtension() {
	const customer = useCustomer();
	const isLoggedIn = !!customer;

	const [isLoading, setIsLoading] = useState(true);
	const [customerPoints, setCustomerPoints] = useState(0);

	const appMetafields = useAppMetafields({
		type: "customer",
		namespace: "rewards",
		key: "points",
	});

	useEffect(() => {
		if (!isLoggedIn) {
			setIsLoading(false);
			return;
		}

		if (appMetafields && appMetafields.length > 0 && customer?.id) {
			const pointsMetafieldValue = appMetafields.find(
				({ target }) =>
					target && `gid://shopify/Customer/${target.id}` === customer.id
			);

			if (pointsMetafieldValue?.metafield?.value) {
				const points = parseInt(pointsMetafieldValue.metafield.value) || 0;
				setCustomerPoints(points);
			} else {
				setCustomerPoints(0);
			}
			setIsLoading(false);
		} else if (appMetafields) {
			setCustomerPoints(0);
			setIsLoading(false);
		}
	}, [customer, isLoggedIn, appMetafields]);

	if (!isLoggedIn && !isLoading) {
		return (
			<>
				<Banner title="Checkout Rewards" status="info">
					<Text>Log in to see your rewards</Text>
				</Banner>
			</>
		);
	}

	let customerTitle = customer?.firstName || customer?.email || "!";
	customerTitle =
		customerTitle.length > 1 ? " " + customerTitle : customerTitle;

	return (
		<>
			{isLoading && (
				<Banner title="Checkout Rewards">
					<Text>Loading your rewards...</Text>
				</Banner>
			)}
			{!isLoading && (
				<BlockStack spacing="loose" border="dotted" padding="base">
					<Banner title="Checkout Rewards" status="success">
						<Text>
							{"Thanks for shopping with us"},{customerTitle}
						</Text>
					</Banner>
					<InlineLayout spacing="loose" columns={["fill", "auto"]}>
						<Text>Your current reward points balance:</Text>
						<Text emphasis="bold" size="medium">
							{customerPoints} points
						</Text>
					</InlineLayout>
				</BlockStack>
			)}
		</>
	);
}
