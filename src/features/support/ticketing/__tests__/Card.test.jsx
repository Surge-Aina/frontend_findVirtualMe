import React from "react";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Card from "@/features/support/ticketing/components/Card";

const baseTicket = {
  ticketID: "T00001",
  requestType: "Title",
  name: "john",
  email: "test@testmail.com",
  createdAt: new Date("2025-01-01T10:00:00.000Z").toISOString(),
  status: "New",
  priority: "Normal",
  message: "Here are the details!",
  completionTime: null,
  replies: [],
};

function renderCard(overrides = {}, handlers = {}) {
  const onEditStatus = handlers.onEditStatus || jest.fn();
  const onDelete = handlers.onDelete || jest.fn();
  const onAddReply = handlers.onAddReply || jest.fn();

  render(
    <Card
      ticket={{ ...baseTicket, ...overrides }}
      onEditStatus={onEditStatus}
      onDelete={onDelete}
      onAddReply={onAddReply}
    />
  );

  return { onEditStatus, onDelete, onAddReply };
}

describe("Card", () => {
  it("renders initial information correctly", () => {
    renderCard();

    const card = screen.getByRole("article", { name: /Ticket card/i });

    // Ticket ID chip (tolerate whitespace)
    expect(
      within(card).getByText(new RegExp(`Ticket ID\\s*:\\s*${baseTicket.ticketID}`, "i"))
    ).toBeInTheDocument();

    // Request type
    expect(within(card).getByText(baseTicket.requestType)).toBeInTheDocument();

    // Name & Email
    expect(within(card).getByText(/Name:/i)).toBeInTheDocument();
    expect(within(card).getByText(baseTicket.name)).toBeInTheDocument();
    expect(within(card).getByText(/Email:/i)).toBeInTheDocument();
    expect(within(card).getByText(baseTicket.email)).toBeInTheDocument();

    // Status & Priority (assert visible text)
    expect(within(card).getByText(/Status\s*:\s*New/i)).toBeInTheDocument();
    expect(within(card).getByText(/Priority\s*:\s*Normal/i)).toBeInTheDocument();

    // Details are hidden initially:
    // Use the heading that only exists inside the details panel,
    // not the button label "Description / Details"
    expect(
      within(card).queryByRole("heading", { name: /^Description$/i })
    ).not.toBeInTheDocument();
  });

  it("toggles details open and closed", async () => {
    renderCard();

    const card = screen.getByRole("article", { name: /Ticket card/i });
    const toggle = within(card).getByRole("button", { name: /Description \/ Details/i });

    // Open details
    await userEvent.click(toggle);
    // Now the inner details <h4> should exist
    expect(
      within(card).getByRole("heading", { name: /^Description$/i })
    ).toBeInTheDocument();
    expect(within(card).getByText("Here are the details!")).toBeInTheDocument();

    // Close details
    const closeBtn = within(card).getByRole("button", { name: /Close/i });
    await userEvent.click(closeBtn);
    expect(
      within(card).queryByRole("heading", { name: /^Description$/i })
    ).not.toBeInTheDocument();
  });

  it("shows 'No replies yet' when none; lists replies when present", async () => {
    // First render: no replies
    renderCard();
    const firstCard = screen.getAllByRole("article", { name: /Ticket card/i })[0];

    await userEvent.click(
      within(firstCard).getByRole("button", { name: /Description \/ Details/i })
    );
    expect(within(firstCard).getByText(/No replies yet/i)).toBeInTheDocument();

    // Second render: with replies
    const repliesTicket = {
      ...baseTicket,
      ticketID: "T00002",
      replies: ["First reply", "Second reply"],
    };
    render(
      <Card
        ticket={repliesTicket}
        onEditStatus={() => {}}
        onDelete={() => {}}
        onAddReply={() => {}}
      />
    );

    const secondCard = screen.getAllByRole("article", { name: /Ticket card/i })[1];
    await userEvent.click(
      within(secondCard).getByRole("button", { name: /Description \/ Details/i })
    );

    expect(within(secondCard).queryByText(/No replies yet/i)).not.toBeInTheDocument();
    expect(within(secondCard).getByText("First reply")).toBeInTheDocument();
    expect(within(secondCard).getByText("Second reply")).toBeInTheDocument();
  });

  it("submits a reply via onAddReply and clears the input", async () => {
    const onAddReply = jest.fn().mockResolvedValue(undefined);
    renderCard({}, { onAddReply });

    const card = screen.getByRole("article", { name: /Ticket card/i });
    await userEvent.click(
      within(card).getByRole("button", { name: /Description \/ Details/i })
    );

    const textarea = within(card).getByPlaceholderText(/Write a reply/i);
    await userEvent.type(textarea, "Thanks for the report!");
    const submit = within(card).getByRole("button", { name: /Reply/i });
    await userEvent.click(submit);

    await waitFor(() => expect(onAddReply).toHaveBeenCalledWith("Thanks for the report!"));
    expect(textarea).toHaveValue("");
  });

  it("calls onEditStatus and onDelete handlers", async () => {
    const onEditStatus = jest.fn();
    const onDelete = jest.fn();
    renderCard({}, { onEditStatus, onDelete });

    const card = screen.getByRole("article", { name: /Ticket card/i });

    await userEvent.click(within(card).getByRole("button", { name: /Start Progress/i }));
    expect(onEditStatus).toHaveBeenCalledTimes(1);

    await userEvent.click(within(card).getByRole("button", { name: /Delete Ticket/i }));
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it("hides reply form when status is Completed", async () => {
    renderCard({ status: "Completed" });

    const card = screen.getByRole("article", { name: /Ticket card/i });
    await userEvent.click(
      within(card).getByRole("button", { name: /Description \/ Details/i })
    );

    expect(within(card).queryByPlaceholderText(/Write a reply/i)).not.toBeInTheDocument();
  });
});
