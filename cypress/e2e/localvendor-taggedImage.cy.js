const vendorId = "690159b1a872fe05a6cc02b5";

const visitTaggedImageAsOwner = ({ menu = [], taggedImages = [] } = {}) => {
  cy.intercept("GET", "**/user/me", {
    body: {
      user: {
        role: "vendor",
        portfolios: [{ portfolioId: vendorId }],
      },
    },
  }).as("getMe");

  cy.intercept("GET", "**/menu/**", {
    statusCode: 200,
    body: menu,
  }).as("getMenu");

  cy.intercept("GET", "**/tagged/**", {
    statusCode: 200,
    body:
      taggedImages.length > 0
        ? taggedImages
        : [
            {
              _id: "tagged1",
              imageUrl: "/mock-tagged.jpg",
              tags: [],
            },
          ],
  }).as("getTaggedImages");

  cy.intercept("POST", "**/upload-grid-images**", {
    statusCode: 200,
    body: {
      _id: "tagged1",
      imageUrl: "/mock-tagged.jpg",
      tags: [],
    },
  }).as("uploadTaggedImage");

  cy.intercept("DELETE", "**/tagged/**/tags/**", {
    statusCode: 200,
    body: {
      tags: [],
    },
  }).as("deleteTag");
  cy.intercept("POST", "**/tagged/**/tags", {
    statusCode: 200,
    body: {
      tags: [
        {
          x: 0.5,
          y: 0.5,
          label: "Burger",
          menuItemId: "m1",
        },
      ],
    },
  }).as("createTag");

  cy.visit(`/portfolios/vendor/fusion-flavors/${vendorId}`, {
    onBeforeLoad(win) {
      win.localStorage.setItem("token", "test-token");
    },
  });

  cy.wait("@getMe");

  cy.contains("Manage Tags").click();

  cy.wait("@getMenu");
  cy.wait("@getTaggedImages");
};

describe("Tagged Image – Owner View", () => {
  it("renders uploader and upload button", () => {
    visitTaggedImageAsOwner();

    cy.contains("Tagged Image Uploader").should("be.visible");
    cy.contains("Upload").should("be.visible");
  });

  it("allows uploading an image", () => {
    visitTaggedImageAsOwner();

    cy.intercept("POST", "**/tagged/**", {
      statusCode: 200,
      body: {
        _id: "tagged1",
        imageUrl: "/mock-tagged.jpg",
        tags: [],
      },
    }).as("uploadTaggedImage");

    cy.get("input[type='file']").selectFile(
      {
        contents: Cypress.Buffer.from("fake image"),
        fileName: "test.jpg",
        mimeType: "image/jpeg",
      },
      { force: true },
    );

    cy.contains("Upload").click();

    cy.wait("@uploadTaggedImage");

    cy.get("img[alt='Taggable']").should("be.visible");
  });

  it("opens tag modal when image is clicked", () => {
    visitTaggedImageAsOwner({
      taggedImages: [
        {
          _id: "tagged1",
          imageUrl: "/mock-tagged.jpg",
          tags: [],
        },
      ],
    });

    cy.get("img[alt='Taggable']").click();

    cy.contains("Add Tag").should("be.visible");
    cy.get("input[placeholder='Enter label']").should("exist");
    cy.get("select").should("exist");
  });

  it("allows creating a tag", () => {
    visitTaggedImageAsOwner({
      menu: [{ _id: "m1", name: "Veg Burger" }],
      taggedImages: [
        {
          _id: "tagged1",
          imageUrl: "/mock-tagged.jpg",
          tags: [],
        },
      ],
    });

    cy.intercept("POST", "**/tagged/**/tag", {
      statusCode: 200,
      body: {
        tags: [
          {
            x: 0.4,
            y: 0.5,
            label: "Burger",
            menuItemId: "m1",
          },
        ],
      },
    }).as("createTag");

    cy.get("img[alt='Taggable']").click();

    cy.get("input[placeholder='Enter label']").type("Burger");
    cy.get("select").select("Veg Burger");

    cy.contains("Save Tag").click();

    cy.wait("@createTag");

    cy.contains("Burger").should("be.visible");
  });

  it("allows deleting a tag", () => {
    visitTaggedImageAsOwner({
      taggedImages: [
        {
          _id: "tagged1",
          imageUrl: "/mock-tagged.jpg",
          tags: [
            {
              x: 0.4,
              y: 0.5,
              label: "Delete Me",
              menuItemId: "m1",
            },
          ],
        },
      ],
    });

    // Wait for initial render
    cy.contains("Delete Me", { timeout: 10000 }).should("be.visible");

    // Intercept the refetch, NOT the delete
    cy.intercept("GET", `/tagged/${vendorId}`, {
      statusCode: 200,
      body: [
        {
          _id: "tagged1",
          imageUrl: "/mock-tagged.jpg",
          tags: [],
        },
      ],
    }).as("getTaggedImagesAfterDelete");

    // Click trash icon
    cy.contains("Delete Me").parent().find("button").click({ force: true });

    //  Wait for UI-driving request
    cy.wait("@getTaggedImagesAfterDelete");

    cy.contains("Delete Me").should("not.exist");
  });
});
