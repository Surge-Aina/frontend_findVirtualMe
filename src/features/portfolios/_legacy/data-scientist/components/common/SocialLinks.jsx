import React from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { Mail, Github, Linkedin } from 'lucide-react';

const SocialLinks = () => {
  const { portfolio, loading } = usePortfolio();

  if (loading) {
    return null;
  }

  // Get contact information from portfolio - check all contact items
  const contactItems = portfolio?.contact || [];
  let email = null;
  let github = null;
  let linkedin = null;

  // Look through all contact items to find email, github, and linkedin
  contactItems.forEach(item => {
    const content = item.content || {};
    if (content.email && !email) email = content.email;
    if (content.github && !github) github = content.github;
    if (content.linkedin && !linkedin) linkedin = content.linkedin;
  });

  // Don't render if no social links are available
  if (!email && !github && !linkedin) {
    return null;
  }

  return (
    <div className="flex items-center space-x-3 sm:space-x-4">
      {email && (
        <a
          href={`mailto:${email}`}
          className="flex items-center space-x-1 sm:space-x-2 text-terminal-textDim hover:text-terminal-accent transition-colors duration-200 font-mono text-xs sm:text-sm"
          title="Send Email"
        >
          <Mail className="h-3 w-3 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">Email</span>
        </a>
      )}
      
      {github && (
        <a
          href={github}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-1 sm:space-x-2 text-terminal-textDim hover:text-terminal-accent transition-colors duration-200 font-mono text-xs sm:text-sm"
          title="View GitHub Profile"
        >
          <Github className="h-3 w-3 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">GitHub</span>
        </a>
      )}
      
      {linkedin && (
        <a
          href={linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-1 sm:space-x-2 text-terminal-textDim hover:text-terminal-accent transition-colors duration-200 font-mono text-xs sm:text-sm"
          title="View LinkedIn Profile"
        >
          <Linkedin className="h-3 w-3 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">LinkedIn</span>
        </a>
      )}
    </div>
  );
};

export default SocialLinks;
