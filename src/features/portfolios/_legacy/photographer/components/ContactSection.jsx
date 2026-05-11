export default function ContactSection() {

  return (
    <section className="text-center">
      <div className="relative bg-black text-white rounded-3xl p-16 overflow-hidden group">
        <div className="relative z-10">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-light mb-6 tracking-tight px-4" style={{color: '#ffffff'}}>Let's Create Together</h2>
          <p className="text-xl font-light mb-10 max-w-2xl mx-auto leading-relaxed opacity-90" style={{color: '#ffffff'}}>Ready to capture your story? Let's discuss your vision and create something extraordinary.</p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <a 
              href="/portfolios/photographer/contact" 
              className="group inline-flex items-center space-x-3 bg-white px-10 py-4 rounded-2xl font-light text-lg hover:bg-gray-100 transform hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
              style={{color: '#000000'}}
            >
              Get in touch
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
            
            <a 
              href="/portfolios/photographer/gallery" 
              className="group inline-flex items-center space-x-3 bg-white px-10 py-4 rounded-2xl font-light text-lg hover:bg-gray-100 transform hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
              style={{color: '#000000'}}
            >
              View full gallery
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </a>
          </div>
        </div>
        
        {/* Subtle geometric background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 border border-white rounded-full group-hover:scale-110 transition-transform duration-700"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 border border-white rounded-full group-hover:scale-110 transition-transform duration-700" style={{transitionDelay: '200ms'}}></div>
        </div>
      </div>
    </section>
  );
}