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
} from "@shopify/ui-extensions-react/checkout";


// Choose an extension target
const target = "purchase.checkout.reductions.render-after";

export default reactExtension(target, () => <Extension />);

function Extension() {
	const translate = useTranslate();
	const { extension } = useApi();
  console.log("extension", extension);
	const instructions = useInstructions();
  console.log("instructions", instructions);
	const applyAttributeChange = useApplyAttributeChange();

	// get the customer with useCustomer()
	const customer = useCustomer();

	// if no customer
	if (!customer) {
		console.log("No customer");
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
