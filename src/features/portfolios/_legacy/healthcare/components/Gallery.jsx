import { FaClinicMedical, FaProcedures, FaXRay, FaHospital, FaBed, FaMicroscope, FaImage } from 'react-icons/fa'

export default function Gallery() {
  const galleryItems = [
    { icon: FaClinicMedical, title: '[Reception Area]', gradient: 'from-blue-100 to-blue-200' },
    { icon: FaProcedures, title: '[Treatment Room]', gradient: 'from-green-100 to-green-200' },
    { icon: FaXRay, title: '[Diagnostic Equipment]', gradient: 'from-purple-100 to-purple-200' },
    { icon: FaHospital, title: '[Surgical Suite]', gradient: 'from-yellow-100 to-yellow-200' },
    { icon: FaBed, title: '[Recovery Area]', gradient: 'from-red-100 to-red-200' },
    { icon: FaMicroscope, title: '[Laboratory]', gradient: 'from-indigo-100 to-indigo-200' }
  ]

  const beforeAfterCases = [
    {
      title: '[Case Type 1]',
      timeframe: '[Timeframe - 3 months post-treatment]',
      description: '[Case description and results achieved]'
    },
    {
      title: '[Case Type 2]',
      timeframe: '[Timeframe]',
      description: '[Case description and results achieved]'
    }
  ]

  return (
    <section id="gallery" className="bg-gray-50 py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold text-dark mb-6">Our Facility & Results</h2>
          <p className="text-xl text-secondary max-w-3xl mx-auto">
            [Take a look at our state-of-the-art facility and patient success stories]
          </p>
        </div>
        
        {/* Facility Gallery */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {galleryItems.map((item, index) => {
            const Icon = item.icon
            return (
              <div key={index} className={`bg-gradient-to-br ${item.gradient} rounded-xl h-64 flex items-center justify-center hover:scale-105 transition-transform duration-300 cursor-pointer`}>
                <div className="text-center text-primary/60">
                  <Icon className="text-4xl mb-4 mx-auto" />
                  <p className="font-semibold">{item.title}</p>
                </div>
              </div>
            )
          })}
        </div>
        
        {/* Before/After Section */}
        <div>
          <h3 className="text-2xl lg:text-3xl font-bold text-dark mb-8 text-center">Patient Results</h3>
          
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
                  <strong>Disclaimer:</strong> Results may vary. Individual results are not guaranteed and may vary from person to person. All photos shared with patient consent.
                </p>
              </div>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {beforeAfterCases.map((case_, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-6">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-gray-100 rounded-lg h-40 flex items-center justify-center">
                    <div className="text-center text-gray-400">
                      <FaImage className="text-2xl mb-2 mx-auto" />
                      <p className="text-sm">Before</p>
                    </div>
                  </div>
                  <div className="bg-green-50 rounded-lg h-40 flex items-center justify-center">
                    <div className="text-center text-green-400">
                      <FaImage className="text-2xl mb-2 mx-auto" />
                      <p className="text-sm">After</p>
                    </div>
                  </div>
                </div>
                <h4 className="font-bold text-dark mb-2">{case_.title}</h4>
                <p className="text-secondary text-sm mb-2">{case_.timeframe}</p>
                <p className="text-secondary">{case_.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}