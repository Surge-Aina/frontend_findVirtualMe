import React, { useState, useEffect } from "react";
import { Navigate, useParams } from "react-router-dom";
import axios from "axios";

/**
 * Wraps healthcare portfolio routes. practiceId in the URL is the MongoDB _id.
 */
export default function ProtectedHealthcareRoute({ children }) {
  const { practiceId } = useParams();
  const [isPublic, setIsPublic] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");
  const backendUrl = import.meta.env.VITE_BACKEND_API;

  useEffect(() => {
    const checkPublicStatus = async () => {
      if (!practiceId) {
        setIsPublic(false);
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${backendUrl}/healthcare/practice/${practiceId}`);
        setIsPublic(response.data.isPublic);
      } catch (error) {
        setIsPublic(false);
      } finally {
        setLoading(false);
      }
    };

    checkPublicStatus();
  }, [practiceId, backendUrl]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isPublic) return children;

  if (token) return children;

  return <Navigate to="/signup" replace />;
}
