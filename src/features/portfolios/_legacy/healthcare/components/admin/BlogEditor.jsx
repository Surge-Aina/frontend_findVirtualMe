import { useState } from 'react'
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaEye, FaImage, FaCamera } from 'react-icons/fa'
import { api } from '../../lib/api'

export default function BlogEditor({ blogPosts, onUpdate }) {
  const [editingPost, setEditingPost] = useState(null)
  const [isAdding, setIsAdding] = useState(false)

  const addPost = () => {
    const newPost = {
      id: Date.now(),
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      image: '',
      publishDate: new Date().toISOString().split('T')[0],
      author: { name: '', id: '' },
      category: '',
      tags: [],
      readTime: '5 min read',
      featured: false
    }
    onUpdate([...blogPosts, newPost])
    setEditingPost(blogPosts.length)
    setIsAdding(true)
  }

  const updatePost = (index, field, value) => {
    const updatedPosts = [...blogPosts]
    if (field.includes('.')) {
      const [parent, child] = field.split('.')
      updatedPosts[index] = {
        ...updatedPosts[index],
        [parent]: { ...updatedPosts[index][parent], [child]: value }
      }
    } else {
      updatedPosts[index] = { ...updatedPosts[index], [field]: value }
    }
    onUpdate(updatedPosts)
  }

  const deletePost = (index) => {
    if (confirm('Are you sure you want to delete this blog post?')) {
      const updatedPosts = blogPosts.filter((_, i) => i !== index)
      onUpdate(updatedPosts)
      setEditingPost(null)
      setIsAdding(false)
    }
  }

  const generateSlug = (title) => {
    return title.toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  const updateTags = (index, tagsString) => {
    const tags = tagsString.split(',').map(tag => tag.trim()).filter(tag => tag)
    updatePost(index, 'tags', tags)
  }

  const savePost = () => {
    setEditingPost(null)
    setIsAdding(false)
  }

  const cancelEdit = (index) => {
    if (isAdding) {
      deletePost(index)
      setIsAdding(false)
    }
    setEditingPost(null)
  }

  const uploadBlogImage = async (file, postIndex) => {
    try {
      // Get public URL from S3
      const publicUrl = await api.uploadImageToS3(file);
      // Save final public URL
      updatePost(postIndex, 'image', publicUrl)
    } catch (err) {
      console.error('Blog Image Upload Error:', err)
      alert('Image upload failed')
    }
  }


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Blog Posts Management</h2>
        <button
          onClick={addPost}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
        >
          <FaPlus className="mr-2" />
          Add Blog Post
        </button>
      </div>

      {blogPosts.length === 0 && editingPost === null && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <FaImage className="mx-auto text-4xl text-gray-400 mb-4" />
          <p className="text-gray-600 mb-4">No blog posts yet</p>
          <button
            onClick={addPost}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Create Your First Blog Post
          </button>
        </div>
      )}

      <div className="space-y-4">
        {blogPosts.map((post, index) => (
          <div key={post.id} className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
            {editingPost === index ? (
              <div className="space-y-4">
                {/* Featured Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Featured Image URL
                  </label>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <input
                        type="url"
                        value={post.image || ''}
                        onChange={(e) => updatePost(index, 'image', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="https://example.com/blog-image.jpg"
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
                            if (file) uploadBlogImage(file, index)
                          }}
                        />
                      </label>

                      <p className="text-xs text-gray-500 mt-1">
                        Paste an image URL or upload directly (recommended: 1200x630px)
                      </p>
                    </div>

                    {/* Preview */}
                    {post.image && (
                      <div className="w-32 h-24 border rounded-lg overflow-hidden flex-shrink-0">
                        <img 
                          src={post.image} 
                          alt="Preview" 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none'
                          }}
                        />
                      </div>
                    )}
                    {!post.image && (
                      <div className="w-32 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FaCamera className="text-gray-400 text-2xl" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                    <input
                      type="text"
                      value={post.title || ''}
                      onChange={(e) => {
                      const newTitle = e.target.value;
                      const newSlug = generateSlug(newTitle);
                      const updatedPosts = [...blogPosts];
                      updatedPosts[index] = {
                        ...updatedPosts[index],
                        title: newTitle,
                        slug: newSlug
                      };
                     onUpdate(updatedPosts);
                    }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter blog post title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <input
                      type="text"
                      value={post.category || ''}
                      onChange={(e) => updatePost(index, 'category', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Health Tips, News"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Excerpt *</label>
                  <textarea
                    value={post.excerpt || ''}
                    onChange={(e) => updatePost(index, 'excerpt', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Brief description of the post"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Content *</label>
                  <textarea
                    value={post.content || ''}
                    onChange={(e) => updatePost(index, 'content', e.target.value)}
                    rows={10}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Write your blog post content here (HTML supported)"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Author Name</label>
                    <input
                      type="text"
                      value={post.author?.name || ''}
                      onChange={(e) => updatePost(index, 'author.name', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Author name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Publish Date</label>
                    <input
                      type="date"
                      value={post.publishDate || ''}
                      onChange={(e) => updatePost(index, 'publishDate', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tags (comma separated)</label>
                  <input
                    type="text"
                    value={post.tags?.join(', ') || ''}
                    onChange={(e) => updateTags(index, e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="health, wellness, tips"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id={`featured-${index}`}
                    checked={post.featured || false}
                    onChange={(e) => updatePost(index, 'featured', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor={`featured-${index}`} className="ml-2 text-sm font-medium text-gray-700">
                    Featured Post
                  </label>
                </div>

                <div className="flex space-x-2 pt-4 border-t">
                  <button
                    onClick={savePost}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
                  >
                    <FaSave className="mr-2" />
                    Save
                  </button>
                  <button
                    onClick={() => cancelEdit(index)}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
                  >
                    <FaTimes className="mr-2" />
                    Cancel
                  </button>
                  {!isAdding && (
                    <button
                      onClick={() => deletePost(index)}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center ml-auto"
                    >
                      <FaTrash className="mr-2" />
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-start">
                  <div className="flex gap-4 flex-1">
                    {/* Blog Image Thumbnail */}
                    {post.image ? (
                      <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                        <img 
                          src={post.image} 
                          alt={post.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FaImage className="text-gray-400 text-2xl" />
                      </div>
                    )}
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{post.title || 'Untitled Post'}</h3>
                        {post.featured && (
                          <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">Featured</span>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm mb-2 line-clamp-2">{post.excerpt || 'No excerpt'}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        {post.author?.name && <span>By {post.author.name}</span>}
                        {post.publishDate && <span>{post.publishDate}</span>}
                        {post.category && <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">{post.category}</span>}
                      </div>
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex gap-1 mt-2">
                          {post.tags.map((tag, i) => (
                            <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => setEditingPost(index)}
                      className="text-blue-600 hover:text-blue-800 p-2"
                      title="Edit"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => deletePost(index)}
                      className="text-red-600 hover:text-red-800 p-2"
                      title="Delete"
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
        <h4 className="text-blue-800 font-semibold mb-2">💡 Blog Post Tips:</h4>
        <ul className="text-blue-700 text-sm space-y-1">
          <li>• Use high-quality featured images (recommended: 1200x630px)</li>
          <li>• Upload images directly or paste image URLs from hosting services</li>
          <li>• Write engaging titles that capture attention</li>
          <li>• Keep excerpts concise (1-2 sentences)</li>
          <li>• Use HTML tags in content for formatting: &lt;p&gt;, &lt;h2&gt;, &lt;strong&gt;, etc.</li>
          <li>• Add relevant tags to help with categorization</li>
          <li>• Featured posts appear prominently on the blog page</li>
        </ul>
      </div>
    </div>
  )
}