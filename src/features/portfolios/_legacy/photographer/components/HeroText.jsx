import { useState, useEffect } from 'react';
import Editable from './Editable';
import { getOptional } from '@/shared/api/axiosAuth';
import { putPhotographerSetting, usePhotographerWrite } from '../photographerApi';

export default function HeroText({ words = ["Wedding", "Graduation", "Sports", "Party"] }) {
  const { portfolioId } = usePhotographerWrite();
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [fade, setFade] = useState(true);
  const [heroWords, setHeroWords] = useState(words);
  const [tagline, setTagline] = useState("Photos personalized for you");

  // Load initial data from backend
  useEffect(() => {
    const fetchHeroData = async () => {
      const wordsData = await getOptional('/settings/heroWords');
      if (wordsData?.value) setHeroWords(wordsData.value);

      const taglineData = await getOptional('/settings/heroTagline');
      if (taglineData?.value) setTagline(taglineData.value);
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
      await putPhotographerSetting('heroTagline', newTagline, portfolioId);
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