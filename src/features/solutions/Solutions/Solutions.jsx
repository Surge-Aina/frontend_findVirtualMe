import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";

const solutions = [
  {
    category: "Vendors & Retailers",
    heading: "For Vendors & Retailers",
    description:
      "Streamline your retail operations with intelligent inventory management, customer analytics, and automated workflows that help you scale efficiently.",
    features: [
      "Real-time inventory tracking and alerts",
      "Customer behavior analytics and insights",
      "Automated reorder systems",
      "Multi-channel sales integration",
      "Performance dashboards and reporting",
    ],
    image: "/assets/images/vendors.jpeg",
  },
  {
    category: "Restaurants",
    heading: "For Restaurants",
    description:
      "Optimize your restaurant operations with smart kitchen management, order tracking, and customer engagement tools designed for the food industry.",
    features: [
      "Kitchen workflow optimization",
      "Real-time order management",
      "Staff scheduling and performance tracking",
      "Menu analytics and pricing optimization",
      "Customer feedback and loyalty programs",
    ],
    image: "/assets/images/restaurant.jpeg",
  },
  {
    category: "Rental Owners / Property Managers",
    heading: "For Property Managers",
    description:
      "Simplify property management with automated tenant communications, maintenance tracking, and financial reporting tools that save time and reduce costs.",
    features: [
        "3D tours of apartments and properties",
      "Automated tenant screening and onboarding",
      "Maintenance request tracking and scheduling",
      "Rent collection and financial reporting",
      "Property inspection management",
      "Tenant communication portal",
    ],
    image: "/assets/images/property.jpeg",
  },
  {
    category: "Farmers",
    heading: "For Farmers",
    description:
      "Modernize your farming operations with precision agriculture tools, crop monitoring, and market analytics that maximize yield and profitability.",
    features: [
      "Crop health monitoring and alerts",
      "Weather-based planning and recommendations",
      "Equipment maintenance scheduling",
      "Market price tracking and analysis",
      "Compliance and certification management",
    ],
    image: "/assets/images/farmers.jpeg",
  },
];

