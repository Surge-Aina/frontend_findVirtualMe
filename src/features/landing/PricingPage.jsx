import { Link } from "react-router-dom";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-slate-50 pt-8 px-4 pb-16">
      <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
        <h1 className="text-2xl font-semibold text-slate-900 mb-3">Pricing</h1>
        <p className="text-slate-600 text-sm leading-relaxed mb-8">
          We are finalizing our plans and will publish pricing here soon. If you have questions in
          the meantime, we are happy to help.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/contact"
            className="inline-flex justify-center px-5 py-2.5 rounded-lg border border-slate-300 text-slate-800 text-sm font-medium hover:bg-slate-50"
          >
            Contact us
          </Link>
          <Link
            to="/signup"
            className="inline-flex justify-center px-5 py-2.5 rounded-lg bg-slate-800 text-white text-sm font-medium hover:bg-slate-700"
          >
            Get started free
          </Link>
        </div>
      </div>
    </div>
  );
}