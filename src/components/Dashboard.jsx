import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import { useState, useEffect, useContext } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { AuthContext } from "../context/AuthContext.jsx";

export default function Dashboard() {
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_API;
  const { contextLoggedIn, user } = useContext(AuthContext);

  const [myPortfolios, setMyPortfolios] = useState([]);
  const [otherPortfolios, setOtherPortfolios] = useState([]);

  // robust identity getters
  const loggedInEmail =
    (user?.email ||
      localStorage.getItem("email") ||
      "").trim().toLowerCase();

  const loggedInId = String(
    user?._id ||
      user?.id ||
      localStorage.getItem("userId") ||
      localStorage.getItem("id") ||
      ""
  );

  // re-run when login state OR user object changes
  useEffect(() => {
    fetchPortfolios();
  }, [contextLoggedIn, loggedInEmail, loggedInId]);

  // read owner email from common places; if handyman lacks email but userId==me → it's mine
  const ownerEmail = (obj, type) => {
    const e =
      obj?.email ||
      obj?.userEmail ||
      obj?.ownerEmail ||
      obj?.user?.email ||
      obj?.owner?.email ||
      "";
    if (e) return String(e).trim().toLowerCase();

    if (type === "handyman") {
      const uid = String(obj?.userId || "");
      if (uid && loggedInId && uid === loggedInId) return loggedInEmail;
    }
    return "";
  };

  // uniform card
  const toCard = (obj, type = "general") => {
    const email = ownerEmail(obj, type);
    const title =
      obj?.title || obj?.portfolioTitle || obj?.role || "Untitled Portfolio";
    const name =
      obj?.name ||
      [obj?.firstName, obj?.lastName].filter(Boolean).join(" ") ||
      (email ? email.split("@")[0] : "") ||
      (type === "handyman" ? "Handyman" : "User");
    return { _id: obj?._id, title, name, email, type };
  };

  const fetchPortfolios = async () => {
    try {
      // regular portfolios
      const res = await axios.get(`${backendUrl}/portfolio/all-portfolios`);
      const regular = (Array.isArray(res.data) ? res.data : []).map((p) =>
        toCard(p, "general")
      );

      // handyman portfolios
      const h = await axios.get(`${backendUrl}/api/handyman-template`);
      const handyman = (Array.isArray(h.data) ? h.data : []).map((d) =>
        toCard(d, "handyman")
      );

      const all = [...regular, ...handyman];

      const mine = all.filter(
        (p) => p.email && p.email.toLowerCase() === loggedInEmail
      );
      const others = all.filter(
        (p) => !p.email || p.email.toLowerCase() !== loggedInEmail
      );

      if (mine.length === 0 && others.length === 0) toast.info("No portfolios found");

      setMyPortfolios(mine);
      setOtherPortfolios(others);
    } catch (err) {
      toast.error("Error fetching portfolios");
      console.error(err);
    }
  };

  const handleAddPortfolio = () => navigate("/resume");

  const handleCardClick = (p) => {
    if (p.type === "handyman") {
      navigate(`/portfolios/handyman/${p._id}`);
    } else {
      const username = (p.email || "").split("@")[0];
      navigate(`/portfolios/project-manager/${username}/${p._id}`);
    }
  };

  return (
    <>
      <main className="min-h-screen bg-slate-50 pt-24 px-4">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* My Portfolios */}
          {contextLoggedIn && (
            <section>
              <h2 className="text-2xl font-semibold mb-6 text-slate-800">My Portfolios</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mb-6">
                {myPortfolios.map((p) => (
                  <div
                    key={p._id}
                    className="bg-white rounded-xl shadow-md p-6 cursor-pointer"
                    onClick={() => handleCardClick(p)}
                  >
                    <div className="font-semibold text-slate-800 mb-2">{p.title}</div>
                    <div className="text-slate-600">{p.name}</div>
                  </div>
                ))}
                <button
                  onClick={handleAddPortfolio}
                  className="flex flex-col items-center justify-center bg-white rounded-xl shadow-md p-6 border-2 border-dashed border-slate-300 hover:border-blue-400 transition-all min-h-[180px] cursor-pointer"
                  style={{ minHeight: "180px" }}
                >
                  <span className="text-5xl text-blue-400 font-bold">+</span>
                  <span className="mt-2 text-slate-500">Add Portfolio</span>
                </button>
              </div>
            </section>
          )}

          {/* Other Portfolios */}
          <section>
            <h2 className="text-2xl font-semibold mb-6 text-slate-800">Other Portfolios</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mb-6">
              {otherPortfolios
                .filter((p) => p.title && p.name)
                .map((p) => (
                  <div
                    key={p._id}
                    className="bg-white rounded-xl shadow-md p-6 cursor-pointer"
                    onClick={() => handleCardClick(p)}
                  >
                    <div className="font-semibold text-slate-800 mb-2">{p.title}</div>
                    <div className="text-slate-600">{p.name}</div>
                  </div>
                ))}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
