// src/pages/Solutions/Farmers.jsx
import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const WRAP = "w-[95%] max-w-screen-2xl mx-auto";

const hero = {
  id: "hero",
  title: "For Farmers",
  blurb:
    "Modernize your farming operations with precision agriculture tools, crop monitoring, and market analytics that maximize yield and profitability.",
  image:
    "http://www.publicdomainpictures.net/pictures/50000/velka/agriculture-13730152618Ej.jpg",
};

const heroBullets = [
  "Crop Health Monitoring",
  "Weather-Based Planning",
  "Equipment & IoT",
  "Market & Finance",
  "Compliance & Certifications",
];

const sections = [
  {
    id: "crop-health",
    title: "Crop Health Monitoring",
    desc:
      "Detect stress early with field logs and satellite/NDVI signals. Track growth stages, spot nutrient deficiency, pests, or disease, and trigger targeted actions.",
    bullets: [
      "NDVI/VARI trendlines and anomaly alerts",
      "Scouting tasks with notes, photos, and severity",
      "Block/plot comparisons and yield heatmaps",
      "Fertilizer & pesticide logbook with outcomes",
    ],
    img: "https://img.freepik.com/premium-photo/enhancing-efficiency-agriculture-through-iot-devices-irrigation-crop-health-monitoring-concept-smart-farming-iot-agriculture-crop-monitoring-irrigation-systems_864588-178615.jpg",
    reverse: false,
  },
  {
    id: "weather-intel",
    title: "Weather-Based Planning",
    desc:
      "Turn hyper-local forecasts into decisions. Plan irrigation, spraying, and harvest windows using rainfall, wind, and temperature thresholds.",
    bullets: [
      "7–14 day forecast with field-level insights",
      "Spray/harvest suitability indices",
      "Growing Degree Days & phenology tracking",
      "Irrigation planning and water-use records",
    ],
    img: "https://ilp-media.wgbh.org/filer_public_thumbnails/filer_public/03/b9/03b9bc79-5046-47b3-9f52-053f455e7a74/buac17-img-studyweathermap.png__1281x800_q85_crop_subsampling-2_upscale.jpg",
    reverse: true,
  },
  {
    id: "equipment-iot",
    title: "Equipment & IoT",
    desc:
      "Keep machines productive and safe. Log service, predict failures, and tie sensor data back to tasks and costs.",
    bullets: [
      "Maintenance scheduler & service history",
      "Hours, fuel, and parts tracking",
      "Sensor/device integrations (soil, weather, pumps)",
      "Downtime tracking and cost analytics",
    ],
    img: "https://b2bblogassets.airtel.in/wp-content/uploads/2022/03/iot-application-in-weather-monitoring-system-2048x1365.jpg",
    reverse: false,
  },
  {
    id: "market-finance",
    title: "Market & Finance",
    desc:
      "Know your numbers and the market. Price dashboards, contract tracking, and per-acre profitability.",
    bullets: [
      "Commodity price watchlists & alerts",
      "Crop contracts and deliveries",
      "COGS & margin by field/variety",
      "Exportable invoices and reports",
    ],
    img: "https://samirhbhatt.com/wp-content/uploads/2023/07/Navigating-the-Complexities-of-Global-Financial-Markets-with-AI.jpeg",
    reverse: true,
  },
  {
    id: "compliance",
    title: "Compliance & Certifications",
    desc:
      "Keep paperwork painless. Maintain traceability for audits and certifications with one-click exports.",
    bullets: [
      "Residue-safe spray logs",
      "Organic/GlobalG.A.P. templates",
      "Worker safety & training records",
      "Audit-ready PDF/CSV exports",
    ],
    img: "https://www.inboundlogistics.com/wp-content/uploads/certificate-of-compliance-vs-certificate-of-analysis.jpg",
    reverse: false,
  },
];

