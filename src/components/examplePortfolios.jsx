import { toast } from "react-toastify";
import { useNavigate, useLocation } from "react-router-dom";

export default function ExamplePortfolios() {
  const location = useLocation();
  const navigate = useNavigate();

  const portfolios = [
    {
      title: "Project Manager",
      summary: "Portfolio showcasing Project Manager's resume and work.",
      location: "/portfolios/project-manager/example/689b833c90c7ecc042b7b2ac",
    },
    {
      title: "Healthcare Professional",
      summary: "Portfolio showcasing healthcare services and practice details.",
      location: "/portfolios/healthcare",
    },
  ];

  const handleCardClick = (portfolio) => {
    if (portfolio.location) {
      navigate(portfolio.location);
    } else {
      toast("Coming Soon!");
    }
  };

  let displayPortfolios = portfolios;

  if (location.state?.from === "about") {
    // still safe – just returns both
    displayPortfolios = portfolios.slice(0, 2);
  } else if (location.state?.from === "occupations") {
    // explicitly restrict to the two we support
    displayPortfolios = portfolios.filter((p) =>
      ["Project Manager", "Healthcare Professional"].includes(p.title)
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 pt-24 px-4">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold mb-8 text-slate-800">
          Portfolios
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {displayPortfolios.map((p, i) => (
            <div
              key={i}
              className="bg-white rounded-xl shadow-md p-6 flex flex-col justify-between hover:bg-slate-200 cursor-pointer"
              onClick={() => handleCardClick(p)}
            >
              <div className="font-semibold text-slate-800 mb-2">
                {p.title}
              </div>
              <div className="text-slate-600">{p.summary}</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
