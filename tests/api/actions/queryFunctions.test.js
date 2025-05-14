import { describe, it, expect, vi } from "vitest";
import { run } from "../../../api/actions/queryFunctions";

describe("queryFunctions", () => {
	it("should find and return a function ID", async () => {
		// mocks
		const mockFunctionId = "gid://shopify/Function/8675309";
		const mockLogger = { info: vi.fn(), error: vi.fn() };
		const mockGraphql = vi.fn().mockResolvedValue({
			shopifyFunctions: {
				nodes: [{ apiType: "discount", id: mockFunctionId }],
			},
		});

		// mock
		const mockConnections = {
			shopify: {
				forShopId: vi.fn().mockResolvedValue({ graphql: mockGraphql }),
			},
		};

		const result = await run({
			params: { shopId: "test-shop" },
			logger: mockLogger,
			connections: mockConnections,
		});

		expect(result).toBe(mockFunctionId);
	});


});
