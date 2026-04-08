import { PLATFORM_PRIVACY_POLICY_LAST_UPDATED } from "../legal/platformLegalContent";
import PlatformPrivacyPolicyEmbed from "../legal/PlatformPrivacyPolicyEmbed";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-16 px-4">
      <article className="max-w-5xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
        <h1 className="text-2xl md:text-3xl font-semibold text-slate-900 mb-2">
          Privacy Policy
        </h1>
        <p className="text-sm text-slate-500 mb-6">
          Last updated: {PLATFORM_PRIVACY_POLICY_LAST_UPDATED}
        </p>
        <PlatformPrivacyPolicyEmbed minHeight="min-h-[75vh]" />
      </article>
    </div>
  );
}
