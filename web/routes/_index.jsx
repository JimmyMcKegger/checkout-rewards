import { useNavigate } from "@remix-run/react";
import { useGlobalAction } from "@gadgetinc/react";
import { useEffect, useState } from "react";
import {
	Banner,
	Box,
	Card,
	Divider,
	Layout,
	Link,
	Page,
	Text,
} from "@shopify/polaris";
import { api } from "../api";

export default function Index() {
	// use state
	const [metaDefinitionExists, setMetaDefinitionExists] = useState(false);
	const [storeMetafildDefinition, setStoreMetafildDefinition] = useState("");
	const [metafieldResult, setMetafieldResult] = useState(null);
	const [showBanner, setShowBanner] = useState(true);

	const [
		{ data: createData, fetching: createFetching, error: createError },
		createCustomerPointsMetafield,
	] = useGlobalAction(api.createCustomerPointsMetafield);

	const [
		{ data: checkData, fetching: checkFetching, error: checkError },
		queryMetafieldDefinitions,
	] = useGlobalAction(api.queryMetafieldDefinitions);

	useEffect(() => {
		const checkAndCreateMetafield = async () => {
			try {
				// check if metafield definition exists
				const result = await queryMetafieldDefinitions({
					namespace: "rewards",
					key: "points",
					ownerType: "CUSTOMER",
				});

				// console.log("RESULT", result);

				if (result?.data?.length > 0) {
					// update state with the found definition
					const definition = result.data[0];
					const definitionStr = `ID: ${definition.id}, Name: ${definition.name}`;
					console.log("Found metafield definition:", definitionStr);
					setStoreMetafildDefinition(definitionStr);
					setMetaDefinitionExists(true);
				} else {
					// create it if it doesn't exist
					console.log("No rewards.points definition found");
					try {
						const createResult = await createCustomerPointsMetafield();
						setMetafieldResult(createResult);
						console.log("Created metafield:", createResult);
					} catch (createError) {
						console.error("Error creating metafield:", createError);
					}
				}
			} catch (error) {
				console.error("Error checking metafield definitions:", error);
			}
		};

		checkAndCreateMetafield();
	}, [queryMetafieldDefinitions, createCustomerPointsMetafield]);

	const navigate = useNavigate();

	return (
		<Page title="App">
			<Layout>
				<Layout.Section>
					{showBanner && (
						<Banner tone="success" onDismiss={() => setShowBanner(false)}>
							<Text variant="bodyMd" as="p">
								Successfully connected your Gadget app to Shopify
							</Text>
						</Banner>
					)}
				</Layout.Section>

				<Layout.Section>
					<Card padding="10">
						<Box padding="400">
							<Text variant="bodyMd" as="p">
								Welcome to the Checkout Rewards App
							</Text>
							<Divider />
							<Text variant="bodyMd" as="p">
								To get started, please create a{" "}
								<Link onClick={() => navigate("/discounts")}>discount</Link>{" "}
								and configure how many{" "}
								<Link onClick={() => navigate("/reward-points")}>
									reward points
								</Link>{" "}
								are awarded for each euro spent.
							</Text>
						</Box>
					</Card>
				</Layout.Section>
			</Layout>
		</Page>
	);
}
