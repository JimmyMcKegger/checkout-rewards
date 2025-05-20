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
	useApplyCartLinesChange,
	useCartLines,
	Heading,
	Image,
	Button,
	Divider,
	InlineLayout,
} from "@shopify/ui-extensions-react/checkout";

const target = "purchase.checkout.reductions.render-after";

export default reactExtension(target, () => <Extension />);

function Extension() {
	const translate = useTranslate();
	const { query } = useApi();
	const customer = useCustomer();
	const cartLines = useCartLines();
	const { discounts } = useInstructions() || {};
	const applyDiscountCodeChange = useApplyDiscountCodeChange();
	const applyCartLineChanges = useApplyCartLinesChange();

	// State management
	const [hasAddedDiscountCode, setHasAddedDiscountCode] = useState(false);
	const [customerPoints, setCustomerPoints] = useState(0);
	const [isLoading, setIsLoading] = useState(true);
	const [checkboxEnabled, setCheckboxEnabled] = useState(false);

	// if customer isn't logged in return early
	const isLoggedIn = !!customer;

	if (!isLoggedIn) {
		return (
			<Banner title={translate("welcome")} status="info">
				<Text size="medium">{translate("notLoggedIn")}</Text>
			</Banner>
		);
	}

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

				// console.log("Customer points:", customerPoints);
				// console.log("Required points:", requiredPoints);
				// console.log("customerPoints >= requiredPoints:", customerPoints >= requiredPoints);

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
	}, [customer, pointsMetafields, isLoggedIn]);

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

	// loading state
	if (isLoading) {
		return (
			<BlockStack spacing="loose">
				<Banner title="Checkout Rewards">
					<Text>Loading rewards...</Text>
				</Banner>
			</BlockStack>
		);
	}

	// renders for logged in customers rewards
	return (
		<BlockStack spacing="loose">
			{/* Rewards */}
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
	);
}
