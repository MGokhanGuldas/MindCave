import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import ApiService from '../services/ApiService';

// Tarih formatlama fonksiyonu
const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleDateString('tr-TR', options);
};

const WorkspaceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [workspace, setWorkspace] = useState(null);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Çalışma alanı bilgilerini al
        const wsResponse = await ApiService.workspaces.getById(id);
        setWorkspace(wsResponse.data);
        
        try {
          // Bu çalışma alanına ait notları al
          const notesResponse = await ApiService.notes.getByWorkspaceId(id);
          setNotes(notesResponse.data || []);
        } catch (noteError) {
          console.error('Notlar yüklenirken hata oluştu:', noteError);
          setNotes([]);
        }
        
        setError(null);
      } catch (err) {
        console.error('Veriler yüklenirken hata oluştu:', err);
        setError('Veriler yüklenirken bir hata oluştu. Lütfen tekrar deneyin.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleEdit = () => {
    navigate(`/workspaces/edit/${id}`);
  };

  const handleDelete = async () => {
    try {
      await ApiService.workspaces.delete(id);
      navigate('/workspaces');
    } catch (err) {
      console.error('Çalışma alanı silinirken hata oluştu:', err);
      setError('Çalışma alanı silinirken bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  const handleCreateNote = () => {
    navigate('/notes/new', { state: { workspaceId: id } });
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

  if (!workspace) {
    return (
      <div className="alert alert-warning" role="alert">
        Çalışma alanı bulunamadı.
      </div>
    );
  }

  return (
    <div className="container">
      <div className="mb-4">
        <Link to="/workspaces" className="btn btn-sm btn-outline-secondary">
          <i className="bi bi-arrow-left"></i> Çalışma Alanlarına Dön
        </Link>
      </div>

      <div className="row">
        <div className="col-md-8">
          <div className="card mb-4">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h2 className="mb-0">{workspace.name}</h2>
              <div>
                <button 
                  className="btn btn-outline-primary me-2" 
                  onClick={handleEdit}
                >
                  <i className="bi bi-pencil"></i> Düzenle
                </button>
                <button 
                  className="btn btn-outline-danger" 
                  onClick={() => setShowDeleteModal(true)}
                >
                  <i className="bi bi-trash"></i> Sil
                </button>
              </div>
            </div>
            <div className="card-body">
              <div className="mb-4 text-muted">
                <small>Son Güncelleme: {formatDate(workspace.updatedAt)}</small>
              </div>
              <div className="workspace-description mb-4">
                {workspace.description ? (
                  workspace.description.split('\n').map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))
                ) : (
                  <p className="text-muted">Açıklama yok</p>
                )}
              </div>
            </div>
          </div>

          <div className="workspace-notes mt-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h3>Notlar</h3>
              <button 
                className="btn btn-primary" 
                onClick={handleCreateNote}
              >
                <i className="bi bi-plus-lg"></i> Yeni Not Ekle
              </button>
            </div>

            {notes.length === 0 ? (
              <div className="text-center my-5">
                <p className="text-muted">Bu çalışma alanında henüz not bulunmuyor.</p>
                <button 
                  className="btn btn-outline-primary mt-3"
                  onClick={handleCreateNote}
                >
                  İlk Notu Oluşturun
                </button>
              </div>
            ) : (
              <div className="row">
                {notes.map(note => (
                  <div className="col-md-6 mb-4" key={note.id}>
                    <div 
                      className="card h-100" 
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="card-body">
                        <h5 className="card-title">{note.title}</h5>
                        <p className="card-text text-muted small">
                          {formatDate(note.updatedAt)}
                        </p>
                        <p className="card-text">
                          {note.content && note.content.length > 100
                            ? `${note.content.substring(0, 100)}...`
                            : note.content || 'İçerik yok'}
                        </p>
                      </div>
                      <div className="card-footer bg-transparent">
                        <Link 
                          to={`/notes/${note.id}`}
                          className="btn btn-sm btn-outline-primary"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Görüntüle
                        </Link>
                        <Link 
                          to={`/notes/edit/${note.id}`}
                          className="btn btn-sm btn-outline-secondary ms-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Düzenle
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="col-md-4">
          <div className="card">
            <div className="card-header">
              <h4 className="mb-0">Bilgiler</h4>
            </div>
            <div className="card-body">
              <p>
                <strong>Oluşturulma Tarihi:</strong><br />
                {formatDate(workspace.createdAt)}
              </p>
              <p>
                <strong>Son Güncelleme:</strong><br />
                {formatDate(workspace.updatedAt)}
              </p>
              <p>
                <strong>Not Sayısı:</strong><br />
                {workspace.noteCount || notes.length}
              </p>
              <div 
                className="color-badge mt-3" 
                style={{ 
                  backgroundColor: workspace.color || '#3498db',
                  width: '100%',
                  height: '30px',
                  borderRadius: '4px'
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Silme Onay Modalı */}
      {showDeleteModal && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Çalışma Alanını Sil</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowDeleteModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p>
                  <strong>{workspace.name}</strong> çalışma alanını silmek istediğinizden emin misiniz?
                </p>
                <p className="text-danger">
                  Bu işlem geri alınamaz ve bu çalışma alanındaki tüm notlar da silinecektir.
                </p>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowDeleteModal(false)}
                >
                  İptal
                </button>
                <button 
                  type="button" 
                  className="btn btn-danger" 
                  onClick={handleDelete}
                >
                  Sil
                </button>
              </div>
            </div>
          </div>
          <div className="modal-backdrop show"></div>
        </div>
      )}
    </div>
  );
};

export default WorkspaceDetail; 