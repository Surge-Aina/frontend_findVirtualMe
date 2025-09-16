import React, { useState } from "react";

export default function UserInfoForm({ onComplete, onBack }) {
  const [userInfo, setUserInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    location: "",
    bio: "",
    password: "",
    username: "",
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (field, value) => {
    setUserInfo((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!userInfo.firstName.trim()) newErrors.firstName = "First name is required";
    if (!userInfo.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!userInfo.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(userInfo.email)) {
      newErrors.email = "Please enter a valid email";
    }
    if (!userInfo.password.trim()) newErrors.password = "Password is required";
    if (!userInfo.username.trim()) newErrors.username = "Username is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onComplete(userInfo);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div
        className="text-center mb-12 opacity-0 animate-fade-in"
        style={{ animationDelay: "0ms" }}
      >
        <h1 className="mb-4 text-gray-900">Tell us about yourself</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Complete your profile to get started with FindVirtual.me
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 opacity-0 animate-fade-in-up" style={{ animationDelay: "300ms" }}>
        {/* Name fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block mb-1 font-medium text-gray-700">
              First Name *
            </label>
            <input
              id="firstName"
              value={userInfo.firstName}
              onChange={(e) => handleInputChange("firstName", e.target.value)}
              className={`w-full px-3 py-2 border rounded-md ${errors.firstName ? "border-red-500" : "border-gray-300"}`}
              placeholder="Enter your first name"
            />
            {errors.firstName && (
              <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
            )}
          </div>
          <div>
            <label htmlFor="lastName" className="block mb-1 font-medium text-gray-700">
              Last Name *
            </label>
            <input
              id="lastName"
              value={userInfo.lastName}
              onChange={(e) => handleInputChange("lastName", e.target.value)}
              className={`w-full px-3 py-2 border rounded-md ${errors.lastName ? "border-red-500" : "border-gray-300"}`}
              placeholder="Enter your last name"
            />
            {errors.lastName && (
              <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
            )}
          </div>
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block mb-1 font-medium text-gray-700">
            Email Address *
          </label>
          <input
            id="email"
            type="email"
            value={userInfo.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            className={`w-full px-3 py-2 border rounded-md ${errors.email ? "border-red-500" : "border-gray-300"}`}
            placeholder="your@email.com"
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block mb-1 font-medium text-gray-700">
            Password *
          </label>
          <input
            id="password"
            type="password"
            value={userInfo.password}
            onChange={(e) => handleInputChange("password", e.target.value)}
            className={`w-full px-3 py-2 border rounded-md ${errors.password ? "border-red-500" : "border-gray-300"}`}
            placeholder="Enter a password"
          />
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password}</p>
          )}
        </div>

        {/* Username */}
        <div>
          <label htmlFor="username" className="block mb-1 font-medium text-gray-700">
            Username *
          </label>
          <input
            id="username"
            value={userInfo.username}
            onChange={(e) => handleInputChange("username", e.target.value)}
            className={`w-full px-3 py-2 border rounded-md ${errors.username ? "border-red-500" : "border-gray-300"}`}
            placeholder="Choose a username"
          />
          {errors.username && (
            <p className="text-red-500 text-sm mt-1">{errors.username}</p>
          )}
        </div>

        {/* phone (not required)*/}
        <div>
          <label htmlFor="phone" className="block mb-1 font-medium text-gray-700">
            Phone Number
          </label>
          <input
            id="phone"
            type="tel"
            value={userInfo.phone}
            onChange={(e) => handleInputChange("phone", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="(555) 123-4567"
          />
        </div>

        {/* location (also not required)*/}
        <div>
          <label htmlFor="location" className="block mb-1 font-medium text-gray-700">
            Location
          </label>
          <input
            id="location"
            value={userInfo.location}
            onChange={(e) => handleInputChange("location", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="City, State/Country"
          />
        </div>

        

        {/* Form Actions */}
        <div className="flex justify-between items-center pt-6">
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Back
          </button>
          <button
            type="submit"
            className="px-8 py-2 bg-blue-600 text-white rounded-md font-semibold shadow hover:bg-blue-700 transition-all"
          >
            Complete Setup
          </button>
        </div>
      </form>
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
            animation: fade-in-up 0.7s cubic-bezier(.8,0,.2,1) forwards;
          }
        `}
      </style>
    </div>
  );
}