import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";
import { PortfolioViewProvider } from "../../context/PortfolioViewContext";
import ContactBlock from "../ContactBlock";

jest.mock("axios");

const mockToastSuccess = jest.fn();
const mockToastError = jest.fn();
jest.mock("react-toastify", () => ({
  toast: {
    success: (...args) => mockToastSuccess(...args),
    error: (...args) => mockToastError(...args),
  },
}));

describe("ContactBlock", () => {
  const handymanPortfolio = {
    _id: "p1",
    template: "handyman",
    sections: [{ type: "services", order: 0, data: { items: [] } }],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders handyman contact section heading", () => {
    render(
      <PortfolioViewProvider portfolio={handymanPortfolio}>
        <ContactBlock
          template="handyman"
          title="Contact us"
          subtitle="We reply fast"
        />
      </PortfolioViewProvider>
    );
    expect(screen.getByText(/contact us/i)).toBeInTheDocument();
  });

  it("submits handyman inquiry when message is provided", async () => {
    const user = userEvent.setup();
    axios.post.mockResolvedValueOnce({});

    render(
      <PortfolioViewProvider portfolio={handymanPortfolio}>
        <ContactBlock template="handyman" />
      </PortfolioViewProvider>
    );

    await user.type(screen.getByPlaceholderText(/name \*/i), "N");
    await user.type(screen.getByPlaceholderText(/email \*/i), "n@e.com");
    await user.type(screen.getByPlaceholderText(/phone \*/i), "555");
    await user.type(screen.getByPlaceholderText(/message \*/i), "Hello");

    await user.click(screen.getByRole("button", { name: /send message/i }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringMatching(/\/api\/handyman\/inquiries$/),
        expect.objectContaining({
          portfolioId: "p1",
          message: "Hello",
        })
      );
    });
    expect(mockToastSuccess).toHaveBeenCalled();
  });

  it("shows toast when handyman form has no portfolio id", async () => {
    const user = userEvent.setup();
    render(
      <PortfolioViewProvider portfolio={null}>
        <ContactBlock template="handyman" />
      </PortfolioViewProvider>
    );

    await user.type(screen.getByPlaceholderText(/name \*/i), "N");
    await user.type(screen.getByPlaceholderText(/email \*/i), "n@e.com");
    await user.type(screen.getByPlaceholderText(/phone \*/i), "555");
    await user.type(screen.getByPlaceholderText(/message \*/i), "Hi");
    await user.click(screen.getByRole("button", { name: /send message/i }));

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith(
        "Portfolio not loaded; cannot send inquiry."
      );
    });
    expect(axios.post).not.toHaveBeenCalled();
  });

  it("submits projectManager contact form", async () => {
    const user = userEvent.setup();
    axios.post.mockResolvedValueOnce({});

    render(
      <PortfolioViewProvider portfolio={handymanPortfolio}>
        <ContactBlock template="projectManager" email="a@b.com" />
      </PortfolioViewProvider>
    );

    await user.type(screen.getByPlaceholderText(/your name/i), "Visitor");
    await user.type(screen.getByPlaceholderText(/you@email\.com/i), "v@e.com");
    await user.type(screen.getByPlaceholderText(/your message/i), "Msg");

    await user.click(screen.getByRole("button", { name: /send message/i }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringMatching(/\/api\/portfolio\/contact$/),
        {
          name: "Visitor",
          email: "v@e.com",
          message: "Msg",
          portfolioId: "p1",
        }
      );
    });
  });

  it("renders healthcare contact and shows success after submit", async () => {
    const user = userEvent.setup();

    render(
      <PortfolioViewProvider portfolio={handymanPortfolio}>
        <ContactBlock
          template="healthcare"
          phone="111"
          email="h@clinic.com"
          submitText="Send"
        />
      </PortfolioViewProvider>
    );

    expect(screen.getByText("111")).toBeInTheDocument();
    expect(screen.getByText("h@clinic.com")).toBeInTheDocument();

    await user.type(screen.getByPlaceholderText(/^name$/i), "Pat");
    await user.type(screen.getByPlaceholderText(/^email$/i), "p@x.com");
    await user.type(screen.getByPlaceholderText(/^message$/i), "Hi");
    await user.click(screen.getByRole("button", { name: /^send$/i }));

    expect(screen.getByText(/message sent successfully/i)).toBeInTheDocument();
  });

  it("renders dataScientist contact heading", () => {
    render(
      <PortfolioViewProvider portfolio={handymanPortfolio}>
        <ContactBlock template="dataScientist" />
      </PortfolioViewProvider>
    );
    expect(screen.getByText(/mail — compose/i)).toBeInTheDocument();
  });
});
