import { render, screen, waitFor } from "@testing-library/react";
import axios from "axios";
import SocialLinksBlock from "../SocialLinksBlock";
import { PortfolioViewProvider } from "../../context/PortfolioViewContext";

jest.mock("axios");

const portfolio = {
  _id: "507f1f77bcf86cd799439099",
  template: "agent",
  socialLinks: { github: "https://github.com/fallback" },
  sections: [],
};

function renderBlock(data) {
  return render(
    <PortfolioViewProvider portfolio={portfolio}>
      <SocialLinksBlock template="agent" {...data} />
    </PortfolioViewProvider>
  );
}

describe("SocialLinksBlock", () => {
  beforeEach(() => {
    axios.get.mockReset();
  });

  it("renders only enabled platforms with sanitized hrefs", async () => {
    axios.get.mockResolvedValue({
      data: {
        links: {
          github: "https://github.com/demo",
          twitter: "javascript:alert(1)",
          linkedin: "https://linkedin.com/in/demo",
        },
      },
    });

    renderBlock({
      sectionTitle: "Connect",
      platforms: { github: true, twitter: true, linkedin: false, website: false },
      linkSource: "socialLinksModule",
    });

    await waitFor(() => {
      expect(screen.getByLabelText("GitHub")).toBeInTheDocument();
    });

    const github = screen.getByLabelText("GitHub");
    expect(github).toHaveAttribute("href", "https://github.com/demo");
    expect(github).toHaveAttribute("rel", "noopener noreferrer");
    expect(screen.queryByLabelText("Twitter")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("LinkedIn")).not.toBeInTheDocument();
  });

  it("falls back to portfolio.socialLinks when API misses", async () => {
    axios.get.mockRejectedValue(new Error("not found"));

    renderBlock({
      sectionTitle: "Connect",
      platforms: { github: true, twitter: false, linkedin: false, website: false },
    });

    await waitFor(() => {
      expect(screen.getByLabelText("GitHub")).toHaveAttribute(
        "href",
        "https://github.com/fallback"
      );
    });
  });
});