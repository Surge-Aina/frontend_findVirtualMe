    import React from "react";
    import { render, screen } from "@testing-library/react";
    import { MemoryRouter } from "react-router-dom";
    import Layout from "../components/Layout";
    import Footer from "../components/Footer";

    // ✅ Mock Navbar so Layout tests don't pull in full Navbar logic
    jest.mock("../components/Navbar", () => () => (
    <div data-testid="navbar">Navbar</div>
    ));

    // ✅ Mock framer-motion so Footer animations don't break tests
    jest.mock("framer-motion", () => {
    const React = require("react");
    return {
        motion: {
        div: ({ children, ...rest }) => <div {...rest}>{children}</div>,
        },
    };
    });

    const renderWithRoute = (initialEntry, state) => {
    const entry =
        typeof initialEntry === "string"
        ? { pathname: initialEntry, state }
        : initialEntry;

    return render(
        <MemoryRouter initialEntries={[entry]}>
        <Layout>
            <div>Child content</div>
        </Layout>
        </MemoryRouter>
    );
    };

    describe("Layout", () => {
    test("shows Navbar on non-portfolio routes", () => {
        const { container } = renderWithRoute("/dashboard");

        expect(screen.getByTestId("navbar")).toBeInTheDocument();
        expect(screen.getByText("Child content")).toBeInTheDocument();

        const main = container.querySelector("main");
        expect(main.className).toContain("pt-20");
    });

    test("shows Navbar on portfolio routes that are not unified view", () => {
        const { container } = renderWithRoute("/portfolios/handyman");

        expect(screen.getByTestId("navbar")).toBeInTheDocument();

        const main = container.querySelector("main");
        expect(main.className).toContain("pt-20");
    });

    test("hides Navbar on unified portfolio view /portfolios/view/:id", () => {
        const { container } = renderWithRoute("/portfolios/view/507f1f77bcf86cd799439011");

        expect(screen.queryByTestId("navbar")).toBeNull();

        const main = container.querySelector("main");
        expect(main.className).not.toContain("pt-20");
    });

    test("shows Navbar on unified portfolio edit /portfolios/view/:id/edit", () => {
        const { container } = renderWithRoute(
        "/portfolios/view/507f1f77bcf86cd799439011/edit"
        );

        expect(screen.getByTestId("navbar")).toBeInTheDocument();

        const main = container.querySelector("main");
        expect(main.className).toContain("pt-20");
    });
    });

    describe("Footer", () => {
    test("renders company name and copyright", () => {
        render(<Footer />);

        expect(screen.getAllByText("FindVirtual.me")[0]).toBeInTheDocument();
        expect(
        screen.getByText(/All rights reserved\./i)
        ).toBeInTheDocument();
    });
    });
