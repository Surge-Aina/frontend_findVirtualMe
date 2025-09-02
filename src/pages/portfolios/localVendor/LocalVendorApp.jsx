import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import TaggedImage from "./sections/TaggedImage";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./index.css";
import { VendorProvider } from "../../../context/VendorContext.jsx";

function LocalVendorApp() {
  return (
    <VendorProvider>
      <div className="localvendor">
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-grow">
            <ToastContainer />
            <Routes>
              <Route path="" element={<Home />} />
              <Route path="admin/tagged" element={<TaggedImage />} />
              <Route path="login" element={<Login />} />
            </Routes>
          </main>
        </div>
      </div>
    </VendorProvider>
  );
}

export default LocalVendorApp;
