    import React from "react";
    import { render, screen, fireEvent } from "@testing-library/react";
    import { MemoryRouter } from "react-router-dom";
    import CTAbutton from "../_deprecated/CTAbutton";
    import Tip from "../components/Tip";
    import CookieConsent from "../components/CookieConsent";
    import FloatingHelpButton from "../components/FloatingHelpButton";

    const mockNavigate = jest.fn();

    jest.mock("react-router-dom", () => {
    const actual = jest.requireActual("react-router-dom");
    return {
        ...actual,
        useNavigate: () => mockNavigate,
        MemoryRouter: actual.MemoryRouter,
    };
    });

    beforeEach(() => {
    mockNavigate.mockClear();
    localStorage.clear();
    // Clear cookie_consent cookie
    document.cookie = "cookie_consent=; max-age=0; path=/;";
    });

    describe("CTAbutton", () => {
    test("renders CTA text and handles click", () => {
        const handleClick = jest.fn();
        render(<CTAbutton onClick={handleClick} />);

        const button = screen.getByRole("button", {
        name: /Get started with your portfolio/i,
        });

        fireEvent.click(button);
        expect(handleClick).toHaveBeenCalled();
    });
    });

    describe("Tip", () => {
    test("renders provided message", () => {
        render(<Tip message="This is a helpful tip" />);

        expect(
        screen.getByText("This is a helpful tip")
        ).toBeInTheDocument();
    });
    });

    describe("CookieConsent", () => {
    test("shows banner when no prior consent exists", async () => {
        render(<CookieConsent />);

        expect(
        await screen.findByText(/We use cookies to improve your experience/i)
        ).toBeInTheDocument();
    });

    test("accept hides banner and stores consent", async () => {
        render(<CookieConsent />);

        const bannerText = await screen.findByText(
        /We use cookies to improve your experience/i
        );
        expect(bannerText).toBeInTheDocument();

        const acceptButton = screen.getByRole("button", { name: /Accept/i });
        fireEvent.click(acceptButton);

        expect(
        screen.queryByText(/We use cookies to improve your experience/i)
        ).toBeNull();

        expect(localStorage.getItem("cookieConsent")).toBe("accepted");
        expect(document.cookie).toMatch(/cookie_consent=accepted/);
    });


    test("reject hides banner and stores rejected consent", async () => {
    render(<CookieConsent />);

    // Banner should appear initially
    const bannerText = await screen.findByText(
        /We use cookies to improve your experience/i
    );
    expect(bannerText).toBeInTheDocument();

    const rejectButton = screen.getByRole("button", { name: /Reject/i });
    fireEvent.click(rejectButton);

    // Banner should disappear
    expect(
        screen.queryByText(/We use cookies to improve your experience/i)
    ).toBeNull();

    // Consent should be stored as "rejected"
    expect(localStorage.getItem("cookieConsent")).toBe("rejected");
    expect(document.cookie).toMatch(/cookie_consent=rejected/);
    });


    test("does not show banner when consent already stored", () => {
        localStorage.setItem("cookieConsent", "accepted");

        render(<CookieConsent />);

        expect(
        screen.queryByText(/We use cookies to improve your experience/i)
        ).toBeNull();
    });
    });

    describe("FloatingHelpButton", () => {
    test("renders help text", () => {
        render(
        <MemoryRouter>
            <FloatingHelpButton />
        </MemoryRouter>
        );

        expect(screen.getByText(/Need Help\?/i)).toBeInTheDocument();
    });

    test("hovering over the button toggles open state (icon vs label)", () => {
    const { container } = render(
        <MemoryRouter>
        <FloatingHelpButton />
        </MemoryRouter>
    );

    const wrapper = container.firstChild;

    // Initially, open = false → icon visible, label still rendered but "collapsed"
    expect(screen.getByText(/Need Help\?/i)).toBeInTheDocument();
    expect(screen.getByText("?")).toBeInTheDocument();

    // Hover: open = true → icon should disappear, label should be fully visible
    fireEvent.mouseEnter(wrapper);

    // Icon should be gone
    expect(screen.queryByText("?")).toBeNull();

    // Label still present
    expect(screen.getByText(/Need Help\?/i)).toBeInTheDocument();

    // Mouse leave: open = false again → icon returns
    fireEvent.mouseLeave(wrapper);
    expect(screen.getByText("?")).toBeInTheDocument();
    });



    test("clicking help button navigates to /support", () => {
        render(
        <MemoryRouter>
            <FloatingHelpButton />
        </MemoryRouter>
        );

        const button = screen.getByRole("button", { name: /Need Help\?/i });
        fireEvent.click(button);

        expect(mockNavigate).toHaveBeenCalledWith("/support");
    });
    });
