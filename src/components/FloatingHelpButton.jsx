import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function FloatingHelpButton() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <div
      className={`fixed top-20 right-0 z-50 flex flex-col items-end transition-all duration-300`}
      style={{ minWidth: open ? 160 : 48 }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        className={`flex items-center bg-blue-300/80 text-slate-800 px-3 py-3 rounded-l-2xl shadow-lg transition-all duration-300 group focus:outline-none`}
        style={{ minWidth: open ? 120 : 28 }}
        onClick={() => navigate("/support")}
        aria-label="Need Help?"
      >
        {!open && (
          <span className="material-icons mr-2">?</span>
        )}
        <span
          className={`whitespace-nowrap transition-opacity duration-300 ${
            open ? "opacity-100 mr-2" : "opacity-0 w-0"
          }`}
        >
          Need Help?
        </span>
      </button>
    </div>
  );
}