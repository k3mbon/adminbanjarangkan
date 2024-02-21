import { Link } from 'react-router-dom';
import {
  FaHome,
  FaCalendarAlt,
  FaNewspaper,
  FaImages,
  FaTrophy,
  FaPhotoVideo,
} from 'react-icons/fa';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';  // Import useEffect and useState
import { onAuthStateChanged } from 'firebase/auth';  // Import onAuthStateChanged
import Logo from '../assets/logo.png';
import { Col, Row } from 'react-bootstrap';
// ... (imports)

const Sidebar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Listen for changes in authentication state
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    // Clean up the subscription when the component unmounts
    return () => unsubscribe();
  }, []); // Ensure this effect runs only once during component mount


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
    <>
      <div>
        <Row className="sidebar p-2">
          <Col>
            <img src={Logo} alt="Logo" />
          </Col>
        </Row>
        <Row className="sidebar p-2">
          <Col>
            <span className="brand-name fs-4 mt-2">
              SMA Negeri 1 Banjarangkan
            </span>
          </Col>
        </Row>
        <hr className="text-dark" />
        <div className="list-group lish-group-flush">
          <Link className="list-group-item py-2 mt-2" to="/">
            <FaHome className="fs-5 me-2" />
            <span className="fs-5">Home</span>
          </Link>
          <Link className="list-group-item py-2 mt-2" to="/agenda">
            <FaCalendarAlt className="fs-5 me-2" />
            <span className="fs-5">Agenda</span>
          </Link>
          <Link className="list-group-item py-2 mt-2" to="/posts">
            <FaNewspaper className="fs-5 me-2" />
            <span className="fs-5">Postingan Terbit</span>
          </Link>
          <Link className="list-group-item py-2 mt-2" to="/galeri">
            <FaImages className="fs-5 me-2" />
            <span className="fs-5">Galeri</span>
          </Link>
          <Link className="list-group-item py-2 mt-2" to="/prestasi">
            <FaTrophy className="fs-5 me-2" />
            <span className="fs-5">Prestasi</span>
          </Link>
          <Link className="list-group-item py-2 mt-2" to="/carousel">
            <FaPhotoVideo className="fs-5 me-2" />
            <span className="fs-5">Foto Carousel</span>
          </Link>
          {/* Display user email if available */}
          <h2>Admin Saat Ini</h2>
          {user && user.email && (
            <p className="mt-2 fs-5">{user.email}</p>
          )}
          <button className="mt-5" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
