// components/admin/GalleryEditor.js
import { useState } from 'react'
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaImages, FaCamera } from 'react-icons/fa'
import {api} from "../../lib/api";

export default function GalleryEditor({ gallery, onUpdate }) {
  const [editingFacilityImage, setEditingFacilityImage] = useState(null)
  const [editingBeforeAfterCase, setEditingBeforeAfterCase] = useState(null)
  const [isAddingFacility, setIsAddingFacility] = useState(false)
  const [isAddingCase, setIsAddingCase] = useState(false)

  // Initialize gallery structure if empty
  const safeGallery = {
    facilityImages: gallery?.facilityImages || [],
    beforeAfterCases: gallery?.beforeAfterCases || []
  }

  // Facility Images Functions
  const addFacilityImage = () => {
    const newImage = {
      url: '',
      caption: '',
      description: ''
    }
    const updatedGallery = {
      ...safeGallery,
      facilityImages: [...safeGallery.facilityImages, newImage]
    }
    onUpdate(updatedGallery)
    setEditingFacilityImage(safeGallery.facilityImages.length)
    setIsAddingFacility(true)
  }

  const updateFacilityImage = (index, field, value) => {
    const updatedImages = [...safeGallery.facilityImages]
    updatedImages[index] = { ...updatedImages[index], [field]: value }
    const updatedGallery = { ...safeGallery, facilityImages: updatedImages }
    onUpdate(updatedGallery)
  }

  const deleteFacilityImage = (index) => {
    if (confirm('Are you sure you want to delete this image?')) {
      const updatedImages = safeGallery.facilityImages.filter((_, i) => i !== index)
      const updatedGallery = { ...safeGallery, facilityImages: updatedImages }
      onUpdate(updatedGallery)
    }
  }

  // Before/After Cases Functions
  const addBeforeAfterCase = () => {
    const newCase = {
      title: '',
      treatment: '',
      duration: '',
      description: '',
      beforeImage: '',
      afterImage: ''
    }
    const updatedGallery = {
      ...safeGallery,
      beforeAfterCases: [...safeGallery.beforeAfterCases, newCase]
    }
    onUpdate(updatedGallery)
    setEditingBeforeAfterCase(safeGallery.beforeAfterCases.length)
    setIsAddingCase(true)
  }

  const updateBeforeAfterCase = (index, field, value) => {
    const updatedCases = [...safeGallery.beforeAfterCases]
    updatedCases[index] = { ...updatedCases[index], [field]: value }
    const updatedGallery = { ...safeGallery, beforeAfterCases: updatedCases }
    onUpdate(updatedGallery)
  }

  const deleteBeforeAfterCase = (index) => {
    if (confirm('Are you sure you want to delete this before/after case?')) {
      const updatedCases = safeGallery.beforeAfterCases.filter((_, i) => i !== index)
      const updatedGallery = { ...safeGallery, beforeAfterCases: updatedCases }
      onUpdate(updatedGallery)
    }
  }

  const uploadGalleryImage = async (file, imageIndex) => {
      try {
        //get public URL
        const publicUrl = await api.uploadImageToS3(file);
        // Save final public URL
        updateFacilityImage(imageIndex, 'url', publicUrl)
      } catch (err) {
        console.error('Gallery Image Upload Error:', err)
        alert('Image upload failed')
      }
    }

  const uploadCaseImage = async (file, caseIndex, type) => {
    try {
      //get public URL
      const publicUrl = await api.uploadImageToS3(file);
      // Save final public URL
      updateBeforeAfterCase(caseIndex, type, publicUrl)
    } catch (err) {
      console.error('Case Image Upload Error:', err)
      alert('Image upload failed')
    } 
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <FaImages className="mr-3" />
          Gallery Management
        </h2>
      </div>

      {/* Facility Images Section */}
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Facility Images</h3>
          <button
            onClick={addFacilityImage}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
          >
            <FaPlus className="mr-2" />
            Add Facility Image
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {safeGallery.facilityImages.map((image, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
              {editingFacilityImage === index ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
                    <input
                      type="url"
                      value={image.url}
                      onChange={(e) => updateFacilityImage(index, 'url', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://example.com/image.jpg"
                    />

                    {/* Upload Image */}
                    <label className="inline-flex items-center gap-2 text-sm text-blue-600 cursor-pointer border border-blue-600 px-3 py-2 rounded-lg mt-3 hover:bg-blue-50 transition-colors">
                      <FaCamera className="mr-2" />
                      Upload
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            uploadGalleryImage(e.target.files[0], index)
                          }
                        }}
                      />
                    </label>

                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Caption</label>
                    <input
                      type="text"
                      value={image.caption}
                      onChange={(e) => updateFacilityImage(index, 'caption', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Image caption"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      value={image.description}
                      onChange={(e) => updateFacilityImage(index, 'description', e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Brief description"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setEditingFacilityImage(null)
                        setIsAddingFacility(false)
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm flex items-center"
                    >
                      <FaSave className="mr-1" />
                      Save
                    </button>
                    <button
                      onClick={() => {
                        if (isAddingFacility) {
                          deleteFacilityImage(index)
                          setIsAddingFacility(false)
                        }
                        setEditingFacilityImage(null)
                      }}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-lg text-sm flex items-center"
                    >
                      <FaTimes className="mr-1" />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="h-32 bg-gray-200 rounded-lg mb-3 flex items-center justify-center">
                    {image.url ? (
                      <img src={image.url} alt={image.caption} className="h-full w-full object-cover rounded-lg" />
                    ) : (
                      <FaCamera className="text-gray-400 text-2xl" />
                    )}
                  </div>
                  <h4 className="font-semibold text-gray-900">{image.caption || 'Untitled'}</h4>
                  <p className="text-gray-600 text-sm mt-1">{image.description}</p>
                  <div className="flex space-x-2 mt-3">
                    <button
                      onClick={() => setEditingFacilityImage(index)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => deleteFacilityImage(index)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>


        {safeGallery.facilityImages.length === 0 && (
          <div className="inline-flex items-center gap-2 text-sm text-blue-600 cursor-pointer border border-blue-600 px-3 py-2 rounded-lg mt-3 hover:bg-blue-50 transition-colors">
            <FaCamera className="mx-auto text-4xl mb-4" />
            <p>No facility images added yet.</p>
            <p className="text-sm">Click "Add Facility Image" to get started.</p>
          </div>
        )}
      </div>

      {/* Before/After Cases Section */}
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Before/After Cases</h3>
          <button
            onClick={addBeforeAfterCase}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
          >
            <FaPlus className="mr-2" />
            Add Before/After Case
          </button>
        </div>

        <div className="space-y-6">
          {safeGallery.beforeAfterCases.map((case_, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-lg p-6">
              {editingBeforeAfterCase === index ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Case Title</label>
                      <input
                        type="text"
                        value={case_.title}
                        onChange={(e) => updateBeforeAfterCase(index, 'title', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Case title"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Treatment</label>
                      <input
                        type="text"
                        value={case_.treatment}
                        onChange={(e) => updateBeforeAfterCase(index, 'treatment', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Treatment type"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                    <input
                      type="text"
                      value={case_.duration}
                      onChange={(e) => updateBeforeAfterCase(index, 'duration', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 6 months"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      value={case_.description}
                      onChange={(e) => updateBeforeAfterCase(index, 'description', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Case description"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Before Image URL</label>
                      <div className="flex flex-col gap-3 items-center">
                        <input
                          type="url"
                          value={case_.beforeImage}
                          onChange={(e) => updateBeforeAfterCase(index, 'beforeImage', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="https://example.com/before.jpg"
                        />

                        <label className="inline-flex items-center gap-2 text-sm text-blue-600 cursor-pointer border border-blue-600 px-3 py-2 rounded-lg mt-3 hover:bg-blue-50 transition-colors">
                          <FaCamera className="mr-2" />
                          Upload
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files?.[0]) {
                                uploadCaseImage(e.target.files[0], index, 'beforeImage')
                              }
                            }}
                          />
                        </label>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">After Image URL</label>
                      <div className="flex flex-col gap-3 items-center">
                        <input
                          type="url"
                          value={case_.afterImage}
                          onChange={(e) => updateBeforeAfterCase(index, 'afterImage', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="https://example.com/after.jpg"
                        />

                        <label className="inline-flex items-center gap-2 text-sm text-blue-600 cursor-pointer border border-blue-600 px-3 py-2 rounded-lg mt-3 hover:bg-blue-50 transition-colors">
                          <FaCamera className="mr-2" />
                          Upload
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files?.[0]) {
                                uploadCaseImage(e.target.files[0], index, 'afterImage')
                              }
                            }}
                          />
                        </label>
                      </div>
                    </div>
                </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setEditingBeforeAfterCase(null)
                        setIsAddingCase(false)
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
                    >
                      <FaSave className="mr-2" />
                      Save
                    </button>
                    <button
                      onClick={() => {
                        if (isAddingCase) {
                          deleteBeforeAfterCase(index)
                          setIsAddingCase(false)
                        }
                        setEditingBeforeAfterCase(null)
                      }}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
                    >
                      <FaTimes className="mr-2" />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">{case_.title || 'Untitled Case'}</h4>
                      <p className="text-blue-600 font-medium">{case_.treatment}</p>
                      {case_.duration && <p className="text-gray-500 text-sm">Duration: {case_.duration}</p>}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setEditingBeforeAfterCase(index)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => deleteBeforeAfterCase(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Before</p>
                      <div className="h-32 bg-red-100 rounded-lg flex items-center justify-center">
                        {case_.beforeImage ? (
                          <img src={case_.beforeImage} alt="Before" className="h-full w-full object-cover rounded-lg" />
                        ) : (
                          <FaCamera className="text-red-400 text-2xl" />
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">After</p>
                      <div className="h-32 bg-green-100 rounded-lg flex items-center justify-center">
                        {case_.afterImage ? (
                          <img src={case_.afterImage} alt="After" className="h-full w-full object-cover rounded-lg" />
                        ) : (
                          <FaCamera className="text-green-400 text-2xl" />
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {case_.description && (
                    <p className="text-gray-600 text-sm">{case_.description}</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {safeGallery.beforeAfterCases.length === 0 && (
          <div className="inline-flex items-center gap-2 text-sm text-blue-600 cursor-pointer border border-blue-600 px-3 py-2 rounded-lg mt-3 hover:bg-blue-50 transition-colors">
            <FaCamera className="mx-auto text-4xl mb-4" />
            <p>No before/after cases added yet.</p>
            <p className="text-sm">Click "Add Before/After Case" to get started.</p>
          </div>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-blue-800 font-semibold mb-2">💡 Gallery Tips:</h4>
        <ul className="text-blue-700 text-sm space-y-1">
          <li>• Use high-quality images (recommended: 800px width minimum)</li>
          <li>• Facility images showcase your practice environment</li>
          <li>• Before/after cases demonstrate treatment success</li>
          <li>• Always ensure patient consent for before/after photos</li>
          <li>• Use descriptive captions to explain what visitors are seeing</li>
        </ul>
      </div>
    </div>
  )
}