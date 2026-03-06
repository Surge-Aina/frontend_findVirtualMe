

export const PortfolioContext = createContext();

export function PortfolioProvider({ children }) {
  const [portfolioId, setPortfolioId] = useState(null);
  const [portfolioType, setPortfolioType] = useState(null);

    return (
        <PortfolioContext.Provider 
            value={{ 
                portfolioId, 
                setPortfolioId, 
                portfolioType, 
                setPortfolioType 
            }}>
                
            {children}
        </PortfolioContext.Provider>
    );
}