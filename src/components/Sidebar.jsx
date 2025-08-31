import { Link, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  CalendarIcon,
  PhotoIcon,
  TrophyIcon,
  ViewfinderCircleIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Logo from '../assets/logo.png';
import './Sidebar/Sidebar.css';
// ... (imports)

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logout } = useAuth();

  const isActive = (path) => location.pathname === path;

  const getInitials = (email) => {
    return email ? email.charAt(0).toUpperCase() : 'U';
  };

  const handleLogout = async () => {
    try {
      logout();
      console.log('Pengguna berhasil keluar');
      navigate('/login');
    } catch (error) {
      console.error('Error saat keluar:', error);
    }
  };

  return (
    <div className="sidebar">
      {/* Sidebar Header */}
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <img src={Logo} alt="Logo" />
          <div>
            <h1 className="sidebar-title">Admin Panel</h1>
            <p className="sidebar-subtitle">SMA Negeri 1 Banjarangkan</p>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="sidebar-nav">
        <div className="nav-section">
          <h3 className="nav-section-title">Menu Utama</h3>
          <ul className="nav-list">
            <li>
              <Link 
                to="/" 
                className={`nav-item ${isActive('/') ? 'active' : ''}`}
              >
                <HomeIcon className="nav-item-icon" />
                <span className="nav-item-text">Beranda</span>
              </Link>
            </li>
            <li>
              <Link 
                to="/agenda" 
                className={`nav-item ${isActive('/agenda') ? 'active' : ''}`}
              >
                <CalendarIcon className="nav-item-icon" />
                <span className="nav-item-text">Agenda</span>
              </Link>
            </li>
            <li>
              <Link 
                to="/galeri" 
                className={`nav-item ${isActive('/galeri') ? 'active' : ''}`}
              >
                <PhotoIcon className="nav-item-icon" />
                <span className="nav-item-text">Galeri</span>
              </Link>
            </li>
            <li>
              <Link 
                to="/prestasi" 
                className={`nav-item ${isActive('/prestasi') ? 'active' : ''}`}
              >
                <TrophyIcon className="nav-item-icon" />
                <span className="nav-item-text">Prestasi</span>
              </Link>
            </li>
            <li>
              <Link 
                to="/carousel" 
                className={`nav-item ${isActive('/carousel') ? 'active' : ''}`}
              >
                <ViewfinderCircleIcon className="nav-item-icon" />
                <span className="nav-item-text">Foto Carousel</span>
              </Link>
            </li>
          </ul>
        </div>
      </nav>
      
      {/* User Section */}
      <div className="sidebar-user">
        {currentUser && currentUser.email && (
          <div className="user-info">
            <div className="user-avatar">
              {getInitials(currentUser.email)}
            </div>
            <div className="user-details">
              <p className="user-name">Admin</p>
              <p className="user-email">{currentUser.email}</p>
            </div>
          </div>
        )}
        <button className="logout-btn" onClick={handleLogout}>
          <ArrowRightOnRectangleIcon className="nav-item-icon" />
          <span>Keluar</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
