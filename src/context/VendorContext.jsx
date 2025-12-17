import { createContext, useContext, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { canEditPortfolio } from "../pages/portfolios/localVendor/services/auth";
import { AuthContext } from "./AuthContext";
const VendorContext = createContext();
export const useVendor = () => useContext(VendorContext);

export function VendorProvider({ children, forceDefault = false }) {
  const { user } = useContext(AuthContext);
  const { id } = useParams(); // get vendorId from route
  const [vendorId, setVendorId] = useState(() => {
    if (forceDefault) {
      // Always return demo vendor for Examples
      return "68af9176f5115d59643841d9";
    }
    // Try from URL first, then localStorage fallback
    return id || localStorage.getItem("vendorId") || null;
  });

  // Whenever URL changes, update vendorId
  useEffect(() => {
    if (id && id !== vendorId) {
      setVendorId(id);
    }
  }, [id]);

  // Persist to localStorage whenever vendorId changes
  useEffect(() => {
    if (vendorId) {
      localStorage.setItem("vendorId", vendorId);
    }
  }, [vendorId]);

  // Default to demo vendor if not logged in
  // useEffect(() => {
  //   const safeCanEditPortfolio = (vendorId) => canEditPortfolio(user, vendorId);
  //   if (!vendorId && !safeCanEditPortfolio(vendorId)) {
  //     setVendorId("68af9176f5115d59643841d9");
  //   }
  // }, [vendorId]);

  useEffect(() => {
    if (!vendorId) {
      setVendorId("68af9176f5115d59643841d9");
    }
  }, [vendorId]);

  return <VendorContext.Provider value={{ vendorId, setVendorId }}>{children}</VendorContext.Provider>;
}
