import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      <div className="text-center animate-slide-up">
        <h1 className="section-title text-2xl sm:text-3xl lg:text-4xl">404 - Page Not Found</h1>
        <p className="section-subtitle text-center text-sm sm:text-base">
          The page you're looking for doesn't exist.
        </p>
      </div>
      
      <div className="max-w-md mx-auto animate-slide-up text-center">
        <Link 
          to="/portfolios/data-scientist"
          className="text-terminal-accent hover:text-terminal-accent/80 transition-colors"
        >
          ← Back to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
