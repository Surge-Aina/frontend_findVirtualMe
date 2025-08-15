import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import { useState, useEffect, useContext } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { AuthContext } from "../context/AuthContext.jsx";

export default function Dashboard() {
  const navigate = useNavigate();
  const [portfolios, setPortfolios] = useState([]);
  const backendUrl = import.meta.env.VITE_BACKEND_API;
  const loggedInEmail = localStorage.getItem("email");

  const { contextLoggedIn, contextLogout } = useContext(AuthContext);

  useEffect(() => {
    fetchPortfolios();
  }, [contextLoggedIn]);

  const [myPortfolios, setMyPortfolios] = useState([]);
  const [otherPortfolios, setOtherPortfolios] = useState([]);

  const fetchPortfolios = async () => {
    try {
      const res = await axios.get(`${backendUrl}/portfolio/all-portfolios`);
      const all = res.data;

      const mine = all.filter((p) => p.email === loggedInEmail);
      const others = all.filter((p) => p.email !== loggedInEmail);

      if (mine.length === 0 && others.length === 0) {
        toast.info("No portfolios found");
      }

      setMyPortfolios(mine);
      setOtherPortfolios(others);
    } catch (err) {
      toast.error("Error fetching portfolios");
      console.error(err);
    }
  };

  const handleAddPortfolio = () => {
    navigate("/resume");
  };

  const handleCardClick = (portfolio) => {
    navigate(
      `/portfolios/project-manager/${portfolio.username}/${portfolio._id}`
    );
  };

  return (
    <>
      <main className="min-h-screen bg-slate-50 pt-24 px-4">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* My Portfolios */}
          {contextLoggedIn && (
            <section>
              <h2 className="text-2xl font-semibold mb-6 text-slate-800">
                My Portfolios
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                {myPortfolios.map((p, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-xl shadow-md p-6"
                    onClick={() => handleCardClick(p)}
                  >
                    <div className="font-semibold text-slate-800 mb-2">
                      {p.title}
                    </div>
                    <div className="text-slate-600">{p.summary}</div>
                  </div>
                ))}
              </div>
              {/* Add Portfolios */}
              <button
                onClick={handleAddPortfolio}
                className="flex flex-col items-center justify-center bg-white rounded-xl shadow-md p-6 border-2 border-dashed border-slate-300 hover:border-blue-400 transition-all min-h-[180px] cursor-pointer"
              >
                <span className="text-5xl text-blue-400 font-bold">+</span>
                <span className="mt-2 text-slate-500">Add Portfolio</span>
              </button>
            </section>
          )}

          {/* Other Portfolios */}
          <section>
            <h2 className="text-2xl font-semibold mb-6 text-slate-800">
              Other Portfolios
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
              {otherPortfolios.map((p, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl shadow-md p-6"
                  onClick={() => handleCardClick(p)}
                >
                  <div className="font-semibold text-slate-800 mb-2">
                    {p.title}
                  </div>
                  <div className="text-slate-600">{p.summary}</div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
