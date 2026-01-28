import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export function useHandleCardClick() {
  const navigate = useNavigate();

  const handleCardClick = (p) => {
    let portfolio = p;

    if (!portfolio) {
      console.error(`User does not own portfolio with ID: ${p._id}. Cannot determine type.`);
      toast.error("Portfolio match not found in user account.");
      return;
    }

    if (portfolio.portfolioType === "Handyman") {
      navigate(`/portfolios/handyman/${p._id}`);
    } else if (portfolio.portfolioType === "CleaningLady") {
      navigate(`/portfolios/cleaningService/${p._id}/about`);
    } else if (portfolio.portfolioType === "LocalVendor") {
      const username = (p.name || p.email || "vendor").toLowerCase().replace(/\s+/g, "-");
      navigate(`/portfolios/vendor/${username}/${p._id}`);
    } else if (portfolio.portfolioType === "ProjectManager") {
      navigate(`/portfolios/ProjectManager/${p._id}`);
    } else if (portfolio.portfolioType === "Healthcare") {
      const practiceId = p.practiceId || p._id;
      console.log("🏥 Navigating to Healthcare portfolio:");
      console.log("- Portfolio object:", p);
      console.log("- Practice ID:", practiceId);
      console.log("- Navigation URL:", `/portfolios/healthcare/${practiceId}`);
      navigate(`/portfolios/healthcare/${portfolio._id}`);
    } else {
      toast.error("Portfolio Type not found");
    }
  };

  return { handleCardClick };
}
