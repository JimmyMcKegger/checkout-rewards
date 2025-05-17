import { useNavigate } from "@remix-run/react";
import {
	Banner,
	BlockStack,
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
	const navigate = useNavigate();

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
					<Card padding="10">
						<Box padding="400">
							<Text variant="bodyMd" as="p">
								Welcome to the Checkout Rewards App
							</Text>
              <Divider />
							<Text variant="bodyMd" as="p">
								To get started, please configure the number of {" "}
								<Link onClick={() => navigate("/reward-points")}>
									reward points
								</Link>
								{" "} awarded for each euro spent.
							</Text>
						</Box>
					</Card>
				</Layout.Section>
			</Layout>
		</Page>
	);
}
