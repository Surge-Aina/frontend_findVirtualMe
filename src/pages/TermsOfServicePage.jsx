import {
  PLATFORM_TERMS_LAST_UPDATED,
  PLATFORM_TERMS_OF_SERVICE_TEXT,
} from "../legal/platformLegalContent";

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-slate-50 py-16 px-4">
      <article className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-8 md:p-12">
        <h1 className="text-2xl md:text-3xl font-semibold text-slate-900 mb-2">
          Terms of Service
        </h1>
        <p className="text-sm text-slate-500 mb-8">
          Last updated: {PLATFORM_TERMS_LAST_UPDATED}
        </p>
        <div className="text-slate-700 text-sm md:text-base leading-relaxed whitespace-pre-wrap">
          {PLATFORM_TERMS_OF_SERVICE_TEXT}
        </div>
      </article>
    </div>
  );
}
