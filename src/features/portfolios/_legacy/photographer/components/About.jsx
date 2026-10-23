import { useEffect, useState } from "react";
import Editable from "./Editable";
import { getOptional } from "@/shared/api/axiosAuth";
import { putPhotographerSetting, usePhotographerWrite } from "../photographerApi";
import { logApiError } from "@/shared/api/safeLog";

export default function About() {
  const { portfolioId } = usePhotographerWrite();
  const [photoUrl, setPhotoUrl] = useState("https://images.unsplash.com/photo-1494790108755-2616b612b5b5?auto=format&fit=crop&w=800&q=80"); // Default photo
  const [text, setText] = useState(
    "Hi, I'm Jane Doe, a professional photographer with a passion for capturing life's most beautiful moments. I offer services for weddings, graduations, sports, parties, and so much more. Head over to my Contacts page to learn more about how to book a session from me!"
  );
  const [description, setDescription] = useState(
    "Discover the passion and artistry behind every photograph we create."
  );  

  useEffect(() => {
    const fetchData = async () => {
      const descriptionData = await getOptional("/settings/aboutDescription");
      if (descriptionData?.value) setDescription(descriptionData.value);

      const photoData = await getOptional("/settings/aboutPhoto");
      if (photoData?.value) setPhotoUrl(photoData.value);

      const textData = await getOptional("/settings/aboutText");
      if (textData?.value) setText(textData.value);
    };

    fetchData();
  }, []);

  const handleImageChange = async (newUrl) => {
    setPhotoUrl(newUrl);
    
    try {
      await putPhotographerSetting("aboutPhoto", newUrl, portfolioId);
    } catch (err) {
      logApiError(err, "Failed to save photo");
    }
  };

  const handleDescriptionChange = async (newDescription) => {
    setDescription(newDescription);
  
    try {
      await putPhotographerSetting("aboutDescription", newDescription, portfolioId);
    } catch (err) {
      logApiError(err, "Failed to save description");
    }
  };  

  const handleTextChange = async (newText) => {
    setText(newText);
    
    try {
      await putPhotographerSetting("aboutText", newText, portfolioId);
    } catch (err) {
      logApiError(err, "Failed to save text");
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