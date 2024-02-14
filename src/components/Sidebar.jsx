import React from 'react'
import { Link } from 'react-router-dom';
import { FaHome, FaCalendarAlt, FaNewspaper, FaImages, FaTrophy, FaPhotoVideo } from 'react-icons/fa';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log('User signed out successfully');
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  

  return (
    <div className="sidebar">
       <Link to="/">
        <FaHome />
        <span>Home</span>
      </Link>
      <Link to="/agenda">
        <FaCalendarAlt />
        <span>Agenda</span>
      </Link>
      <Link to="/posts">
        <FaNewspaper />
        <span>Postingan Terbit</span>
      </Link>
      <Link to="/galeri">
        <FaImages />
        <span>Galeri</span>
      </Link>
      <Link to="/prestasi">
        <FaTrophy />
        <span>Prestasi</span>
      </Link>
      <Link to="/carousel">
        <FaPhotoVideo />
        <span>Foto Carousel</span>
      </Link>

      <button onClick={handleLogout}>
      Logout
    </button>
    </div>
  )
}

export default Sidebar