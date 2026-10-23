import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { useContext } from "react";
import { AuthContext } from "@/shared/context/AuthContext";
import { toast } from "react-toastify";
import { logApiError } from "@/shared/api/safeLog";
import { useNavigate } from "react-router-dom";
import { consumePostLoginPath } from "@/shared/utils/safeReturnPath";

const backendURL = import.meta.env.VITE_BACKEND_API;

export default function GoogleLoginButton({ onClose }) {
  const { setUserAfterLogin } = useContext(AuthContext);
  const navigate = useNavigate();
  const handleSuccess = async (credentialResponse) => {
    try {
      const res = await axios.post(`${backendURL}/api/auth/google`, {
        idToken: credentialResponse.credential,
      });
      if (onClose) onClose();
      setUserAfterLogin(res.data);
      if(res.data.isNewUser) {
        toast.success("Created profile with Google!");
      }else{
        toast.success("Logged In with Google!");
      }
      navigate(consumePostLoginPath());
    } catch (err) {
      logApiError(err, "Google login failed");
      toast.error(err.response?.data?.message || "Login failed");
    }
  };

  return <GoogleLogin onSuccess={handleSuccess} onError={() => {}} />;
}
