import React, { useState, useEffect } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { Code, BarChart3, TrendingUp, Filter, Download, X, ExternalLink, Calendar, MapPin, RefreshCw } from 'lucide-react';

const ProjectsPage = () => {
  const { portfolio, loading, error } = usePortfolio();
  const [showDashboard, setShowDashboard] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

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
        <div className="text-terminal-error text-lg">Error loading projects: {error}</div>
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="text-center py-8">
        <div className="text-terminal-error text-lg">No portfolio data available</div>
      </div>
    );
  }

  const projects = portfolio?.projects || [];

  // Add the interactive dashboard as a special project
  const allProjects = [
    {
      id: 'interactive-dashboard',
      title: 'Interactive Data Visualization Dashboard',
      content: { 
        description: ['A dynamic dashboard showcasing data analysis and visualization skills. Click to explore interactive charts and real-time data filtering.'],
        technologies: 'React, D3.js, Chart.js, Data Analysis',
        tags: ['React', 'D3.js', 'Chart.js', 'Data Analysis', 'JavaScript', 'Interactive']
      },
      isInteractive: true
    },
    ...projects
  ];

  const handleProjectClick = (project) => {
    if (project.isInteractive) {
      setShowDashboard(true);
    } else {
      setSelectedProject(project);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      <div className="text-center animate-slide-up">
        <h1 className="section-title text-2xl sm:text-3xl lg:text-4xl">My Projects</h1>
        <p className="section-subtitle text-center text-sm sm:text-base">
          Here are some of the projects I&apos;ve worked on. Click on any project to learn more.
        </p>
      </div>
      
      {allProjects.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 animate-slide-up">
          {allProjects.slice(0, 9).map((project, index) => (
            <div 
              key={project.id || index}
              className={`card h-full flex flex-col transition-all duration-300 hover:shadow-terminal-lg hover:-translate-y-1 cursor-pointer ${
                project.isInteractive ? 'border-2 border-terminal-accent/30 hover:border-terminal-accent/50' : ''
              }`}
              onClick={() => handleProjectClick(project)}
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg sm:text-xl font-semibold text-terminal-text leading-tight">
                  {project.title}
                </h3>
                {project.isInteractive ? (
                  <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-terminal-accent flex-shrink-0" />
                ) : (
                  <Code className="h-4 w-4 sm:h-5 sm:w-5 text-terminal-accent flex-shrink-0" />
                )}
              </div>
              
              <div className="flex-grow mb-4">
                {project.description && (
                  <p className="text-terminal-textDim text-xs sm:text-sm leading-relaxed">
                    {project.description.length > 80 
                      ? `${project.description.substring(0, 80)}...` 
                      : project.description
                    }
                  </p>
                )}
              </div>
              
              <div className="mt-auto">
                {/* Show tags if available, otherwise show technologies */}
                {project.tags ? (
                  <div className="flex flex-wrap gap-1 sm:gap-2 mb-3">
                    {project.tags
                      .slice(0, 3)
                      .map((tag, i) => (
                        <span 
                          key={i} 
                          className="tech-badge text-xs px-2 py-1"
                        >
                          {tag}
                        </span>
                      ))
                    }
                  </div>
                ) : project.content?.technologies && (
                  <div className="flex flex-wrap gap-1 sm:gap-2 mb-3">
                    {project.content.technologies
                      .split(',')
                      .slice(0, 3)
                      .map((tech, i) => (
                        <span 
                          key={i} 
                          className="tech-badge text-xs px-2 py-1"
                        >
                          {tech.trim()}
                        </span>
                      ))
                    }
                  </div>
                )}
                {project.isInteractive && (
                  <div className="mt-3 flex items-center text-terminal-accent text-xs sm:text-sm font-medium">
                    <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    Click to interact
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 sm:py-12">
          <div className="text-terminal-textMuted text-base sm:text-lg">No projects available.</div>
        </div>
      )}

      {/* Project Details Modal */}
      {selectedProject && (
        <ProjectDetailsModal 
          project={selectedProject} 
          onClose={() => setSelectedProject(null)} 
        />
      )}

      {/* Interactive Dashboard Modal */}
      {showDashboard && (
        <InteractiveDashboard onClose={() => setShowDashboard(false)} />
      )}
    </div>
  );
};

// Project Details Modal Component
const ProjectDetailsModal = ({ project, onClose }) => {
  const renderProjectContent = () => {
    if (typeof project.content === 'string') {
      return <p className="text-terminal-output text-sm sm:text-base">{project.content}</p>;
    }
    
    if (project.content && typeof project.content === 'object') {
      // Handle experience items
      if (project.content?.period && project.content?.location) {
        return (
          <div className="space-y-3 sm:space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center text-xs sm:text-sm text-terminal-textMuted space-y-1 sm:space-y-0">
              <div className="flex items-center">
                <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span>{project.content.period}</span>
              </div>
              <span className="hidden sm:inline mx-2">•</span>
              <div className="flex items-center">
                <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span>{project.content.location}</span>
              </div>
            </div>
            {project.content?.description && (
              <ul className="space-y-2">
                {project.content.description.map((desc, index) => (
                  <li key={index} className="text-terminal-output text-xs sm:text-sm flex items-start">
                    <span className="text-terminal-accent mr-2 mt-1">•</span>
                    <span>{desc}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      }
      
      // Handle project items
      if (project.description) {
        return (
          <div className="space-y-3 sm:space-y-4">
            <p className="text-terminal-output text-sm sm:text-base">{project.description}</p>
            {project.technologies && (
              <div className="flex flex-wrap gap-1 sm:gap-2 mt-3 sm:mt-4">
                {project.technologies.split(',').map((tech, index) => (
                  <span key={index} className="tech-badge text-xs px-2 py-1">
                    {tech.trim()}
                  </span>
                ))}
              </div>
            )}
            {project.tags && (
              <div className="flex flex-wrap gap-1 sm:gap-2 mt-3 sm:mt-4">
                {project.tags.map((tag, index) => (
                  <span key={index} className="tech-badge text-xs px-2 py-1">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        );
      }
      
      return <p className="text-terminal-output text-sm sm:text-base">No content available</p>;
    }
    
    return <p className="text-terminal-output text-sm sm:text-base">No content available</p>;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="terminal-window max-w-2xl w-full max-h-[95vh] overflow-y-auto">
        <div className="terminal-header">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-terminal-error rounded-full"></div>
            <div className="w-3 h-3 bg-terminal-warning rounded-full"></div>
            <div className="w-3 h-3 bg-terminal-success rounded-full"></div>
          </div>
          <span className="text-terminal-textMuted text-xs sm:text-sm font-mono">project_details.sh</span>
          <button
            onClick={onClose}
            className="p-1 text-terminal-textMuted hover:text-terminal-text hover:bg-terminal-selection rounded transition-colors duration-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        
        <div className="terminal-body">
          <div className="space-y-4 sm:space-y-6">
            {/* Project Title */}
            <div>
              <div className="terminal-prompt text-xs sm:text-sm">$ cat project_title.txt</div>
              <div className="terminal-command mt-2 text-lg sm:text-xl font-bold text-terminal-text">
                {project.title}
              </div>
            </div>

            {/* Project Description */}
            <div>
              <div className="terminal-prompt text-xs sm:text-sm">$ cat description.md</div>
              <div className="terminal-output mt-2">
                {renderProjectContent()}
              </div>
            </div>

            {/* Project Links */}
            {project.content?.links && (
              <div>
                <div className="terminal-prompt text-xs sm:text-sm">$ ls -la links/</div>
                <div className="terminal-output mt-2">
                  <div className="flex flex-wrap gap-2">
                    {project.content.links.map((link, index) => (
                      <a
                        key={index}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1 text-terminal-accent hover:text-terminal-text transition-colors duration-200 text-xs sm:text-sm"
                      >
                        <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span>{link.label || 'View Project'}</span>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Interactive Dashboard Component
const InteractiveDashboard = ({ onClose }) => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [dataRange, setDataRange] = useState(12);
  const [showDataInput, setShowDataInput] = useState(false);
  const [xAxisLabel, setXAxisLabel] = useState('Months');
  const [yAxisLabel, setYAxisLabel] = useState('Revenue ($)');
  const [chartTitle, setChartTitle] = useState('Revenue Trend');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Get data from API or use default
  const getStoredData = () => {
    return {
      sales: [120, 190, 300, 500, 200, 300, 450, 380, 420, 280, 350, 400],
      revenue: [15000, 22000, 35000, 48000, 25000, 32000, 42000, 38000, 45000, 30000, 38000, 42000],
      categories: ['Electronics', 'Clothing', 'Books', 'Home', 'Sports'],
      categoryData: [35, 25, 20, 15, 5],
      xLabels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      hiddenPoints: [] // Array of indices to hide
    };
  };

  const [sampleData, setSampleData] = useState(getStoredData);

  // Load data from API on component mount
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        console.log('Loading dashboard data...'); // Debug log
        const response = await fetch(`${import.meta.env.VITE_BACKEND_API}/dashboard`);
        console.log('Response status:', response.status); // Debug log
        
        if (response.ok) {
          const data = await response.json();
          console.log('Dashboard data received:', data); // Debug log
          
          if (data) {
            // Check if the API returned empty data arrays and use fallback
            const hasValidData = data.data?.revenue && data.data.revenue.length > 0;
            const newSampleData = {
              sales: hasValidData ? data.data.sales : getStoredData().sales,
              revenue: hasValidData ? data.data.revenue : getStoredData().revenue,
              categories: data.categories || getStoredData().categories,
              categoryData: data.categoryData || getStoredData().categoryData,
              xLabels: hasValidData ? data.data.xLabels : getStoredData().xLabels,
              hiddenPoints: data.data?.hiddenPoints || []
            };
            
            console.log('Setting sample data:', newSampleData); // Debug log
            setSampleData(newSampleData);
            setChartTitle(data.chartTitle || 'Revenue Trend');
            setXAxisLabel(data.xAxisLabel || 'Months');
            setYAxisLabel(data.yAxisLabel || 'Revenue ($)');
            setDataRange(data.data?.revenue?.length || 12);
          }
        } else {
          console.warn('Dashboard API returned non-OK status:', response.status);
          // Fall back to default data
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        // Fall back to default data
      } finally {
        setLoading(false);
      }
    };

    // Check if user is admin
    const token = localStorage.getItem('token');
    setIsAdmin(!!token);

    loadDashboardData();
  }, []);

  // Save data to API
  const saveDataToAPI = async (newData) => {
    setSaving(true);
    try {
      // Convert empty values to 0 for database storage
      const cleanData = {
        ...newData,
        revenue: newData.revenue.map(value => value === '' ? 0 : value),
        sales: newData.sales.map(value => value === '' ? 0 : value)
      };
      
      const response = await fetch(`${import.meta.env.VITE_BACKEND_API}/dashboard`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          chartTitle,
          xAxisLabel,
          yAxisLabel,
          data: cleanData,
          categories: cleanData.categories,
          categoryData: cleanData.categoryData
        })
      });
      
      if (response.ok) {
        console.log('Dashboard data saved successfully');
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000); // Hide success message after 3 seconds
      } else {
        console.error('Failed to save dashboard data:', response.status);
      }
    } catch (error) {
      console.error('Error saving dashboard data:', error);
    } finally {
      setSaving(false);
    }
  };

  // Save data to sessionStorage and API
  const saveData = (newData) => {
    setSampleData(newData);
    sessionStorage.setItem('dashboardData', JSON.stringify(newData));
    
    // Always save to API (no token required for this demo)
    saveDataToAPI(newData);
  };

  // Handle data input
  const handleDataInput = (type, index, value) => {
    const newData = { ...sampleData };
    if (type === 'revenue') {
      // Allow empty string, convert to 0 only when saving
      newData.revenue[index] = value === '' ? '' : parseInt(value) || 0;
    } else if (type === 'sales') {
      newData.sales[index] = value === '' ? '' : parseInt(value) || 0;
    } else if (type === 'xLabel') {
      newData.xLabels[index] = value;
    }
    saveData(newData);
  };

  // Toggle visibility of a data point
  const togglePointVisibility = (index) => {
    const newData = { ...sampleData };
    if (!newData.hiddenPoints) {
      newData.hiddenPoints = [];
    }
    
    const hiddenIndex = newData.hiddenPoints.indexOf(index);
    if (hiddenIndex > -1) {
      // Show the point
      newData.hiddenPoints.splice(hiddenIndex, 1);
    } else {
      // Hide the point
      newData.hiddenPoints.push(index);
    }
    
    saveData(newData);
  };

  // Delete a data point completely
  const deleteDataPoint = (index) => {
    const newData = { ...sampleData };
    
    // Remove the data point from all arrays
    newData.revenue.splice(index, 1);
    newData.sales.splice(index, 1);
    newData.xLabels.splice(index, 1);
    
    // Update hidden points indices (shift them down if needed)
    if (newData.hiddenPoints) {
      newData.hiddenPoints = newData.hiddenPoints
        .filter(i => i !== index) // Remove the deleted index
        .map(i => i > index ? i - 1 : i); // Shift down indices after the deleted point
    }
    
    saveData(newData);
    setDataRange(Math.min(dataRange, newData.revenue.length));
  };

  // Add new data point
  const addDataPoint = () => {
    const newData = { ...sampleData };
    newData.revenue.push(0);
    newData.sales.push(0);
    newData.xLabels.push(`Month ${newData.revenue.length}`);
    saveData(newData);
    setDataRange(newData.revenue.length);
  };

  // Remove last data point
  const removeDataPoint = () => {
    if (sampleData.revenue.length > 1) {
      const newData = { ...sampleData };
      newData.revenue.pop();
      newData.sales.pop();
      newData.xLabels.pop();
      
      // Update hidden points
      if (newData.hiddenPoints) {
        newData.hiddenPoints = newData.hiddenPoints
          .filter(i => i !== newData.revenue.length) // Remove the last index
          .map(i => i > newData.revenue.length ? i - 1 : i); // Shift down indices
      }
      
      saveData(newData);
      setDataRange(Math.min(dataRange, newData.revenue.length));
    }
  };

  // Reset to data from MongoDB
  const resetData = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_API}/dashboard`);
              if (response.ok) {
          const data = await response.json();
          if (data) {
            const newData = {
              sales: data.data?.sales || getStoredData().sales,
              revenue: data.data?.revenue || getStoredData().revenue,
              categories: data.categories || getStoredData().categories,
              categoryData: data.categoryData || getStoredData().categoryData,
              xLabels: data.data?.xLabels || getStoredData().xLabels,
              hiddenPoints: data.data?.hiddenPoints || []
            };
          setSampleData(newData);
          setChartTitle(data.chartTitle || 'Revenue Trend');
          setXAxisLabel(data.xAxisLabel || 'Months');
          setYAxisLabel(data.yAxisLabel || 'Revenue ($)');
          setDataRange(data.data.revenue?.length || 12);
          
          // Also update sessionStorage
          sessionStorage.setItem('dashboardData', JSON.stringify(newData));
        }
      } else {
        // Fall back to default data if API fails
        const defaultData = {
          sales: [120, 190, 300, 500, 200, 300, 450, 380, 420, 280, 350, 400],
          revenue: [15000, 22000, 35000, 48000, 25000, 32000, 42000, 38000, 45000, 30000, 38000, 42000],
          categories: ['Electronics', 'Clothing', 'Books', 'Home', 'Sports'],
          categoryData: [35, 25, 20, 15, 5],
          xLabels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          hiddenPoints: []
        };
        setSampleData(defaultData);
        setDataRange(12);
        setXAxisLabel('Months');
        setYAxisLabel('Revenue ($)');
        setChartTitle('Revenue Trend');
        sessionStorage.setItem('dashboardData', JSON.stringify(defaultData));
      }
    } catch (error) {
      console.error('Error resetting dashboard data:', error);
      // Fall back to default data if API fails
      const defaultData = {
        sales: [120, 190, 300, 500, 200, 300, 450, 380, 420, 280, 350, 400],
        revenue: [15000, 22000, 35000, 48000, 25000, 32000, 42000, 38000, 45000, 30000, 38000, 42000],
        categories: ['Electronics', 'Clothing', 'Books', 'Home', 'Sports'],
        categoryData: [35, 25, 20, 15, 5],
        xLabels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        hiddenPoints: []
      };
      setSampleData(defaultData);
      setDataRange(12);
      setXAxisLabel('Months');
      setYAxisLabel('Revenue ($)');
      setChartTitle('Revenue Trend');
      sessionStorage.setItem('dashboardData', JSON.stringify(defaultData));
    }
  };

  // Get visible data points
  const getVisibleData = () => {
    console.log('Sample data:', sampleData); // Debug log
    
    if (!sampleData.revenue || sampleData.revenue.length === 0) {
      console.log('No revenue data available');
      return { revenue: [], xLabels: [] };
    }
    
    const visibleRevenue = sampleData.revenue
      .map((value, index) => ({ value: value === '' ? 0 : value, index }))
      .filter((item, _arrayIndex) => 
        !sampleData.hiddenPoints || !sampleData.hiddenPoints.includes(item.index)
      )
      .map(item => item.value);
    
    const visibleXLabels = sampleData.xLabels
      .map((label, index) => ({ label, index }))
      .filter((item, _arrayIndex) => 
        !sampleData.hiddenPoints || !sampleData.hiddenPoints.includes(item.index)
      )
      .map(item => item.label);
    
    console.log('Visible data:', { revenue: visibleRevenue, xLabels: visibleXLabels }); // Debug log
    return { revenue: visibleRevenue, xLabels: visibleXLabels };
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
        <div className="terminal-window max-w-6xl w-full max-h-[95vh] overflow-y-auto">
          <div className="terminal-header">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-terminal-error rounded-full"></div>
              <div className="w-3 h-3 bg-terminal-warning rounded-full"></div>
              <div className="w-3 h-3 bg-terminal-success rounded-full"></div>
            </div>
            <span className="text-terminal-textMuted text-sm font-mono">interactive_dashboard.py</span>
            <button
              onClick={onClose}
              className="p-1 text-terminal-textMuted hover:text-terminal-text hover:bg-terminal-selection rounded transition-colors duration-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="terminal-body flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-terminal-accent"></div>
          </div>
        </div>
      </div>
    );
  }

  const renderChart = () => {
    const visibleData = getVisibleData();
    
    if (!visibleData.revenue || visibleData.revenue.length === 0) {
      return (
        <div className="space-y-2">
          <h3 className="text-base font-semibold text-terminal-text">{chartTitle}</h3>
          <div className="text-center py-8">
            <p className="text-terminal-textMuted">No data available for chart</p>
          </div>
        </div>
      );
    }
    
    const revenueData = visibleData.revenue.slice(0, dataRange);
    const maxRevenue = revenueData.length > 0 ? Math.max(...revenueData) : 0;
    const minRevenue = revenueData.length > 0 ? Math.min(...revenueData) : 0;

    return (
      <div className="space-y-2">
        <h3 className="text-base font-semibold text-terminal-text">{chartTitle}</h3>
        <div className="relative h-32 sm:h-36">
          <svg className="w-full h-full" viewBox="0 0 400 200">
            {/* Y-axis labels */}
            <text x="5" y="15" className="text-xs fill-current text-terminal-textMuted">{yAxisLabel}</text>
            <text x="5" y="185" className="text-xs fill-current text-terminal-textMuted">0</text>
            <text x="5" y="25" className="text-xs fill-current text-terminal-textMuted">
              {maxRevenue.toLocaleString()}
            </text>
            
            {/* Grid lines */}
            {[0, 1, 2, 3, 4].map(i => (
              <line
                key={i}
                x1="30"
                y1={40 + i * 35}
                x2="390"
                y2={40 + i * 35}
                stroke="#e5e7eb"
                strokeWidth="1"
                strokeDasharray="2,2"
              />
            ))}
            
            {/* Chart line */}
            <polyline
              fill="none"
              stroke="#00ff00"
              strokeWidth="3"
              points={visibleData.revenue.slice(0, dataRange).map((value, index) => {
                const x = 30 + (index / Math.max(dataRange - 1, 1)) * 360;
                const y = maxRevenue === minRevenue ? 110 : 40 + (1 - (value - minRevenue) / (maxRevenue - minRevenue)) * 140;
                return `${x},${y}`;
              }).join(' ')}
            />
            
            {/* Data points */}
            {visibleData.revenue.slice(0, dataRange).map((value, index) => {
              const x = 30 + (index / Math.max(dataRange - 1, 1)) * 360;
              const y = maxRevenue === minRevenue ? 110 : 40 + (1 - (value - minRevenue) / (maxRevenue - minRevenue)) * 140;
              return (
                <circle
                  key={index}
                  cx={x}
                  cy={y}
                  r="4"
                  fill="#00ff00"
                  className="hover:r-6 transition-all duration-200 cursor-pointer"
                  title={`${visibleData.xLabels[index]}: $${value.toLocaleString()}`}
                />
              );
            })}
            
            {/* X-axis labels */}
            {visibleData.xLabels.slice(0, dataRange).map((label, index) => (
              <text
                key={index}
                x={30 + (index / Math.max(dataRange - 1, 1)) * 360}
                y="195"
                className="text-xs fill-current text-terminal-textMuted"
                textAnchor="middle"
              >
                {label}
              </text>
            ))}
          </svg>
        </div>
        <div className="text-center text-xs text-terminal-textMuted">
          Total Revenue: ${visibleData.revenue.slice(0, dataRange).reduce((a, b) => a + b, 0).toLocaleString()}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
              <div className="terminal-window max-w-6xl w-full max-h-[85vh] overflow-y-auto">
        <div className="terminal-header">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-terminal-error rounded-full"></div>
            <div className="w-3 h-3 bg-terminal-warning rounded-full"></div>
            <div className="w-3 h-3 bg-terminal-success rounded-full"></div>
          </div>
          <span className="text-terminal-textMuted text-sm font-mono">interactive_dashboard.py</span>
          <button
            onClick={onClose}
            className="p-1 text-terminal-textMuted hover:text-terminal-text hover:bg-terminal-selection rounded transition-colors duration-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        
        <div className="terminal-body">
          {/* Success Message */}
          {saveSuccess && (
            <div className="mb-4 p-3 bg-terminal-success/20 border border-terminal-success rounded-terminal">
              <div className="flex items-center space-x-2 text-terminal-success">
                <div className="w-2 h-2 bg-terminal-success rounded-full"></div>
                <span className="text-sm font-mono">✓ Data saved successfully!</span>
              </div>
            </div>
          )}
          
          <div className="space-y-4 sm:space-y-6">
            {/* Controls */}
            <div className="flex flex-wrap gap-3 sm:gap-4 p-3 sm:p-4 bg-terminal-selection rounded-terminal">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-terminal-textMuted" />
                <select 
                  value={selectedFilter} 
                  onChange={(e) => setSelectedFilter(e.target.value)}
                  className="px-2 sm:px-3 py-1 sm:py-2 border border-terminal-border rounded-terminal text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-terminal-accent bg-terminal-bg text-terminal-text"
                >
                  <option value="all">All Data</option>
                  <option value="recent">Recent</option>
                  <option value="top">Top Performers</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-terminal-textMuted" />
                <input
                  type="range"
                  min="2"
                  max={sampleData.revenue.length}
                  value={dataRange}
                  onChange={(e) => setDataRange(parseInt(e.target.value))}
                  className="w-20 sm:w-24"
                />
                <span className="text-xs sm:text-sm text-terminal-textMuted">{dataRange} points</span>
              </div>

              <button 
                onClick={() => setShowDataInput(!showDataInput)}
                className="flex items-center space-x-2 px-3 sm:px-4 py-1 sm:py-2 bg-terminal-info text-terminal-bg rounded-terminal hover:bg-terminal-info/80 transition-colors duration-200"
              >
                <span className="text-xs sm:text-sm font-mono">Edit Data</span>
              </button>

              <button 
                onClick={resetData}
                className="flex items-center space-x-2 px-3 sm:px-4 py-1 sm:py-2 bg-terminal-warning text-terminal-bg rounded-terminal hover:bg-terminal-warning/80 transition-colors duration-200"
              >
                <span className="text-xs sm:text-sm font-mono">Reset</span>
              </button>

              <button className="flex items-center space-x-2 px-3 sm:px-4 py-1 sm:py-2 bg-terminal-accent text-terminal-bg rounded-terminal hover:bg-terminal-textDim transition-colors duration-200">
                <Download className="h-4 w-4" />
                <span className="text-xs sm:text-sm font-mono">Export</span>
              </button>

              <button 
                onClick={() => saveDataToAPI(sampleData)}
                disabled={saving}
                className="flex items-center space-x-2 px-3 sm:px-4 py-1 sm:py-2 bg-terminal-success text-white rounded-terminal hover:bg-terminal-success/80 transition-colors duration-200 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span className="text-xs sm:text-sm font-mono">Saving...</span>
                  </>
                ) : (
                  <>
                    <span className="text-xs sm:text-sm font-mono">Save</span>
                  </>
                )}
              </button>

              {/* Admin Controls */}
              {isAdmin && (
                <button 
                  onClick={() => saveDataToAPI(sampleData)}
                  disabled={saving}
                  className="flex items-center space-x-2 px-3 sm:px-4 py-1 sm:py-2 bg-terminal-success text-white rounded-terminal hover:bg-terminal-success/80 transition-colors duration-200"
                >
                  {saving ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <span className="text-xs sm:text-sm font-mono">Save to DB</span>
                  )}
                </button>
              )}

              {/* Save Status Indicator */}
              {saving && (
                <div className="flex items-center space-x-2 px-3 sm:px-4 py-1 sm:py-2 bg-terminal-success text-white rounded-terminal">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span className="text-xs sm:text-sm font-mono">Saving...</span>
                </div>
              )}
            </div>

            {/* Data Input Section */}
            {showDataInput && (
              <div className="terminal-card p-3 space-y-2">
                <h4 className="font-semibold text-terminal-text">Customize Chart Data</h4>
                
                {/* Chart Labels */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs text-terminal-textMuted mb-1">Chart Title</label>
                    <input
                      type="text"
                      value={chartTitle}
                      onChange={(e) => setChartTitle(e.target.value)}
                      className="w-full px-3 py-2 border border-terminal-border rounded-terminal text-sm focus:outline-none focus:ring-2 focus:ring-terminal-accent bg-terminal-bg text-terminal-text"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-terminal-textMuted mb-1">X-Axis Label</label>
                    <input
                      type="text"
                      value={xAxisLabel}
                      onChange={(e) => setXAxisLabel(e.target.value)}
                      className="w-full px-3 py-2 border border-terminal-border rounded-terminal text-sm focus:outline-none focus:ring-2 focus:ring-terminal-accent bg-terminal-bg text-terminal-text"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-terminal-textMuted mb-1">Y-Axis Label</label>
                    <input
                      type="text"
                      value={yAxisLabel}
                      onChange={(e) => setYAxisLabel(e.target.value)}
                      className="w-full px-3 py-2 border border-terminal-border rounded-terminal text-sm focus:outline-none focus:ring-2 focus:ring-terminal-accent bg-terminal-bg text-terminal-text"
                    />
                  </div>
                </div>

                {/* Data Points */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <h5 className="font-medium text-terminal-text">Data Points</h5>
                    <div className="flex space-x-2">
                      <button
                        onClick={addDataPoint}
                        className="px-3 py-1 bg-terminal-success text-white text-xs rounded-terminal hover:bg-terminal-success/80"
                      >
                        Add Point
                      </button>
                      <button
                        onClick={removeDataPoint}
                        className="px-3 py-1 bg-terminal-error text-white text-xs rounded-terminal hover:bg-terminal-error/80"
                      >
                        Remove Last
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-24 overflow-y-auto">
                    {sampleData.revenue.map((value, index) => {
                      const isHidden = sampleData.hiddenPoints && sampleData.hiddenPoints.includes(index);
                      return (
                        <div key={index} className={`flex space-x-1 p-1 border border-terminal-border rounded-terminal ${isHidden ? 'bg-gray-100 opacity-60' : ''}`}>
                          <div className="flex-1">
                            <label className="block text-xs text-terminal-textMuted mb-0.5">X Label</label>
                            <input
                              type="text"
                              value={sampleData.xLabels[index] || ''}
                              onChange={(e) => handleDataInput('xLabel', index, e.target.value)}
                              className="w-full px-1 py-0.5 border border-terminal-border rounded text-xs focus:outline-none focus:ring-1 focus:ring-terminal-accent bg-terminal-bg text-terminal-text"
                              disabled={isHidden}
                            />
                          </div>
                          <div className="flex-1">
                            <label className="block text-xs text-terminal-textMuted mb-0.5">Value</label>
                            <input
                              type="number"
                              value={value === 0 ? '' : value}
                              onChange={(e) => handleDataInput('revenue', index, e.target.value)}
                              className="w-full px-1 py-0.5 border border-terminal-border rounded text-xs focus:outline-none focus:ring-1 focus:ring-terminal-accent bg-terminal-bg text-terminal-text"
                              disabled={isHidden}
                            />
                          </div>
                          <div className="flex flex-col space-y-0.5">
                            <button
                              onClick={() => togglePointVisibility(index)}
                              className={`px-1 py-0.5 text-xs rounded ${isHidden ? 'bg-terminal-accent text-white' : 'bg-gray-200 text-gray-700'} hover:opacity-80`}
                              title={isHidden ? 'Show Point' : 'Hide Point'}
                            >
                              {isHidden ? '👁️' : '🙈'}
                            </button>
                            <button
                              onClick={() => deleteDataPoint(index)}
                              className="px-1 py-0.5 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                              title="Delete Point"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Summary */}
                  <div className="text-xs text-terminal-textMuted mt-1">
                    {sampleData.hiddenPoints && sampleData.hiddenPoints.length > 0 ? (
                      <span>📊 {sampleData.hiddenPoints.length} hidden • {sampleData.revenue.length - sampleData.hiddenPoints.length} visible</span>
                    ) : (
                      <span>📊 All {sampleData.revenue.length} points visible</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Chart Area */}
            <div className="terminal-card p-2">
              {renderChart()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectsPage;
