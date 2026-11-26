import { QRCodeCanvas } from "qrcode.react";
import {
  clampQrSize,
  defaultSitePublicUrl,
  resolveQrEncodeTarget,
} from "./featureUrlUtils";

export default function QrCodeBlock({ template, ...data }) {
  const title = data.sectionTitle || data.title || "Scan to visit";
  const caption = data.caption || "";
  const size = clampQrSize(data.size);
  const encodeValue = resolveQrEncodeTarget(data.target, defaultSitePublicUrl);

  if (!encodeValue) return null;

  const isPM = template === "projectManager" || template === "dataScientist" || template === "agent";
  const sectionClass = isPM ? "py-12" : "py-12 bg-gray-50";

  return (
    <section className={sectionClass} data-testid="qr-code-block">
      <div className="max-w-md mx-auto px-4 text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{title}</h2>
        <QRCodeCanvas
          value={encodeValue}
          size={size}
          className="mx-auto"
          data-testid="qr-code-canvas"
        />
        {caption ? <p className="mt-4 text-sm text-gray-600 dark:text-neutral-300">{caption}</p> : null}
      </div>
    </section>
  );
}