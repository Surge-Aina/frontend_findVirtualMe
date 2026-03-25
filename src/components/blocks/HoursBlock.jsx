import { FaClock } from "react-icons/fa";

export default function HoursBlock({ template, ...data }) {
  const entries = [
    { label: "Weekdays", value: data.weekdays },
    { label: "Saturday", value: data.saturday },
    { label: "Sunday", value: data.sunday },
  ].filter((e) => e.value);

  if (entries.length === 0) return null;

  return (
    <section className="py-12 bg-white">
      <div className="max-w-xl mx-auto px-4">
        <div className="flex items-center gap-3 mb-6">
          <FaClock className="text-blue-600 text-xl" />
          <h2 className="text-2xl font-bold text-gray-900">Business Hours</h2>
        </div>
        <div className="bg-gray-50 rounded-xl p-6 space-y-3">
          {entries.map(({ label, value }) => (
            <div key={label} className="flex justify-between text-gray-700">
              <span className="font-medium">{label}</span>
              <span>{value}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
