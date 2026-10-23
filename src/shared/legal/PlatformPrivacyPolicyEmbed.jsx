import termlyPrivacyPolicyHtml from "./termlyPrivacyPolicy.html?raw";

/**
 * Renders Termly (or any) HTML fragment inline. Uses dangerouslySetInnerHTML so &lt;style&gt;
 * and markup from the export apply without a separate iframe request (avoids blank embeds and
 * blob/CSP quirks). Inline &lt;script&gt; in the file will not run (browser/React behavior).
 */
export default function PlatformPrivacyPolicyEmbed({
  className = "",
  minHeight = "min-h-[70vh]",
}) {
  const raw =
    typeof termlyPrivacyPolicyHtml === "string"
      ? termlyPrivacyPolicyHtml.trim()
      : "";

  if (!raw) {
    return (
      <div
        className={`rounded-lg border border-amber-200 bg-amber-50 text-amber-950 text-sm p-5 ${minHeight} overflow-y-auto ${className}`}
      >
        <p className="font-semibold">Privacy policy file is empty or not saved</p>
        <p className="mt-2 text-amber-900/90 leading-relaxed">
          Paste your Termly HTML export into{" "}
          <code className="text-xs bg-amber-100/90 px-1.5 py-0.5 rounded font-mono">
            frontend_findVirtualMe/src/shared/legal/termlyPrivacyPolicy.html
          </code>
          , save the file, then restart <code className="text-xs font-mono">npm run dev</code> so
          Vite picks up the change.
        </p>
        <p className="mt-3 text-xs text-amber-800/80">
          If you only see generic placeholder text, the bundle had no HTML to load—usually the
          editor buffer was not written to disk.
        </p>
      </div>
    );
  }

  return (
    <div
      className={`termly-privacy-policy-embed text-slate-800 overflow-y-auto [word-break:break-word] ${minHeight} ${className}`}
      dangerouslySetInnerHTML={{ __html: raw }}
    />
  );
}
