import { useState, useEffect } from "react";

//Valid for 15 days (in seconds)
const FIFTEEN_DAYS = 60 * 60 * 24 * 15;

// write cookie（ https means Secure）
function setConsentCookie(value) {
  const secure = location.protocol === "https:" ? " Secure;" : "";
  document.cookie = `cookie_consent=${value}; max-age=${FIFTEEN_DAYS}; path=/; SameSite=Lax;${secure}`;
}

// read cookie
function getConsentFromCookie() {
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith("cookie_consent="))
    ?.split("=")[1];
}

// access consent（first localStorage，then cookie）
function getConsent() {
  return localStorage.getItem("cookieConsent") || getConsentFromCookie() || "";
}

// save consent
function saveConsent(value) {
  localStorage.setItem("cookieConsent", value);
  setConsentCookie(value);
  window.dispatchEvent(new Event("consent-changed")); // notify AnalyticsLoader(it is now deleted)
}

// remove consent
function clearConsent() {
  localStorage.removeItem("cookieConsent");
  document.cookie = "cookie_consent=; max-age=0; path=/; SameSite=Lax";
  window.dispatchEvent(new Event("consent-changed"));
}

export default function CookieSettings() {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState("");

  useEffect(() => {
    setCurrent(getConsent());
  }, [open]);

  const accept = () => {
    saveConsent("accepted");
    setCurrent("accepted");
    setOpen(false);
  };

  const reject = () => {
    saveConsent("rejected");
    setCurrent("rejected");
    setOpen(false);
  };

  const clear = () => {
    clearConsent();
    setCurrent("");
    setOpen(false);
  };

  return (
    <>
      {/* bottom-right button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-50 rounded-full px-4 py-2 bg-gray-800 text-white text-sm shadow hover:bg-gray-700"
        aria-label="Cookie Settings"
      >
        Cookie Settings
      </button>

      {/* popup */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setOpen(false)}
          />
          <div className="relative z-10 w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
            <h2 className="text-lg font-semibold mb-2">Cookie Settings</h2>
            <p className="text-sm text-gray-600 mb-4">
              Current choice:{" "}
              <span className="font-medium">
                {current || "No choice saved"}
              </span>
            </p>
            <div className="flex gap-2">
              <button
                onClick={accept}
                className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
              >
                Accept
              </button>
              <button
                onClick={reject}
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
              >
                Reject
              </button>
              <button
                onClick={clear}
                className="ml-auto px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Clear choice
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              We only use cookies to detect your general location — just down to the city, nothing more.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
