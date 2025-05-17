import { AutoTable } from "@gadgetinc/react/auto/polaris";
import { useEffect, useState } from "react";
import { useNavigate } from "@remix-run/react";
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

export default function Customers() {
  const navigate = useNavigate();
  // use state
  const [metaDefinitionExists, setMetaDefinitionExists] = useState(false);
  const [storeMetafildDefinition, setStoreMetafildDefinition] = useState('');
  const [metafieldResult, setMetafieldResult] = useState(null);

  const [{ data, fetching, error }, createCustomerPointsMetafield] =
    useGlobalAction(api.createCustomerPointsMetafield);

  const [{ data: funcData, fetching: funFetching, error: funcError }, queryfunctions] =
    useGlobalAction(api.queryFunctions);

  // TODO: fix this with useFindFirst(api.shopifyShop)
  //  shop ID
  useEffect(() => {
    const fetchShopId = async () => {
      try {
        try {
          const myStore = await api.shopifyShop.findFirst();

          if (myStore?.id) {
            const shopId = myStore.id.toString();
            console.log("Found shop ID:", shopId);

            // queryfunctions and get the function ID from the response
            const response = await queryfunctions({ shopId });
            console.log("Query functions response:", response);

            // response with functionId
            if (response?.data?.success && response?.data?.functionId) {
              const functionId = response.data.functionId;
              console.log("Function ID:", functionId);
							console.log("typeof functionId", typeof functionId);

              // create a discount if none exists
              const autoDiscount = await api.createAutomaticAppDiscount({
                shopId,
                functionId
              });

              console.log("DISCOUNT", autoDiscount);
            } else {
              console.error("Invalid response:", response);
            }
          }
        } catch (firstShopError) {
          console.error("Error getting shop:", firstShopError);
        }
      } catch (error) {
        console.error("Error in shop ID:", error);
      }
    };

    console.log("Index page loaded - setting up discount creation");
    fetchShopId();
  }, [queryfunctions]);

  // TODO: Move this to the install action
  useEffect(() => {
    const checkAndCreateMetafield = async () => {
      try {
        // check if metafield definition exists
        const existingDefinitions = await api.shopifyShop.metafieldDefinitions({
          namespace: "rewards",
          ownerType: "CUSTOMER",
          first: 1,
        });

        if (existingDefinitions?.nodes?.length === 1) {
          // update state
          const definition = existingDefinitions.nodes[0];
          const result = `ID: ${definition.id}, Name: ${definition.name}`;
          console.log("Found existing metafield definition:", result);
          setStoreMetafildDefinition(result);
          setMetaDefinitionExists(true);
        } else {
          // create it
          console.log("No metafield definition found, creating one...");
          try {
            const result = await createCustomerPointsMetafield();
            setMetafieldResult(result);
            console.log("Created metafield:", result);
          } catch (createError) {
            console.error("Error creating metafield:", createError);
          }
        }
      } catch (error) {
        console.error("Error checking metafield definitions:", error);
      }
    };

    checkAndCreateMetafield();
  }, [createCustomerPointsMetafield]);

  return (
    <Page title="Checkout Rewards Customers"
    backAction={{
      content: "Back",
      onAction: () => navigate("/"),
    }}
    >
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
