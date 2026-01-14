/// <reference types="cypress" />

import { startVendorAsOwner } from "../support/vendorStudio";

describe("Gallery Section – Owner/Admin view", () => {
  beforeEach(() => {
    startVendorAsOwner();

    // Wait for gallery fetch so UI is stable
    cy.wait("@getGallery");
  });

  it("renders admin list for owner when images exist", () => {
    cy.intercept("GET", "**/gallery/**", {
      body: [
        {
          _id: "img123",
          imageUrl: "/mock.jpg",
          caption: "Admin Image",
        },
      ],
    }).as("getGallery");

    cy.reload();
    cy.wait("@getGallery");

    cy.get("section#gallery")
      .find("ul")
      .should("exist")
      .within(() => {
        cy.contains("Admin Image").should("be.visible");
        cy.contains("Edit").should("be.visible");
        cy.contains("Delete").should("be.visible");
      });
  });

  it("renders gallery section", () => {
    cy.contains("Gallery", { timeout: 10000 }).should("be.visible");
  });

  it("shows empty state when no images exist", () => {
    cy.contains("No gallery images available.").should("be.visible");
  });

  it("shows Add New Image button for owner", () => {
    cy.contains("+ Add New Image").should("be.visible");
  });

  it("opens upload form when Add New Image is clicked", () => {
    cy.contains("+ Add New Image").click();

    cy.get("input[type='file']").should("exist");
    cy.get("input[placeholder='Caption (optional)']").should("exist");
    cy.contains("Add").should("be.visible");
    cy.contains("Cancel").should("be.visible");
  });

  it("cancels image upload form", () => {
    cy.contains("+ Add New Image").click();

    cy.get("input[placeholder='Caption (optional)']").type("Should not persist");

    cy.contains("Cancel").click();

    cy.get("input[placeholder='Caption (optional)']").should("not.exist");
    cy.contains("Should not persist").should("not.exist");
  });

  it("allows uploading a new gallery image (mocked)", () => {
    // Mock POST create gallery
    cy.intercept("POST", "**/gallery/**", {
      statusCode: 200,
      body: {
        _id: "img123",
        imageUrl: "/mock-gallery.jpg",
        caption: "Test Image",
      },
    }).as("createGallery");

    // Mock refetch
    cy.intercept("GET", "**/gallery/**", {
      statusCode: 200,
      body: [
        {
          _id: "img123",
          imageUrl: "/mock-gallery.jpg",
          caption: "Test Image",
        },
      ],
    }).as("getGalleryAfterCreate");

    cy.contains("+ Add New Image").click();

    cy.get("section#gallery")
      .find("input[type='file']")
      .filter(":visible")
      .should("have.length", 1)
      .selectFile(
        {
          contents: Cypress.Buffer.from("fake image"),
          fileName: "test.jpg",
          mimeType: "image/jpeg",
        },
        { force: true }
      );

    cy.get("input[placeholder='Caption (optional)']").type("Test Image");

    cy.get("section#gallery").find("button").contains(/^Add$/).click();

    cy.wait("@createGallery");
    cy.wait("@getGalleryAfterCreate");

    cy.contains("Test Image").should("be.visible");
  });

  it("allows editing a gallery image caption", () => {
    // Initial gallery has one image
    cy.intercept("GET", "**/gallery/**", {
      statusCode: 200,
      body: [
        {
          _id: "img123",
          imageUrl: "/mock-gallery.jpg",
          caption: "Old Caption",
        },
      ],
    }).as("getGalleryWithImage");

    cy.reload();
    cy.wait("@getGalleryWithImage");

    // 2️⃣ Mock update
    cy.intercept("PUT", "**/gallery/**", {
      statusCode: 200,
      body: {
        _id: "img123",
        imageUrl: "/mock-gallery.jpg",
        caption: "Updated Caption",
      },
    }).as("updateGallery");

    //  Mock refetch after update
    cy.intercept("GET", "**/gallery/**", {
      statusCode: 200,
      body: [
        {
          _id: "img123",
          imageUrl: "/mock-gallery.jpg",
          caption: "Updated Caption",
        },
      ],
    }).as("getGalleryAfterUpdate");

    //  Click Edit
    cy.get("section#gallery").find("button").contains("Edit").click();

    //  Update caption
    cy.get("input[placeholder='Caption (optional)']").clear().type("Updated Caption");

    cy.get("section#gallery")
      .find("button")
      .contains(/^Update$/)
      .click();

    cy.wait("@updateGallery");
    cy.wait("@getGalleryAfterUpdate");

    //  Assert in admin list (stable)
    cy.get("section#gallery").find("ul").contains("Updated Caption").should("be.visible");
  });

  it("allows deleting a gallery image", () => {
    //Seed gallery with one image
    cy.intercept("GET", "**/gallery/**", {
      statusCode: 200,
      body: [
        {
          _id: "img123",
          imageUrl: "/mock-gallery.jpg",
          caption: "Delete Me",
        },
      ],
    }).as("getGalleryWithImage");

    cy.reload();
    cy.wait("@getGalleryWithImage");

    // Mock DELETE
    cy.intercept("DELETE", "**/gallery/**", {
      statusCode: 200,
    }).as("deleteGallery");

    //  Mock GET after delete → EMPTY
    cy.intercept("GET", "**/gallery/**", {
      statusCode: 200,
      body: [],
    }).as("getGalleryAfterDelete");

    //  Confirm dialog
    cy.on("window:confirm", () => true);

    // Click delete
    cy.get("section#gallery").find("button").contains("Delete").first().click();

    cy.wait("@deleteGallery");
    cy.wait("@getGalleryAfterDelete");

    // Assert using admin list (stable DOM)
    cy.get("section#gallery").find("li").should("have.length", 0);

    cy.contains("Delete Me").should("not.exist");
  });
});

describe("Gallery Section – Public view", () => {
  beforeEach(() => {
    cy.intercept("GET", "**/gallery/**", {
      statusCode: 200,
      body: [
        {
          _id: "img123",
          imageUrl: "/mock-gallery.jpg",
          caption: "Public Image",
        },
      ],
    }).as("getGallery");

    cy.visit("/portfolios/vendor/fusion-flavors/690159b1a872fe05a6cc02b5");

    cy.wait("@getGallery");
  });

  it("renders gallery images for public users", () => {
    cy.contains("Public Image").should("be.visible");
  });

  it("does not show admin controls for public users", () => {
    cy.contains("+ Add New Image").should("not.exist");
    cy.contains("Edit").should("not.exist");
    cy.contains("Delete").should("not.exist");
  });
});
