import { useNavigate } from "@remix-run/react";
import { useGlobalAction } from "@gadgetinc/react";
import { useEffect, useState } from "react";
import {
	Banner,
	Box,
	Card,
	Divider,
	Layout,
	Link,
	Page,
	Text,
	Collapsible,
	Button,
	InlineStack,
	Icon,
	BlockStack,
} from "@shopify/polaris";
import { ChevronDownIcon, ChevronUpIcon } from "@shopify/polaris-icons";
import { api } from "../api";

export default function Index() {
	// use state
	const [metaDefinitionExists, setMetaDefinitionExists] = useState(false);
	const [storeMetafildDefinition, setStoreMetafildDefinition] = useState("");
	const [metafieldResult, setMetafieldResult] = useState(null);
	const [showBanner, setShowBanner] = useState(true);

	// Collapsible states for instruction cards
	const [rewardPointsOpen, setRewardPointsOpen] = useState(false);
	const [discountsOpen, setDiscountsOpen] = useState(false);
	const [customersOpen, setCustomersOpen] = useState(false);
	const [overviewOpen, setOverviewOpen] = useState(false);
	const [quickSetupOpen, setQuickSetupOpen] = useState(false);

	const [
		{ data: createData, fetching: createFetching, error: createError },
		createCustomerPointsMetafield,
	] = useGlobalAction(api.createCustomerPointsMetafield);

	const [
		{ data: checkData, fetching: checkFetching, error: checkError },
		queryMetafieldDefinitions,
	] = useGlobalAction(api.queryMetafieldDefinitions);

	useEffect(() => {
		const checkAndCreateMetafield = async () => {
			try {
				// check if metafield definition exists
				const result = await queryMetafieldDefinitions({
					namespace: "rewards",
					key: "points",
					ownerType: "CUSTOMER",
				});

				// console.log("RESULT", result);

				if (result?.data?.length > 0) {
					// update state with the found definition
					const definition = result.data[0];
					const definitionStr = `ID: ${definition.id}, Name: ${definition.name}`;
					console.log("Found metafield definition:", definitionStr);
					setStoreMetafildDefinition(definitionStr);
					setMetaDefinitionExists(true);
				} else {
					// create it if it doesn't exist
					console.log("No rewards.points definition found");
					try {
						const createResult = await createCustomerPointsMetafield();
						setMetafieldResult(createResult);
						console.log("Created metafield:", createResult);
					} catch (createError) {
						console.error("Error creating metafield:", createError);
					}
				}
			} catch (error) {
				console.error("Error checking metafield definitions:", error);
			}
		};

		checkAndCreateMetafield();
	}, [queryMetafieldDefinitions, createCustomerPointsMetafield]);

	const navigate = useNavigate();

	return (
		<Page title="Checkout Rewards App">
			<Layout>
				<Layout.Section>
					{showBanner && (
						<Banner tone="success" onDismiss={() => setShowBanner(false)}>
							<Text variant="bodyMd" as="p">
								Successfully connected your Gadget app to Shopify
							</Text>
						</Banner>
					)}
				</Layout.Section>

				<Layout.Section>
					<Card>
						<BlockStack gap="400">
							<Text variant="headingLg" as="h2">
								Welcome to the Checkout Rewards App
							</Text>
							<Text variant="bodyMd" as="p">
								This app allows you to reward customers with points for
								purchases and let them redeem those points for discounts at
								checkout.
							</Text>
						</BlockStack>
					</Card>
				</Layout.Section>

				{/* App Overview Card */}
				<Layout.Section>
					<Card>
						<BlockStack gap="400">
							<InlineStack align="space-between">
								<Text variant="headingMd" as="h3">
									📋 How the App Works
								</Text>
								<Button
									plain
									onClick={() => setOverviewOpen(!overviewOpen)}
									icon={overviewOpen ? ChevronUpIcon : ChevronDownIcon}
								/>
							</InlineStack>
							<Collapsible
								open={overviewOpen}
								id="overview-collapsible"
								transition={{
									duration: "200ms",
									timingFunction: "ease-in-out",
								}}
							>
								<BlockStack gap="300">
									<Divider />
									<Text variant="bodyMd" as="p">
										<strong>Customer Experience:</strong>
									</Text>
									<Text variant="bodyMd" as="p">
										• Customers earn points automatically when they make
										purchases
									</Text>
									<Text variant="bodyMd" as="p">
										• At checkout, logged-in customers can see their point
										balance
									</Text>
									<Text variant="bodyMd" as="p">
										• If they have enough points, they can redeem them for a
										discount
									</Text>
									<Text variant="bodyMd" as="p">
										• After purchase, customers see their updated point balance
										on the thank you page
									</Text>
								</BlockStack>
							</Collapsible>
						</BlockStack>
					</Card>
				</Layout.Section>

				{/* Quick Setup Guide */}
				<Layout.Section>
					<Card>
						<BlockStack gap="400">
							<InlineStack align="space-between">
								<Text variant="headingMd" as="h3">
									🚀 Quick Setup Guide
								</Text>
								<Button
									plain
									onClick={() => setQuickSetupOpen(!quickSetupOpen)}
									icon={quickSetupOpen ? ChevronUpIcon : ChevronDownIcon}
								/>
							</InlineStack>
							<Collapsible
								open={quickSetupOpen}
								id="quick-setup-collapsible"
								transition={{
									duration: "200ms",
									timingFunction: "ease-in-out",
								}}
							>
								<BlockStack gap="300">
									<Divider />
									<Text variant="bodyMd" as="p">
										<strong>Recommended setup order:</strong>
									</Text>
									<Text variant="bodyMd" as="p">
										1.{" "}
										<Link onClick={() => navigate("/reward-points")}>
											Configure reward points
										</Link>{" "}
										- Set your point earning rate
									</Text>
									<Text variant="bodyMd" as="p">
										2.{" "}
										<Link onClick={() => navigate("/discounts")}>
											Create discount codes
										</Link>{" "}
										- Set up your first redemption offer
									</Text>
									<Text variant="bodyMd" as="p">
										3. Test the checkout experience with a customer account
									</Text>
									<Text variant="bodyMd" as="p">
										4. Use{" "}
										<Link onClick={() => navigate("/customers")}>
											customer management
										</Link>{" "}
										to monitor and adjust points as needed
									</Text>
								</BlockStack>
							</Collapsible>
						</BlockStack>
					</Card>
				</Layout.Section>

				{/* Customer Management Card */}
				<Layout.Section>
					<Card>
						<BlockStack gap="400">
							<InlineStack align="space-between">
								<Text variant="headingMd" as="h3">
									👥 Customer Management
								</Text>
								<Button
									plain
									onClick={() => setCustomersOpen(!customersOpen)}
									icon={customersOpen ? ChevronUpIcon : ChevronDownIcon}
								/>
							</InlineStack>
							<Collapsible
								open={customersOpen}
								id="customers-collapsible"
								transition={{
									duration: "200ms",
									timingFunction: "ease-in-out",
								}}
							>
								<BlockStack gap="300">
									<Divider />
									<Text variant="bodyMd" as="p">
										View and manually adjust customer reward point balances.
									</Text>
									<Text variant="bodyMd" as="p">
										<strong>Features:</strong>
									</Text>
									<Text variant="bodyMd" as="p">
										• View all customers with their current point balances
									</Text>
									<Text variant="bodyMd" as="p">
										• Click on any point value to edit it directly
									</Text>
									<Text variant="bodyMd" as="p">
										• Add or remove points for returns or exchanges
									</Text>

									<Text variant="bodyMd" as="p">
										<strong>Use cases:</strong>
									</Text>
									<Text variant="bodyMd" as="p">
										• Award bonus points for special promotions
									</Text>
									<Text variant="bodyMd" as="p">
										• Adjust points for returns or customer service issues
									</Text>
									<Text variant="bodyMd" as="p">
										• Manually award points for non-purchase activities
									</Text>
									<Box paddingBlockStart="300">
										<Button
											onClick={() => navigate("/customers")}
											variant="primary"
										>
											Manage Customer Points
										</Button>
									</Box>
								</BlockStack>
							</Collapsible>
						</BlockStack>
					</Card>
				</Layout.Section>

				{/* Discounts Management Card */}
				<Layout.Section>
					<Card>
						<BlockStack gap="400">
							<InlineStack align="space-between">
								<Text variant="headingMd" as="h3">
									💸 Discount Management
								</Text>
								<Button
									plain
									onClick={() => setDiscountsOpen(!discountsOpen)}
									icon={discountsOpen ? ChevronUpIcon : ChevronDownIcon}
								/>
							</InlineStack>
							<Collapsible
								open={discountsOpen}
								id="discounts-collapsible"
								transition={{
									duration: "200ms",
									timingFunction: "ease-in-out",
								}}
							>
								<BlockStack gap="300">
									<Divider />
									<Text variant="bodyMd" as="p">
										Create percentage-based discount codes that customers can
										redeem with points.
									</Text>
									<Text variant="bodyMd" as="p">
										<strong>How to create a discount:</strong>
									</Text>
									<Text variant="bodyMd" as="p">
										• Enter a descriptive title for your discount
									</Text>
									<Text variant="bodyMd" as="p">
										• Set a unique discount code (auto-generated but editable)
									</Text>
									<Text variant="bodyMd" as="p">
										• Choose the discount percentage (e.g., 10% off)
									</Text>
									<Text variant="bodyMd" as="p">
										• Set how many points are required to redeem this discount
									</Text>
									<Text variant="bodyMd" as="p">
										• Optionally set start and end dates for the promotion
									</Text>
									<Text variant="bodyMd" as="p">
										<strong>Important:</strong> The discount code will be
										automatically applied at checkout when customers redeem
										their points.
									</Text>
									<Box paddingBlockStart="300">
										<Button
											onClick={() => navigate("/discounts")}
											variant="primary"
										>
											Create Discount Code
										</Button>
									</Box>
								</BlockStack>
							</Collapsible>
						</BlockStack>
					</Card>
				</Layout.Section>

				{/* Reward Points Configuration Card */}
				<Layout.Section>
					<Card>
						<BlockStack gap="400">
							<InlineStack align="space-between">
								<Text variant="headingMd" as="h3">
									🏆 Reward Points Configuration
								</Text>
								<Button
									plain
									onClick={() => setRewardPointsOpen(!rewardPointsOpen)}
									icon={rewardPointsOpen ? ChevronUpIcon : ChevronDownIcon}
								/>
							</InlineStack>
							<Collapsible
								open={rewardPointsOpen}
								id="reward-points-collapsible"
								transition={{
									duration: "200ms",
									timingFunction: "ease-in-out",
								}}
							>
								<BlockStack gap="300">
									<Divider />
									<Text variant="bodyMd" as="p">
										Set how many points customers earn per currency unit spent.
									</Text>
									<Text variant="bodyMd" as="p">
										<strong>How to use:</strong>
									</Text>
									<Text variant="bodyMd" as="p">
										• Set the number of points customers will receive (e.g., 1
										point)
									</Text>
									<Text variant="bodyMd" as="p">
										• Set the currency value that earns those points (e.g., for
										every $1 spent)
									</Text>
									<Text variant="bodyMd" as="p">
										• Example: "1 point per $1 spent" means a $50 purchase earns
										50 points
									</Text>
									<Text variant="bodyMd" as="p">
										Changes apply to all future purchases. The system
										automatically awards points when customers complete their
										orders.
									</Text>
									<Box paddingBlockStart="300">
										<Button
											onClick={() => navigate("/reward-points")}
											variant="primary"
										>
											Configure Reward Points
										</Button>
									</Box>
								</BlockStack>
							</Collapsible>
						</BlockStack>
					</Card>
				</Layout.Section>
			</Layout>
		</Page>
	);
}
