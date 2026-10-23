import React from "react";

const painPoints = [
  {
    title: "Inefficient Operations",
    description: "Manual processes slow down service and increase wait times"
  },
  {
    title: "Rising Costs",
    description: "Food waste, overstaffing, and poor inventory control hurt margins"
  },
  {
    title: "Staff Turnover",
    description: "High turnover rates due to poor scheduling and training"
  },
  {
    title: "Customer Retention",
    description: "Difficulty tracking customer preferences and building loyalty"
  }
];

const solutions = [
  {
    id: "operations",
    title: "Streamlined Kitchen Operations",
    description: "Optimize your kitchen workflow with intelligent order routing, prep scheduling, and real-time status tracking.",
    imageUrl: "https://images.unsplash.com/photo-1759097621684-1155a286af79?auto=format&fit=crop&w=800&q=80",
    features: [
      "Smart order queue management",
      "Kitchen display system integration",
      "Prep time optimization",
      "Recipe standardization",
      "Equipment maintenance alerts",
      "Food waste tracking and reduction"
    ],
    benefits: "Reduce order preparation time by up to 25% and minimize food waste"
  },
  {
    id: "pos-management",
    title: "Advanced POS & Order Management",
    description: "Unified system for in-house, takeout, and delivery orders with real-time synchronization and payment processing.",
    imageUrl: "https://images.unsplash.com/photo-1728044849321-4cbffc50cc1d?auto=format&fit=crop&w=800&q=80",
    features: [
      "Multi-channel order processing",
      "Split billing and group orders",
      "Contactless payment options",
      "Table management system",
      "Delivery tracking integration",
      "Digital receipt and loyalty points"
    ],
    benefits: "Process orders up to 40% faster with integrated payment solutions"
  },
  {
    id: "staff-management",
    title: "Smart Staff Management",
    description: "Optimize scheduling, track performance, and reduce turnover with data-driven staff management tools.",
    imageUrl: "https://images.unsplash.com/photo-1576652255072-84872440574d?auto=format&fit=crop&w=800&q=80",
    features: [
      "AI-powered shift scheduling",
      "Time tracking and payroll integration",
      "Performance analytics and feedback",
      "Digital training modules",
      "Communication hub",
      "Compliance tracking"
    ],
    benefits: "Reduce staff turnover by up to 30% with better scheduling and training"
  },
  {
    id: "customer-experience",
    title: "Enhanced Customer Experience",
    description: "Build lasting relationships with personalized service, loyalty programs, and seamless ordering experiences.",
    imageUrl: "https://images.unsplash.com/photo-1616538994032-f7619b8bebb5?auto=format&fit=crop&w=800&q=80",
    features: [
      "Customer preference tracking",
      "Automated loyalty programs",
      "Online reservation system",
      "Digital menu and ordering",
      "Feedback collection and analysis",
      "Personalized marketing campaigns"
    ],
    benefits: "Increase customer retention by up to 45% with personalized experiences"
  },
  {
    id: "analytics",
    title: "Business Intelligence & Analytics",
    description: "Make data-driven decisions with comprehensive reporting on sales, costs, and operational efficiency.",
    imageUrl: "https://images.unsplash.com/photo-1697206165469-9227e6e3aa0a?auto=format&fit=crop&w=800&q=80",
    features: [
      "Real-time sales dashboards",
      "Food cost analysis and optimization",
      "Peak time and demand forecasting",
      "Menu item performance tracking",
      "Profit margin analysis",
      "Custom reporting and alerts"
    ],
    benefits: "Improve profit margins by up to 15% with actionable insights"
  }
];

const trustIndicators = [
  { metric: "99.9%", label: "Uptime Guarantee" },
  { metric: "24/7", label: "Support Available" },
  { metric: "30 Days", label: "Money-Back Guarantee" }
];

