import { useNavigate } from "react-router-dom";
import FvMark from "@/shared/components/FvMark";

export default function DeveloperPage({ title, lede, active, actions, children }) {
  const navigate = useNavigate();

  const tabClass = (selected) =>
    `px-6 py-2 rounded-full text-sm font-medium transition ${
      selected ? "bg-blue-500 text-white shadow-md" : "bg-white text-slate-500 border border-slate-300"
    }`;

  return (
    <main className="min-h-screen bg-slate-50 pt-24 px-4 pb-16">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <FvMark />
            <div>
              <h1 className="text-2xl font-semibold text-slate-800">{title}</h1>
              {lede ? <p className="text-slate-600 text-sm mt-1">{lede}</p> : null}
            </div>
          </div>
          {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
        </header>

        <div className="flex flex-wrap gap-4">
          <button type="button" className={tabClass(active === "keys")} onClick={() => navigate("/developer")}>
            API Keys
          </button>
          <button
            type="button"
            className={tabClass(active === "webhooks")}
            onClick={() => navigate("/developer/webhooks")}
          >
            Webhooks
          </button>
          <button
            type="button"
            className={tabClass(active === "integrations")}
            onClick={() => navigate("/integrations")}
          >
            Integrations
          </button>
          <button type="button" className={tabClass(active === "apps")} onClick={() => navigate("/developer/apps")}>
            Build an app
          </button>
        </div>

        {children}
      </div>
    </main>
  );
}
