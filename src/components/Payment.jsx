import React, { useState } from "react";

const plans = [
  {
    id: "basic",
    name: "Basic Plan",
    price: "$9",
    period: "/month",
    description: "Perfect for individuals and businesses getting started",
    features: [
      "Up to 5 projects",
      "Basic analytics",
      "Email support",
      "Standard templates",
    ],
  },
  {
    id: "pro",
    name: "Pro Plan",
    price: "$29",
    period: "/month",
    description: "Best for growing individuals and businesses",
    features: [
      "Unlimited projects",
      "Advanced analytics",
      "Priority support",
      "Premium templates",
      "Custom integrations",
    ],
    popular: true,
  },
];

export default function Payment() {
  const [selectedPlan, setSelectedPlan] = useState(null);

  // Plan selection screen
  if (!selectedPlan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f7faff] to-[#f3f6fb] flex flex-col items-center justify-start py-12 px-2">
        <h1 className="text-3xl md:text-5xl font-bold text-gray-800 text-center mb-3">Choose Your Plan</h1>
        <p className="text-base md:text-lg text-gray-500 text-center mb-7">
          Select the perfect subscription tier for your needs. Upgrade or downgrade at any time.
        </p>
        <div className="flex flex-col md:flex-row gap-6 mb-8 items-stretch">
          {plans.map((plan, idx) => (
            <div
              key={plan.id}
              className="bg-white rounded-xl shadow border border-gray-200 w-full max-w-xs p-6 flex flex-col items-center justify-between relative transition-all duration-200 hover:shadow-lg hover:-translate-y-1 hover:border-blue-300"
            >
             
              {plan.popular && (
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-blue-600 text-white text-xs font-semibold shadow">
                  Most Popular
                </span>
              )}
              <div className="text-base font-medium text-gray-700 mb-1 mt-2">{plan.name}</div>
              <div className="text-3xl font-bold text-gray-900 mb-0.5">{plan.price}<span className="text-base font-normal">{plan.period}</span></div>
              <div className="text-gray-500 text-center mb-3 text-sm">{plan.description}</div>
              <ul className="mb-4 w-full text-gray-700 text-left space-y-1 text-sm flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <span className="text-green-500 text-base">&#10003;</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <div className="w-full flex items-end">
                <button
                  className="w-full border border-gray-300 rounded-md py-1.5 font-semibold text-gray-700 bg-white transition-all duration-200 text-sm shadow-sm hover:bg-gray-50 hover:shadow-[0_4px_32px_0_rgba(44,62,80,0.12)] hover:scale-[1.03]"
                  onClick={() => setSelectedPlan(plan.id)}
                >
                  Select Plan
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-2xl shadow border border-gray-100 w-full max-w-2xl mx-auto p-6 mt-2 flex flex-col items-center">
          <div className="text-blue-600 font-semibold text-center mb-4 text-base">Why Choose Us?</div>
          <div className="w-full flex flex-col md:flex-row items-center md:items-center justify-between gap-6">
            <div className="text-gray-700 text-left md:text-center text-sm flex-1 w-full">
              Secure payments powered by Stripe
            </div>
            <div className="text-gray-700 text-left md:text-center text-sm flex-1 w-full">
              Cancel anytime, no questions asked
            </div>
            <div className="text-gray-700 text-left md:text-center text-sm flex-1 w-full">
              Instant activation upon payment
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Payment form screen
  const planObj = plans.find((p) => p.id === selectedPlan);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f7faff] to-[#f3f6fb] flex flex-col items-center justify-start py-12 px-2">
      {/* back link */}
      <div className="w-full max-w-md mb-6">
        <button
          className="text-sm text-gray-500 hover:underline flex items-center gap-2"
          onClick={() => setSelectedPlan(null)}
        >
          <span className="text-base">&larr;</span> Back to Plans
        </button>
      </div>
      {/* headline */}
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 text-center mb-1">Complete Your Subscription</h1>
      <p className="text-sm md:text-base text-gray-500 text-center mb-5">Secure checkout powered by Stripe</p>
      {/* payment Card */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 w-full max-w-md mx-auto p-6">
        <div className="font-semibold text-gray-700 mb-4 flex items-center gap-2 text-base">
          <span className="text-base">&#128179;</span> Payment Details
        </div>
        {/* plan */}
        <div className="bg-gray-50 rounded-md border border-gray-200 p-3 mb-4 flex justify-between items-center">
          <div>
            <div className="font-medium text-gray-800 text-sm">{planObj.name}</div>
            <div className="text-gray-500 text-xs">{planObj.price}{planObj.period}</div>
          </div>
          <button className="text-blue-600 font-medium hover:underline text-xs" onClick={() => setSelectedPlan(null)}>
            Change
          </button>
        </div>
        {/* email */}
        <label className="block text-gray-700 text-xs font-medium mb-1 flex items-center gap-2">
          Email Address
        </label>
        <input
          type="email"
          className="w-full mb-3 px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm"
          placeholder="your@email.com"
        />
        {/* name */}
        <label className="block text-gray-700 text-xs font-medium mb-1 flex items-center gap-2">
          Full Name
        </label>
        <input
          type="text"
          className="w-full mb-3 px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm"
          placeholder="John Doe"
        />
        {/* card Number */}
        <label className="block text-gray-700 text-xs font-medium mb-1">Card Number</label>
        <input
          type="text"
          className="w-full mb-3 px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm"
          placeholder="1234 5678 9012 3456"
        />
        {/* Expiry & CVV */}
        <div className="flex gap-3 mb-4">
          <div className="flex-1">
            <label className="block text-gray-700 text-xs font-medium mb-1">Expiry Date</label>
            <input
              type="text"
              className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm"
              placeholder="MM/YY"
            />
          </div>
          <div className="flex-1">
            <label className="block text-gray-700 text-xs font-medium mb-1">CVV</label>
            <input
              type="text"
              className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm"
              placeholder="123"
            />
          </div>
        </div>
        {/* pay button */}
        <button className="w-full bg-blue-600 text-white font-semibold py-2 rounded-md shadow hover:bg-blue-700 transition-all flex items-center justify-center gap-2 mb-3 text-sm">
          <span className="text-base"></span> Complete Payment
        </button>
        {/* Stripe secure */}
        <div className="text-center text-gray-500 text-xs mb-1 flex items-center justify-center gap-2">
          <span className="text-base">&#128274;</span> Secured by Stripe
        </div>
        <div className="text-center text-gray-400 text-xs">
          Your payment information is encrypted and secure
        </div>
      </div>
    </div>
  );
}