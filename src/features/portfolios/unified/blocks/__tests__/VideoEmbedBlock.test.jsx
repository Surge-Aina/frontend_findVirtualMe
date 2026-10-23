import React from "react";
import { render, screen } from "@testing-library/react";
import VideoEmbedBlock from "../VideoEmbedBlock";

describe("VideoEmbedBlock", () => {
  it("normalizes YouTube watch URL to embed iframe src", () => {
    render(
      <VideoEmbedBlock
        template="agent"
        title="Talk"
        embedUrl="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
      />
    );
    const iframe = screen.getByTitle(/talk/i);
    expect(iframe).toHaveAttribute(
      "src",
      "https://www.youtube.com/embed/dQw4w9WgXcQ"
    );
  });

  it("shows placeholder when no embed or video URL", () => {
    render(<VideoEmbedBlock template="agent" title="Empty" />);
    expect(
      screen.getByText(/add an embed url or hosted video url/i)
    ).toBeInTheDocument();
    expect(screen.queryByRole("iframe")).not.toBeInTheDocument();
  });

  it("normalizes youtu.be links to embed", () => {
    render(
      <VideoEmbedBlock
        template="handyman"
        embedUrl="https://youtu.be/dQw4w9WgXcQ"
      />
    );
    expect(screen.getByTitle(/embedded video/i)).toHaveAttribute(
      "src",
      "https://www.youtube.com/embed/dQw4w9WgXcQ"
    );
  });

  it("uses native video when embedUrl missing but videoUrl is set", () => {
    render(
      <VideoEmbedBlock
        template="agent"
        videoUrl="https://example.com/video.mp4"
        posterImageUrl="https://example.com/poster.jpg"
      />
    );
    const video = document.querySelector("video");
    expect(video).toHaveAttribute("src", "https://example.com/video.mp4");
    expect(video).toHaveAttribute("poster", "https://example.com/poster.jpg");
  });

  it("shows provider hint text when provided", () => {
    render(
      <VideoEmbedBlock template="agent" provider="Vimeo" embedUrl="https://www.youtube.com/embed/x" />
    );
    expect(screen.getByText("Vimeo")).toBeInTheDocument();
  });
});
