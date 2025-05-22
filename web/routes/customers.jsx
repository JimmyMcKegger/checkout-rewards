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
					<Card background="bg-surface-secondary" padding="0">
						{/* use Autocomponents to build UI quickly: https://docs.gadget.dev/guides/frontend/autocomponents  */}
						<AutoTable
							model={api.shopifyCustomer}
							onClick={(row) => console.log(row)}
							columns={[
								{
									header: "Customer name",
									render: ({ record }) => {
										return (
											<div>
												{record?.firstName?.[0]?.toUpperCase() +
													". " +
													record?.lastName}
											</div>
										);
									},
								},
								"email",
								"points",
							]}
							sortBy="updatedAt"
							sortDirection="desc"
							live />
					</Card>
				</Layout.Section>
			</Layout>
		</Page>
	);
}
