import { useEffect, useId, useRef, useState } from "react";

export default function MermaidFigure({ title, chart }) {
  const reactId = useId().replace(/:/g, "");
  const host = useRef(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "strict",
          theme: "base",
          themeVariables: {
            primaryColor: "#e2e8f0",
            primaryTextColor: "#0f172a",
            primaryBorderColor: "#334155",
            lineColor: "#334155",
            fontFamily: "ui-sans-serif, system-ui, sans-serif",
          },
        });
        const { svg } = await mermaid.render(`fvm-${reactId}`, chart);
        if (!cancelled && host.current) host.current.innerHTML = svg;
      } catch {
        if (!cancelled) setError("This diagram could not be drawn.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [chart, reactId]);

  return (
    <figure className="bg-white rounded-xl shadow-md p-4">
      <figcaption className="text-sm font-semibold text-slate-800 mb-3">{title}</figcaption>
      {error ? <p className="text-sm text-red-500">{error}</p> : <div ref={host} className="overflow-x-auto" />}
    </figure>
  );
}
