import { AutoTable } from "@gadgetinc/react/auto/polaris";
import { useEffect, useState } from "react";
import { useGlobalAction } from "@gadgetinc/react";
import {
	Banner,
	BlockStack,
	Box,
	Card,
	Layout,
	Link,
	Page,
	Text,
} from "@shopify/polaris";
import { api } from "../api";

export default function Index() {
  // use state to determine if the metafield exists
  const [metaDefinitionExists, setMetaDefinitionExists] = useState(false);

  // use effect to check if the metafield exists


  // creat the metafield if it doesn't


	const [storeMetafildDefinition, setStoreMetafildDefinition] = useState('');
	const [metafieldResult, setMetafieldResult] = useState(null);
	const [{ data, fetching, error }, createCustomerPointsMetafield] =
		useGlobalAction(api.createCustomerPointsMetafield);

	useEffect(() => {
		const fetchMetaDefinition = async () => {
			try {
				//{
				//  metafieldDefinitions(namespace: "$app:rewards", ownerType: CUSTOMER, first: 1) {
				//    nodes {
				//      id
				//      name
				//    }
				//  }
				//}
				// find metafiesld definition namespace
				const existingDefinitions = await api.shopifyShop.metafieldDefinitions({
					namespace: "$app:rewards",
					ownerType: "CUSTOMER",
					first: 1,
				});
				if (existingDefinitions?.nodes?.length === 1) {
					const definition = existingDefinitions.nodes[0];
          const result = `ID: ${definition.id}, Name: ${definition.name}`
          setStoreMetafildDefinition(result);
          setMetaDefinitionExists(true);
				}
			} catch (error) {
				console.error("Error fetching meta definitions:", error);
			}
		};


		const createMetafield = async () => {
      try {
				const result = await createCustomerPointsMetafield();
				setMetafieldResult(result);
			} catch (error) {
				console.error("Error creating metafield:", error);
			}
		};

		fetchMetaDefinition();
		if(!metaDefinitionExists) {createMetafield()};
	}, [createCustomerPointsMetafield]);

	return (
		<Page title="App">
			<Layout>
				<Layout.Section>
					<Banner tone="success">
						<Text variant="bodyMd" as="p">
							Successfully connected your Gadget app to Shopify
						</Text>
					</Banner>
				</Layout.Section>


				<Layout.Section>
					<Card padding="0">
						{/* use Autocomponents to build UI quickly: https://docs.gadget.dev/guides/frontend/autocomponents  */}
						<AutoTable
							model={api.shopifyCustomer}
							columns={["id", "firstName", "lastName", "email"]}
						/>
						<Box padding="400">

							<Text variant="bodyMd" as="p">
								{fetching
									? "Loading metadata..."
									: storeMetafildDefinition}
							</Text>
						</Box>
					</Card>
				</Layout.Section>
			</Layout>
		</Page>
	);
}
