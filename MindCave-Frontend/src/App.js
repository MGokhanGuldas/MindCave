import React from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import './App.css';

// Bileşenler
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Login from './components/Login';
import Register from './components/Register';
import NoteList from './components/NoteList';
import NoteDetail from './components/NoteDetail';
import NoteEditor from './components/NoteEditor';
import WorkspaceList from './components/WorkspaceList';
import WorkspaceDetail from './components/WorkspaceDetail';
import WorkspaceEditor from './components/WorkspaceEditor';

// Context Providers
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { WorkspaceProvider } from './contexts/WorkspaceContext';
import { NoteProvider } from './contexts/NoteContext';

// Ana sayfa bileşeni
const HomePage = () => {
  return (
    <div className="container text-center my-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card p-5 shadow-sm">
            <h1 className="display-4 mb-4">MindCave'e Hoş Geldiniz</h1>
            <p className="lead mb-4">
              Notlarınızı ve çalışma alanlarınızı sol menüden yönetebilirsiniz.
            </p>
            <div className="alert alert-info">
              <i className="bi bi-info-circle me-2"></i>
              Solda bulunan menüden notlarınıza erişebilirsiniz.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Giriş yapılmış kullanıcılar için özel route
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Yükleniyor...</span>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

// Public routes - giriş yapmamış kullanıcılar için
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Yükleniyor...</span>
        </div>
      </div>
    );
  }
  
  if (isAuthenticated) {
    return <Navigate to="/" />;
  }
  
  return children;
};

const AppContent = () => {
  const { currentUser, logout, loading } = useAuth();
  const navigate = useNavigate();
  
  // Çıkış işlemi
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Yükleniyor...</span>
        </div>
      </div>
    );
  }
  
  return (
    <div className="app-container">
      {currentUser && <Sidebar />}
      
      <div className="main-content">
        <Header 
          isLoggedIn={!!currentUser} 
          user={currentUser} 
          onLogout={handleLogout} 
        />
        
        <div className="content-area">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } />
            <Route path="/register" element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            } />
            
            {/* Private Routes */}
            <Route path="/" element={
              <PrivateRoute>
                <HomePage />
              </PrivateRoute>
            } />
            <Route path="/notes" element={
              <PrivateRoute>
                <NoteList />
              </PrivateRoute>
            } />
            <Route path="/notes/:id" element={
              <PrivateRoute>
                <NoteDetail />
              </PrivateRoute>
            } />
            <Route path="/notes/new" element={
              <PrivateRoute>
                <NoteEditor />
              </PrivateRoute>
            } />
            <Route path="/notes/edit/:id" element={
              <PrivateRoute>
                <NoteEditor />
              </PrivateRoute>
            } />
            <Route path="/workspaces" element={
              <PrivateRoute>
                <WorkspaceList />
              </PrivateRoute>
            } />
            <Route path="/workspaces/:id" element={
              <PrivateRoute>
                <WorkspaceDetail />
              </PrivateRoute>
            } />
            <Route path="/workspaces/new" element={
              <PrivateRoute>
                <WorkspaceEditor />
              </PrivateRoute>
            } />
            <Route path="/workspaces/edit/:id" element={
              <PrivateRoute>
                <WorkspaceEditor />
              </PrivateRoute>
            } />
            
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <WorkspaceProvider>
        <NoteProvider>
          <AppContent />
        </NoteProvider>
      </WorkspaceProvider>
    </AuthProvider>
  );
}

export default App; 