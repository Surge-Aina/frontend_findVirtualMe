import { useState, useEffect } from 'react';
import Editable from './Editable';

export default function HeroText({ words = ["Wedding", "Graduation", "Sports", "Party"] }) {
  const backendUrl = import.meta.env.VITE_BACKEND_API;
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [fade, setFade] = useState(true);
  const [heroWords, setHeroWords] = useState(words);
  const [tagline, setTagline] = useState("Photos personalized for you");

  // Load initial data from backend
  useEffect(() => {
    const fetchHeroData = async () => {
      try {
        // Fetch hero words
  const wordsRes = await fetch(`${backendUrl}/settings/heroWords`);
        if (wordsRes.ok) {
          const wordsData = await wordsRes.json();
          if (wordsData.value) {
            setHeroWords(wordsData.value);
          }
        }

        // Fetch tagline
  const taglineRes = await fetch(`${backendUrl}/settings/heroTagline`);
        if (taglineRes.ok) {
          const taglineData = await taglineRes.json();
          if (taglineData.value) {
            setTagline(taglineData.value);
          }
        }
      } catch (err) {
        console.error('Failed to fetch hero data:', err);
      }
    };

    fetchHeroData();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setCurrentWordIndex((prevIndex) => (prevIndex + 1) % heroWords.length);
        setFade(true);
      }, 300);
    }, 2000);

    return () => clearInterval(interval);
  }, [heroWords.length]);

  const handleTaglineChange = async (newTagline) => {
    setTagline(newTagline);
    
    try {
  await fetch(`${backendUrl}/settings/heroTagline`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: newTagline }),
      });
    } catch (err) {
      console.error('Failed to save tagline:', err);
    }
  };

  return (
    <div className="text-left space-y-6 mb-16 mt-16">
      {/* Rotating first line */}
      <h1
        className={`text-6xl md:text-7xl lg:text-8xl font-light tracking-wide transition-opacity duration-500 text-gray-900 ${
          fade ? "opacity-100" : "opacity-0"
        }`}
      >
        {heroWords[currentWordIndex]}
      </h1>

      {/* Static tagline */}
      <Editable
        type="text"
        value={tagline}
        onChange={handleTaglineChange}
        tag="h2"
        className="text-xl md:text-2xl text-gray-600 font-light leading-relaxed"
      />
    </div>
  );
} 