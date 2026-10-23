// Maps PortfolioContext `portfolioType` values to backend model names
// used by /privacy-policy/public/byPortfolio?portfolioId=&type=

export const portfolioTypeToModel = {
  // Legacy model names
  HandymanMainPortfolio: "HandymanMainPortfolio",
  ProjectManagerPortfolio: "ProjectManagerPortfolio",
  LocalVendorPortfolio: "LocalVendorPortfolio",
  CleaningPortfolio: "CleaningPortfolio",
  HealthcarePortfolio: "HealthcarePortfolio",
  // Unified template keys → single model name
  healthcare: "Portfolio",
  projectManager: "Portfolio",
  handyman: "Portfolio",
  dataScientist: "Portfolio",
  agent: "Portfolio",
};

