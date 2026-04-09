import { useState, useContext, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { AuthContext } from "../../context/AuthContext";
import axiosAuth from "../../utils/axiosAuth";

const DomainLookup = () => {
  const backendUrl = import.meta.env.VITE_BACKEND_API;

  const [domain, setDomain] = useState("");
  const [submittedDomain, setSubmittedDomain] = useState("");
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [effectivePrice, setEffectivePrice] = useState(null);

  const { user } = useContext(AuthContext);

  /*
  =========================
  DOMAIN FETCH
  =========================
  */
  const fetchDomain = async () => {
    const res = await axiosAuth.get(
      `${backendUrl}/api/domainPayment/pricecheck/${submittedDomain}`
    );
    return res.data;
  };

  const { data, error, isLoading, isError } = useQuery({
    queryKey: ["domainCheck", submittedDomain],
    queryFn: fetchDomain,
    enabled: !!submittedDomain,
    retry: false,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!domain.trim()) return;
    setSubmittedDomain(domain.trim());
  };

  /*
  =========================
  VOUCHERS FETCH
  =========================
  */
  const fetchVouchers = async () => {
    const res = await axiosAuth.get(`${backendUrl}/vouchers/my`);
    return res.data;
  };

  const { data: vouchers } = useQuery({
    queryKey: ["vouchers", user?._id],
    queryFn: fetchVouchers,
    enabled: !!user?._id,
  });

  const freeDomainVoucher = vouchers?.find(
    v => v.voucherId?.type === "free_domain" && v.status === "active"
  );

  /*
  =========================
  PRICE CALCULATION
  =========================
  */
  useEffect(() => {
    if (!data?.totalPrice) return;

    const price = parseFloat(data.totalPrice);

    if (freeDomainVoucher?.voucherId?.discountAmount) {
      const discount = freeDomainVoucher.voucherId.discountAmount;
      const final = Math.max(0, price - discount).toFixed(2);
      setEffectivePrice(final);
    } else {
      setEffectivePrice(price);
    }
  }, [data, freeDomainVoucher]);

  /*
  =========================
  PURCHASE FLOW
  =========================
  */
  const handlePurchaseClick = () => {
    setShowPurchaseModal(true);
  };

  const handleConfirmPurchase = async () => {
    setShowPurchaseModal(false);

    if (!data || !user?._id) {
      alert("Missing domain data or user.");
      return;
    }

    try {
      const payload = {
        domain: data.domain,
        voucherId: freeDomainVoucher?._id || null,
      };

      const response = await axiosAuth.post(
        `${backendUrl}/api/domainPayment/checkout`,
        payload
      );

      window.location.href = response.data.url;
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.error || "Payment failed");
    }
  };

  const handleCancelPurchase = () => {
    setShowPurchaseModal(false);
  };

  /*
  =========================
  DISPLAY VALUES
  =========================
  */
  const isAvailable = data?.available === true;

  const totalPrice = data?.totalPrice
    ? parseFloat(data.totalPrice)
    : null;

  const basePrice = data?.basePrice;
  const icannFee = data?.icannFee;
  const platformFee = data?.platformFee;

  /*
  =========================
  UI
  =========================
  */
  return (
    <div className="w-full max-w-4xl min-w-0 bg-white dark:bg-neutral-900 rounded-2xl shadow border border-gray-200 dark:border-neutral-700 p-4 sm:p-8 mb-8">
      <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-neutral-100">
        Domain Lookup
      </h2>
      <p className="text-gray-600 dark:text-neutral-400 mb-6">
        Check if a domain is available for registration.
      </p>

      {/* SEARCH */}
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <input
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          placeholder="example.com"
          className="flex-1 min-w-0 rounded-lg border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-4 py-2 text-gray-900 dark:text-neutral-100 placeholder:text-gray-500 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg shrink-0 hover:bg-blue-700 disabled:opacity-60"
        >
          {isLoading ? "Searching..." : "Search"}
        </button>
      </form>

      {/* ERROR */}
      {isError && (
        <div className="mt-4 text-red-600 dark:text-red-400">
          {error?.response?.data?.error || error.message}
        </div>
      )}

      {/* RESULT */}
      {data && !isLoading && (
        <div className="mt-6 border border-gray-200 dark:border-neutral-600 rounded-lg p-5 dark:bg-neutral-800/40">
          <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-neutral-100">
            {isAvailable ? "Available!" : "Not Available"}
          </h3>

          <p className="text-gray-800 dark:text-neutral-200">
            Domain: <strong>{data.domain}</strong>
          </p>

          {/* Voucher notice */}
          {freeDomainVoucher && (
            <div className="mt-3 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 rounded-lg p-3 text-sm text-purple-900 dark:text-purple-200">
              🎉 You have a free domain voucher (up to $
              {freeDomainVoucher.voucherId.discountAmount})
            </div>
          )}

          {/* PRICING */}
          {isAvailable && (
            <div className="mt-4 space-y-3">
              <div className="bg-gray-50 dark:bg-neutral-800/80 border border-gray-200 dark:border-neutral-600 rounded-lg p-3 text-sm text-gray-800 dark:text-neutral-200">
                <div className="flex justify-between">
                  <span>Base</span>
                  <span>${basePrice}</span>
                </div>

                <div className="flex justify-between">
                  <span>ICANN</span>
                  <span>${icannFee}</span>
                </div>

                {platformFee > 0 && (
                  <div className="flex justify-between">
                    <span>Markup</span>
                    <span>${platformFee}</span>
                  </div>
                )}

                <div className="border-t border-gray-200 dark:border-neutral-600 pt-2 flex justify-between font-bold">
                  <span>Total</span>
                  <span>${totalPrice}</span>
                </div>

                {freeDomainVoucher && effectivePrice !== null && (
                  <div className="flex justify-between text-green-600 dark:text-green-400 font-semibold">
                    <span>After Voucher</span>
                    <span>
                      ${effectivePrice}
                      {effectivePrice === 0 && " 🎉"}
                    </span>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={handlePurchaseClick}
                className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                {freeDomainVoucher
                  ? `Use Voucher — $${effectivePrice}`
                  : `Purchase — $${totalPrice}`}
              </button>
            </div>
          )}
        </div>
      )}

      {/* MODAL */}
      {showPurchaseModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-xl p-6 w-full max-w-md text-gray-900 dark:text-neutral-100 shadow-xl">
            <h3 className="text-xl font-bold mb-4">Confirm Purchase</h3>

            <p className="mb-4 text-gray-700 dark:text-neutral-300">{data?.domain}</p>

            <div className="mb-6 text-gray-800 dark:text-neutral-200">
              Total:{" "}
              <strong>
                ${freeDomainVoucher ? effectivePrice : totalPrice}
              </strong>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleCancelPurchase}
                className="flex-1 bg-gray-200 dark:bg-neutral-700 dark:text-neutral-100 py-3 rounded-lg hover:bg-gray-300 dark:hover:bg-neutral-600"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmPurchase}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
              >
                Pay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DomainLookup;
