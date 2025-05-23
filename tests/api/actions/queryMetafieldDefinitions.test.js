import { describe, it, expect, vi } from "vitest";
import { run } from "../../../api/actions/queryMetafieldDefinitions";

describe("queryMetafieldDefinitions test", () => {
	it("should find and return metafield definitions", async () => {
		// mocks
		const mockMetafieldDefinitionNode = {
			id: "gid://shopify/MetafieldDefinition/12345",
			name: "TEST CHECKOUT REWARDS",
			namespace: "test_rewards",
			key: "test_points",
			ownerType: "CUSTOMER",
			type: { name: "integer" },
			validations: [],
		};
		const mockLogger = { info: vi.fn(), error: vi.fn() };
		const mockGraphql = vi.fn().mockResolvedValue({
			metafieldDefinitions: {
				edges: [{ node: mockMetafieldDefinitionNode }],
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
				namespace: "test_rewards",
				key: "test_points",
				ownerType: "CUSTOMER",
			},
			logger: mockLogger,
			connections: mockConnections,
		});

		expect(result).toEqual([mockMetafieldDefinitionNode]);
		expect(mockConnections.shopify.forShopId).toHaveBeenCalledWith(
			"gid://shopify/Shop/123"
		);
		expect(mockGraphql).toHaveBeenCalledWith(
			expect.stringContaining("getMetafieldDefinitions"), // Check if the correct query is called
			{
				namespace: "test_rewards",
				key: "test_points",
				ownerType: "CUSTOMER",
			}
		);
	});

	it("should return undefined if no metafield definitions are found", async () => {
		const mockLogger = { info: vi.fn(), error: vi.fn() };
		const mockGraphql = vi.fn().mockResolvedValue({
			metafieldDefinitions: {
				edges: [], // No metafields found
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
				namespace: "test_rewards",
				key: "test_points",
				ownerType: "CUSTOMER",
			},
			logger: mockLogger,
			connections: mockConnections,
		});

		expect(result).toBeUndefined();
	});

	it("should throw an error if the request fails", async () => {
		const mockLogger = { info: vi.fn(), error: vi.fn() };
		const mockGraphql = vi
			.fn()
			.mockRejectedValue(new Error("GraphQL Error"));

		const mockConnections = {
			shopify: {
				currentShopId: "gid://shopify/Shop/456",
				forShopId: vi.fn().mockResolvedValue({ graphql: mockGraphql }),
			},
		};

		await expect(
			run({
				params: {
					namespace: "custom",
					key: "error_metafield",
					ownerType: "ORDER",
				},
				logger: mockLogger,
				connections: mockConnections,
			})
		).rejects.toThrow("GraphQL Error");
		expect(mockLogger.error).toHaveBeenCalled();
	});
});
