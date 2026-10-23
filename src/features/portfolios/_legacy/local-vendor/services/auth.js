/**
 * Checks if the logged-in user has permission to edit a given vendor portfolio.
 * Returns true if the user is either:
 *  - an admin (user.role === "admin"), OR
 *  - the portfolio ID exists in user.portfolios (object with portfolioId or legacy id string).
 */
export const canEditPortfolio = (user, vendorId) => {
  if (!user) {
    console.warn(" No user provided");
    return false;
  }

  const loggedInRole = user.role?.toLowerCase() || "customer";
  const ownedPortfolios = user.portfolios || [];

  const isAdmin = loggedInRole === "admin";
  const isOwner =
    !!vendorId &&
    ownedPortfolios.some((p) => {
      const pid = p && typeof p === "object" ? p.portfolioId : p;
      return pid === vendorId;
    });

  console.log("FINAL canEdit:", isAdmin || isOwner);

  return isAdmin || isOwner;
};
