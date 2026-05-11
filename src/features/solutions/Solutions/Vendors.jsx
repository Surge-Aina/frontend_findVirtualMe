import React from "react";

export default function Vendors() {
  const vendorFeatures = [
    {
      title: "Smart Inventory Tracking",
      description:
        "Stay on top of your stock with real-time alerts and predictive insights that help you reorder before running out.",
      bullets: [
        "Track inventory across multiple locations",
        "Automated low-stock alerts",
        "Forecast demand and reduce waste",
      ],
      image: "/assets/images/inventory.png",
    },
    {
      title: "Customer Analytics",
      description:
        "Gain deep insights into your customers’ behavior to personalize offers and increase retention.",
      bullets: [
        "Understand buying patterns",
        "Target high-value customers",
        "Increase loyalty with data-driven campaigns",
      ],
      image: "/assets/images/analytics.png",
    },
    {
      title: "Streamlined Order Management",
      description:
        "Orders are the lifeblood of your business. A robust system keeps everyone informed and ensures smooth processing from purchase to delivery.",
      bullets: [
        "Centralized order tracking for vendors and admins",
        "Automated notifications for shipping and delivery",
        "Hassle-free returns and refunds management",
      ],
      image: "/assets/images/order.png",
    },
    {
      title: "Secure Payment Gateways",
      description:
        "Security is non-negotiable. With integrated Stripe payments and fraud prevention, your buyers can shop with confidence.",
      bullets: [
        "Secure Option: Stripe",
        "PCI-compliant infrastructure",
        "Advanced fraud detection & prevention",
      ],
      image: "/assets/images/payment-secure.png",
    },
    {
      title: "Email Automation",
      description:
        "Engage your customers with automated, personalized email campaigns triggered by their behavior and order activity.",
      bullets: [
        "Welcome emails for new customers",
        "Order & shipping confirmations",
        "Abandoned cart recovery emails",
        "Loyalty rewards & re-engagement campaigns",
      ],
      image: "/assets/images/email-automation.png",
    },

    {
      title: "Performance Dashboards",
      description:
        "Track KPIs, monitor sales, and visualize performance in real-time with our intuitive dashboards.",
      bullets: [
        "Customizable reports and charts",
        "Identify trends instantly",
        "Drive smarter business decisions",
      ],
      image: "/assets/images/dashboards.png",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f7faff] to-[#f3f6fb] py-16 px-4 flex flex-col items-center">
      {/* Header */}
      <div className="w-full max-w-4xl mx-auto text-center mb-20">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
          Vendor & Retailer Features
        </h2>
        <p className="text-lg md:text-xl text-slate-600">
          Explore the specialized tools designed to help vendors streamline
          operations, secure payments, and delight customers.
        </p>
        <button className="bg-slate-900 text-white font-semibold px-0 py-3 rounded-xl text-base shadow hover:bg-slate-800 transition flex items-center justify-center w-full font-mono">
          View Demo
          <span className="inline-block ml-2">&rarr;</span>
        </button>
      </div>

      {/* Features Grid */}
      <div className="w-full max-w-6xl mx-auto flex flex-col gap-24">
        {vendorFeatures.map((block, idx) => (
          <div
            key={block.title}
            className={`flex flex-col md:flex-row items-center justify-between gap-10 ${
              idx % 2 !== 0 ? "md:flex-row-reverse" : ""
            }`}
          >
            {/* Image */}
            <div className="flex-1 max-w-xl">
              <img
                src={block.image}
                alt={block.title}
                className="w-full h-80 object-contain rounded-2xl shadow-lg bg-white"
              />
            </div>

            {/* Text */}
            <div className="flex-1 max-w-xl">
              <h3 className="text-2xl font-bold text-slate-900 mb-4">
                {block.title}
              </h3>
              <p className="text-slate-600 mb-6">{block.description}</p>
              <ul className="space-y-3 text-slate-700">
                {block.bullets.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="w-3 h-3 mt-1 rounded-full bg-emerald-500 inline-block"></span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
