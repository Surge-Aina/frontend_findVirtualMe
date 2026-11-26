import { Suspense } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";
import { DateTime } from "luxon";
import BookingRequestBlock from "../BookingRequestBlock";
import BookingRequestBlockImpl from "../BookingRequestBlockImpl";
import { PortfolioViewProvider } from "../../context/PortfolioViewContext";
import { HONEYPOT_FIELD } from "../booking/bookingRequestLimits";

jest.mock("axios");

const portfolio = {
  _id: "507f1f77bcf86cd799439099",
  template: "healthcare",
  sections: [],
};

const sectionDefaults = {
  sectionTitle: "Book a visit",
  intro: "Choose a window.",
  services: ["Checkup"],
  minNoticeHours: 0,
  daysAheadMax: 30,
  timezone: "UTC",
  confirmationText: "We received your request.",
  sectionId: "507f1f77bcf86cd799439088",
};

function renderBlock(props = {}, { bookingFlag = "true", useLazyShell = false } = {}) {
  const prev = import.meta.env.VITE_COMPONENT_BOOKING_ENABLED;
  import.meta.env.VITE_COMPONENT_BOOKING_ENABLED = bookingFlag;
  const Block = useLazyShell ? BookingRequestBlock : BookingRequestBlockImpl;
  const view = render(
    <Suspense fallback={null}>
      <PortfolioViewProvider portfolio={portfolio}>
        <Block template="healthcare" {...sectionDefaults} {...props} />
      </PortfolioViewProvider>
    </Suspense>
  );
  import.meta.env.VITE_COMPONENT_BOOKING_ENABLED = prev;
  return view;
}

describe("BookingRequestBlock", () => {
  beforeEach(() => {
    process.env.VITE_BACKEND_API = "http://localhost:5001";
    axios.post.mockReset();
  });

  it("renders nothing when VITE_COMPONENT_BOOKING_ENABLED is off", () => {
    const { container } = renderBlock({}, { bookingFlag: "", useLazyShell: true });
    expect(container.firstChild).toBeNull();
  });

  it("submits with honeypot and shows confirmation text", async () => {
    axios.post.mockResolvedValue({
      data: { success: true, message: "Custom thanks from owner." },
    });

    renderBlock();

    const futureDate = DateTime.utc().plus({ days: 2 }).toISODate();

    await userEvent.type(screen.getByLabelText(/Name/i), "Pat Example");
    await userEvent.type(screen.getByLabelText(/Email/i), "pat.visitor@example.test");
    await userEvent.clear(screen.getByLabelText(/Date/i));
    await userEvent.type(screen.getByLabelText(/Date/i), futureDate);
    await userEvent.selectOptions(screen.getByLabelText(/Service/i), "Checkup");
    await userEvent.click(screen.getByRole("button", { name: /Request time/i }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledTimes(1);
    });

    const [url, body] = axios.post.mock.calls[0];
    expect(url).toBe("http://localhost:5001/api/booking-requests");
    expect(body.portfolioId).toBe(portfolio._id);
    expect(body.sectionId).toBe(sectionDefaults.sectionId);
    expect(body.email).toBe("pat.visitor@example.test");
    expect(body.service).toBe("Checkup");
    expect(body[HONEYPOT_FIELD]).toBe("");
    expect(body.requestedStart).toMatch(/T/);
    expect(body.requestedEnd).toMatch(/T/);

    expect(await screen.findByText("Custom thanks from owner.")).toBeInTheDocument();
  });

  it("hides the form on feature-disabled 404", async () => {
    axios.post.mockRejectedValue({
      response: {
        status: 404,
        data: { code: "FEATURE_COMPONENT_BOOKING_DISABLED" },
      },
    });

    const { container } = renderBlock();
    const futureDate = DateTime.utc().plus({ days: 2 }).toISODate();

    await userEvent.type(screen.getByLabelText(/Name/i), "Pat Example");
    await userEvent.type(screen.getByLabelText(/Email/i), "pat.visitor@example.test");
    await userEvent.clear(screen.getByLabelText(/Date/i));
    await userEvent.type(screen.getByLabelText(/Date/i), futureDate);
    await userEvent.click(screen.getByRole("button", { name: /Request time/i }));

    await waitFor(() => {
      expect(container.querySelector('[data-testid="booking-request-form"]')).toBeNull();
    });
  });

  it("shows 'This form is not available' on other 404 responses", async () => {
    axios.post.mockRejectedValueOnce({
      response: { status: 404, data: { code: "not_found", message: "Site not found" } },
    });

    renderBlock();
    const futureDate = DateTime.utc().plus({ days: 2 }).toISODate();

    await userEvent.type(screen.getByLabelText(/Name/i), "Pat Example");
    await userEvent.type(screen.getByLabelText(/Email/i), "pat.visitor@example.test");
    await userEvent.clear(screen.getByLabelText(/Date/i));
    await userEvent.type(screen.getByLabelText(/Date/i), futureDate);
    await userEvent.click(screen.getByRole("button", { name: /Request time/i }));

    expect(await screen.findByText("This form is not available.")).toBeInTheDocument();
  });

  it("shows a friendly message on 400 and 429", async () => {
    axios.post.mockRejectedValueOnce({
      response: { status: 400, data: { message: "service is not offered" } },
    });

    renderBlock();
    const futureDate = DateTime.utc().plus({ days: 2 }).toISODate();

    await userEvent.type(screen.getByLabelText(/Name/i), "Pat Example");
    await userEvent.type(screen.getByLabelText(/Email/i), "pat.visitor@example.test");
    await userEvent.clear(screen.getByLabelText(/Date/i));
    await userEvent.type(screen.getByLabelText(/Date/i), futureDate);
    await userEvent.click(screen.getByRole("button", { name: /Request time/i }));

    expect(await screen.findByText("service is not offered")).toBeInTheDocument();

    axios.post.mockRejectedValueOnce({ response: { status: 429 } });
    await userEvent.click(screen.getByRole("button", { name: /Request time/i }));
    expect(await screen.findByText(/Too many requests/i)).toBeInTheDocument();
  });
});