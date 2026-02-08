import { useState } from 'react'
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaImage, FaCamera } from 'react-icons/fa'
import { api } from '../../lib/api'

export default function ServicesEditor({ services, onUpdate }) {
  const [editingService, setEditingService] = useState(null)
  const [isAdding, setIsAdding] = useState(false)

  const addService = () => {
    const newService = {
      id: `service-${Date.now()}`,
      title: '',
      description: '',
      icon: 'user-md',
      price: '',
      duration: '',
      image: '', // Add image field
      features: []
    }
    onUpdate([...services, newService])
    setEditingService(services.length)
    setIsAdding(true)
  }

  const updateService = (index, field, value) => {
    const updatedServices = [...services]
    updatedServices[index] = { ...updatedServices[index], [field]: value }
    onUpdate(updatedServices)
  }

  const deleteService = (index) => {
    if (confirm('Are you sure you want to delete this service?')) {
      const updatedServices = services.filter((_, i) => i !== index)
      onUpdate(updatedServices)
    }
  }

  const addFeature = (serviceIndex) => {
    const updatedServices = [...services]
    if (!updatedServices[serviceIndex].features) {
      updatedServices[serviceIndex].features = []
    }
    updatedServices[serviceIndex].features.push('')
    onUpdate(updatedServices)
  }

  const updateFeature = (serviceIndex, featureIndex, value) => {
    const updatedServices = [...services]
    updatedServices[serviceIndex].features[featureIndex] = value
    onUpdate(updatedServices)
  }

  const removeFeature = (serviceIndex, featureIndex) => {
    const updatedServices = [...services]
    updatedServices[serviceIndex].features.splice(featureIndex, 1)
    onUpdate(updatedServices)
  }

  const uploadServiceImage = async (file, serviceIndex) => {
    try {
      //get public URL
      const publicUrl = await api.uploadImageToS3(file);
      // Save final public URL
      updateService(serviceIndex, 'image', publicUrl)
    } catch (err) {
      console.error('Service Image Upload Error:', err)
      alert('Image upload failed')
    }
  }


  return (
    <div className="lg:col-span-3">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Services Management</h2>
            <button
              onClick={addService}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
            >
              <FaPlus className="mr-2" />
              Add Service
            </button>
          </div>

          <div className="space-y-4">
            {services.map((service, index) => (
              <div key={service.id || index} className="border border-gray-200 rounded-lg p-6">
                {editingService === index ? (
                  <div className="space-y-4">
                    {/* Service Image Upload */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Service Image URL
                      </label>
                      <div className="flex gap-4">
                        <div className="flex-1">
                          <input
                            type="url"
                            value={service.image || ''}
                            onChange={(e) => updateService(index, 'image', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="https://example.com/image.jpg"
                          />

                          {/* Upload option */}
                          <label className="inline-flex items-center gap-2 text-sm text-blue-600 cursor-pointer border border-blue-600 px-3 py-2 rounded-lg mt-3 hover:bg-blue-50 transition-colors">
                            <FaImage />
                            Upload image
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files[0]
                                if (file) uploadServiceImage(file, index)
                              }}
                            />
                          </label>

                          <p className="text-xs text-gray-500 mt-1">
                            Paste an image URL or upload directly
                          </p>
                        </div>


                        {/* Preview */}
                        {service.image ? (
                          <div className="w-24 h-24 border rounded-lg overflow-hidden flex-shrink-0">
                            <img
                              src={service.image}
                              alt="Preview"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FaCamera className="text-gray-400 text-2xl" />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Service Title *</label>
                        <input
                          type="text"
                          value={service.title || ''}
                          onChange={(e) => updateService(index, 'title', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter service title"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
                        <input
                          type="text"
                          value={service.price || ''}
                          onChange={(e) => updateService(index, 'price', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., $150"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                      <textarea
                        value={service.description || ''}
                        onChange={(e) => updateService(index, 'description', e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Describe the service"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                      <input
                        type="text"
                        value={service.duration || ''}
                        onChange={(e) => updateService(index, 'duration', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., 45 minutes"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Icon</label>
                      <select
                        value={service.icon || 'user-md'}
                        onChange={(e) => updateService(index, 'icon', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="user-md">Medical Professional</option>
                        <option value="heartbeat">Heartbeat</option>
                        <option value="tooth">Tooth</option>
                        <option value="microscope">Microscope</option>
                        <option value="shield-alt">Shield</option>
                        <option value="procedures">Procedures</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Features</label>
                      {service.features && service.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-center space-x-2 mb-2">
                          <input
                            type="text"
                            value={feature}
                            onChange={(e) => updateFeature(index, featureIndex, e.target.value)}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter feature"
                          />
                          <button
                            onClick={() => removeFeature(index, featureIndex)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => addFeature(index)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        + Add Feature
                      </button>
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => setEditingService(null)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
                      >
                        <FaSave className="mr-2" />
                        Save
                      </button>
                      <button
                        onClick={() => {
                          if (isAdding) {
                            deleteService(index)
                            setIsAdding(false)
                          }
                          setEditingService(null)
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
                    <div className="flex justify-between items-start">
                      <div className="flex gap-4 flex-1">
                        {/* Service Image Thumbnail */}
                        {service.image ? (
                          <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                            <img 
                              src={service.image} 
                              alt={service.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FaImage className="text-gray-400 text-2xl" />
                          </div>
                        )}
                        
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900">{service.title}</h3>
                          <p className="text-gray-600 mt-1 line-clamp-2">{service.description}</p>
                          <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                            {service.price && <span>{service.price}</span>}
                            {service.duration && <span>{service.duration}</span>}
                            <span>{service.features?.length || 0} features</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={() => setEditingService(index)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => deleteService(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Helpful Tips */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-blue-800 font-semibold mb-2">Image Upload Tips:</h4>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>• Use high-quality images (recommended: 800x600px or larger)</li>
              <li>• Upload images to free services like <a href="https://imgur.com" target="_blank" className="underline">Imgur</a>, <a href="https://cloudinary.com" target="_blank" className="underline">Cloudinary</a>, or your own hosting</li>
              <li>• Copy the direct image URL and paste it in the Image URL field</li>
              <li>• Images with people work best for healthcare services</li>
              <li>• Make sure images are relevant to the service being offered</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}