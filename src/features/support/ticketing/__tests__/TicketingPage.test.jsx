/*
 * @fileoverview Full test suite for TicketingPage.jsx
 * Tests:
 *  - Successful GET request renders tickets visibly
 *  - Handles loading & error state gracefully
 */

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import axios from "axios";
import TicketingPage from "@/features/support/ticketing/TicketingPage";

// mock axios globally
jest.mock("axios");

// sample data (3 visible tickets)
const sampleTickets = [
  {
    ticketID: "T00001",
    requestType: "Bug",
    name: "Alice",
    email: "a@ex.com",
    createdAt: new Date("2025-01-01T10:00:00.000Z").toISOString(),
    status: "New",
    priority: "High",
    message: "Button broken",
    replies: [],
  },
  {
    ticketID: "T00002",
    requestType: "Feature",
    name: "Bob",
    email: "b@ex.com",
    createdAt: new Date("2025-01-02T10:00:00.000Z").toISOString(),
    status: "In Progress",
    priority: "Normal",
    message: "Add export",
    replies: [],
  },
  {
    ticketID: "T00003",
    requestType: "Support",
    name: "Charlie",
    email: "c@ex.com",
    createdAt: new Date("2025-01-03T10:00:00.000Z").toISOString(),
    status: "Completed",
    priority: "Low",
    message: "How to login",
    replies: [],
  },
];

describe("TicketingPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // 1. Basic rendering test
  it("loads and displays tickets on successful GET", async () => {
    // mock axios.get success
    axios.get.mockResolvedValueOnce({ data: sampleTickets });

    render(<TicketingPage />);

    // Should show loading first
    expect(screen.getByText(/Loading…/i)).toBeInTheDocument();

    // Wait until tickets appear (loading gone)
    await waitFor(() =>
      expect(screen.queryByText(/Loading…/i)).not.toBeInTheDocument()
    );

    // Header + Filter button
    expect(screen.getByText("Ticket Board")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Filter: On/i })
    ).toBeInTheDocument();

    // Should render 3 ticket cards
    const cards = screen.getAllByRole("article", { name: /Ticket card/i });
    expect(cards).toHaveLength(3);

    // === Assert visible texts (without expanding Details) ===
    // IDs
    ["T00001", "T00002", "T00003"].forEach((id) => {
      expect(screen.getByText(new RegExp(id))).toBeInTheDocument();
    });

    // Request types
    expect(screen.getByText("Bug")).toBeInTheDocument();
    expect(screen.getByText("Feature")).toBeInTheDocument();
    expect(screen.getByText("Support")).toBeInTheDocument();

    // Status pills
    expect(screen.getByText(/Status:\s*New/i)).toBeInTheDocument();
    expect(screen.getByText(/Status:\s*In Progress/i)).toBeInTheDocument();
    expect(screen.getByText(/Status:\s*Completed/i)).toBeInTheDocument();

    // Priority labels
    expect(screen.getByText(/Priority:\s*High/i)).toBeInTheDocument();
    expect(screen.getByText(/Priority:\s*Normal/i)).toBeInTheDocument();
    expect(screen.getByText(/Priority:\s*Low/i)).toBeInTheDocument();

    // Names
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
    expect(screen.getByText("Charlie")).toBeInTheDocument();
  });

  // 2. Error state test
  it("handles GET error gracefully", async () => {
    axios.get.mockRejectedValueOnce(new Error("Network Error"));
    render(<TicketingPage />);

    await waitFor(() =>
      expect(
        screen.getByText(/Failed to fetch tickets/i)
      ).toBeInTheDocument()
    );
  });

  // 3. Filter toggle behavior test
  it("toggles splitByStatus correctly", async () => {
    axios.get.mockResolvedValueOnce({ data: sampleTickets });
    render(<TicketingPage />);

    await waitFor(() =>
      expect(screen.queryByText(/Loading…/i)).not.toBeInTheDocument()
    );

    const toggle = screen.getByRole("button", { name: /Filter: On/i });
    expect(toggle).toBeInTheDocument();

    // First click → split view (3 columns)
    await toggle.click();
    expect(toggle).toHaveAttribute("aria-pressed", "true");

    // Second click → back to single view
    await toggle.click();
    expect(toggle).toHaveAttribute("aria-pressed", "false");
  });
});
