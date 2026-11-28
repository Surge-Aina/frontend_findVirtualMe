import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import PhoneInput from "react-phone-number-input";
import en from "react-phone-number-input/locale/en";
import "react-phone-number-input/style.css";
import { toast } from "react-toastify";
import { AuthContext } from "@/shared/context/AuthContext";
import { logApiError } from "@/shared/api/safeLog";
import { useMaintenance } from "@/shared/maintenance/MaintenanceProvider";
import { isPhoneLoginEnabled } from "./phoneLoginFlag";
import {
  fetchPhoneLoginCountries,
  phoneLoginStart,
  phoneLoginVerify,
} from "./phoneLoginApi";
import { friendlyPhoneLoginError } from "./phoneLoginErrors";

const inputRing =
  "w-full px-4 py-2 border border-slate-200 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder:text-neutral-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400";

function pickDefaultCountry(countries) {
  if (countries.includes("GB")) return "GB";
  return countries[0];
}

export default function PhoneLoginSection({ onSuccessNavigate = "/dashboard" }) {
  const navigate = useNavigate();
  const { setUserAfterLogin } = useContext(AuthContext);
  const { active: maintenanceActive } = useMaintenance();

  const [allowedCountries, setAllowedCountries] = useState(null);
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState(undefined);
  const [code, setCode] = useState("");
  const [step, setStep] = useState("phone");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const flagOn = isPhoneLoginEnabled();

  const loadCountries = useCallback(async () => {
    if (!flagOn) {
      setAllowedCountries([]);
      return;
    }
    try {
      const list = await fetchPhoneLoginCountries();
      setAllowedCountries(list);
      if (list.length > 0) {
        setCountry((prev) => prev || pickDefaultCountry(list));
      }
    } catch (err) {
      logApiError(err, "Load phone login countries failed");
      setAllowedCountries([]);
    }
  }, [flagOn]);

  useEffect(() => {
    loadCountries();
  }, [loadCountries]);

  const visible = flagOn && Array.isArray(allowedCountries) && allowedCountries.length > 0;

  const countriesProp = useMemo(() => allowedCountries || [], [allowedCountries]);

  if (!visible) {
    return null;
  }

  const handleSendCode = async (e) => {
    e.preventDefault();
    setError("");
    if (maintenanceActive) return;
    if (!phone) {
      setError("Enter your mobile number.");
      return;
    }
    setLoading(true);
    try {
      await phoneLoginStart(phone, country);
      setStep("code");
      toast.success("If this number is eligible, a verification code was sent.");
    } catch (err) {
      logApiError(err, "Phone login start failed");
      setError(friendlyPhoneLoginError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    if (maintenanceActive) return;
    if (!code.trim()) {
      setError("Enter the verification code from your SMS.");
      return;
    }
    setLoading(true);
    try {
      const data = await phoneLoginVerify(phone, code.trim(), country);
      setUserAfterLogin(data);
      toast.success("Logged in with your phone!");
      navigate(onSuccessNavigate);
    } catch (err) {
      logApiError(err, "Phone login verify failed");
      setError(friendlyPhoneLoginError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    if (maintenanceActive || loading) return;
    setLoading(true);
    try {
      await phoneLoginStart(phone, country);
      toast.info("If this number is eligible, a new code was sent.");
    } catch (err) {
      logApiError(err, "Phone login resend failed");
      setError(friendlyPhoneLoginError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8 pt-6 border-t border-slate-200 dark:border-neutral-700">
      <h3 className="text-sm font-medium text-slate-700 dark:text-neutral-300 mb-3 text-center">
        Or sign in with your phone
      </h3>
      {step === "phone" ? (
        <form className="space-y-4" onSubmit={handleSendCode}>
          <div>
            <label
              htmlFor="phone-login-number"
              className="block text-sm font-medium text-slate-700 dark:text-neutral-300 mb-1"
            >
              Mobile number
            </label>
            <PhoneInput
              id="phone-login-number"
              international
              labels={en}
              country={country}
              countries={countriesProp}
              defaultCountry={pickDefaultCountry(countriesProp)}
              value={phone}
              onChange={setPhone}
              onCountryChange={setCountry}
              countryCallingCodeEditable={false}
              disabled={loading || maintenanceActive}
              className="phone-login-field flex gap-2 items-center [&_.PhoneInputInput]:flex-1 [&_.PhoneInputInput]:min-w-0 [&_.PhoneInputCountry]:mr-1"
              numberInputProps={{
                className: inputRing,
                "aria-label": "Mobile number",
              }}
            />
          </div>
          {error && (
            <p role="alert" className="text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading || maintenanceActive}
            className="w-full bg-slate-800 dark:bg-slate-700 text-white px-4 py-2 rounded-lg hover:bg-slate-700 dark:hover:bg-slate-600 transition-colors disabled:opacity-60"
          >
            {loading ? "Sending code..." : "Send verification code"}
          </button>
        </form>
      ) : (
        <form className="space-y-4" onSubmit={handleVerify}>
          <p className="text-sm text-slate-600 dark:text-neutral-400 text-center">
            Enter the code we sent to your phone.
          </p>
          <div>
            <label
              htmlFor="phone-login-code"
              className="block text-sm font-medium text-slate-700 dark:text-neutral-300 mb-1"
            >
              Verification code
            </label>
            <input
              id="phone-login-code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              name="otp"
              placeholder="6-digit code"
              value={code}
              onChange={(ev) => setCode(ev.target.value)}
              disabled={loading || maintenanceActive}
              className={inputRing}
            />
          </div>
          {error && (
            <p role="alert" className="text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading || maintenanceActive}
            className="w-full bg-slate-800 dark:bg-slate-700 text-white px-4 py-2 rounded-lg hover:bg-slate-700 dark:hover:bg-slate-600 transition-colors disabled:opacity-60"
          >
            {loading ? "Verifying..." : "Verify and sign in"}
          </button>
          <div className="flex flex-col gap-2 text-center text-sm">
            <button
              type="button"
              className="text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-60"
              disabled={loading || maintenanceActive}
              onClick={handleResend}
            >
              Resend code
            </button>
            <button
              type="button"
              className="text-slate-600 dark:text-neutral-400 hover:underline"
              onClick={() => {
                setStep("phone");
                setCode("");
                setError("");
              }}
            >
              Use a different number
            </button>
          </div>
        </form>
      )}
    </div>
  );
}