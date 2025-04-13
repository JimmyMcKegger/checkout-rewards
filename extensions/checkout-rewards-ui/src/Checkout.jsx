import { useEffect, useState } from "react";
import {
	reactExtension,
	Banner,
	BlockStack,
	Checkbox,
	Text,
	useApi,
	useCustomer,
	useExtension,
	useSession,
	useApplyAttributeChange,
	useInstructions,
	useTranslate,
	useAppMetafields,
} from "@shopify/ui-extensions-react/checkout";

// Choose an extension target
const target = "purchase.checkout.reductions.render-after";

export default reactExtension(target, () => <Extension />);

function Extension() {
	const translate = useTranslate();
	const { extension } = useApi();
	console.log("extension", extension);

	const [metafieldPoints, setMetafieldPoints] = useState(0);

	// get the customer with useCustomer()
	const customer = useCustomer();

	const metafield = useAppMetafields({
		type: "customer",
		namespace: "rewards",
		key: "points",
	});

	useEffect(() => {
		// Get the customer ID
		const customerId = customer?.id;
		if (!customer) {
			return;
		}

		const pointsMetafield = metafield.find(({ target }) => {
			// Check if the target of the metafield is the customer
			const strToCheck = `gid://shopify/Customer/${target.id}`;
			return strToCheck === customerId;
		});

		console.log("pointsMetafield?.metafield?.value", pointsMetafield?.metafield?.value);
		const textValue = pointsMetafield?.metafield?.value;
		const numberValue = parseInt(textValue);

		console.log("numberValue", numberValue);
		if (numberValue > 0) {
			setMetafieldPoints(numberValue);
		}
		// If we find the metafield, set the value
		if (typeof pointsMetafield?.metafield?.value === "number") {
			setMetafieldPoints(pointsMetafield.metafield.value);
		}
	}, [customer, metafield]);

	console.log("FINAL", metafieldPoints);

	// if no customer
	if (!customer) {
		console.log("No customer profile");
		return (
			<Banner title={translate("welcome")} status="info">
				<Text size="medium">
					{/* If you are a returning customer, please log in to see your rewards */}
					{translate("notLoggedIn")}
				</Text>
			</Banner>
		);
	}
	// customer logged in
	else {
		console.log("Customer", customer);
		const name = customer.firstName || customer.email;
		const welcomMessage = `${translate("welcomeBackMessage")}, ${name}!`;

		return (
			<BlockStack border={"dotted"} padding={"tight"}>
				<Banner title="Checkout Rewards">
					<Text>{welcomMessage}</Text>
				</Banner>
				{/* show points */}
				<Text>You have {metafieldPoints} points!</Text>
				{/* apply available discounts? */}
				<Checkbox onChange={onCheckboxChange}>
					{translate("welcomeBackMessage")}
				</Checkbox>
			</BlockStack>
		);
	}
}

// manage checkout discount application
async function onCheckboxChange(isChecked) {
	const result = await applyAttributeChange({
		key: "appliedDiscount",
		type: "updateAttribute",
		value: isChecked ? "yes" : "no",
	});
	console.log("applyAttributeChange result", result);
}
