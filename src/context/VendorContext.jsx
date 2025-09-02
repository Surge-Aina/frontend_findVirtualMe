import { createContext, useContext, useState, useEffect } from "react";
import { isAdminLoggedIn } from "../pages/portfolios/localVendor/services/auth";

const VendorContext = createContext();
export const useVendor = () => useContext(VendorContext);

export function VendorProvider({ children }) {
  const [vendorId, setVendorId] = useState(null);

  useEffect(() => {
    // If no vendor selected and not logged in → default to demo vendor
    if (!vendorId && !isAdminLoggedIn()) {
      setVendorId("68af9176f5115d59643841d9"); // 👈 fixed demo vendor ID
    }
  }, [vendorId]);

  return (
    <VendorContext.Provider value={{ vendorId, setVendorId }}>
      {children}
    </VendorContext.Provider>
  );
}
