import { render, screen } from "@testing-library/react";
import QrCodeBlock from "../QrCodeBlock";

jest.mock("qrcode.react", () => ({
  QRCodeCanvas: ({ value, size }) => (
    <div data-testid="qr-mock" data-value={value} data-size={size} />
  ),
}));

describe("QrCodeBlock", () => {
  it("encodes safe https targets for the QR canvas", () => {
    render(
      <QrCodeBlock
        template="agent"
        sectionTitle="Scan"
        target="https://example.test/welcome"
        size={128}
      />
    );
    const qr = screen.getByTestId("qr-mock");
    expect(qr.getAttribute("data-value")).toBe("https://example.test/welcome");
    expect(qr.getAttribute("data-size")).toBe("128");
  });

  it("does not render when target is unsafe", () => {
    render(
      <QrCodeBlock template="agent" sectionTitle="Scan" target="javascript:alert(1)" size={100} />
    );
    expect(screen.queryByTestId("qr-code-block")).not.toBeInTheDocument();
  });
});