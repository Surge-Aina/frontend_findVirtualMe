import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Eye, EyeOff } from "lucide-react";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_BACKEND_API;

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState({
    new: false,
    confirm: false,
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // password checks
  const passwordChecks = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[@$!%*?&]/.test(password),
  };

  const isValidPassword =
    passwordChecks.length &&
    passwordChecks.upper &&
    passwordChecks.lower &&
    passwordChecks.number &&
    passwordChecks.special;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      setMessage("All fields are required");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    if (!isValidPassword) {
      setMessage("Password does not meet requirements");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      await axios.post(`${apiUrl}/api/auth/reset-password/${token}`, { password });

      setMessage("Password reset successful! Redirecting...");

      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (err) {
      setMessage(err.response?.data?.message || "Invalid or expired reset link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md bg-white rounded-2xl shadow border border-gray-200 p-8">
        <h2 className="text-2xl font-semibold text-center mb-6">Reset Password</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* NEW PASSWORD */}
          <div className="relative">
            <input
              type={showPassword.new ? "text" : "password"}
              placeholder="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 pr-10"
            />

            <button
              type="button"
              onClick={() =>
                setShowPassword((prev) => ({
                  ...prev,
                  new: !prev.new,
                }))
              }
              className="absolute right-3 inset-y-0 flex items-center text-gray-500"
            >
              {showPassword.new ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* CONFIRM PASSWORD */}
          <div className="relative">
            <input
              type={showPassword.confirm ? "text" : "password"}
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 pr-10"
            />

            <button
              type="button"
              onClick={() =>
                setShowPassword((prev) => ({
                  ...prev,
                  confirm: !prev.confirm,
                }))
              }
              className="absolute right-3 inset-y-0 flex items-center text-gray-500"
            >
              {showPassword.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* PASSWORD RULES */}
          <div className="space-y-1 text-sm">
            <PasswordRule valid={passwordChecks.length} label="At least 8 characters" />
            <PasswordRule valid={passwordChecks.upper} label="One uppercase letter" />
            <PasswordRule valid={passwordChecks.lower} label="One lowercase letter" />
            <PasswordRule valid={passwordChecks.number} label="One number" />
            <PasswordRule valid={passwordChecks.special} label="One special character" />
          </div>

          <button type="submit" disabled={loading} className="w-full bg-green-500 text-white py-2 rounded-lg">
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        {message && (
          <p
            className={`mt-4 text-center text-sm ${
              message.toLowerCase().includes("successful") ? "text-green-600" : "text-red-500"
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

function PasswordRule({ valid, label }) {
  return (
    <div className={`flex items-center gap-2 ${valid ? "text-green-600" : "text-gray-500"}`}>
      <span>{valid ? "✔" : "•"}</span>
      <span>{label}</span>
    </div>
  );
}
