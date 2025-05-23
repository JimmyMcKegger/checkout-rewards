import { describe, it, expect, vi } from "vitest";
import { run } from "../../../api/actions/createCustomerPointsMetafield";

describe("createCustomerPointsMetafield test", () => {
	it("should create the customer points metafield definition", async () => {
		// mocks
		const mockLogger = { info: vi.fn(), error: vi.fn() };
		const mockGraphql = vi.fn().mockResolvedValue({
			metafieldDefinitionCreate: {
				createdDefinition: {
					id: "gid://shopify/MetafieldDefinition/123",
					namespace: "test_rewards",
					key: "test_points",
				},
			},
		});

		const mockConnections = {
			shopify: {
				currentShopId: "gid://shopify/Shop/123",
				forShopId: vi.fn().mockResolvedValue({ graphql: mockGraphql }),
			},
		};

		const result = await run({
			params: {
				name: "Points",
				namespace: "test_rewards",
				key: "test_points",
				description: "Customer reward points",
				type: "number_integer",
				ownerType: "CUSTOMER",
				pin: true,
			},
			logger: mockLogger,
			connections: mockConnections,
		});

		expect(result).toEqual({
			metafieldDefinitionCreate: {
				createdDefinition: {
					id: "gid://shopify/MetafieldDefinition/123",
					namespace: "test_rewards",
					key: "test_points",
				},
			},
		});
	});
});
