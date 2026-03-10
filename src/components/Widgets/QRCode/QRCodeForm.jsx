// QRCodeForm.jsx
import { useState } from "react";
import axiosAuth from "../../../utils/axiosAuth";

export default function QRCodeForm({ onSuccess, portfolioId, portfolioType, onClose }) {
  const initialFormState = {
    title: "",
    description: "",
    url: "",
    align: "right",
    alignVertical: "bottom",
    size: 160,
    active: true,
    portfolio: {
      id: portfolioId,
      type: portfolioType
    }
  };

  const [formData, setFormData] = useState(initialFormState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await axiosAuth.post(`/qrCode`, formData);
      setLoading(false);
      if (onSuccess) onSuccess(res.data);
      setFormData(initialFormState);
      if (onClose) onClose();
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || "Failed to create QR code");
      console.error("QR code creation failed", err);
    }
  };


  const labelClass = "block text-sm font-medium text-gray-700 mb-1";
  const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all";

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
      <h3 className="text-xl font-semibold text-gray-800 mb-6">Create New QR Code</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className={labelClass}>Title <span className="text-red-500">*</span></label>
          <input
            type="text"
            name="title"
            className={inputClass}
            placeholder="Main Display Title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className={labelClass}>Description</label>
          <input
            type="text"
            name="description"
            className={inputClass}
            placeholder="Short detail about this code"
            value={formData.description}
            onChange={handleChange}
          />
        </div>

        {/* URL */}
        <div>
          <label className={labelClass}>URL <span className="text-red-500">*</span></label>
          <input
            type="url"
            name="url"
            className={inputClass}
            placeholder="https://www.findvirtual.me/"
            value={formData.url}
            onChange={handleChange}
            required
          />
        </div>

        {/* Alignment Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Horizontal</label>
            <select name="align" className={inputClass} value={formData.align} onChange={handleChange}>
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Vertical</label>
            <select name="alignVertical" className={inputClass} value={formData.alignVertical} onChange={handleChange}>
              <option value="top">Top</option>
              <option value="center">Center</option>
              <option value="bottom">Bottom</option>
            </select>
          </div>
        </div>


        {/* Size slider */}
        <div className="mb-5">
            <div className="flex justify-between items-center mb-1.5">
                <label className={labelClass + " mb-0"}>Size</label>
                <span className=" text-blue-600">{formData.size}px</span>
            </div>
            <input
                type="range"
                name="size"
                value={formData.size}
                onChange={handleChange}
                min={50}
                max={250}
                className="w-full h-0.5 bg-slate-700 appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-slate-600 mt-1">
                <span>50px</span>
                <span>250px</span>
            </div>
        </div>

        {/* Active Checkbox */}
        <div className="flex items-end gap-4">
          <div className="flex items-center h-[42px] px-2">
            <label className="flex items-center cursor-pointer space-x-2">
              <input
                type="checkbox"
                name="active"
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                checked={formData.active}
                onChange={handleChange}
              />
              <span className="text-sm font-medium text-gray-700">Active</span>
            </label>
          </div>
        </div>

        {/* Live Preview Picture */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-3 text-center">Live Preview</p>
            <div className="flex justify-center items-center min-h-[160px] bg-white rounded shadow-inner overflow-hidden">
                <div 
                    style={{ 
                        width: `${formData.size}px`, 
                        height: `${formData.size}px`,
                        transition: 'all 0.1s ease-out' 
                    }}
                    className="bg-gray-100 flex items-center justify-center border border-gray-200 relative"
                >
                    {/* Placeholder QR Image */}
                    <img 
                        src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://www.findvirtual.me/" 
                        alt="QR Preview"
                        className="w-full h-full opacity-80"
                    />
                </div>
            </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 px-4 rounded-md font-medium text-white transition-colors 
            ${loading 
              ? "bg-blue-300 cursor-not-allowed" 
              : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800 shadow-sm"
            }`}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Creating...
            </span>
          ) : (
            "Create QR Code"
          )}
        </button>
      </form>
    </div>
  );
}