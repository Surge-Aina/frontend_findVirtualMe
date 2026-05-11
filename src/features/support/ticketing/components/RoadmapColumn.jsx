import { useRef } from "react";

export default function RoadmapColumn({
  title = "Integration Roadmap",
  items = [],
  renderItem,
}) {
  const scroller = useRef(null);

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-semibold">{title}</h2>
      </div>

      <div
        ref={scroller}
        className="flex flex-col gap-3 overflow-y-auto max-h-96 pr-2
                   [scrollbar-width:thin] [scrollbar-color:theme(colors.gray.300)_transparent]"
        style={{ scrollbarGutter: "stable", overflowX: "visible" }}
        role="list"
        aria-label={`${title} items`}
      >
        {items.map((it) => (
          <div key={it.ticketID} role="listitem">
            {renderItem ? (
              renderItem(it)
            ) : (
              <article className="rounded-xl border p-4 hover:shadow transition-shadow bg-white">
                <h3 className="font-medium">{it.requestType}</h3>
                <p className="text-sm text-gray-500 mt-1">{it.message}</p>
              </article>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}


