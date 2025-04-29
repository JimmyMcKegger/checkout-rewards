import { useEffect, useState } from "react";
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
	useDiscountCodes,
	useApplyDiscountCodeChange,
	useApplyCartLinesChange,
} from "@shopify/ui-extensions-react/checkout";

// TODO: move extention target above discount code box
// extension target
const target = "purchase.checkout.reductions.render-after";

export default reactExtension(target, () => <Extension />);

function Extension() {
	const translate = useTranslate();
	const { query, extension } = useApi();

	const applyCartLineChanges = useApplyCartLinesChange();



	// check instructions before changing the checkout
	const instructions = useInstructions();

	// https://shopify.dev/docs/api/checkout-ui-extensions/2025-04/apis/discounts

	const discountCodes = useDiscountCodes();
	const applyDiscountCodeChange = useApplyDiscountCodeChange();
	const [hasAddedDiscountCode, setHasAddedDiscountCode] = useState(false);
	const [metafieldPoints, setMetafieldPoints] = useState(0);
	const [freeGift, setFreeGift] = useState(null);
	const [loading, setLoading] = useState(false);
	const [adding, setAdding] = useState(false);
	const [error, setError] = useState(false);

	// add or remove discount when checkbox changes
	useEffect(() => {
		if (hasAddedDiscountCode) {
			applyDiscountCodeChange({
				code: "TEST",
				type: "addDiscountCode",
			});
		} else {
			applyDiscountCodeChange({
				code: "TEST",
				type: "removeDiscountCode",
			});
		}
	}, [hasAddedDiscountCode, applyDiscountCodeChange]);

	// moved inside the component
	const onCheckboxChange = (isChecked) => {
		setHasAddedDiscountCode(isChecked);
	};

	// get the customer with useCustomer()
	const customer = useCustomer();

	const allMetafields = useAppMetafields();
	console.log("All metafields", allMetafields);
	// get metafields for product and points
	const customerPoints = useAppMetafields({
		namespace: "$app:checkout_rewards",
		key: "points",
	});

	const prePurchaseProduct = useAppMetafields({
		type: "shop",
		namespace: "checkout_rewards",
		key: "freeGift",
	});;

	console.log("Customer points metafield", customerPoints);
	console.log("Pre-purchase product metafield", prePurchaseProduct);

	useEffect(() => {
		// Get the customer ID
		const customerId = customer?.id;
		if (!customer) {
			return;
		}

		const pointsMetafield = customerPoints.find(({ target }) => {
			console.log("Target", target);
			// Check if the target of the metafield is the customer
			const strToCheck = `gid://shopify/Customer/${target.id}`;

			console.log("Customer ID", customerId);
			console.log("String to check", strToCheck);
			return strToCheck === customerId;
		});

		const textValue = pointsMetafield?.metafield?.value;
		console.log("Text value", textValue);
		const numberValue = parseInt(textValue);
		console.log("Number value", numberValue);

		if (numberValue > 0) {
			setMetafieldPoints(numberValue);
		}
	}, [customer, customerPoints]);

	// if no customer
	if (!customer) {
		console.log("No customer profile");
		return (
			<Banner title={translate("welcome")} status="info">
				<Text size="medium">
					{translate("notLoggedIn")}
				</Text>
			</Banner>
		);
	}
	// customer logged in and can  update
	else if (customer && instructions.discounts.canUpdateDiscountCodes) {
		console.log("Customer", customer);
		const name = customer.firstName || customer.email;
		const welcomMessage = `${translate("welcomeBackMessage")}, ${name}!`;
		const discountOffer = translate("offerDiscount");

		return (
			<BlockStack border={"dotted"} padding={"tight"}>
				<Banner title="Checkout Rewards">
					<Text>{welcomMessage}</Text>
				</Banner>
				{/* show points */}
				<Text>You have {metafieldPoints} points!</Text>

				<Checkbox checked={hasAddedDiscountCode} onChange={onCheckboxChange}>
					{discountOffer}
				</Checkbox>
			</BlockStack>
		);
	} else {
		const name = customer.firstName || customer.email;
		const welcomMessage = `${translate("welcomeBackMessage")}, ${name}!`;

		return (
			<BlockStack border={"dotted"} padding={"tight"}>
				<Banner title="Checkout Rewards">
					<Text>{welcomMessage}</Text>
				</Banner>

				<Text>You have {metafieldPoints} points!</Text>
				<Banner status="warning">
					Checkout Rewards discounts are unavailable
				</Banner>
			</BlockStack>
		);
	}
}
