import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";

export default function Dashboard() {
  const navigate = useNavigate();
  const [portfolios, setPortfolios] = useState([]);
  const backendUrl = import.meta.env.VITE_BACKEND_API;
  const loggedInEmail = localStorage.getItem("email");

  useEffect(() => {
    fetchPortfolios();
  }, []);

  const fetchPortfolios = async () => {
    try {
      const res = await axios.get(
        `${backendUrl}/portfolio/email/${loggedInEmail}`
      );
      console.log(res.data);
      setPortfolios([res.data]);
    } catch (err) {
      toast.error("Error fetching portfolios");
      console.error(err);
    }
  };

  // Temporary: Logout brings user back to About page
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    localStorage.removeItem("portfolioId");
    navigate("/"); // TODO: Replace with proper auth redirect later
  };

  const handleAddPortfolio = () => {
    setPortfolios([
      ...portfolios,
      { title: "New Portfolio", summary: "Describe your portfolio..." },
    ]);
  };

  return (
    <>
      <main className="min-h-screen bg-slate-50 pt-24 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold mb-8 text-slate-800">
            Your Portfolios
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {portfolios.map((p, i) => (
              <div
                key={i}
                className="bg-white rounded-xl shadow-md p-6 flex flex-col justify-between"
              >
                {/* PortfolioCard content here */}
                <div className="font-semibold text-slate-800 mb-2">
                  {p.title}
                </div>
                <div className="text-slate-600">{p.summary}</div>
              </div>
            ))}
            {/* Add portfolio card */}
            <button
              onClick={handleAddPortfolio}
              className="flex flex-col items-center justify-center bg-white rounded-xl shadow-md p-6 border-2 border-dashed border-slate-300 hover:border-blue-400 transition-all min-h-[180px] cursor-pointer"
            >
              <span className="text-5xl text-blue-400 font-bold">+</span>
              <span className="mt-2 text-slate-500">Add Portfolio</span>
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
