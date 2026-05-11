import React, { useState, useEffect } from 'react';

const Terminal = ({ lines }) => {
  const [displayedLines, setDisplayedLines] = useState([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [currentCharIndex, setCurrentCharIndex] = useState(0);

  useEffect(() => {
    if (currentLineIndex >= lines.length) return;

    const currentLine = lines[currentLineIndex];
    
    // If the line should be animated
    if (currentLine.animate !== false) {
      const typingSpeed = 20; // milliseconds per character

      if (currentCharIndex < currentLine.text.length) {
        // Typing effect for current line
        const timer = setTimeout(() => {
          setCurrentText(prev => prev + currentLine.text[currentCharIndex]);
          setCurrentCharIndex(prev => prev + 1);
        }, typingSpeed);

        return () => clearTimeout(timer);
      } else {
        // Move to next line after a short delay
        const lineCompleteTimer = setTimeout(() => {
          setDisplayedLines(prev => [
            ...prev,
            { text: currentText, delay: currentLine.delay, color: currentLine.color }
          ]);
          
          setCurrentText('');
          setCurrentCharIndex(0);
          setCurrentLineIndex(prev => prev + 1);
        }, 300); // Delay before moving to next line

        return () => clearTimeout(lineCompleteTimer);
      }
    } else {
      // Static line - add immediately
      setDisplayedLines(prev => [
        ...prev,
        { text: currentLine.text, delay: currentLine.delay, color: currentLine.color }
      ]);
      setCurrentLineIndex(prev => prev + 1);
    }
  }, [currentLineIndex, currentCharIndex, currentText, lines]);

  const getTextColor = (color) => {
    switch (color) {
      case 'command':
        return 'text-blue-600 font-semibold';
      case 'output':
        return 'text-gray-800';
      case 'section':
        return 'text-purple-600 font-semibold';
      case 'help':
        return 'text-green-600 font-semibold';
      default:
        return 'text-gray-800';
    }
  };

  return (
    <div className="space-y-1">
      {displayedLines.map((line, index) => (
        <div 
          key={index} 
          className={`font-mono whitespace-pre-wrap leading-relaxed animate-fade-in ${getTextColor(line.color)}`}
        >
          {line.text}
        </div>
      ))}
      {currentText && (
        <span className={`font-mono whitespace-pre-wrap leading-relaxed relative ${getTextColor(lines[currentLineIndex]?.color)}`}>
          {currentText}
          <span className="inline-block w-2 h-4 bg-green-400 ml-1 animate-pulse"></span>
        </span>
      )}
    </div>
  );
};

export default Terminal;
