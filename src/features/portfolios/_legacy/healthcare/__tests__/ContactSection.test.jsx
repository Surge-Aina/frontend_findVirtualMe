/**
 * @jest-environment jsdom
 */
import React from "react";
import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Contact from "../components/Contact";

jest.mock("react-icons/fa", () => ({
  FaPhone: () => <span data-testid="icon-phone" />,
  FaWhatsapp: () => <span data-testid="icon-wa" />,
  FaEnvelope: () => <span data-testid="icon-mail" />,
  FaMapMarkerAlt: () => <span data-testid="icon-map" />,
  FaClock: () => <span data-testid="icon-clock" />,
}));

describe("Healthcare Contact section (static component)", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    window.alert = jest.fn();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it("renders heading and contact info", () => {
    render(<Contact />);
    expect(screen.getByRole("heading", { name: /get in touch/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /contact information/i })).toBeInTheDocument();
    expect(screen.getByText(/Call Us/i)).toBeInTheDocument();
  });

  it("updates controlled fields on change", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(<Contact />);

    await user.type(screen.getByLabelText(/full name/i), "Jane");
    await user.type(screen.getByLabelText(/^email/i), "jane@example.com");
    expect(screen.getByLabelText(/full name/i)).toHaveValue("Jane");
    expect(screen.getByLabelText(/^email/i)).toHaveValue("jane@example.com");
  });

  it("submits form: shows alert, clears fields, restores button after delay", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(<Contact />);

    await user.type(screen.getByLabelText(/full name/i), "Jane");
    await user.type(screen.getByLabelText(/^email/i), "jane@example.com");
    await user.type(screen.getByLabelText(/message/i), "Hello");

    const submit = screen.getByRole("button", { name: /send message/i });
    await user.click(submit);

    expect(screen.getByRole("button", { name: /sending/i })).toBeDisabled();

    await act(async () => {
      jest.advanceTimersByTime(2000);
    });

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(
        expect.stringContaining("Thank you for your message")
      );
    });

    expect(screen.getByLabelText(/full name/i)).toHaveValue("");
    expect(screen.getByLabelText(/^email/i)).toHaveValue("");
    expect(screen.getByLabelText(/message/i)).toHaveValue("");
    expect(screen.getByRole("button", { name: /send message/i })).not.toBeDisabled();
  });
});
