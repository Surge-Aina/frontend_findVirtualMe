import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaSearch, FaFileAlt, FaCog, FaArrowLeft } from "react-icons/fa";
import Navbar from "../components/Navbar";
import ScrollToTop from "../components/ScrollToTop";
import Footer from "../components/Footer";
import { api } from "../lib/api";
import { Link, useLocation } from "react-router-dom";

export default function SearchResults() {
  const location = useLocation();

  // Extract query parameter ?q=...
  const queryParams = new URLSearchParams(location.search);
  const q = queryParams.get("q");

  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchResults, setSearchResults] = useState({
    services: [],
    blogPosts: [],
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (userData && q) {
      performSearch(q);
    }
  }, [userData, q]);

  const loadData = async () => {
    try {
      const data = await api.getUserData();
      setUserData(data);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const performSearch = (query) => {
    if (!query || !userData) return;

    const searchQuery = query.toLowerCase().trim();

    const matchingServices = (userData.services || []).filter(
      (service) =>
        service.title?.toLowerCase().includes(searchQuery) ||
        service.description?.toLowerCase().includes(searchQuery) ||
        service.features?.some((feature) =>
          feature?.toLowerCase().includes(searchQuery)
        )
    );

    const matchingBlogPosts = (userData.blogPosts || []).filter(
      (post) =>
        post.title?.toLowerCase().includes(searchQuery) ||
        post.excerpt?.toLowerCase().includes(searchQuery) ||
        post.content?.toLowerCase().includes(searchQuery) ||
        post.tags?.some((tag) => tag?.toLowerCase().includes(searchQuery)) ||
        post.category?.toLowerCase().includes(searchQuery)
    );

    setSearchResults({
      services: matchingServices,
      blogPosts: matchingBlogPosts,
    });
  };

  const totalResults =
    searchResults.services.length + searchResults.blogPosts.length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userData={userData} />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to="/portfolios/healthcare"
            className="inline-flex items-center text-blue-100 hover:text-white mb-6 transition-colors"
          >
            <FaArrowLeft className="mr-2" />
            Back to Home
          </Link>

          <div className="text-center">
            <motion.div
              className="flex justify-center mb-4"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="bg-white/20 rounded-full p-4">
                <FaSearch className="text-4xl" />
              </div>
            </motion.div>

            <motion.h1
              className="text-4xl md:text-5xl font-bold mb-4"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              Search Results
            </motion.h1>

            <motion.p
              className="text-xl text-blue-100 mb-2"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Showing results for: <strong>"{q}"</strong>
            </motion.p>

            <motion.p
              className="text-blue-200"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              {totalResults} {totalResults === 1 ? "result" : "results"} found
            </motion.p>
          </div>
        </div>
      </section>

      {/* Search Results */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {totalResults === 0 ? (
            <div className="text-center py-12">
              <div className="bg-white rounded-xl shadow-lg p-12">
                <FaSearch className="text-6xl text-gray-300 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  No Results Found
                </h2>
                <p className="text-gray-600 mb-6">
                  We couldn't find any results matching "
                  <strong>{q}</strong>"
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    to="/portfolios/healthcare/services"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                  >
                    Browse Services
                  </Link>
                  <Link
                    to="/portfolios/healthcare/blog"
                    className="border border-blue-600 text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-lg font-semibold transition-colors"
                  >
                    Read Blog
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-12">
              {/* Services Results */}
              {searchResults.services.length > 0 && (
                <div>
                  <div className="flex items-center mb-6">
                    <FaCog className="text-blue-600 text-2xl mr-3" />
                    <h2 className="text-2xl font-bold text-gray-900">
                      Services ({searchResults.services.length})
                    </h2>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {searchResults.services.map((service, index) => (
                      <motion.div
                        key={service.id || index}
                        className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                      >
                        {service.image && (
                          <div className="h-48 overflow-hidden">
                            <img
                              src={service.image}
                              alt={service.title}
                              className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                            />
                          </div>
                        )}

                        <div className="p-6">
                          <h3 className="text-xl font-bold text-gray-900 mb-2">
                            {service.title}
                          </h3>
                          <p className="text-gray-600 mb-4 line-clamp-3">
                            {service.description}
                          </p>
                          <Link
                            to="/portfolios/healthcare/services"
                            className="text-blue-600 hover:text-blue-700 font-semibold flex items-center"
                          >
                            View Service
                            <svg
                              className="ml-2 w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </Link>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Blog Posts Results */}
              {searchResults.blogPosts.length > 0 && (
                <div>
                  <div className="flex items-center mb-6">
                    <FaFileAlt className="text-blue-600 text-2xl mr-3" />
                    <h2 className="text-2xl font-bold text-gray-900">
                      Blog Articles ({searchResults.blogPosts.length})
                    </h2>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {searchResults.blogPosts.map((post, index) => (
                      <motion.div
                        key={post.id || index}
                        className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                      >
                        {post.image && (
                          <div className="h-48 overflow-hidden">
                            <img
                              src={post.image}
                              alt={post.title}
                              className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                            />
                          </div>
                        )}

                        <div className="p-6">
                          {post.category && (
                            <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-medium mb-3 inline-block">
                              {post.category}
                            </span>
                          )}

                          <h3 className="text-xl font-bold text-gray-900 mb-2">
                            {post.title}
                          </h3>
                          <p className="text-gray-600 mb-4 line-clamp-3">
                            {post.excerpt}
                          </p>
                          <Link
                            to={`/portfolios/healthcare/blog/${post.slug || post.id}`}
                            className="text-blue-600 hover:text-blue-700 font-semibold flex items-center"
                          >
                            Read Article
                            <svg
                              className="ml-2 w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </Link>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {userData?.practice && <Footer userData={userData} practiceId={userData._id} />}
      <ScrollToTop />
    </div>
  );
}
