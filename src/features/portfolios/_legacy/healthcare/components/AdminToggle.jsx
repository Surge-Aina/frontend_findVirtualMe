import { useState, useEffect } from 'react'
import { FaEdit, FaEye, FaSignInAlt, FaSignOutAlt } from 'react-icons/fa'

export default function AdminToggle() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [editMode, setEditMode] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    setIsLoggedIn(!!token)
  }, [])

  const login = async () => {
    const username = prompt('Username:')
    const password = prompt('Password:')
    
    if (!username || !password) return
    
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })
      
      if (response.ok) {
        const { token } = await response.json()
        localStorage.setItem('adminToken', token)
        setIsLoggedIn(true)
        setEditMode(true)
        window.location.reload() 
      } else {
        alert('Invalid credentials')
      }
    } catch (error) {
      alert('Login failed')
    }
  }

  const logout = () => {
    localStorage.removeItem('adminToken')
    setIsLoggedIn(false)
    setEditMode(false)
    window.location.reload()
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isLoggedIn ? (
        <button
          onClick={login}
          className="bg-gray-800 hover:bg-gray-900 text-white p-3 rounded-full shadow-lg transition-all opacity-70 hover:opacity-100"
          title="Login to edit"
        >
          <FaSignInAlt />
        </button>
      ) : (
        <div className="flex space-x-2">
          <button
            onClick={() => setEditMode(!editMode)}
            className={`p-3 rounded-full shadow-lg transition-all ${
              editMode 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-gray-600 text-white hover:bg-gray-700'
            }`}
            title={editMode ? 'Exit edit mode' : 'Enter edit mode'}
          >
            {editMode ? <FaEye /> : <FaEdit />}
          </button>
          
          <button
            onClick={logout}
            className="bg-red-600 hover:bg-red-700 text-white p-3 rounded-full shadow-lg transition-all"
            title="Logout"
          >
            <FaSignOutAlt />
          </button>
        </div>
      )}
    </div>
  )
}