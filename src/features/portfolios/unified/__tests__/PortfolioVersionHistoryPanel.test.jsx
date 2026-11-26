import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PortfolioVersionHistoryPanel } from "../PortfolioVersionHistoryPanel";

jest.mock("react-toastify", () => ({
  toast: { error: jest.fn(), success: jest.fn(), info: jest.fn() },
}));

jest.mock("@/shared/api/portfolioApi", () => ({
  portfolioApi: {
    listVersions: jest.fn(),
    getVersion: jest.fn(),
    revertVersion: jest.fn(),
  },
}));

import { portfolioApi } from "@/shared/api/portfolioApi";
import { toast } from "react-toastify";

describe("PortfolioVersionHistoryPanel", () => {
  beforeEach(() => {
    window.confirm = jest.fn(() => true);
    portfolioApi.listVersions.mockResolvedValue({
      data: { versions: [{ versionNumber: 2, publishedAt: "2026-01-01T00:00:00Z", source: "owner" }] },
    });
    portfolioApi.revertVersion.mockResolvedValue({
      data: {
        draft: { title: "Reverted", sections: [], approvalState: "pending_owner", source: "owner" },
      },
    });
  });

  it("reverts a version into the draft when confirmed", async () => {
    const user = userEvent.setup();
    const onDraftRestored = jest.fn();

    render(
      <PortfolioVersionHistoryPanel
        portfolioId="example-id"
        draftsEnabled
        onDraftRestored={onDraftRestored}
      />
    );

    await screen.findByText(/v2/i);
    await user.click(screen.getByRole("button", { name: /restore to draft/i }));

    await waitFor(() => {
      expect(portfolioApi.revertVersion).toHaveBeenCalledWith("example-id", 2);
    });
    expect(onDraftRestored).toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalled();
  });
});