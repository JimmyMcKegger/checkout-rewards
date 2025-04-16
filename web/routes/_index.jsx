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
  // use state
  const [metaDefinitionExists, setMetaDefinitionExists] = useState(false);
  const [storeMetafildDefinition, setStoreMetafildDefinition] = useState('');
  const [metafieldResult, setMetafieldResult] = useState(null);

  const [{ data, fetching, error }, createCustomerPointsMetafield] =
    useGlobalAction(api.createCustomerPointsMetafield);

  const [{ data: funcData, fetching: funFetching, error: funcError }, queryfunctions] =
    useGlobalAction(api.queryFunctions);

  // Get shop ID from the current shop
  useEffect(() => {
    const fetchShopId = async () => {
      try {
        // Fetch the current shop data
        const shopData = await api.shopifyShop.findMany({
          first: 1
        });
        if (shopData?.edges?.[0]?.node?.id) {
          const shopId = shopData.edges[0].node.id.toString();
          console.log("Found shop ID:", shopId);
          queryfunctions({ shopId });
        } else {
          console.error("Shop ID not available");
        }
      } catch (error) {
        console.error("Error fetching shop ID:", error);
      }
    };

    fetchShopId();
  }, [queryfunctions]);

  console.log("funcData:", funcData);
  console.log("funFetching:", funFetching);
  console.log("funcError:", funcError);

  useEffect(() => {
    const fetchMetaDefinition = async () => {
      try {
        // find metafield
        const existingDefinitions = await api.shopifyShop.metafieldDefinitions({
          namespace: "rewards",
          ownerType: "CUSTOMER",
          first: 1,
        });
        if (existingDefinitions?.nodes?.length === 1) {
          const definition = existingDefinitions.nodes[0];
          const result = `ID: ${definition.id}, Name: ${definition.name}`;
					console.log("storeMetafildDefinition", storeMetafildDefinition);
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
    if (!metaDefinitionExists) {
      createMetafield();
    }
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
            // points needs to be teh customer metafield rewards.points

            <AutoTable
              model={api.shopifyCustomer}
              columns={["id", "firstName", "lastName", "email", "points"]}
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
