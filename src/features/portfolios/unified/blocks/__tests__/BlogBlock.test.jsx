import React from "react";
import { render, screen } from "@testing-library/react";
import BlogBlock from "../BlogBlock";

describe("BlogBlock", () => {
  it("returns null when there are no posts", () => {
    const { container } = render(<BlogBlock template="agent" posts={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders post title and blog heading", () => {
    render(
      <BlogBlock
        template="agent"
        posts={[{ id: "1", title: "Hello World", excerpt: "Short" }]}
      />
    );
    expect(screen.getByRole("heading", { name: /^blog$/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /hello world/i })).toBeInTheDocument();
  });
});
