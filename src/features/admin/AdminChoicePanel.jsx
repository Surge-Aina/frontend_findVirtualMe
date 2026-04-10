import { useState } from "react";
import AdminSubscriptionTable from "@/components/AdminSubscriptionTable";
import PortfolioEditLogViewer from "./PortfolioEditLogViewer.jsx";
import TicketingPage from "@/features/support/ticketing/TicketingPage.jsx";

const AdminChoicePanel = () => {
  const [activeTab, setActiveTab] = useState("subscription");

  const tabButtonClass = (isActive) =>
    [
      "px-6 py-4 text-base rounded-xl shadow-2xl transition-all duration-300 w-full sm:w-auto sm:px-8 sm:py-6 sm:text-lg",
      isActive
        ? "bg-slate-600 ring-2 ring-slate-400 text-white shadow-slate-800/40"
        : "bg-slate-800 hover:bg-slate-700 text-white shadow-slate-800/25",
    ].join(" ");

  return (
    <div className="flex flex-col gap-6 py-6 w-full max-w-7xl mx-auto px-4">
      <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-center gap-3 sm:gap-4">
        <button
          type="button"
          className={tabButtonClass(activeTab === "logs")}
          onClick={() => setActiveTab("logs")}
        >
          Logs
        </button>

        <button
          type="button"
          className={tabButtonClass(activeTab === "ticketing")}
          onClick={() => setActiveTab("ticketing")}
        >
          Ticketing System
        </button>

        <button
          type="button"
          className={tabButtonClass(activeTab === "subscription")}
          onClick={() => setActiveTab("subscription")}
        >
          Subscription table
        </button>
      </div>

      {activeTab === "logs" && (
        <div className="w-full">
          <PortfolioEditLogViewer />
        </div>
      )}

      {activeTab === "ticketing" && (
        <div className="w-full">
          <TicketingPage />
        </div>
      )}

      {activeTab === "subscription" && (
        <div className="w-full">
          <h1 className="text-2xl font-semibold text-slate-100 mb-4">
            Admin Dashboard
          </h1>
          <AdminSubscriptionTable />
        </div>
      )}
    </div>
  );
};

export default AdminChoicePanel;
