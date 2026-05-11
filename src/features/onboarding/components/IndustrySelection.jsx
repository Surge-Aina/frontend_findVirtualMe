import React from "react";
import { Code, Palette, Megaphone, TrendingUp, GraduationCap, MoreHorizontal } from "lucide-react";

const industries = [
  {
    id: "tech",
    title: "Tech & Software",
    description: "Development, engineering, and technical roles",
    icon: Code,
    bgColor: "bg-blue-50",
    iconColor: "text-blue-600",
    hoverBg: "hover:bg-blue-100",
  },
  {
    id: "design",
    title: "Design & Creative",
    description: "UX/UI, graphic design, art, and creative work",
    icon: Palette,
    bgColor: "bg-purple-50",
    iconColor: "text-purple-600",
    hoverBg: "hover:bg-purple-100",
  },
  {
    id: "marketing",
    title: "Marketing & Communications",
    description: "Digital marketing, content, and communications",
    icon: Megaphone,
    bgColor: "bg-orange-50",
    iconColor: "text-orange-600",
    hoverBg: "hover:bg-orange-100",
  },
  {
    id: "finance",
    title: "Finance",
    description: "Financial services, accounting, and analysis",
    icon: TrendingUp,
    bgColor: "bg-green-50",
    iconColor: "text-green-600",
    hoverBg: "hover:bg-green-100",
  },
  {
    id: "education",
    title: "Education",
    description: "Teaching, training, and educational content",
    icon: GraduationCap,
    bgColor: "bg-indigo-50",
    iconColor: "text-indigo-600",
    hoverBg: "hover:bg-indigo-100",
  },
  {
    id: "other",
    title: "Other",
    description: "Professional work in other industries",
    icon: MoreHorizontal,
    bgColor: "bg-gray-50",
    iconColor: "text-gray-600",
    hoverBg: "hover:bg-gray-100",
  },
];

export default function IndustrySelection({ onSelect, onBack }) {
  return (
    <div className="max-w-5xl mx-auto">
      {/* fade-in animation for header */}
      <div className="text-center mb-12 opacity-0 animate-fade-in" style={{ animationDelay: "0ms" }}>
        <h1 className="mb-4 text-gray-900">What type of work do you do?</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          This helps us customize your portfolio and connect you with relevant opportunities
        </p>
      </div>

      {/* industry grid animation */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {industries.map((industry, idx) => {
          const IconComponent = industry.icon;
          return (
            <div
              key={industry.id}
              data-cy={`industry-${industry.id}`}
              onClick={() => onSelect(industry.id)}
              className={`group relative bg-white rounded-2xl p-6 border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-200 cursor-pointer ${industry.hoverBg} opacity-0 -translate-y-8 animate-fade-in-up`}
              style={{ animationDelay: `${300 + idx * 200}ms` }}
            >
              <div className="flex flex-col items-center text-center">
                <div
                  className={`w-14 h-14 ${industry.bgColor} rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform`}
                >
                  <IconComponent className={`w-7 h-7 ${industry.iconColor}`} />
                </div>
                <h3 className="mb-2 text-gray-900">{industry.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{industry.description}</p>
              </div>
              <div className="absolute top-4 right-4 w-5 h-5 border border-gray-300 rounded-full group-hover:border-blue-500 group-hover:bg-blue-50 transition-colors"></div>
            </div>
          );
        })}
      </div>

      {/* footer actions */}
      <div className="flex justify-between items-center mt-12">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          Back
        </button>
        <span className="text-sm text-gray-500">25% complete</span>
      </div>
      {/* custom animation styles */}
      <style>
        {`
          @keyframes fade-in {
            to {
              opacity: 1;
            }
          }
          .animate-fade-in {
            animation: fade-in 1s cubic-bezier(.8,0,.2,1) forwards;
          }
          @keyframes fade-in-up {
            to {
              opacity: 1;
              transform: none;
            }
          }
          .animate-fade-in-up {
            animation: fade-in-up 1.2s cubic-bezier(.8,0,.2,1) forwards; /* <-- slower animation */
          }
        `}
      </style>
    </div>
  );
}
