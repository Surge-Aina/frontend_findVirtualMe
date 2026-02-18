import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export function useHandleCardClick() {
  const navigate = useNavigate();

  const handleCardClick = (p) => {
    if (!p || !p._id) {
      console.error("Invalid portfolio object:", p);
      toast.error("Portfolio not found.");
      return;
    }

    const portfolioType = p.portfolioType;

    switch (portfolioType) {
      case "Handyman":
        navigate(`/portfolios/handyman/${p._id}`);
        break;
        
      case "CleaningLady":
        navigate(`/portfolios/cleaningService/${p._id}/about`);
        break;
        
      case "LocalVendor":
        const username = (p.name || p.email || "vendor").toLowerCase().replace(/\s+/g, "-");
        navigate(`/portfolios/vendor/${username}/${p._id}`);
        break;
        
      case "ProjectManager":
        navigate(`/portfolios/ProjectManager/${p._id}`);
        break;
        
      case "Healthcare":
        // ✅ Use _id consistently (same as other portfolios)
        console.log("🏥 Navigating to Healthcare portfolio:", p._id);
        navigate(`/portfolios/healthcare/${p._id}`);
        break;
        
      default:
        toast.error("Portfolio type not found");
    }
  };

  return { handleCardClick };
}