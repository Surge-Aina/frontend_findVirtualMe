import React from 'react';

export default function Slideshow({ photos, isAdmin = false }) {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const slideshowRef = React.useRef(null);
  const photosToUse = photos;

  const scrollToIndex = (index) => {
    const container = slideshowRef.current;
    const imageWidth = container.clientWidth;
    container.scrollTo({
      left: index * imageWidth,
      behavior: 'smooth',
    });
    setCurrentIndex(index);
  };

  // Update currentIndex on scroll
  const handleScroll = () => {
    const container = slideshowRef.current;
    const scrollLeft = container.scrollLeft;
    const imageWidth = container.clientWidth;
    const index = Math.round(scrollLeft / imageWidth);
    setCurrentIndex(index);
  };

  return (
    <section className="relative w-full h-screen overflow-hidden group">
      {/* Slideshow Container */}
      <div
        ref={slideshowRef}
        onScroll={handleScroll}
        className="flex w-full h-full overflow-x-auto snap-x snap-mandatory scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {photosToUse.map((photo, index) => (
          <div
            key={photo.id}
            className="w-full h-full flex-shrink-0 snap-center"
          >
            <img
              src={photo.url}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>

      {/* Hide scrollbar for webkit browsers */}
      <style jsx>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      {/* Left Arrow */}
      {currentIndex > 0 && (
        <button
          onClick={() => scrollToIndex(currentIndex - 1)}
          className="absolute top-1/2 left-4 transform -translate-y-1/2 text-white bg-black/40 hover:bg-black/60 rounded-full w-12 h-12 flex items-center justify-center transition-opacity opacity-0 group-hover:opacity-100 z-10"
          aria-label="Previous"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {/* Right Arrow */}
      {currentIndex < photosToUse.length - 1 && (
        <button
          onClick={() => scrollToIndex(currentIndex + 1)}
          className="absolute top-1/2 right-4 transform -translate-y-1/2 text-white bg-black/40 hover:bg-black/60 rounded-full w-12 h-12 flex items-center justify-center transition-opacity opacity-0 group-hover:opacity-100 z-10"
          aria-label="Next"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      {/* Dot Indicators */}
      <div className="absolute bottom-6 w-full flex justify-center space-x-2 z-10">
        {photosToUse.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollToIndex(index)}
            className={`h-3 w-3 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? 'bg-white scale-125'
                : 'bg-white/30 group-hover:bg-white/50 hover:scale-110'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}