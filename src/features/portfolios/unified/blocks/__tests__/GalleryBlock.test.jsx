import React from "react";
import { render, screen } from "@testing-library/react";
import GalleryBlock, {
  galleryItemIsComparison,
  galleryItemSingleImageUrl,
} from "../GalleryBlock";

describe("GalleryBlock helpers", () => {
  it("galleryItemIsComparison is true when both before and after URLs exist", () => {
    expect(
      galleryItemIsComparison({
        beforeImageUrl: "https://a.com/b.jpg",
        afterImageUrl: "https://a.com/a.jpg",
      })
    ).toBe(true);
    expect(galleryItemIsComparison({ beforeImageUrl: "https://a.com/b.jpg" })).toBe(
      false
    );
  });

  it("galleryItemSingleImageUrl picks primary image when not comparison", () => {
    expect(
      galleryItemSingleImageUrl({ imageUrl: "https://x.com/1.png" })
    ).toBe("https://x.com/1.png");
    expect(
      galleryItemSingleImageUrl({
        beforeImageUrl: "https://x.com/b.png",
        afterImageUrl: "https://x.com/a.png",
      })
    ).toBeNull();
  });
});

describe("GalleryBlock templates", () => {
  it("healthcare default shows Gallery heading", () => {
    render(<GalleryBlock template="healthcare" />);
    expect(screen.getByRole("heading", { name: /^gallery$/i })).toBeInTheDocument();
  });

  it("handyman shows section title and a grid item", () => {
    render(
      <GalleryBlock
        template="handyman"
        sectionTitle="Past work"
        items={[
          {
            title: "Kitchen",
            category: "Kitchen",
            imageUrl: "https://example.com/k.jpg",
          },
        ]}
      />
    );
    expect(screen.getByRole("heading", { name: /past work/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /kitchen/i })).toBeInTheDocument();
  });

  it("agent shows gallery panel heading with items", () => {
    render(
      <GalleryBlock
        template="agent"
        sectionTitle="Work samples"
        items={[
          {
            title: "Site",
            imageUrl: "https://example.com/s.png",
          },
        ]}
      />
    );
    expect(
      screen.getByRole("heading", { name: /work samples/i })
    ).toBeInTheDocument();
  });
});
