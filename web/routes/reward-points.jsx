import { Page, Text } from "@shopify/polaris";
import { useNavigate } from "@remix-run/react";

export default function RewardPoints() {
  const navigate = useNavigate();

  return (
    <Page
      title="RewardPoints"
      backAction={{
        content: "Shop Information",
        onAction: () => navigate("/"),
      }}
    >
      <Text variant="bodyMd" as="p">
        This is where you set how many points to award for every dollar spent
      </Text>
    </Page>
  );
}
