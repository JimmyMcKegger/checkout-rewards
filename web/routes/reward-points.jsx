import {
	Page,
	Text,
	Card,
	TextField,
	InlineGrid,
	Box,
	Banner,
	BlockStack,
	Spinner,
} from "@shopify/polaris";
import { useNavigate } from "@remix-run/react";
import { useFindFirst } from "@gadgetinc/react";
import { api } from "../api";


export default function RewardPoints() {
	const navigate = useNavigate();

	const [{ data: shopData, fetching: isLoadingShop, error: shopError }] =
		useFindFirst(api.shopifyShop, {
			select: {
				id: true,
				currency: true,
				moneyFormat: true,
			},
		});

	console.log("SHOP DATA: ", shopData);
	const currency = shopData?.currency || "USD";

	return (
		<Page
			title="Checkout rewards Points"
			primaryAction={{ content: "Save", disabled: false }} // TODO: on save set metafields to hold points and amount of store currency
			backAction={{
				content: "Back",
				onAction: () => navigate("/"),
			}}
			isLoading={isLoadingShop}
		>
			{shopError && <Banner status="critical">Error loading shop data</Banner>}
			{shopData && (
				<BlockStack gap={{ xs: "800", sm: "400" }}>
					<InlineGrid columns={{ xs: "1fr", md: "2fr 5fr" }} gap="400">
						<Box
							as="section"
							paddingInlineStart={{ xs: 400, sm: 0 }}
							paddingInlineEnd={{ xs: 400, sm: 0 }}
						>
							<BlockStack gap="400">
								<Text as="h3" variant="headingMd">
									Reward Points
								</Text>
								<Text as="p" variant="bodyMd">
									Set the number of points a customer will receive for which
									denomination of currency.
								</Text>
							</BlockStack>
						</Box>
						<Card roundedAbove="sm">
							<BlockStack gap="400">
								<TextField label="Points rewarded" />
								<TextField label={`${currency} value`} />
							</BlockStack>
						</Card>
					</InlineGrid>
				</BlockStack>
			)}
		</Page>
	);
}
