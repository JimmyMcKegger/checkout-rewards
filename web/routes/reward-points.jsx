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
import { useState, useEffect } from "react";
import { useNavigate } from "@remix-run/react";
import { useFindFirst, useAction } from "@gadgetinc/react";
import { api } from "../api";

export default function RewardPoints() {
	const navigate = useNavigate();
	const [pointsRewarded, setPointsRewarded] = useState(1);
	const [currencyValue, setCurrencyValue] = useState(1);

	// saving state
	const [isSaving, setIsSaving] = useState(false);
	const [showSuccessToast, setShowSuccessToast] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");

	// getcustom data with select https://docs.gadget.dev/api/checkout-rewards-app/development/schema/shopifyShop#retrieving-one-shopifyshop-record
	const [{ data: shopData, fetching: isLoadingShop, error: shopError }] =
		useFindFirst(api.shopifyShop, {
			select: {
				id: true,
				currency: true,
				checkoutRewardsPointsRewarded: true,
				checkoutRewardsCurrencyValue: true,
			},
		});

	console.log("SHOP DATA: ", shopData);
	const currency = shopData?.currency || "USD";

	// added mode api trigger
	// https://docs.gadget.dev/guides/actions/types-of-actions#model-actions
	const [{ data: updateData, fetching: isUpdating, error: updateError }, updateShop] =
		useAction(api.shopifyShop.update);

	// console.log("UPDATE DATA: ", updateData);
	// console.log("IS UPDATING: ", isUpdating);
	// console.log("UPDATE ERROR: ", updateError);

	const handleSave = async () => {
		setIsSaving(true);
		setErrorMessage("");

		try {
			await updateShop({
				id: shopData.id,
				checkoutRewardsPointsRewarded: parseInt(pointsRewarded),
				checkoutRewardsCurrencyValue: parseInt(currencyValue),
			});
			setShowSuccessToast(true);
		} catch (error) {
			setErrorMessage(error.message);
		} finally {
			setIsSaving(false);
		}
	};

	if (shopError) {
		console.log("SHOP ERROR: ", shopError);
	}

	useEffect(() => {
		if (shopData?.checkoutRewardsPointsRewarded) {
			setPointsRewarded(parseInt(shopData?.checkoutRewardsPointsRewarded));
		}
		if (shopData?.checkoutRewardsCurrencyValue) {
			setCurrencyValue(parseInt(shopData?.checkoutRewardsCurrencyValue));
		}
	}, [shopData]);

	return (
		<Page
			title="Checkout rewards Points"
			primaryAction={{
				content: "Save",
				disabled: isSaving,
				onAction: handleSave,
			}}
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
								<TextField
									autocomplete="off"
									type="number"
									label="Points rewarded"
									min={1}
									value={pointsRewarded}
									onChange={(value) => setPointsRewarded(value)}
								/>
								<TextField
									autocomplete="off"
									type="number"
									label={`${currency} value`}
									min={1}
									value={currencyValue}
									onChange={(value) => setCurrencyValue(value)}
								/>
							</BlockStack>
						</Card>
					</InlineGrid>
				</BlockStack>
			)}
		</Page>
	);
}
