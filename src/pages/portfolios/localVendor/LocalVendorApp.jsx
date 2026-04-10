import { Routes, Route, useParams } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import Home from "./pages/Home";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import TaggedImage from "./sections/TaggedImage";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./index.css";
import { VendorProvider, useVendor } from "../../../context/VendorContext.jsx";
import API from "./services/api";
import { AuthContext } from "@/shared/context/AuthContext.jsx";

function LocalVendorApp() {
  const { id: paramId } = useParams();
  const { vendorId } = useVendor();
  const [portfolio, setPortfolio] = useState(null);
  const { user } = useContext(AuthContext);

  // Use either the param id, or fallback to vendorId from context
  const id = paramId || vendorId;

  useEffect(() => {
    if (!id) return; // still no vendorId
    API.get(`/vendor/${id}/full`)
      .then((res) => setPortfolio(res.data))
      .catch((err) => console.error("Failed to fetch vendor portfolio", err));
  }, [id]);

  if (!portfolio) return <p>Loading portfolio...</p>;

  return (
    <div className="localvendor">
      <div className="min-h-screen flex flex-col">
        <Navbar user={user} />
        <main className="flex-grow">
          {/* <ToastContainer /> */}
          <Routes>
            <Route path="" element={<Home />} />
            <Route path="admin/tagged" element={<TaggedImage />} />
            <Route path="login" element={<Login />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default LocalVendorApp;
