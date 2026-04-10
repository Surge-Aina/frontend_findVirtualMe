import { createContext, useContext } from "react";

export const PortfolioEditorContext = createContext({ portfolioId: null });

export function usePortfolioEditorId() {
  return useContext(PortfolioEditorContext);
}
