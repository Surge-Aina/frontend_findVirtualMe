import React, { useState } from 'react';
import './ProblemIdentifier.css';

const ProblemIdentifier = () => {
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [analysis, setAnalysis] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
      setAnalysis('');
      setError('');
    }
  };

  const handleIdentifyProblem = async () => {
    if (!image) {
      setError('Please upload an image first.');
      return;
    }

    setIsLoading(true);
    setError('');
    setAnalysis('');

    // Convert image to base64
    const reader = new FileReader();
    reader.readAsDataURL(image);
    reader.onloadend = async () => {
      const base64ImageData = reader.result.split(',')[1];
      
      const prompt = "You are a helpful handyman assistant. Analyze this image of a home repair issue and briefly describe what the problem likely is. For example, 'This looks like a drywall hole that needs patching' or 'This appears to be a leaky faucet under the sink.' Keep the response to one or two sentences.";

      const payload = {
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inline_data: {
                  mime_type: image.type,
                  data: base64ImageData
                }
              }
            ]
          }
        ],
      };
      
      const apiKey = ""; // API key will be provided by the environment
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

      try {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.statusText}`);
        }

        const result = await response.json();
        
        if (result.candidates && result.candidates.length > 0 && result.candidates[0].content.parts.length > 0) {
          const text = result.candidates[0].content.parts[0].text;
          setAnalysis(text);
        } else {
          throw new Error('Could not get a valid analysis from the AI.');
        }

      } catch (err) {
        setError(err.message || 'An unknown error occurred.');
      } finally {
        setIsLoading(false);
      }
    };
  };

  return (
    <section id="ai-identifier" className="ai-identifier-section">
      <h2>Have a Problem? Let Our AI Take a Look!</h2>
      <p>Upload a photo of your issue for a quick analysis.</p>
      <div className="identifier-container">
        <div className="upload-area">
          <input type="file" id="imageUpload" accept="image/*" onChange={handleImageChange} />
          <label htmlFor="imageUpload" className="upload-label">
            {imagePreview ? <img src={imagePreview} alt="Preview" className="image-preview" /> : 'Click to Upload Image'}
          </label>
        </div>
        <button onClick={handleIdentifyProblem} disabled={isLoading || !image}>
          {isLoading ? 'Analyzing...' : 'Identify Problem'}
        </button>
        {error && <p className="error-message">{error}</p>}
        {analysis && (
          <div className="analysis-result">
            <h3>AI Analysis:</h3>
            <p>{analysis}</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProblemIdentifier;