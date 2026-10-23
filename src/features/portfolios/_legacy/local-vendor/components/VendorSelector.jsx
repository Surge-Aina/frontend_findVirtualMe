import { useEffect, useState, useRef, useContext } from "react";
import { useVendor } from "@/features/portfolios/_legacy/local-vendor/context/VendorContext";
import { AuthContext } from "@/shared/context/AuthContext.jsx";
import axiosAuth, { authFailureMessage } from "@/shared/api/axiosAuth";
import { logApiError } from "@/shared/api/safeLog";

function asVendorList(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.vendors)) return payload.vendors;
  if (Array.isArray(payload?.data)) return payload.data;
  return null;
}

function isAdminUser(user) {
  if (!user) return false;
  if (user.isAdmin === true) return true;
  if (String(user.role || "").toLowerCase() === "admin") return true;
  return Array.isArray(user.roles) && user.roles.includes("admin");
}

/** Owner-list route is not registered yet, so /vendor/mine hits /:vendorId and 500s. */
function isMissingOwnerList(error) {
  const status = error?.response?.status;
  return !error?.response || status === 400 || status === 404 || status === 500;
}

export default function VendorSelector() {
  const { vendorId, setVendorId } = useVendor();
  const { user, loading: authLoading } = useContext(AuthContext);
  const [vendors, setVendors] = useState([]);
  const [open, setOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [form, setForm] = useState({ name: "", email: "" });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [listError, setListError] = useState("");
  const [actionError, setActionError] = useState("");
  const dropdownRef = useRef(null);
  const isAdmin = isAdminUser(user);

  useEffect(() => {
    if (authLoading) return;
    let cancelled = false;

    async function loadVendors() {
      try {
        const res = await axiosAuth.get("/vendor/mine", { skipAuthToast: true });
        const list = asVendorList(res.data);
        if (list) {
          if (!cancelled) {
            setVendors(list);
            setListError("");
          }
          return;
        }
      } catch (err) {
        const status = err?.response?.status;
        const adminFallback = isAdmin && (isMissingOwnerList(err) || status === 403);
        if (!adminFallback) {
          if (!cancelled) {
            if (isMissingOwnerList(err)) {
              setVendors([]);
              setListError("");
            } else {
              setVendors([]);
              setListError(authFailureMessage(err) || "Could not load your vendors.");
            }
          }
          return;
        }
      }

      if (!isAdmin) {
        if (!cancelled) setVendors([]);
        return;
      }

      try {
        const res = await axiosAuth.get("/vendor", { skipAuthToast: true });
        const list = asVendorList(res.data) || [];
        if (!cancelled) {
          setVendors(list);
          setListError("");
        }
      } catch (err) {
        if (!cancelled) {
          setVendors([]);
          setListError(authFailureMessage(err) || "Could not load vendors.");
        }
      }
    }

    loadVendors();
    return () => {
      cancelled = true;
    };
  }, [authLoading, isAdmin]);

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

  const handleCreateVendor = async (e) => {
    e.preventDefault();
    setActionError("");
    try {
      const res = await axiosAuth.post("/vendor", form, { skipAuthToast: true });
      const newVendor = res.data;
      if (!newVendor?._id) {
        setActionError("Could not create the vendor.");
        return;
      }
      setVendors((prev) => [...prev, newVendor]);
      setVendorId(newVendor._id);
      setForm({ name: "", email: "" });
      setShowForm(false);
      setOpen(false);
    } catch (err) {
      logApiError(err, "Failed to create vendor");
      setActionError(
        authFailureMessage(err) || err.response?.data?.error || "Could not create the vendor."
      );
    }
  };

  const handleInjectVendor = async () => {
    if (!file) return alert("Please select a file");
    setLoading(true);
    setActionError("");
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await axiosAuth.post("/vendor/inject", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        skipAuthToast: true,
      });

      const { vendor } = res.data;
      setVendors((prev) => [...prev, vendor]);
      setVendorId(vendor._id);
      setFile(null);
      setShowUpload(false);
      setOpen(false);
    } catch (err) {
      logApiError(err, "Failed to inject vendor");
      const authMessage = authFailureMessage(err);
      if (authMessage) {
        setActionError(authMessage);
      } else if (err.response?.status === 400 && err.response.data?.error) {
        alert(err.response.data.error);
      } else {
        alert("Something went wrong while creating the vendor. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="px-3 py-2 bg-gray-100 rounded-md hover:bg-gray-200 flex items-center gap-1 text-sm font-medium"
      >
        {vendorId
          ? vendors.find((v) => v._id === vendorId)?.name || "Select Vendor"
          : "Select Vendor"}
        <span className="ml-1">▾</span>
      </button>
      {listError && (
        <p role="alert" className="mt-1 max-w-xs text-xs text-red-600">
          {listError}
        </p>
      )}

      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-white border rounded-md shadow-lg z-50">
          <div className="py-1 max-h-64 overflow-y-auto">
            {actionError && (
              <p role="alert" className="px-4 py-2 text-xs text-red-600">
                {actionError}
              </p>
            )}
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

            {showForm ? (
              <form onSubmit={handleCreateVendor} className="p-3 flex flex-col gap-2">
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
