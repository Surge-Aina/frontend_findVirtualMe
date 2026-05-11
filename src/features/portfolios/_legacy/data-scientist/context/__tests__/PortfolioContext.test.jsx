import { render, waitFor } from "@testing-library/react";
import { PortfolioProvider, usePortfolio } from "../PortfolioContext";
import { portfolioAPI } from "../../utils/api";

// ---- MOCKS ----
jest.mock("../../utils/api", () => ({
  portfolioAPI: {
    getPortfolio: jest.fn(),
    addPortfolioItem: jest.fn(),
    updatePortfolioItem: jest.fn(),
  },
}));

// Helper component to extract values from context
function TestConsumer({ callback }) {
  const ctx = usePortfolio();
  callback(ctx);
  return null;
}

describe("PortfolioContext", () => {
  let contextValue;

  beforeEach(() => {
    jest.clearAllMocks();
    contextValue = null;
    console.error = jest.fn();
  });

  const renderContext = () =>
    render(
      <PortfolioProvider>
        <TestConsumer callback={(v) => (contextValue = v)} />
      </PortfolioProvider>
    );

  test("provides default context values", async () => {
    portfolioAPI.getPortfolio.mockResolvedValue({});

    renderContext();

    expect(contextValue.portfolio).toEqual({});
    expect(contextValue.loading).toBe(true);
    expect(contextValue.error).toBe(null);
    expect(typeof contextValue.addPortfolioItem).toBe("function");
    expect(typeof contextValue.updatePortfolioItem).toBe("function");
    expect(typeof contextValue.refetch).toBe("function");
    expect(typeof contextValue.forceRefresh).toBe("function");

    await waitFor(() => {
      expect(contextValue.loading).toBe(false);
    });
  });

  test("fetches portfolio data on mount", async () => {
    const mockPortfolio = { projects: [], skills: [] };
    portfolioAPI.getPortfolio.mockResolvedValue(mockPortfolio);

    renderContext();

    await waitFor(() => {
      expect(portfolioAPI.getPortfolio).toHaveBeenCalled();
      expect(contextValue.portfolio).toEqual(mockPortfolio);
      expect(contextValue.loading).toBe(false);
      expect(contextValue.error).toBe(null);
    });
  });

  test("handles fetch error correctly", async () => {
    portfolioAPI.getPortfolio.mockRejectedValue(new Error("Network error"));

    renderContext();

    await waitFor(() => {
      expect(contextValue.loading).toBe(false);
      expect(contextValue.error).toBe("Failed to load portfolio data. Please try again later.");
    });
  });

  test("refetch reloads portfolio data", async () => {
    const initialPortfolio = { projects: [] };
    const updatedPortfolio = { projects: [{ id: 1 }] };

    portfolioAPI.getPortfolio
      .mockResolvedValueOnce(initialPortfolio)
      .mockResolvedValueOnce(updatedPortfolio);

    renderContext();

    await waitFor(() => {
      expect(contextValue.portfolio).toEqual(initialPortfolio);
    });

    await contextValue.refetch();

    await waitFor(() => {
      expect(contextValue.portfolio).toEqual(updatedPortfolio);
      expect(portfolioAPI.getPortfolio).toHaveBeenCalledTimes(2);
    });
  });

  test("forceRefresh reloads portfolio data", async () => {
    const initialPortfolio = { projects: [] };
    const refreshedPortfolio = { projects: [{ id: 2 }] };

    portfolioAPI.getPortfolio
      .mockResolvedValueOnce(initialPortfolio)
      .mockResolvedValueOnce(refreshedPortfolio);

    renderContext();

    await waitFor(() => {
      expect(contextValue.portfolio).toEqual(initialPortfolio);
    });

    await contextValue.forceRefresh();

    await waitFor(() => {
      expect(contextValue.portfolio).toEqual(refreshedPortfolio);
    });
  });

  test("addPortfolioItem adds item to correct section", async () => {
    const initialPortfolio = { projects: [] };
    const newItem = { id: 1, title: "New Project", order: 0 };

    portfolioAPI.getPortfolio.mockResolvedValue(initialPortfolio);
    portfolioAPI.addPortfolioItem.mockResolvedValue(newItem);

    renderContext();

    await waitFor(() => {
      expect(contextValue.portfolio).toEqual(initialPortfolio);
    });

    const result = await contextValue.addPortfolioItem({
      section: "projects",
      title: "New Project",
    });

    expect(result.success).toBe(true);
    expect(portfolioAPI.addPortfolioItem).toHaveBeenCalledWith({
      section: "projects",
      title: "New Project",
    });

    await waitFor(() => {
      expect(contextValue.portfolio.projects).toContainEqual(newItem);
    });
  });

  test("addPortfolioItem handles error", async () => {
    const initialPortfolio = { projects: [] };
    const error = { response: { data: { message: "Validation failed" } } };

    portfolioAPI.getPortfolio.mockResolvedValue(initialPortfolio);
    portfolioAPI.addPortfolioItem.mockRejectedValue(error);

    renderContext();

    await waitFor(() => {
      expect(contextValue.portfolio).toEqual(initialPortfolio);
    });

    const result = await contextValue.addPortfolioItem({
      section: "projects",
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Validation failed");
  });

  test("updatePortfolioItem updates item in correct section", async () => {
    const initialPortfolio = {
      projects: [{ id: 1, title: "Old Title", order: 0 }],
    };
    const updatedItem = { id: 1, title: "New Title", order: 0 };

    portfolioAPI.getPortfolio.mockResolvedValue(initialPortfolio);
    portfolioAPI.updatePortfolioItem.mockResolvedValue(updatedItem);

    renderContext();

    await waitFor(() => {
      expect(contextValue.portfolio).toEqual(initialPortfolio);
    });

    const result = await contextValue.updatePortfolioItem(1, { title: "New Title" });

    expect(result.success).toBe(true);
    expect(portfolioAPI.updatePortfolioItem).toHaveBeenCalledWith(1, { title: "New Title" });

    await waitFor(() => {
      expect(contextValue.portfolio.projects[0].title).toBe("New Title");
    });
  });

  test("updatePortfolioItem handles error", async () => {
    const initialPortfolio = {
      projects: [{ id: 1, title: "Old Title", order: 0 }],
    };
    const error = { response: { data: { message: "Item not found" } } };

    portfolioAPI.getPortfolio.mockResolvedValue(initialPortfolio);
    portfolioAPI.updatePortfolioItem.mockRejectedValue(error);

    renderContext();

    await waitFor(() => {
      expect(contextValue.portfolio).toEqual(initialPortfolio);
    });

    const result = await contextValue.updatePortfolioItem(999, { title: "New Title" });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Item not found");
  });

  test("updatePortfolioItem returns original portfolio if section not found", async () => {
    const initialPortfolio = {
      projects: [{ id: 1, title: "Project", order: 0 }],
    };

    portfolioAPI.getPortfolio.mockResolvedValue(initialPortfolio);
    portfolioAPI.updatePortfolioItem.mockResolvedValue({ id: 999, title: "Updated" });

    renderContext();

    await waitFor(() => {
      expect(contextValue.portfolio).toEqual(initialPortfolio);
    });

    const result = await contextValue.updatePortfolioItem(999, { title: "Updated" });

    expect(result.success).toBe(true);
    // Portfolio should remain unchanged since item with id 999 doesn't exist
    expect(contextValue.portfolio.projects).toEqual(initialPortfolio.projects);
  });

  test("usePortfolio throws error when used outside provider", () => {
    expect(() => {
      render(<TestConsumer callback={() => {}} />);
    }).toThrow("usePortfolio must be used within a PortfolioProvider");
  });

  test("items are sorted by order after adding", async () => {
    const initialPortfolio = { projects: [{ id: 1, order: 1 }] };
    const newItem = { id: 2, order: 0 };

    portfolioAPI.getPortfolio.mockResolvedValue(initialPortfolio);
    portfolioAPI.addPortfolioItem.mockResolvedValue(newItem);

    renderContext();

    await waitFor(() => {
      expect(contextValue.portfolio).toEqual(initialPortfolio);
    });

    await contextValue.addPortfolioItem({
      section: "projects",
      order: 0,
    });

    await waitFor(() => {
      expect(contextValue.portfolio.projects).toHaveLength(2);
      expect(contextValue.portfolio.projects[0].order).toBe(0);
      expect(contextValue.portfolio.projects[1].order).toBe(1);
    });
  });
});

