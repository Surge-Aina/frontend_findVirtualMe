import { useContext, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { AuthContext } from "@/shared/context/AuthContext";
import { safeReturnPath } from "@/shared/utils/safeReturnPath";
import { logApiError } from "@/shared/api/safeLog";

const backendURL = import.meta.env.VITE_BACKEND_API;
const DEFAULT_AFTER_LOGIN = "/dashboard";

function readHandoffFromHash() {
  const raw = window.location.hash;
  if (!raw || raw === "#") {
    return { token: null, next: null };
  }
  const withoutHash = raw.startsWith("#") ? raw.slice(1) : raw;
  const params = new URLSearchParams(withoutHash);
  return {
    token: params.get("t"),
    next: params.get("next"),
  };
}

function clearUrlHash() {
  const { pathname, search } = window.location;
  window.history.replaceState(null, "", `${pathname}${search}`);
}

export default function BagglemeAuthHandoff() {
  const { setUserAfterLogin } = useContext(AuthContext);
  const navigate = useNavigate();
  const handoffStarted = useRef(false);

  useEffect(() => {
    if (handoffStarted.current) return;
    handoffStarted.current = true;

    const { token, next } = readHandoffFromHash();
    clearUrlHash();

    const redirectToLogin = () => {
      toast.info("Please sign in");
      navigate("/login", { replace: true });
    };

    if (!token) {
      redirectToLogin();
      return;
    }

    const destination = safeReturnPath(next) || DEFAULT_AFTER_LOGIN;

    axios
      .post(`${backendURL}/api/auth/baggleme`, { token })
      .then((res) => {
        setUserAfterLogin(res.data);
        navigate(destination, { replace: true });
      })
      .catch((err) => {
        logApiError(err, "Baggleme handoff failed");
        redirectToLogin();
      });
  }, [navigate, setUserAfterLogin]);

  return (
    <div
      className="max-w-md mx-auto mt-20 p-6 text-center text-slate-600 dark:text-neutral-400"
      aria-live="polite"
    >
      Signing you in…
    </div>
  );
}