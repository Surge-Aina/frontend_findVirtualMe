import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axiosAuth from "@/shared/api/axiosAuth";
import { PortfolioEditorContext } from "../context/PortfolioEditorContext";
import { ImageFieldEditor } from "../ImageFieldEditor";

jest.mock("@/shared/api/axiosAuth", () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
  },
}));

function renderWithId(ui, portfolioId = "p1") {
  return render(
    <PortfolioEditorContext.Provider value={{ portfolioId }}>
      {ui}
    </PortfolioEditorContext.Provider>
  );
}

describe("ImageFieldEditor", () => {
  beforeEach(() => {
    axiosAuth.post.mockReset();
    global.fetch = jest.fn();
  });

  it("shows hint when portfolio id is missing", () => {
    renderWithId(
      <ImageFieldEditor label="Image" value="" onChange={jest.fn()} />,
      null
    );
    expect(screen.getByText(/save portfolio first to upload/i)).toBeInTheDocument();
  });

  it("rejects oversize files", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    renderWithId(
      <ImageFieldEditor label="Photo" value="" onChange={onChange} />
    );

    const file = new File([new Uint8Array(6 * 1024 * 1024)], "big.jpg", {
      type: "image/jpeg",
    });
    const input = document.querySelector('input[type="file"]');
    await user.upload(input, file);

    expect(await screen.findByText(/5 mb or smaller/i)).toBeInTheDocument();
    expect(axiosAuth.post).not.toHaveBeenCalled();
  });

  it("rejects non-image file types", async () => {
    renderWithId(
      <ImageFieldEditor label="Photo" value="" onChange={jest.fn()} />
    );

    const file = new File(["x"], "x.txt", { type: "text/plain" });
    const input = document.querySelector('input[type="file"]');
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(
        screen.getByText("Use JPEG, PNG, WebP, or GIF.")
      ).toBeInTheDocument();
    });
  });

  it("uploads file and sets public URL from S3 flow", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    axiosAuth.post.mockResolvedValue({
      data: {
        uploadUrl: "https://bucket.example/put",
        publicUrl: "https://cdn.example/pub.jpg",
      },
    });
    global.fetch.mockResolvedValue({ ok: true, status: 200 });

    renderWithId(
      <ImageFieldEditor label="Photo" value="" onChange={onChange} />
    );

    const file = new File([new Uint8Array(100)], "a.png", { type: "image/png" });
    const input = document.querySelector('input[type="file"]');
    await user.upload(input, file);

    await screen.findByRole("button", { name: /^upload image$/i });

    expect(axiosAuth.post).toHaveBeenCalledWith(
      "/api/media/s3-upload-url",
      expect.objectContaining({
        fileType: "image/png",
        portfolioId: "p1",
      })
    );
    expect(global.fetch).toHaveBeenCalledWith(
      "https://bucket.example/put",
      expect.objectContaining({ method: "PUT" })
    );
    expect(onChange).toHaveBeenCalledWith("https://cdn.example/pub.jpg");
  });
});
