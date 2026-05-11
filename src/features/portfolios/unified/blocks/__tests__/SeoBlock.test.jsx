import React from "react";
import { render, waitFor } from "@testing-library/react";
import SeoBlock from "../SeoBlock";

describe("SeoBlock", () => {
  let originalTitle;

  beforeEach(() => {
    originalTitle = document.title;
  });

  afterEach(() => {
    document.title = originalTitle;
  });

  it("updates document title and description meta from props", async () => {
    render(
      <SeoBlock
        siteTitle="Portfolio — Alex"
        metaDescription="A great portfolio"
        keywords="react, web"
      />
    );

    await waitFor(() => {
      expect(document.title).toBe("Portfolio — Alex");
    });

    const desc = document.querySelector('meta[name="description"]');
    expect(desc).toBeTruthy();
    expect(desc.getAttribute("content")).toBe("A great portfolio");

    const kw = document.querySelector('meta[name="keywords"]');
    expect(kw.getAttribute("content")).toBe("react, web");
  });

  it("renders nothing in the document body", () => {
    const { container } = render(<SeoBlock siteTitle="Only title" />);
    expect(container.firstChild).toBeNull();
  });
});
