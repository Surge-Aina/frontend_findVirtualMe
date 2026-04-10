import React, { useState, useEffect } from "react";
import { Eye, Edit, X, RefreshCw, DollarSign, Search } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";

const AdminSubscriptionTable = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [subscriptionsStorage, setSubscriptionsStorage] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSub, setSelectedSub] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [showPaymentHistory, setShowPaymentHistory] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [searchText, setSearchText] = useState("");

  const [refundForm, setRefundForm] = useState({
    amount: "",
    reason: "requested_by_customer",
  });

  const BACKEND_API = import.meta.env.VITE_BACKEND_API;

  //attach token to each axios request
  axios.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Fetch all subscriptions
  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BACKEND_API}/api/payments/subscriptions`);
      const data = response.data;
      console.log("Subscription data:", data);
      setSubscriptions(data);
      setError(null);
    } catch (err) {
      setError(err?.response?.data?.error ? err.message + ": " + err.response.data.error : err.message);
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  //give time for stripe webhooks to update database
  const fetchSubscriptionsAfterWebhook = (delay = 1000) => {
    setTimeout(() => {
      fetchSubscriptions();
    }, delay);
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  // Update subscription
  const handleUpdateSubscription = async (subscriptionId, newPlan) => {
    try {
      const response = await axios.put(`${BACKEND_API}/api/payments/subscriptions/update`, { subscriptionId, newPlan });

      fetchSubscriptionsAfterWebhook(); // Refresh data
      setShowUpdateModal(false);
      setSelectedSub(null);
      console.log("updated sub: ", response);
    } catch (err) {
      toast.error(`Error updating subscription: ${err.message}`);
      console.log(`Error updating subscription: ${err}`);
    }
  };
  const handleConfirmCancel = async (subscriptionId) => {
    try {
      const res = await axios.put(`${BACKEND_API}/api/payments/subscriptions/cancel`, { subscriptionId });
      fetchSubscriptionsAfterWebhook(); // Refresh data
      setShowCancelConfirm(false);
      setSelectedSub(null);
      toast.success(`Canceled Subscription`);
      console.log(`canceled subscription: ${res.stripeSubscription}`);
    } catch (err) {
      toast.error(`Error canceling subscription: ${err.response?.data?.message || err.message}`);
      console.log(`Error canceling subscription: ${err}`);
    }
  };

  const handleIssueRefund = async (chargeId, amount, reason) => {
    try {
      const body = {
        chargeId,
        reason,
      };

      console.log("body: ", body);

      if (amount && parseFloat(amount) > 0) {
        body.amount = parseInt(parseFloat(amount) * 100);
      }

      const response = await axios.post(`${BACKEND_API}/api/payments/subscriptions/refund`, body);

      setShowRefundModal(false);
      setSelectedSub(null);
      setRefundForm({
        amount: "",
        reason: "requested_by_customer",
      });
      fetchSubscriptionsAfterWebhook();
      toast.success("Refund issued successfully");
      console.log("refund issued: ", response);
    } catch (err) {
      toast.error(`Error issuing refund: ${err.message}`);
      console.log(`Error issuing refund: ${err.message}`);
    }
  };

  // Get payment history
  const fetchPaymentHistory = async (customerId) => {
    try {
      const response = await axios.get(`${BACKEND_API}/api/payments/subscriptions/payments/${customerId}`);
      const data = response.data;
      setPaymentHistory(data.charges || []);
      setShowPaymentHistory(true);
      console.log("charge history: ", data?.charges);
    } catch (err) {
      toast.error(`Error fetching payment history: ${err?.message}`);
      console.log(`Error fetching payment history: ${err?.message}`);
    }
  };

  const currentSubscriptions = subscriptions;

  const formatDate = (date) => {
    return date ? new Date(date).toLocaleDateString() : "N/A";
  };

  const formatCurrency = (amount, currency = "usd") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const getStatusBadge = (status) => {
    const colors = {
      active: "bg-green-100 text-green-800",
      pending_cancel: "bg-purple-100 text-purple-800",
      canceled: "bg-red-100 text-red-800",
      past_due: "bg-yellow-100 text-yellow-800",
      trialing: "bg-blue-100 text-blue-800",
      unpaid: "bg-red-200 text-red-900",
      incomplete: "bg-orange-100 text-orange-800",
      incomplete_expired: "bg-gray-200 text-gray-800",
      paused: "bg-indigo-100 text-indigo-800",
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs  ${colors[status] || "bg-gray-100 text-gray-800"}`}>
        {status}
      </span>
    );
  };

  const handleReactivateSub = async (subscriptionId) => {
    try {
      await axios.put(`${BACKEND_API}/api/payments/subscriptions/reactivate`, { subscriptionId });
      fetchSubscriptionsAfterWebhook();
      setShowUpdateModal(false);
      setSelectedSub(null);
    } catch (err) {
      toast.error(`Error reactivating subscription: ${err.message}`);
    }
  };

  const handleSearchSubmit = (search) => {
    const searchL = search.toLowerCase();
    const filteredSubs = subscriptions.filter((sub) => {
      return (
        sub?.email?.toLowerCase().includes(searchL) ||
        sub?.name?.toLowerCase().includes(searchL) ||
        sub?.customerId?.toLowerCase().includes(searchL)
      );
    });

    setSearchText("");

    //show filtered results
    setSubscriptionsStorage(subscriptions);
    setSubscriptions(filteredSubs);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-600 text-center p-4">Error: {error}</div>;
  }

  return (
    <div className="p-6 bg-white">
      {/* Title with refresh button */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex-1 flex justify-center">
          <h2 className="text-2xl font-bold text-gray-900">Subscription Management</h2>
        </div>
        <button
          onClick={fetchSubscriptions}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* search bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSearchSubmit(searchText);
        }}
        className="flex justify-center gap-2 mb-4"
      >
        <input
          type="search"
          placeholder="Search User by Email"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md w-full md:max-w-[50%]"
        />

        <button type="submit" className="p-2 border border-gray-300 rounded-lg hover:cursor-pointer hover:bg-gray-100">
          <Search className="w-6 h-6" />
        </button>
        <button
          type="button"
          onClick={() => {
            if (subscriptionsStorage.length > 0) {
              setSubscriptions(subscriptionsStorage);
              setSubscriptionsStorage([]);
              setSearchText("");
            }
          }}
          className="border border-gray-300 rounded-lg p-2 hover:cursor-pointer hover:bg-gray-100"
        >
          Reset
        </button>
      </form>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 text-gray-500">Customer</th>
              <th className="px-6 text-gray-500">Plan</th>
              <th className="px-6 text-gray-500">Status</th>
              <th className="px-6 text-gray-500">Period Start</th>
              <th className="px-6 text-gray-500">Period End</th>
              <th className="px-6 text-gray-500">Actions</th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {currentSubscriptions.map((sub) => (
              <tr key={sub._id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div>
                    <div className="text-sm  text-gray-900">{sub.email || "No email"}</div>
                    <div className="text-sm text-gray-500">{sub.name}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 capitalize">{sub.subscriptionType}</div>
                </td>
                <td className="flex justify-center space-x-1 px-6 py-4">
                  <div>{getStatusBadge(sub.cancelAtPeriodEnd ? "pending_cancel" : sub.status)}</div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">{formatDate(sub.currentPeriodStart)}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{formatDate(sub.currentPeriodEnd)}</td>
                <td className="px-6 py-4 text-sm">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        fetchPaymentHistory(sub.customerId);
                        setSelectedSub(sub);
                      }}
                      className="text-yellow-400 hover:text-yellow-600"
                      title="View Payment History"
                    >
                      <DollarSign className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedSub(sub);
                        setShowUpdateModal(true);
                      }}
                      className="text-green-400 hover:text-green-600"
                      title="Update Plan"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedSub(sub);
                        setShowCancelConfirm(true);
                      }}
                      className={`${sub.status === "canceled" ? "text-gray-300" : "text-red-400 hover:text-red-600"}`}
                      title="Cancel Subscription"
                      disabled={sub.status === "canceled"}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {currentSubscriptions.map((sub) => (
          <div
            key={sub._id}
            className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm divide-y divide-gray-200"
          >
            {/* Email and subID */}
            <div className="pb-5">
              <div className="text-lg text-gray-900">{sub.email || "No email"}</div>
              <div className="text-sm text-gray-500 mt-1">{sub.name}</div>
            </div>

            {/* Plan Details */}
            <div className="flex justify-around items-start py-3">
              <div>
                <div className="text-xs  text-gray-500 uppercase tracking-wide">Plan</div>
                <div className="text-sm text-gray-900 capitalize mt-1">{sub.subscriptionType}</div>
              </div>
              <div className="ml-3">{getStatusBadge(sub.cancelAtPeriodEnd ? "pending_cancel" : sub.status)}</div>
            </div>

            {/* Dates */}
            <div className="flex justify-around py-3">
              <div className="col-span-2">
                <div className="text-xs  text-gray-500 uppercase tracking-wide">Period Start</div>
                <div className="text-sm text-gray-900 mt-1">{formatDate(sub.currentPeriodStart)}</div>
              </div>
              <div>
                <div className="text-xs  text-gray-500 uppercase tracking-wide">Period End</div>
                <div className="text-sm text-gray-900 mt-1">{formatDate(sub.currentPeriodEnd)}</div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center pt-3">
              <button
                onClick={() => {
                  fetchPaymentHistory(sub.customerId);
                  setSelectedSub(sub);
                }}
                className="flex flex-col items-center text-sm text-yellow-600"
              >
                <DollarSign className="w-4 h-4" />
                <span>History</span>
              </button>

              <button
                onClick={() => {
                  setSelectedSub(sub);
                  setShowUpdateModal(true);
                }}
                className="flex flex-col items-center text-sm text-green-600"
              >
                <Edit className="w-4 h-4" />
                <span>Update</span>
              </button>

              <button
                onClick={() => {
                  setSelectedSub(sub);
                  setShowCancelConfirm(true);
                }}
                className={`flex flex-col items-center text-sm ${
                  sub.status === "canceled" ? "text-gray-300" : "text-red-400 hover:text-red-600"
                }`}
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Update Modal */}
      {showUpdateModal && selectedSub && (
        <div
          className="fixed inset-0 bg-white/5 backdrop-blur-sm flex items-center justify-center z-50"
          //when clicking outsode modal close it
          onClick={() => {
            setShowUpdateModal(false);
            setSelectedSub(null);
          }}
        >
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg mb-4">Update Subscription Plan</h3>
            <p className="text-sm text-gray-600 mb-4">Customer: {selectedSub.email}</p>
            <p className={`text-sm text-gray-600 mb-4 ${selectedSub.status === "canceled" ? "hidden" : "block"}`}>
              Current Plan: <span className="capitalize ">{selectedSub.subscriptionType}</span>
            </p>
            {/* Buttons */}
            <div className={`space-y-3 ${selectedSub.status === "canceled" ? "hidden" : "block"}`}>
              <button
                onClick={() => handleUpdateSubscription(selectedSub.subscriptionId, "basic")}
                disabled={selectedSub.subscriptionType === "basic" || selectedSub.cancelAtPeriodEnd}
                className="w-full p-3 text-left rounded-lg border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="">Basic Plan</div>
                <div className="text-sm text-gray-500">$10/month</div>
              </button>

              <button
                onClick={() => handleUpdateSubscription(selectedSub.subscriptionId, "pro")}
                disabled={selectedSub.subscriptionType === "pro" || selectedSub.cancelAtPeriodEnd}
                className="w-full p-3 text-left rounded-lg border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="">Pro Plan</div>
                <div className="text-sm text-gray-500">$20/month</div>
              </button>

              <button
                onClick={() => handleReactivateSub(selectedSub.subscriptionId)}
                disabled={!selectedSub.cancelAtPeriodEnd}
                className="w-full p-3 text-left rounded-lg border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="">Reactivate Plan</div>
              </button>
            </div>
            <p className={`text-lg text-red-400 ${selectedSub.status === "canceled" ? "block" : "hidden"}`}>
              Subscription Canceled {new Date(selectedSub.canceledAt).toLocaleDateString()}
            </p>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowUpdateModal(false);
                  setSelectedSub(null);
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Refund Modal */}
      {showRefundModal && selectedSub && (
        <div
          className="fixed inset-0 bg-white/5 backdrop-blur-sm flex items-center justify-center z-50"
          //when clicking outsode modal close it
          onClick={() => {
            setShowRefundModal(false);
            setSelectedSub(null);
          }}
        >
          {/*this onClick prevents closing when clicking inside modal*/}
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4">Issue Refund</h3>
            <p className="text-sm text-gray-600 mb-4">Customer: {selectedSub.email}</p>
            <div className="space-y-4">
              <label className="block text-sm text-gray-700 mb-1">
                Charge ID: {selectedSub.selectedCharge?.id || "N/A"}
              </label>

              {/* only shows if refunded*/}
              <div className={`${selectedSub?.refundLog?.[0]?.status === "succeeded" ? "block" : "hidden"}`}>
                <h1 className="text-lg text-red-400">Refund Issued</h1>
                <p className="text-sm text-gray-600">Refund Amount: {selectedSub?.refundLog?.[0]?.amount}</p>
                <p className="text-sm text-gray-600">Reason for refund: {selectedSub?.refundLog?.[0]?.reason}</p>
                <p className="text-sm text-gray-600">Source: {selectedSub?.refundLog?.[0]?.source}</p>
              </div>
              {/* only shows if refund not made yet */}
              <div className={`${selectedSub?.refundLog?.[0]?.status === "succeeded" ? "hidden" : "block"}`}>
                <div>
                  <label className="block text-sm  text-gray-700 mb-1">Amount ($ - leave empty for full refund)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="29.00"
                    value={refundForm.amount}
                    onChange={(e) => setRefundForm((prev) => ({ ...prev, amount: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm  text-gray-700 mb-1">Reason</label>
                  <select
                    value={refundForm.reason}
                    onChange={(e) => setRefundForm((prev) => ({ ...prev, reason: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="requested_by_customer">Requested by customer</option>
                    <option value="duplicate">Duplicate</option>
                    <option value="fraudulent">Fraudulent</option>
                  </select>
                </div>
                <div className="mt-6">
                  <button
                    onClick={() =>
                      handleIssueRefund(selectedSub.selectedCharge?.id, refundForm.amount, refundForm.reason)
                    }
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Issue Refund
                  </button>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowRefundModal(false);
                  setSelectedSub(null);
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment History Modal */}
      {showPaymentHistory && (
        <div
          className="fixed inset-0 bg-white/5 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => {
            setShowPaymentHistory(false);
            setSelectedSub(null);
            setPaymentHistory([]);
          }}
        >
          <div
            className="bg-white p-6 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Payment History</h3>
              <button
                onClick={() => {
                  setShowPaymentHistory(false);
                  setSelectedSub(null);
                  setPaymentHistory([]);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2  text-xs  text-gray-500 uppercase">Date</th>
                    <th className="px-4 py-2  text-xs  text-gray-500 uppercase">Amount</th>
                    <th className="px-4 py-2  text-xs  text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-2  text-xs  text-gray-500 uppercase">Invoice</th>
                    <th className="px-4 py-2  text-xs text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paymentHistory.map((charge) => {
                    // Check if this specific payment has been refunded
                    const isRefunded = charge.amount_refunded > 0;
                    return (
                      <tr key={charge.id}>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {new Date(charge.created * 1000).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {formatCurrency(charge.amount, charge.currency)}
                        </td>
                        <td className="px-4 py-2">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              charge.paid ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                            }`}
                          >
                            {charge.paid ? "paid" : charge.status}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-500">{charge.id}</td>
                        <td className="px-4 py-2">
                          {!isRefunded && charge.paid && (
                            <button
                              onClick={() => {
                                setSelectedSub({
                                  ...selectedSub,
                                  selectedCharge: charge, // Pass the specific charge
                                });
                                setShowRefundModal(true);
                                setShowPaymentHistory(false);
                              }}
                              className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                            >
                              Refund
                            </button>
                          )}
                          {isRefunded && (
                            <div className="flex flex-col">
                              <span className="text-xs text-red-600">Refunded</span>
                              <span className="text-xs">
                                {selectedSub.refundLog?.find((refund) => refund.chargeId === charge.id)?.reason}
                              </span>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* cancel confirm modal */}
      {showCancelConfirm && selectedSub && (
        <div
          className="fixed inset-0 bg-white/5 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => {
            setShowCancelConfirm(false);
            setSelectedSub(null);
          }}
        >
          <div className="relative bg-white p-10 rounded-lg shadow-xl" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => {
                setShowCancelConfirm(false);
                setSelectedSub(null);
              }}
              className="text-gray-500 hover:text-gray-700 absolute right-2 top-2"
            >
              <X className="w-6 h-6" />
            </button>
            <h3 className="text-lg mb-4">Cancel Subscription</h3>
            <p className="text-sm text-gray-600 mb-4">Customer: {selectedSub?.email}</p>
            <p className={`text-sm text-gray-600 mb-4 ${selectedSub?.status === "canceled" ? "hidden" : "block"}`}>
              Current Plan: <span className="capitalize ">{selectedSub?.subscriptionType}</span>
            </p>
            <div className="space-y-3">
              <button
                className="bg-red-100 text-red-800 border border-red-600 w-full p-3 text-center rounded  hover:bg-red-300"
                onClick={() => handleConfirmCancel(selectedSub.subscriptionId)}
              >
                Immediately
              </button>
              <button
                className="bg-purple-100 text-purple-800 border border-purple-600 w-full p-3 text-center rounded  hover:bg-purple-300"
                onClick={() => handleConfirmCancel(selectedSub.subscriptionId)}
              >
                End of Period
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSubscriptionTable;