export default function Solutions() {
  const navigate = useNavigate();
  const cardRefs = useMemo(() => solutions.map(() => ({ current: null })), []);

  const handleScrollToCard = (idx) => {
    cardRefs[idx].current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  // maps solution index to respective route
  const solutionRoutes = [
    "/solutions/vendors",
    "/solutions/restaurant",
    "/solutions/property",
    "/solutions/farmers#crop-health",
  ];

  return (
     <div className="min-h-screen bg-gradient-to-br from-[#f7faff] to-[#f3f6fb] dark:from-neutral-950 dark:to-slate-900 py-16 px-4 flex flex-col items-center">

      <div className="w-full max-w-4xl mx-auto text-center mb-24">
        <div className="flex justify-center mb-6">
          <div className="bg-white dark:bg-neutral-800 rounded-full px-6 py-3 shadow text-slate-900 dark:text-neutral-100 font-medium text-lg inline-block border border-transparent dark:border-neutral-600">
            <ul className="list-disc list-inside">
              <li>Tailored solutions for every industry</li>
            </ul>
          </div>
        </div>
        <h2 className="text-xl md:text-2xl font-semibold text-slate-900 dark:text-neutral-100 mb-4">
          Industry-specific solutions that drive results
        </h2>
        <p className="text-lg md:text-2xl text-slate-500 dark:text-neutral-400 mb-8">
          From retail and restaurants to property management and agriculture, our platform adapts to your industry's unique needs with specialized tools and workflows.
        </p>
        <div className="flex flex-col md:flex-row gap-3 justify-center items-center">
          {solutions.map((sol, idx) => (
            <button
              key={sol.category}
              onClick={() => handleScrollToCard(idx)}
              className="relative transition-colors text-slate-800 dark:text-neutral-200 bg-white dark:bg-neutral-800 px-4 py-2 rounded-xl overflow-hidden group border border-blue-200 dark:border-blue-800 font-semibold text-base shadow hover:text-slate-900 dark:hover:text-white"
            >
              <span className="relative z-10">{sol.heading}</span>
              <span className="absolute inset-0 w-1/3 h-full bg-blue-200/40 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
            </button>
          ))}
        </div>
      </div>

      <div className="w-full max-w-5xl mx-auto flex flex-col gap-32">
        {solutions.map((sol, idx) => (
          <div
            key={sol.category}
            ref={cardRefs[idx]}
            className={`flex flex-col md:flex-row items-start justify-center gap-14 py-12 px-2 md:px-0 ${
              idx % 2 === 0 ? "" : "md:flex-row-reverse"
            }`}
          >
            {/* card with image and details */}
            <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-lg border border-gray-200 dark:border-neutral-700 flex-[1.3] max-w-2xl p-0 mb-6 md:mb-0 flex flex-col overflow-hidden text-left">
              <img
                src={sol.image}
                alt={sol.heading}
                className="w-full h-80 object-cover rounded-t-2xl"
              />
              <div className="p-8 flex flex-col items-start text-left">
                <div className="font-semibold text-2xl text-slate-800 dark:text-neutral-100 mb-2 font-mono">{sol.heading}</div>
                <div className="text-slate-600 dark:text-neutral-400 mb-4 font-mono text-lg">{sol.description}</div>
                <ul className="mb-4 space-y-2 font-mono text-lg">
                  {sol.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-slate-700 dark:text-neutral-300">
                      <span className="mt-1 w-2 h-2 rounded-full bg-slate-900 dark:bg-neutral-300 inline-block"></span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="flex-[0.7] max-w-md flex flex-col items-start justify-center px-2 md:px-0 text-left">
              <div className="font-bold text-slate-900 dark:text-neutral-100 text-3xl mb-8 font-mono">Key Features:</div>
              <ul className="mb-12 space-y-6 font-mono text-xl">
                {sol.features.slice(0, 3).map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-slate-800 dark:text-neutral-300">
                    <span className="mt-2 w-4 h-4 rounded-full bg-slate-900 dark:bg-neutral-300 inline-block"></span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <div className="flex flex-col gap-4 w-full">
                <button
                  className="bg-slate-900 text-white font-semibold px-0 py-3 rounded-xl text-base shadow hover:bg-slate-800 transition flex items-center justify-center w-full font-mono"
                  onClick={() => navigate(solutionRoutes[idx])}
                >
                  Learn More
                  <span className="inline-block ml-2">&rarr;</span>
                </button>
                <button className="bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-600 text-slate-900 dark:text-neutral-100 font-semibold px-0 py-3 rounded-xl text-base shadow hover:bg-gray-100 dark:hover:bg-neutral-700 transition flex items-center justify-center w-full font-mono">
                  View Demo
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="w-full max-w-3xl mx-auto text-center mt-20">
        <h2 className="text-2xl md:text-3xl font-semibold text-slate-900 dark:text-neutral-100 mb-4">
          Ready to transform your business?
        </h2>
        <p className="text-lg md:text-2xl text-slate-500 dark:text-neutral-400 mb-8">
          Join thousands of businesses already using our platform to streamline operations and drive growth.
        </p>
        <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
          <button className="bg-slate-900 text-white font-semibold px-8 py-4 rounded-xl text-lg shadow hover:bg-slate-800 transition flex items-center gap-2">
            Start Free Trial
            <span className="inline-block">&rarr;</span>
          </button>
          <button className="bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-600 text-slate-900 dark:text-neutral-100 font-semibold px-8 py-4 rounded-xl text-lg shadow hover:bg-gray-100 dark:hover:bg-neutral-700 transition">
            Contact Sales
          </button>
        </div>
      </div>

      {/* Our Team Section */}
      <div className="w-full max-w-4xl mx-auto text-center mt-24">
        <h2 className="text-2xl md:text-3xl font-semibold text-slate-900 dark:text-neutral-100 mb-10">
          Our Team
        </h2>
        <div className="flex flex-col md:flex-row gap-10 justify-center items-center">
          <div className="flex flex-col items-center">
            <img
              src="/assets/images/team/Om.jpg"
              alt="Project Manager"
              className="w-40 h-40 object-cover object-center rounded-full shadow-lg mb-4 border border-slate-300 dark:border-neutral-600"
            />
            <div className="font-bold text-base text-slate-700 dark:text-neutral-300 mb-1">Om Patil</div>
            <div className="font-semibold text-lg text-slate-800 dark:text-neutral-200">Project Manager</div>
          </div>
          <div className="flex flex-col items-center">
            <img
              src="/assets/images/team/Carlos.png"
              alt="Team Lead 1"
              className="w-40 h-40 object-cover object-center rounded-full shadow-lg mb-4 border border-slate-300 dark:border-neutral-600"
            />
            <div className="font-bold text-base text-slate-700 dark:text-neutral-300 mb-1">Carlos Garcia</div>
            <div className="font-semibold text-lg text-slate-800 dark:text-neutral-200">Team Lead</div>
          </div>
          <div className="flex flex-col items-center">
            <img
              src="/assets/images/team/Ri.png"
              alt="Team Lead 2"
              className="w-40 h-40 object-cover object-center rounded-full shadow-lg mb-4 border border-slate-300 dark:border-neutral-600"
            />
            <div className="font-bold text-base text-slate-700 dark:text-neutral-300 mb-1">Rimma Esheva</div>
            <div className="font-semibold text-lg text-slate-800 dark:text-neutral-200">Team Lead</div>
          </div>
        </div>
      </div>
    </div>
  );
}