import { motion } from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  Camera,
  Brush,
  ShoppingBag,
  Star,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const features = [
  {
    icon: Camera,
    title: "Showcase Your Best Shots",
    description:
      "Whether you're a photographer, artist, or craftsperson — display your work in a format that puts it in the spotlight.",
  },
  {
    icon: Brush,
    title: "Creative Freedom",
    description:
      "Pick from stylish, easy-to-edit templates that match your personal vibe and make your portfolio feel truly yours.",
  },
  {
    icon: ShoppingBag,
    title: "Attract Clients",
    description:
      "Add pricing, contact forms, or booking options so visitors can go from admiring your work to hiring you instantly.",
  },
  {
    icon: Star,
    title: "Make a Lasting Impression",
    description:
      "Our layouts keep eyes where they belong — on your talent — with fast loading and mobile-first design.",
  },
];

export default function PortfolioShowcase() {
  const navigate = useNavigate();
  const handleGetStarted = () => {
    navigate("/resume");
  };
  return (
    <>
      {/* Hero Section */}
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden w-full">
        {/* Background gradient */}
        <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-sky-50 via-white to-blue-50"></div>

        {/* Floating elements */}
        <div className="absolute inset-0 overflow-hidden w-full h-full">
          <motion.div
            className="absolute -top-10 -right-10 w-72 h-72 bg-gradient-to-br from-blue-100/30 to-sky-100/20 rounded-full blur-3xl"
            animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute -bottom-20 -left-20 w-96 h-96 bg-gradient-to-tr from-sky-100/20 to-blue-100/30 rounded-full blur-3xl"
            animate={{ y: [0, 20, 0], x: [0, -15, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        <div className="w-full text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex items-center justify-center mb-6"
          >
            <div className="flex items-center space-x-2 bg-white/60 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
              <Sparkles className="w-4 h-4 text-slate-600" />
              <span className="text-sm text-slate-600">
                Share your craft with the world
              </span>
            </div>
          </motion.div>

          <motion.h1
            className="text-5xl md:text-7xl font-light text-slate-800 mb-6 leading-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Your work,
            <br />
            <span className="bg-gradient-to-r from-sky-700 to-slate-900 bg-clip-text text-transparent">
              beautifully displayed
            </span>
          </motion.h1>

          <motion.p
            className="text-lg md:text-xl text-slate-800 mb-12 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            FindVirtual.me makes it effortless for photographers, artists,
            street vendors, and creators of all kinds to build an online space
            that shows the world what you can do — no tech skills needed.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 px-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <button
              onClick={handleGetStarted}
              className="relative bg-slate-800 hover:bg-slate-700 text-white px-8 py-6 text-lg rounded-xl group transition-all duration-300 shadow-2xl shadow-slate-800/25 flex items-center overflow-hidden w-full sm:w-auto mx-2"
            >
              <span className="relative z-10 flex items-center">
                Start Your Creative Showcase
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
              <span className="absolute inset-0 w-1/3 h-full bg-white/10 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
            </button>

            <button
              onClick={() => navigate("/portfolios", { state: { from: "occupations" } })}
              className="text-slate-600 hover:text-slate-800 px-8 py-6 text-lg rounded-xl backdrop-blur-sm bg-white/40 hover:bg-white/60 border border-white/20 w-full sm:w-auto mx-2"
            >
              View examples
            </button>
          </motion.div>

          <motion.div
            className="mt-16 text-sm text-slate-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.2 }}
          >
            Join thousands of creators showcasing their talent
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <section
        id="features"
        className="py-24 bg-white/50 backdrop-blur-sm w-full"
      >
        <div className="w-full">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-light text-slate-800 mb-4">
              Tools to{" "}
              <span className="bg-gradient-to-r from-sky-700 to-slate-900 bg-clip-text text-transparent">
                showcase your work
              </span>
            </h2>
            <p className="text-lg text-slate-800 max-w-2xl mx-auto">
              From photographers to street food vendors, our platform gives you
              everything you need to create a portfolio that tells your story
              and attracts the right audience.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center">
              <motion.div
                className="bg-gradient-to-br from-blue-100 via-slate-100 to-blue-200 rounded-2xl px-8 py-6 shadow-xl border border-blue-200/40 max-w-xl"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center justify-center mb-3">
                <Sparkles className="w-7 h-7 text-blue-500 animate-pulse" />
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-2 text-center">
                Portfolio Insights
                </h3>
                <p className="text-slate-700 text-center">
                A stunning portfolio is just the start.  
                We give you <span className="font-semibold">deep insights</span> into how visitors engage with your work — which sections capture attention, which get skipped, and how they navigate your content.  
                <span className="font-semibold">Get personalized tips</span> to refine your portfolio, keep visitors hooked, and leave a lasting impression.
                </p>
              </motion.div>
            </div>
          </motion.div>

          <div className="flex justify-center">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  className="group"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:bg-white/80 transition-all duration-300 hover:shadow-xl hover:shadow-sky-200/50 group-hover:-translate-y-2">
                    <div className="w-12 h-12 bg-gradient-to-br from-sky-100 to-blue-200 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                      <feature.icon className="w-6 h-6 text-sky-700" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-800 mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-slate-800 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
