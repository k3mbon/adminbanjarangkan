import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import '../../styles/DashboardLayout.css';
import Logo from '../../assets/logo.png';
import {
  HomeIcon,
  DocumentTextIcon,
  ClockIcon,
  PlusIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  TrophyIcon,
  CalendarIcon,
  PhotoIcon,
  SunIcon,
  MoonIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

const DashboardLayout = ({ children }) => {
  const { currentUser, logout } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Handle responsive sidebar behavior
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      
      // On desktop, sidebar is always open and cannot be closed; on mobile, it starts closed
      if (!mobile) {
        setSidebarOpen(true);
      } else if (mobile) {
        setSidebarOpen(false);
      }
    };

    // Initial check
    handleResize();
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Handle keyboard shortcuts and navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Close sidebar with Escape key (mobile only)
      if (e.key === 'Escape' && sidebarOpen && isMobile) {
        setSidebarOpen(false);
        // Focus the mobile menu button after closing
        setTimeout(() => {
          const menuBtn = document.querySelector('.mobile-menu-btn');
          if (menuBtn) menuBtn.focus();
        }, 100);
        return;
      }
      
      // Toggle sidebar with Ctrl+B (mobile only)
      if (e.ctrlKey && e.key === 'b' && isMobile) {
        e.preventDefault();
        setSidebarOpen(!sidebarOpen);
        return;
      }
      
      // Navigation shortcuts (Alt + number)
      if (e.altKey && !e.ctrlKey && !e.shiftKey) {
        const num = parseInt(e.key);
        if (num >= 1 && num <= menuItems.length) {
          e.preventDefault();
          const targetItem = menuItems[num - 1];
          if (targetItem) {
            window.location.href = targetItem.path;
          }
        }
      }
      
      // Focus search with Ctrl+K
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        // Future: Focus search input when implemented
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [sidebarOpen, isMobile]);
  
  // Get user role display text
  const getUserRoleDisplay = () => {
    if (!currentUser?.role) return 'User';
    return currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1);
  };

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: HomeIcon, shortcut: 'Alt+1' },
    { name: 'Blog Posts', path: '/posts', icon: DocumentTextIcon, shortcut: 'Alt+2' },
    { name: 'Create Post', path: '/create', icon: PlusIcon, shortcut: 'Alt+3' },
    { name: 'Pending Posts', path: '/pending-posts', icon: ClockIcon, shortcut: 'Alt+4' },
    { name: 'Prestasi', path: '/prestasi', icon: TrophyIcon, shortcut: 'Alt+5' },
    { name: 'Agenda', path: '/agenda', icon: CalendarIcon, shortcut: 'Alt+6' },
    { name: 'Album', path: '/galeri', icon: PhotoIcon, shortcut: 'Alt+7' },
  ];

  // Generate breadcrumbs based on current path
  const getBreadcrumbs = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs = [{ name: 'Dashboard', path: '/' }];
    
    if (pathSegments.length > 0) {
      const currentItem = menuItems.find(item => item.path === location.pathname);
      if (currentItem && currentItem.path !== '/') {
        breadcrumbs.push({ name: currentItem.name, path: currentItem.path });
      }
    }
    
    return breadcrumbs;
  };

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <div className={`dashboard-layout ${sidebarOpen ? 'sidebar-open' : ''}`}>
      {/* Mobile Overlay - Only show on mobile */}
      {sidebarOpen && isMobile && (
        <div 
          className="sidebar-backdrop show"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside 
        id="sidebar-navigation"
        className={`sidebar ${sidebarOpen ? 'open' : ''}`}
        role="navigation"
        aria-label="Main navigation"
        aria-hidden={!sidebarOpen ? 'true' : 'false'}
      >
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="brand-logo">
              <img src={Logo} alt="SMAN 1 Banjarangkan Logo" className="logo-image" />
            </div>
            <h2 className="sidebar-title">SMAN 1 BANJARANGKAN</h2>
          </div>
          {isMobile && (
            <button 
              className="sidebar-close"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close navigation menu"
              type="button"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          )}
        </div>
        
        <nav className="sidebar-nav" role="menu">
          <ul className="nav-list" role="none">
            {menuItems.map((item) => (
              <li key={item.path} role="none">
                <Link
                  to={item.path}
                  className={`nav-link ${
                    isActive(item.path) ? 'active' : ''
                  }`}
                  onClick={() => isMobile && setSidebarOpen(false)}
                  role="menuitem"
                  aria-current={isActive(item.path) ? 'page' : undefined}
                  tabIndex={sidebarOpen || !isMobile ? 0 : -1}
                  title={`${item.name} (${item.shortcut})`}
                >
                  <item.icon className="nav-icon" aria-hidden="true" />
                  <span className="nav-text">{item.name}</span>
                  <span className="nav-shortcut" aria-hidden="true">{item.shortcut}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="sidebar-footer">
          <div className="user-info">
            <UserIcon className="user-avatar" aria-hidden="true" />
            <div className="user-details">
              <p className="user-name" title={getUserRoleDisplay()}>
                {getUserRoleDisplay()}
              </p>
              <p className="user-role" title={currentUser?.email || 'No email'}>
                {currentUser?.email || 'No email'}
              </p>
            </div>
          </div>
          <button 
            onClick={logout} 
            className="logout-btn"
            type="button"
            aria-label="Sign out of your account"
            tabIndex={sidebarOpen || !isMobile ? 0 : -1}
          >
            <ArrowRightOnRectangleIcon className="logout-icon" aria-hidden="true" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content" role="main">
        {/* Header */}
        <header className="dashboard-header">
          <div className="header-left">
            {/* Hamburger menu button - show on mobile only */}
            {isMobile && (
              <button 
                className="menu-btn mobile-menu-btn"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                aria-label={sidebarOpen ? 'Close navigation menu' : 'Open navigation menu'}
                aria-expanded={sidebarOpen}
                aria-controls="sidebar-navigation"
                type="button"
              >
                <Bars3Icon className="w-6 h-6" aria-hidden="true" />
              </button>
            )}
            <div className="header-title-section">
              {/* Breadcrumb Navigation */}
              <nav className="breadcrumb-nav" aria-label="Breadcrumb">
                <ol className="breadcrumb-list">
                  {getBreadcrumbs().map((crumb, index, array) => (
                    <li key={crumb.path} className="breadcrumb-item">
                      {index < array.length - 1 ? (
                        <>
                          <Link 
                            to={crumb.path} 
                            className="breadcrumb-link"
                            aria-label={`Navigate to ${crumb.name}`}
                          >
                            {crumb.name}
                          </Link>
                          <ChevronRightIcon className="breadcrumb-separator" aria-hidden="true" />
                        </>
                      ) : (
                        <span className="breadcrumb-current" aria-current="page">
                          {crumb.name}
                        </span>
                      )}
                    </li>
                  ))}
                </ol>
              </nav>
              

            </div>
          </div>
          
          {/* Header Right - Quick Actions */}
          <div className="header-right">
            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className="theme-toggle-btn"
              title={`Switch to ${isDark ? 'light' : 'dark'} mode (Ctrl+Shift+L)`}
              aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
              type="button"
            >
              {isDark ? (
                <SunIcon className="w-5 h-5" aria-hidden="true" />
              ) : (
                <MoonIcon className="w-5 h-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </header>
        
        {/* Content */}
        <div className="content-wrapper">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;