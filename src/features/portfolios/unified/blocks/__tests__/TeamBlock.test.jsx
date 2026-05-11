import React from "react";
import { render, screen } from "@testing-library/react";
import TeamBlock from "../TeamBlock";

describe("TeamBlock", () => {
  it("renders section title and member name", () => {
    render(
      <TeamBlock
        template="agent"
        sectionTitle="Our team"
        items={[{ name: "Jordan Lee", role: "PM", bio: "Ships on time." }]}
      />
    );
    expect(screen.getByRole("heading", { name: /our team/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /jordan lee/i })).toBeInTheDocument();
  });

  it("renders profile link when profileUrl set", () => {
    render(
      <TeamBlock
        items={[
          {
            name: "Sam",
            role: "Dev",
            bio: "Bio",
            profileUrl: "https://example.com/sam",
          },
        ]}
      />
    );
    const link = screen.getByRole("link", { name: /view profile/i });
    expect(link).toHaveAttribute("href", "https://example.com/sam");
  });
});
