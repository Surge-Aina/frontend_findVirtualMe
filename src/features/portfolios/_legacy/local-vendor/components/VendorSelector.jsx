import { useEffect, useState, useRef } from "react";
import { useVendor } from "@/features/portfolios/_legacy/local-vendor/context/VendorContext";
import API from "../services/api";

export default function VendorSelector() {
  const { vendorId, setVendorId } = useVendor();
  const [vendors, setVendors] = useState([]);
  const [open, setOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [form, setForm] = useState({ name: "", email: "" });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  // Fetch all vendors
  useEffect(() => {
    API.get("/vendor")
      .then((res) => setVendors(res.data || []))
      .catch((err) => console.error("Failed to load vendors", err));
  }, []);

  // Close dropdown if clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
        setShowForm(false);
        setShowUpload(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Create vendor manually
  const handleCreateVendor = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_API}/vendor`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const newVendor = await res.json();
      setVendors((prev) => [...prev, newVendor]);
      setVendorId(newVendor._id); // auto-select
      setForm({ name: "", email: "" });
      setShowForm(false);
      setOpen(false);
    } catch (err) {
      console.error("Failed to create vendor", err);
    }
  };

  // Inject vendor via PDF/DOC
  const handleInjectVendor = async () => {
    if (!file) return alert("Please select a file");
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await API.post("/vendor/inject", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const { vendor } = res.data;
      setVendors((prev) => [...prev, vendor]);
      setVendorId(vendor._id);
      setFile(null);
      setShowUpload(false);
      setOpen(false);
    } catch (err) {
      console.error("Failed to inject vendor", err);
      // Show server-side message if available
      if (err.response?.status === 400 && err.response.data?.error) {
        alert(err.response.data.error);
      } else {
        alert(
          "Something went wrong while creating the vendor. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="px-3 py-2 bg-gray-100 rounded-md hover:bg-gray-200 flex items-center gap-1 text-sm font-medium"
      >
        {vendorId
          ? vendors.find((v) => v._id === vendorId)?.name || "Select Vendor"
          : "Select Vendor"}
        <span className="ml-1">▾</span>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-white border rounded-md shadow-lg z-50">
          <div className="py-1 max-h-64 overflow-y-auto">
            {vendors.map((v) => (
              <button
                key={v._id}
                onClick={() => {
                  setVendorId(v._id);
                  setOpen(false);
                }}
                className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                  vendorId === v._id ? "bg-gray-50 font-semibold" : ""
                }`}
              >
                {v.name}
              </button>
            ))}

            <hr className="my-1" />

            {/* Manual Form */}
            {showForm ? (
              <form
                onSubmit={handleCreateVendor}
                className="p-3 flex flex-col gap-2"
              >
                <input
                  type="text"
                  placeholder="Vendor name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="border p-2 rounded text-sm"
                  required
                />
                <input
                  type="email"
                  placeholder="Vendor email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="border p-2 rounded text-sm"
                  required
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white px-3 py-1 rounded text-sm"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 bg-gray-300 px-3 py-1 rounded text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : showUpload ? (
              // Upload Doc Form
              <div className="p-3 flex flex-col gap-2">
                <input
                  type="file"
                  accept=".pdf,.docx"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="border p-2 rounded text-sm"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleInjectVendor}
                    disabled={loading}
                    className="flex-1 bg-emerald-600 text-white px-3 py-1 rounded text-sm"
                  >
                    {loading ? "Creating..." : "Upload"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowUpload(false)}
                    className="flex-1 bg-gray-300 px-3 py-1 rounded text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <button
                  onClick={() => setShowForm(true)}
                  className="block w-full text-left px-4 py-2 text-sm text-emerald-600 hover:bg-emerald-50"
                >
                  + New Vendor (Manual)
                </button>
                <button
                  onClick={() => setShowUpload(true)}
                  className="block w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50"
                >
                  + New Vendor (Upload Doc)
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
