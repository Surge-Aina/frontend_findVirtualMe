import { useEffect, useState } from "react";
import Editable from "./Editable";

export default function About() {
  const backendUrl = import.meta.env.VITE_BACKEND_API;
  const [photoUrl, setPhotoUrl] = useState("https://images.unsplash.com/photo-1494790108755-2616b612b5b5?auto=format&fit=crop&w=800&q=80"); // Default photo
  const [text, setText] = useState(
    "Hi, I'm Jane Doe, a professional photographer with a passion for capturing life's most beautiful moments. I offer services for weddings, graduations, sports, parties, and so much more. Head over to my Contacts page to learn more about how to book a session from me!"
  );
  const [description, setDescription] = useState(
    "Discover the passion and artistry behind every photograph we create."
  );  

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch description
        const descriptionRes = await fetch(`${backendUrl}/settings/aboutDescription`);
        if (descriptionRes.ok) {
          const descriptionData = await descriptionRes.json();
          if (descriptionData.value) {
            setDescription(descriptionData.value);
          }
        }

        // Fetch photo URL from settings
        const photoRes = await fetch(`${backendUrl}/settings/aboutPhoto`);
        if (photoRes.ok) {
          const photoData = await photoRes.json();
          if (photoData.value) {
            setPhotoUrl(photoData.value);
          }
        }

        // Fetch heading
        const headingRes = await fetch(`${backendUrl}/settings/aboutHeading`);
        if (headingRes.ok) {
          const headingData = await headingRes.json();
          if (headingData.value) {
            setHeading(headingData.value);
          }
        }

        // Fetch text
        const textRes = await fetch(`${backendUrl}/settings/aboutText`);
        if (textRes.ok) {
          const textData = await textRes.json();
          if (textData.value) {
            setText(textData.value);
          }
        }
      } catch (err) {
        console.error('Failed to fetch about data:', err);
      }
    };

    fetchData();
  }, []);

  const handleImageChange = async (newUrl) => {
    setPhotoUrl(newUrl);
    
    try {
        await fetch(`${backendUrl}/settings/aboutPhoto`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: newUrl }),
      });
    } catch (err) {
      console.error('Failed to save photo:', err);
    }
  };

  const handleDescriptionChange = async (newDescription) => {
    setDescription(newDescription);
  
    try {
        await fetch(`${backendUrl}/settings/aboutDescription`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: newDescription }),
      });
    } catch (err) {
      console.error('Failed to save description:', err);
    }
  };  

  const handleTextChange = async (newText) => {
    setText(newText);
    
    try {
        await fetch(`${backendUrl}/settings/aboutText`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: newText }),
      });
    } catch (err) {
      console.error('Failed to save text:', err);
    }
  };

  return (
    <div className="space-y-12 md:space-y-16 px-4 md:px-0">
      {/* Header Section */}
      <div className="text-center">
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-extralight text-gray-900 mb-6 tracking-wider px-4">About Me</h2>
        <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-gray-800 to-transparent mx-auto mb-8 hover:w-32 transition-all duration-500"></div>
        <Editable
          type="text"
          value={description}
          onChange={handleDescriptionChange}
          className="text-gray-600 text-lg font-light max-w-2xl mb-3 mx-auto leading-relaxed hover:text-black cursor-pointer transition-colors"
        />
      </div>

      {/* Content Section */}
      <div className="grid md:grid-cols-2 gap-16 items-center">
        <div className="group flex justify-center">
          <div className="relative overflow-hidden rounded-3xl shadow-lg">
            <Editable
              type="image"
              value={photoUrl}
              onChange={handleImageChange}
              className="rounded-lg w-full max-w-md object-cover shadow-sm"
            />
          </div>
        </div>
        
        <div className="space-y-8 text-left">
          <div className="w-16 h-0.5 bg-gray-300"></div>
          <Editable
            type="text"
            value={text}
            onChange={handleTextChange}
            className="text-gray-600 leading-relaxed font-light text-lg"
          />
        </div>
      </div>
    </div>
  );
}