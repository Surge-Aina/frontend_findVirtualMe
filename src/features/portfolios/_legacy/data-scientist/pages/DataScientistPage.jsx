import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { PortfolioProvider } from '../context/PortfolioContext';
import Layout from '../components/layout/Layout';
import HomePage from '../components/pages/HomePage';
import ProjectsPage from '../components/pages/ProjectsPage';
import ContactPage from '../components/pages/ContactPage';
import TestimonialsPage from '../components/pages/TestimonialsPage';
import AdminPage from '../components/pages/AdminPage';
import LoginPage from '../components/pages/LoginPage';
import NotFoundPage from '../components/pages/NotFoundPage';
import ProtectedRoute from '../components/common/ProtectedRoute';
import '../style.css'; // Import the CSS

const DataScientistPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <AuthProvider>
        <PortfolioProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/testimonials" element={<TestimonialsPage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Layout>
        </PortfolioProvider>
      </AuthProvider>
    </div>
  );
};

export default DataScientistPage;
