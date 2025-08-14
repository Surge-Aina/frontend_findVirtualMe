import './index.css';
import 'react-toastify/dist/ReactToastify.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from './components/AuthContext.jsx';
import Login from './components/Login.jsx';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import Home from './pages/Home.jsx';
import Services from './pages/Services.jsx';
import GalleryPage from './pages/GalleryPage.jsx';
import Contact from './pages/Contact.jsx';
import GalleryCategory from './pages/GalleryCategory.jsx';

function PhotographerApp() {
  return (
    <AuthProvider>
      <div className="photographerStyles bg-white min-h-screen text-black">
        <Navbar />
        <Routes>
          <Route path="login" element={<Login />} />
          <Route path="" element={<Home />}/>
          <Route path="services" element={<Services />} />
          <Route path="gallery" element={<GalleryPage />} />
          <Route path="gallery/:category" element={<GalleryCategory />} />
          <Route path="contact" element={<Contact />} />
        </Routes>
        <Footer />
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </AuthProvider>
  );
}

export default PhotographerApp;