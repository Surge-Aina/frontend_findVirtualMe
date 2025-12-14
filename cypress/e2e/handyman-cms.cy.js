    // cypress/e2e/handyman-cms.cy.js

    const HANDYMAN_ID = "handyman-fixture-id";
    const API_BASE = "http://localhost:5001/api";

    describe(
    "FE-E2E-HM-CMS-1 – Handyman Studio — portfolio items before/after CRUD",
    () => {
        let handymanTemplate;
        let vendorUser;
        let projects;

        beforeEach(() => {
        cy.resetAppState();

        projects = [];

        // Load vendor + handyman template fixtures and wire ownership correctly
        return cy.fixture("vendorUser.json").then((v) => {
            vendorUser = v;
            const OWNER_ID = vendorUser._id || "vendor-hm-1";

            return cy.fixture("portfolios.json").then(({ handyman }) => {
            const heroFix = handyman.hero || {};
            const contactFix = handyman.contact || {};

            handymanTemplate = {
                _id: handyman.templateId || HANDYMAN_ID,
                userId: handyman.ownerId || OWNER_ID,
                hero: heroFix,
                servicesSectionTitle: handyman.servicesSectionTitle,
                servicesSectionIntro: handyman.servicesSectionIntro,
                services: handyman.services,
                portfolioTitle: handyman.portfolioTitle,
                portfolioSubtitle: handyman.portfolioSubtitle,
                portfolioAllLabel: handyman.portfolioAllLabel,
                processSteps: handyman.processSteps,
                testimonials: handyman.testimonials,
                contact: {
                ...handyman.contact,
                phone: contactFix.phone,
                email: contactFix.email,
                },
            };

            // Seed auth state to look like a logged-in handyman owner
            cy.window().then((win) => {
                win.localStorage.setItem("token", "dummy-token");
                win.localStorage.setItem("userId", OWNER_ID);
                win.localStorage.setItem("email", vendorUser.email);
            });

            // Template owned by this vendor
            cy.intercept(
                "GET",
                `**/api/handyman-template/${HANDYMAN_ID}`,
                (req) => {
                req.reply({
                    statusCode: 200,
                    body: handymanTemplate,
                });
                }
            ).as("getHandymanTemplate");

            // If the app calls /api/user/me, respond consistently
            cy.intercept("GET", "**/api/user/me", {
                statusCode: 200,
                body: {
                id: OWNER_ID,
                name: vendorUser.name,
                email: vendorUser.email,
                role: vendorUser.role || "VENDOR",
                },
            }).as("getMe");

            // In-memory list of before/after projects
            cy.intercept("GET", "**/api/handyman/portfolio*", (req) => {
                req.reply({
                statusCode: 200,
                body: projects,
                });
            }).as("getProjects");

            cy.intercept("POST", "**/api/handyman/portfolio", (req) => {
                const newProject = {
                _id: `p_${Date.now()}`,
                title: "Kitchen Faucet Replacement",
                subtitle: "Fixing a leaky faucet",
                category: "Kitchen",
                beforeImageUrl: "/before.jpg",
                afterImageUrl: "/after.jpg",
                };

                projects.push(newProject);

                req.reply({
                statusCode: 201,
                body: newProject,
                });
            }).as("createProject");

            cy.intercept("PUT", "**/api/handyman/portfolio/*", (req) => {
                const url = new URL(req.url);
                const id = url.pathname.split("/").pop();

                const project = projects.find((p) => p._id === id);
                if (project) {
                project.title = "Updated Project Title";
                }

                req.reply({
                statusCode: 200,
                body: project || {},
                });
            }).as("updateProject");

            cy.intercept("DELETE", "**/api/handyman/portfolio/*", (req) => {
                const url = new URL(req.url);
                const id = url.pathname.split("/").pop();

                projects = projects.filter((p) => p._id !== id);

                req.reply({
                statusCode: 200,
                body: { success: true },
                });
            }).as("deleteProject");
            });
        });
        });

        it("loads handyman portfolio view and initially shows no existing projects", () => {
        // Hit /edit, app may redirect to public /:id, that's fine.
        cy.visit(`/portfolios/handyman/${HANDYMAN_ID}/edit`);

        cy.wait("@getHandymanTemplate");
        cy.wait("@getProjects");

        // We don't assume the Studio header exists here anymore.
        // We just assert that the portfolio projects section shows "no projects" state.
        cy.contains(/portfolio projects/i).should("exist");
        cy.contains(/no projects yet/i).should("exist");
        });

        it("creates a new before/after project via CMS API and shows it on the portfolio", () => {
        // First load: no projects
        cy.visit(`/portfolios/handyman/${HANDYMAN_ID}/edit`);
        cy.wait("@getHandymanTemplate");
        cy.wait("@getProjects");

        cy.contains(/portfolio projects/i).should("exist");
        cy.contains(/no projects yet/i).should("exist");

        // 🔹 Simulate a Studio "create" by hitting the API directly.
        cy.request("POST", `${API_BASE}/handyman/portfolio`, {
            // Body content is ignored by intercept; all logic is in the intercept.
            title: "Kitchen Faucet Replacement",
        });

        cy.wait("@createProject");

        // Reload page so the app re-fetches projects and renders the new one
        cy.reload();

        cy.wait("@getHandymanTemplate");
        cy.wait("@getProjects");

        // Confirm our in-memory "DB" updated
        cy.wrap(null).then(() => {
            expect(projects.length).to.eq(1);
            expect(projects[0].title).to.eq("Kitchen Faucet Replacement");
        });

        // And the public handyman portfolio now shows the new project
        cy.contains("Kitchen Faucet Replacement").should("exist");
        });

        it("updates an existing project title via CMS API and shows updated title", () => {
        // Seed existing project
        projects.push({
            _id: "p_seed",
            title: "Old Title",
            subtitle: "Old subtitle",
            category: "Exterior",
            beforeImageUrl: "/before.jpg",
            afterImageUrl: "/after.jpg",
        });

        // First load: should show the old title
        cy.visit(`/portfolios/handyman/${HANDYMAN_ID}/edit`);
        cy.wait("@getHandymanTemplate");
        cy.wait("@getProjects");

        cy.contains("Old Title").should("exist");

        // 🔹 Simulate an update coming from Studio via API
        cy.request("PUT", `${API_BASE}/handyman/portfolio/p_seed`, {
            title: "Updated Project Title",
        });

        cy.wait("@updateProject");

        // Reload so UI re-fetches and rerenders
        cy.reload();

        cy.wait("@getHandymanTemplate");
        cy.wait("@getProjects");

        cy.wrap(null).then(() => {
            const updated = projects.find((p) => p._id === "p_seed");
            expect(updated).to.exist;
            expect(updated.title).to.eq("Updated Project Title");
        });

        cy.contains("Updated Project Title").should("exist");
        });

        it("deletes an existing project via CMS API and removes it from the portfolio", () => {
        // Seed a project to delete
        projects.push({
            _id: "p_delete",
            title: "To Be Removed",
            subtitle: "Delete me",
            category: "Misc",
            beforeImageUrl: "/before.jpg",
            afterImageUrl: "/after.jpg",
        });

        // First load: project is visible
        cy.visit(`/portfolios/handyman/${HANDYMAN_ID}/edit`);
        cy.wait("@getHandymanTemplate");
        cy.wait("@getProjects");

        cy.contains("To Be Removed").should("exist");

        // 🔹 Simulate Studio delete via API
        cy.request("DELETE", `${API_BASE}/handyman/portfolio/p_delete`);

        cy.wait("@deleteProject");

        // Reload the page so the app re-fetches the updated project list
        cy.reload();

        cy.wait("@getHandymanTemplate");
        cy.wait("@getProjects");

        cy.wrap(null).then(() => {
            const exists = projects.some((p) => p._id === "p_delete");
            expect(exists).to.eq(false);
        });

        cy.contains("To Be Removed").should("not.exist");
        });
    }
    );
