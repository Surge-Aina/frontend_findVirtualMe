import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";

export default function GoogleLoginButton() {
  const handleSuccess = async (credentialResponse) => {
    try {
      console.log(credentialResponse);
      const res = await axios.post("http://localhost:5000/google-login/auth/google", {
        idToken: credentialResponse.credential,
      });

      localStorage.setItem("token", res.data.token);
      console.log("Logged in user:", res.data.user);
    } catch (err) {
      console.error("Backend auth failed", err);
    }
  };

  return <GoogleLogin onSuccess={handleSuccess} onError={() => console.error("Google login failed")} />;
}
