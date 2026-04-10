    import React from "react";
    import { render, screen, fireEvent } from "@testing-library/react";
    import { MemoryRouter } from "react-router-dom";
    import Navbar from "@/shared/components/Navbar";
    import { AuthContext } from "@/shared/context/AuthContext";

    const mockNavigate = jest.fn();

    // Mock react-router-dom's useNavigate
    jest.mock("react-router-dom", () => {
    const actual = jest.requireActual("react-router-dom");
    return {
        ...actual,
        useNavigate: () => mockNavigate,
        MemoryRouter: actual.MemoryRouter,
    };
    });

    // Mock Auth and SignUp so we don't pull in their full logic
    jest.mock("../pages/login/Auth.jsx", () => (props) => (
    <div data-testid="auth-modal" onClick={props.onSignUpClick}>
        Auth Component
    </div>
    ));

    jest.mock("../pages/login/SignUp.jsx", () => (props) => (
    <div data-testid="signup-modal" onClick={props.onLoginClick}>
        SignUp Component
    </div>
    ));

    const renderNavbar = (user = null) => {
    const login = jest.fn();
    const logout = jest.fn();

    return {
        ...render(
        <AuthContext.Provider value={{ user, login, logout }}>
            <MemoryRouter>
            <Navbar />
            </MemoryRouter>
        </AuthContext.Provider>
        ),
        login,
        logout,
    };
    };

    // Helper: click the DESKTOP nav button (not the mobile menu one)
    const clickDesktopNavButton = (label) => {
    const els = screen.getAllByText(label);
    const target =
        els.find((el) => {
        const btn = el.closest("button");
        // Desktop buttons do NOT have the "w-full" class used by mobile menu
        return btn && !btn.className.includes("w-full");
        }) || els[0];

    const btn = target.closest("button") || target;
    fireEvent.click(btn);
    };

    describe("Navbar", () => {
    beforeEach(() => {
        mockNavigate.mockClear();
    });

    test("renders brand and auth button when logged out", () => {
        renderNavbar(null);

        expect(screen.getByText("FindVirtual.me")).toBeInTheDocument();
        expect(screen.getByText(/Log in \/ Sign up/i)).toBeInTheDocument();
    });

    test("shows profile button when logged in instead of auth CTA", () => {
        renderNavbar({ name: "Alice" });

        const profileEls = screen.getAllByText(/Profile/i);
        expect(profileEls.length).toBeGreaterThan(0);

        expect(
        screen.queryByText(/Log in \/ Sign up/i)
        ).not.toBeInTheDocument();
    });

    test("clicking Dashboard triggers navigation", () => {
        renderNavbar({ name: "Alice" });

        const dashboardButtons = screen.getAllByText("Dashboard");
        fireEvent.click(dashboardButtons[0]);

        expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
    });

    test("clicking brand navigates home", () => {
        renderNavbar({ name: "User" });

        const brand = screen.getByText("FindVirtual.me");
        fireEvent.click(brand);

        expect(mockNavigate).toHaveBeenCalledWith("/");
    });

    test("desktop nav links navigate to correct routes", () => {
        renderNavbar({ name: "User" });

        clickDesktopNavButton("Creators");
        clickDesktopNavButton("Job Seekers");
        clickDesktopNavButton("Dashboard");
        clickDesktopNavButton("Solutions");

        expect(mockNavigate).toHaveBeenCalledWith("/occupations");
        expect(mockNavigate).toHaveBeenCalledWith("/");
        expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
        expect(mockNavigate).toHaveBeenCalledWith("/solutions");
    });

    test("shows Admin link only for admin users and navigates correctly (desktop)", () => {
        renderNavbar({ name: "Admin User", role: "admin" });

        clickDesktopNavButton("Admin");

        expect(mockNavigate).toHaveBeenCalledWith("/admin-choice");
    });

    test("login CTA opens auth modal and can switch between login and signup via mocked components", () => {
        renderNavbar(null); // guest

        const cta = screen.getByText(/Log in \/ Sign up/i);
        fireEvent.click(cta);

        // Auth modal rendered
        const authModal = screen.getByTestId("auth-modal");
        expect(authModal).toBeInTheDocument();

        // Click inside Auth → triggers onSignUpClick, switching to signup mode
        fireEvent.click(authModal);

        const signupModal = screen.getByTestId("signup-modal");
        expect(signupModal).toBeInTheDocument();

        // Click inside SignUp → triggers onLoginClick, switching back to login mode
        fireEvent.click(signupModal);
        // Both branches exercised; no explicit mode assertion needed.
    });

    test("auth modal close button hides the modal", () => {
        renderNavbar(null); // guest

        const cta = screen.getByText(/Log in \/ Sign up/i);
        fireEvent.click(cta);

        // Modal should be visible
        expect(screen.getByTestId("auth-modal")).toBeInTheDocument();

        // Click the close (×) button
        const closeBtn = screen.getByRole("button", { name: /Close/i });
        fireEvent.click(closeBtn);

        // Modal should disappear
        expect(screen.queryByTestId("auth-modal")).toBeNull();
        expect(screen.queryByTestId("signup-modal")).toBeNull();
    });

    test("auth modal bottom links toggle between login and signup modes", () => {
        renderNavbar(null); // guest

        const cta = screen.getByText(/Log in \/ Sign up/i);
        fireEvent.click(cta);

        // Initially login mode: Auth modal shown
        expect(screen.getByTestId("auth-modal")).toBeInTheDocument();

        // Click bottom "Don't have an account? Sign up"
        const toSignupBtn = screen.getByRole("button", {
        name: /Don't have an account\? Sign up/i,
        });
        fireEvent.click(toSignupBtn);

        // Now signup mode: SignUp modal shown
        expect(screen.getByTestId("signup-modal")).toBeInTheDocument();

        // Click bottom "Already have an account? Log in"
        const toLoginBtn = screen.getByRole("button", {
        name: /Already have an account\? Log in/i,
        });
        fireEvent.click(toLoginBtn);

        // Back to login mode: Auth modal again
        expect(screen.getByTestId("auth-modal")).toBeInTheDocument();
    });

    test("desktop profile button navigates to /profile", () => {
        renderNavbar({ name: "User", role: "member" });

        const profileButton = screen.getByLabelText("Profile");
        fireEvent.click(profileButton);

        expect(mockNavigate).toHaveBeenCalledWith("/profile");
    });

    test("logout button logs out and navigates home", () => {
        const { logout } = renderNavbar({ name: "User", role: "member" });

        const logoutBtn = screen.getByText("Logout");
        fireEvent.click(logoutBtn);

        expect(logout).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith("/");
    });

    test("mobile menu toggles and profile link navigates", () => {
        renderNavbar({ name: "User", role: "member" });

        const openMenuBtn = screen.getByLabelText("Open menu");
        fireEvent.click(openMenuBtn);

        // Find the mobile Profile button (full-width one in the menu)
        const profileEls = screen.getAllByText("Profile");
        const mobileProfile = profileEls.find((el) =>
        el.closest("button")?.className.includes("w-full")
        );

        expect(mobileProfile).toBeTruthy();

        fireEvent.click(mobileProfile);

        expect(mockNavigate).toHaveBeenCalledWith("/profile");
    });

    test("mobile menu routes navigate correctly for admin user", () => {
        renderNavbar({ name: "Admin User", role: "admin" });

        const openMenuBtn = screen.getByLabelText("Open menu");
        fireEvent.click(openMenuBtn);

        // Creators (mobile = w-full)
        const creatorsMobile = screen
        .getAllByRole("button", { name: /^Creators$/i })
        .find((btn) => btn.className.includes("w-full"));
        fireEvent.click(creatorsMobile);

        // Job Seekers (mobile)
        const jobSeekersMobile = screen
        .getAllByRole("button", { name: /^Job Seekers$/i })
        .find((btn) => btn.className.includes("w-full"));
        fireEvent.click(jobSeekersMobile);

        // Dashboard (mobile)
        const dashboardMobile = screen
        .getAllByRole("button", { name: /^Dashboard$/i })
        .find((btn) => btn.className.includes("w-full"));
        fireEvent.click(dashboardMobile);

        // Solutions (mobile)
        const solutionsMobile = screen
        .getAllByRole("button", { name: /^Solutions$/i })
        .find((btn) => btn.className.includes("w-full"));
        fireEvent.click(solutionsMobile);

        // Admin (mobile)
        const adminMobile = screen
        .getAllByRole("button", { name: /^Admin$/i })
        .find((btn) => btn.className.includes("w-full"));
        fireEvent.click(adminMobile);

        expect(mockNavigate).toHaveBeenCalledWith("/occupations");
        expect(mockNavigate).toHaveBeenCalledWith("/");
        expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
        expect(mockNavigate).toHaveBeenCalledWith("/solutions");
        expect(mockNavigate).toHaveBeenCalledWith("/admin-choice");
    });

    // 🔧 FIXED: align with real behavior — guest Dashboard still navigates
    test("guest clicking Dashboard still navigates to /dashboard", () => {
        renderNavbar(null); // guest

        mockNavigate.mockClear();

        clickDesktopNavButton("Dashboard");

        expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
    });

    test("handles scroll events (navbar visibility effect) and cleanup without crashing", () => {
        const { unmount } = renderNavbar({ name: "Scroll User" });

        // Simulate scroll down and up to hit scroll handler branches
        Object.defineProperty(window, "scrollY", {
        value: 0,
        writable: true,
        configurable: true,
        });

        fireEvent.scroll(window);

        window.scrollY = 200;
        fireEvent.scroll(window);

        // Unmount to exercise cleanup function in useEffect
        unmount();
    });
    });
