import {
	useFindFirst,
	useFindMany,
	useActionForm,
	Controller,
} from "@gadgetinc/react";
import {
	Banner,
	FooterHelp,
	Layout,
	Link,
	Page,
	Select,
	Text,
	Spinner,
	Form,
	Button,
	FormLayout,
	SkeletonDisplayText,
} from "@shopify/polaris";
import { api } from "../api";
import { useEffect, useState } from "react";
import { useNavigate } from "@remix-run/react";

const FreeGiftForm = ({ products, shop }) => {

  // check for missing data
  if (!shop || !shop.id) {
    return <Banner title="Shop data not available" tone="critical">no shop</Banner>;
  }

	// handles form state and submission
	const { submit, control, formState, error, setValue, watch } = useActionForm(
		api.shopifyShop.savePrePurchaseProduct,
		{
			findBy: shop.id,
			select: {
				id: true,
			},

			send: ["id", "productId"],
		}
	);

	// watch for updates to the form state
	const updateProductId = watch("shopifyShop.checkoutRewardsProduct");

	// save product id in form state
	useEffect(() => {
		setValue("productId", updateProductId);
	}, [updateProductId]);

	return (
		<Form onSubmit={submit}>
			<FormLayout>
				{formState?.isSubmitSuccessful && (
					<Banner title="Free Gift Product Saved!" tone="success" />
				)}
				{error && (
					<Banner title="Error saving free gift form" tone="critical">
						{error.message}
					</Banner>
				)}
				{formState?.isLoading ? (
					<SkeletonDisplayText size="large" />
				) : (
					<Controller
						name="shopifyShop.checkoutRewardsProduct"
						control={control}
						required
						render={({ field }) => {
							const { ref, ...fieldProps } = field;
							return (
								<Select
									label="Free Gift Product"
									placeholder="-No Product Selected-"
									options={products}
									disabled={formState.isLoading}
									{...fieldProps}
								/>
							);
						}}
					/>
				)}
				<Button submit disabled={formState.isSubmitting} variants="primary">
					Save
				</Button>
			</FormLayout>
		</Form>
	);
};

export default function FreeGift() {
	const navigate = useNavigate();

	// use state to handle selected product options
	const [productOptions, setProductOptions] = useState([]);

	// use gadget hooks to fetch products as options
	const {
		data: products,
		fetching: productsFetching,
		error: productsError,
	} = useFindMany(api.shopifyProduct, {
		select: {
				id: true,
				title: true,
		},
	});

	// get the shopId
	const [{ data: shopData, fetching: shopFetching, error: shopFetchingError }] =
		useFindFirst(api.shopifyShop, {
			select: {
				id: true,
			},
		});

	// useEffect to build product options for the select component
  useEffect(() => {
    if (products) {
      const options = products.map((product) => ({
        value: `gid://shopify/Product/${product.id}`,
        label: product.title,
      }));

      setProductOptions(options);
    }
  }, [products]);

	return (
		<Page
			title="Checkout rewards Free Gift"
			backAction={{
				content: "Back",
				onAction: () => navigate("/"),
			}}
		>
			{productsFetching || shopFetching ? (
				<>
					<Spinner size="large" />
					<Text>{productOptions}</Text>
				</>
			) : (
				<Layout>
					{(productsError || shopFetchingError) && (
						<Layout.Section>
							<Banner title="Error loading data" status="critical">
								{productsError?.message || shopFetchingError?.message}
							</Banner>
						</Layout.Section>
					)}
					<Layout.Section>
						<FreeGiftForm products={productOptions} shop={shopData} />
					</Layout.Section>
					<Layout.Section>
						<FooterHelp>HELP</FooterHelp>
					</Layout.Section>
				</Layout>
			)}
		</Page>
	);
}
