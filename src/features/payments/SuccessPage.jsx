import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { AuthContext } from "@/shared/context/AuthContext";

const backendUrl = import.meta.env.VITE_BACKEND_API;

function checkoutSessionView(data) {
  return {
    id: data?.id,
    payment_status: data?.payment_status,
    status: data?.status,
  };
}

function SuccessPage() {
  const { refreshUser, token } = useContext(AuthContext);
  const [sessionData, setSessionData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const sessionId = new URLSearchParams(window.location.search).get("session_id");

    if (sessionId) {
      const authToken = localStorage.getItem("token") || token;
      const headers = authToken ? { Authorization: `Bearer ${authToken}` } : {};
      axios
        .get(`${backendUrl}/api/payments/checkout/session/${sessionId}`, { headers })
        .then((res) => setSessionData(checkoutSessionView(res.data)))
        .catch((err) => {
          console.error(err);
          setError("Could not load payment details.");
        });
    }

    //refresh user information stored in auth context with updated user info in mongodb
    refreshUser();
  }, []);

  if (error) return <p>{error}</p>;
  if (!sessionData) return <p>Loading payment details...</p>;

  return (
    <div>
      <h1>Payment Successful!</h1>
      <p>Session ID: {sessionData.id}</p>
      <p>Status: {sessionData.payment_status}</p>
      <p>Checkout status: {sessionData.status}</p>
    </div>
  );
}

export default SuccessPage;
