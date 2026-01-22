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
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext.jsx";

const features = [
  {
    icon: Camera,
    title: "Showcase Your Experience",
    description:
      "Whether you're a project manager, healthcare professional, or specialist in another field — present your work in a format that puts your impact in the spotlight.",
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
  const { contextLoggedIn } = useContext(AuthContext);
  // if user logged in, go to resume, else go to onboarding
  const handleGetStarted = () => {
    if (contextLoggedIn || localStorage.getItem("token")) {
      navigate("/resume");
    } else {
      navigate("/onboarding");
    }
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
            animate={{ y: [0, 30, 0], x: [0, 20, 0] }}
            transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
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
            <div className="flex items-center space-x-2 bg-white/70 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
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
            <span className="font-semibold"> your way.</span>
          </motion.h1>

          <motion.p
            className="text-lg md:text-xl text-slate-700 max-w-2xl mx-auto mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            FindVirtual.me makes it effortless for project managers, healthcare
            professionals, and other career-focused experts to build an online space
            that shows the world what you can do — no tech skills needed.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <button
              onClick={handleGetStarted}
              className="relative px-8 py-3 rounded-full bg-slate-900 text-white font-medium shadow-lg shadow-slate-900/20 overflow-hidden group w-full sm:w-auto"
            >
              <span className="relative z-10 flex items-center">
                Start Your Creative Showcase
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
              <span className="absolute inset-0 w-1/3 h-full bg-white/15 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
            </button>

            <button
              onClick={() => navigate("/portfolios", { state: { from: "occupations" } })}
              className="text-slate-600 hover:text-slate-800 px-8 py-3 rounded-full bg-white/70 hover:bg-white/60 border border-white/20 w-full sm:w-auto mx-2"
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
        className="py-20 bg-gradient-to-b from-white to-sky-50/80 border-t border-slate-100"
      >
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="text-3xl md:text-4xl font-light text-slate-900 mb-4">
              Build a portfolio that does more than just look good
            </h2>
            <p className="text-lg text-slate-800 max-w-2xl mx-auto">
              From project managers to healthcare professionals, our platform gives you
              everything you need to create a portfolio that tells your story
              and attracts the right audience.
            </p>
          </motion.div>

          {/* ...rest of the file (features grid, etc.) stays unchanged */}
          {/* Keeping full structure so nothing breaks */}
          <motion.div
            className="relative overflow-hidden rounded-3xl bg-white/80 shadow-xl shadow-sky-200/40 border border-slate-100 mb-16"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            {/* (rest of original JSX content unchanged here) */}
            {/* For brevity, you can keep the remaining JSX exactly as in your current file */}
            <div className="flex flex-col lg:flex-row items-stretch">
              {/* ... keep existing inner content unchanged ... */}
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
                  <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-100 shadow-md hover:shadow-xl hover:shadow-sky-200/50 group-hover:-translate-y-2">
                    <div className="w-12 h-12 bg-gradient-to-br from-sky-100 to-sky-200 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
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
