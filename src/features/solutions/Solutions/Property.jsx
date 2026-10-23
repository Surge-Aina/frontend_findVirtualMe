export default function Property() {
  const cardInfo = [
    {
      heading: "Custom Websites",
      description: "Create a personalized website for your rental business without coding.",
      features: [
        "Drag-and-drop components",
        "Custom branding, colors, and backgrounds",
        "Connect your own domain name",
      ],
      image: "/assets/images/property/custom-website.jpg",
    },
    {
      heading: "Manage Payments",
      description: "Handle rent collection and transactions securely in one place.",
      features: ["Accept Payments", "Automated rent reminders", "Track income and payout history"],
      image: "/assets/images/property/manage-payments.jpg",
    },
    {
      heading: "Rent Property",
      description: "List, manage, and update rental properties with ease.",
      features: ["Set availability and pricing", "Manage tenant applications"],
      image: "/assets/images/property/rent-property.jpg",
    },
    {
      heading: "3D Tours",
      description: "Showcase properties with immersive 3D and virtual tours.",
      features: ["Interactive floor plans", "Accessible from any device"],
      image: "/assets/images/property/3d-tour.jpg",
    },
    {
      heading: "Identity Verification",
      description: "Ensure safe and secure tenant onboarding with verification tools.",
      features: [
        "Verify tenant identity and documents",
        "Screen for rental history",
        "Reduce fraud with automated checks",
      ],
      image: "/assets/images/property/verify-id.jpg",
    },
    {
      heading: "Messaging And Requests",
      description: "Streamline communication and keep track of repair requests.",
      features: [
        "Tenants submit maintenance requests",
        "Messaging between landlord and tenant",
        "Centralized conversation history",
      ],
      image: "/assets/images/property/messaging.webp",
    },
    {
      heading: "Analytics & Reports",
      description: "Gain insights into your properties and make data-driven decisions.",
      features: ["Track rent payments and income trends", "View vacancy and occupancy rates"],
      image: "/assets/images/property/analytics.jpg",
    },
    {
      heading: "Document Management",
      description: "Organize, store, and share important rental documents securely.",
      features: [
        "Upload and store leases and agreements",
        "Generate receipts and invoices",
        "Share documents with tenants digitally",
      ],
      image: "/assets/images/property/document-management.webp",
    },
  ];

  return (
    <div className="pb-20 bg-gradient-to-br from-[#f7faff] to-[#f3f6fb]">
      {/* Title */}
      <div className="flex-col justify-center pt-20 mb-20">
        <p className="text-7xl mb-2 text-slate-700">Property Solutions</p>
        <p className="text-2xl text-slate-900">Propery Rental Management Software</p>
        <p className="text-2xl">Taylored to Your Needs</p>
      </div>
      {/* Information cards */}
      <div className="mb-20 flex flex-col items-center gap-12">
        {cardInfo.map((card, index) => (
          <div key={index} className={`grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-6xl items-center`}>
            {/* Images */}
            <div className={`${index % 2 === 0 ? "order-1" : "order-2"} rounded-2xl overflow-hidden`}>
              <div className="w-full h-64 md:h-80 bg-gray-100">
                {card.image ? (
                  <img src={card.image} alt={card.heading} className="w-full h-full object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">No image</div>
                )}
              </div>
            </div>

            {/* Info */}
            <div
              className={`${
                index % 2 === 0 ? "order-2" : "order-1"
              } bg-white shadow-md rounded-2xl p-6 flex flex-col justify-center`}
            >
              <h3 className="text-2xl font-semibold mb-3">{card.heading}</h3>
              <p className="text-gray-600 mb-4">{card.description}</p>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                {card.features.map((feature, fIndex) => (
                  <li key={fIndex}>{feature}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
      <button className="px-6 py-3 bg-blue-600 text-white font-medium rounded-xl shadow-md hover:bg-blue-700 transition cursor-pointer">
        Contact Us
      </button>{" "}
    </div>
  );
}
