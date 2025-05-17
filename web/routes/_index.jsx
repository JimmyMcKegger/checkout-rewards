import { AutoTable } from "@gadgetinc/react/auto/polaris";
import { useEffect, useState } from "react";
import { useGlobalAction } from "@gadgetinc/react";
import { useNavigate } from "@remix-run/react";
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
					<Card padding="0">
						<Box padding="400">
							<Text variant="bodyMd" as="p">
								Hello checkout rewards
							</Text>

						</Box>
					</Card>
				</Layout.Section>
			</Layout>
		</Page>
	);
}
