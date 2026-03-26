import React, { useContext, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import axiosAuth from "../../utils/axiosAuth";
import { toast } from "react-toastify";

const backendUrl = import.meta.env.VITE_BACKEND_API || "http://localhost:5000";

const fetchBilling = async () => {
  const { data } = await axios.get(`${backendUrl}/user/subInfo`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  return data;
};

async function fetchPortfolioHideBranding(portfolio) {
  const { portfolioId, portfolioType } = portfolio;
  try {
    if (portfolioType === "Healthcare") {
      const res = await axiosAuth.get(`/healthcare/admin/data/${portfolioId}`);
      return res.data?.hideBranding ?? false;
    }
    if (portfolioType === "Handyman") {
      const res = await axios.get(
        `${backendUrl}/api/handyman-template/${portfolioId}`
      );
      return res.data?.hideBranding ?? false;
    }
    if (portfolioType === "ProjectManager") {
      const res = await axios.get(
        `${backendUrl}/portfolio/id/${portfolioId}`
      );
      return res.data?.hideBranding ?? false;
    }
  } catch {
    return false;
  }
  return false;
}

export default function PortfolioBranding() {
  const { user } = useContext(AuthContext);
  const [updating, setUpdating] = useState({});
  const [hideBrandingMap, setHideBrandingMap] = useState({});

  const { data: billingData } = useQuery({
    queryKey: ["billing", user?._id],
    queryFn: fetchBilling,
    enabled: !!user,
    staleTime: 1000 * 60 * 10,
  });

  const planName = billingData?.subscriptionList?.[0]?.plan?.product?.name;
  const isPro = planName === "Pro Plan";
  const userPortfolios = user?.portfolios || [];

  const portfolioIdsKey = userPortfolios.map((p) => p.portfolioId).sort().join(",");
  useEffect(() => {
    if (!isPro || userPortfolios.length === 0) return;
    const load = async () => {
      const map = {};
      for (const p of userPortfolios) {
        map[p.portfolioId] = await fetchPortfolioHideBranding(p);
      }
      setHideBrandingMap(map);
    };
    load();
  }, [isPro, portfolioIdsKey]);

  const handleToggle = async (portfolio) => {
    const portfolioId = portfolio.portfolioId;
    const portfolioType = portfolio.portfolioType;
    const currentVal = hideBrandingMap[portfolioId] ?? false;
    const newVal = !currentVal;
    setUpdating((prev) => ({ ...prev, [portfolioId]: true }));

    try {
      if (portfolioType === "Healthcare") {
        await axiosAuth.post(
          `/healthcare/admin/data/${portfolioId}`,
          { hideBranding: newVal }
        );
      } else if (portfolioType === "Handyman") {
        const res = await axios.get(
          `${backendUrl}/api/handyman-template/${portfolioId}`
        );
        await axios.put(
          `${backendUrl}/api/handyman-template/${portfolioId}`,
          { ...res.data, hideBranding: newVal },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
      } else if (portfolioType === "ProjectManager") {
        await axiosAuth.patch("/portfolio/edit", {
          portfolio: {
            _id: portfolioId,
            hideBranding: newVal,
          },
        });
      }
      setHideBrandingMap((prev) => ({ ...prev, [portfolioId]: newVal }));
      toast.success("Branding setting updated");
    } catch (err) {
      console.error("Failed to update branding", err);
      toast.error(err.response?.data?.message || "Failed to update branding");
    } finally {
      setUpdating((prev) => ({ ...prev, [portfolioId]: false }));
    }
  };

  if (!isPro) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-6">
        <h3 className="text-lg font-medium text-amber-900 mb-2">
          Hide FindVirtual.me Branding
        </h3>
        <p className="text-sm text-amber-800">
          This feature is available for Pro plan subscribers. Upgrade to Pro to
          remove the FindVirtual.me branding from your portfolio footers.
        </p>
      </div>
    );
  }

  if (userPortfolios.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Portfolio Branding
        </h3>
        <p className="text-sm text-gray-600">
          You don&apos;t have any portfolios yet. Create a portfolio to manage
          branding settings.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Hide FindVirtual.me Branding
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Pro plan feature: Toggle off the &quot;Powered by FindVirtual.me&quot;
          branding on each portfolio footer.
        </p>
      </div>
      <div className="space-y-3">
        {userPortfolios.map((p) => (
          <PortfolioBrandingRow
            key={p.portfolioId}
            portfolio={p}
            hideBranding={hideBrandingMap[p.portfolioId] ?? false}
            onToggle={() => handleToggle(p)}
            updating={updating[p.portfolioId]}
          />
        ))}
      </div>
    </div>
  );
}

function PortfolioBrandingRow({ portfolio, hideBranding, onToggle, updating }) {
  return (
    <div className="flex items-center justify-between gap-4 p-4 border border-gray-200 rounded-lg">
      <div className="min-w-0 flex-1">
        <h4 className="text-sm font-medium text-gray-900">
          {portfolio.portfolioType} – {String(portfolio.portfolioId).slice(-8)}
        </h4>
        <p className="text-xs text-gray-500 mt-1">
          {hideBranding ? "Branding hidden" : "Branding visible"}
        </p>
      </div>
      <button
        type="button"
        onClick={onToggle}
        disabled={updating}
        style={{
          width: "52px",
          minWidth: "52px",
          height: "24px",
          minHeight: "24px",
          maxHeight: "24px",
        }}
        className={`relative inline-flex shrink-0 flex-none items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          hideBranding ? "bg-blue-600" : "bg-gray-200"
        }`}
      >
        <span className="sr-only">Toggle branding</span>
        <span
          className={`absolute left-1 top-1/2 h-4 w-4 -translate-y-1/2 transform rounded-full bg-white shadow transition-transform ${
            hideBranding ? "translate-x-7" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}
