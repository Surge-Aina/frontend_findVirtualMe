import { User, Edit2, KeyRound, ChevronRight, Bell, Shield, CreditCard, HelpCircle, Settings } from "lucide-react";
import React, { useState, useEffect } from "react";
import axios from "axios";

export default function UserProfile() {
  const apiUrl = import.meta.env.VITE_BACKEND_API || "http://localhost:5000";
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch user data on mount
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${apiUrl}/user/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(res.data);
        setEditData(res.data);
      } catch (err) {
        setError("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [apiUrl]);

  // Handle input changes in edit mode
  const handleChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  // Save changes to backend
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `${apiUrl}/user/me`,
        editData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProfile(res.data);
      setEditMode(false);
      setSuccess("Profile updated!");
    } catch (err) {
      setError("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-gray-50">
        <div className="text-slate-500">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-gray-50">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-80 border-r border-gray-200 bg-white flex-shrink-0 flex flex-col">
        <div className="flex flex-col items-center py-10 px-6 border-b border-gray-100">
          <div className="bg-blue-100 rounded-full p-4 mb-3">
            <User className="w-10 h-10 text-blue-500" />
          </div>
          <div className="text-xl font-semibold text-gray-800">
            {(profile.firstName || "") + " " + (profile.lastName || "")}
          </div>
          <div className="text-gray-500 text-sm">{profile.email || "—"}</div>
          <div className="flex items-center mt-2">
            <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
            <span className="text-green-600 text-xs">Online</span>
          </div>
        </div>
        <nav className="flex-1 px-2 py-6 space-y-1">
          <SidebarItem icon={<User className="w-5 h-5" />} label="Profile Information" active />
          <SidebarItem icon={<Settings className="w-5 h-5" />} label="Account Settings" />
          <SidebarItem icon={<Shield className="w-5 h-5" />} label="Security" />
          <SidebarItem icon={<Bell className="w-5 h-5" />} label="Notifications" />
          <SidebarItem icon={<CreditCard className="w-5 h-5" />} label="Billing" />
          <SidebarItem icon={<HelpCircle className="w-5 h-5" />} label="Help & Support" />
        </nav>
        <div className="px-6 pb-6">
          <button className="w-full flex items-center justify-center gap-2 border border-gray-300 rounded-lg py-2 text-gray-700 hover:bg-gray-100 transition">
            <KeyRound className="w-4 h-4" />
            Change Password
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex justify-center items-start py-12 px-4 md:px-12 bg-gray-50">
        <section className="w-full max-w-3xl bg-white rounded-2xl shadow border border-gray-200 p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
            <button
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition"
              onClick={() => {
                setEditMode((v) => !v);
                setEditData(profile);
                setSuccess("");
                setError("");
              }}
            >
              <Edit2 className="w-4 h-4" />
              {editMode ? "Cancel" : "Edit"}
            </button>
          </div>
          <form className="space-y-6" onSubmit={handleSave}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ProfileField
                label="First Name"
                name="firstName"
                value={editMode ? editData.firstName : profile.firstName}
                editable={editMode}
                onChange={handleChange}
              />
              <ProfileField
                label="Last Name"
                name="lastName"
                value={editMode ? editData.lastName : profile.lastName}
                editable={editMode}
                onChange={handleChange}
              />
            </div>
            <ProfileField
              label="Username"
              name="username"
              value={editMode ? editData.username : profile.username}
              editable={editMode}
              onChange={handleChange}
            />
            <ProfileField
              label="Email"
              name="email"
              value={editMode ? editData.email : profile.email}
              editable={editMode}
              onChange={handleChange}
            />
            <ProfileField
              label="Bio"
              name="bio"
              value={editMode ? editData.bio : profile.bio}
              editable={editMode}
              onChange={handleChange}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ProfileField
                label="Location"
                name="location"
                value={editMode ? editData.location : profile.location}
                editable={editMode}
                onChange={handleChange}
              />
              <ProfileField
                label="Website"
                name="website"
                value={editMode ? editData.website : profile.website}
                editable={editMode}
                onChange={handleChange}
              />
            </div>
            {editMode && (
              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
                  onClick={() => setEditMode(false)}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            )}
            {success && <div className="text-green-600 text-center">{success}</div>}
            {error && <div className="text-red-500 text-center">{error}</div>}
          </form>
        </section>
      </main>
    </div>
  );
}

// Sidebar item component
function SidebarItem({ icon, label, active }) {
  return (
    <button
      className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-left transition ${
        active
          ? "bg-gray-100 text-blue-700 font-semibold"
          : "text-gray-700 hover:bg-gray-50"
      }`}
      type="button"
    >
      <span className="flex items-center gap-3">{icon} {label}</span>
      <ChevronRight className="w-4 h-4 text-gray-400" />
    </button>
  );
}

// Profile field component
function ProfileField({ label, name, value, editable, onChange }) {
  const displayValue = value !== undefined && value !== null && value !== "" ? value : "—";
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {editable ? (
        <input
          className="w-full rounded-lg border border-gray-200 bg-gray-100 px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-200"
          name={name}
          value={value ?? ""}
          onChange={onChange}
        />
      ) : (
        <div className="w-full rounded-lg border border-gray-200 bg-gray-100 px-4 py-2 text-gray-900">
          {displayValue}
        </div>
      )}
    </div>
  );
}