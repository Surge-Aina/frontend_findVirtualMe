import { useContext, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { portfolioApi } from "@/shared/api/portfolioApi";
import { AuthContext } from "@/shared/context/AuthContext.jsx";
import axiosAuth from "@/shared/api/axiosAuth.js";
import { logPortfolioAction } from "@/shared/utils/portfolioEditLogger";

const PROMPT_EXAMPLES = [
  "Create a warm consulting portfolio for a product strategist with one standout case study, service packages, and a clear contact section.",
  "Build a sleek data portfolio for an analytics lead with dashboard blocks, a few flagship projects, and a concise professional summary.",
  "Make a creative studio portfolio with a bold hero, selected work, testimonials, and a refined contact section.",
];

function getEntryLabel(source) {
  if (source === "onboarding") return "template chooser";
  if (source === "dashboard") return "dashboard";
  return "portfolio creator";
}

export default function AiPortfolioCreatorPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, refreshUser } = useContext(AuthContext);

  const [title, setTitle] = useState("");
  const [prompt, setPrompt] = useState("");
  const [creating, setCreating] = useState(false);

  const source = location.state?.source || "direct";
  const helperLabel = useMemo(() => getEntryLabel(source), [source]);

  const handleExampleClick = (example) => {
    setPrompt(example);
  };

  const handleCreate = async (event) => {
    event.preventDefault();

    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt) {
      toast.error("Enter a prompt to generate your portfolio.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please log in to create a portfolio.");
      navigate("/login");
      return;
    }

    setCreating(true);
    try {
      const response = await portfolioApi.generateAgent({
        prompt: trimmedPrompt,
        title: title.trim(),
      });

      const created = response.data?.portfolio;
      const id = created?._id;
      if (!id) {
        throw new Error(response.data?.error || "No portfolio returned");
      }

      try {
        await axiosAuth.patch("/user/addPortfolioId", {
          portfolioId: id,
          portfolioType: "agent",
          isPublic: false,
          portfolioName: created.title || title.trim() || "AI Portfolio",
        });
      } catch (linkErr) {
        console.warn("addPortfolioId:", linkErr);
      }

      try {
        const sessionId =
          localStorage.getItem("onboardingSessionId") || `session_${Date.now()}`;
        await logPortfolioAction("created", {
          sessionId,
          userId: user?.id || user?._id || "anonymous",
          portfolioID: id,
          portfolioType: "agent",
          name:
            user?.firstName && user?.lastName
              ? `${user.firstName} ${user.lastName}`
              : user?.name || null,
          email: user?.email || null,
        });
      } catch (logErr) {
        console.warn("logPortfolioAction:", logErr);
      }

      await refreshUser?.();
      toast.success("AI portfolio created.");
      navigate(`/portfolios/view/${id}/edit`);
    } catch (error) {
      const code = error.response?.data?.code;
      const details = error.response?.data?.details;
      if (code === "UNSUPPORTED_BLOCK_NEED") {
        const suggestions = Array.isArray(details?.closestKnownBlocks)
          ? details.closestKnownBlocks.join(", ")
          : "";
        toast.error(
          suggestions
            ? `That request needs features we do not support yet. Try blocks like: ${suggestions}`
            : "That request needs features we do not support yet."
        );
      } else {
        toast.error(
          error.response?.data?.error ||
            error.response?.data?.message ||
            error.message ||
            "Could not create AI portfolio"
        );
      }
    } finally {
      setCreating(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 pt-24 px-4 pb-16">
      <div className="max-w-4xl mx-auto">
        <Link
          to={source === "dashboard" ? "/dashboard" : "/resume"}
          className="inline-flex items-center text-sm text-slate-500 hover:text-slate-700 mb-6"
        >
          Back to {helperLabel}
        </Link>

        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="bg-slate-900 text-white px-8 py-10">
            <p className="text-xs uppercase tracking-[0.22em] text-sky-300 mb-3">
              AI Portfolio Creator
            </p>
            <h1 className="text-3xl md:text-4xl font-bold mb-3">
              Describe the portfolio you want
            </h1>
            <p className="text-slate-300 max-w-2xl">
              Your prompt will be converted into a normal block-based portfolio that
              you can edit, publish, and manage like any other portfolio.
            </p>
          </div>

          <div className="p-8 md:p-10">
            <form onSubmit={handleCreate} className="space-y-8">
              <div className="space-y-3">
                <label className="block text-sm font-medium text-slate-700">
                  Optional title
                </label>
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="My AI portfolio"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-slate-700">
                  Portfolio prompt
                </label>
                <textarea
                  value={prompt}
                  onChange={(event) => setPrompt(event.target.value)}
                  rows={7}
                  placeholder="Example: Create a warm consulting portfolio for a product strategist with a standout case study, clear services, and a refined contact section."
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-sm text-slate-500">
                  Best results come from describing the audience, style, content focus,
                  and any blocks you want emphasized.
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-700 mb-3">
                  Prompt ideas
                </p>
                <div className="grid gap-3 md:grid-cols-3">
                  {PROMPT_EXAMPLES.map((example) => (
                    <button
                      key={example}
                      type="button"
                      onClick={() => handleExampleClick(example)}
                      className="text-left rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 px-4 py-4 text-sm text-slate-600 transition-colors"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between pt-2">
                <p className="text-sm text-slate-500">
                  Unsupported app-style features like booking calendars or checkout
                  flows will be rejected instead of silently generating the wrong thing.
                </p>
                <button
                  type="submit"
                  disabled={creating}
                  className="inline-flex items-center justify-center rounded-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {creating ? "Creating..." : "Create portfolio"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