function SplitSection({ data }) {
  const Img = (
    <div className="md:w-1/2">
      <div className="rounded-3xl overflow-hidden shadow-lg">
        <img
          src={data.img}
          alt={data.title}
          className="w-full h-[360px] lg:h-[460px] object-cover"
          loading="lazy"
        />
      </div>
    </div>
  );

  const Text = (
    <div className="md:w-1/2">
      <div className="px-2 md:px-8">
        <h3 className="font-bold text-2xl md:text-3xl text-slate-900 mb-4 font-mono">
          {data.title}
        </h3>
        <p className="text-slate-600 font-mono text-lg leading-relaxed mb-6 text-center md:text-left">
          {data.desc}
        </p>
        <ul className="space-y-3 font-mono text-lg">
          {data.bullets.map((b) => (
            <li key={b} className="flex items-start gap-3 text-slate-800">
              <span className="mt-2 w-2.5 h-2.5 rounded-full bg-slate-900 inline-block"></span>
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  return (
    <section
      id={data.id}
      className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 md:p-10"
    >
      <div className="flex flex-col md:flex-row items-center gap-8 lg:gap-12">
        {data.reverse ? (
          <>
            {Text}
            {Img}
          </>
        ) : (
          <>
            {Img}
            {Text}
          </>
        )}
      </div>
    </section>
  );
}

export default function Farmers() {
  const navigate = useNavigate();
  const location = useLocation();

  // Smooth-scroll to hero by default (and remap old links if needed)
  useEffect(() => {
    const offset = 96; // adjust if header height changes
    const scrollToId = (id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const y = el.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top: y, behavior: "smooth" });
    };
    const hash = (location.hash || "#hero").toLowerCase();
    if (hash === "#crop-health" || hash === "#top") {
      scrollToId("hero");
    } else {
      scrollToId(hash.replace("#", ""));
    }
  }, [location.hash]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f7faff] to-[#f3f6fb] py-10 md:py-14 px-2 sm:px-3">
      {/* ===== HERO OVERLAY (now 95% width) ===== */}
      <section id={hero.id} className={WRAP}>
        <div className="relative rounded-3xl overflow-hidden shadow-xl border border-gray-200">
          {/* Image (fainted) */}
          <img
            src={hero.image}
            alt={hero.title}
            className="w-full h-[320px] sm:h-[420px] lg:h-[600px] object-cover opacity-50"
          />
          {/* Dark overlay for contrast */}
          <div className="absolute inset-0 bg-black/30"></div>

          {/* Content overlay */}
          <div className="absolute inset-0 flex items-center justify-center px-4">
            <div className="max-w-5xl mx-auto text-center">
              <h1 className="text-white font-extrabold text-2xl sm:text-3xl md:text-4xl tracking-tight mb-4 font-mono">
                {hero.title}
              </h1>
              <p className="text-white/90 font-mono text-base sm:text-lg md:text-xl leading-relaxed mb-6">
                {hero.blurb}
              </p>
              <ul className="text-left inline-block text-white/95 font-mono text-base sm:text-lg space-y-2 mb-8">
                {heroBullets.map((f) => (
                  <li key={f} className="flex items-start gap-3">
                    <span className="mt-2 w-2.5 h-2.5 rounded-full bg-white inline-block"></span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              {/* 3 buttons side-by-side */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                  href="#solutions"
                  className="bg-slate-900 text-white font-semibold px-6 py-3 rounded-xl text-base shadow hover:bg-slate-800 transition"
                >
                  Learn More
                </a>
                <button
                  className="bg-slate-900 text-white font-semibold px-6 py-3 rounded-xl text-base shadow hover:bg-slate-800 transition"
                  onClick={() => navigate("/demo")}
                >
                  View Demo
                </button>
                <button
                  className="bg-slate-900 text-white font-semibold px-6 py-3 rounded-xl text-base shadow hover:bg-slate-800 transition"
                  onClick={() => navigate("/contact")}
                >
                  Talk to an Expert
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Split sections (95% width) ===== */}
      <div id="solutions" className={`${WRAP} mt-10 md:mt-14 space-y-8 md:space-y-12`}>
        {sections.map((s) => (
          <SplitSection key={s.id} data={s} />
        ))}
      </div>

      {/* ===== Outcomes (95% width) ===== */}
      <div className={`${WRAP} mt-14`}>
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 md:p-10">
          <h3 className="font-bold text-2xl text-slate-900 mb-6 font-mono">
            Measurable Outcomes
          </h3>
          <div className="grid md:grid-cols-3 gap-6 font-mono">
            {[
              ["↑ 5–12% yield lift", "from earlier stress detection and precise inputs"],
              ["↓ 10–20% input waste", "using weather-aware scheduling and logbooks"],
              ["↓ downtime", "via proactive maintenance and parts planning"],
            ].map(([h, s]) => (
              <div
                key={h}
                className="rounded-xl border border-gray-200 p-6 shadow-sm"
              >
                <div className="text-xl font-semibold text-slate-800 mb-1">
                  {h}
                </div>
                <div className="text-slate-600">{s}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== CTA Footer (95% width) ===== */}
      <div className={`${WRAP} text-center mt-14 md:mt-16`}>
        <h2 className="text-2xl md:text-3xl font-semibold text-slate-900 mb-4">
          Ready to grow smarter this season?
        </h2>
        <p className="text-lg md:text-2xl text-slate-500 mb-8">
          Start with crop monitoring and add weather, equipment, and compliance
          as you go—everything fits the same workflow.
        </p>
        <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
          <button
            className="bg-slate-900 text-white font-semibold px-8 py-4 rounded-xl text-lg shadow hover:bg-slate-800 transition"
            onClick={() => navigate("/signup")}
          >
            Start Free Trial
          </button>
          <button
            className="bg-white border border-gray-200 text-slate-900 font-semibold px-8 py-4 rounded-xl text-lg shadow hover:bg-gray-100 transition"
            onClick={() => navigate("/contact")}
          >
            Contact Sales
          </button>
        </div>
      </div>
    </div>
  );
}
