import { useEffect, useState, useCallback } from "react";
import {
	reactExtension,
	Banner,
	BlockStack,
	Checkbox,
	Text,
	useApi,
	useCustomer,
	useTranslate,
	useAppMetafields,
	useInstructions,
	useApplyDiscountCodeChange,
	useApplyCartLinesChange,
	useCartLines,
	Heading,
	Image,
	Button,
	Divider,
	InlineLayout,
} from "@shopify/ui-extensions-react/checkout";

// TODO: move this above reductions so the code doesn't shift layout
const target = "purchase.checkout.reductions.render-after";

export default reactExtension(target, () => <Extension />);

function Extension() {
	const translate = useTranslate();
	const { query } = useApi();
	const customer = useCustomer();
	const cartLines = useCartLines();
	const { discounts } = useInstructions() || {};
	const applyDiscountCodeChange = useApplyDiscountCodeChange();
	const applyCartLineChanges = useApplyCartLinesChange();

	// State management
	const [hasAddedDiscountCode, setHasAddedDiscountCode] = useState(false);
	const [customerPoints, setCustomerPoints] = useState(0);
	const [isLoading, setIsLoading] = useState(true);
	const [product, setProduct] = useState(null);
	const [isAddingToCart, setIsAddingToCart] = useState(false);
	const [productMetafieldValue, setProductMetafieldValue] = useState(null);
	const [isProductInCart, setIsProductInCart] = useState(false);

	// if customer isn't logged in return early
	const isLoggedIn = !!customer;

	if (!isLoggedIn) {
		return (
			<Banner title={translate("welcome")} status="info">
				<Text size="medium">{translate("notLoggedIn")}</Text>
			</Banner>
		);
	}

	// Get metafields
	const pointsMetafields = useAppMetafields({
		type: "customer",
		namespace: "rewards",
		key: "points",
	});

	const discountCodeMetafields = useAppMetafields({
		type: "shop",
		namespace: "checkout_rewards",
		key: "discount_code",
	});

	const productMetafields = useAppMetafields({
		type: "shop",
		namespace: "checkout_rewards",
		key: "freeGift",
	});

	// Extract customer points from metafields
	useEffect(() => {
		if (!customer || !pointsMetafields?.length) return;

		const customerId = customer.id;
		const metafield = pointsMetafields.find(
			({ target }) => `gid://shopify/Customer/${target.id}` === customerId
		);

		if (metafield?.metafield?.value) {
			setCustomerPoints(parseInt(metafield.metafield.value) || 0);
		}
	}, [customer, pointsMetafields]);

	// Extract product metafield value
	useEffect(() => {
		if (!productMetafields?.length) return;

		const value = productMetafields[0]?.metafield?.value;
		if (value) {
			setProductMetafieldValue(value);
		}
	}, [productMetafields]);

	// product data
	useEffect(() => {
		if (!productMetafieldValue) return;

		let isMounted = true;

		const fetchProduct = () => {
			query(
				`query getProduct($id: ID!) {
					product(id: $id) {
						id
						title
						images(first: 1) {
							nodes {
								id
								url
							}
						}
						variants(first: 1) {
							nodes {
								id
								title
								price {
									amount
									currencyCode
								}
							}
						}
					}
				}`,
				{
					variables: {
						id: productMetafieldValue,
					},
				}
			)
			.then(({ data }) => {
				if (isMounted && data?.product) {
					setProduct(data.product);
				}
			})
			.catch((error) => {
				console.error("Product fetch error:", error?.message || "Unknown error");
			});
		};

		fetchProduct();

		return () => {
			isMounted = false;
		};
	}, [productMetafieldValue, query]);

	// check if product is already in cart
	useEffect(() => {
		if (!product || !cartLines?.lines) {
			setIsProductInCart(false);
			return;
		}

		const productVariantId = product.variants?.nodes[0]?.id;
		const found = cartLines.lines.some(
			line => line.merchandise?.id === productVariantId
		);

		setIsProductInCart(found);
	}, [product, cartLines]);

	// loading when data is ready
	useEffect(() => {
		const dataIsReady =
			!customer ||
			(customer && pointsMetafields && pointsMetafields.length > 0);

		const productIsReady =
			!productMetafieldValue ||
			(productMetafieldValue && product);

		if (dataIsReady && productIsReady) {
			setIsLoading(false);
		}

		const timer = setTimeout(() => {
			setIsLoading(false);
		}, 3000);

		return () => clearTimeout(timer);
	}, [customer, pointsMetafields, productMetafieldValue, product]);

	// Predefined handlers using useCallback to avoid inline functions
	const handleCheckboxChange = useCallback((newValue) => {
		setHasAddedDiscountCode(newValue);

		applyDiscountCodeChange({
			code: discountCodeMetafields[0]?.metafield?.value,
			type: newValue ? "addDiscountCode" : "removeDiscountCode",
		});
	}, [applyDiscountCodeChange, discountCodeMetafields]);

	const handleAddToCart = useCallback(() => {
		if (!product || isAddingToCart) return;

		setIsAddingToCart(true);

		applyCartLineChanges({
			type: "addCartLines",
			lines: [
				{
					merchandiseId: product.variants.nodes[0].id,
					quantity: 1,
				},
			],
		})
		.catch((error) => {
			console.error("Cart update error:", error?.message || "Unknown error");
		})
		.finally(() => {
			setIsAddingToCart(false);
		});
	}, [product, isAddingToCart, applyCartLineChanges]);

	// rendering values
	const customerName = customer?.firstName || customer?.email || "";
	const welcomeMessage = `${translate("welcomeBackMessage")}, ${customerName}!`;
	const shouldShowProduct = product && !isProductInCart;

	// Loading state
	if (isLoading) {
		return (
			<BlockStack spacing="loose">
				<Banner title="Checkout Rewards">
					<Text>Loading rewards...</Text>
				</Banner>
			</BlockStack>
		);
	}

	// renders for logged in customers (rewards and product)
	return (
		<BlockStack spacing="loose">
			{/* Rewards */}
			<BlockStack border="dotted" padding="tight">
				<Banner title="Checkout Rewards">
					<Text>{welcomeMessage}</Text>
				</Banner>
				<Text>You have {customerPoints} points!</Text>

				{discounts?.canUpdateDiscountCodes ? (
					<Checkbox
						checked={hasAddedDiscountCode}
						onChange={handleCheckboxChange}
					>
						{translate("offerDiscount")}
					</Checkbox>
				) : (
					<Banner status="warning">
						Checkout Rewards discounts are unavailable
					</Banner>
				)}
			</BlockStack>

			{/* Product section - if product exists and is not in cart */}
			{shouldShowProduct && (
				<BlockStack spacing="loose">
					<Divider />
					<Heading level={2}>You might also like</Heading>
					<InlineLayout
						spacing="base"
						columns={[64, "fill", "auto"]}
						blockAlignment="center"
					>
						<Image
							border="base"
							borderWidth="base"
							borderRadius="loose"
							source={product.images.nodes[0]?.url}
							description={product.title}
							aspectRatio={1}
						/>
						<BlockStack spacing="none">
							<Text size="medium" fontWeight="bold">
								{product.title}
							</Text>
							<Text size="medium" appearance="subdued">
								{product.variants.nodes[0]?.price.amount} {product.variants.nodes[0]?.price.currencyCode}
							</Text>
						</BlockStack>
						<Button
							kind="secondary"
							disabled={isAddingToCart}
							onPress={handleAddToCart}
						>
							Add
						</Button>
					</InlineLayout>
				</BlockStack>
			)}
		</BlockStack>
	);
}
