//contactMeForm.jsx
import { useState } from "react";
import axiosAuth from "../../../utils/axiosAuth";

export default function ContactMeForm({ onSuccess, portfolioId, portfolioType, ownerEmail, ownerName, onClose }) {
  const initialFormState = {
    name: "",
    email: "",
    message: "",
    portfolioId: portfolioId,
    portfolioType: portfolioType,
    ownerEmail: ownerEmail,
    ownerName: ownerName
  };
  const [formData, setFormData] = useState(initialFormState);

    const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
    //   await axiosAuth.post(`/contactMe`, formData);
    //   if (onSuccess) onSuccess();
    //   setFormData(initialFormState);
    //   if (onClose) onClose();
    console.log("Form submitted with data:", formData);
    } catch (err) {
      console.error("Failed to send message", err);
    }   
    };

    return (
        <>
            <h3 className="text-xl font-semibold text-gray-800 mb-6">
                Contact Me
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        required
                    />
                </div>
                <div>   
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                        type="email"
                        name="email"                    
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                    <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        required
                    />
                </div>

                <button
                    type="submit"
                    className="w-full py-2 px-4 rounded-md font-medium text-white bg-blue-600 hover:bg-blue-700 cursor-pointer"
                    >
                    Send Message
                    </button>

            </form>
        </>
    );
}
