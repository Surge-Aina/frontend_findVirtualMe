import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const backendURL = import.meta.env.VITE_BACKEND_API;

export default function GoogleLoginButton({ onClose }) {
  const { setUserAfterLogin } = useContext(AuthContext);
  const navigate = useNavigate();
  const handleSuccess = async (credentialResponse) => {
    try {
      const res = await axios.post(`${backendURL}/google-login/auth/google`, {
        idToken: credentialResponse.credential,
      });
      if (onClose) onClose();
      setUserAfterLogin(res.data);
      if(res.data.isNewUser) {
        toast.success("Created profile with Google!");
      }else{
        toast.success("Logged In with Google!");
      }
      navigate("/profile");
      console.log("Logged in user with Google:", res.data.user);
    } catch (err) {
      console.error("Backend auth failed", err);
      toast.error(err.response?.data?.message || "Login failed");
    }
  };

  return <GoogleLogin onSuccess={handleSuccess} onError={() => console.error("Google login failed")} />;
}
