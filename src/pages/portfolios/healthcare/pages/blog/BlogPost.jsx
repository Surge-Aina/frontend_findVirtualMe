import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { FaArrowLeft, FaCalendarAlt, FaUser, FaClock } from 'react-icons/fa'
import Navbar from '../../components/Navbar'
import ScrollToTop from '../../components/ScrollToTop'
import Footer from '../../components/Footer'
import { api } from '../../lib/api'

export default function BlogPost() {
  const { practiceId, id } = useParams() // ✅ Get both practiceId and post id from URL
  const [userData, setUserData] = useState(null)
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (practiceId && id) {
      loadData()
    }
  }, [practiceId, id])

  const loadData = async () => {
    try {
      const data = await api.getPracticeData(practiceId) // ✅ Fixed
      setUserData(data)
      
      const foundPost = data.blogPosts?.find(p => p.id.toString() === id)
      if (foundPost) {
        setPost(foundPost)
        document.title = `${foundPost.title} - Blog`
      } else {
        console.error('Post not found')
      }
    } catch (error) {
      console.error('Error loading blog post:', error)
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

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar userData={userData} practiceId={practiceId} />
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Blog Post Not Found</h1>
          <Link 
            to={`/portfolios/healthcare/${practiceId}/blog`}
            className="inline-flex items-center text-blue-600 hover:text-blue-700"
          >
            <FaArrowLeft className="mr-2" />
            Back to Blog
          </Link>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <Navbar userData={userData} practiceId={practiceId} />
        
        <article className="pt-24 pb-20">
          <div className="max-w-4xl mx-auto px-4">
            {/* Back Button - ✅ Fixed with practiceId */}
            <Link 
              to={`/portfolios/healthcare/${practiceId}/blog`}
              className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-8"
            >
              <FaArrowLeft className="mr-2" />
              Back to Blog
            </Link>

            {/* Post Header */}
            <header className="mb-8">
              {post.category && (
                <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-medium">
                  {post.category}
                </span>
              )}
              <h1 className="text-4xl font-bold text-gray-900 mt-4 mb-4">
                {post.title}
              </h1>
              
              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-4 text-gray-600">
                <div className="flex items-center">
                  <FaUser className="mr-2" />
                  {post.author?.name || 'Staff'}
                </div>
                <div className="flex items-center">
                  <FaCalendarAlt className="mr-2" />
                  {new Date(post.publishDate).toLocaleDateString()}
                </div>
                {post.readTime && (
                  <div className="flex items-center">
                    <FaClock className="mr-2" />
                    {post.readTime}
                  </div>
                )}
              </div>
              
              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {post.tags.map((tag, i) => (
                    <span key={i} className="bg-gray-100 text-gray-600 px-3 py-1 rounded text-sm">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </header>

            {/* Featured Image */}
            {post.image && (
              <div className="mb-8 rounded-xl overflow-hidden shadow-lg">
                <img 
                  src={post.image} 
                  alt={post.title}
                  className="w-full h-auto"
                />
              </div>
            )}

            {/* Post Content */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div 
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </div>

            {/* Related Posts Section (Optional) */}
            {userData?.blogPosts && userData.blogPosts.length > 1 && (
              <div className="mt-12">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Related Articles</h3>
                <div className="grid md:grid-cols-3 gap-6">
                  {userData.blogPosts
                    .filter(p => p.id !== post.id)
                    .slice(0, 3)
                    .map((relatedPost) => (
                      <Link
                        key={relatedPost.id}
                        to={`/portfolios/healthcare/${practiceId}/blog/${relatedPost.id}`}
                        className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all overflow-hidden"
                      >
                        {relatedPost.image && (
                          <div className="h-32 overflow-hidden">
                            <img 
                              src={relatedPost.image} 
                              alt={relatedPost.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="p-4">
                          <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                            {relatedPost.title}
                          </h4>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {relatedPost.excerpt}
                          </p>
                        </div>
                      </Link>
                    ))}
                </div>
              </div>
            )}
          </div>
        </article>

        <Footer userData={userData} practiceId={practiceId} />
        <ScrollToTop />
      </div>
    </>
  )
}