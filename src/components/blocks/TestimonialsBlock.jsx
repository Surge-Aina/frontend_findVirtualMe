import { FaQuoteLeft } from "react-icons/fa";

export default function TestimonialsBlock({ template, ...data }) {
  const items = data.items || [];
  const sectionTitle = data.sectionTitle || "What Our Clients Say";

  if (items.length === 0) return null;

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">{sectionTitle}</h2>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {items.map((t, i) => (
            <div key={i} className="bg-gray-50 rounded-xl p-8 shadow-md">
              <FaQuoteLeft className="text-amber-400 text-2xl mb-4" />
              <p className="text-gray-700 italic mb-6">&ldquo;{t.quote}&rdquo;</p>
              <div className="border-t border-gray-200 pt-4">
                <p className="font-bold text-gray-900">{t.name}</p>
                <p className="text-sm text-gray-500">
                  {[t.service, t.location].filter(Boolean).join(" · ")}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
