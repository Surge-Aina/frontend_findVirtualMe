import React, { useEffect, useState } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import Terminal from '../common/Terminal';
import { Github, Linkedin } from 'lucide-react';

const HomePage = () => {
  const { portfolio, loading, error } = usePortfolio();
  const [typingComplete, setTypingComplete] = useState(false);

  useEffect(() => {
    // Simulate typing effect
    const timer = setTimeout(() => {
      setTypingComplete(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
        <div style={{ 
          animation: 'spin 1s linear infinite', 
          borderRadius: '50%', 
          height: '2rem', 
          width: '2rem', 
          borderBottom: '2px solid var(--terminal-accent)' 
        }}></div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
        <div style={{ color: 'var(--terminal-error)', fontSize: '1rem' }}>Error: {error}</div>
      </div>
    );
  }

  // Handle integrated backend data structure
  const about = portfolio.summary || 'Welcome to my portfolio!';
  const contact = {
    email: portfolio.email,
    location: portfolio.location,
    github: portfolio.socialLinks?.github,
    linkedin: portfolio.socialLinks?.linkedin
  };

  // Create comprehensive terminal lines with only commands animated
  const terminalLines = [
    { text: '> whoami', delay: 200, color: 'command', animate: true },
    { text: 'Gargi Ghadigaonkar', delay: 400, color: 'output', animate: false },
    { text: '> location', delay: 600, color: 'command', animate: true },
    { text: contact.location || 'Chico, CA', delay: 800, color: 'output', animate: false },
    { text: '> contact', delay: 1000, color: 'command', animate: true },
    { text: contact.email || 'ghadigaonkargargi@gmail.com', delay: 1200, color: 'output', animate: false },
    { text: '> about', delay: 1400, color: 'command', animate: true },
    { text: about, delay: 1600, color: 'output', animate: false },
    { text: '', delay: 1800, animate: false },
    { text: '> education', delay: 2000, color: 'section', animate: true },
  ];

  // Add education lines
  if (portfolio.education?.length > 0) {
    portfolio.education.forEach((edu, index) => {
      terminalLines.push(
        { text: `  ${index + 1}. ${edu.school}`, delay: 2200 + (index * 200), color: 'output', animate: false },
        { text: `     ${edu.degrees?.join(', ')} | ${edu.description}`, delay: 2400 + (index * 200), color: 'output', animate: false }
      );
    });
  }

  terminalLines.push({ text: '', delay: 3000, animate: false });
  terminalLines.push({ text: '> experience', delay: 3200, color: 'section', animate: true });

  // Add experience lines
  if (portfolio.experience?.length > 0) {
    portfolio.experience.forEach((exp, index) => {
      terminalLines.push(
        { text: `  ${index + 1}. ${exp.title}`, delay: 3400 + (index * 300), color: 'output', animate: false }
      );
      
      // Add company and location
      if (exp.company && exp.location) {
        terminalLines.push(
          { text: `     ${exp.company} | ${exp.location}`, delay: 3600 + (index * 300), color: 'output', animate: false }
        );
      }
      
      // Add description
      if (exp.description) {
        if (Array.isArray(exp.description)) {
          // If description is an array, use it directly
          exp.description.forEach((desc, descIndex) => {
            if (desc.trim()) {
              terminalLines.push(
                { text: `     • ${desc.trim()}`, delay: 3800 + (index * 300) + (descIndex * 100), color: 'output', animate: false }
              );
            }
          });
        } else {
          // If description is a string, split it
          const descriptionLines = exp.description.split('. ').filter(line => line.trim());
          descriptionLines.forEach((desc, descIndex) => {
            if (desc.trim()) {
              terminalLines.push(
                { text: `     • ${desc.trim()}`, delay: 3800 + (index * 300) + (descIndex * 100), color: 'output', animate: false }
              );
            }
          });
        }
      }
    });
  }

  terminalLines.push({ text: '', delay: 5000, animate: false });
  terminalLines.push({ text: '> socials', delay: 5200, color: 'help', animate: true });
  terminalLines.push({ text: '  click the social links below', delay: 5400, color: 'output', animate: false });

  return (
    <div style={{ marginTop: '1rem' }}>
      {/* Unified Terminal Interface */}
      <div className="animate-fade-in">
        <div className="terminal-window" style={{ minHeight: '500px', position: 'relative', overflow: 'hidden' }}>
          {/* Terminal Header */}
          <div className="terminal-header">
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '0.25rem', marginRight: '1rem' }}>
                <div style={{ width: '0.5rem', height: '0.5rem', borderRadius: '50%', backgroundColor: '#ef4444' }}></div>
                <div style={{ width: '0.5rem', height: '0.5rem', borderRadius: '50%', backgroundColor: '#eab308' }}></div>
                <div style={{ width: '0.5rem', height: '0.5rem', borderRadius: '50%', backgroundColor: '#22c55e' }}></div>
              </div>
              <span style={{ color: 'var(--terminal-textDim)', fontSize: '0.875rem' }}>Terminal - Portfolio</span>
            </div>
          </div>
          
          {/* Terminal Content */}
          <div className="terminal-body">
            <Terminal lines={terminalLines} />
          </div>
          
          {/* Social Links */}
          {typingComplete && (
            <div style={{ 
              position: 'absolute', 
              bottom: '1rem', 
              right: '1rem', 
              display: 'flex', 
              gap: '0.5rem' 
            }} className="animate-slide-up">
              {contact.github && (
                <a 
                  href={contact.github} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ 
                    color: 'var(--terminal-textDim)', 
                    transition: 'color 0.2s',
                    padding: '0.25rem'
                  }}
                  onMouseEnter={(e) => e.target.style.color = 'var(--terminal-accent)'}
                  onMouseLeave={(e) => e.target.style.color = 'var(--terminal-textDim)'}
                  aria-label="GitHub Profile"
                >
                  <Github size={20} />
                </a>
              )}
              {contact.linkedin && (
                <a 
                  href={contact.linkedin} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ 
                    color: 'var(--terminal-textDim)', 
                    transition: 'color 0.2s',
                    padding: '0.25rem'
                  }}
                  onMouseEnter={(e) => e.target.style.color = 'var(--terminal-accent)'}
                  onMouseLeave={(e) => e.target.style.color = 'var(--terminal-textDim)'}
                  aria-label="LinkedIn Profile"
                >
                  <Linkedin size={20} />
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
