import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Palette, Zap, Globe, Shield } from "lucide-react";

const features = [
	{
		icon: Palette,
		title: "Beautiful Templates",
		description:
			"Choose from the variety of professionally designed templates that adapt to your unique style and content.",
	},
	{
		icon: Zap,
		title: "Lightning Fast",
		description:
			"Build and deploy your portfolio in minutes, not hours. Our platform handles all the technical complexity.",
	},
	{
		icon: Globe,
		title: "Global Reach",
		description:
			"Your portfolio is responsive and performs beautifully across all devices.",
	},
	{
		icon: Shield,
		title: "Secure & Reliable",
		description:
			"Enterprise-grade security with 99.9% uptime. Your work deserves a platform you can trust.",
	},
];

export default function About({ onGetStarted }) {
	return (
		<>
			{/* Hero Section */}
			<div className="min-h-screen flex items-center justify-center relative overflow-hidden w-full">
				{/* Background gradient */}
				<div className="absolute inset-0 w-full h-full bg-gradient-to-br from-slate-50 via-white to-slate-100"></div>

				{/* Floating elements for visual interest */}
				<div className="absolute inset-0 overflow-hidden w-full h-full">
					<motion.div
						className="absolute -top-10 -right-10 w-72 h-72 bg-gradient-to-br from-slate-200/30 to-slate-300/20 rounded-full blur-3xl"
						animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
						transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
					/>
					<motion.div
						className="absolute -bottom-20 -left-20 w-96 h-96 bg-gradient-to-tr from-slate-300/20 to-slate-200/30 rounded-full blur-3xl"
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
								Create stunning portfolios in minutes
							</span>
						</div>
					</motion.div>

					<motion.h1
						className="text-5xl md:text-7xl font-light text-slate-800 mb-6 leading-tight"
						initial={{ opacity: 0, y: 30 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8, delay: 0.4 }}
					>
						Showcase your work
						<br />
						<span className="bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">
							beautifully
						</span>
					</motion.h1>

					<motion.p
						className="text-lg md:text-xl text-slate-800 mb-12 max-w-3xl mx-auto leading-relaxed"
						initial={{ opacity: 0, y: 30 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8, delay: 0.6 }}
					>
						FindVirtual.me empowers creators, designers, and professionals to build
						stunning portfolio websites that stand out. No coding required – just
						your creativity and our intelligent platform.
					</motion.p>

					<motion.div
						className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6"
						initial={{ opacity: 0, y: 30 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8, delay: 0.8 }}
					>
						<button
							onClick={onGetStarted}
							className="relative bg-slate-800 hover:bg-slate-700 text-white px-8 py-6 text-lg rounded-xl group transition-all duration-300 shadow-2xl shadow-slate-800/25 flex items-center overflow-hidden"
						>
							<span className="relative z-10 flex items-center">
								Start creating your portfolio
								<ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
							</span>
							<span className="absolute inset-0 w-1/3 h-full bg-white/10 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
						</button>

						<button className="text-slate-600 hover:text-slate-800 px-8 py-6 text-lg rounded-xl backdrop-blur-sm bg-white/40 hover:bg-white/60 border border-white/20">
							View examples
						</button>
					</motion.div>

					<motion.div
						className="mt-16 text-sm text-slate-500"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ duration: 0.8, delay: 1.2 }}
					>
						Join amazing creators who trust FindVirtual.me
					</motion.div>
				</div>
			</div>

			{/* Features Section */}
			<section id="features" className="py-24 bg-white/50 backdrop-blur-sm w-full">
				<div className="w-full">
					<motion.div
						className="text-center mb-16"
						initial={{ opacity: 0, y: 30 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6 }}
						viewport={{ once: true }}
					>
						<h2 className="text-3xl md:text-4xl font-light text-slate-800 mb-4">
							Everything you need to
							<span className="bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">
								 succeed
							</span>
						</h2>
						<p className="text-lg text-slate-800 max-w-2xl mx-auto">
							Our platform combines powerful features with intuitive design to help
							you create portfolios that truly represent your work.
						</p>
					</motion.div>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
						{features.map((feature, index) => (
							<motion.div
								key={feature.title}
								className="group"
								initial={{ opacity: 0, y: 30 }}
								whileInView={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.6, delay: index * 0.1 }}
								viewport={{ once: true }}
							>
								<div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:bg-white/80 transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/50 group-hover:-translate-y-2">
									<div className="w-12 h-12 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
										<feature.icon className="w-6 h-6 text-slate-700" />
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
			</section>
		</>
	);
}