import React from 'react';
import axios from 'axios';

//attach token to each axios request
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const PROMO_END = '03/31/2026';

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    period: '/mo',
    description: 'Get started with essential features at no cost.',
    features: ['1 Project', 'Basic analytics', 'Community Support', 'Standard templates'],
    promo: false,
  },
  {
    id: 'basic',
    name: 'Basic',
    price: '$10',
    period: '/mo',
    regPrice: '$50',
    description: 'Perfect for individuals getting started.',
    features: [
      'Up to 2 projects',
      'Unlimited project edits',
      '1 free domain (first year)',
      'Domain hosting included',
      'Standard templates',
      'Basic analytics',
      'Email support',
      'Limited watermark',
      'Changes deployed by next business day',
      'Multi-user access',
    ],
    promo: true,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$20',
    period: '/mo',
    regPrice: '$99',
    description: 'Best for growing professionals and businesses.',
    features: [
      'Unlimited projects',
      'Unlimited project edits',
      'No watermark',
      'Premium templates',
      'Advanced + AI-powered analytics',
      'Priority human support',
      'Monthly performance reports',
      'Custom integrations',
      'Two expert consultation sessions per year',
      'On-demand SEO services (additional cost)',
    ],
    promo: true,
    popular: true,
  },
];

const backendUrl = import.meta.env.VITE_BACKEND_API;
const handleCheckout = async (planID) => {
  if (planID === 'free') {
    alert('You have selected the Free Tier. No payment required!');
    return;
  }
  try {
    const response = await axios.post(`${backendUrl}/api/payments/checkout/session`, {
      plan: planID,
    });
    window.location.href = response.data.checkoutUrl;
  } catch (err) {
    console.error('Failed to start checkout', err);
    alert('Error starting checkout');
  }
};

export default function Payment() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f7faff] to-[#f3f6fb] flex flex-col items-center justify-start py-12 px-2">
      <h1 className="text-3xl md:text-5xl font-bold text-gray-800 text-center mb-3">Choose Your Plan</h1>
      <p className="text-base md:text-lg text-gray-500 text-center mb-10">Select the perfect subscription tier for your needs. Upgrade or downgrade at any time.</p>
      <div className="w-full flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8 mb-10">
        {/* Free Plan */}
        <div className="bg-white border border-gray-200 rounded-xl shadow flex-1 max-w-xs flex flex-col items-center px-6 py-10 min-h-[480px]">
          <div className="text-2xl font-bold mb-1">{plans[0].name}</div>
          <div className="text-4xl font-bold mb-1">{plans[0].price}<span className="text-lg font-normal">{plans[0].period}</span></div>
          <div className="text-gray-500 text-center mb-4">{plans[0].description}</div>
          <ul className="mb-6 w-full text-gray-700 text-left space-y-1 text-base">
            {plans[0].features.map((feature) => (
              <li key={feature} className="flex items-center gap-2">
                <span className="text-green-500 text-lg">&#10003;</span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          <button
            className="w-full border rounded-md py-2 font-semibold transition-all duration-200 text-base shadow-sm border-black text-black bg-white hover:bg-gray-100"
            onClick={() => handleCheckout(plans[0].id)}
          >
            Get Started
          </button>
        </div>
        {/* Basic Plan */}
        <div
          className="relative flex-1 max-w-xs rounded-xl shadow border border-gray-200 flex flex-col items-center px-6 py-10 min-h-[520px]"
          style={{
            background: "linear-gradient(135deg, #f7faff 60%, #e3ecfa 100%)"
          }}
        >
          <span className="px-4 py-1 rounded-full bg-pink-600 text-white text-xs font-semibold shadow absolute -top-5 left-1/2 -translate-x-1/2 z-10">
            Promotional Offer ends {PROMO_END}
          </span>
          <div className="text-2xl font-bold mb-1">{plans[1].name}</div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg font-normal line-through text-gray-400">{plans[1].regPrice}</span>
            <span className="text-4xl font-bold text-gray-900">{plans[1].price}</span>
            <span className="text-lg font-normal">{plans[1].period}</span>
          </div>
          <div className="text-gray-500 text-center mb-4">{plans[1].description}</div>
          <ul className="mb-6 w-full text-gray-700 text-left space-y-1 text-base">
            {plans[1].features.map((feature) => (
              <li key={feature} className="flex items-center gap-2">
                <span className="text-green-500 text-lg">&#10003;</span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          <button
            className="w-full border rounded-md py-2 font-semibold transition-all duration-200 text-base shadow-sm border-white text-white bg-black hover:bg-gray-900"
            onClick={() => handleCheckout(plans[1].id)}
          >
            Get Started
          </button>
          <div className="text-xs text-pink-600 mt-3 font-medium text-center">
            Regular price <span className="line-through">{plans[1].regPrice}</span> now <span className="font-bold">{plans[1].price}</span>! Offer ends {PROMO_END}.
          </div>
        </div>
        {/* Pro Plan */}
        <div className="bg-white border border-gray-200 rounded-xl shadow flex-1 max-w-xs flex flex-col items-center px-6 py-10 min-h-[480px]">
          <div className="text-2xl font-bold mb-1">{plans[2].name}</div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg font-normal line-through text-gray-400">{plans[2].regPrice}</span>
            <span className="text-4xl font-bold text-gray-900">{plans[2].price}</span>
            <span className="text-lg font-normal">{plans[2].period}</span>
          </div>
          <div className="text-gray-500 text-center mb-4">{plans[2].description}</div>
          <ul className="mb-6 w-full text-gray-700 text-left space-y-1 text-base">
            {plans[2].features.map((feature) => (
              <li key={feature} className="flex items-center gap-2">
                <span className="text-green-500 text-lg">&#10003;</span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          <button
            className="w-full border rounded-md py-2 font-semibold transition-all duration-200 text-base shadow-sm border-black text-black bg-white hover:bg-gray-100"
            onClick={() => handleCheckout(plans[2].id)}
          >
            Get Started
          </button>
          <div className="text-xs text-pink-600 mt-3 font-medium text-center">
            Regular price <span className="line-through">{plans[2].regPrice}</span> now <span className="font-bold">{plans[2].price}</span>! Offer ends {PROMO_END}.
          </div>
        </div>
      </div>
      <div className="bg-white rounded-2xl shadow border border-gray-100 w-full max-w-2xl mx-auto p-6 mt-2 flex flex-col items-center">
        <div className="text-blue-600 font-semibold text-center mb-4 text-base">Why Choose Us?</div>
        <div className="w-full flex flex-col md:flex-row items-center md:items-center justify-between gap-6">
          <div className="text-gray-700 text-left md:text-center text-sm flex-1 w-full">Secure payments powered by Stripe</div>
          <div className="text-gray-700 text-left md:text-center text-sm flex-1 w-full">Cancel anytime, no questions asked</div>
          <div className="text-gray-700 text-left md:text-center text-sm flex-1 w-full">Instant activation upon payment</div>
        </div>
      </div>
    </div>
  );
}
