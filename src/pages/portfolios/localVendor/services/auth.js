import { useContext } from "react";
import { AuthContext } from "../../../../context/AuthContext";

/**
 * Checks if the logged-in user has permission to edit a given vendor portfolio.
 * Returns true if the user is either:
 *  - an admin (user.role === "admin"), OR
 *  - the portfolio ID exists in user.portfolios.
 */
export const canEditPortfolio = (vendorId) => {
  const { user } = useContext(AuthContext);
  // console.trace("canEditPortfolio called from");

  if (!user) {
    console.warn(" No user provided");
    return false;
  }

  // console.log("user.role:", user.role);
  // console.log("user.portfolios:", user.portfolios);

  // Normalize values
  const loggedInRole = user.role?.toLowerCase() || "customer";
  const ownedPortfolios = user.portfolios || [];

  // console.log("normalized role:", loggedInRole);
  // console.log("ownedPortfolios (normalized):", ownedPortfolios);

  // Check permissions
  const isAdmin = loggedInRole === "admin";
  const isOwner = !!vendorId && ownedPortfolios.some((p) => p.portfolioId === vendorId);

  // console.log("isAdmin:", isAdmin);
  // console.log("isOwner:", isOwner);
  console.log("FINAL canEdit:", isAdmin || isOwner);

  return isAdmin || isOwner;
};
