import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { AuthContext } from "@/shared/context/AuthContext";
import Payment from "@/features/payments/Payment";
import { useContext, useEffect } from "react";
import { toast } from "react-toastify";
import { CircleArrowRight } from "lucide-react";

// Attach token to each axios request
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

const backendUrl = import.meta.env.VITE_BACKEND_API;

const fetchBilling = async () => {
  const { data } = await axios.get(`${backendUrl}/api/users/subscription-info`); //return a list of subscription objects limit: 1
  return data;
};

export default function ManageBillingComponent() {
  const { user } = useContext(AuthContext);

  const { data, error, isLoading } = useQuery({
    queryKey: ["billing", user?._id],
    queryFn: fetchBilling,
    enabled: !!user,
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
  });

  useEffect(() => {
    if (data) console.log("Billing:", data);
  }, [data]);

  if (!user) return null;
  //take user to manage subscription
  const handleManageSubscriptions = async () => {
    try {
      const response = await axios.post(`${backendUrl}/api/payments/checkout/billing-session`);
      window.location.href = response.data.billingSessionUrl;
    } catch (err) {
      console.error("Failed to start billing session", err);
      toast.error("Error starting billing session");
    }
  };

  const plan_colors = {
    "Pro Plan": "bg-blue-900 text-cyan-200",

    "Basic Plan": "bg-blue-200 text-blue-600",
  };

  if (isLoading)
    return (
      <p className="flex items-center justify-center mx-auto text-slate-600 dark:text-neutral-400 py-8">
        Loading billing info...
      </p>
    );
  if (error)
    return (
      <p className="flex items-center justify-center mx-auto text-slate-600 dark:text-neutral-400 py-8">
        Something went wrong
      </p>
    );

  if (user && data?.subscriptionList?.length > 0) {
    const plan = data.subscriptionList[0]?.plan?.product?.name;
    return (
      <div className="flex flex-col items-center gap-5 mx-auto my-[5vh] text-slate-800 dark:text-neutral-200">
        <div>
          <h1 className="text-2xl font-semibold">Subscription Information</h1>
        </div>
        <p className="font-semibold">Status: {data.subscriptionList[0].status}</p>
        <p className="font-semibold">Auto Renews: {data.subscriptionList[0].cancel_at_period_end ? "No" : "Yes"}</p>
        <p className="font-semibold">
          Plan: <span className={`${plan_colors?.[plan]} rounded-4xl px-4 py-2 text-gra`}> {plan}</span>
        </p>
        {/* button for managing subscriptions */}
        <div>
          <button
            className="flex flex-row gap-3 rounded-md my-2 px-6 py-3 font-semibold bg-blue-700 text-gray-100 md:bg-gray-200 md:text-blue-700 hover:bg-blue-600 hover:text-gray-100 cursor-pointer transition-colors"
            onClick={() => handleManageSubscriptions()}
          >
            Manage Subscription <CircleArrowRight />
          </button>
        </div>
      </div>
    );
  }

  // If no subscription show subscribe button
  return (
    <div>
      <Payment />
    </div>
  );
}
