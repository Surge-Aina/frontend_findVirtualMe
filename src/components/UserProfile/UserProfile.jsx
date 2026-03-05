import {
  User,
  Edit2,
  KeyRound,
  ChevronRight,
  Bell,
  Shield,
  CreditCard,
  HelpCircle,
  Settings,
  PanelsTopLeft,
} from "lucide-react";
import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import ManageBillingComponent from "./ManageBillingComponent";
import { AuthContext } from "../../context/AuthContext";
import axiosAuth from "../../utils/axiosAuth";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useHandleCardClick } from "../../utils/useHandleCardClick";
import DomainLookup from "./DomainLookup";
import QRWidgetSettings from "./QRWidgetSettings";

export default function UserProfile() {
  const { handleCardClick } = useHandleCardClick();
  const apiUrl = import.meta.env.VITE_BACKEND_API || "http://localhost:5000";
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [portfolioVisible, setPortfolioVisible] = useState(true);
  const { user, setUser, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [domains, setDomains] = useState([]);
  const [loadingDomains, setLoadingDomains] = useState(false);
  const [newDomain, setNewDomain] = useState("");
  const [addingDomain, setAddingDomain] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  // Get tab from URL or default to "Profile Information"
  const [currentTab, setCurrentTab] = useState(searchParams.get("tab") || "Profile Information");

  // Update URL when tab changes
  const handleTabChange = (newTab) => {
    setCurrentTab(newTab);
    setSearchParams({ tab: newTab });
  };

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }
    console.log("user from context", user);

    // Logged in but user still loading
    if (!user) return;

    setProfile(user);
    setEditData(user);
    setLoading(false);
  }, [user, token]);

  useEffect(() => {
    console.log("current profile state", profile);
  }, [profile]);

  // load domains when the tab is selected
  useEffect(() => {
    if (currentTab === "Domain Management") {
      loadDomains();
    }
  }, [currentTab]);

  // domain management functions
  const loadDomains = async () => {
    setLoadingDomains(true);
    try {
      // const response = await axiosAuth.get(`${apiUrl}/api/domains/myDomains`);
      // // always set an array, even if the response structure is different
      // const domainsData = response.data?.domains || response.data || [];
      const response = await axiosAuth.get(`/domainRouter`);
      const domainsData = response.data;
      setDomains(Array.isArray(domainsData) ? domainsData : []);
    } catch (error) {
      console.error("Failed to load domains:", error);
      if (error.response?.status === 404) {
        setDomains([]);
        console.log("Domain endpoint not implemented yet");
      } else {
        toast.error("Failed to load domains");
      }
      setDomains([]); // Always set to empty array on error
    } finally {
      console.log("domains", domains);
      setLoadingDomains(false);
    }
  };

  const handleAddDomain = async () => {
    if (!newDomain.trim()) return;

    setAddingDomain(true);
    try {
      const response = await axiosAuth.post(`${apiUrl}/api/domains/custom`, {
        domain: newDomain.trim(),
      });
      console.log("add domain response", response);

      // Reload domains to get the updated list
      await loadDomains();
      setNewDomain("");
      toast.success("Domain added successfully!");
    } catch (error) {
      console.error("Failed to add domain:", error);
      toast.error(error.response?.data?.message || "Failed to add domain");
    } finally {
      setAddingDomain(false);
    }
  };

  const handleRemoveDomain = async (domainId) => {
    if (!window.confirm("Are you sure you want to remove this domain?")) return;

    try {
      //delete from users domain array
      const userArrayResponse = await axiosAuth.delete(`${apiUrl}/api/domains/${domainId}`);
      //delete from domain collection
      const domainRouterResponse = await axiosAuth.delete(`/domainRouter/${domainId}`);
      console.log("remove domain responses", { userArrayResponse, domainRouterResponse });
      
      setDomains((prev) => prev.filter((domain) => domain._id !== domainId));
      toast.success("Domain removed successfully!");
    } catch (error) {
      console.error("Failed to remove domain:", error);
      toast.error("Failed to remove domain");
    }
  };

  const handleVerifyDomain = async (domainId) => {
    try {
      // Find the domain to get its domain name
      const domain = domains.find((d) => d._id === domainId);
      if (!domain) {
        toast.error("Domain not found");
        return;
      }

      const response = await axiosAuth.post(`${apiUrl}/api/domains/verify/${domain.domain}`);

      console.log("verify domain response", response);
      console.log("domain being verified", domain);
      // Reload domains to get updated status
      await loadDomains();
      toast.success("Domain verification completed!");
    } catch (error) {
      console.error("Failed to verify domain:", error);
      toast.error(error.response?.data?.message || "Failed to verify domain");
    }
  };

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
      const res = await axiosAuth.patch(`${apiUrl}/user/updateUser`, editData);

      const updatedUser = res.data.user;

      setProfile(updatedUser);
      setEditData(updatedUser);
      setUser(updatedUser);

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
          <SidebarItem
            icon={<User className="w-5 h-5" />}
            label="Profile Information"
            currentTab={currentTab}
            setCurrentTab={handleTabChange}
          />
          <SidebarItem
            icon={<Settings className="w-5 h-5" />}
            label="Account Settings"
            currentTab={currentTab}
            setCurrentTab={handleTabChange}
          />
          <SidebarItem
            icon={<Shield className="w-5 h-5" />}
            label="Security"
            currentTab={currentTab}
            setCurrentTab={handleTabChange}
          />
          <SidebarItem
            icon={<CreditCard className="w-5 h-5" />}
            label="Billing"
            currentTab={currentTab}
            setCurrentTab={handleTabChange}
          />
          <SidebarItem
            icon={<PanelsTopLeft className="w-5 h-5" />}
            label="Domain Management"
            currentTab={currentTab}
            setCurrentTab={handleTabChange}
          />
          <SidebarItem
            icon={<Settings className="w-5 h-5" />}
            label="QR Customization"
            currentTab={currentTab}
            setCurrentTab={handleTabChange}
          />
          <SidebarItem
            icon={<Bell className="w-5 h-5" />}
            label="Notifications"
            currentTab={currentTab}
            setCurrentTab={handleTabChange}
          />
          <SidebarItem
            icon={<HelpCircle className="w-5 h-5" />}
            label="Help & Support"
            currentTab={currentTab}
            setCurrentTab={handleTabChange}
          />
        </nav>
        <div className="px-6 pb-6">
          <button className="w-full flex items-center justify-center gap-2 border border-gray-300 rounded-lg py-2 text-gray-700 hover:bg-gray-100 transition">
            <KeyRound className="w-4 h-4" />
            Change Password
          </button>
        </div>
      </aside>
      {/* Main Content */}
      {currentTab === "Profile Information" && (
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
                  //value={editMode ? editData.firstName : profile.firstName}
                  value={editData.firstName}
                  editable={editMode}
                  onChange={handleChange}
                />
                <ProfileField
                  label="Last Name"
                  name="lastName"
                  value={editData.lastName}
                  editable={editMode}
                  onChange={handleChange}
                />
              </div>
              <ProfileField
                label="Username"
                name="username"
                value={editData.username}
                editable={editMode}
                onChange={handleChange}
              />
              <ProfileField
                label="Email"
                name="email"
                value={editData.email}
                editable={editMode}
                onChange={handleChange}
              />
              <ProfileField label="Bio" name="bio" value={editData.bio} editable={editMode} onChange={handleChange} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ProfileField
                  label="Location"
                  name="location"
                  value={editData.location}
                  editable={editMode}
                  onChange={handleChange}
                />
                <ProfileField
                  label="Website"
                  name="website"
                  value={editData.website}
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
      )}
      {/* Account Settings */}
      {currentTab === "Account Settings" && (
        <main className="flex-1 flex justify-center items-start py-12 px-4 md:px-12 bg-gray-50">
          <section className="w-full max-w-3xl bg-white rounded-2xl shadow border border-gray-200 p-8">
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Account Settings</h2>
              <p className="text-gray-600">Manage your account preferences and privacy settings.</p>
            </div>

            {/* Privacy Settings */}
            <div className="space-y-6">
              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Privacy Settings</h3>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900">Portfolio Visibility</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Allow your portfolios to be visible to the public. When disabled, only you can view your
                      portfolios.
                    </p>
                  </div>
                  <div className="ml-4">
                    <ToggleSwitch enabled={portfolioVisible} onChange={setPortfolioVisible} />
                  </div>
                </div>

                <div className="mt-3 text-xs text-gray-500">
                  {portfolioVisible
                    ? "✓ Your portfolios are currently visible to everyone"
                    : "⚠ Your portfolios are currently private"}
                </div>
              </div>

              <div className="pt-4">
                <div className="text-sm text-gray-500 italic">More account settings will be available soon...</div>
              </div>
            </div>
          </section>
        </main>
      )}
      {/* Billing */}
      {currentTab === "Billing" && <ManageBillingComponent />}
      {/* Domain Management */}
      {currentTab === "Domain Management" && (
        <main className="flex  flex-col justify-center items-start py-12 px-4 md:px-12 bg-gray-50">
          {/* Domain lookup */}
          <section>
            <DomainLookup />
          </section>

          <section className="w-full max-w-4xl bg-white rounded-2xl shadow border border-gray-200 p-8">
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Domain Management</h2>
              <p className="text-gray-600">Connect custom domains to your portfolios and manage DNS settings.</p>
            </div>

            {/* =============== removed for now -- possible addition later on -carlosG==============*/}
            {/* Add New Domain */}
            <div className="border border-gray-200 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Domain</h3>
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Enter your domain (e.g., myportfolio.com)"
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyDown={(e) => e.key === "Enter" && handleAddDomain()}
                />
                <button
                  onClick={handleAddDomain}
                  disabled={!newDomain.trim() || addingDomain}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                >
                  {addingDomain ? "Adding..." : "Add Domain"}
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Make sure you own this domain and can configure its DNS settings.
              </p>
            </div>

            {/* Existing Domains */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Your Domains</h3>

              {loadingDomains ? (
                <div className="text-center py-12">
                  <div className="text-gray-500">Loading domains...</div>
                </div>
              ) : !Array.isArray(domains) || domains.length === 0 ? (
                <div className="text-center py-12 border border-gray-200 rounded-lg">
                  <PanelsTopLeft className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No domains added yet</h4>
                  <p className="text-gray-600">Add your first custom domain to get started.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {domains.map((domain) => (
                    <DomainCard
                      key={domain._id || domain.id || Math.random()}
                      domain={domain}
                      onRemove={handleRemoveDomain}
                      onVerify={handleVerifyDomain}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* =============== removed for now -- possible addition later on -carlosG==============*/}
            {/* DNS Instructions */}
            {domains.length > 0 && (
              <div className="mt-8 border border-blue-200 bg-blue-50 rounded-lg p-6">
                <h3 className="text-lg font-medium text-blue-900 mb-3">DNS Configuration Instructions</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <strong className="text-blue-800">1. Add CNAME Record:</strong>
                    <div className="mt-1 font-mono bg-white border border-blue-200 rounded px-3 py-2">
                      Type: CNAME | Name: www | Value: cname.vercel-dns.com
                    </div>
                  </div>
                  <div>
                    <strong className="text-blue-800">2. Add A Record (optional):</strong>
                    <div className="mt-1 font-mono bg-white border border-blue-200 rounded px-3 py-2">
                      Type: A | Name: @ | Value: 76.76.21.21
                    </div>
                  </div>
                  <p className="text-blue-700 mt-3">
                    DNS changes may take up to 24 hours to propagate.
                  </p>
                </div>
              </div>
            )}
          </section>
        </main>
      )}
      {currentTab === "QR Customization" && (
        <main className="flex-1 flex justify-center items-start py-12 px-4 md:px-12 bg-gray-50">
          <section className="w-full max-w-4xl bg-white rounded-2xl shadow border border-gray-200 p-8">
            <QRWidgetSettings />
          </section>
        </main>
      )}
    </div>
  );
}

// Sidebar item component
function SidebarItem({ icon, label, currentTab, setCurrentTab }) {
  return (
    <button
      onClick={() => setCurrentTab(label)}
      className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-left transition ${
        label === currentTab ? "bg-gray-100 text-blue-700 font-semibold" : "text-gray-700 hover:bg-gray-50"
      }`}
      type="button"
    >
      <span className="flex items-center gap-3">
        {icon} {label}
      </span>
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

// Toggle switch component
function ToggleSwitch({ enabled, onChange }) {
  return (
    <button
      type="button"
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
        enabled ? "bg-blue-600" : "bg-gray-200"
      }`}
      onClick={() => onChange(!enabled)}
    >
      <span className="sr-only">Toggle portfolio visibility</span>
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
          enabled ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

// domain card component
function DomainCard({ domain, onRemove, onVerify }) {
  const { user } = useContext(AuthContext);
  // const [domains, setDomains] = useState([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState(domain.portfolioId || "");
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800";
      case "pending_verification":
        return "bg-yellow-100 text-yellow-800";
      case "failed_registration":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "✓";
      case "pending_verification":
        return "⏳";
      case "failed_registration":
        return "⚠";
      default:
        return "○";
    }
  };

  const onConnectProject = async (domainName, portfolioId) => {
    // Implement the logic to connect the domain to the selected portfolio type
    const res = await axiosAuth.patch(`/domainRouter/${domain._id}`, {
      domain: domain.domain,
      portfolioId: portfolioId,
      //optional: notes(String)
    });
    console.log("connecting domain to portfolio", domainName, portfolioId);
    console.log("domain connect response", res);
    console.log("user data", user);
    setSelectedPortfolio(res.data.portfolioId);
  };

  // const selectedPortfolio = user?.portfolios?.find(p => p.portfolioId === domain.portfolioId);

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h4 className="font-medium text-gray-900">
              <a 
                href={`https://${domain.domain}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-blue-600 hover:underline"
              >
                {domain.domain}
              </a>
            </h4>
            {/* <span
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                domain.status,
              )}`}
            >
              {getStatusIcon(domain.status)}
              {domain.status ? domain.status.charAt(0).toUpperCase() + domain.status.slice(1) : "Unknown"}
            </span> */}
          </div>
          <div className="text-sm text-gray-600 space-y-1">
            <p>Added: {new Date(domain.createdAt).toLocaleDateString()}</p>
            {domain.lastVerified && <p>Last verified: {new Date(domain.lastVerified).toLocaleDateString()}</p>}
            {domain.connectedProject && <p>Connected to: {domain.connectedProject}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2 ml-4">
          {/* =============== removed for now -- possible addition later on -carlosG==============*/}
          {/* <button
            onClick={() => onVerify(domain._id)}
            className="px-3 py-1 text-sm border border-blue-300 text-blue-600 rounded hover:bg-blue-50 transition"
          >
            Verify
          </button> */}
          {/* Domain Portfolio */}
          {user.portfolios?.length > 0 && (
            <select
              className="px-2 py-1 text-sm border border-gray-300 rounded bg-white hover:border-gray-400 transition"
              value={selectedPortfolio}
              onChange={(e) => onConnectProject(domain.domain, e.target.value)}
            >
              <option value="" disabled>
                Select portfolio
              </option>

              {user.portfolios.map(
                (portfolio) =>
                  portfolio.portfolioId && (
                    <option key={portfolio._id} value={portfolio.portfolioId}>
                      {portfolio.portfolioType}
                    </option>
                  ),
              )}
            </select>
          )}

          <div></div>

          <button
            onClick={() => onRemove(domain._id)}
            className="px-3 py-1 text-sm text-red-600 border border-red-300 rounded hover:bg-red-50 transition"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}
