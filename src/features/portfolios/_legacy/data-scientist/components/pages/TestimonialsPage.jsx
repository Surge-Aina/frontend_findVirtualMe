import React, { useState, useEffect } from 'react';
import { testimonialAPI } from '../../utils/api';

const TestimonialsPage = () => {
  const [topTestimonials, setTopTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    rating: 5,
    review: ''
  });

  useEffect(() => {
    loadTestimonials();
  }, []);

  const loadTestimonials = async () => {
    try {
      setLoading(true);
      const topData = await testimonialAPI.getTopTestimonials();
      setTopTestimonials(topData);
    } catch (error) {
      console.error('Error loading reviews:', error);
      setMessage('Error loading reviews. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'rating' ? parseInt(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('Form submitted with data:', formData);
    
    if (!formData.name || !formData.email || !formData.review) {
      setMessage('Please fill in all required fields.');
      return;
    }

    try {
      setSubmitting(true);
      setMessage('');
      console.log('Submitting testimonial to API...');
      const result = await testimonialAPI.submitTestimonial(formData);
      console.log('API response:', result);
      setMessage('Thank you for your review! It will be reviewed before being published.');
      setFormData({
        name: '',
        email: '',
        rating: 5,
        review: ''
      });
    } catch (error) {
      console.error('Error submitting review:', error);
      setMessage(error.response?.data?.message || 'Error submitting review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <svg
        key={index}
        className={`w-5 h-5 ${
          index < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
        viewBox="0 0 20 20"
      >
        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
      </svg>
    ));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-terminal-accent font-mono">Loading testimonials...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-terminal-text mb-4 font-mono">
          Reviews
        </h1>
        <p className="text-terminal-textDim text-lg font-mono">
          See what others have to say about my work
        </p>
      </div>

      {/* Recent Reviews */}
      {topTestimonials.length > 0 && (
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-terminal-text mb-8 font-mono text-center">
            Recent Reviews
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {topTestimonials.map((testimonial) => (
              <div
                key={testimonial._id}
                className="bg-terminal-card border border-terminal-border rounded-lg p-6 hover:shadow-terminal transition-shadow duration-200"
              >
                <div className="flex items-center mb-4">
                  <div className="flex mr-3">
                    {renderStars(testimonial.rating)}
                  </div>
                  <span className="text-sm text-terminal-textMuted font-mono">
                    {testimonial.rating}/5
                  </span>
                </div>
                <p className="text-terminal-text mb-4 font-mono leading-relaxed">
                  &ldquo;{testimonial.review}&rdquo;
                </p>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-terminal-accent font-mono">
                    {testimonial.name}
                  </span>
                  <span className="text-sm text-terminal-textMuted font-mono">
                    {formatDate(testimonial.createdAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Leave a Review Section */}
      <div className="bg-terminal-card border border-terminal-border rounded-lg p-8">
        <h2 className="text-2xl font-bold text-terminal-text mb-6 font-mono text-center">
          Leave a Review
        </h2>
        <p className="text-center text-terminal-textMuted mb-4">Form is loaded and ready!</p>
        
        {message && (
          <div className={`mb-6 p-4 rounded-lg font-mono ${
            message.includes('Error') 
              ? 'bg-red-100 text-red-700 border border-red-300' 
              : 'bg-green-100 text-green-700 border border-green-300'
          }`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-terminal-text mb-2 font-mono">
                Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-terminal-border rounded-lg bg-white text-terminal-text font-mono focus:outline-none focus:ring-2 focus:ring-terminal-accent focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-terminal-text mb-2 font-mono">
                Email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-terminal-border rounded-lg bg-white text-terminal-text font-mono focus:outline-none focus:ring-2 focus:ring-terminal-accent focus:border-transparent"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="rating" className="block text-sm font-medium text-terminal-text mb-2 font-mono">
              Rating *
            </label>
            <div className="flex items-center space-x-2">
              <select
                id="rating"
                name="rating"
                value={formData.rating}
                onChange={handleInputChange}
                className="px-4 py-2 border border-terminal-border rounded-lg bg-white text-terminal-text font-mono focus:outline-none focus:ring-2 focus:ring-terminal-accent focus:border-transparent"
              >
                <option value={5}>5 Stars - Excellent</option>
                <option value={4}>4 Stars - Very Good</option>
                <option value={3}>3 Stars - Good</option>
                <option value={2}>2 Stars - Fair</option>
                <option value={1}>1 Star - Poor</option>
              </select>
              <div className="flex">
                {renderStars(formData.rating)}
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="review" className="block text-sm font-medium text-terminal-text mb-2 font-mono">
              Review *
            </label>
            <textarea
              id="review"
              name="review"
              value={formData.review}
              onChange={handleInputChange}
              rows={4}
              maxLength={1000}
              className="w-full px-4 py-2 border border-terminal-border rounded-lg bg-white text-terminal-text font-mono focus:outline-none focus:ring-2 focus:ring-terminal-accent focus:border-transparent resize-none"
              placeholder="Share your experience and feedback..."
              required
            />
            <div className="text-right text-sm text-terminal-textMuted font-mono mt-1">
              {formData.review.length}/1000 characters
            </div>
          </div>

          <div className="text-center">
            <button
              type="submit"
              disabled={submitting}
              className="px-8 py-3 bg-terminal-accent text-white font-semibold rounded-lg hover:bg-terminal-accent/90 transition-colors duration-200 font-mono disabled:opacity-50 disabled:cursor-not-allowed border-2 border-terminal-accent shadow-lg"
              style={{ backgroundColor: '#22c55e', color: 'white' }}
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TestimonialsPage;
