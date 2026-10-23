import React from "react";
import { render, screen } from "@testing-library/react";
import CertificationsBlock from "../CertificationsBlock";

describe("CertificationsBlock", () => {
  it("renders section title and credential name", () => {
    render(
      <CertificationsBlock
        template="agent"
        sectionTitle="Credentials"
        items={[{ name: "AWS SA", issuer: "Amazon" }]}
      />
    );
    expect(screen.getByRole("heading", { name: /credentials/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /aws sa/i })).toBeInTheDocument();
  });

  it("renders default placeholder card when items empty", () => {
    render(<CertificationsBlock template="agent" items={[]} />);
    expect(screen.getByRole("heading", { name: /add a credential/i })).toBeInTheDocument();
  });
});
