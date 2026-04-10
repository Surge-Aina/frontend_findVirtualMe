import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { AuthContext } from "@/shared/context/AuthContext";

const backendUrl = import.meta.env.VITE_BACKEND_API;

function SuccessPage() {
  const { refreshUser } = useContext(AuthContext);
  const [sessionData, setSessionData] = useState(null);

  useEffect(() => {
    const sessionId = new URLSearchParams(window.location.search).get("session_id");

    if (sessionId) {
      axios
        .get(`${backendUrl}/api/payments/checkout/session/${sessionId}`)
        .then((res) => setSessionData(res.data))
        .catch((err) => console.error(err));
    }

    //refresh user information stored in auth context with updated user info in mongodb
    refreshUser();
  }, []);

  if (!sessionData) return <p>Loading payment details...</p>;

  return (
    <div>
      <h1>Payment Successful!</h1>
      <p>Session ID: {sessionData.id}</p>
      <p>Status: {sessionData.payment_status}</p>
    </div>
  );
}

export default SuccessPage;
