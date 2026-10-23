import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";
import TicketingPage from "../TicketingPage";

jest.mock("axios");

describe("TicketingPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.alert = jest.fn();
    window.confirm = jest.fn(() => true);
  });

  it("fetches tickets on mount and renders the board", async () => {
    axios.get.mockResolvedValueOnce({
      data: [
        {
          ticketID: "T1",
          requestType: "Bug",
          name: "Ada",
          email: "a@b.com",
          createdAt: new Date().toISOString(),
          status: "New",
          priority: "Normal",
          message: "Hello",
          replies: [],
        },
      ],
    });

    render(<TicketingPage />);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    expect(axios.get).toHaveBeenCalledWith(
      expect.stringMatching(/\/api\/support$/),
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    expect(screen.getByText(/all \(1\)/i)).toBeInTheDocument();
    expect(screen.getByText("Ada")).toBeInTheDocument();
  });

  it("shows error message when fetch fails", async () => {
    const errSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    axios.get.mockRejectedValueOnce({
      response: { data: { error: "Server down" } },
    });

    try {
      render(<TicketingPage />);

      await waitFor(() => {
        expect(screen.getByText(/error: server down/i)).toBeInTheDocument();
      });
    } finally {
      errSpy.mockRestore();
    }
  });

  it("toggles split-by-status columns", async () => {
    const user = userEvent.setup();
    axios.get.mockResolvedValueOnce({
      data: [
        {
          ticketID: "T1",
          requestType: "Bug",
          name: "Ada",
          email: "a@b.com",
          createdAt: new Date().toISOString(),
          status: "New",
          priority: "Normal",
          message: "Hello",
          replies: [],
        },
      ],
    });

    render(<TicketingPage />);

    await waitFor(() => expect(screen.queryByText(/loading/i)).not.toBeInTheDocument());

    expect(screen.getByText(/all \(1\)/i)).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: /filter: on \(split by status\)/i })
    );

    expect(screen.getByText(/new \(1\)/i)).toBeInTheDocument();
    expect(screen.getByText(/in progress \(0\)/i)).toBeInTheDocument();
  });

  it("calls PUT when advancing status from New", async () => {
    const user = userEvent.setup();
    axios.get.mockResolvedValueOnce({
      data: [
        {
          ticketID: "T1",
          requestType: "Bug",
          name: "Ada",
          email: "a@b.com",
          createdAt: new Date().toISOString(),
          status: "New",
          priority: "Normal",
          message: "Hello",
          replies: [],
        },
      ],
    });
    axios.put.mockResolvedValueOnce({
      data: { status: "In Progress", completionTime: null },
    });

    render(<TicketingPage />);

    await waitFor(() => expect(screen.getByText(/start progress/i)).toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: /start progress/i }));

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith(
        expect.stringMatching(/\/api\/support\/T1$/),
        { status: "In Progress" },
        { headers: { "Content-Type": "application/json" } }
      );
    });
  });

  it("calls DELETE when deleting a ticket", async () => {
    const user = userEvent.setup();
    axios.get.mockResolvedValueOnce({
      data: [
        {
          ticketID: "T1",
          requestType: "Bug",
          name: "Ada",
          email: "a@b.com",
          createdAt: new Date().toISOString(),
          status: "New",
          priority: "Normal",
          message: "Hello",
          replies: [],
        },
      ],
    });
    axios.delete.mockResolvedValueOnce({});

    render(<TicketingPage />);

    await waitFor(() => expect(screen.getByRole("button", { name: /delete ticket/i })).toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: /delete ticket/i }));

    await waitFor(() => {
      expect(axios.delete).toHaveBeenCalledWith(
        expect.stringMatching(/\/api\/support\/T1$/),
        {
          headers: { "Content-Type": "application/json" },
        }
      );
    });
  });
});
