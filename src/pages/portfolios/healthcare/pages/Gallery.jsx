import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../lib/api'
import { FaImage, FaCamera, FaSpinner } from 'react-icons/fa'
import Navbar from '../components/Navbar'
import ScrollToTop from '../components/ScrollToTop'
import Footer from '../components/Footer'

export default function Gallery() {
  const { practiceId } = useParams()
  const [practiceData, setPracticeData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        let data
        
        if (practiceId === 'demo' || !practiceId) {
          data = await api.getDemoData()
        } else {
          data = await api.getPracticeData(practiceId)
        }
        
        setPracticeData(data)
      } catch (error) {
        console.error('Error fetching practice data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [practiceId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center min-h-screen">
          <FaSpinner className="animate-spin text-4xl text-blue-600" />
        </div>
      </div>
    )
  }

  const gallery = practiceData?.gallery || { facilityImages: [], beforeAfterCases: [] }
  const facilityImages = gallery.facilityImages || []
  const beforeAfterCases = gallery.beforeAfterCases || []

  const hasContent = facilityImages.length > 0 || beforeAfterCases.length > 0

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userData={practiceData} practiceId={practiceId} />
      
      {/* Hero Section - matching other pages */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">
            Our Facility & Results
          </h1>
          <p className="text-xl opacity-90 max-w-3xl mx-auto">
            Take a look at our state-of-the-art facility and patient success stories
          </p>
        </div>
      </section>
      
      <section id="gallery" className="py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {!hasContent ? (
          /* Empty State */
          <div className="text-center py-16 bg-white rounded-xl shadow-sm">
            <FaCamera className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Gallery Coming Soon</h3>
            <p className="text-gray-500">
              We're preparing photos of our facility and patient results.
            </p>
          </div>
        ) : (
          <>
            {/* Facility Images Section */}
            {facilityImages.length > 0 && (
              <div className="mb-16">
                <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-8 text-center">
                  Our Facilities
                </h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {facilityImages.map((image, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer"
                      onClick={() => setSelectedImage(image)}
                    >
                      <div className="h-64 bg-gray-100 relative">
                        {image.url ? (
                          <img
                            src={image.url}
                            alt={image.caption || 'Facility image'}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none'
                              e.target.nextSibling.style.display = 'flex'
                            }}
                          />
                        ) : null}
                        <div 
                          className={`absolute inset-0 flex items-center justify-center bg-gray-200 ${image.url ? 'hidden' : ''}`}
                        >
                          <FaImage className="text-4xl text-gray-400" />
                        </div>
                      </div>
                      {(image.caption || image.description) && (
                        <div className="p-4">
                          {image.caption && (
                            <h4 className="font-semibold text-gray-900 mb-1">{image.caption}</h4>
                          )}
                          {image.description && (
                            <p className="text-gray-600 text-sm">{image.description}</p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Before/After Section */}
            {beforeAfterCases.length > 0 && (
              <div>
                <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-8 text-center">
                  Before & After
                </h3>

                {/* Disclaimer */}
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg mb-8">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-yellow-700">
                        <strong>Disclaimer:</strong> Results may vary. Individual results are not guaranteed and may differ from person to person. All photos shared with patient consent.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  {beforeAfterCases.map((case_, index) => (
                    <div key={index} className="bg-white rounded-xl shadow-lg p-6">
                      {/* Before/After Images */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="relative">
                          <p className="text-sm font-medium text-gray-700 mb-2 text-center">Before</p>
                          <div className="bg-red-50 rounded-lg h-48 overflow-hidden">
                            {case_.beforeImage ? (
                              <img
                                src={case_.beforeImage}
                                alt="Before"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = 'none'
                                  e.target.nextSibling.style.display = 'flex'
                                }}
                              />
                            ) : null}
                            <div className={`w-full h-full flex items-center justify-center ${case_.beforeImage ? 'hidden' : ''}`}>
                              <FaCamera className="text-2xl text-red-300" />
                            </div>
                          </div>
                        </div>
                        <div className="relative">
                          <p className="text-sm font-medium text-gray-700 mb-2 text-center">After</p>
                          <div className="bg-green-50 rounded-lg h-48 overflow-hidden">
                            {case_.afterImage ? (
                              <img
                                src={case_.afterImage}
                                alt="After"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = 'none'
                                  e.target.nextSibling.style.display = 'flex'
                                }}
                              />
                            ) : null}
                            <div className={`w-full h-full flex items-center justify-center ${case_.afterImage ? 'hidden' : ''}`}>
                              <FaCamera className="text-2xl text-green-300" />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Case Details */}
                      {case_.title && (
                        <h4 className="font-bold text-gray-900 mb-2">{case_.title}</h4>
                      )}
                      {case_.treatment && (
                        <p className="text-blue-600 font-medium text-sm mb-1">{case_.treatment}</p>
                      )}
                      {case_.duration && (
                        <p className="text-gray-500 text-sm mb-2">Duration: {case_.duration}</p>
                      )}
                      {case_.description && (
                        <p className="text-gray-600 text-sm">{case_.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="max-w-4xl max-h-full">
            <img
              src={selectedImage.url}
              alt={selectedImage.caption || 'Gallery image'}
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
            />
            {selectedImage.caption && (
              <p className="text-white text-center mt-4 text-lg">{selectedImage.caption}</p>
            )}
          </div>
        </div>
      )}
      </section>
      
      <Footer userData={practiceData} practiceId={practiceId} />
      <ScrollToTop />
    </div>
  )
}