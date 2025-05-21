import { AutoTable } from "@gadgetinc/react/auto/polaris";
import { useNavigate } from "@remix-run/react";
import { Banner, Box, Card, Layout, Page, Text } from "@shopify/polaris";
import { api } from "../api";

export default function Customers() {
	const navigate = useNavigate();

	return (
		<Page
			title="Checkout Rewards Customers"
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
						<AutoTable
							model={api.shopifyCustomer}
							columns={["id", "firstName", "lastName", "email", "points"]}
						/>
					</Card>
				</Layout.Section>
			</Layout>
		</Page>
	);
}
