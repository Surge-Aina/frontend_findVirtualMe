import React from 'react';

const Layout = ({ children, user, logout, isAdmin, onOpenNavModal, sections = [] }) => {
  // Default sections if none provided
  const defaultSections = [
    { id: 'welcome', label: 'Welcome' },
    { id: 'skills', label: 'Skills' },
    { id: 'projects', label: 'Projects' },
    { id: 'experience', label: 'Experience' },
    { id: 'education', label: 'Education' },
    { id: 'certifications', label: 'Certifications' },
    { id: 'contact', label: 'Contact' },
  ];

  const displaySections = sections.length > 0 ? sections : defaultSections;

  const handleNavClick = (e, sectionId) => {
    e.preventDefault();
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const handleContactClick = (e) => {
    e.preventDefault();
    const element = document.getElementById('contact');
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <>
      
      <div className="page-container">
        {children}
      </div>
    </>
  );
};

export default Layout; 