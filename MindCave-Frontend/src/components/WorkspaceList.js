import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useWorkspace } from '../contexts/WorkspaceContext';

const WorkspaceList = () => {
  const { workspaces, loading, error, fetchWorkspaces } = useWorkspace();
  const navigate = useNavigate();

  // Bileşen mount olduğunda çalışma alanlarını yükle
  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  const handleCreateWorkspace = () => {
    navigate('/workspaces/new');
  };

  const handleWorkspaceClick = (id) => {
    navigate(`/workspaces/${id}`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('tr-TR', options);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center my-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Yükleniyor...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        {error}
      </div>
    );
  }

  return (
    <div className="container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Çalışma Alanları</h2>
        <button 
          className="btn btn-primary" 
          onClick={handleCreateWorkspace}
        >
          <i className="bi bi-plus-lg"></i> Yeni Çalışma Alanı
        </button>
      </div>

      {workspaces.length === 0 ? (
        <div className="text-center my-5">
          <p className="text-muted">Henüz çalışma alanı oluşturmadınız.</p>
          <button 
            className="btn btn-outline-primary mt-3"
            onClick={handleCreateWorkspace}
          >
            İlk Çalışma Alanınızı Oluşturun
          </button>
        </div>
      ) : (
        <div className="row">
          {workspaces.map(workspace => (
            <div className="col-md-6 col-lg-4 mb-4" key={workspace.id}>
              <div 
                className="card h-100 workspace-card" 
                onClick={() => handleWorkspaceClick(workspace.id)}
                style={{ cursor: 'pointer' }}
              >
                <div className="card-body">
                  <h5 className="card-title">{workspace.name}</h5>
                  <p className="card-text text-muted small">
                    {formatDate(workspace.updatedAt)}
                  </p>
                  <p className="card-text">
                    {workspace.description && workspace.description.length > 100
                      ? `${workspace.description.substring(0, 100)}...`
                      : workspace.description || 'Açıklama yok'}
                  </p>
                  <p className="card-text text-muted">
                    <small>{workspace.notes?.length || 0} not</small>
                  </p>
                </div>
                <div className="card-footer bg-transparent">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/workspaces/${workspace.id}`);
                    }}
                    className="btn btn-sm btn-outline-primary"
                  >
                    Görüntüle
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/workspaces/edit/${workspace.id}`);
                    }}
                    className="btn btn-sm btn-outline-secondary ms-2"
                  >
                    Düzenle
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WorkspaceList; 