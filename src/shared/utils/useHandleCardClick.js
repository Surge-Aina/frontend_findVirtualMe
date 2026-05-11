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

    const portfolioType = p.portfolioType || p.template;

    // Unified sections/blocks portfolios use /portfolios/view/:id
    if (p.sections || p.template) {
      navigate(`/portfolios/view/${p._id}`);
      return;
    }

    // Legacy routes for un-migrated portfolios
    switch (portfolioType) {
      case "Handyman":
      case "handyman":
        navigate(`/portfolios/handyman/${p._id}`);
        break;

      case "CleaningLady":
        navigate(`/portfolios/cleaningService/${p._id}/about`);
        break;

      case "LocalVendor": {
        const username = (p.name || p.email || "vendor").toLowerCase().replace(/\s+/g, "-");
        navigate(`/portfolios/vendor/${username}/${p._id}`);
        break;
      }

      case "ProjectManager":
      case "projectManager":
        navigate(`/portfolios/ProjectManager/${p._id}`);
        break;

      case "Healthcare":
      case "healthcare":
        navigate(`/portfolios/healthcare/${p._id}`);
        break;

      default:
        navigate(`/portfolios/view/${p._id}`);
    }
  };

  return { handleCardClick };
}