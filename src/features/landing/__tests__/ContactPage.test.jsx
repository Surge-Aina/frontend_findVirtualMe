import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import axios from "axios";
import ContactPage from "../ContactPage";

jest.mock("axios");

describe("ContactPage", () => {
  beforeEach(() => {
    axios.post.mockReset();
  });

  test("shows mailto fallback when backend is down", async () => {
    axios.post.mockRejectedValue({ code: "ERR_NETWORK" });
    render(
      <MemoryRouter>
        <ContactPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Ada" } });
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "ada@example.com" } });
    fireEvent.change(screen.getByLabelText("Message"), { target: { value: "Hello" } });
    fireEvent.click(screen.getByRole("button", { name: /send message/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/temporarily unavailable/i);
    expect(screen.getByRole("link", { name: /email surgeaina@gmail.com/i })).toHaveAttribute(
      "href",
      expect.stringContaining("mailto:surgeaina%40gmail.com")
    );
  });
});