import React, { useState } from "react";
import { X, Plus } from "lucide-react";

const skillSuggestions = {
  tech: [
    "JavaScript",
    "Python",
    "React",
    "Node.js",
    "TypeScript",
    "HTML/CSS",
    "SQL",
    "AWS",
    "Docker",
    "Kubernetes",
    "Git",
    "REST APIs",
    "Mobile Development",
    "Machine Learning",
    "DevOps",
    "C++",
    "Java",
    "Ruby on Rails",
    "Testing/QA",
    "Cloud Computing",
  ],
  design: [
    "Figma",
    "Adobe Creative Suite",
    "Sketch",
    "InVision",
    "Prototyping",
    "UI Design",
    "UX Research",
    "Branding",
  ],
  marketing: [
    "Google Analytics",
    "Social Media Marketing",
    "Content Marketing",
    "SEO",
    "Email Marketing",
    "PPC Advertising",
    "Copywriting",
    "Marketing Strategy",
  ],
  finance: [
    "Financial Analysis",
    "Excel",
    "QuickBooks",
    "Financial Modeling",
    "Accounting",
    "Tax Preparation",
    "Investment Analysis",
    "Risk Management",
  ],
  education: [
    "Curriculum Development",
    "Online Teaching",
    "Student Assessment",
    "Learning Management Systems",
    "Educational Technology",
    "Instructional Design",
    "Classroom Management",
    "Research",
  ],
  other: [
    "Project Management",
    "Communication",
    "Leadership",
    "Problem Solving",
    "Time Management",
    "Team Collaboration",
    "Customer Service",
    "Data Analysis",
  ],
};

export default function SkillsSelection({ onComplete, onBack, industry = "other" }) {
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [customSkill, setCustomSkill] = useState("");

  const suggestions = skillSuggestions[industry] || skillSuggestions.other;

  const toggleSkill = (skill) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const addCustomSkill = () => {
    if (customSkill.trim() && !selectedSkills.includes(customSkill.trim())) {
      setSelectedSkills((prev) => [...prev, customSkill.trim()]);
      setCustomSkill("");
    }
  };

  const removeSkill = (skill) => {
    setSelectedSkills((prev) => prev.filter((s) => s !== skill));
  };

  const handleContinue = () => {
    onComplete(selectedSkills);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="mb-4 text-gray-900">What are your skills?</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Select from the suggestions below or add your own skills
        </p>
      </div>

      {/* selected skills */}
      {selectedSkills.length > 0 && (
        <div className="mb-8">
          <h3 className="mb-4 text-gray-900">Selected Skills</h3>
          <div className="flex flex-wrap gap-2">
            {selectedSkills.map((skill) => (
              <div
                key={skill}
                className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full"
              >
                <span className="text-sm">{skill}</span>
                <button
                  type="button"
                  onClick={() => removeSkill(skill)}
                  className="hover:bg-blue-200 rounded-full p-1 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skill suggestions */}
      <div className="mb-8">
        <h3 className="mb-4 text-gray-900">Suggested Skills</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {suggestions.map((skill) => (
            <button
              type="button"
              key={skill}
              onClick={() => toggleSkill(skill)}
              className={`p-3 rounded-lg border text-sm transition-all ${
                selectedSkills.includes(skill)
                  ? "bg-blue-50 border-blue-300 text-blue-700"
                  : "bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:shadow-sm"
              }`}
            >
              {skill}
            </button>
          ))}
        </div>
      </div>

      {/* add custom skill */}
      <div className="mb-8">
        <h3 className="mb-4 text-gray-900">Add Custom Skill</h3>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Enter a skill..."
            value={customSkill}
            onChange={(e) => setCustomSkill(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addCustomSkill()}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
          />
          <button
            type="button"
            onClick={addCustomSkill}
            className="px-4 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-100 flex items-center justify-center"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleContinue}
          disabled={selectedSkills.length === 0}
          className="px-8 py-2 bg-blue-600 text-white rounded-md font-semibold shadow hover:bg-blue-700 transition-all disabled:opacity-50"
        >
          Continue
        </button>
      </div>
    </div>
  );
}