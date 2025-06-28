import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import ApiService from '../services/ApiService';
import AuthService from '../services/AuthService';

const Sidebar = () => {
  const [workspaces, setWorkspaces] = useState([]);
  const [recentNotes, setRecentNotes] = useState([]);
  const [isLoadingWorkspaces, setIsLoadingWorkspaces] = useState(false);
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Mevcut çalışma alanı ID'sini al
  const currentWorkspaceId = location.pathname.includes('/workspaces/') 
    ? location.pathname.split('/workspaces/')[1].split('/')[0]
    : null;
  
  // Çalışma alanlarını yükle
  const loadWorkspaces = useCallback(async () => {
    setIsLoadingWorkspaces(true);
    setError(null);
    try {
      // Token kontrolü
      const token = AuthService.getToken();
      if (!token) {
        console.error('Token bulunamadı');
        setError('Oturum süresi dolmuş olabilir. Lütfen yeniden giriş yapın.');
        setTimeout(() => {
          AuthService.logout();
          window.location.href = '/login';
        }, 3000);
        return;
      }
      
      console.log('Çalışma alanları yükleniyor...');
      const response = await ApiService.workspaces.getAll();
      console.log('Çalışma alanları:', response.data);
      setWorkspaces(response.data);
      setRetryCount(0); // Başarılı olursa retry sayısını sıfırla
    } catch (error) {
      console.error('Çalışma alanları yüklenirken hata oluştu:', error);
      
      if (error.response) {
        // Sunucu yanıtı ile dönen hata
        console.error('Hata durumu:', error.response.status);
        console.error('Hata verileri:', error.response.data);
        
        if (error.response.status === 401) {
          setError('Oturum süresi dolmuş. Lütfen yeniden giriş yapın.');
          setTimeout(() => {
            AuthService.logout();
            window.location.href = '/login';
          }, 3000);
          return;
        }
      }
      
      setError('Çalışma alanları yüklenemedi.');
      setWorkspaces([]);
      
      // Hata durumunda 3 kez yeniden deneme yap
      if (retryCount < 3) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          loadWorkspaces();
        }, 2000); // 2 saniye bekle
      }
    } finally {
      setIsLoadingWorkspaces(false);
    }
  }, [retryCount]);
  
  // Son notları yükle
  const loadRecentNotes = useCallback(async () => {
    setIsLoadingNotes(true);
    try {
      console.log('Notlar yükleniyor...');
      const response = await ApiService.notes.getAll();
      console.log('Notlar:', response.data);
      // Son 5 notu al
      const sortedNotes = response.data
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        .slice(0, 5);
      setRecentNotes(sortedNotes);
    } catch (error) {
      console.error('Notlar yüklenirken hata oluştu:', error);
      setRecentNotes([]);
    } finally {
      setIsLoadingNotes(false);
    }
  }, []);
  
  // Sayfa ilk yüklendiğinde verileri yükle
  useEffect(() => {
    loadWorkspaces();
    loadRecentNotes();
  }, [loadWorkspaces, loadRecentNotes]);
  
  // URL değiştiğinde verileri yeniden yükle
  useEffect(() => {
    // Workspace ile ilgili bir işlem yapıldığında çalışma alanlarını güncelle
    if (location.pathname.includes('/workspaces')) {
      loadWorkspaces();
    }
    
    // Note ile ilgili bir işlem yapıldığında notları güncelle
    if (location.pathname.includes('/notes')) {
      loadRecentNotes();
    }
  }, [location.pathname, loadWorkspaces, loadRecentNotes]);
  
  // Yeniden yükleme işlemi
  const handleRetry = () => {
    loadWorkspaces();
    loadRecentNotes();
  };
  
  const handleNewNote = () => {
    navigate('/notes/new');
  };
  
  const handleNewWorkspace = () => {
    navigate('/workspaces/new');
  };
  
  const goToWorkspaces = () => {
    navigate('/workspaces');
  };
  
  const goToNotes = () => {
    navigate('/notes');
  };
  
  return (
    <div className="sidebar" id="sidebar">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <Link to="/" className="text-decoration-none text-light">
          <h3 className="fw-bold">MindCave</h3>
        </Link>
        <button 
          className="btn btn-link text-light d-md-none" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#sidebar"
        >
          <i className="bi bi-x-lg"></i>
        </button>
      </div>
      
      {error && (
        <div className="alert alert-danger alert-sm mb-3">
          <small>{error}</small>
          <button 
            className="btn btn-sm btn-link text-danger p-0 ms-2" 
            onClick={handleRetry}
          >
            Yeniden Dene
          </button>
        </div>
      )}
      
      <div className="mb-3">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h6 
            className="mb-0 sidebar-heading" 
            onClick={goToWorkspaces}
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          >
            <i className="bi bi-folder me-2"></i>
            <span>Çalışma Alanları</span>
          </h6>
          <button 
            id="new-workspace-btn" 
            className="btn btn-sm btn-primary"
            onClick={handleNewWorkspace}
          >
            <i className="bi bi-plus-lg"></i> Yeni
          </button>
        </div>
        <div id="workspace-list" className="list-group">
          {isLoadingWorkspaces ? (
            <div className="text-center py-3">
              <div className="spinner-border spinner-border-sm text-primary" role="status">
                <span className="visually-hidden">Yükleniyor...</span>
              </div>
            </div>
          ) : workspaces && workspaces.length > 0 ? (
            workspaces.map(workspace => (
              <Link 
                key={workspace.id} 
                to={`/workspaces/${workspace.id}`}
                className={`list-group-item list-group-item-action ${
                  currentWorkspaceId === workspace.id.toString() ? 'active' : ''
                }`}
              >
                {workspace.name}
              </Link>
            ))
          ) : (
            <div className="text-muted small">Henüz çalışma alanı yok</div>
          )}
        </div>
      </div>
      
      <div>
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h6 
            className="mb-0 sidebar-heading" 
            onClick={goToNotes}
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          >
            <i className="bi bi-journal-text me-2"></i>
            <span>Son Notlar</span>
          </h6>
          <button 
            id="new-note-btn" 
            className="btn btn-sm btn-primary"
            onClick={handleNewNote}
          >
            <i className="bi bi-plus-lg"></i> Yeni
          </button>
        </div>
        <div id="recent-notes" className="list-group">
          {isLoadingNotes ? (
            <div className="text-center py-3">
              <div className="spinner-border spinner-border-sm text-primary" role="status">
                <span className="visually-hidden">Yükleniyor...</span>
              </div>
            </div>
          ) : recentNotes && recentNotes.length > 0 ? (
            recentNotes.map(note => (
              <Link 
                key={note.id} 
                to={`/notes/${note.id}`}
                className="list-group-item list-group-item-action"
              >
                {note.title}
              </Link>
            ))
          ) : (
            <div className="text-muted small">Henüz not yok</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 