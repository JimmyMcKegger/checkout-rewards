import { Page, Text } from "@shopify/polaris";
import { useNavigate } from "@remix-run/react";


export default function Discounts() {
  const navigate = useNavigate();

  return (
    <Page
      title="Discounts"
      backAction={{
        content: "Shop Information",
        onAction: () => navigate("/"),
      }}
    >
      <Text variant="bodyMd" as="p">
        This is a simple Shopify Embedded App.
      </Text>
    </Page>
  );
}
