import { useState, useContext } from "react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { AuthContext } from "../../context/AuthContext";
import axiosAuth from "../../utils/axiosAuth";

const DomainLookup = () => {
  const backendUrl = import.meta.env.VITE_BACKEND_API;

  const [domain, setDomain] = useState("");
  const [submittedDomain, setSubmittedDomain] = useState("");
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const { user } = useContext(AuthContext); // user should contain id and email

  const fetchDomain = async () => {
    const url = `${backendUrl}/api/domainPayment/pricecheck/${submittedDomain}`;
    console.log("Making request to:", url);

    try {
      const res = await axiosAuth.get(url, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      console.log("Price Check Response data:", res.data);

      if (typeof res.data === "string" && res.data.includes("<!doctype html>")) {
        throw new Error("API returned HTML instead of JSON. Check your backend URL.");
      }

      return res.data;
    } catch (error) {
      console.error("Fetch error:", error);
      throw error;
    }
  };

  const { data, error, isLoading, isError, refetch } = useQuery({
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

  const handlePurchaseClick = () => {
    setShowPurchaseModal(true);
  };

  const handleConfirmPurchase = async () => {
    setShowPurchaseModal(false); // Close modal

    if (!data || !user?._id) {
      console.log("data: ", data);
      console.log("user: ", user);

      alert("Error: Missing domain data or user ID.");
      return;
    }

    try {
      console.log("Initiating Stripe Checkout...");

      const payload = {
        domain: data.domain,
        // Use the totalPrice calculated and returned by the backend
        totalPrice: data.totalPrice,
      };

      const url = `${backendUrl}/api/domainPayment/checkout`;

      // This POST request must use the axiosAuth instance to include the JWT
      const response = await axiosAuth.post(url, payload);

      // Response should contain { url: "https://checkout.stripe.com/c/pay/..." }
      const checkoutUrl = response.data?.url;

      if (checkoutUrl) {
        // Redirect user to the Stripe checkout page
        window.location.href = checkoutUrl;
      } else {
        throw new Error("Stripe checkout URL not received from server.");
      }
    } catch (error) {
      console.error("Payment initiation failed:", error);
      alert(`Payment Error: ${error.response?.data?.error || error.message}. Please try again.`);
    }
  };

  const handleCancelPurchase = () => {
    setShowPurchaseModal(false);
  };

  // Safely interpret availability
  const isAvailable = data?.available === true;

  // totalPrice from the backend response 
  const totalPrice = data?.totalPrice || "Error";
  const basePrice = data?.basePrice || "Error";
  const icannFee = data?.icannFee || "Error";
  const platformFee = data?.platformFee || "Error";

  return (
    <div className="w-full max-w-4xl bg-white rounded-2xl shadow border border-gray-200 p-8 mb-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-2">Domain Lookup</h2>
      <p className="text-gray-600 mb-6">Check if a domain is available for registration.</p>

      {/* Input row */}
      <form onSubmit={handleSubmit} className="flex gap-3">
        <input
          type="text"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          placeholder="Enter domain (example.com)"
          className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-gray-900
                                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          {isLoading ? "Searching..." : "Search"}
        </button>
      </form>

      {/* Loading */}
      {isLoading && <p className="text-blue-600 mt-4">Checking domain...</p>}

      {/* Error */}
      {isError && (
        <div className="mt-4 border border-red-200 bg-red-50 text-red-700 rounded-lg p-4">
          <p className="font-semibold mb-2">Error:</p>
          <p className="text-sm">
            {error?.message?.includes("HTML")
              ? "The API is returning HTML instead of JSON. This usually means the backend URL is incorrect or the API endpoint doesn't exist."
              : error?.response?.data?.error || error?.message || "Something went wrong."}
          </p>
        </div>
      )}

      {/* Result */}
      {data && !isLoading && typeof data === "object" && (
        <div
          className={`mt-6 border rounded-lg p-5 ${
            isAvailable ? "border-green-200 bg-green-50 text-green-900" : "border-red-200 bg-red-50 text-red-900"
          }`}
        >
          <h3 className="text-lg font-medium mb-2">{isAvailable ? "Available!" : "Not Available"}</h3>
          <p className="mb-2">
            Domain: <strong>{data.domain}</strong>
          </p>

          {isAvailable && (
            <div className="mt-4 space-y-3">
              {/* Display pricing details from backend */}
              <div
                className={`${
                  data.isPremium
                    ? "bg-yellow-50 border border-yellow-200 text-yellow-900"
                    : "bg-blue-50 border border-blue-200 text-blue-900"
                } rounded-lg p-3 `}
              >
                <p className="font-medium text-sm mb-1">
                  {data.isPremium ? "Premium Domain Pricing" : "Standard Domain Pricing"}
                </p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Base Registration Price:</span>
                    <span className="font-medium">${basePrice}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ICANN Fee:</span>
                    <span className="font-medium">${icannFee}</span>
                  </div>
                  {/* Only show platform fee if it exists (i.e., for expensive TLDs) */}
                  {parseFloat(platformFee) > 0 && (
                    <div className="flex justify-between">
                      <span>Platform Markup:</span>
                      <span className="font-medium">${platformFee}</span>
                    </div>
                  )}
                  <div className="border-t pt-2 flex justify-between">
                    <span className="font-bold">Total Annual Cost:</span>
                    <span className="font-bold text-lg">${totalPrice}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handlePurchaseClick}
                className="w-full px-6 py-3 bg-green-600 text-white font-medium rounded-lg 
                                            hover:bg-green-700 transition shadow-sm"
              >
                {`Purchase Domain - $${totalPrice}`}
              </button>
            </div>
          )}

          {!isAvailable && <p className="text-sm">This domain is already registered.</p>}
        </div>
      )}

      {/* Purchase Modal */}
      {showPurchaseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Confirm Purchase</h3>

            <div className="mb-6">
              <p className="text-gray-700 mb-2">You are confirming the purchase of:</p>
              <p className="text-xl font-semibold text-blue-600 mb-4">{data?.domain}</p>

              <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Base Registration Price:</span>
                  <span className="font-medium">${basePrice}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">ICANN Fee:</span>
                  <span className="font-medium">${icannFee}</span>
                </div>
                {parseFloat(platformFee) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Platform Markup:</span>
                    <span className="font-medium">${platformFee}</span>
                  </div>
                )}
                <div className="border-t pt-2 flex justify-between">
                  <span className="font-semibold text-gray-900">Total:</span>
                  <span className="font-bold text-lg">${totalPrice}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCancelPurchase}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-lg 
                                            hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmPurchase}
                className="flex-1 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg 
                                            hover:bg-blue-700 transition shadow-sm"
              >
                Proceed to Payment (${totalPrice})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DomainLookup;
