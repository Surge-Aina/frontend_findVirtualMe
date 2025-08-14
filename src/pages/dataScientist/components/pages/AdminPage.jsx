import React, { useState, useEffect, useMemo } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { portfolioAPI, testimonialAPI } from '../../utils/api';
import { 
  Edit, 
  Trash2,
  Plus, 
  Save, 
  X, 
  Settings,
  User,
  Briefcase,
  GraduationCap,
  Mail,
  FileText,
  CheckCircle,
  AlertCircle,
  Calendar,
  MapPin,
  ExternalLink,
  MessageSquare,
  RefreshCw,
  Phone
} from 'lucide-react';

const AdminPage = () => {
  const { portfolio, loading, error, refetch, forceRefresh } = usePortfolio();
  const [activeTab, setActiveTab] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', type: 'success' });
  const [submitting, setSubmitting] = useState(false);
  const [testimonials, setTestimonials] = useState([]);
  const [testimonialsLoading, setTestimonialsLoading] = useState(false);

  const sections = useMemo(() => [
    { name: 'About', icon: User, data: portfolio.summary ? [{ id: 'summary', title: 'About', content: portfolio.summary }] : [], section: 'summary' },
    { name: 'Experience', icon: Briefcase, data: portfolio.experience || [], section: 'experience' },
    { name: 'Education', icon: GraduationCap, data: portfolio.education || [], section: 'education' },
    { name: 'Projects', icon: FileText, data: portfolio.projects || [], section: 'projects' },
    { name: 'Contact', icon: Mail, data: portfolio.email || portfolio.location ? [{ id: 'contact', title: 'Contact', content: { email: portfolio.email, location: portfolio.location, github: portfolio.socialLinks?.github, linkedin: portfolio.socialLinks?.linkedin } }] : [], section: 'contact' },
    { name: 'Reviews', icon: MessageSquare, data: [], section: 'testimonials' }
  ], [portfolio]);



  useEffect(() => {
    loadTestimonials();
  }, [activeTab]);

  const handleTabChange = (index) => {
    setActiveTab(index);
    setDialogOpen(false);
    setEditingItem(null);
  };

  const handleOpenDialog = (item = null) => {
    setEditingItem(item);
    if (item) {
      // Handle different content structures based on section
      const currentSection = sections[activeTab].section;
      
      if (currentSection === 'summary') {
        // About section - content is a string
        setFormData({
          title: item.title || '',
          content: item.content || '',
          company: '',
          location: '',
          description: '',
          email: '',
          github: '',
          linkedin: '',
          degrees: '',
          tags: ''
        });
      } else if (currentSection === 'contact') {
        // Contact section - nested content object
        setFormData({
          title: item.title || '',
          content: '',
          company: '',
          location: item.content?.location || '',
          description: '',
          email: item.content?.email || '',
          github: item.content?.github || '',
          linkedin: item.content?.linkedin || '',
          degrees: '',
          tags: ''
        });
      } else if (currentSection === 'experience') {
        // Experience section - direct properties
        setFormData({
          title: item.title || '',
          content: '',
          company: item.company || '',
          location: item.location || '',
          description: Array.isArray(item.description) ? item.description.join('\n') : (item.description || ''),
          email: '',
          github: '',
          linkedin: '',
          degrees: '',
          tags: ''
        });
      } else if (currentSection === 'education') {
        // Education section - direct properties
        setFormData({
          title: item.school || '',
          content: '',
          company: '',
          location: '',
          description: item.description || '',
          email: '',
          github: '',
          linkedin: '',
          degrees: Array.isArray(item.degrees) ? item.degrees.join(', ') : (item.degrees || ''),
          tags: ''
        });
      } else if (currentSection === 'projects') {
        // Projects section - direct properties
        setFormData({
          title: item.title || '',
          content: '',
          company: '',
          location: '',
          description: item.description || '',
          email: '',
          github: '',
          linkedin: '',
          degrees: '',
          tags: Array.isArray(item.tags) ? item.tags.join(', ') : (item.tags || '')
        });
      } else {
        // Default fallback
        setFormData({
          title: item.title || '',
          content: '',
          company: '',
          location: '',
          description: '',
          email: '',
          github: '',
          linkedin: '',
          degrees: '',
          tags: ''
        });
      }
    } else {
      // New item - empty form
      setFormData({ 
        title: '', 
        content: '', 
        company: '', 
        location: '', 
        description: '', 
        email: '', 
        github: '', 
        linkedin: '', 
        degrees: '', 
        tags: '' 
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingItem(null);
    setFormData({});
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const loadTestimonials = async () => {
    try {
      setTestimonialsLoading(true);
      console.log('Loading testimonials...');
      const data = await testimonialAPI.getAllTestimonials();
      console.log('Testimonials loaded:', data);
      // Add section property to each testimonial for proper rendering
      const testimonialsWithSection = data.map(testimonial => ({
        ...testimonial,
        section: 'testimonials'
      }));
      console.log('Testimonials with section:', testimonialsWithSection);
      setTestimonials(testimonialsWithSection);
    } catch (error) {
      console.error('Error loading reviews:', error);
      setSnackbar({ open: true, message: 'Error loading reviews', type: 'error' });
    } finally {
      setTestimonialsLoading(false);
    }
  };

  const handleApproveTestimonial = async (id, isApproved) => {
    try {
      await testimonialAPI.approveTestimonial(id, isApproved);
      setSnackbar({ 
        open: true, 
        message: `Review ${isApproved ? 'approved' : 'rejected'} successfully`, 
        type: 'success' 
      });
      loadTestimonials();
    } catch (error) {
      console.error('Error updating review:', error);
      setSnackbar({ open: true, message: 'Error updating review', type: 'error' });
    }
  };

  const handleDeleteTestimonial = async (id) => {
    if (!window.confirm('Are you sure you want to delete this review?')) {
      return;
    }
    
    console.log('Attempting to delete testimonial with ID:', id);
    
    try {
      const result = await testimonialAPI.deleteTestimonial(id);
      console.log('Delete result:', result);
      setSnackbar({ open: true, message: 'Review deleted successfully', type: 'success' });
      loadTestimonials();
    } catch (error) {
      console.error('Error deleting review:', error);
      console.error('Error details:', error.response?.data);
      setSnackbar({ 
        open: true, 
        message: error.response?.data?.message || 'Error deleting review', 
        type: 'error' 
      });
    }
  };

  const parseContent = (content, section) => {
    if (section === 'experience') {
      const result = {};
      
      result.company = formData.company || '';
      result.location = formData.location || '';
      result.description = formData.description ? formData.description.split('\n').filter(line => line.trim()) : [];
      
      return result;
    } else if (section === 'education') {
      // For education, combine degrees and description
      const result = {};
      if (formData.degrees) {
        result.degrees = formData.degrees.split(',').map(deg => deg.trim()).filter(deg => deg);
      }
      if (formData.description) {
        result.description = formData.description;
      }
      return result;
    } else if (section === 'contact') {
      const result = {};
      
      if (formData.email) {
        result.email = formData.email;
      }
      if (formData.location) {
        result.location = formData.location;
      }
      if (formData.github) {
        result.github = formData.github;
      }
      if (formData.linkedin) {
        result.linkedin = formData.linkedin;
      }
      
      return result;
    } else if (section === 'projects') {
      const result = {};
      
      // Handle description
      if (formData.description) {
        result.description = formData.description;
      }
      
      // Add tags if provided
      if (formData.tags) {
        result.tags = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      }
      
      return result;
    }
    
    return content;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const currentSection = sections[activeTab].section;
    
    // For contact section, title is optional (we'll use a default)
    if (currentSection !== 'contact' && !formData.title.trim()) {
      setSnackbar({
        open: true,
        message: 'Title is required!',
        type: 'error'
      });
      return;
    }

    setSubmitting(true);
    
    try {
      const currentSection = sections[activeTab].section;
      let parsedContent;
      
      if (currentSection === 'experience' || currentSection === 'education' || currentSection === 'projects' || currentSection === 'contact') {
        parsedContent = parseContent('', currentSection);
      } else {
        parsedContent = parseContent(formData.content, currentSection);
      }
      
      if (editingItem) {
        // Update existing item
        if (currentSection === 'summary') {
          await portfolioAPI.updatePortfolio({ summary: formData.content });
        } else if (currentSection === 'contact') {
          await portfolioAPI.updatePortfolio({
            email: formData.email,
            location: formData.location,
            socialLinks: {
              github: formData.github,
              linkedin: formData.linkedin
            }
          });
        } else {
          // For experience, education, and projects, use individual item updates
          const updateData = {
            section: currentSection,
            content: parsedContent
          };
          
          if (currentSection === 'experience') {
            updateData.content = {
              title: formData.title,
              company: parsedContent.company,
              location: parsedContent.location,
              description: parsedContent.description
            };
          } else if (currentSection === 'education') {
            updateData.content = {
              school: formData.title,
              degrees: parsedContent.degrees,
              description: parsedContent.description
            };
          } else if (currentSection === 'projects') {
            updateData.content = {
              title: formData.title,
              description: parsedContent.description,
              tags: parsedContent.tags
            };
          }
          
          await portfolioAPI.updatePortfolioItem(editingItem._id, updateData);
        }
        
        setSnackbar({
          open: true,
          message: 'Item updated successfully!',
          type: 'success'
        });
      } else {
        // Add new item
        if (currentSection === 'summary') {
          await portfolioAPI.updatePortfolio({ summary: formData.content });
        } else if (currentSection === 'contact') {
          await portfolioAPI.updatePortfolio({
            email: formData.email,
            location: formData.location,
            socialLinks: {
              github: formData.github,
              linkedin: formData.linkedin
            }
          });
        } else {
          // For experience, education, and projects, use individual item additions
          const itemData = {
            section: currentSection,
            content: parsedContent
          };
          
          if (currentSection === 'experience') {
            itemData.content = {
              title: formData.title,
              company: parsedContent.company,
              location: parsedContent.location,
              description: parsedContent.description
            };
          } else if (currentSection === 'education') {
            itemData.content = {
              school: formData.title,
              degrees: parsedContent.degrees,
              description: parsedContent.description
            };
          } else if (currentSection === 'projects') {
            itemData.content = {
              title: formData.title,
              description: parsedContent.description,
              tags: parsedContent.tags
            };
          }
          
          await portfolioAPI.addPortfolioItem(itemData);
        }
        
        setSnackbar({
          open: true,
          message: 'Item added successfully!',
          type: 'success'
        });
      }
      
      // Refresh the portfolio data
      await forceRefresh();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving item:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error saving item. Please try again.',
        type: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteItem = async (item) => {
    if (!window.confirm('Are you sure you want to delete this item?')) {
      return;
    }
    
    try {
      const currentSection = sections[activeTab].section;
      
      if (currentSection === 'summary' || currentSection === 'contact') {
        // For summary and contact, we need to update the entire portfolio
        const { _id, ...currentPortfolio } = portfolio;
        
        if (currentSection === 'summary') {
          currentPortfolio.summary = '';
        } else if (currentSection === 'contact') {
          currentPortfolio.email = '';
          currentPortfolio.location = '';
          currentPortfolio.socialLinks = {};
        }
        
        await portfolioAPI.updatePortfolio(currentPortfolio);
      } else {
        // For experience, education, and projects, use individual item deletion
        await portfolioAPI.deletePortfolioItem(item._id, currentSection);
      }
      
      setSnackbar({
        open: true,
        message: 'Item deleted successfully!',
        type: 'success'
      });
      
      // Refresh the portfolio data
      await forceRefresh();
    } catch (error) {
      console.error('Error deleting item:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error deleting item. Please try again.',
        type: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ open: false, message: '', type: 'success' });
  };

  // Helper function to remove custom id fields from nested objects (keep MongoDB _id)
  const removeIdFields = (obj) => {
    if (Array.isArray(obj)) {
      return obj.map(item => {
        const { id, ...cleanItem } = item;
        return cleanItem;
      });
    }
    return obj;
  };

  const renderContent = (item) => {
    // Handle contact items
    if (item.content && (item.content.email || item.content.location || item.content.github || item.content.linkedin)) {
      return (
        <div className="space-y-2">
          {item.content.email && (
            <div className="flex items-center text-sm text-terminal-textMuted">
              <Mail className="h-4 w-4 mr-2" />
              <a href={`mailto:${item.content.email}`} className="text-terminal-accent hover:underline">
                {item.content.email}
              </a>
            </div>
          )}
          {item.content.location && (
            <div className="flex items-center text-sm text-terminal-textMuted">
              <MapPin className="h-4 w-4 mr-2" />
              <span>{item.content.location}</span>
            </div>
          )}
          {item.content.github && (
            <div className="flex items-center text-sm text-terminal-textMuted">
              <ExternalLink className="h-4 w-4 mr-2" />
              <a href={item.content.github} target="_blank" rel="noopener noreferrer" className="text-terminal-accent hover:underline">
                GitHub
              </a>
            </div>
          )}
          {item.content.linkedin && (
            <div className="flex items-center text-sm text-terminal-textMuted">
              <ExternalLink className="h-4 w-4 mr-2" />
              <a href={item.content.linkedin} target="_blank" rel="noopener noreferrer" className="text-terminal-accent hover:underline">
                LinkedIn
              </a>
            </div>
          )}
        </div>
      );
    }
    
    // Handle experience items
    if (item.company || item.location || item.description) {
      return (
        <div className="space-y-2">
          {item.company && (
            <div className="flex items-center text-sm text-terminal-textMuted">
              <Briefcase className="h-4 w-4 mr-2" />
              <span className="font-medium">{item.company}</span>
            </div>
          )}
          {item.location && (
            <div className="flex items-center text-sm text-terminal-textMuted">
              <MapPin className="h-4 w-4 mr-2" />
              <span>{item.location}</span>
            </div>
          )}
          {item.description && (
            <div className="space-y-1">
              {Array.isArray(item.description) ? (
                <ul className="space-y-1">
                  {item.description.map((desc, index) => (
                    <li key={index} className="text-terminal-textMuted text-sm flex items-start">
                      <span className="text-terminal-accent mr-2 mt-1">•</span>
                      <span>{desc}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-terminal-textMuted text-sm">{item.description}</p>
              )}
            </div>
          )}
        </div>
      );
    }
    
    // Handle education items
    if (item.school || item.degrees || item.description) {
      return (
        <div className="space-y-2">
          {item.degrees && (
            <div className="flex items-center text-sm text-terminal-textMuted">
              <GraduationCap className="h-4 w-4 mr-2" />
              <span className="font-medium">{Array.isArray(item.degrees) ? item.degrees.join(', ') : item.degrees}</span>
            </div>
          )}
          {item.description && (
            <p className="text-terminal-textMuted text-sm">{item.description}</p>
          )}
        </div>
      );
    }
    
    // Handle project items
    if (item.description || item.tags) {
      return (
        <div className="space-y-2">
          {item.description && (
            <p className="text-terminal-textMuted text-sm">{item.description}</p>
          )}
          {item.tags && (
            <div className="flex flex-wrap gap-1 mt-2">
              {Array.isArray(item.tags) ? (
                item.tags.map((tag, index) => (
                  <span key={index} className="tech-badge">
                    {tag}
                  </span>
                ))
              ) : (
                <span className="tech-badge">{item.tags}</span>
              )}
            </div>
          )}
        </div>
      );
    }
    
    // Handle content as string (for about section)
    if (typeof item.content === 'string') {
      return <p className="text-terminal-textMuted text-sm">{item.content}</p>;
    }
    
    // Fallback for any other structure
    return <p className="text-terminal-textMuted text-sm">No content available</p>;
  };

  const renderFormFields = () => {
    const currentSection = sections[activeTab].section;
    
    if (currentSection === 'contact') {
      return (
        <>
          <div>
            <label className="block text-sm font-medium text-terminal-text mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email || ''}
              onChange={handleFormChange}
              className="input-field"
              placeholder="your.email@example.com"
              disabled={submitting}
            />
          </div>



          <div>
            <label className="block text-sm font-medium text-terminal-text mb-2">
              Location
            </label>
            <input
              type="text"
              name="location"
              value={formData.location || ''}
              onChange={handleFormChange}
              className="input-field"
              placeholder="City, State/Country"
              disabled={submitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-terminal-text mb-2">
              GitHub URL
            </label>
            <input
              type="url"
              name="github"
              value={formData.github || ''}
              onChange={handleFormChange}
              className="input-field"
              placeholder="https://github.com/yourusername"
              disabled={submitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-terminal-text mb-2">
              LinkedIn URL
            </label>
            <input
              type="url"
              name="linkedin"
              value={formData.linkedin || ''}
              onChange={handleFormChange}
              className="input-field"
              placeholder="https://linkedin.com/in/yourusername"
              disabled={submitting}
            />
          </div>
        </>
      );
    } else if (currentSection === 'experience') {
      return (
        <>
          <div>
            <label className="block text-sm font-medium text-terminal-text mb-2">
              Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title || ''}
              onChange={handleFormChange}
              className="input-field"
              placeholder="e.g., Software Engineer"
              required
              disabled={submitting}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-terminal-text mb-2">
                Company
              </label>
              <input
                type="text"
                name="company"
                value={formData.company || ''}
                onChange={handleFormChange}
                className="input-field"
                placeholder="e.g., Google"
                disabled={submitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-terminal-text mb-2">
                Location
              </label>
              <input
                type="text"
                name="location"
                value={formData.location || ''}
                onChange={handleFormChange}
                className="input-field"
                placeholder="e.g., San Francisco, CA"
                disabled={submitting}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-terminal-text mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description || ''}
              onChange={handleFormChange}
              rows={4}
              className="input-field resize-none"
              placeholder="Enter your responsibilities and achievements (one per line)"
              disabled={submitting}
            />
            <p className="text-xs text-terminal-textMuted mt-1">
              Enter each responsibility or achievement on a new line
            </p>
          </div>
        </>
      );
    } else if (currentSection === 'education') {
      return (
        <>
          <div>
            <label className="block text-sm font-medium text-terminal-text mb-2">
              Institution *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title || ''}
              onChange={handleFormChange}
              className="input-field"
              placeholder="e.g., Stanford University"
              required
              disabled={submitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-terminal-text mb-2">
              Degrees (comma-separated)
            </label>
            <input
              type="text"
              name="degrees"
              value={formData.degrees || ''}
              onChange={handleFormChange}
              className="input-field"
              placeholder="e.g., Bachelor of Science in Computer Science, Minor in Mathematics"
              disabled={submitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-terminal-text mb-2">
              Additional Details
            </label>
            <textarea
              name="description"
              value={formData.description || ''}
              onChange={handleFormChange}
              rows={3}
              className="input-field resize-none"
              placeholder="GPA, honors, relevant coursework, etc."
              disabled={submitting}
            />
          </div>
        </>
      );
    } else if (currentSection === 'projects') {
      return (
        <>
          <div>
            <label className="block text-sm font-medium text-terminal-text mb-2">
              Project Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title || ''}
              onChange={handleFormChange}
              className="input-field"
              placeholder="e.g., E-commerce Platform"
              required
              disabled={submitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-terminal-text mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description || ''}
              onChange={handleFormChange}
              rows={4}
              className="input-field resize-none"
              placeholder="Describe your project, technologies used, and key features"
              disabled={submitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-terminal-text mb-2">
              Technologies (comma-separated)
            </label>
            <input
              type="text"
              name="tags"
              value={formData.tags || ''}
              onChange={handleFormChange}
              className="input-field"
              placeholder="e.g., React, Node.js, MongoDB"
              disabled={submitting}
            />
          </div>
        </>
      );
    } else {
      // Default for about section
      return (
        <div>
          <label className="block text-sm font-medium text-terminal-text mb-2">
            Content *
          </label>
          <textarea
            name="content"
            value={formData.content || ''}
            onChange={handleFormChange}
            rows={6}
            className="input-field resize-none"
            placeholder="Enter your about content..."
            required
            disabled={submitting}
          />
        </div>
      );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-terminal-accent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-terminal-error text-lg">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="terminal-window p-6 animate-slide-up">
        <div className="text-center">
          <h1 className="section-title">Admin Dashboard</h1>
          <p className="section-subtitle">
            Manage your portfolio content with ease
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="terminal-window animate-slide-up">
        <nav className="flex space-x-1 p-1">
          {sections.map((section, index) => {
            const Icon = section.icon;
            return (
              <button
                key={section.name}
                onClick={() => handleTabChange(index)}
                className={`flex items-center space-x-2 py-3 px-4 rounded-terminal font-medium text-sm transition-all duration-200 font-mono ${
                  activeTab === index
                    ? 'bg-terminal-accent text-terminal-bg shadow-sm'
                    : 'text-terminal-textDim hover:text-terminal-text hover:bg-terminal-selection'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{section.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      <div className="terminal-window p-6 animate-slide-up">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-terminal-text">
              {sections[activeTab].name}
            </h2>
            <p className="text-terminal-textDim mt-1">
              Manage your {sections[activeTab].name === 'Reviews' ? 'reviews' : sections[activeTab].name.toLowerCase()} information
            </p>
          </div>
          <div className="flex gap-3">
            {sections[activeTab].name !== 'About' && sections[activeTab].name !== 'Reviews' && (
              <button
                onClick={() => handleOpenDialog()}
                className="btn-primary flex items-center shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add {sections[activeTab].name === 'About' ? 'About' : 
                      sections[activeTab].name === 'Contact' ? 'Contact' : 
                      sections[activeTab].name === 'Education' ? 'Education' : 
                      sections[activeTab].name === 'Experience' ? 'Experience' : 
                      sections[activeTab].name === 'Projects' ? 'Project' : 
                      sections[activeTab].name.slice(0, -1)}
              </button>
            )}
            {sections[activeTab].name === 'Reviews' && (
              <button
                onClick={loadTestimonials}
                disabled={testimonialsLoading}
                className="btn-primary flex items-center shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${testimonialsLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {/* Other Sections */}
          {sections[activeTab].data.map((item, index) => (
            <div key={item.id || index} className="card">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-terminal-text mb-3">
                    {item.section === 'testimonials' ? item.name : (item.title || item.school || 'Untitled')}
                  </h3>
                  {renderContent(item)}
                </div>
                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => handleOpenDialog(item)}
                    className="p-2 text-terminal-accent hover:bg-terminal-accent/10 rounded-terminal transition-colors duration-200"
                    title="Edit"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteItem(item)}
                    className="p-2 text-terminal-error hover:bg-terminal-error/10 rounded-terminal transition-colors duration-200"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Reviews Section */}
          {sections[activeTab].name === 'Reviews' && (
            <>
              {testimonials.map((item, index) => (
                <div key={item._id || index} className="border border-terminal-border rounded-terminal p-4 hover:shadow-terminal transition-shadow duration-200 bg-terminal-bg">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-terminal-text mb-3">
                        {item.name}
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <div className="flex">
                            {[...Array(5)].map((_, index) => (
                              <svg
                                key={index}
                                className={`w-4 h-4 ${
                                  index < item.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                }`}
                                viewBox="0 0 20 20"
                              >
                                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                              </svg>
                            ))}
                          </div>
                          <span className="text-sm text-terminal-textMuted">({item.rating}/5)</span>
                        </div>
                        <p className="text-terminal-text text-sm">&ldquo;{item.review}&rdquo;</p>
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium text-terminal-text">{item.name}</span>
                          <span className="text-terminal-textMuted">{item.email}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            item.isApproved 
                              ? 'bg-terminal-success/20 text-terminal-success' 
                              : 'bg-terminal-warning/20 text-terminal-warning'
                          }`}>
                            {item.isApproved ? 'Approved' : 'Pending'}
                          </span>
                          <span className="text-xs text-terminal-textMuted">
                            {new Date(item.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      {!item.isApproved && (
                        <button
                          onClick={() => handleApproveTestimonial(item._id, true)}
                          className="p-2 text-terminal-success hover:bg-terminal-success/10 rounded-terminal transition-colors duration-200"
                          title="Approve"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                      )}
                      {item.isApproved && (
                        <button
                          onClick={() => handleApproveTestimonial(item._id, false)}
                          className="p-2 text-terminal-warning hover:bg-terminal-warning/10 rounded-terminal transition-colors duration-200"
                          title="Reject"
                        >
                          <AlertCircle className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteTestimonial(item._id)}
                        className="p-2 text-terminal-error hover:bg-terminal-error/10 rounded-terminal transition-colors duration-200 border border-red-300"
                        title="Delete"
                        style={{ backgroundColor: '#fef2f2' }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}

          {sections[activeTab].data.length === 0 && sections[activeTab].name !== 'Reviews' && (
            <div className="text-center py-8">
              <p className="text-terminal-textMuted">No {sections[activeTab].name.toLowerCase()} items found.</p>
            </div>
          )}
        </div>
      </div>

      {/* Dialog */}
      {dialogOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="terminal-window max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="terminal-header">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-terminal-error rounded-full"></div>
                <div className="w-3 h-3 bg-terminal-warning rounded-full"></div>
                <div className="w-3 h-3 bg-terminal-success rounded-full"></div>
              </div>
              <span className="text-terminal-textMuted text-sm font-mono">
                {editingItem ? 'edit' : 'add'}_{sections[activeTab].name.toLowerCase()}.sh
              </span>
              <button
                onClick={handleCloseDialog}
                className="p-1 text-terminal-textMuted hover:text-terminal-text hover:bg-terminal-selection rounded transition-colors duration-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <div className="terminal-body">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-terminal-text">
                  {editingItem ? 'Edit' : 'Add'} {sections[activeTab].name === 'About' ? 'About' : 
                    sections[activeTab].name === 'Contact' ? 'Contact' : 
                    sections[activeTab].name === 'Education' ? 'Education' : 
                    sections[activeTab].name === 'Experience' ? 'Experience' : 
                    sections[activeTab].name === 'Projects' ? 'Project' : 
                    sections[activeTab].name.slice(0, -1)}
                </h3>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {renderFormFields()}

                <div className="flex justify-end space-x-3 pt-4 border-t border-terminal-border">
                  <button
                    type="button"
                    onClick={handleCloseDialog}
                    className="btn-secondary"
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary flex items-center"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    {submitting ? 'Saving...' : (editingItem ? 'Update' : 'Save')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Snackbar */}
      {snackbar.open && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className={`terminal-window p-4 flex items-center max-w-sm ${
            snackbar.type === 'success' 
              ? 'border-terminal-success' 
              : 'border-terminal-error'
          }`}>
            {snackbar.type === 'success' ? (
              <CheckCircle className="h-5 w-5 text-terminal-success mr-3 flex-shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 text-terminal-error mr-3 flex-shrink-0" />
            )}
            <p className={`text-sm font-mono ${
              snackbar.type === 'success' ? 'text-terminal-success' : 'text-terminal-error'
            }`}>
              {snackbar.message}
            </p>
            <button
              onClick={handleCloseSnackbar}
              className="ml-4 text-terminal-textMuted hover:text-terminal-text flex-shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
