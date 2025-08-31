import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import DashboardLayout from './components/Layout/DashboardLayout';
import Login from './components/Login';
import Home from './pages/Home';
import Prestasi from './pages/Prestasi';
import Agenda from './pages/Agenda';
import Galeri from './pages/Galeri';
import Carousel from './pages/Carousel';
import Posts from './pages/Posts';
import PostView from './pages/PostView';
import PostEditor from './pages/PostEditor';
import PendingPosts from './pages/PendingPosts';
import DocumentDetail from './pages/DocumentDetail';
import './styles/design-system.css';

// App Routes Component (inside AuthProvider context)
const AppRoutes = () => {
  // Protected Route Component
  const ProtectedRoute = ({ children }) => {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? children : <Navigate to="/login" />;
  };

  // Public Route Component (redirect to dashboard if already authenticated)
  const PublicRoute = ({ children }) => {
    const { isAuthenticated } = useAuth();
    return !isAuthenticated ? children : <Navigate to="/" />;
  };

  return (
    <Router
      future={{
        v7_relativeSplatPath: true,
      }}
    >
      <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route 
              path="/login" 
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } 
            />
            
            {/* Protected Routes */}
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Home />
                  </DashboardLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/prestasi" 
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Prestasi />
                  </DashboardLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/agenda" 
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Agenda />
                  </DashboardLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/galeri" 
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Galeri />
                  </DashboardLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/carousel" 
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Carousel />
                  </DashboardLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/posts" 
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Posts />
                  </DashboardLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/create" 
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <PostEditor />
                  </DashboardLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/posts/edit/:id" 
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <PostEditor />
                  </DashboardLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/post/:id" 
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <PostView />
                  </DashboardLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/document/:slug" 
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <PostView />
                  </DashboardLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/pending-posts" 
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <PendingPosts />
                  </DashboardLayout>
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/document/:id" 
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <DocumentDetail />
                  </DashboardLayout>
                </ProtectedRoute>
              } 
            />
            
            {/* Catch all route - redirect to home */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </Router>
    );
};

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppRoutes />
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
