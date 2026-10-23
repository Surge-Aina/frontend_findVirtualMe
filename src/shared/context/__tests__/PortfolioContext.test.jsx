import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";
import { PortfolioProvider, usePortfolio } from "../PortfolioContext";

jest.mock("axios");

function OwnerProbe() {
  const { portfolioOwner, isOwnerReady, setPortfolioOwner } = usePortfolio();
  return (
    <div>
      <span data-testid="ready">{String(isOwnerReady)}</span>
      <span data-testid="name">{portfolioOwner.name}</span>
      <span data-testid="email">{portfolioOwner.email}</span>
      <button
        type="button"
        onClick={() => setPortfolioOwner({ id: "user-1", name: "", email: "" })}
      >
        by id
      </button>
      <button
        type="button"
        onClick={() => setPortfolioOwner({ id: "user-2", name: "Known", email: "" })}
      >
        named owner
      </button>
      <button
        type="button"
        onClick={() => setPortfolioOwner({ id: null, name: "Pat", email: "" })}
      >
        name only
      </button>
      <button
        type="button"
        onClick={() =>
          setPortfolioOwner({ id: null, name: "Pat", email: "pat@example.com" })
        }
      >
        name and email
      </button>
    </div>
  );
}

describe("PortfolioProvider owner lookup", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  it("loads a public profile and does not keep another user's email", async () => {
    const user = userEvent.setup();
    axios.get.mockResolvedValueOnce({
      data: {
        user: {
          id: "user-1",
          displayName: "Ada Lovelace",
          username: "ada",
          email: "ada@example.com",
        },
      },
    });

    render(
      <PortfolioProvider>
        <OwnerProbe />
      </PortfolioProvider>
    );

    expect(screen.getByTestId("ready")).toHaveTextContent("false");
    await user.click(screen.getByRole("button", { name: "by id" }));

    await waitFor(() => {
      expect(screen.getByTestId("name")).toHaveTextContent("Ada Lovelace");
    });
    expect(screen.getByTestId("ready")).toHaveTextContent("true");
    expect(screen.getByTestId("email")).toHaveTextContent("");
    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.get).toHaveBeenCalledWith(
      expect.stringMatching(/\/api\/users\/public\/user-1$/)
    );
  });

  it("falls back to GET /api/users/:id when the public route 404s", async () => {
    const user = userEvent.setup();
    axios.get.mockRejectedValueOnce({ response: { status: 404 } });
    axios.get.mockResolvedValueOnce({
      data: {
        user: {
          id: "user-1",
          firstName: "Grace",
          lastName: "Hopper",
          email: "grace@example.com",
        },
      },
    });

    render(
      <PortfolioProvider>
        <OwnerProbe />
      </PortfolioProvider>
    );

    await user.click(screen.getByRole("button", { name: "by id" }));

    await waitFor(() => {
      expect(screen.getByTestId("name")).toHaveTextContent("Grace Hopper");
    });
    expect(screen.getByTestId("email")).toHaveTextContent("");
    expect(screen.getByTestId("ready")).toHaveTextContent("true");
    expect(axios.get).toHaveBeenNthCalledWith(
      1,
      expect.stringMatching(/\/api\/users\/public\/user-1$/)
    );
    expect(axios.get).toHaveBeenNthCalledWith(
      2,
      expect.stringMatching(/\/api\/users\/user-1$/)
    );
  });

  it("is ready from an owner id and name without an email, and does not fetch", async () => {
    const user = userEvent.setup();

    render(
      <PortfolioProvider>
        <OwnerProbe />
      </PortfolioProvider>
    );

    await user.click(screen.getByRole("button", { name: "named owner" }));

    await waitFor(() => {
      expect(screen.getByTestId("ready")).toHaveTextContent("true");
    });
    expect(screen.getByTestId("email")).toHaveTextContent("");
    expect(axios.get).not.toHaveBeenCalled();
  });

  it("still requires both name and email when there is no owner id", async () => {
    const user = userEvent.setup();

    render(
      <PortfolioProvider>
        <OwnerProbe />
      </PortfolioProvider>
    );

    await user.click(screen.getByRole("button", { name: "name only" }));
    await waitFor(() => {
      expect(screen.getByTestId("ready")).toHaveTextContent("false");
    });

    await user.click(screen.getByRole("button", { name: "name and email" }));
    await waitFor(() => {
      expect(screen.getByTestId("ready")).toHaveTextContent("true");
    });
    expect(axios.get).not.toHaveBeenCalled();
  });
});
