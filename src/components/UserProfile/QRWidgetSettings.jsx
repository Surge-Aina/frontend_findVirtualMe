import { useContext, useState, useEffect } from "react";
import { AuthContext } from "@/shared/context/AuthContext";
import axiosAuth from "@/shared/api/axiosAuth";

export default function QRWidgetSettings() {
  const { user } = useContext(AuthContext);

  const [selectedPortfolio, setSelectedPortfolio] = useState(null);
  const [portfolioQrs, setPortfolioQrs] = useState([]);
  const [qrActive, setQrActive] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load QRs when portfolio changes
  useEffect(() => {
    if (!selectedPortfolio) return;

    const loadQrs = async () => {
      try {
        setLoading(true);

        const res = await axiosAuth.get("/qrCode");
        const allQrs = res.data || [];

        console.log("Selected portfolio:", selectedPortfolio);
        console.log("All QRs:", allQrs);

        const matched = allQrs.filter(
          (qr) =>
            qr.portfolio?.id?.toString() === selectedPortfolio.portfolioId.toString() &&
            qr.portfolio?.type === normalizeType(selectedPortfolio.portfolioType),
        );

        setPortfolioQrs(matched);
        setQrActive(matched.some((qr) => qr.active));
      } catch (err) {
        console.error("Failed to load QRs", err);
      } finally {
        setLoading(false);
      }
    };

    loadQrs();
  }, [selectedPortfolio]);

  useEffect(() => {
    const savedId = localStorage.getItem("selectedQrPortfolio");

    if (savedId && user?.portfolios) {
      const p = user.portfolios.find((x) => x.portfolioId.toString() === savedId);

      if (p) setSelectedPortfolio(p);
    }
  }, [user]);

  const normalizeType = (type) => {
    if (type.endsWith("Portfolio")) return type;
    return type + "Portfolio";
  };

  const handleToggle = async () => {
    try {
      const newState = !qrActive;

      console.log("portfolioQrs:", portfolioQrs);
      console.log("Updating to:", newState);

      if (portfolioQrs.length > 0) {
        await Promise.all(portfolioQrs.map((qr) => axiosAuth.put(`/qrCode/${qr._id}`, { active: newState })));
      }

      setQrActive(newState);
    } catch (err) {
      console.error("Toggle failed", err);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">QR Customization</h2>
        <p className="text-gray-600 text-sm">Enable or disable QR codes for each portfolio.</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Portfolio</label>

        <select
          className="w-full border border-gray-300 rounded-lg p-2"
          value={selectedPortfolio?.portfolioId || ""}
          onChange={(e) => {
            const p = user.portfolios.find((x) => x.portfolioId.toString() === e.target.value);

            setSelectedPortfolio(p || null);

            localStorage.setItem("selectedQrPortfolio", e.target.value);
          }}
        >
          <option value="">Select portfolio</option>

          {user.portfolios?.map((p) => (
            <option key={p.portfolioId} value={p.portfolioId}>
              {p.portfolioType}
            </option>
          ))}
        </select>
      </div>

      {selectedPortfolio && !loading && (
        <div className="flex items-center justify-between gap-4 border rounded-lg p-4">
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-medium text-gray-900">Enable QR Widget</h3>
            <p className="text-xs text-gray-500">Toggle all QR codes for this portfolio.</p>
          </div>

          <div className="shrink-0 flex-none">
          <button
            onClick={handleToggle}
            style={{
              width: "52px",
              minWidth: "52px",
              height: "24px",
              minHeight: "24px",
              maxHeight: "24px",
            }}
            className={`relative inline-flex shrink-0 flex-none items-center rounded-full transition ${
              qrActive ? "bg-blue-600" : "bg-gray-300"
            }`}
          >
            <span
              className={`absolute left-1 top-1/2 h-4 w-4 -translate-y-1/2 transform rounded-full bg-white shadow transition ${
                qrActive ? "translate-x-7" : "translate-x-0"
              }`}
            />
          </button>
          </div>
        </div>
      )}
    </div>
  );
}
