import axios from "axios";
import { AlertCircle, ArrowRight, CheckCircle, Copy, ExternalLink, Globe, Search } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DomainVerifyPopup from "../DomainVerifyPopup.jsx";

export default function Domains({ getAuthHeaders }) {
  const [searchDomain, setSearchDomain] = useState("");
  const [customDomain, setCustomDomain] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState(null);
  const [userDomains, setUserDomains] = useState([]);
  const [isLoadingDomains, setIsLoadingDomains] = useState(true);
  const [userData, setUserData] = useState(null);
  const [selectedPortfolioId, setSelectedPortfolioId] = useState("");
  const [verificationRecords, setVerificationRecords] = useState(null);
  const [isVerifyPopupOpen, setIsVerifyPopupOpen] = useState(false);
  const [pendingDomain, setPendingDomain] = useState("");
  const [pendingPortfolioId, setPendingPortfolioId] = useState("");
  const [isVerifyingDomain, setIsVerifyingDomain] = useState(false);
  const [isConnectingDomain, setIsConnectingDomain] = useState(false);
  const [isPurchasingDomain, setIsPurchasingDomain] = useState(false);
  const backendUrl = import.meta.env.VITE_BACKEND_API;

  const portfolioOptions = useMemo(() => {
    const seen = new Set();
    const options = [];

    // Builds a deduplicated array of portfolio options for a select.
    // Accepts portfolios either as IDs or objects.

    if (Array.isArray(userData?.portfolios)) {
      userData.portfolios.forEach((portfolio, index) => {
        if (typeof portfolio === "string") {
          if (!seen.has(portfolio)) {
            seen.add(portfolio);
            options.push({
              id: portfolio,
              title: `Portfolio ${index + 1}`,
            });
          }
          return;
        }

        if (portfolio && typeof portfolio === "object") {
          const id = portfolio._id || portfolio.id;
          if (id && !seen.has(id)) {
            seen.add(id);
            options.push({
              ...portfolio,
              id,
            });
          }
        }
      });
    }

    userDomains.forEach((domain, index) => {
      const domainPortfolioId = domain?.portfolioId;
      if (domainPortfolioId && !seen.has(domainPortfolioId)) {
        seen.add(domainPortfolioId);
        options.push({
          id: domainPortfolioId,
          title: `Portfolio ${options.length + 1}`,
        });
      }
    });

    return options.map((option, index) => {
      const id = option._id || option.id;
      const label =
        option.title ||
        option.name ||
        option.portfolioTitle ||
        option.type ||
        (typeof id === "string" ? `Portfolio ${index + 1}` : `Portfolio ${index + 1}`);

      return {
        ...option,
        id: id || `portfolio-${index}`,
        title: label,
      };
    });
  }, [userData?.portfolios, userDomains]);

  const hasPortfolios = portfolioOptions.length > 0;

  useEffect(() => {
    if (!hasPortfolios) {
      setSelectedPortfolioId("");
      return;
    }

    const match = portfolioOptions.find(
      (option) => (option._id || option.id) === selectedPortfolioId
    );

    if (!match) {
      const firstOption = portfolioOptions[0];
      const nextId = firstOption._id || firstOption.id;
      setSelectedPortfolioId(nextId);
    }
  }, [hasPortfolios, portfolioOptions, selectedPortfolioId]);

  const writeToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard");
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
      toast.error("Failed to copy to clipboard");
    }
  };

  const fetchUserData = async () => {
      try {
        const response = await axios.get(`${backendUrl}/user/me`, {
          headers: getAuthHeaders(),
        });
        console.log("User data response:", response.data);
        setUserData(response.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast.error("Failed to load user data");
      }

  };

  const fetchUserDomains = async () => {
    try {
      setIsLoadingDomains(true);
      const response = await axios.get(`${backendUrl}/api/domains/myDomains`, {
        headers: getAuthHeaders(),
      });
      // Backend returns { domains: [], user: {}, portfolios: [] }
      setUserDomains(response.data.domains || []);
      if (Array.isArray(response.data.portfolios)) {
        setUserData((prev) =>
          prev
            ? { ...prev, portfolios: response.data.portfolios }
            : { portfolios: response.data.portfolios }
        );
      }
    } catch (error) {
      console.error("Error fetching domains:", error);
      setUserDomains([]);
    } finally {
      setIsLoadingDomains(false);
    }
  };

  useEffect(() => {
    fetchUserData();
    fetchUserDomains();
  }, []);

  const handleDomainSearch = async (e) => {
    e.preventDefault();
    if (!searchDomain.trim()) return;

    setIsSearching(true);
    try {
      const response = await axios.get(
        `${backendUrl}/api/domains/check/${searchDomain}`,
        {
          headers: getAuthHeaders(),
        }
      );
      setSearchResults(response.data);
    } catch (error) {
      console.error("Domain search error:", error);
      toast.error("Failed to search domain availability");
    } finally {
      setIsSearching(false);
    }
  };

  const handlePurchaseDomain = async () => {
    if (!searchResults) return;

    if (!selectedPortfolioId) {
      toast.error("Select a portfolio before purchasing a domain.");
      return;
    }

    try {
      setIsPurchasingDomain(true);
      const response = await axios.post(
        `${backendUrl}/api/domains/register`,
        {
          domain: searchResults.domain,
          portfolioId: selectedPortfolioId,
          plan: "basic", // Default plan
        },
        {
          headers: getAuthHeaders(),
        }
      );

      console.log("Domain purchase initiated:", response.data);
      toast.success(`Domain purchase initiated for ${searchResults.domain}`);
      // Refresh domain list
      fetchUserDomains();
    } catch (error) {
      console.error("Domain purchase error:", error);
      const message =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Failed to initiate domain purchase";
      toast.error(message);
    } finally {
      setIsPurchasingDomain(false);
    }
  };

  const openVerifyPopup = (domainValue, portfolioValue) => {
    const safeDomain = (domainValue || "").trim().toLowerCase();
    if (!safeDomain) {
      toast.error("Domain is required for verification.");
      return;
    }

    setPendingDomain(safeDomain);
    const normalizedPortfolio =
      typeof portfolioValue === "string"
        ? portfolioValue
        : portfolioValue?._id || portfolioValue?.id;

    if (normalizedPortfolio) {
      setPendingPortfolioId(normalizedPortfolio);
    } else if (selectedPortfolioId) {
      setPendingPortfolioId(selectedPortfolioId);
    } else {
      setPendingPortfolioId("");
    }
    setIsVerifyPopupOpen(true);
  };

  const handleCloseVerifyPopup = () => {
    setIsVerifyPopupOpen(false);
    setIsVerifyingDomain(false);
    setPendingDomain("");
    setPendingPortfolioId("");
  };

  const handleDomainVerification = async (domainName) => {
    const trimmedDomain = domainName?.trim().toLowerCase();

    if (!trimmedDomain) {
      toast.error("Please enter a domain to verify.");
      return;
    }

    setIsVerifyingDomain(true);
    try {
      const response = await axios.post(
        `${backendUrl}/api/domains/verify/${encodeURIComponent(trimmedDomain)}`,
        {},
        {
          headers: getAuthHeaders(),
        }
      );

      toast.success(
        response.data?.message ||
          `Verification initiated for ${trimmedDomain}`
      );
      setVerificationRecords(null);
      fetchUserDomains();
      handleCloseVerifyPopup();
    } catch (error) {
      console.error("Domain verification error:", error);
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "DNS verification failed";
      toast.error(message);
      const verificationDetail =
        error.response?.data?.verification ||
        error.response?.data?.details?.verification;
      if (verificationDetail) {
        setVerificationRecords(verificationDetail);
      }
    } finally {
      setIsVerifyingDomain(false);
    }
  };

  const normalizedVerificationRecords = useMemo(() => {
    if (!verificationRecords) return [];

    const records = Array.isArray(verificationRecords)
      ? verificationRecords
      : [verificationRecords];

    return records
      .filter(Boolean)
      .map((record, index) => {
        if (typeof record === "string") {
          return {
            key: `verification-${index}`,
            type: "",
            domain: "",
            value: record,
          };
        }

        if (record && typeof record === "object") {
          const value = Array.isArray(record.value)
            ? record.value.join(", ")
            : record.value || record.content || "";

          return {
            key:
              record.id ||
              `${record.type || record.recordType || "record"}-${index}`,
            type: record.type || record.recordType || "",
            domain: record.domain || record.name || record.host || "",
            value,
          };
        }

        return null;
      })
      .filter(Boolean);
  }, [verificationRecords]);

  const verificationModalDomain = (
    pendingDomain ||
    customDomain ||
    ""
  )
    .trim()
    .toLowerCase();

  const renderPortfolioSelect = ({ disabled = false, label = "Select Portfolio" } = {}) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <select
        value={selectedPortfolioId}
        onChange={(e) => setSelectedPortfolioId(e.target.value)}
        disabled={!hasPortfolios || disabled}
        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <option value="">
          {hasPortfolios ? "Choose a portfolio" : "No portfolios available"}
        </option>
        {portfolioOptions.map((portfolio) => {
          const id = portfolio._id || portfolio.id;
          const labelOption =
            portfolio.title ||
            portfolio.name ||
            portfolio.portfolioTitle ||
            `Portfolio ${id}`;

          return (
            <option key={id} value={id}>
              {labelOption}
            </option>
          );
        })}
      </select>
      {!hasPortfolios && (
        <p className="mt-2 text-sm text-red-600">
          Add a portfolio before proceeding with domain setup.
        </p>
      )}
    </div>
  );

  const handleConnectCustomDomain = async () => {
    const trimmedDomain = customDomain.trim().toLowerCase();
    if (!trimmedDomain) return;

    if (!selectedPortfolioId) {
      toast.error("Select a portfolio before connecting a custom domain.");
      return;
    }

    setIsConnectingDomain(true);
    try {
      const response = await axios.post(
        `${backendUrl}/api/domains/custom`,
        {
          domain: trimmedDomain,
          portfolioId: selectedPortfolioId,
        },
        {
          headers: getAuthHeaders(),
        }
      );  

      console.log("Custom domain connected:", response.data);
      toast.success(`Custom domain ${trimmedDomain} connection initiated`);
      setVerificationRecords(response.data.verification || null);
      setPendingDomain(trimmedDomain);
      setPendingPortfolioId(selectedPortfolioId);
      setCustomDomain("");
      // Refresh domain list
      fetchUserDomains();
    } catch (error) {
      console.error("Custom domain connection error:", error);
      const status = error.response?.status;
      const errorData = error.response?.data;
      const message =
        errorData?.error ||
        errorData?.message ||
        "Failed to connect custom domain";
      toast.error(message);
      if (status === 409) {
        if (errorData?.verification) {
          setVerificationRecords(errorData.verification);
        }
        openVerifyPopup(trimmedDomain, selectedPortfolioId);
      }
    } finally {
      setIsConnectingDomain(false);
    }
  };

  return (
    <main className="flex-1 flex justify-center items-start py-12 px-4 md:px-12 bg-gray-50">
      <section className="w-full max-w-4xl space-y-8">
        <div className="bg-white rounded-2xl shadow border border-gray-200 p-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Globe className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-semibold text-gray-900">
              Domain Management
            </h2>
          </div>

          <p className="text-gray-600">
            Get a professional domain for your portfolio or connect your
            existing domain to showcase your work.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow border border-gray-200 p-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <h3 className="text-xl font-semibold text-gray-900">
              Buy a New Domain
            </h3>
          </div>

          <p className="text-gray-600">
            Search for available domains and purchase one directly through our
            platform.
          </p>

          <div className="mt-4 mb-6">
            {renderPortfolioSelect({
              disabled: isPurchasingDomain,
              label: "Link Domain to Portfolio",
            })}
          </div>

          <form onSubmit={handleDomainSearch} className="space-y-4">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Enter domain name (e.g., yourname.com)"
                  value={searchDomain}
                  onChange={(e) => setSearchDomain(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                type="submit"
                disabled={isSearching || !searchDomain.trim()}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
              >
                {isSearching ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    Search
                  </>
                )}
              </button>
            </div>
          </form>

          {searchResults && (
            <div className="mt-6 p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {searchResults.available ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  )}
                  <div>
                    <p className="font-medium text-gray-900">
                      {searchResults.domain}
                    </p>
                    <p className="text-sm text-gray-600">
                      {searchResults.available
                        ? `Available Price:  $${
                            searchResults.premiumPrice + 15 || 15
                          }`
                        : "Not available"}
                    </p>
                  </div>
                </div>
                {searchResults.available && (
                  <button
                    onClick={handlePurchaseDomain}
                    disabled={isPurchasingDomain || !hasPortfolios}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
                  >
                    {isPurchasingDomain ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Purchasing...
                      </>
                    ) : (
                      <>
                        Purchase
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow border border-gray-200 p-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Connect Your Own Domain
          </h3>
          <p className="text-gray-600 mb-6">
            Already have a domain? Connect it to your findVirtualMe portfolio.
          </p>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Domain
              </label>
              <input
                type="text"
                placeholder="yourdomain.com"
                value={customDomain}
                onChange={(e) => setCustomDomain(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {renderPortfolioSelect({
              disabled: isConnectingDomain,
              label: "Link Domain to Portfolio",
            })}

            <button
              onClick={handleConnectCustomDomain}
              disabled={
                !customDomain.trim() ||
                !selectedPortfolioId ||
                isConnectingDomain
              }
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
            >
              {isConnectingDomain ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Connecting...
                </>
              ) : (
                <>
                  Connect Domain
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-3">
              Setup Instructions
            </h4>
            <p className="text-blue-800 text-sm mb-4">
              To connect your custom domain, you'll need to update your DNS
              settings:
            </p>

            <div className="space-y-3">
              <div className="bg-white p-4 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    A Record
                  </span>
                  <button
                    onClick={() => writeToClipboard("216.150.1.1")}
                    className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    Copy
                  </button>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-gray-600 grid grid-cols-3 gap-2 font-semibold">
                    <span>Type</span>
                    <span>Name</span>
                    <span>Value</span>
                  </div>
                  <div className="font-mono text-sm text-gray-900 bg-gray-50 p-2 rounded grid grid-cols-3 gap-2">
                    <span>A</span>
                    <span>@</span>
                    <span>216.150.1.1</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border border-blue-200">
                <div className="mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Update your domain's nameservers to enable Vercel DNS
                  </span>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-600">Nameservers</p>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <span className="font-mono text-sm text-gray-900">ns1.vercel-dns.com</span>
                      <button
                        onClick={() => writeToClipboard("ns1.vercel-dns.com")}
                        className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
                      >
                        <Copy className="w-3 h-3" />
                        Copy
                      </button>
                    </div>
                    <div className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <span className="font-mono text-sm text-gray-900">ns2.vercel-dns.com</span>
                      <button
                        onClick={() => writeToClipboard("ns2.vercel-dns.com")}
                        className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
                      >
                        <Copy className="w-3 h-3" />
                        Copy
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-amber-800 text-sm">
                <strong>Note:</strong> Remove other account's currently using your domain's DNS records. DNS changes can take up to 24-48 hours to
                propagate globally.
              </p>
            </div>
          </div>

          {normalizedVerificationRecords.length > 0 && (
            <div className="mt-6 p-4 bg-white border border-blue-200 rounded-lg space-y-3">
              <h4 className="font-semibold text-blue-900">
                Verification Records from Vercel
              </h4>
              <p className="text-sm text-blue-800">
                Add these records with your DNS provider, then verify the domain
                once propagation completes.
              </p>
              <div className="space-y-3">
                {normalizedVerificationRecords.map((record) => (
                  <div
                    key={record.key}
                    className="rounded-lg border border-blue-100 bg-blue-50 p-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-blue-900">
                          {record.type || "Record"}
                        </p>
                        {record.domain && (
                          <p className="text-xs text-blue-700">
                            Host:{" "}
                            <span className="font-mono">{record.domain}</span>
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => writeToClipboard(record.value)}
                        className="flex items-center gap-1 rounded border border-blue-300 px-3 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100 transition"
                        type="button"
                      >
                        <Copy className="h-3 w-3" />
                        Copy value
                      </button>
                    </div>
                    <p className="mt-2 overflow-x-auto rounded bg-white px-3 py-2 font-mono text-xs text-blue-900">
                      {record.value}
                    </p>
                  </div>
                ))}
              </div>
              <button
                onClick={() =>
                  openVerifyPopup(
                    verificationModalDomain,
                    pendingPortfolioId || selectedPortfolioId
                  )
                }
                disabled={!verificationModalDomain}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                type="button"
              >
                Open Verification Modal
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow border border-gray-200 p-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Your Domains
          </h3>
          <p className="text-gray-600 mb-6">
            Manage your connected domains and their status.
          </p>

          {isLoadingDomains ? (
            <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-500">Loading your domains...</p>
            </div>
          ) : userDomains.length > 0 ? (
            <div className="space-y-3">
              {userDomains.map((domain, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                >
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-900">
                        {domain.domain}
                      </p>
                      <p className="text-sm text-gray-500 capitalize">
                        {domain.type} •{" "} {domain.portfolioId}  •{" "}
                        {domain.dnsConfigured ? "DNS Configured" : "DNS Pending"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-2 w-2 rounded-full ${
                          domain.status === "active"
                            ? "bg-green-500"
                            : domain.status === "pending"
                            ? "bg-yellow-500"
                            : domain.status === "expired"
                            ? "bg-red-500"
                            : "bg-gray-500"
                        }`}
                      ></span>
                      <span
                        className={`text-sm capitalize ${
                          domain.status === "active"
                            ? "text-green-600"
                            : domain.status === "pending"
                            ? "text-yellow-600"
                            : domain.status === "expired"
                            ? "text-red-600"
                            : "text-gray-600"
                        }`}
                      >
                        {domain.status}
                      </span>
                    </div>
                    {!domain.dnsConfigured && (
                      <button
                        onClick={() => openVerifyPopup(domain.domain, domain.portfolioId)}
                        className="rounded-lg border border-blue-200 px-3 py-1.5 text-sm font-medium text-blue-600 transition hover:bg-blue-50"
                        type="button"
                      >
                        Verify DNS
                      </button>
                    )}
                    <a
                      href={`http://${domain.domain}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
              <Globe className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">No domains connected yet</p>
              <p className="text-sm text-gray-400">
                Search for a new domain or connect your existing one to get
                started.
              </p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow border border-gray-200 p-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Need Help?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition cursor-pointer">
              <h4 className="font-medium text-gray-900 mb-2">
                Domain Setup Guide
              </h4>
              <p className="text-sm text-gray-600">
                Learn how to properly configure your domain settings.
              </p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition cursor-pointer">
              <h4 className="font-medium text-gray-900 mb-2">
                DNS Configuration
              </h4>
              <p className="text-sm text-gray-600">
                Detailed instructions for DNS record setup.
              </p>
            </div>
          </div>
        </div>
      </section>
      <DomainVerifyPopup
        isOpen={isVerifyPopupOpen}
        onClose={handleCloseVerifyPopup}
        onVerify={handleDomainVerification}
        portfolios={portfolioOptions}
        isSubmitting={isVerifyingDomain}
        initialDomain={pendingDomain}
        initialPortfolio={pendingPortfolioId || selectedPortfolioId}
        helperText="Add the required DNS records, then click Verify DNS to confirm the domain."
      />
    </main>
  );
}
