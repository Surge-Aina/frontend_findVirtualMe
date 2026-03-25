export default function ProcessBlock({ template, ...data }) {
  const steps = data.steps || [];
  const sectionTitle = data.sectionTitle || "Our Process";

  if (steps.length === 0) return null;

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">{sectionTitle}</h2>
        <div className="space-y-8">
          {steps.map((step, i) => (
            <div key={i} className="flex gap-6 items-start">
              <div className="shrink-0 w-12 h-12 rounded-full bg-amber-500 text-white flex items-center justify-center text-xl font-bold shadow-md">
                {step.number || i + 1}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">{step.title}</h3>
                <p className="text-gray-600 mt-1">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
