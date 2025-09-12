import { useEffect, useState } from "react";

// === Utility functions: read / write / clear a 15-day consent cookie ===
const FIFTEEN_DAYS = 60 * 60 * 24 * 15;

function setConsentCookie(value) {
  document.cookie = `cookie_consent=${value}; max-age=${FIFTEEN_DAYS}; path=/; SameSite=Lax`;
}
function getConsentFromCookie() {
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith("cookie_consent="))
    ?.split("=")[1];
}
function saveConsent(value) {
  
  setConsentCookie(value);
  localStorage.setItem("cookieConsent", value);
  
  window.dispatchEvent(new Event("consent-changed"));
}

export default function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    
    const local = localStorage.getItem("cookieConsent");
    const cookie = getConsentFromCookie();
    if (!local && !cookie) setShow(true);
  }, []);

  const accept = () => {
    saveConsent("accepted");
    setShow(false);
  };

  const reject = () => {
    saveConsent("rejected");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-gray-900 text-white">
      <div className="mx-auto max-w-5xl px-4 py-3 flex flex-col sm:flex-row items-center gap-3">
        <p className="text-sm text-center sm:text-left">
          We use cookies to improve your experience. Your choice will be stored for 15 days.
        </p>
        <div className="flex gap-2 sm:ml-auto">
          <button
            onClick={accept}
            className="px-4 py-2 rounded bg-green-600 hover:bg-green-700 text-white text-sm"
          >
            Accept
          </button>
          <button
            onClick={reject}
            className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white text-sm"
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );
}
