import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import About from './components/About';
import Dashboard from './components/Dashboard';
import Tip from './components/Tip';
import Footer from './components/Footer';
import './App.css';

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [portfolios, setPortfolios] = useState([]);
  const [adminRequested, setAdminRequested] = useState(false);

  const handleGetStarted = () => {
    if (loggedIn) return;
    // Show tip/suggestion for plus button
  };

  const handleAddPortfolio = () => {
    setPortfolios([...portfolios, { name: 'New Portfolio', description: 'Describe your portfolio...' }]);
  };

  const handleRequestAdmin = () => {
    setAdminRequested(true);
  };

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<About onGetStarted={handleGetStarted} />} />
        <Route
          path="/dashboard"
          element={
            <Dashboard
              portfolios={portfolios}
              onAddPortfolio={handleAddPortfolio}
              onRequestAdmin={handleRequestAdmin}
            />
          }
        />
      </Routes>
      {adminRequested && (
        <Tip message="Request received! Our admin team will contact you shortly." />
      )}
      <Footer />
    </Layout>
  );
}
