import React, { useState, useEffect, useRef, useContext } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../../context/AuthContext';
import { io } from 'socket.io-client';
import './App.css';
import Layout from '../../../components/Layout';

// Helper function to convert relative upload paths to full backend URLs
const getFullUploadUrl = (relativePath) => {
  if (!relativePath) return '';
  if (relativePath.startsWith('http')) return relativePath;
  return `${import.meta.env.VITE_BACKEND_API}${relativePath}`;
};

// CSS Isolation Wrapper Component
const SoftwareEngineerWrapper = ({ children }) => {
  return (
    <div className="software-engineer-isolation-wrapper" style={{
      fontFamily: 'inherit',
      fontSize: 'inherit',
      lineHeight: 'inherit',
      color: 'inherit',
      background: 'inherit'
    }}>
      {children}
    </div>
  );
};

// Unauthorized Page Component
const Unauthorized = () => {
  const { contextLogout } = useContext(AuthContext);
  const logout = contextLogout;
  
  return (
    <div className="unauthorized-container">
      <div className="unauthorized-card">
        <h1>🚫 Access Denied</h1>
        <p>You don't have permission to access this page.</p>
        <div className="unauthorized-actions">
          <button onClick={() => window.history.back()} className="back-btn">
            Go Back
          </button>
          <button onClick={logout} className="logout-btn">
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

// Admin Portfolio Component with Editing Capabilities
const Portfolio = () => {
  const { contextLoggedIn, contextLogout } = useContext(AuthContext);
  const user = contextLoggedIn ? { 
    email: localStorage.getItem('email'),
    ownerId: localStorage.getItem('email'),
    role: 'admin'
  } : null;
  const logout = contextLogout;
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [addModalType, setAddModalType] = useState('');
  const [newItem, setNewItem] = useState({});
  const [isAdmin, setIsAdmin] = useState(true);
  const projectImageInputRef = useRef(null);
  const certificateImageInputRef = useRef(null);

  console.log('Portfolio component rendered');

  // Add new item states
  const [addSkill, setAddSkill] = useState(false);
  const [newSkill, setNewSkill] = useState({ name: '', level: 'Beginner', rating: 3, description: '' });
  const [addProject, setAddProject] = useState(false);
  const [newProject, setNewProject] = useState({ title: '', description: '', repoUrl: '', demoUrl: '', imageUrl: '', techStack: [] });
  const [addExperience, setAddExperience] = useState(false);
  const [newExperience, setNewExperience] = useState({ company: '', role: '', duration: '', details: '' });
  const [addEducation, setAddEducation] = useState(false);
  const [newEducation, setNewEducation] = useState({ degree: '', institution: '', year: '' });
  const [addCert, setAddCert] = useState(false);
  const [newCert, setNewCert] = useState({ title: '', year: '', imageUrl: '' });

  // Navigation management modal state
  const [showNavModal, setShowNavModal] = useState(false);
  const [editingNavItem, setEditingNavItem] = useState(null);
  const [editNavValue, setEditNavValue] = useState('');
  const [newNavLabel, setNewNavLabel] = useState('');
  const [newNavId, setNewNavId] = useState('');

  // Custom section management state
  const [addCustomItem, setAddCustomItem] = useState(null);
  const [editingCustomItem, setEditingCustomItem] = useState(null);
  const [newCustomItem, setNewCustomItem] = useState({ title: '', description: '' });

  // Resume upload states
  const [showResumeUpload, setShowResumeUpload] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [resumeUploadError, setResumeUploadError] = useState(null);
  const resumeInputRef = useRef(null);

  // Navigation sections - using state to allow dynamic updates
  const [sections, setSections] = useState([
    { id: 'welcome', label: 'Welcome' },
    { id: 'skills', label: 'Skills' },
    { id: 'projects', label: 'Projects' },
    { id: 'experience', label: 'Experience' },
    { id: 'education', label: 'Education' },
    { id: 'certifications', label: 'Certifications' },
    { id: 'contact', label: 'Contact' },
  ]);

  // Modal state for project details
  const [selectedProject, setSelectedProject] = useState(null);
  const [showProjectModal, setShowProjectModal] = useState(false);
  
  // Modal state for skill details
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [showSkillModal, setShowSkillModal] = useState(false);

  // Modal state for certificate details
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [showCertificateModal, setShowCertificateModal] = useState(false);

  // Modal state for experience details
  const [selectedExperience, setSelectedExperience] = useState(null);
  const [showExperienceModal, setShowExperienceModal] = useState(false);

  // Modal state for education details
  const [selectedEducation, setSelectedEducation] = useState(null);
  const [showEducationModal, setShowEducationModal] = useState(false);

  // Add handlers
  const handleAddSkill = async () => {
    if (!portfolio) return;
    const updated = { ...portfolio, skills: [...portfolio.skills, newSkill] };
    setPortfolio(updated);
    setAddSkill(false);
    setNewSkill({ name: '', level: 'Beginner', rating: 3, description: '' });
    await updatePortfolio(portfolio.ownerId, updated);
  };

  const handleAddProject = async () => {
    if (!portfolio) return;
    const updated = { ...portfolio, projects: [...portfolio.projects, newProject] };
    setPortfolio(updated);
    setAddProject(false);
    setNewProject({ title: '', description: '', repoUrl: '', demoUrl: '', imageUrl: '', techStack: [] });
    await updatePortfolio(portfolio.ownerId, updated);
  };

  const handleAddExperience = async () => {
    if (!portfolio) return;
    const updated = { ...portfolio, experience: [...portfolio.experience, newExperience] };
    setPortfolio(updated);
    setAddExperience(false);
    setNewExperience({ company: '', role: '', duration: '', details: '' });
    await updatePortfolio(portfolio.ownerId, updated);
  };

  const handleAddEducation = async () => {
    if (!portfolio) return;
    const updated = { ...portfolio, education: [...portfolio.education, newEducation] };
    setPortfolio(updated);
    setAddEducation(false);
    setNewEducation({ degree: '', institution: '', year: '' });
    await updatePortfolio(portfolio.ownerId, updated);
  };

  const handleAddCert = async () => {
    if (!portfolio) return;
    
    console.log('Adding new certificate:', newCert);
    console.log('Current certifications:', portfolio.certifications);
    
    const updated = { ...portfolio, certifications: [...portfolio.certifications, newCert] };
    
    console.log('Updated certifications:', updated.certifications);
    
    setPortfolio(updated);
    setAddCert(false);
    setNewCert({ title: '', year: '', imageUrl: '' });
    await updatePortfolio(portfolio.ownerId, updated);
    
    console.log('Certificate added successfully');
  };

  // Delete handlers
  const handleDeleteProject = async (idx) => {
    if (!portfolio) return;
    const updated = { ...portfolio, projects: portfolio.projects.filter((_, i) => i !== idx) };
    setPortfolio(updated);
    await updatePortfolio(portfolio.ownerId, updated);
  };
  const handleDeleteExperience = async (idx) => {
    if (!portfolio) return;
    const updated = { ...portfolio, experience: portfolio.experience.filter((_, i) => i !== idx) };
    setPortfolio(updated);
    await updatePortfolio(portfolio.ownerId, updated);
  };
  const handleDeleteEducation = async (idx) => {
    if (!portfolio) return;
    const updated = { ...portfolio, education: portfolio.education.filter((_, i) => i !== idx) };
    setPortfolio(updated);
    await updatePortfolio(portfolio.ownerId, updated);
  };
  const handleDeleteCert = async (idx) => {
    if (!portfolio) return;
    const updated = { ...portfolio, certifications: portfolio.certifications.filter((_, i) => i !== idx) };
    setPortfolio(updated);
    await updatePortfolio(portfolio.ownerId, updated);
  };

  const handleDeleteSkill = async (idx) => {
    if (!portfolio) return;
    const updated = { ...portfolio, skills: portfolio.skills.filter((_, i) => i !== idx) };
    setPortfolio(updated);
    await updatePortfolio(portfolio.ownerId, updated);
  };

  // Navigation management functions
  const handleOpenNavModal = () => {
    setShowNavModal(true);
  };

  const handleCloseNavModal = () => {
    setShowNavModal(false);
    setEditingNavItem(null);
    setEditNavValue('');
    setNewNavLabel('');
    setNewNavId('');
  };

  const handleEditNavItem = (navId, currentLabel) => {
    setEditingNavItem(navId);
    setEditNavValue(currentLabel);
  };

  const handleSaveNavItem = (newLabel) => {
    // Update the sections array
    setSections(prevSections => 
      prevSections.map(section => 
        section.id === editingNavItem 
          ? { ...section, label: newLabel }
          : section
      )
    );
    setEditingNavItem(null);
    setEditNavValue('');
    console.log(`Updated navigation label for ${editingNavItem} to: ${newLabel}`);
  };

  const handleCancelNavEdit = () => {
    setEditingNavItem(null);
    setEditNavValue('');
  };

  const handleDeleteNavItem = (navId) => {
    // Don't allow deleting core sections
    const coreSection = ['welcome', 'skills', 'projects', 'experience', 'education', 'certifications', 'contact'];
    if (coreSection.includes(navId)) {
      alert('Cannot delete core navigation sections.');
      return;
    }

    // Remove the section from the array
    setSections(prevSections => 
      prevSections.filter(section => section.id !== navId)
    );
    console.log(`Deleted navigation item: ${navId}`);
  };

  const handleAddNewNavItem = async () => {
    if (!newNavLabel.trim()) {
      alert('Please enter a navigation label.');
      return;
    }

    // Generate ID from label
    const generatedId = newNavLabel.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 20);
    
    // Check if ID already exists
    if (sections.some(section => section.id === generatedId)) {
      alert('A navigation item with this name already exists.');
      return;
    }

    // Add new navigation item
    const newNavItem = {
      id: generatedId,
      label: newNavLabel.trim()
    };

    // Update sections state
    setSections(prevSections => [...prevSections, newNavItem]);
    
    // Update portfolio to include the new section in uiSettings
    if (portfolio) {
      const updatedPortfolio = { ...portfolio };
      
      // Initialize the section in portfolio data
      if (!updatedPortfolio[generatedId]) {
        updatedPortfolio[generatedId] = [];
      }
      
      // Add REM control for the new section
      if (!updatedPortfolio.uiSettings) {
        updatedPortfolio.uiSettings = { baseRem: 1, sectionRem: {} };
      }
      if (!updatedPortfolio.uiSettings.sectionRem) {
        updatedPortfolio.uiSettings.sectionRem = {};
      }
      updatedPortfolio.uiSettings.sectionRem[generatedId] = 1;
      
      // Update the portfolio in backend
      try {
        await updatePortfolio(portfolio.ownerId || 'admin@test.com', updatedPortfolio);
        setPortfolio(updatedPortfolio);
      } catch (error) {
        console.error('Error updating portfolio with new section:', error);
        alert('Failed to add section. Please try again.');
        return;
      }
    }
    
    setNewNavLabel('');
    setNewNavId('');
    setShowNavModal(false);
    console.log(`Added new navigation item:`, newNavItem);
  };

  // Custom section management functions
  const handleAddCustomItem = async (sectionId) => {
    if (!newCustomItem.title.trim()) {
      alert('Please enter a title for the item.');
      return;
    }

    const updatedPortfolio = { ...portfolio };
    if (!updatedPortfolio[sectionId]) {
      updatedPortfolio[sectionId] = [];
    }
    
    updatedPortfolio[sectionId].push({
      title: newCustomItem.title.trim(),
      description: newCustomItem.description.trim()
    });

    try {
      await updatePortfolio(portfolio.ownerId || 'admin@test.com', updatedPortfolio);
      setNewCustomItem({ title: '', description: '' });
      setAddCustomItem(null);
    } catch (error) {
      console.error('Error adding custom item:', error);
      alert('Failed to add item. Please try again.');
    }
  };

  const handleEditCustomItem = (sectionId, index, item) => {
    setEditingCustomItem({ sectionId, index, item });
    setNewCustomItem({ title: item.title || '', description: item.description || '' });
  };

  const handleUpdateCustomItem = async () => {
    if (!newCustomItem.title.trim()) {
      alert('Please enter a title for the item.');
      return;
    }

    const updatedPortfolio = { ...portfolio };
    updatedPortfolio[editingCustomItem.sectionId][editingCustomItem.index] = {
      title: newCustomItem.title.trim(),
      description: newCustomItem.description.trim()
    };

    try {
      await updatePortfolio(portfolio.ownerId || 'admin@test.com', updatedPortfolio);
      setNewCustomItem({ title: '', description: '' });
      setEditingCustomItem(null);
    } catch (error) {
      console.error('Error updating custom item:', error);
      alert('Failed to update item. Please try again.');
    }
  };

  const handleDeleteCustomItem = async (sectionId, index) => {
    if (!confirm('Are you sure you want to delete this item?')) {
      return;
    }

    const updatedPortfolio = { ...portfolio };
    updatedPortfolio[sectionId].splice(index, 1);

    try {
      await updatePortfolio(portfolio.ownerId || 'admin@test.com', updatedPortfolio);
    } catch (error) {
      console.error('Error deleting custom item:', error);
      alert('Failed to delete item. Please try again.');
    }
  };

  // General delete function for profile fields
  const handleDelete = async (fieldPath) => {
    if (!portfolio) return;
    
    const updated = { ...portfolio };
    const pathParts = fieldPath.split('.');
    let current = updated;
    
    for (let i = 0; i < pathParts.length - 1; i++) {
      current = current[pathParts[i]];
    }
    
    // Clear the field (set to empty string or remove the field)
    if (pathParts[pathParts.length - 1] === 'bio') {
      current[pathParts[pathParts.length - 1]] = '';
    } else {
      delete current[pathParts[pathParts.length - 1]];
    }
    
    setPortfolio(updated);
    await updatePortfolio(portfolio.ownerId, updated);
  };

  // Fetch portfolio data from backend
  const fetchPortfolio = async (ownerId) => {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_API}/softwareeng/${ownerId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch portfolio');
    }
    return response.json();
  };

  const updatePortfolio = async (ownerId, updatedPortfolio) => {
    // Ensure ownerId is a string and has a fallback
    const actualOwnerId = ownerId || 'admin@test.com';
    console.log(`Updating portfolio for ${actualOwnerId}:`, updatedPortfolio);
    
    try {
      // Update the current portfolio
      const response = await fetch(`${import.meta.env.VITE_BACKEND_API}/softwareeng/${actualOwnerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedPortfolio),
      });
      
      console.log('Update response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Update failed:', errorText);
        throw new Error('Failed to update portfolio');
      }

      const result = await response.json();
      console.log('Update successful:', result);

      // The backend will handle syncing admin updates to customer portfolio
      // No need to do it here to avoid double-sync issues

      return result;
    } catch (error) {
      console.error('Error updating portfolio:', error);
      throw error;
    }
  };

  const startEditing = (fieldPath, currentValue) => {
    setEditingField(fieldPath);
    setEditValue(currentValue);
  };

  const saveEdit = async (fieldPath) => {
    if (!portfolio) return;
    
    const updated = { ...portfolio };
    const pathParts = fieldPath.split('.');
    let current = updated;
    
    for (let i = 0; i < pathParts.length - 1; i++) {
      current = current[pathParts[i]];
    }
    
    current[pathParts[pathParts.length - 1]] = editValue;
    setPortfolio(updated);
    setEditingField(null);
    setEditValue('');
    await updatePortfolio(portfolio.ownerId || 'admin@test.com', updated);
  };

  const cancelEdit = () => {
    setEditingField(null);
    setEditValue('');
  };

  const updateBaseRem = async (newBaseRem) => {
    if (!portfolio) return;
    const updated = {
      ...portfolio,
      uiSettings: {
        ...portfolio.uiSettings,
        baseRem: newBaseRem
      }
    };
    setPortfolio(updated);
    await updatePortfolio(portfolio.ownerId || 'admin@test.com', updated);
  };

  const updateSectionRem = async (section, newRem) => {
    if (!portfolio) return;
    
    console.log('updateSectionRem called with:', { section, newRem });
    
    const updated = {
      ...portfolio,
      uiSettings: {
        ...portfolio.uiSettings,
        sectionRem: {
          ...portfolio.uiSettings.sectionRem,
          [section]: newRem
        }
      }
    };
    console.log('Updated portfolio uiSettings:', updated.uiSettings);
    setPortfolio(updated);
    await updatePortfolio(portfolio.ownerId || 'admin@test.com', updated);
  };

  const updateAboutRem = (newRem) => {
    console.log('Updating about rem to:', newRem);
    updateSectionRem('about', newRem);
    
    // Apply font size directly to the about section
    const aboutSection = document.querySelector('#welcome');
    if (aboutSection) {
      aboutSection.style.fontSize = `${newRem}rem`;
      console.log('Applied font size directly to about section:', `${newRem}rem`);
    }
  };
  const updateSkillsRem = (newRem) => {
    console.log('Updating skills rem to:', newRem);
    updateSectionRem('skills', newRem);
    
    // Apply font size directly to the skills section and all its children
    const skillsSection = document.querySelector('#skills');
    if (skillsSection) {
      // Apply to the section itself with !important
      skillsSection.style.setProperty('font-size', `${newRem}rem`, 'important');
      
      // Apply to all child elements to ensure inheritance
      const skillItems = skillsSection.querySelectorAll('.skill-item, .skill-item *');
      skillItems.forEach(item => {
        if (item.tagName !== 'BUTTON') { // Don't change button font sizes
          item.style.setProperty('font-size', `${newRem}rem`, 'important');
        }
      });
      
      // Also apply to the skills container
      const skillsContainer = skillsSection.querySelector('.skills');
      if (skillsContainer) {
        skillsContainer.style.setProperty('font-size', `${newRem}rem`, 'important');
      }
      
      console.log('Applied font size directly to skills section and children with !important:', `${newRem}rem`);
    } else {
      console.log('Skills section not found');
    }
  };
  const updateProjectsRem = (newRem) => {
    console.log('Updating projects rem to:', newRem);
    updateSectionRem('projects', newRem);
    
    // Apply font size directly to the projects section
    const projectsSection = document.querySelector('#projects');
    if (projectsSection) {
      projectsSection.style.fontSize = `${newRem}rem`;
      console.log('Applied font size directly to projects section:', `${newRem}rem`);
    }
  };
  const updateExperienceRem = (newRem) => {
    console.log('Updating experience rem to:', newRem);
    updateSectionRem('experience', newRem);
    
    // Apply font size directly to the experience section
    const experienceSection = document.querySelector('#experience');
    if (experienceSection) {
      experienceSection.style.fontSize = `${newRem}rem`;
      console.log('Applied font size directly to experience section:', `${newRem}rem`);
    }
  };
  const updateEducationRem = (newRem) => {
    console.log('Updating education rem to:', newRem);
    updateSectionRem('education', newRem);
    
    // Apply font size directly to the education section
    const educationSection = document.querySelector('#education');
    if (educationSection) {
      educationSection.style.fontSize = `${newRem}rem`;
      console.log('Applied font size directly to education section:', `${newRem}rem`);
    }
  };
  const updateCertificationsRem = (newRem) => {
    console.log('Updating certifications rem to:', newRem);
    updateSectionRem('certifications', newRem);
    
    // Apply font size directly to the certifications section
    const certificationsSection = document.querySelector('#certifications');
    if (certificationsSection) {
      certificationsSection.style.fontSize = `${newRem}rem`;
      console.log('Applied font size directly to certifications section:', `${newRem}rem`);
    }
  };

  const updateContactRem = (newRem) => {
    console.log('Updating contact rem to:', newRem);
    updateSectionRem('contact', newRem);
    
    // Apply font size directly to the contact section
    const contactSection = document.querySelector('#contact');
    if (contactSection) {
      contactSection.style.fontSize = `${newRem}rem`;
      console.log('Applied font size directly to contact section:', `${newRem}rem`);
    }
  };

  // Update handlers for edit modals
  const handleUpdateProject = async () => {
    if (!portfolio || !selectedProject) return;
    const projectIndex = portfolio.projects.findIndex(p => p.title === selectedProject.title);
    if (projectIndex === -1) return;
    
    const updatedProjects = [...portfolio.projects];
    updatedProjects[projectIndex] = selectedProject;
    const updated = { ...portfolio, projects: updatedProjects };
    setPortfolio(updated);
    await updatePortfolio(portfolio.ownerId, updated);
    setShowProjectModal(false);
    setSelectedProject(null);
  };

  const handleUpdateExperience = async () => {
    if (!portfolio || !selectedExperience) return;
    const experienceIndex = portfolio.experience.findIndex(e => e.role === selectedExperience.role && e.company === selectedExperience.company);
    if (experienceIndex === -1) return;
    
    const updatedExperience = [...portfolio.experience];
    updatedExperience[experienceIndex] = selectedExperience;
    const updated = { ...portfolio, experience: updatedExperience };
    setPortfolio(updated);
    await updatePortfolio(portfolio.ownerId, updated);
    setShowExperienceModal(false);
    setSelectedExperience(null);
  };

  const handleUpdateEducation = async () => {
    if (!portfolio || !selectedEducation) return;
    const educationIndex = portfolio.education.findIndex(e => e.degree === selectedEducation.degree && e.institution === selectedEducation.institution);
    if (educationIndex === -1) return;
    
    const updatedEducation = [...portfolio.education];
    updatedEducation[educationIndex] = selectedEducation;
    const updated = { ...portfolio, education: updatedEducation };
    setPortfolio(updated);
    await updatePortfolio(portfolio.ownerId, updated);
    setShowEducationModal(false);
    setSelectedEducation(null);
  };

  const handleUpdateCertificate = async () => {
    if (!portfolio || !selectedCertificate) return;
    
    // Use the stored index to update the correct certificate
    const certificateIndex = selectedCertificate._index;
    
    if (certificateIndex === undefined || certificateIndex < 0 || certificateIndex >= portfolio.certifications.length) {
      console.error('Invalid certificate index for update:', certificateIndex);
      return;
    }
    
    console.log('Updating certificate at index:', certificateIndex);
    
    // Remove the _index property before saving
    const certificateToSave = { ...selectedCertificate };
    delete certificateToSave._index;
    
    const updatedCertifications = [...portfolio.certifications];
    updatedCertifications[certificateIndex] = certificateToSave;
    const updated = { ...portfolio, certifications: updatedCertifications };
    
    console.log('Updated certifications:', updatedCertifications);
    
    setPortfolio(updated);
    await updatePortfolio(portfolio.ownerId, updated);
    setShowCertificateModal(false);
    setSelectedCertificate(null);
  };

  // Handle project image upload
  const handleProjectImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !portfolio || !selectedProject) {
      console.log('Missing required data for project upload:', { file: !!file, portfolio: !!portfolio, selectedProject: !!selectedProject });
      return;
    }

    console.log('Uploading project file:', file.name, file.type, file.size);

    // Convert file to ArrayBuffer for raw upload
    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = new Uint8Array(arrayBuffer);

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_API}/softwareeng/${portfolio.ownerId}/project-image`, {
        method: 'POST',
        headers: {
          'Content-Type': file.type,
        },
        body: fileBuffer,
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Project upload successful:', data);
        
        // Update the selected project
        const updatedProject = {...selectedProject, imageUrl: data.imageUrl};
        setSelectedProject(updatedProject);
        
        // Update the portfolio data with the new image URL
        const projectIndex = portfolio.projects.findIndex(p => 
          p.title === selectedProject.title && p.description === selectedProject.description
        );
        
        if (projectIndex !== -1) {
          const updatedProjects = [...portfolio.projects];
          updatedProjects[projectIndex] = updatedProject;
          const updated = { ...portfolio, projects: updatedProjects };
          
          setPortfolio(updated);
          await updatePortfolio(portfolio.ownerId, updated);
          console.log('Portfolio updated with new project image');
        }
        
        // Show success message
        alert('Project image updated successfully!');
      } else {
        const errorText = await response.text();
        console.error('Failed to upload project:', response.status, errorText);
        alert('Failed to update project image. Please try again.');
      }
    } catch (error) {
      console.error('Error uploading project image:', error);
    }
  };

  // Handle certificate image upload
  const handleCertificateImageUpload = async (e) => {
    const file = e.target.files?.[0];
    console.log('Certificate upload triggered:', file);
    
    if (!file || !selectedCertificate || !portfolio) {
      console.log('Missing required data:', { file: !!file, selectedCertificate: !!selectedCertificate, portfolio: !!portfolio });
      return;
    }

    console.log('Uploading certificate file:', file.name, file.type, file.size);

    // Convert file to ArrayBuffer for raw upload
    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = new Uint8Array(arrayBuffer);

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_API}/softwareeng/${portfolio.ownerId}/certificate-image`, {
        method: 'POST',
        headers: {
          'Content-Type': file.type,
        },
        body: fileBuffer,
      });

      console.log('Upload response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Upload successful:', data);
        
        // Update the selected certificate
        const updatedCertificate = {...selectedCertificate, imageUrl: data.imageUrl};
        setSelectedCertificate(updatedCertificate);
        
        // Update the portfolio data with the new image URL
        const certificateIndex = portfolio.certifications.findIndex(c => 
          c.title === selectedCertificate.title && c.year === selectedCertificate.year
        );
        
        if (certificateIndex !== -1) {
          const updatedCertifications = [...portfolio.certifications];
          updatedCertifications[certificateIndex] = updatedCertificate;
          const updated = { ...portfolio, certifications: updatedCertifications };
          
          setPortfolio(updated);
          await updatePortfolio(portfolio.ownerId, updated);
          console.log('Portfolio updated with new certificate image');
        }
        
        // Show success message
        alert('Certificate image updated successfully!');
      } else {
        const errorText = await response.text();
        console.error('Failed to upload certificate:', response.status, errorText);
        alert('Failed to update certificate image. Please try again.');
      }
    } catch (error) {
      console.error('Error uploading certificate image:', error);
    }
  };

  // Handle project image upload for new projects
  const handleNewProjectImageUpload = async (e) => {
    const file = e.target.files?.[0];
    console.log('New project upload triggered:', file);
    
    if (!file || !portfolio) {
      console.log('Missing required data for new project:', { file: !!file, portfolio: !!portfolio });
      return;
    }

    console.log('Uploading new project file:', file.name, file.type, file.size);

    // Convert file to ArrayBuffer for raw upload
    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = new Uint8Array(arrayBuffer);

    try {
              console.log('Sending request to:', `${import.meta.env.VITE_BACKEND_API}/softwareeng/${portfolio.ownerId}/project-image`);
        const response = await fetch(`${import.meta.env.VITE_BACKEND_API}/softwareeng/${portfolio.ownerId}/project-image`, {
        method: 'POST',
        headers: {
          'Content-Type': file.type,
        },
        body: fileBuffer,
      });

      console.log('New project upload response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('New project upload successful:', data);
        setNewProject({...newProject, imageUrl: data.imageUrl});
        console.log('Updated newProject with imageUrl:', data.imageUrl);
        console.log('Full image URL will be:', `${data.imageUrl}`);
        
        // Show success message
        alert('Project image uploaded successfully!');
        
        // The image URL is now saved in newProject state
        // When the user clicks "Add Project", it will be saved to the portfolio
        console.log('Project image ready to be added to portfolio');
      } else {
        const errorText = await response.text();
        console.error('Failed to upload new project:', response.status, errorText);
        alert('Failed to upload project image. Please try again.');
      }
    } catch (error) {
      console.error('Error uploading project image:', error);
    }
  };

  // Handle certificate image upload for new certificates
  const handleNewCertificateImageUpload = async (e) => {
    const file = e.target.files?.[0];
    console.log('New certificate upload triggered:', file);
    
    if (!file || !portfolio) {
      console.log('Missing required data for new certificate:', { file: !!file, portfolio: !!portfolio });
      return;
    }

    console.log('Uploading new certificate file:', file.name, file.type, file.size);

    // Convert file to ArrayBuffer for raw upload
    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = new Uint8Array(arrayBuffer);

    try {
      console.log('Sending request to:', `${import.meta.env.VITE_BACKEND_API}/softwareeng/${portfolio.ownerId}/certificate-image`);
      const response = await fetch(`${import.meta.env.VITE_BACKEND_API}/softwareeng/${portfolio.ownerId}/certificate-image`, {
        method: 'POST',
        headers: {
          'Content-Type': file.type,
        },
        body: fileBuffer,
      });

      console.log('New certificate upload response status:', response.status);
      console.log('Response headers:', response.headers);

      if (response.ok) {
        const data = await response.json();
        console.log('New certificate upload successful:', data);
        setNewCert({...newCert, imageUrl: data.imageUrl});
        console.log('Updated newCert with imageUrl:', data.imageUrl);
        console.log('Full image URL will be:', `${data.imageUrl}`);
        
        // Show success message
        alert('Certificate image uploaded successfully!');
        
        // The image URL is now saved in newCert state
        // When the user clicks "Add Certificate", it will be saved to the portfolio
        console.log('Certificate image ready to be added to portfolio');
      } else {
        const errorText = await response.text();
        console.error('Failed to upload new certificate:', response.status, errorText);
        alert('Failed to upload certificate image. Please try again.');
      }
    } catch (error) {
      console.error('Error uploading new certificate image:', error);
    }
  };

  // Handle project card click to open modal
  const handleProjectClick = (project) => {
    setSelectedProject(project);
    setShowProjectModal(true);
  };

  // Handle project double click to edit
  const handleProjectDoubleClick = (project, field) => {
    startEditing(`projects.${portfolio?.projects.indexOf(project)}.${field}`, project[field]);
  };

  // Handle experience double click to edit
  const handleExperienceDoubleClick = (exp, field) => {
    startEditing(`experience.${portfolio?.experience.indexOf(exp)}.${field}`, exp[field]);
  };

  // Handle education double click to edit
  const handleEducationDoubleClick = (edu, field) => {
    startEditing(`education.${portfolio?.education.indexOf(edu)}.${field}`, edu[field]);
  };

  // Handle skill double click to edit
  const handleSkillDoubleClick = (skill, field) => {
    startEditing(`skills.${portfolio?.skills.indexOf(skill)}.${field}`, skill[field]);
  };

  // Handle certificate double click to edit
  const handleCertificateDoubleClick = (cert, field) => {
    startEditing(`certifications.${portfolio?.certifications.indexOf(cert)}.${field}`, cert[field]);
  };

  // Close project modal
  const closeProjectModal = () => {
    setSelectedProject(null);
    setShowProjectModal(false);
  };

  // Handle skill card click to open modal
  const handleSkillClick = (skill) => {
    setSelectedSkill(skill);
    setShowSkillModal(true);
  };

  // Close skill modal
  const closeSkillModal = () => {
    setSelectedSkill(null);
    setShowSkillModal(false);
  };

  // Handle certificate card click to open modal
  const handleCertificateClick = (cert) => {
    setSelectedCertificate(cert);
    setShowCertificateModal(true);
  };

  // Close certificate modal
  const closeCertificateModal = () => {
    setSelectedCertificate(null);
    setShowCertificateModal(false);
  };

  // Handle experience card click to open modal
  const handleExperienceClick = (exp) => {
    setSelectedExperience(exp);
    setShowExperienceModal(true);
  };

  // Close experience modal
  const closeExperienceModal = () => {
    setSelectedExperience(null);
    setShowExperienceModal(false);
  };

  // Handle education card click to open modal
  const handleEducationClick = (edu) => {
    setSelectedEducation(edu);
    setShowEducationModal(true);
  };

  // Close education modal
  const closeEducationModal = () => {
    setSelectedEducation(null);
    setShowEducationModal(false);
  };

  // Find where a skill is used
  const findSkillUsage = (skillName) => {
    if (!portfolio) return { projects: [], experience: [] };
    
    const projects = portfolio.projects.filter(project => 
      project.techStack.some(tech => 
        tech.toLowerCase().includes(skillName.toLowerCase())
      )
    );
    
    const experience = portfolio.experience.filter(exp => 
      exp.details.toLowerCase().includes(skillName.toLowerCase())
    );
    
    return { projects, experience };
  };

  // Resume upload functions
  const handleResumeFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setResumeUploadError('Please select a PDF file');
        return;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setResumeUploadError('File size must be less than 10MB');
        return;
      }
      setResumeFile(file);
      setResumeUploadError(null);
    }
  };

  const handleResumeUpload = async () => {
    if (!resumeFile) {
      setResumeUploadError('Please select a resume file');
      return;
    }

    try {
      setUploadingResume(true);
      setResumeUploadError(null);

      // Convert file to ArrayBuffer for raw upload
      const arrayBuffer = await resumeFile.arrayBuffer();
      const fileBuffer = new Uint8Array(arrayBuffer);

      const response = await fetch(`${import.meta.env.VITE_BACKEND_API}/softwareeng/${user.ownerId}/resume`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/pdf',
        },
        body: fileBuffer,
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Resume uploaded successfully:', result);
        
        // Update the portfolio with new data
        setPortfolio(result.portfolio);
        
        // Close the upload modal
        setShowResumeUpload(false);
        setResumeFile(null);
        
        // Show success message
        alert('Resume uploaded successfully! Your portfolio has been updated with the extracted information.');
      } else {
        const errorData = await response.json();
        setResumeUploadError(errorData.error || 'Failed to upload resume');
      }
    } catch (error) {
      console.error('❌ Resume upload error:', error);
      setResumeUploadError('Network error. Please try again.');
    } finally {
      setUploadingResume(false);
    }
  };

  const openResumeUpload = () => {
    setShowResumeUpload(true);
    setResumeFile(null);
    setResumeUploadError(null);
  };

  const closeResumeUpload = () => {
    setShowResumeUpload(false);
    setResumeFile(null);
    setResumeUploadError(null);
  };

  // Load portfolio data
  useEffect(() => {
    const loadPortfolio = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Loading portfolio for ownerId: admin@test.com');
        const portfolioData = await fetchPortfolio('admin@test.com');
        console.log('Portfolio loaded:', portfolioData);
        console.log('Portfolio ownerId:', portfolioData.ownerId);
        setPortfolio(portfolioData);
        setIsAdmin(true);
      } catch (err) {
        console.error('Error loading portfolio:', err);
        setError(err.message || 'Failed to load portfolio');
      } finally {
        setLoading(false);
      }
    };

    loadPortfolio();
  }, []);

  // Update CSS variables when portfolio changes
  useEffect(() => {
    if (portfolio && portfolio.uiSettings) {
      const root = document.documentElement;
      
      // Update base rem
      if (portfolio.uiSettings.baseRem) {
        root.style.setProperty('--base-rem', portfolio.uiSettings.baseRem);
      }
      
      // Update section rems
      if (portfolio.uiSettings.sectionRem) {
        Object.entries(portfolio.uiSettings.sectionRem).forEach(([section, rem]) => {
          root.style.setProperty(`--${section}-rem`, rem);
        });
      }
    }
  }, [portfolio]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading portfolio...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error Loading Portfolio</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="retry-btn">
          Retry
        </button>
        <button onClick={logout} className="logout-btn">
          Logout
        </button>
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="no-portfolio-container">
        <h2>No Portfolio Found</h2>
        <p>This user doesn't have a portfolio yet.</p>
        <button onClick={logout} className="logout-btn">
          Logout
        </button>
      </div>
    );
  }

      return (
      <Layout 
        user={{ role: 'admin' }} 
        logout={() => {}} 
        isAdmin={isAdmin}
        onOpenNavModal={handleOpenNavModal}
        sections={sections}
      >
        {/* Fixed Navigation Bar - Stays at top when scrolling */}
        <nav className="portfolio-fixed-navigation" style={{
          position: 'fixed',
          top: '80px',
          left: '0',
          right: '0',
          zIndex: 1000,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '1rem',
          padding: '1rem',
          background: 'rgba(0, 0, 0, 0.95)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(0, 173, 181, 0.3)',
          flexWrap: 'wrap',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
        }}>
          {sections.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              onClick={(e) => {
                e.preventDefault();
                const element = document.getElementById(section.id);
                if (element) {
                  element.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                  });
                }
              }}
              style={{
                padding: '0.75rem 1.5rem',
                background: 'rgba(0, 173, 181, 0.1)',
                color: '#00adb5',
                textDecoration: 'none',
                borderRadius: '8px',
                border: '1px solid rgba(0, 173, 181, 0.3)',
                transition: 'all 0.3s ease',
                fontWeight: '500',
                fontSize: '0.95rem',
                whiteSpace: 'nowrap',
                cursor: 'pointer'
              }}
              onMouseOver={(e) => {
                e.target.style.background = 'rgba(0, 173, 181, 0.2)';
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 20px rgba(0, 173, 181, 0.3)';
              }}
              onMouseOut={(e) => {
                e.target.style.background = 'rgba(0, 173, 181, 0.1)';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              {section.label}
            </a>
          ))}
        </nav>

        <div className="admin-dashboard" style={{ paddingTop: '120px' }}>
        {/* Header with name and subtitle */}
        <header className="portfolio-header">
          <div className="header-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', marginTop: '2rem' }}>
            <div className="header-title" style={{ textAlign: 'center' }}>
              {editingField === 'profile.name' ? (
                <div className="edit-field" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    style={{ 
                      fontSize: '2rem', 
                      fontWeight: 'bold',
                      background: 'transparent',
                      border: '1px solid #00adb5',
                      color: '#ffffff',
                      padding: '0.5rem',
                      borderRadius: '4px',
                      textAlign: 'center'
                    }}
                  />
                  <button 
                    onClick={() => saveEdit('profile.name')}
                    style={{ 
                      background: '#00adb5', 
                      border: 'none', 
                      color: 'white', 
                      padding: '0.5rem 1rem', 
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Save
                  </button>
                  <button 
                    onClick={cancelEdit}
                    style={{ 
                      background: 'transparent', 
                      border: '1px solid #00adb5', 
                      color: '#00adb5', 
                      padding: '0.5rem 1rem', 
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                  <h1 
                    onDoubleClick={() => isAdmin && startEditing('profile.name', portfolio.profile.name)}
                    style={{ cursor: isAdmin ? 'pointer' : 'default', margin: 0 }}
                    title={isAdmin ? "Double-click to edit name" : ""}
                  >
                    {portfolio.profile.name}
                  </h1>
                  {isAdmin && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <button 
                        onClick={() => startEditing('profile.name', portfolio.profile.name)}
                        style={{ 
                          background: 'transparent', 
                          border: '1px solid #00adb5', 
                          color: '#00adb5', 
                          padding: '4px 8px', 
                          borderRadius: '4px',
                          fontSize: '1rem',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease'
                        }}
                        title="Edit Name"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete('profile.name')}
                        style={{
                          background: 'transparent',
                          border: '1px solid #00adb5',
                          color: '#00adb5',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '1rem',
                          cursor: 'pointer',
                          fontWeight: 'bold',
                          transition: 'all 0.3s ease'
                        }}
                        title="Delete Name"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              )}
              {editingField === 'profile.subtitle' ? (
                <div className="edit-field" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center', marginTop: '0.5rem' }}>
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    style={{ 
                      fontSize: '1.2rem', 
                      background: 'transparent',
                      border: '1px solid #00adb5',
                      color: '#cccccc',
                      padding: '0.3rem',
                      borderRadius: '4px',
                      textAlign: 'center'
                    }}
                  />
                  <button 
                    onClick={() => saveEdit('profile.subtitle')}
                    style={{ 
                      background: '#00adb5', 
                      border: 'none', 
                      color: 'white', 
                      padding: '0.3rem 0.8rem', 
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.9rem'
                    }}
                  >
                    Save
                  </button>
                  <button 
                    onClick={cancelEdit}
                    style={{ 
                      background: 'transparent', 
                      border: '1px solid #00adb5', 
                      color: '#00adb5', 
                      padding: '0.3rem 0.8rem', 
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.9rem'
                    }}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center', marginTop: '0.5rem' }}>
                  <h2 
                    onDoubleClick={() => isAdmin && startEditing('profile.subtitle', portfolio.profile.subtitle || 'A Software Engineer\'s Portfolio')}
                    style={{ cursor: isAdmin ? 'pointer' : 'default', margin: 0 }}
                    title={isAdmin ? "Double-click to edit subtitle" : ""}
                  >
                    {portfolio.profile.subtitle || 'A Software Engineer\'s Portfolio'}
                  </h2>
                  {isAdmin && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <button 
                        onClick={() => startEditing('profile.subtitle', portfolio.profile.subtitle || 'A Software Engineer\'s Portfolio')}
                        style={{ 
                          background: 'transparent', 
                          border: '1px solid #00adb5', 
                          color: '#00adb5', 
                          padding: '4px 8px', 
                          borderRadius: '4px',
                          fontSize: '1rem',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease'
                        }}
                        title="Edit Subtitle"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete('profile.subtitle')}
                        style={{
                          background: 'transparent',
                          border: '1px solid #00adb5',
                          color: '#00adb5',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '1rem',
                          cursor: 'pointer',
                          fontWeight: 'bold',
                          transition: 'all 0.3s ease'
                        }}
                        title="Delete Subtitle"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Resume Upload Section for Admin */}
        {isAdmin && (
          <div style={{ 
            background: 'rgba(0, 0, 0, 0.3)', 
            padding: '1rem', 
            borderRadius: '8px', 
            marginBottom: '2rem',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            textAlign: 'center'
          }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#00adb5' }}>📄 Resume Upload</h3>
            <p style={{ margin: '0 0 1rem 0', color: '#cccccc', fontSize: '0.9rem' }}>
              Upload your resume (PDF) to automatically extract and update your portfolio information
            </p>
            <div style={{ textAlign: 'center' }}>
              <button
                onClick={openResumeUpload}
                style={{
                  background: '#00adb5',
                  border: 'none',
                  color: 'white',
                  padding: '0.8rem 1.5rem',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => e.target.style.background = '#00848a'}
                onMouseOut={(e) => e.target.style.background = '#00adb5'}
              >
                📄 Upload Resume
              </button>
            </div>
          </div>
        )}

        {/* Resume Upload Modal */}
        {showResumeUpload && (
          <div className="modal-overlay" onClick={closeResumeUpload}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={closeResumeUpload}>×</button>
              <div className="modal-header">
                <h2>📄 Upload Resume</h2>
              </div>
              <div className="modal-body">
                <div style={{ marginBottom: '1rem' }}>
                  <p style={{ color: '#cccccc', marginBottom: '1rem' }}>
                    Select a PDF resume file. The system will automatically extract information and update your portfolio.
                  </p>
                  
                  <input
                    ref={resumeInputRef}
                    type="file"
                    accept=".pdf"
                    onChange={handleResumeFileSelect}
                    style={{ display: 'none' }}
                  />
                  
                  <button
                    onClick={() => resumeInputRef.current?.click()}
                    style={{
                      background: 'transparent',
                      border: '2px dashed #00adb5',
                      color: '#00adb5',
                      padding: '1rem',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      width: '100%',
                      fontSize: '1rem',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseOver={(e) => e.target.style.background = 'rgba(0, 173, 181, 0.1)'}
                    onMouseOut={(e) => e.target.style.background = 'transparent'}
                  >
                    {resumeFile ? `Selected: ${resumeFile.name}` : '📄 Choose PDF File'}
                  </button>
                  
                  {resumeUploadError && (
                    <p style={{ color: '#ff6b6b', marginTop: '0.5rem', fontSize: '0.9rem' }}>
                      ❌ {resumeUploadError}
                    </p>
                  )}
                  
                  {resumeFile && (
                    <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                      <button
                        onClick={handleResumeUpload}
                        disabled={uploadingResume}
                        style={{
                          background: uploadingResume ? '#666' : '#00adb5',
                          border: 'none',
                          color: 'white',
                          padding: '0.8rem 1.5rem',
                          borderRadius: '6px',
                          cursor: uploadingResume ? 'not-allowed' : 'pointer',
                          fontSize: '1rem',
                          fontWeight: 'bold',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        {uploadingResume ? '⏳ Uploading...' : '🚀 Upload & Extract'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Base REM Control for Admin */}
        {isAdmin && (
          <div style={{ 
            background: 'rgba(0, 0, 0, 0.3)', 
            padding: '1rem', 
            borderRadius: '8px', 
            marginBottom: '2rem',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            textAlign: 'center'
          }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#00adb5' }}>Global Font Size Control</h3>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
              <label style={{ fontSize: '1rem', color: '#ffffff' }}>Base Font Size:</label>
                <input
                  type="range"
                  min="0.8"
                  max="1.5"
                  step="0.1"
                  value={portfolio?.uiSettings?.baseRem || 1.1}
                  onChange={(e) => updateBaseRem(parseFloat(e.target.value))}
                style={{ width: '120px' }}
                />
              <span style={{ fontSize: '1rem', color: '#00adb5', minWidth: '40px', fontWeight: 'bold' }}>
                {portfolio?.uiSettings?.baseRem || 1.1}
              </span>
              </div>
            <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem', color: '#cccccc' }}>
              Adjust this to change font size for all sections at once
            </p>
          </div>
        )}

        {/* Welcome Section (now just tagline/about) */}
        <section className="section" id="welcome">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: '1rem' }}>
            <h2 style={{ margin: 0 }}>About</h2>
            {isAdmin && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {/* Fine-tune Control */}
                <div className="section-rem-control" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.9rem', color: '#00adb5' }}>Fine-tune:</label>
                <input
                  type="range"
                  min="0.8"
                  max="1.5"
                  step="0.1"
                  value={portfolio?.uiSettings?.sectionRem?.about || 1.1}
                  onChange={(e) => updateAboutRem(parseFloat(e.target.value))}
                    style={{ width: '80px' }}
                />
                  <span style={{ fontSize: '0.8rem', color: '#00adb5', minWidth: '30px' }}>{portfolio?.uiSettings?.sectionRem?.about || 1.1}</span>
              </div>
                {/* Edit Icon */}
              <button 
                onClick={() => startEditing('profile.bio', portfolio.profile.bio)}
                style={{ 
                  background: 'transparent', 
                  border: '1px solid #00adb5', 
                  color: '#00adb5', 
                  padding: '4px 8px', 
                  borderRadius: '4px',
                  fontSize: '1rem',
                  cursor: 'pointer'
                }}
                title="Edit About"
              >
                ✏️
              </button>
                {/* Delete Icon */}
                <button
                  onClick={() => handleDelete('profile.bio')}
                  style={{
                    background: 'transparent',
                    border: '1px solid #00adb5',
                    color: '#00adb5',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '1rem',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                  title="Delete About"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
          <div className="about-card clickable">
            <div className="about-content">
              {editingField === 'profile.bio' ? (
                <div className="edit-field">
                  <textarea
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    style={{ fontSize: '1rem', width: '100%', minHeight: '100px' }}
                  />
                  <button onClick={() => saveEdit('profile.bio')}>Save</button>
                  <button onClick={cancelEdit}>Cancel</button>
                </div>
              ) : (
                <p onDoubleClick={() => isAdmin && startEditing('profile.bio', portfolio.profile.bio)}>
                  {portfolio.profile.bio}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Skills Section */}
        <section className="section" id="skills">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: '1rem' }}>
            <h2 style={{ margin: 0 }}>Skills</h2>
            {isAdmin && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {/* Fine-tune Control */}
                <div className="section-rem-control" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.9rem', color: '#00adb5' }}>Fine-tune:</label>
                  <input
                    type="range"
                    min="0.8"
                    max="1.5"
                    step="0.1"
                    value={portfolio?.uiSettings?.sectionRem?.skills || 1.1}
                    onChange={(e) => {
                      console.log('Skills slider changed to:', e.target.value);
                      updateSkillsRem(parseFloat(e.target.value));
                    }}
                    style={{ width: '80px' }}
                  />
                  <span style={{ fontSize: '0.8rem', color: '#00adb5', minWidth: '30px' }}>{portfolio?.uiSettings?.sectionRem?.skills || 1.1}</span>
                </div>
                {/* Add Skill Button */}
              <button 
                onClick={() => setAddSkill(true)}
                style={{ 
                  background: 'transparent', 
                  border: '1px solid #00adb5', 
                  color: '#00adb5', 
                  padding: '4px 8px', 
                  borderRadius: '4px',
                  fontSize: '1rem',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                }}
                title="Add Skill"
              >
                +
              </button>
              </div>
            )}
          </div>
          <div className="skills">
            {portfolio.skills.map((skill, index) => (
              <div 
                key={index} 
                className="skill-item clickable" 
                onClick={() => handleSkillClick(skill)}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  background: 'rgba(0, 173, 181, 0.1)',
                  border: '1px solid rgba(0, 173, 181, 0.3)',
                  marginBottom: '0.5rem',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(0, 173, 181, 0.2)';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(0, 173, 181, 0.1)';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#00adb5' }}>
                    {typeof skill === 'string' ? skill : skill.name}
                  </span>
                  {typeof skill !== 'string' && skill.level && (
                    <span style={{ 
                      fontSize: '0.8rem', 
                      color: '#ffffff', 
                      background: '#00adb5',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontWeight: '500'
                    }}>
                      {skill.level}
                    </span>
                  )}
                </div>
                {isAdmin && (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSkill(index);
                      }}
                      style={{ 
                        background: 'transparent', 
                        border: '1px solid #00adb5', 
                        color: '#00adb5', 
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                      }}
                      title="Delete Skill"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Projects Section */}
        <section className="section" id="projects">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: '1rem' }}>
            <h2 style={{ margin: 0 }}>Projects</h2>
            {isAdmin && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {/* Fine-tune Control */}
                <div className="section-rem-control" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.9rem', color: '#00adb5' }}>Fine-tune:</label>
                  <input
                    type="range"
                    min="0.8"
                    max="1.5"
                    step="0.1"
                    value={portfolio?.uiSettings?.sectionRem?.projects || 1.1}
                    onChange={(e) => updateProjectsRem(parseFloat(e.target.value))}
                    style={{ width: '80px' }}
                  />
                  <span style={{ fontSize: '0.8rem', color: '#00adb5', minWidth: '30px' }}>{portfolio?.uiSettings?.sectionRem?.projects || 1.1}</span>
                </div>
                {/* Add Project Button */}
              <button 
                onClick={() => setAddProject(true)}
                style={{ 
                  background: 'transparent', 
                  border: '1px solid #00adb5', 
                  color: '#00adb5', 
                  padding: '4px 8px', 
                  borderRadius: '4px',
                  fontSize: '1rem',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                }}
                title="Add Project"
              >
                +
              </button>
              </div>
            )}
          </div>
          <div className="projects">
            {portfolio.projects.map((project, index) => (
              <div key={index} className="project-card clickable" onClick={() => handleProjectClick(project)}>
                <div className="project-content">
                  <div className="project-header">
                    <h3 className="project-title" onDoubleClick={() => isAdmin && handleProjectDoubleClick(project, 'title')}>
                      {editingField === `projects.${index}.title` ? (
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && saveEdit(`projects.${index}.title`)}
                          style={{ fontSize: '1rem', width: '100%' }}
                        />
                      ) : (
                        project.title
                      )}
                    </h3>
                    {isAdmin && (
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedProject(project);
                            setShowProjectModal(true);
                          }}
                        style={{ 
                          background: 'transparent', 
                          border: '1px solid #00adb5', 
                          color: '#00adb5', 
                          padding: '4px 8px', 
                          borderRadius: '4px',
                          fontSize: '1rem',
                          cursor: 'pointer'
                        }}
                          title="Edit Project"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteProject(index);
                          }}
                          style={{
                            background: 'transparent',
                            border: '1px solid #00adb5',
                            color: '#00adb5',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '1rem',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                          }}
                        title="Delete Project"
                      >
                        ✕
                      </button>
                      </div>
                    )}
                  </div>
                  <p className="project-description" onDoubleClick={() => isAdmin && handleProjectDoubleClick(project, 'description')}>
                    {editingField === `projects.${index}.description` ? (
                      <textarea
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        style={{ fontSize: '1rem', width: '100%', minHeight: '60px' }}
                      />
                    ) : (
                      project.description
                    )}
                  </p>
                  <div className="project-links">
                    {project.repoUrl && (
                      <a href={project.repoUrl} target="_blank" rel="noopener noreferrer" className="project-link">
                        GitHub
                      </a>
                    )}
                    {project.demoUrl && (
                      <a href={project.demoUrl} target="_blank" rel="noopener noreferrer" className="project-link">
                        Live Demo
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Experience Section */}
        <section className="section" id="experience">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: '1rem' }}>
            <h2 style={{ margin: 0 }}>Experience</h2>
            {isAdmin && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {/* Fine-tune Control */}
                <div className="section-rem-control" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.9rem', color: '#00adb5' }}>Fine-tune:</label>
                  <input
                    type="range"
                    min="0.8"
                    max="1.5"
                    step="0.1"
                    value={portfolio?.uiSettings?.sectionRem?.experience || 1.1}
                    onChange={(e) => updateExperienceRem(parseFloat(e.target.value))}
                    style={{ width: '80px' }}
                  />
                  <span style={{ fontSize: '0.8rem', color: '#00adb5', minWidth: '30px' }}>{portfolio?.uiSettings?.sectionRem?.experience || 1.1}</span>
                </div>
                {/* Add Experience Button */}
              <button 
                onClick={() => setAddExperience(true)}
                style={{ 
                  background: 'transparent', 
                  border: '1px solid #00adb5', 
                  color: '#00adb5', 
                  padding: '4px 8px', 
                  borderRadius: '4px',
                  fontSize: '1rem',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                }}
                title="Add Experience"
              >
                +
              </button>
              </div>
            )}
          </div>
          <div className="experience">
            {portfolio.experience.map((exp, index) => (
              <div key={index} className="experience-card clickable" onClick={() => handleExperienceClick(exp)}>
                <div className="experience-content">
                  <h3 className="experience-title" onDoubleClick={() => isAdmin && handleExperienceDoubleClick(exp, 'role')}>
                    {editingField === `experience.${index}.role` ? (
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && saveEdit(`experience.${index}.role`)}
                        style={{ fontSize: '1rem', width: '100%' }}
                      />
                    ) : (
                      exp.role
                    )}
                  </h3>
                  <span className="experience-company-name" onDoubleClick={() => isAdmin && handleExperienceDoubleClick(exp, 'company')}>
                    {editingField === `experience.${index}.company` ? (
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && saveEdit(`experience.${index}.company`)}
                        style={{ fontSize: '1rem', width: '100%' }}
                      />
                    ) : (
                      exp.company
                    )}
                  </span>
                  <span className="experience-duration-text" onDoubleClick={() => isAdmin && handleExperienceDoubleClick(exp, 'duration')}>
                    {editingField === `experience.${index}.duration` ? (
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && saveEdit(`experience.${index}.duration`)}
                        style={{ fontSize: '1rem', width: '100%' }}
                      />
                    ) : (
                      exp.duration
                    )}
                  </span>
                  <p className="experience-details-text" onDoubleClick={() => isAdmin && handleExperienceDoubleClick(exp, 'details')}>
                    {editingField === `experience.${index}.details` ? (
                      <textarea
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        style={{ fontSize: '1rem', width: '100%', minHeight: '60px' }}
                      />
                    ) : (
                      exp.details
                    )}
                  </p>
                  {isAdmin && (
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedExperience(exp);
                          setShowExperienceModal(true);
                        }}
                      style={{ 
                        background: 'transparent', 
                        border: '1px solid #00adb5', 
                        color: '#00adb5', 
                        padding: '4px 8px', 
                        borderRadius: '4px',
                        fontSize: '1rem',
                        cursor: 'pointer'
                      }}
                        title="Edit Experience"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteExperience(index);
                        }}
                        style={{
                          background: 'transparent',
                          border: '1px solid #00adb5',
                          color: '#00adb5',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '1rem',
                          cursor: 'pointer',
                          fontWeight: 'bold'
                        }}
                      title="Delete Experience"
                    >
                      ✕
                    </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Education Section */}
        <section className="section" id="education">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: '1rem' }}>
            <h2 style={{ margin: 0 }}>Education</h2>
            {isAdmin && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {/* Fine-tune Control */}
                <div className="section-rem-control" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.9rem', color: '#00adb5' }}>Fine-tune:</label>
                  <input
                    type="range"
                    min="0.8"
                    max="1.5"
                    step="0.1"
                    value={portfolio?.uiSettings?.sectionRem?.education || 1.1}
                    onChange={(e) => updateEducationRem(parseFloat(e.target.value))}
                    style={{ width: '80px' }}
                  />
                  <span style={{ fontSize: '0.8rem', color: '#00adb5', minWidth: '30px' }}>{portfolio?.uiSettings?.sectionRem?.education || 1.1}</span>
                </div>
                {/* Add Education Button */}
              <button 
                onClick={() => setAddEducation(true)}
                style={{ 
                  background: 'transparent', 
                  border: '1px solid #00adb5', 
                  color: '#00adb5', 
                  padding: '4px 8px', 
                  borderRadius: '4px',
                  fontSize: '1rem',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                }}
                title="Add Education"
              >
                +
              </button>
              </div>
            )}
          </div>
          <div className="education">
            {portfolio.education.map((edu, index) => (
              <div key={index} className="education-card clickable" onClick={() => handleEducationClick(edu)}>
                <div className="education-content">
                  <h3 className="education-degree-title" onDoubleClick={() => isAdmin && handleEducationDoubleClick(edu, 'degree')}>
                    {editingField === `education.${index}.degree` ? (
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && saveEdit(`education.${index}.degree`)}
                        style={{ fontSize: '1rem', width: '100%' }}
                      />
                    ) : (
                      edu.degree
                    )}
                  </h3>
                  <span className="education-institution-name" onDoubleClick={() => isAdmin && handleEducationDoubleClick(edu, 'institution')}>
                    {editingField === `education.${index}.institution` ? (
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && saveEdit(`education.${index}.institution`)}
                        style={{ fontSize: '1rem', width: '100%' }}
                      />
                    ) : (
                      edu.institution
                    )}
                  </span>
                  <span className="education-year-text" onDoubleClick={() => isAdmin && handleEducationDoubleClick(edu, 'year')}>
                    {editingField === `education.${index}.year` ? (
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && saveEdit(`education.${index}.year`)}
                        style={{ fontSize: '1rem', width: '100%' }}
                      />
                    ) : (
                      edu.year
                    )}
                  </span>
                  {isAdmin && (
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEducation(edu);
                          setShowEducationModal(true);
                        }}
                      style={{ 
                        background: 'transparent', 
                        border: '1px solid #00adb5', 
                        color: '#00adb5', 
                        padding: '4px 8px', 
                        borderRadius: '4px',
                        fontSize: '1rem',
                        cursor: 'pointer'
                      }}
                        title="Edit Education"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteEducation(index);
                        }}
                        style={{
                          background: 'transparent',
                          border: '1px solid #00adb5',
                          color: '#00adb5',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '1rem',
                          cursor: 'pointer',
                          fontWeight: 'bold'
                        }}
                      title="Delete Education"
                    >
                      ✕
                    </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Certifications Section */}
        <section className="section" id="certifications">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: '1rem' }}>
            <h2 style={{ margin: 0 }}>Certifications</h2>
            {isAdmin && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {/* Fine-tune Control */}
                <div className="section-rem-control" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.9rem', color: '#00adb5' }}>Fine-tune:</label>
                  <input
                    type="range"
                    min="0.8"
                    max="1.5"
                    step="0.1"
                    value={portfolio?.uiSettings?.sectionRem?.certifications || 1.1}
                    onChange={(e) => updateCertificationsRem(parseFloat(e.target.value))}
                    style={{ width: '80px' }}
                  />
                  <span style={{ fontSize: '0.8rem', color: '#00adb5', minWidth: '30px' }}>{portfolio?.uiSettings?.sectionRem?.certifications || 1.1}</span>
                </div>
                {/* Add Certificate Button */}
              <button 
                onClick={() => setAddCert(true)}
                style={{ 
                  background: 'transparent', 
                  border: '1px solid #00adb5', 
                  color: '#00adb5', 
                  padding: '4px 8px', 
                  borderRadius: '4px',
                  fontSize: '1rem',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                }}
                title="Add Certificate"
              >
                +
              </button>
              </div>
            )}
          </div>
          <div className="certifications">
            {portfolio.certifications.map((cert, index) => (
              <div key={index} className="certification-card clickable" onClick={() => handleCertificateClick(cert)}>
                {cert.imageUrl && (
                  <div className="certification-image-container">
                    <div className="certification-image">
                                        {cert.imageUrl.toLowerCase().includes('pdf') || cert.imageUrl.toLowerCase().includes('raw') ? (
                        <div style={{
                        width: '100%',
                          height: '120px',
                        borderRadius: '8px',
                        overflow: 'hidden',
                          position: 'relative',
                          background: 'white',
                          border: '1px solid rgba(0, 173, 181, 0.3)',
                          cursor: 'pointer'
                      }}>
                        <iframe
                            src={`${getFullUploadUrl(cert.imageUrl)}#toolbar=0&navpanes=0&scrollbar=0&view=FitH&page=1`}
                          style={{
                            width: '100%',
                            height: '100%',
                            border: 'none',
                              borderRadius: '8px',
                            pointerEvents: 'none'
                          }}
                            title={`Certificate Preview - ${cert.title}`}
                            onError={(e) => {
                              console.error('PDF preview failed to load:', e);
                            }}
                        />
                        <div style={{
                          position: 'absolute',
                            top: '5px',
                            right: '5px',
                          background: 'rgba(0, 173, 181, 0.9)',
                          color: 'white',
                            padding: '2px 6px',
                          borderRadius: '4px',
                            fontSize: '10px',
                          fontWeight: 'bold'
                        }}>
                          PDF
                        </div>
                        <div style={{
                          position: 'absolute',
                            bottom: '5px',
                            left: '5px',
                          background: 'rgba(0, 0, 0, 0.7)',
                          color: 'white',
                            padding: '2px 6px',
                          borderRadius: '4px',
                            fontSize: '10px'
                        }}>
                          Click to View Full
                        </div>
                      </div>
                    ) : (
                        <img src={`${getFullUploadUrl(cert.imageUrl)}`} alt={cert.title} />
                      )}
                    </div>
                  </div>
                )}
                <div className="certification-content">
                  <h3 className="certification-title-text" onDoubleClick={() => isAdmin && handleCertificateDoubleClick(cert, 'title')}>
                    {editingField === `certifications.${index}.title` ? (
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && saveEdit(`certifications.${index}.title`)}
                        style={{ fontSize: '1rem', width: '100%' }}
                      />
                    ) : (
                      cert.title
                    )}
                  </h3>
                  <span className="certification-year-text" onDoubleClick={() => isAdmin && handleCertificateDoubleClick(cert, 'year')}>
                    {editingField === `certifications.${index}.year` ? (
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && saveEdit(`certifications.${index}.year`)}
                        style={{ fontSize: '1rem', width: '100%' }}
                      />
                    ) : (
                      cert.year
                    )}
                  </span>
                  {isAdmin && (
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCertificate({...cert, _index: index});
                          setShowCertificateModal(true);
                        }}
                      style={{ 
                        background: 'transparent', 
                        border: '1px solid #00adb5', 
                        color: '#00adb5', 
                        padding: '4px 8px', 
                        borderRadius: '4px',
                        fontSize: '1rem',
                        cursor: 'pointer'
                      }}
                        title="Edit Certificate"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCert(index);
                        }}
                        style={{
                          background: 'transparent',
                          border: '1px solid #00adb5',
                          color: '#00adb5',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '1rem',
                          cursor: 'pointer',
                          fontWeight: 'bold'
                        }}
                      title="Delete Certificate"
                    >
                      ✕
                    </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Contact Section */}
        <section className="section" id="contact">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: '1rem' }}>
            <h2 style={{ margin: 0 }}>Contact</h2>
            {isAdmin && (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  onClick={() => startEditing('profile.email', portfolio.profile?.email || '')}
                  style={{ 
                    background: 'transparent', 
                    border: '1px solid #00adb5', 
                    color: '#00adb5', 
                    padding: '4px 8px', 
                    borderRadius: '4px',
                    fontSize: '1rem',
                    cursor: 'pointer'
                  }}
                  title="Edit Contact"
                >
                  ✏️
                </button>
                <button 
                  onClick={() => {
                    if (confirm('Are you sure you want to clear all contact information?')) {
                      const updatedPortfolio = { ...portfolio };
                      updatedPortfolio.profile.email = '';
                      updatedPortfolio.profile.github = '';
                      updatedPortfolio.profile.linkedin = '';
                      updatedPortfolio.profile.location = '';
                      setPortfolio(updatedPortfolio);
                      updatePortfolio(portfolio.ownerId || 'admin@test.com', updatedPortfolio);
                    }
                  }}
                  style={{ 
                    background: 'transparent', 
                    border: '1px solid #00adb5', 
                    color: '#00adb5', 
                    padding: '4px 8px', 
                    borderRadius: '4px',
                    fontSize: '1rem',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                  title="Clear Contact Information"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
          <div className="contact-card" style={{
            background: 'rgba(0, 0, 0, 0.3)',
            padding: '2rem',
            borderRadius: '12px',
            border: '1px solid rgba(0, 173, 181, 0.3)',
            textAlign: 'center'
          }}>
            <div className="contact-content">
              <div>
                <h3 style={{ color: '#00adb5', marginBottom: '1rem' }}>Get In Touch</h3>
                <p style={{ marginBottom: '1.5rem', color: '#cccccc' }}>
                  I'm always open to discussing new opportunities, interesting projects, or just having a chat about technology!
                </p>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
                  {/* Email */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ color: '#00adb5', fontSize: '1.2rem' }}>📧</span>
                    {editingField === 'profile.email' ? (
                      <input
                        type="email"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && saveEdit('profile.email')}
                        style={{ 
                          fontSize: '1rem', 
                          background: 'transparent',
                          border: '1px solid #00adb5',
                          color: '#00adb5',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          width: '200px'
                        }}
                      />
                    ) : (
                      <a 
                        href={`mailto:${portfolio.profile.email}`}
                        style={{ 
                          color: '#00adb5', 
                          textDecoration: 'none',
                          fontSize: '1rem'
                        }}
                        onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                        onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                        onDoubleClick={() => isAdmin && startEditing('profile.email', portfolio.profile.email)}
                      >
                        {portfolio.profile.email}
                      </a>
                    )}
                  </div>
                  
                  {/* GitHub */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ color: '#00adb5', fontSize: '1.2rem' }}>🐙</span>
                    {editingField === 'profile.github' ? (
                      <input
                        type="url"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && saveEdit('profile.github')}
                        style={{ 
                          fontSize: '1rem', 
                          background: 'transparent',
                          border: '1px solid #00adb5',
                          color: '#00adb5',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          width: '200px'
                        }}
                        placeholder="Enter GitHub URL"
                      />
                    ) : (
                      portfolio.profile.github ? (
                        <a 
                          href={portfolio.profile.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ 
                            color: '#00adb5', 
                            textDecoration: 'none',
                            fontSize: '1rem'
                          }}
                          onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                          onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                          onDoubleClick={() => isAdmin && startEditing('profile.github', portfolio.profile.github)}
                        >
                          GitHub Profile
                        </a>
                      ) : (
                        <span 
                          style={{ 
                            color: '#cccccc', 
                            fontSize: '1rem', 
                            fontStyle: 'italic',
                            cursor: isAdmin ? 'pointer' : 'default'
                          }}
                          onDoubleClick={() => isAdmin && startEditing('profile.github', '')}
                        >
                          No GitHub profile added
                        </span>
                      )
                    )}
                  </div>
                  
                  {/* LinkedIn */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ color: '#00adb5', fontSize: '1.2rem' }}>💼</span>
                    {editingField === 'profile.linkedin' ? (
                      <input
                        type="url"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && saveEdit('profile.linkedin')}
                        style={{ 
                          fontSize: '1rem', 
                          background: 'transparent',
                          border: '1px solid #00adb5',
                          color: '#00adb5',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          width: '200px'
                        }}
                        placeholder="Enter LinkedIn URL"
                      />
                    ) : (
                      portfolio.profile.linkedin ? (
                        <a 
                          href={portfolio.profile.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ 
                            color: '#00adb5', 
                            textDecoration: 'none',
                            fontSize: '1rem'
                          }}
                          onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                          onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                          onDoubleClick={() => isAdmin && startEditing('profile.linkedin', portfolio.profile.linkedin)}
                        >
                          LinkedIn Profile
                        </a>
                      ) : (
                        <span 
                          style={{ 
                            color: '#cccccc', 
                            fontSize: '1rem', 
                            fontStyle: 'italic',
                            cursor: isAdmin ? 'pointer' : 'default'
                          }}
                          onDoubleClick={() => isAdmin && startEditing('profile.linkedin', '')}
                        >
                          No LinkedIn profile added
                        </span>
                      )
                    )}
                  </div>
                  
                  {/* Location */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ color: '#00adb5', fontSize: '1.2rem' }}>📍</span>
                    {editingField === 'profile.location' ? (
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && saveEdit('profile.location')}
                        style={{ 
                          fontSize: '1rem', 
                          background: 'transparent',
                          border: '1px solid #00adb5',
                          color: '#00adb5',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          width: '200px'
                        }}
                        placeholder="Enter location"
                      />
                    ) : (
                      portfolio.profile.location ? (
                        <span 
                          style={{ 
                            color: '#cccccc', 
                            fontSize: '1rem',
                            cursor: isAdmin ? 'pointer' : 'default'
                          }}
                          onDoubleClick={() => isAdmin && startEditing('profile.location', portfolio.profile.location)}
                        >
                          {portfolio.profile.location}
                        </span>
                      ) : (
                        <span 
                          style={{ 
                            color: '#cccccc', 
                            fontSize: '1rem', 
                            fontStyle: 'italic',
                            cursor: isAdmin ? 'pointer' : 'default'
                          }}
                          onDoubleClick={() => isAdmin && startEditing('profile.location', '')}
                        >
                          No location added
                        </span>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Dynamic Custom Sections */}
        {sections
          .filter(section => !['welcome', 'skills', 'projects', 'experience', 'education', 'certifications', 'contact'].includes(section.id))
          .map((section) => (
            <section key={section.id} className="section" id={section.id}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: '1rem' }}>
                <h2 style={{ margin: 0 }}>{section.label}</h2>
                {isAdmin && (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {/* REM Control for Custom Sections */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <span style={{ fontSize: '0.8rem', color: '#00adb5' }}>REM:</span>
                      <input
                        type="range"
                        min="0.5"
                        max="2"
                        step="0.1"
                        value={portfolio.uiSettings?.sectionRem?.[section.id] || 1}
                        onChange={(e) => updateSectionRem(section.id, parseFloat(e.target.value))}
                        style={{ width: '60px' }}
                      />
                      <span style={{ fontSize: '0.8rem', color: '#00adb5', minWidth: '30px' }}>
                        {portfolio.uiSettings?.sectionRem?.[section.id] || 1}
                      </span>
                    </div>
                    <button 
                      onClick={() => setAddCustomItem && setAddCustomItem(section.id)}
                      style={{ 
                        background: '#00adb5', 
                        border: 'none', 
                        color: 'white', 
                        padding: '4px 8px', 
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '1rem'
                      }}
                    >
                      + Add Item
                    </button>
                    <button 
                      onClick={() => startEditing(section.id, `${section.label} Content`)}
                      style={{ 
                        background: 'transparent', 
                        border: '1px solid #00adb5', 
                        color: '#00adb5', 
                        padding: '4px 8px', 
                        borderRadius: '4px',
                        fontSize: '1rem',
                        cursor: 'pointer'
                      }}
                      title={`Edit ${section.label}`}
                    >
                      ✏️
                    </button>
                    <button 
                      onClick={() => handleDelete(section.id)}
                      style={{ 
                        background: 'transparent', 
                        border: '1px solid #00adb5', 
                        color: '#00adb5', 
                        padding: '4px 8px', 
                        borderRadius: '4px',
                        fontSize: '1rem',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                      }}
                      title={`Delete ${section.label}`}
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
              
              {/* Custom Section Content */}
              <div className="custom-section-content">
                {portfolio[section.id] && Array.isArray(portfolio[section.id]) ? (
                  // If it's an array, render as items list (like certificates)
                  <div className="certifications">
                    {portfolio[section.id].map((item, index) => (
                      <div key={index} className="certification-card clickable">
                        <div className="certification-content">
                          <h3 className="certification-title-text">
                            {typeof item === 'string' ? item : item.title || item.name || item.label || 'Item'}
                          </h3>
                          {typeof item === 'object' && item.description && (
                            <span className="certification-year-text">
                              {item.description}
                            </span>
                          )}
                          {isAdmin && (
                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditCustomItem && handleEditCustomItem(section.id, index, item);
                                }}
                                style={{ 
                                  background: 'transparent', 
                                  border: '1px solid #00adb5', 
                                  color: '#00adb5', 
                                  padding: '4px 8px', 
                                  borderRadius: '4px',
                                  fontSize: '1rem',
                                  cursor: 'pointer'
                                }}
                                title={`Edit ${section.label} Item`}
                              >
                                ✏️
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteCustomItem && handleDeleteCustomItem(section.id, index);
                                }}
                                style={{
                                  background: 'transparent',
                                  border: '1px solid #00adb5',
                                  color: '#00adb5',
                                  padding: '4px 8px',
                                  borderRadius: '4px',
                                  fontSize: '1rem',
                                  cursor: 'pointer',
                                  fontWeight: 'bold'
                                }}
                                title={`Delete ${section.label} Item`}
                              >
                                ✕
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : portfolio[section.id] ? (
                  // If it's a string, render as text content
                  <div className="custom-section-card clickable">
                    <div style={{ 
                      padding: '1.5rem', 
                      background: 'rgba(0, 0, 0, 0.2)', 
                      borderRadius: '8px',
                      border: '1px solid rgba(0, 173, 181, 0.3)',
                      minHeight: '100px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <div style={{ color: '#ffffff', textAlign: 'center' }}>
                        <p>{portfolio[section.id]}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Empty state
                  <div className="custom-section-card clickable">
                    <div style={{ 
                      padding: '1.5rem', 
                      background: 'rgba(0, 0, 0, 0.2)', 
                      borderRadius: '8px',
                      border: '1px solid rgba(0, 173, 181, 0.3)',
                      minHeight: '100px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <div style={{ 
                        color: '#cccccc', 
                        textAlign: 'center',
                        fontStyle: 'italic'
                      }}>
                        <p>📝 Click "+ Add Item" to add content for {section.label}</p>
                        <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                          This is your custom {section.label.toLowerCase()} section. Add your content here!
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>
          ))}

        {/* All the modals from the original portfolio */}
        {/* Project Modal */}
        {showProjectModal && selectedProject && (
          <div className="project-modal-overlay" onClick={closeProjectModal}>
            <div className="project-modal" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close-btn" onClick={closeProjectModal}>×</button>
              
              <div className="modal-content">
                {selectedProject.imageUrl && (
                  <div className="modal-image-container">
                    <img 
                      src={`${selectedProject.imageUrl}`} 
                      alt={selectedProject.title}
                      className="modal-project-image"
                    />
                  </div>
                )}
                
                <div className="modal-header">
                  <h2 className="modal-title">{selectedProject.title}</h2>
                  <div className="modal-links">
                    {selectedProject.repoUrl && (
                      <a
                        href={selectedProject.repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="modal-link"
                      >
                        📁 View Code
                      </a>
                    )}
                    {selectedProject.demoUrl && (
                      <a
                        href={selectedProject.demoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="modal-link"
                      >
                        🔗 Live Demo
                      </a>
                    )}
                  </div>
                </div>
                
                <div className="modal-description">
                  <p>{selectedProject.description}</p>
                </div>
                
                {selectedProject.techStack && selectedProject.techStack.length > 0 && (
                  <div className="modal-tech">
                    <h3>Technologies Used</h3>
                    <div className="modal-tech-tags">
                      {selectedProject.techStack.map((tech, techIndex) => (
                        <span key={techIndex} className="modal-tech-tag">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Skill Details Modal */}
        {showSkillModal && selectedSkill && (
          <div className="skill-modal-overlay" onClick={closeSkillModal}>
            <div className="skill-modal" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close-btn" onClick={closeSkillModal}>×</button>
              
              <div className="modal-content">
                <div className="modal-header">
                  <h2 className="modal-title">
                    {selectedSkill.name}
                    {selectedSkill.rating && (
                      <span className="skill-rating-large">
                        {' '}{'⭐'.repeat(selectedSkill.rating)}
                      </span>
                    )}
                  </h2>
                  <div className="skill-level">
                    <span className="skill-level-badge">{selectedSkill.level}</span>
                  </div>
                </div>
                
                <div className="skill-usage">
                  <h3>Where I Used This Skill</h3>
                  {(() => {
                    const usage = findSkillUsage(selectedSkill.name);
                    return (
                      <div className="skill-usage-content">
                        {usage.projects.length > 0 && (
                          <div className="usage-section">
                            <h4>📁 Projects</h4>
                            <div className="usage-items">
                              {usage.projects.map((project, index) => (
                                <div key={index} className="usage-item">
                                  <h5>{project.title}</h5>
                                  <p>{project.description}</p>
                                  {project.repoUrl && (
                                    <a href={project.repoUrl} target="_blank" rel="noopener noreferrer" className="usage-link">
                                      View Project →
                                    </a>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {usage.experience.length > 0 && (
                          <div className="usage-section">
                            <h4>💼 Experience</h4>
                            <div className="usage-items">
                              {usage.experience.map((exp, index) => (
                                <div key={index} className="usage-item">
                                  <h5>{exp.role} at {exp.company}</h5>
                                  <p className="duration">{exp.duration}</p>
                                  <p>{exp.details}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {usage.projects.length === 0 && usage.experience.length === 0 && (
                          <div className="no-usage">
                            <p>This skill hasn't been used in any projects or experience yet.</p>
                            <p>Add projects or experience that use this skill to see them here!</p>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Certificate Details Modal */}
        {showCertificateModal && selectedCertificate && (
          <div className="certificate-modal-overlay" onClick={closeCertificateModal}>
            <div className="certificate-modal" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close-btn" onClick={closeCertificateModal}>×</button>
              
              <div className="modal-content">
                <div className="modal-header">
                  <h2 className="modal-title">{selectedCertificate.title}</h2>
                  <div className="certification-year">
                    <p>Year: {selectedCertificate.year}</p>
                  </div>
                </div>
                
                {selectedCertificate.imageUrl && (
                  <div className="modal-image-container">
                                            {selectedCertificate.imageUrl.toLowerCase().includes('pdf') || selectedCertificate.imageUrl.toLowerCase().includes('raw') ? (
                      <div style={{
                        width: '100%',
                        height: '500px',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
                        border: '2px solid rgba(255, 255, 255, 0.2)',
                        margin: '1rem 0',
                        position: 'relative',
                        background: 'white'
                      }}>
                        {/* PDF Preview */}
                        <iframe
                          src={`${getFullUploadUrl(selectedCertificate.imageUrl)}#toolbar=1&navpanes=1&scrollbar=1&view=FitH`}
                          style={{
                            width: '100%',
                            height: '100%',
                            border: 'none',
                            borderRadius: '10px'
                          }}
                          title={`Certificate - ${selectedCertificate.title}`}
                          onError={(e) => {
                            console.error('PDF iframe failed to load:', e);
                          }}
                          onLoad={() => {
                            console.log('PDF iframe loaded successfully for:', selectedCertificate.title);
                          }}
                        />
                        <div style={{
                          position: 'absolute',
                          top: '10px',
                          right: '10px',
                          background: 'rgba(0, 0, 0, 0.7)',
                          color: 'white',
                          padding: '5px 10px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}>
                          PDF Document
                        </div>
                      </div>
                    ) : (
                      <img 
                        src={`${selectedCertificate.imageUrl}`} 
                        alt={selectedCertificate.title}
                        className="modal-certificate-image"
                        onError={(e) => {
                          console.error('Certificate image failed to load:', e);
                        }}
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Experience Modal */}
        {showExperienceModal && selectedExperience && (
          <div className="modal-overlay" onClick={closeExperienceModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={closeExperienceModal}>×</button>
              <div className="modal-header">
                <h2>{selectedExperience.role}</h2>
              </div>
              <div className="modal-body">
                <div className="experience-info">
                  <p><strong>Company:</strong> {selectedExperience.company}</p>
                  <p><strong>Duration:</strong> {selectedExperience.duration}</p>
                  <p><strong>Details:</strong></p>
                  <p>{selectedExperience.details}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Education Modal */}
        {showEducationModal && selectedEducation && (
          <div className="modal-overlay" onClick={closeEducationModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={closeEducationModal}>×</button>
              <div className="modal-header">
                <h2>{selectedEducation.degree}</h2>
              </div>
              <div className="modal-body">
                <div className="education-info">
                  <p><strong>Institution:</strong> {selectedEducation.institution}</p>
                  <p><strong>Year:</strong> {selectedEducation.year}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Skill Modal */}
        {addSkill && (
          <div className="modal-overlay" onClick={() => setAddSkill(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setAddSkill(false)}>×</button>
              <div className="modal-header">
                <h2>Add New Skill</h2>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label>Skill Name:</label>
                  <input
                    type="text"
                    value={newSkill.name}
                    onChange={(e) => setNewSkill({...newSkill, name: e.target.value})}
                    placeholder="e.g., JavaScript"
                  />
                </div>
                <div className="form-group">
                  <label>Level:</label>
                  <select
                    value={newSkill.level}
                    onChange={(e) => setNewSkill({...newSkill, level: e.target.value})}
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Expert">Expert</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Rating (1-5):</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={newSkill.rating}
                    onChange={(e) => setNewSkill({...newSkill, rating: parseInt(e.target.value)})}
                  />
                </div>
                <div className="form-group">
                  <label>Description:</label>
                  <textarea
                    value={newSkill.description}
                    onChange={(e) => setNewSkill({...newSkill, description: e.target.value})}
                    placeholder="Optional description"
                  />
                </div>
                <div className="modal-actions">
                  <button onClick={handleAddSkill} className="save-btn">Add Skill</button>
                  <button onClick={() => setAddSkill(false)} className="cancel-btn">Cancel</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Project Modal */}
        {addProject && (
          <div className="modal-overlay" onClick={() => setAddProject(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setAddProject(false)}>×</button>
              <div className="modal-header">
                <h2>Add New Project</h2>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label>Project Title:</label>
                  <input
                    type="text"
                    value={newProject.title}
                    onChange={(e) => setNewProject({...newProject, title: e.target.value})}
                    placeholder="e.g., E-commerce Website"
                  />
                </div>
                <div className="form-group">
                  <label>Description:</label>
                  <textarea
                    value={newProject.description}
                    onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                    placeholder="Describe your project"
                  />
                </div>
                <div className="form-group">
                  <label>Repository URL:</label>
                  <input
                    type="url"
                    value={newProject.repoUrl}
                    onChange={(e) => setNewProject({...newProject, repoUrl: e.target.value})}
                    placeholder="https://github.com/username/project"
                  />
                </div>
                <div className="form-group">
                  <label>Demo URL:</label>
                  <input
                    type="url"
                    value={newProject.demoUrl}
                    onChange={(e) => setNewProject({...newProject, demoUrl: e.target.value})}
                    placeholder="https://demo-link.com"
                  />
                </div>
                <div className="form-group">
                  <label>Tech Stack (comma-separated):</label>
                  <input
                    type="text"
                    value={newProject.techStack.join(', ')}
                    onChange={(e) => setNewProject({...newProject, techStack: e.target.value.split(',').map(tech => tech.trim())})}
                    placeholder="React, Node.js, MongoDB"
                  />
                </div>
                <div className="form-group">
                  <label>Project Image:</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleNewProjectImageUpload}
                    style={{ marginTop: '8px' }}
                  />
                  <small>Upload an image for your project</small>
                  {newProject.imageUrl && (
                    <div style={{ marginTop: '0.5rem' }}>
                      <p style={{ color: '#00adb5', fontSize: '0.9rem' }}>✅ Image uploaded successfully!</p>
                      <img 
                        src={`${newProject.imageUrl}`} 
                        alt="Uploaded project image" 
                        style={{ width: '100px', height: 'auto', borderRadius: '4px', border: '1px solid #00adb5' }}
                      />
                    </div>
                  )}
                </div>
                <div className="modal-actions">
                  <button onClick={handleAddProject} className="save-btn">Add Project</button>
                  <button onClick={() => setAddProject(false)} className="cancel-btn">Cancel</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Experience Modal */}
        {addExperience && (
          <div className="modal-overlay" onClick={() => setAddExperience(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setAddExperience(false)}>×</button>
              <div className="modal-header">
                <h2>Add New Experience</h2>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label>Role/Position:</label>
                  <input
                    type="text"
                    value={newExperience.role}
                    onChange={(e) => setNewExperience({...newExperience, role: e.target.value})}
                    placeholder="e.g., Senior Developer"
                  />
                </div>
                <div className="form-group">
                  <label>Company:</label>
                  <input
                    type="text"
                    value={newExperience.company}
                    onChange={(e) => setNewExperience({...newExperience, company: e.target.value})}
                    placeholder="e.g., Google"
                  />
                </div>
                <div className="form-group">
                  <label>Duration:</label>
                  <input
                    type="text"
                    value={newExperience.duration}
                    onChange={(e) => setNewExperience({...newExperience, duration: e.target.value})}
                    placeholder="e.g., Jan 2020 - Dec 2022"
                  />
                </div>
                <div className="form-group">
                  <label>Details:</label>
                  <textarea
                    value={newExperience.details}
                    onChange={(e) => setNewExperience({...newExperience, details: e.target.value})}
                    placeholder="Describe your responsibilities and achievements"
                  />
                </div>
                <div className="modal-actions">
                  <button onClick={handleAddExperience} className="save-btn">Add Experience</button>
                  <button onClick={() => setAddExperience(false)} className="cancel-btn">Cancel</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Education Modal */}
        {addEducation && (
          <div className="modal-overlay" onClick={() => setAddEducation(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setAddEducation(false)}>×</button>
              <div className="modal-header">
                <h2>Add New Education</h2>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label>Degree:</label>
                  <input
                    type="text"
                    value={newEducation.degree}
                    onChange={(e) => setNewEducation({...newEducation, degree: e.target.value})}
                    placeholder="e.g., Bachelor of Science in Computer Science"
                  />
                </div>
                <div className="form-group">
                  <label>Institution:</label>
                  <input
                    type="text"
                    value={newEducation.institution}
                    onChange={(e) => setNewEducation({...newEducation, institution: e.target.value})}
                    placeholder="e.g., Stanford University"
                  />
                </div>
                <div className="form-group">
                  <label>Year:</label>
                  <input
                    type="text"
                    value={newEducation.year}
                    onChange={(e) => setNewEducation({...newEducation, year: e.target.value})}
                    placeholder="e.g., 2020"
                  />
                </div>
                <div className="modal-actions">
                  <button onClick={handleAddEducation} className="save-btn">Add Education</button>
                  <button onClick={() => setAddEducation(false)} className="cancel-btn">Cancel</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Certificate Modal */}
        {addCert && (
          <div className="modal-overlay" onClick={() => setAddCert(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setAddCert(false)}>×</button>
              <div className="modal-header">
                <h2>Add New Certificate</h2>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label>Certificate Title:</label>
                  <input
                    type="text"
                    value={newCert.title}
                    onChange={(e) => setNewCert({...newCert, title: e.target.value})}
                    placeholder="e.g., AWS Certified Solutions Architect"
                  />
                </div>
                <div className="form-group">
                  <label>Year:</label>
                  <input
                    type="text"
                    value={newCert.year}
                    onChange={(e) => setNewCert({...newCert, year: e.target.value})}
                    placeholder="e.g., 2023"
                  />
                </div>
                <div className="form-group">
                  <label>Certificate Image/PDF:</label>
                  <input
                    type="file"
                    accept="image/*,.pdf,.pptx,.ppt"
                    onChange={handleNewCertificateImageUpload}
                    style={{ marginTop: '8px' }}
                  />
                  <small>Upload an image or PDF of your certificate</small>
                  {newCert.imageUrl && (
                    <div style={{ marginTop: '0.5rem' }}>
                      <p style={{ color: '#00adb5', fontSize: '0.9rem' }}>✅ File uploaded successfully!</p>
                      <img 
                        src={`${newCert.imageUrl}`} 
                        alt="Uploaded certificate" 
                        style={{ width: '100px', height: 'auto', borderRadius: '4px', border: '1px solid #00adb5' }}
                      />
                    </div>
                  )}
                </div>
                <div className="modal-actions">
                  <button onClick={handleAddCert} className="save-btn">Add Certificate</button>
                  <button onClick={() => setAddCert(false)} className="cancel-btn">Cancel</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Project Modal */}
        {showProjectModal && selectedProject && (
          <div className="modal-overlay" onClick={() => setShowProjectModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setShowProjectModal(false)}>×</button>
              <h2>Edit Project</h2>
              <div className="form-group">
                <label>Title:</label>
                <input
                  type="text"
                  value={selectedProject.title}
                  onChange={(e) => setSelectedProject({...selectedProject, title: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Description:</label>
                <textarea
                  value={selectedProject.description}
                  onChange={(e) => setSelectedProject({...selectedProject, description: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Repository URL:</label>
                <input
                  type="url"
                  value={selectedProject.repoUrl || ''}
                  onChange={(e) => setSelectedProject({...selectedProject, repoUrl: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Demo URL:</label>
                <input
                  type="url"
                  value={selectedProject.demoUrl || ''}
                  onChange={(e) => setSelectedProject({...selectedProject, demoUrl: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Tech Stack (comma-separated):</label>
                <input
                  type="text"
                  value={selectedProject.techStack ? selectedProject.techStack.join(', ') : ''}
                  onChange={(e) => setSelectedProject({...selectedProject, techStack: e.target.value.split(',').map(tech => tech.trim())})}
                />
              </div>
              <div className="form-group">
                <label>Project Image:</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProjectImageUpload}
                />
                {selectedProject.imageUrl && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <img 
                      src={`${getFullUploadUrl(selectedProject.imageUrl)}`} 
                      alt="Current project image" 
                      style={{ width: '100px', height: 'auto', borderRadius: '4px' }}
                    />
                  </div>
                )}
              </div>
              <div className="modal-buttons">
                <button onClick={handleUpdateProject} className="save-btn">Update Project</button>
                <button onClick={() => setShowProjectModal(false)} className="cancel-btn">Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Experience Modal */}
        {showExperienceModal && selectedExperience && (
          <div className="modal-overlay" onClick={() => setShowExperienceModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setShowExperienceModal(false)}>×</button>
              <h2>Edit Experience</h2>
              <div className="form-group">
                <label>Role:</label>
                <input
                  type="text"
                  value={selectedExperience.role}
                  onChange={(e) => setSelectedExperience({...selectedExperience, role: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Company:</label>
                <input
                  type="text"
                  value={selectedExperience.company}
                  onChange={(e) => setSelectedExperience({...selectedExperience, company: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Duration:</label>
                <input
                  type="text"
                  value={selectedExperience.duration}
                  onChange={(e) => setSelectedExperience({...selectedExperience, duration: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Details:</label>
                <textarea
                  value={selectedExperience.details}
                  onChange={(e) => setSelectedExperience({...selectedExperience, details: e.target.value})}
                />
              </div>
              <div className="modal-buttons">
                <button onClick={handleUpdateExperience} className="save-btn">Update Experience</button>
                <button onClick={() => setShowExperienceModal(false)} className="cancel-btn">Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Education Modal */}
        {showEducationModal && selectedEducation && (
          <div className="modal-overlay" onClick={() => setShowEducationModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setShowEducationModal(false)}>×</button>
              <h2>Edit Education</h2>
              <div className="form-group">
                <label>Degree:</label>
                <input
                  type="text"
                  value={selectedEducation.degree}
                  onChange={(e) => setSelectedEducation({...selectedEducation, degree: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Institution:</label>
                <input
                  type="text"
                  value={selectedEducation.institution}
                  onChange={(e) => setSelectedEducation({...selectedEducation, institution: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Year:</label>
                <input
                  type="text"
                  value={selectedEducation.year}
                  onChange={(e) => setSelectedEducation({...selectedEducation, year: e.target.value})}
                />
              </div>
              <div className="modal-buttons">
                <button onClick={handleUpdateEducation} className="save-btn">Update Education</button>
                <button onClick={() => setShowEducationModal(false)} className="cancel-btn">Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Certificate Modal */}
        {showCertificateModal && selectedCertificate && (
          <div className="modal-overlay" onClick={() => setShowCertificateModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setShowCertificateModal(false)}>×</button>
              <h2>Edit Certificate</h2>
              <div className="form-group">
                <label>Title:</label>
                <input
                  type="text"
                  value={selectedCertificate.title}
                  onChange={(e) => setSelectedCertificate({...selectedCertificate, title: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Year:</label>
                <input
                  type="text"
                  value={selectedCertificate.year}
                  onChange={(e) => setSelectedCertificate({...selectedCertificate, year: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Certificate Image:</label>
                <input
                  type="file"
                                      accept="image/*,.pdf,.pptx,.ppt"
                  onChange={handleCertificateImageUpload}
                />
                {selectedCertificate.imageUrl && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <img 
                      src={`${getFullUploadUrl(selectedCertificate.imageUrl)}`} 
                      alt="Current certificate image" 
                      style={{ width: '100px', height: 'auto', borderRadius: '4px' }}
                    />
                  </div>
                )}
              </div>
              <div className="modal-buttons">
                <button onClick={handleUpdateCertificate} className="save-btn">Update Certificate</button>
                <button onClick={() => setShowCertificateModal(false)} className="cancel-btn">Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* Add Custom Item Modal */}
        {addCustomItem && (
          <div className="modal-overlay" onClick={() => setAddCustomItem(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setAddCustomItem(null)}>×</button>
              <div className="modal-header">
                <h2>Add New Item to {sections.find(s => s.id === addCustomItem)?.label || 'Section'}</h2>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label>Title:</label>
                  <input
                    type="text"
                    value={newCustomItem.title}
                    onChange={(e) => setNewCustomItem({...newCustomItem, title: e.target.value})}
                    placeholder="Enter item title"
                  />
                </div>
                <div className="form-group">
                  <label>Description:</label>
                  <textarea
                    value={newCustomItem.description}
                    onChange={(e) => setNewCustomItem({...newCustomItem, description: e.target.value})}
                    placeholder="Enter item description (optional)"
                    rows="3"
                  />
                </div>
                <div className="modal-actions">
                  <button onClick={() => handleAddCustomItem(addCustomItem)} className="save-btn">Add Item</button>
                  <button onClick={() => setAddCustomItem(null)} className="cancel-btn">Cancel</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Custom Item Modal */}
        {editingCustomItem && (
          <div className="modal-overlay" onClick={() => setEditingCustomItem(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setEditingCustomItem(null)}>×</button>
              <div className="modal-header">
                <h2>Edit Item</h2>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label>Title:</label>
                  <input
                    type="text"
                    value={newCustomItem.title}
                    onChange={(e) => setNewCustomItem({...newCustomItem, title: e.target.value})}
                    placeholder="Enter item title"
                  />
                </div>
                <div className="form-group">
                  <label>Description:</label>
                  <textarea
                    value={newCustomItem.description}
                    onChange={(e) => setNewCustomItem({...newCustomItem, description: e.target.value})}
                    placeholder="Enter item description (optional)"
                    rows="3"
                  />
                </div>
                <div className="modal-actions">
                  <button onClick={handleUpdateCustomItem} className="save-btn">Update Item</button>
                  <button onClick={() => setEditingCustomItem(null)} className="cancel-btn">Cancel</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Management Modal */}
        {showNavModal && (
          <div className="modal-overlay" onClick={handleCloseNavModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px', maxHeight: '80vh', overflow: 'auto' }}>
              <button className="modal-close" onClick={handleCloseNavModal}>×</button>
              <div className="modal-header">
                <h2>Manage Navigation</h2>
                <p style={{ color: '#cccccc', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                  Edit, delete, or add new navigation items
                </p>
              </div>
              <div className="modal-body">
                <div style={{ marginBottom: '2rem' }}>
                  <h3 style={{ color: '#00adb5', marginBottom: '1rem' }}>Current Navigation Items</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {sections.map((section) => (
                      <div key={section.id} style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        padding: '0.75rem',
                        background: 'rgba(0, 0, 0, 0.2)',
                        borderRadius: '8px',
                        border: '1px solid rgba(0, 173, 181, 0.3)'
                      }}>
                        {editingNavItem === section.id ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
                            <input
                              type="text"
                              value={editNavValue}
                              onChange={(e) => setEditNavValue(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleSaveNavItem(editNavValue);
                                } else if (e.key === 'Escape') {
                                  handleCancelNavEdit();
                                }
                              }}
                              style={{ 
                                flex: 1,
                                padding: '0.5rem',
                                background: 'rgba(255, 255, 255, 0.1)',
                                border: '1px solid #00adb5',
                                borderRadius: '4px',
                                color: '#ffffff',
                                fontSize: '0.9rem'
                              }}
                            />
                            <button 
                              onClick={() => handleSaveNavItem(editNavValue)}
                              style={{ 
                                background: '#00adb5', 
                                border: 'none', 
                                color: 'white', 
                                padding: '0.3rem 0.6rem', 
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '0.8rem'
                              }}
                            >
                              ✓
                            </button>
                            <button 
                              onClick={handleCancelNavEdit}
                              style={{ 
                                background: 'transparent', 
                                border: '1px solid #00adb5', 
                                color: '#00adb5', 
                                padding: '0.3rem 0.6rem', 
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '0.8rem'
                              }}
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span style={{ color: '#ffffff', fontSize: '0.9rem' }}>{section.label}</span>
                              {['welcome', 'skills', 'projects', 'experience', 'education', 'certifications', 'contact'].includes(section.id) && (
                                <span style={{ 
                                  background: 'rgba(0, 173, 181, 0.3)', 
                                  color: '#00adb5', 
                                  padding: '0.1rem 0.4rem', 
                                  borderRadius: '12px', 
                                  fontSize: '0.7rem',
                                  fontWeight: 'bold'
                                }}>
                                  CORE
                                </span>
                              )}
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button 
                                onClick={() => handleEditNavItem(section.id, section.label)}
                                style={{ 
                                  background: 'transparent', 
                                  border: '1px solid #00adb5', 
                                  color: '#00adb5', 
                                  padding: '0.3rem 0.6rem', 
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  fontSize: '0.8rem'
                                }}
                                title={`Edit ${section.label}`}
                              >
                                ✏️ Edit
                              </button>
                              {!['welcome', 'skills', 'projects', 'experience', 'education', 'certifications', 'contact'].includes(section.id) ? (
                                <button 
                                  onClick={() => handleDeleteNavItem(section.id)}
                                  style={{ 
                                    background: 'transparent', 
                                    border: '1px solid #ff6b6b', 
                                    color: '#ff6b6b', 
                                    padding: '0.3rem 0.6rem', 
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '0.8rem'
                                  }}
                                  title={`Delete ${section.label}`}
                                >
                                  ✕ Delete
                                </button>
                              ) : (
                                <button 
                                  style={{ 
                                    background: 'transparent', 
                                    border: '1px solid #666666', 
                                    color: '#666666', 
                                    padding: '0.3rem 0.6rem', 
                                    borderRadius: '4px',
                                    cursor: 'not-allowed',
                                    fontSize: '0.8rem',
                                    opacity: '0.5'
                                  }}
                                  disabled
                                  title="Core sections cannot be deleted"
                                >
                                  🔒 Core
                                </button>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ 
                  padding: '1rem', 
                  background: 'rgba(0, 173, 181, 0.1)', 
                  borderRadius: '8px',
                  border: '1px solid rgba(0, 173, 181, 0.3)'
                }}>
                  <h3 style={{ color: '#00adb5', marginBottom: '1rem' }}>Add New Navigation Item</h3>
                  <p style={{ color: '#cccccc', fontSize: '0.9rem', marginBottom: '1rem' }}>
                    Add custom navigation sections to your portfolio
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div>
                      <label style={{ color: '#ffffff', fontSize: '0.9rem', marginBottom: '0.5rem', display: 'block' }}>
                        Navigation Label:
                      </label>
                      <input
                        type="text"
                        value={newNavLabel}
                        onChange={(e) => setNewNavLabel(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleAddNewNavItem();
                          }
                        }}
                        placeholder="e.g., Blog, Portfolio, Gallery"
                        style={{ 
                          width: '100%',
                          padding: '0.5rem',
                          background: 'rgba(255, 255, 255, 0.1)',
                          border: '1px solid #00adb5',
                          borderRadius: '4px',
                          color: '#ffffff',
                          fontSize: '0.9rem'
                        }}
                      />
                    </div>
                    <button 
                      onClick={handleAddNewNavItem}
                      style={{ 
                        background: '#00adb5', 
                        border: 'none', 
                        color: 'white', 
                        padding: '0.5rem 1rem', 
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      <span style={{ fontSize: '1rem' }}>+</span>
                      Add Navigation Item
                    </button>
                  </div>
                </div>
              </div>
              <div className="modal-actions" style={{ marginTop: '1rem' }}>
                <button onClick={handleCloseNavModal} className="cancel-btn">Close</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

// Read-only Portfolio Component for Customers and Example Viewers
const ReadOnlyPortfolio = () => {
  const { contextLoggedIn, contextLogout } = useContext(AuthContext);
  const location = useLocation();
  
  // Check if this is an example view based on the URL path
  const isExampleView = location.pathname.includes('/example');
  
  // Only create user object if not in example view and user is logged in
  const user = (!isExampleView && contextLoggedIn) ? { 
    email: localStorage.getItem('email'),
    ownerId: localStorage.getItem('email'),
    role: 'customer'
  } : null;
  const logout = contextLogout;
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(null);

  // Set isAdmin to false for read-only portfolio
  const isAdmin = false;

  console.log('ReadOnlyPortfolio rendered, user:', user, 'isExampleView:', isExampleView);

  // Navigation sections - using state to allow dynamic updates
  const [sections, setSections] = useState([
    { id: 'welcome', label: 'Welcome' },
    { id: 'skills', label: 'Skills' },
    { id: 'projects', label: 'Projects' },
    { id: 'experience', label: 'Experience' },
    { id: 'education', label: 'Education' },
    { id: 'certifications', label: 'Certifications' },
    { id: 'contact', label: 'Contact' },
  ]);

  // Modal state for project details
  const [selectedProject, setSelectedProject] = useState(null);
  const [showProjectModal, setShowProjectModal] = useState(false);
  
  // Modal state for skill details
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [showSkillModal, setShowSkillModal] = useState(false);

  // Modal state for certificate details
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [showCertificateModal, setShowCertificateModal] = useState(false);

  // Modal state for experience details
  const [selectedExperience, setSelectedExperience] = useState(null);
  const [showExperienceModal, setShowExperienceModal] = useState(false);

  // Modal state for education details
  const [selectedEducation, setSelectedEducation] = useState(null);
  const [showEducationModal, setShowEducationModal] = useState(false);

  // Add missing state variables for editing
  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState('');

  // Add missing functions that are referenced
  const startEditing = (fieldPath, currentValue) => {
    // This function is not needed for read-only portfolio
    console.log('Edit attempted in read-only mode');
  };

  const saveEdit = async (fieldPath) => {
    // This function is not needed for read-only portfolio
    console.log('Save attempted in read-only mode');
  };

  const updateBaseRem = async (newBaseRem) => {
    // This function is not needed for read-only portfolio
    console.log('Base REM update attempted in read-only mode');
  };

  const updateAboutRem = (newRem) => {
    // This function is not needed for read-only portfolio
    console.log('About REM update attempted in read-only mode');
  };

  const handleDelete = async (fieldPath) => {
    // This function is not needed for read-only portfolio
    console.log('Delete attempted in read-only mode');
  };

  // Add missing functions for skills section
  const updateSkillsRem = (newRem) => {
    // This function is not needed for read-only portfolio
    console.log('Skills REM update attempted in read-only mode');
  };

  const handleDeleteSkill = async (idx) => {
    // This function is not needed for read-only portfolio
    console.log('Delete skill attempted in read-only mode');
  };

  // Add missing functions for other sections
  const updateProjectsRem = (newRem) => {
    // This function is not needed for read-only portfolio
    console.log('Projects REM update attempted in read-only mode');
  };

  const updateExperienceRem = (newRem) => {
    // This function is not needed for read-only portfolio
    console.log('Experience REM update attempted in read-only mode');
  };

  const updateEducationRem = (newRem) => {
    // This function is not needed for read-only portfolio
    console.log('Education REM update attempted in read-only mode');
  };

  const updateCertificationsRem = (newRem) => {
    // This function is not needed for read-only portfolio
    console.log('Certifications REM update attempted in read-only mode');
  };

  // Add missing state variables for modals
  const [addSkill, setAddSkill] = useState(false);
  const [addProject, setAddProject] = useState(false);
  const [addExperience, setAddExperience] = useState(false);
  const [addEducation, setAddEducation] = useState(false);
  const [addCert, setAddCert] = useState(false);
  const [newSkill, setNewSkill] = useState({ name: '', level: '' });
  const [newProject, setNewProject] = useState({ title: '', description: '', repoUrl: '', demoUrl: '', techStack: [], imageUrl: '' });
  const [newExperience, setNewExperience] = useState({ role: '', company: '', duration: '', details: '' });
  const [newEducation, setNewEducation] = useState({ degree: '', institution: '', year: '' });
  const [newCert, setNewCert] = useState({ title: '', year: '', imageUrl: '' });

  // Fetch portfolio data from backend with aggressive cache busting
  const fetchPortfolio = async (ownerId) => {
    const timestamp = Date.now(); // Add cache busting parameter
    const randomId = Math.random().toString(36).substring(7); // Add random parameter
          const response = await fetch(`${import.meta.env.VITE_BACKEND_API}/softwareeng/${ownerId}?t=${timestamp}&r=${randomId}`, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    if (!response.ok) {
      throw new Error('Failed to fetch portfolio');
    }
    return response.json();
  };

  // Handle project card click to open modal
  const handleProjectClick = (project) => {
    setSelectedProject(project);
    setShowProjectModal(true);
  };

  // Close project modal
  const closeProjectModal = () => {
    setSelectedProject(null);
    setShowProjectModal(false);
  };

  // Handle skill card click to open modal
  const handleSkillClick = (skill) => {
    setSelectedSkill(skill);
    setShowSkillModal(true);
  };

  // Close skill modal
  const closeSkillModal = () => {
    setSelectedSkill(null);
    setShowSkillModal(false);
  };

  // Handle certificate card click to open modal
  const handleCertificateClick = (cert) => {
    setSelectedCertificate(cert);
    setShowCertificateModal(true);
  };

  // Close certificate modal
  const closeCertificateModal = () => {
    setSelectedCertificate(null);
    setShowCertificateModal(false);
  };

  // Handle experience card click to open modal
  const handleExperienceClick = (exp) => {
    setSelectedExperience(exp);
    setShowExperienceModal(true);
  };

  // Close experience modal
  const closeExperienceModal = () => {
    setSelectedExperience(null);
    setShowExperienceModal(false);
  };

  // Handle education card click to open modal
  const handleEducationClick = (edu) => {
    setSelectedEducation(edu);
    setShowEducationModal(true);
  };

  // Close education modal
  const closeEducationModal = () => {
    setSelectedEducation(null);
    setShowEducationModal(false);
  };

  // Find where a skill is used
  const findSkillUsage = (skillName) => {
    if (!portfolio) return { projects: [], experience: [] };
    
    const projects = portfolio.projects.filter(project => 
      project.techStack.some(tech => 
        tech.toLowerCase().includes(skillName.toLowerCase())
      )
    );
    
    const experience = portfolio.experience.filter(exp => 
      exp.details.toLowerCase().includes(skillName.toLowerCase())
    );
    
    return { projects, experience };
  };

  // Load portfolio data function
  const loadPortfolio = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let ownerId;
      
      if (isExampleView) {
        // For example view, use admin portfolio as the example
        ownerId = 'admin@test.com';
        console.log('Loading example portfolio for ownerId:', ownerId);
      } else if (!user || !user.ownerId) {
        setError('No user or owner ID found');
        setLoading(false);
        return;
      } else {
        ownerId = user.ownerId;
        console.log('Loading portfolio for ownerId:', ownerId);
      }

      const portfolioData = await fetchPortfolio(ownerId);
      
      // Silently update data without any visual indicators
      
      setPortfolio(portfolioData);
      setLastRefresh(new Date());
    } catch (err) {
      console.error('Error loading portfolio:', err);
      setError(err.message || 'Failed to load portfolio');
    } finally {
      setLoading(false);
    }
  };

  // WebSocket connection for instant updates (completely disabled for now)
  useEffect(() => {
    // Completely disable WebSocket for now to prevent infinite refresh
    console.log('🚫 WebSocket completely disabled to prevent infinite refresh');
    return;
    
    let socket = null;
    let refreshInterval = null;

    const connectSocket = () => {
      // Skip WebSocket for example view to avoid connection errors
      if (isExampleView) {
        console.log('🚫 WebSocket disabled for example view');
        return;
      }

      try {
        socket = io(import.meta.env.VITE_BACKEND_API, {
          transports: ['websocket', 'polling'],
          timeout: 5000
        });

        // Connection event handlers
        socket.on('connect', () => {
          console.log('🔌 WebSocket connected:', socket.id);
          
          if (isExampleView) {
            // For example view, join admin room to get updates
            socket.emit('join-admin-room');
            console.log('👤 Example viewer joined admin room');
          } else if (user && user.ownerId === 'cust@test.com') {
            socket.emit('join-customer-room');
            console.log('👥 Customer joined update room');
          } else if (user && user.ownerId === 'admin@test.com') {
            socket.emit('join-admin-room');
            console.log('👤 Admin joined update room');
          }
          
          // Also join user-specific room
          if (user && user.ownerId) {
            socket.emit('join-user-room', user.ownerId);
            console.log(`👤 User joined ${user.ownerId} room`);
          }
        });

        socket.on('connect_error', (error) => {
          console.error('❌ WebSocket connection error:', error);
          // Fallback to polling if WebSocket fails
          startPolling();
        });

        socket.on('disconnect', (reason) => {
          console.log('🔌 WebSocket disconnected:', reason);
          if (reason === 'io server disconnect') {
            // Server disconnected, try to reconnect
            socket.connect();
          }
        });

        // Listen for portfolio updates
        socket.on('portfolio-updated', (data) => {
          console.log('📡 Received real-time update:', data);
          // Instantly reload portfolio data
          loadPortfolio();
        });

        // Listen for general portfolio changes
        socket.on('portfolio-changed', (data) => {
          console.log('📡 Portfolio changed:', data);
          if (isExampleView && data.ownerId === 'admin@test.com') {
            loadPortfolio();
          } else if (data.ownerId === user?.ownerId) {
            loadPortfolio();
          }
        });

        // Listen for portfolio creation
        socket.on('portfolio-created', (data) => {
          console.log('📡 Portfolio created:', data);
          if (isExampleView && data.ownerId === 'admin@test.com') {
            loadPortfolio();
          } else if (data.ownerId === user?.ownerId) {
            loadPortfolio();
          }
        });

        // Listen for portfolio deletion
        socket.on('portfolio-deleted', (data) => {
          console.log('📡 Portfolio deleted:', data);
          if (isExampleView && data.ownerId === 'admin@test.com') {
            // Handle example portfolio deletion
            console.log('Example portfolio was deleted');
          } else if (data.ownerId === user?.ownerId) {
            // Handle portfolio deletion - maybe redirect or show message
            console.log('Your portfolio was deleted');
          }
        });

        // Listen for avatar uploads
        socket.on('avatar-uploaded', (data) => {
          console.log('📡 Avatar uploaded:', data);
          if (isExampleView && data.ownerId === 'admin@test.com') {
            // Update avatar immediately for example view
            setPortfolio(prev => prev ? {
              ...prev,
              profile: {
                ...prev.profile,
                avatarUrl: data.avatarUrl
              }
            } : null);
          } else if (data.ownerId === user?.ownerId) {
            // Update avatar immediately
            setPortfolio(prev => prev ? {
              ...prev,
              profile: {
                ...prev.profile,
                avatarUrl: data.avatarUrl
              }
            } : null);
          }
        });

        // Listen for test events
        socket.on('test-event', (data) => {
          console.log('🧪 Test event received:', data);
          // You can add a notification here if needed
        });

      } catch (error) {
        console.error('❌ Failed to connect WebSocket:', error);
        startPolling();
      }
    };

    const startPolling = () => {
      console.log('🔄 Polling disabled to prevent infinite refresh...');
      // refreshInterval = setInterval(() => {
      //   loadPortfolio();
      // }, 3000);
    };

    // WebSocket functionality completely disabled for now
    // loadPortfolio();
    // if (user) {
    //   connectSocket();
    // }

    return () => {
      if (socket) {
        socket.disconnect();
      }
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [isExampleView]); // Only depend on isExampleView to prevent infinite loops

  // Load portfolio data on component mount
  useEffect(() => {
    loadPortfolio();
  }, []); // Empty dependency array - only run once on mount

  // Update CSS variables when portfolio changes
  useEffect(() => {
    if (portfolio && portfolio.uiSettings) {
      const root = document.documentElement;
      
      // Update base rem
      if (portfolio.uiSettings.baseRem) {
        root.style.setProperty('--base-rem', portfolio.uiSettings.baseRem);
      }
      
      // Update section rems
      if (portfolio.uiSettings.sectionRem) {
        Object.entries(portfolio.uiSettings.sectionRem).forEach(([section, rem]) => {
          root.style.setProperty(`--${section}-rem`, rem);
        });
      }
    }
  }, [portfolio]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading portfolio...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error Loading Portfolio</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="retry-btn">
          Retry
        </button>
        <button onClick={logout} className="logout-btn">
          Logout
        </button>
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="no-portfolio-container">
        <h2>No Portfolio Found</h2>
        <p>This user doesn't have a portfolio yet.</p>
        <button onClick={logout} className="logout-btn">
          Logout
        </button>
      </div>
    );
  }

    return (
          <Layout 
        user={isExampleView ? { role: 'example' } : { role: 'customer' }} 
        logout={isExampleView ? null : (logout || (() => {}))} 
        isAdmin={false}
        sections={sections}
      >
        {/* Fixed Navigation Bar - Stays at top when scrolling */}
        <nav className="portfolio-fixed-navigation" style={{
          position: 'fixed',
          top: '80px',
          left: '0',
          right: '0',
          zIndex: 1000,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '1rem',
          padding: '1rem',
          background: 'rgba(0, 0, 0, 0.95)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(0, 173, 181, 0.3)',
          flexWrap: 'wrap',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
        }}>
          {sections.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              onClick={(e) => {
                e.preventDefault();
                const element = document.getElementById(section.id);
                if (element) {
                  element.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                  });
                }
              }}
              style={{
                padding: '0.75rem 1.5rem',
                background: 'rgba(0, 173, 181, 0.1)',
                color: '#00adb5',
                textDecoration: 'none',
                borderRadius: '8px',
                border: '1px solid rgba(0, 173, 181, 0.3)',
                transition: 'all 0.3s ease',
                fontWeight: '500',
                fontSize: '0.95rem',
                whiteSpace: 'nowrap',
                cursor: 'pointer'
              }}
              onMouseOver={(e) => {
                e.target.style.background = 'rgba(0, 173, 181, 0.2)';
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 20px rgba(0, 173, 181, 0.3)';
              }}
              onMouseOut={(e) => {
                e.target.style.background = 'rgba(0, 173, 181, 0.1)';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              {section.label}
            </a>
          ))}
        </nav>
        
        <div className="admin-dashboard" style={{ paddingTop: '120px' }}>
          {/* Header with name and subtitle */}
        <header className="portfolio-header">
          <div className="header-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', marginTop: '2rem' }}>
            <div className="header-title" style={{ textAlign: 'center' }}>
              <h1>{portfolio.profile.name}</h1>
              <h2>{portfolio.profile.subtitle || 'A Software Engineer\'s Portfolio'}</h2>
            </div>

          </div>
        </header>



        {/* Welcome Section (now just tagline/about) */}
        <section className="section" id="welcome">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: '1rem' }}>
            <h2 style={{ margin: 0 }}>About</h2>
          </div>
          <div className="about-card clickable">
            <div className="about-content">
              <p>
                {portfolio.profile.bio}
              </p>
            </div>
          </div>
        </section>

        {/* Skills Section */}
        <section className="section" id="skills">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: '1rem' }}>
            <h2 style={{ margin: 0 }}>
              Skills ({portfolio.skills?.length || 0} skills)
            </h2>
          </div>
          <div className="skills">
            {portfolio.skills.map((skill, index) => (
              <div 
                key={index} 
                className="skill-item clickable" 
                onClick={() => handleSkillClick(skill)}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  background: 'rgba(0, 173, 181, 0.1)',
                  border: '1px solid rgba(0, 173, 181, 0.3)',
                  marginBottom: '0.5rem',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(0, 173, 181, 0.2)';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(0, 173, 181, 0.1)';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#00adb5' }}>
                    {typeof skill === 'string' ? skill : skill.name}
                  </span>
                  {typeof skill !== 'string' && skill.level && (
                    <span style={{ 
                      fontSize: '0.8rem', 
                      color: '#ffffff', 
                      background: '#00adb5',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontWeight: '500'
                    }}>
                      {skill.level}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Projects Section */}
        <section className="section" id="projects">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: '1rem' }}>
            <h2 style={{ margin: 0 }}>Projects</h2>
          </div>
          <div className="projects">
            {portfolio.projects.map((project, index) => (
              <div key={index} className="project-card clickable" onClick={() => handleProjectClick(project)}>
                <div className="project-content">
                  <div className="project-header">
                    <h3 className="project-title">
                      {project.title}
                    </h3>
                  </div>
                  <p className="project-description">
                    {project.description}
                  </p>
                  <div className="project-links">
                    {project.repoUrl && (
                      <a href={project.repoUrl} target="_blank" rel="noopener noreferrer" className="project-link">
                        GitHub
                      </a>
                    )}
                    {project.demoUrl && (
                      <a href={project.demoUrl} target="_blank" rel="noopener noreferrer" className="project-link">
                        Live Demo
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Experience Section */}
        <section className="section" id="experience">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: '1rem' }}>
            <h2 style={{ margin: 0 }}>Experience</h2>
          </div>
          <div className="experience">
            {portfolio.experience.map((exp, index) => (
              <div key={index} className="experience-card clickable" onClick={() => handleExperienceClick(exp)}>
                <div className="experience-content">
                  <h3 className="experience-title">
                    {exp.role}
                  </h3>
                  <span className="experience-company-name">
                    {exp.company}
                  </span>
                  <span className="experience-duration-text">
                    {exp.duration}
                  </span>
                  <p className="experience-details-text">
                    {exp.details}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Education Section */}
        <section className="section" id="education">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: '1rem' }}>
            <h2 style={{ margin: 0 }}>Education</h2>
          </div>
          <div className="education">
            {portfolio.education.map((edu, index) => (
              <div key={index} className="education-card clickable" onClick={() => handleEducationClick(edu)}>
                <div className="education-content">
                  <h3 className="education-degree-title">
                    {edu.degree}
                  </h3>
                  <span className="education-institution-name">
                    {edu.institution}
                  </span>
                  <span className="education-year-text">
                    {edu.year}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Certifications Section */}
        <section className="section" id="certifications">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: '1rem' }}>
            <h2 style={{ margin: 0 }}>Certifications</h2>
          </div>
          <div className="certifications">
            {portfolio.certifications.map((cert, index) => (
              <div key={index} className="certification-card clickable" onClick={() => handleCertificateClick(cert)}>
                {cert.imageUrl && (
                  <div className="certification-image-container">
                    <div className="certification-image">
                                        {cert.imageUrl.toLowerCase().includes('pdf') || cert.imageUrl.toLowerCase().includes('raw') ? (
                        <div style={{
                        width: '100%',
                          height: '120px',
                        borderRadius: '8px',
                        overflow: 'hidden',
                          position: 'relative',
                          background: 'white',
                          border: '1px solid rgba(0, 173, 181, 0.3)',
                          cursor: 'pointer'
                      }}>
                        <iframe
                            src={`${getFullUploadUrl(cert.imageUrl)}#toolbar=0&navpanes=0&scrollbar=0&view=FitH&page=1`}
                          style={{
                            width: '100%',
                            height: '100%',
                            border: 'none',
                              borderRadius: '8px',
                            pointerEvents: 'none'
                          }}
                            title={`Certificate Preview - ${cert.title}`}
                            onError={(e) => {
                              console.error('PDF preview failed to load:', e);
                            }}
                        />
                        <div style={{
                          position: 'absolute',
                            top: '5px',
                            right: '5px',
                          background: 'rgba(0, 173, 181, 0.9)',
                          color: 'white',
                            padding: '2px 6px',
                          borderRadius: '4px',
                            fontSize: '10px',
                          fontWeight: 'bold'
                        }}>
                          PDF
                        </div>
                        <div style={{
                          position: 'absolute',
                            bottom: '5px',
                            left: '5px',
                          background: 'rgba(0, 0, 0, 0.7)',
                          color: 'white',
                            padding: '2px 6px',
                          borderRadius: '4px',
                            fontSize: '10px'
                        }}>
                          Click to View Full
                        </div>
                      </div>
                    ) : (
                        <img src={`${getFullUploadUrl(cert.imageUrl)}`} alt={cert.title} />
                      )}
                    </div>
                  </div>
                )}
                <div className="certification-content">
                  <h3 className="certification-title-text">
                    {cert.title}
                  </h3>
                  <span className="certification-year-text">
                    {cert.year}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Contact Section */}
        <section className="section" id="contact">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: '1rem' }}>
            <h2 style={{ margin: 0 }}>Contact</h2>
            {isAdmin && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {/* Fine-tune Control */}
                <div className="section-rem-control" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.9rem', color: '#00adb5' }}>Fine-tune:</label>
                  <input
                    type="range"
                    min="0.8"
                    max="1.5"
                    step="0.1"
                    value={portfolio?.uiSettings?.sectionRem?.contact || 1.1}
                    onChange={(e) => updateContactRem(parseFloat(e.target.value))}
                    style={{ width: '80px' }}
                  />
                  <span style={{ fontSize: '0.8rem', color: '#00adb5', minWidth: '30px' }}>{portfolio?.uiSettings?.sectionRem?.contact || 1.1}</span>
                </div>
                {/* Edit Icon */}
                <button 
                  onClick={() => startEditing('profile.linkedin', portfolio.profile.linkedin || '')}
                  style={{ 
                    background: 'transparent', 
                    border: '1px solid #00adb5', 
                    color: '#00adb5', 
                    padding: '4px 8px', 
                    borderRadius: '4px',
                    fontSize: '1rem',
                    cursor: 'pointer'
                  }}
                  title="Edit Contact Information"
                >
                  ✏️
                </button>
                {/* Delete Icon */}
                <button
                  onClick={() => handleDelete('profile.linkedin')}
                  style={{
                    background: 'transparent',
                    border: '1px solid #ff6b6b',
                    color: '#ff6b6b',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '1rem',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                  title="Delete Contact Section"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
          <div className="contact-card" style={{
            background: 'rgba(0, 0, 0, 0.3)',
            padding: '2rem',
            borderRadius: '12px',
            border: '1px solid rgba(0, 173, 181, 0.3)',
            textAlign: 'center'
          }}>
            <div className="contact-content">
              {editingField === 'profile.linkedin' ? (
                <div className="edit-field">
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#00adb5', fontWeight: 'bold' }}>
                    LinkedIn Profile URL:
                  </label>
                  <input
                    type="url"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    placeholder="https://linkedin.com/in/your-profile"
                    style={{ 
                      fontSize: '1rem', 
                      width: '100%', 
                      padding: '0.5rem',
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid #00adb5',
                      borderRadius: '4px',
                      color: '#ffffff',
                      marginBottom: '1rem'
                    }}
                  />
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                    <button 
                      onClick={() => saveEdit('profile.linkedin')}
                      style={{ 
                        background: '#00adb5', 
                        border: 'none', 
                        color: 'white', 
                        padding: '0.5rem 1rem', 
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      Save
                    </button>
                    <button 
                      onClick={cancelEdit}
                      style={{ 
                        background: 'transparent', 
                        border: '1px solid #00adb5', 
                        color: '#00adb5', 
                        padding: '0.5rem 1rem', 
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <h3 style={{ color: '#00adb5', marginBottom: '1rem' }}>Get In Touch</h3>
                  <p style={{ marginBottom: '1.5rem', color: '#cccccc' }}>
                    I'm always open to discussing new opportunities, interesting projects, or just having a chat about technology!
                  </p>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
                    {/* Email */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ color: '#00adb5', fontSize: '1.2rem' }}>📧</span>
                      <a 
                        href={`mailto:${portfolio.profile.email}`}
                        style={{ 
                          color: '#00adb5', 
                          textDecoration: 'none',
                          fontSize: '1rem'
                        }}
                        onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                        onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                      >
                        {portfolio.profile.email}
                      </a>
                    </div>
                    
                    {/* GitHub */}
                    {portfolio.profile.github && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ color: '#00adb5', fontSize: '1.2rem' }}>🐙</span>
                        <a 
                          href={portfolio.profile.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ 
                            color: '#00adb5', 
                            textDecoration: 'none',
                            fontSize: '1rem'
                          }}
                          onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                          onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                        >
                          GitHub Profile
                        </a>
                      </div>
                    )}
                    
                    {/* LinkedIn */}
                    {portfolio.profile.linkedin ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ color: '#00adb5', fontSize: '1.2rem' }}>💼</span>
                        <a 
                          href={portfolio.profile.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ 
                            color: '#00adb5', 
                            textDecoration: 'none',
                            fontSize: '1rem'
                          }}
                          onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                          onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                        >
                          LinkedIn Profile
                        </a>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ color: '#cccccc', fontSize: '1.2rem' }}>💼</span>
                        <span style={{ color: '#cccccc', fontSize: '1rem', fontStyle: 'italic' }}>
                          No LinkedIn profile added
                        </span>
                      </div>
                    )}
                    
                    {/* Location */}
                    {portfolio.profile.location && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ color: '#00adb5', fontSize: '1.2rem' }}>📍</span>
                        <span style={{ color: '#cccccc', fontSize: '1rem' }}>
                          {portfolio.profile.location}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {isAdmin && (
                    <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(0, 173, 181, 0.3)' }}>
                      <button 
                        onClick={() => startEditing('profile.linkedin', portfolio.profile.linkedin || '')}
                        style={{ 
                          background: 'transparent', 
                          border: '1px solid #00adb5', 
                          color: '#00adb5', 
                          padding: '0.5rem 1rem', 
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.9rem'
                        }}
                      >
                        {portfolio.profile.linkedin ? 'Edit LinkedIn URL' : 'Add LinkedIn URL'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Dynamic Custom Sections for ReadOnlyPortfolio */}
        {sections
          .filter(section => !['welcome', 'skills', 'projects', 'experience', 'education', 'certifications', 'contact'].includes(section.id))
          .map((section) => (
            <section key={section.id} className="section" id={section.id}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: '1rem' }}>
                <h2 style={{ margin: 0 }}>{section.label}</h2>
              </div>
              <div className="custom-section-content">
                {portfolio[section.id] && Array.isArray(portfolio[section.id]) ? (
                  // If it's an array, render as items list (like certificates)
                  <div className="certifications">
                    {portfolio[section.id].map((item, index) => (
                      <div key={index} className="certification-card clickable">
                        <div className="certification-content">
                          <h3 className="certification-title-text">
                            {typeof item === 'string' ? item : item.title || item.name || item.label || 'Item'}
                          </h3>
                          {typeof item === 'object' && item.description && (
                            <span className="certification-year-text">
                              {item.description}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : portfolio[section.id] ? (
                  // If it's a string, render as text content
                  <div className="custom-section-card clickable">
                    <div style={{ 
                      padding: '1.5rem', 
                      background: 'rgba(0, 0, 0, 0.2)', 
                      borderRadius: '8px',
                      border: '1px solid rgba(0, 173, 181, 0.3)',
                      minHeight: '100px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <div style={{ color: '#ffffff', textAlign: 'center' }}>
                        <p>{portfolio[section.id]}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Empty state
                  <div className="custom-section-card clickable">
                    <div style={{ 
                      padding: '1.5rem', 
                      background: 'rgba(0, 0, 0, 0.2)', 
                      borderRadius: '8px',
                      border: '1px solid rgba(0, 173, 181, 0.3)',
                      minHeight: '100px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <div style={{ 
                        color: '#cccccc', 
                        textAlign: 'center',
                        fontStyle: 'italic'
                      }}>
                        <p>📝 No content available for {section.label}</p>
                        <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                          This section is empty. Content will appear here when added by the admin.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>
          ))}

        {/* Project Modal */}
        {showProjectModal && selectedProject && (
          <div className="project-modal-overlay" onClick={closeProjectModal}>
            <div className="project-modal" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close-btn" onClick={closeProjectModal}>×</button>
              
              <div className="modal-content">
                {selectedProject.imageUrl && (
                  <div className="modal-image-container">
                    <img 
                      src={`${getFullUploadUrl(selectedProject.imageUrl)}`} 
                      alt={selectedProject.title}
                      className="modal-project-image"
                    />
                  </div>
                )}
                
                <div className="modal-header">
                  <h2 className="modal-title">{selectedProject.title}</h2>
                  <div className="modal-links">
                    {selectedProject.repoUrl && (
                      <a
                        href={selectedProject.repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="modal-link"
                      >
                        📁 View Code
                      </a>
                    )}
                    {selectedProject.demoUrl && (
                      <a
                        href={selectedProject.demoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="modal-link"
                      >
                        🔗 Live Demo
                      </a>
                    )}
                  </div>
                </div>
                
                <div className="modal-description">
                  <p>{selectedProject.description}</p>
                </div>
                
                {selectedProject.techStack && selectedProject.techStack.length > 0 && (
                  <div className="modal-tech">
                    <h3>Technologies Used</h3>
                    <div className="modal-tech-tags">
                      {selectedProject.techStack.map((tech, techIndex) => (
                        <span key={techIndex} className="modal-tech-tag">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Skill Details Modal */}
        {showSkillModal && selectedSkill && (
          <div className="skill-modal-overlay" onClick={closeSkillModal}>
            <div className="skill-modal" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close-btn" onClick={closeSkillModal}>×</button>
              
              <div className="modal-content">
                <div className="modal-header">
                  <h2 className="modal-title">
                    {selectedSkill.name}
                    {selectedSkill.rating && (
                      <span className="skill-rating-large">
                        {' '}{'⭐'.repeat(selectedSkill.rating)}
                      </span>
                    )}
                  </h2>
                  <div className="skill-level">
                    <span className="skill-level-badge">{selectedSkill.level}</span>
                  </div>
                </div>
                
                <div className="skill-usage">
                  <h3>Where I Used This Skill</h3>
                  {(() => {
                    const usage = findSkillUsage(selectedSkill.name);
                    return (
                      <div className="skill-usage-content">
                        {usage.projects.length > 0 && (
                          <div className="usage-section">
                            <h4>📁 Projects</h4>
                            <div className="usage-items">
                              {usage.projects.map((project, index) => (
                                <div key={index} className="usage-item">
                                  <h5>{project.title}</h5>
                                  <p>{project.description}</p>
                                  {project.repoUrl && (
                                    <a href={project.repoUrl} target="_blank" rel="noopener noreferrer" className="usage-link">
                                      View Project →
                                    </a>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {usage.experience.length > 0 && (
                          <div className="usage-section">
                            <h4>💼 Experience</h4>
                            <div className="usage-items">
                              {usage.experience.map((exp, index) => (
                                <div key={index} className="usage-item">
                                  <h5>{exp.role} at {exp.company}</h5>
                                  <p className="duration">{exp.duration}</p>
                                  <p>{exp.details}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {usage.projects.length === 0 && usage.experience.length === 0 && (
                          <div className="no-usage">
                            <p>This skill hasn't been used in any projects or experience yet.</p>
                            <p>Add projects or experience that use this skill to see them here!</p>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Certificate Details Modal */}
        {showCertificateModal && selectedCertificate && (
          <div className="certificate-modal-overlay" onClick={closeCertificateModal}>
            <div className="certificate-modal" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close-btn" onClick={closeCertificateModal}>×</button>
              
              <div className="modal-content">
                <div className="modal-header">
                  <h2 className="modal-title">{selectedCertificate.title}</h2>
                  <div className="certification-year">
                    <p>Year: {selectedCertificate.year}</p>
                  </div>
                </div>
                
                {selectedCertificate.imageUrl && (
                  <div className="modal-image-container">
                                            {selectedCertificate.imageUrl.toLowerCase().includes('pdf') || selectedCertificate.imageUrl.toLowerCase().includes('raw') ? (
                      <div style={{
                        width: '100%',
                        height: '500px',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
                        border: '2px solid rgba(255, 255, 255, 0.2)',
                        margin: '1rem 0',
                        position: 'relative',
                        background: 'white'
                      }}>
                        {/* PDF Preview */}
                        <iframe
                          src={`${getFullUploadUrl(selectedCertificate.imageUrl)}#toolbar=1&navpanes=1&scrollbar=1&view=FitH`}
                          style={{
                            width: '100%',
                            height: '100%',
                            border: 'none',
                            borderRadius: '10px'
                          }}
                          title={`Certificate - ${selectedCertificate.title}`}
                          onError={(e) => {
                            console.error('PDF iframe failed to load:', e);
                          }}
                          onLoad={() => {
                            console.log('PDF iframe loaded successfully for:', selectedCertificate.title);
                          }}
                        />
                        <div style={{
                          position: 'absolute',
                          top: '10px',
                          right: '10px',
                          background: 'rgba(0, 0, 0, 0.7)',
                          color: 'white',
                          padding: '5px 10px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}>
                          PDF Document
                        </div>
                      </div>
                    ) : (
                      <img 
                        src={`${selectedCertificate.imageUrl}`} 
                        alt={selectedCertificate.title}
                        className="modal-certificate-image"
                        onError={(e) => {
                          console.error('Certificate image failed to load:', e);
                        }}
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Experience Modal */}
        {showExperienceModal && selectedExperience && (
          <div className="modal-overlay" onClick={closeExperienceModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={closeExperienceModal}>×</button>
              <div className="modal-header">
                <h2>{selectedExperience.role}</h2>
              </div>
              <div className="modal-body">
                <div className="experience-info">
                  <p><strong>Company:</strong> {selectedExperience.company}</p>
                  <p><strong>Duration:</strong> {selectedExperience.duration}</p>
                  <p><strong>Details:</strong></p>
                  <p>{selectedExperience.details}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Education Modal */}
        {showEducationModal && selectedEducation && (
          <div className="modal-overlay" onClick={closeEducationModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={closeEducationModal}>×</button>
              <div className="modal-header">
                <h2>{selectedEducation.degree}</h2>
              </div>
              <div className="modal-body">
                <div className="education-info">
                  <p><strong>Institution:</strong> {selectedEducation.institution}</p>
                  <p><strong>Year:</strong> {selectedEducation.year}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

// Dashboard Component
const Dashboard = () => {
  const { contextLoggedIn } = useContext(AuthContext);
  const user = contextLoggedIn ? { 
    email: localStorage.getItem('email'),
    username: localStorage.getItem('email'),
    role: 'admin'
  } : null;
  
  if (!contextLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="dashboard">
      <h1>Welcome to your Dashboard</h1>
      <p>Hello, {user.username}!</p>
      <p>Your role: {user.role}</p>
    </div>
  );
};

// Test Page Component
const TestPage = () => {
  return (
    <div className="test-page">
      <h1>Test Page</h1>
      <p>This is a test page for development purposes.</p>
    </div>
  );
};

// Main Software Engineer App Component (without Router)
const SoftwareEngineerApp = () => {
  const location = useLocation();
  const { contextLoggedIn } = useContext(AuthContext);
  
  console.log('🔍 SoftwareEngineerApp rendered');
  console.log('📍 Current location:', location.pathname);
  console.log('👤 User logged in:', contextLoggedIn);
  
  return (
    <SoftwareEngineerWrapper>
      <div className="App">
        <Routes>
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/dashboard" element={
            contextLoggedIn ? <ReadOnlyPortfolio /> : <Navigate to="/login" replace />
          } />
          <Route path="/admin" element={<Portfolio />} />
          <Route path="/example" element={<ReadOnlyPortfolio />} />
          <Route path="/" element={
            (() => {
              console.log('🚀 Default route triggered - redirecting to /admin');
              return <Navigate to="/admin" replace />;
            })()
          } />
        </Routes>
      </div>
    </SoftwareEngineerWrapper>
  );
};

export default SoftwareEngineerApp;
