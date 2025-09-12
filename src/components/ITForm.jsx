import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext.jsx";

const REQUEST_OPTIONS = [
  "Request additional portfolio slots",
  "Request a refund",
  "Upgrade subscription",
  "Downgrade subscription",
  "Update account information",
  "Coupon not working",
  "Report a technical issue",
  "Delete my account",
];

export default function ITForm() {
  const { contextLoggedIn, user } = useContext(AuthContext);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    requestType: "",
    portfolioId: "",
    message: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // for now just shows an alert, need to implement backend
    alert("Request submitted!");
    setForm({
      name: "",
      email: "",
      phone: "",
      requestType: "",
      portfolioId: "",
      message: "",
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#f7faff] to-[#f3f6fb] py-12 px-2">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 w-full max-w-md mx-auto p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2 text-center">Support & Help</h1>
        <p className="text-sm text-gray-500 mb-6 text-center">
          Submit a request or suggestion and our team will get back to you soon.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!contextLoggedIn && (
            <>
              <div>
                <label className="block text-gray-700 text-xs font-medium mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm"
                  placeholder="Your Name"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 text-xs font-medium mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm"
                  placeholder="your@email.com"
                  required
                />
              </div>
            </>
          )}
          <div>
            <label className="block text-gray-700 text-xs font-medium mb-1">Request Type</label>
            <select
              name="requestType"
              value={form.requestType}
              onChange={handleChange}
              className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm"
              required
            >
              <option value="">Select an option</option>
              {REQUEST_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-gray-700 text-xs font-medium mb-1">Portfolio ID (if relevant)</label>
            <input
              type="text"
              name="portfolioId"
              value={form.portfolioId}
              onChange={handleChange}
              className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm"
              placeholder="Portfolio ID"
            />
          </div>
          <div>
            <label className="block text-gray-700 text-xs font-medium mb-1">Describe your issue or request</label>
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm"
              placeholder="Please provide details..."
              rows={4}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-semibold py-2 rounded-md shadow hover:bg-blue-700 transition-all"
          >
            Submit Request
          </button>
        </form>
      </div>
    </div>
  );
}