export default function Restaurant() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-gray-100 to-gray-50">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-gray-200 px-4 py-2 rounded-full mb-8 text-gray-700 text-sm">
              Restaurant Management Solutions
            </div>
            <h1 className="mb-6 text-4xl font-bold text-gray-900">
              Run Your Restaurant Like a Pro
            </h1>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              From kitchen operations to customer experience, our comprehensive platform helps restaurant owners streamline operations, reduce costs, and increase profitability with intelligent automation and data-driven insights.
            </p>
            <div className="pt-8 border-t border-gray-200">
              <div className="flex justify-center w-full">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-8 w-full max-w-xl">
                  {trustIndicators.map((indicator, index) => (
                    <div key={index} className="text-center w-full">
                      <div className="text-2xl font-medium text-blue-600 mb-1">{indicator.metric}</div>
                      <div className="text-sm text-gray-500">{indicator.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* pain points section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="mb-4 text-2xl font-bold text-gray-900">
              Common Restaurant Challenges We Solve
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Running a restaurant is tough. We understand the daily challenges you face and have built solutions specifically to address them.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {painPoints.map((point, index) => (
              <div key={index} className="p-6 text-center border rounded-lg bg-gray-50 border-gray-200">
                <h3 className="mb-2 text-lg font-semibold text-gray-800">{point.title}</h3>
                <p className="text-sm text-gray-500">{point.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* solutions sections */}
      <section className="py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="mb-4 text-2xl font-bold text-gray-900">
              Complete Restaurant Management Platform
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need to run a successful restaurant, integrated into one powerful platform.
            </p>
          </div>
          {solutions.map((solution, index) => {
            const isEven = index % 2 === 0;
            return (
              <div key={solution.id} className={`grid lg:grid-cols-2 gap-12 items-center ${index !== 0 ? 'mt-24 md:mt-32' : ''}`}>
                {/* Image */}
                <div className={`${isEven ? 'lg:order-1' : 'lg:order-2'}`}>
                  <div className="relative">
                    <div className="aspect-[4/3] overflow-hidden rounded-lg">
                      <img
                        src={solution.imageUrl}
                        alt={solution.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="absolute -bottom-4 -right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg">
                      <span className="text-sm font-medium">ROI Guaranteed</span>
                    </div>
                  </div>
                </div>
                {/* content */}
                <div className={`${isEven ? 'lg:order-2' : 'lg:order-1'} space-y-6`}>
                  <div>
                    <h2 className="mb-4 text-xl font-bold text-gray-900">{solution.title}</h2>
                    <p className="text-lg text-gray-600 mb-6">{solution.description}</p>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {solution.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-start gap-2 text-left">
                        <span className="w-3 h-3 mt-2 rounded-full bg-blue-600 inline-block"></span>
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                    <div className="font-medium mb-2 text-blue-700">Expected Results</div>
                    <p className="text-sm text-blue-700">{solution.benefits}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* additional features */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="mb-4 text-2xl font-bold text-gray-900">
              Plus Essential Restaurant Features
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Every tool you need to run your restaurant efficiently, all in one platform.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Food Safety Compliance",
                description: "Automated temperature logging, HACCP compliance tracking, and health inspection readiness"
              },
              {
                title: "Mobile App Management",
                description: "Manage your restaurant on-the-go with our comprehensive mobile app"
              },
              {
                title: "Reservation Management",
                description: "Online booking system with table optimization and customer preferences"
              },
              {
                title: "Customer Feedback",
                description: "Automated review collection and sentiment analysis to improve service"
              },
              {
                title: "Menu Engineering",
                description: "Data-driven menu optimization to maximize profitability and customer satisfaction"
              },
              {
                title: "Inventory Alerts",
                description: "Smart notifications for low stock, expiration dates, and automatic reordering"
              }
            ].map((feature, index) => (
              <div key={index} className="p-6 border rounded-lg bg-gray-50 border-gray-200">
                <h3 className="mb-2 text-lg font-semibold text-gray-800">{feature.title}</h3>
                <p className="text-sm text-gray-500">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* pricing */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-xl mx-auto px-4 text-center">
          <h2 className="mb-4 text-2xl font-bold text-gray-900">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-gray-600 mb-12">
            Start with a free trial. No setup fees, no hidden costs. Cancel anytime.
          </p>
          <div className="p-8 border rounded-lg bg-gray-50 border-gray-200 max-w-md mx-auto">
            <div className="mb-4 text-blue-700 font-semibold">Most Popular</div>
            <div className="mb-6">
              <div className="text-3xl font-medium mb-2">$99<span className="text-lg text-gray-500">/month</span></div>
              <p className="text-gray-600">Everything included, unlimited usage</p>
            </div>
            <ul className="space-y-3 mb-8 text-left">
              {[
                "All restaurant management features",
                "Unlimited staff accounts",
                "24/7 customer support",
                "Advanced analytics and reporting",
                "Mobile app access",
                "Integration with major POS systems",
                "30-day money-back guarantee"
              ].map((feature, index) => (
                <li key={index} className="flex items-start gap-2 text-left">
                  <span className="w-3 h-3 mt-2 rounded-full bg-blue-600 inline-block"></span>
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
            <button className="w-full py-3 rounded-lg bg-blue-600 text-white font-semibold mb-4 hover:bg-blue-700 transition">
              Start Free Trial
            </button>
            <p className="text-xs text-gray-500">
              No credit card required • 14-day free trial
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="max-w-xl mx-auto px-4 text-center">
          <h2 className="mb-6 text-2xl font-bold text-gray-900">
            Ready to Transform Your Restaurant?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Join thousands of successful restaurants using FindVirtual.me to streamline operations, reduce costs, and increase profitability.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="inline-flex items-center gap-2 py-3 px-6 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition">
              Start Free Trial
            </button>
            <button className="inline-flex items-center gap-2 py-3 px-6 rounded-lg bg-white border border-blue-600 text-blue-600 font-semibold hover:bg-blue-50 transition">
              Schedule Demo Call
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-6">
            Questions? Call us at (555) 123-4567 or email support@findvirtual.me
          </p>
        </div>
      </section>
    </div>
  );
}