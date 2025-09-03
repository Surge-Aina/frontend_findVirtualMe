import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import { useState, useEffect, useContext } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { AuthContext } from "../context/AuthContext.jsx";

export default function Dashboard() {
  const navigate = useNavigate();
  // const [portfolios, setPortfolios] = useState([]);
  const backendUrl = import.meta.env.VITE_BACKEND_API;
  const loggedInEmail = localStorage.getItem("email");

  const { contextLoggedIn, contextLogout } = useContext(AuthContext); 

  useEffect(() => {
    if (contextLoggedIn) {
      fetchPortfolios();
    }
  }, [contextLoggedIn]);

  const [myPortfolios, setMyPortfolios] = useState([]);
  const [otherPortfolios, setOtherPortfolios] = useState([]);
  
  

  const fetchPortfolios = async () => {
    try {
      const res = await axios.get(`${backendUrl}/portfolio/all-portfolios`);
      const all = res.data;
      const userId = localStorage.getItem("userId");
      setMyPortfolios(all.filter((p) => p.email === loggedInEmail || p.userId === userId));
      setOtherPortfolios(all.filter((p) => p.email !== loggedInEmail && p.userId !== userId));
    } catch (err) {
      toast.error("Error fetching portfolios");
      console.error(err);
    }
  };
      // if (mine.length === 0 && others.length === 0) {
      //   toast.info("No portfolios found");
      // }

  //     setMyPortfolios(mine);
  //     setOtherPortfolios(others);
  //   } catch (err) {
  //     toast.error("Error fetching portfolios");
  //     console.error(err);
  //   }
  // };

  const handleAddPortfolio = () => {
    navigate("/resume");
  };

const handleCardClick = (portfolio) => {
    if (portfolio.type === 'project-manager') {
      const username = portfolio.email.split("@")[0];
      navigate(`/portfolios/project-manager/${username}/${portfolio._id}`);
    } else if (portfolio.type === 'handyman') { // CORRECTED: Moved to the same line
      navigate(`/portfolios/handyman/${portfolio._id}`);
    } else {
      toast.info("This portfolio type has no view page configured yet.");
    }
  };

  const handleCreatePortfolio = (type) => {
    setShowCreateModal(false);
    if (type === 'project-manager') {
      navigate("/resume");
    } else if (type === 'handyman') {
      const createHandymanPortfolio = async () => {
        try {
          const userId = localStorage.getItem('userId');
          if (!userId) {
            toast.error("Could not find user ID. Please log in again.");
            return;
          }
        
          const res = await axios.post(`${backendUrl}/api/handyman-template`, { userId });
          
          toast.success("New Handyman portfolio created!");
          
          navigate(`/portfolios/handyman/${res.data._id}`);
        } catch (err) {
          toast.error(err.response?.data?.message || "Failed to create portfolio.");
        }
      };
      createHandymanPortfolio();
    }
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
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mb-6">
                {/* Render user's portfolios */}
                {myPortfolios.map((p, i) => (
                  <div
                    key={p._id || i}
                    className="bg-white rounded-xl shadow-md p-6"
                    onClick={() => handleCardClick(p)}
                  >
                    <div className="font-semibold text-slate-800 mb-2">
                      {p.title}
                    </div>
                    <div className="text-slate-600">
                      {/* {p.summary && p.summary.length > 240
                        ? p.summary.slice(0, 240) + "…"
                        : p.summary} */}
                      {p.name}
                    </div>
                  </div>
                ))}
                {/* Add Portfolio card */}
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
            <h2 className="text-2xl font-semibold mb-6 text-slate-800">
              Other Portfolios
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mb-6">
              {/* Only render actual portfolios, no empty card */}
              {otherPortfolios
                .filter((p) => p.title && p.summary) // filter out any empty/invalid portfolios
                .map((p, i) => (
                  <div
                    key={p._id || i}
                    className="bg-white rounded-xl shadow-md p-6"
                    onClick={() => handleCardClick(p)}
                  >
                    <div className="font-semibold text-slate-800 mb-2">
                      {p.title}
                    </div>
                    <div className="text-slate-600">
                      {/* {p.summary && p.summary.length > 240
                        ? p.summary.slice(0, 240) + "…"
                        : p.summary} */}
                      {p.name}
                    </div>
                  </div>
                ))}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
