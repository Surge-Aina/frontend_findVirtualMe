import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaImage, FaCalendar, FaUser, FaClock, FaTag } from 'react-icons/fa'
import Navbar from '../../components/Navbar'
import ScrollToTop from '../../components/ScrollToTop'
import Footer from '../../components/Footer'
import { api } from '../../lib/api'

export default function Blog() {
  const { practiceId } = useParams() // ✅ Get practiceId from URL
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('All')

  useEffect(() => {
    document.title = 'Blog - Healthcare'
    if (practiceId) {
      loadData()
    }
  }, [practiceId])

  const loadData = async () => {
    try {
      const data = await api.getPracticeData(practiceId) // ✅ Fixed
      setUserData(data)
    } catch (error) {
      console.error('Error loading blog data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!userData) {
    return <div>Error loading blog</div>
  }

  const blogPosts = userData.blogPosts || []
  const categories = ['All', ...new Set(blogPosts.map(post => post.category).filter(Boolean))]

  const filteredPosts = selectedCategory === 'All' 
    ? blogPosts 
    : blogPosts.filter(post => post.category === selectedCategory)

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <Navbar userData={userData} practiceId={practiceId} />
        
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white pt-24 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <motion.h1 
                className="text-4xl md:text-5xl font-bold mb-6"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8 }}
              >
                Health Blog & Articles
              </motion.h1>
              <motion.p 
                className="text-xl text-blue-100 max-w-3xl mx-auto"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                Stay informed with expert medical advice, health tips, and the latest healthcare news
              </motion.p>
            </div>
          </div>
        </section>

        {/* Category Filter */}
        <section className="bg-white py-8 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap justify-center gap-4">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-6 py-3 rounded-full font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Blog Grid */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {filteredPosts.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredPosts.map((post, index) => (
                  <motion.article 
                    key={post.id}
                    className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    whileHover={{ y: -5 }}
                  >
                    {/* Blog Image */}
                    <div className="h-48 bg-gradient-to-br from-blue-100 to-blue-200 relative overflow-hidden">
                      {post.image ? (
                        <img 
                          src={post.image} 
                          alt={post.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FaImage className="text-4xl text-blue-600 opacity-50" />
                        </div>
                      )}
                      {post.featured && (
                        <div className="absolute top-4 right-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                          Featured
                        </div>
                      )}
                    </div>

                    <div className="p-6">
                      {/* Category & Read Time */}
                      <div className="flex items-center justify-between mb-3">
                        {post.category && (
                          <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-medium">
                            {post.category}
                          </span>
                        )}
                        {post.readTime && (
                          <span className="text-gray-500 text-sm flex items-center">
                            <FaClock className="mr-1" />
                            {post.readTime}
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h3 className="text-xl font-bold text-gray-900 mb-3 hover:text-blue-600 transition-colors line-clamp-2">
                        {post.title}
                      </h3>

                      {/* Excerpt */}
                      <p className="text-gray-600 mb-4 line-clamp-3">
                        {post.excerpt}
                      </p>

                      {/* Meta Info */}
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        {post.author?.name && (
                          <span className="flex items-center">
                            <FaUser className="mr-1" />
                            {post.author.name}
                          </span>
                        )}
                        {post.publishDate && (
                          <span className="flex items-center">
                            <FaCalendar className="mr-1" />
                            {post.publishDate}
                          </span>
                        )}
                      </div>

                      {/* Tags */}
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {post.tags.slice(0, 3).map((tag, i) => (
                            <span key={i} className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs flex items-center">
                              <FaTag className="mr-1" />
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Read More Button - ✅ Fixed with practiceId */}
                      <Link
                        to={`/portfolios/healthcare/${practiceId}/blog/${post.id}`}
                        className="text-blue-600 hover:text-blue-700 font-semibold transition-colors flex items-center"
                      >
                        {userData.ui?.blog?.readMoreText || 'Read More'}
                        <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </div>
                  </motion.article>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <FaImage className="text-6xl text-gray-300 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">No Blog Posts Yet</h2>
                <p className="text-gray-600 mb-6">Blog posts will appear here once added through the admin panel.</p>
                <Link
                  to={`/portfolios/healthcare/${practiceId}/admin/dashboard`}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors inline-block"
                >
                  Go to Admin Panel
                </Link>
              </div>
            )}
          </div>
        </section>

        <Footer userData={userData} practiceId={practiceId} />
        <ScrollToTop />
      </div>
    </>
  )
}