import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useNote } from '../contexts/NoteContext';

const NoteDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchNoteById, currentNote, loading, error, deleteNote } = useNote();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    // Bileşen mount olduğunda notu yükle
    fetchNoteById(id);
  }, [id, fetchNoteById]);

  const handleEdit = () => {
    navigate(`/notes/edit/${id}`);
  };

  const handleDelete = async () => {
    try {
      const result = await deleteNote(id);
      if (result.success) {
        navigate('/notes');
      } else {
        console.error('Not silinirken hata oluştu:', result.error);
      }
    } catch (err) {
      console.error('Not silinirken beklenmeyen hata oluştu:', err);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
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

  if (!currentNote) {
    return (
      <div className="alert alert-warning" role="alert">
        Not bulunamadı.
      </div>
    );
  }

  return (
    <div className="container">
      <div className="mb-4">
        <Link to="/notes" className="btn btn-sm btn-outline-secondary">
          <i className="bi bi-arrow-left"></i> Notlara Dön
        </Link>
      </div>

      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h2 className="mb-0">{currentNote.title}</h2>
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
          <div className="mb-3 text-muted">
            <small>
              {currentNote.workspace ? (
                <span>
                  Çalışma Alanı: <Link to={`/workspaces/${currentNote.workspaceId}`}>{currentNote.workspace.name}</Link>
                </span>
              ) : (
                <span>Çalışma Alanı: Yok</span>
              )}
            </small>
          </div>
          <div className="mb-4 text-muted">
            <small>Son Güncelleme: {formatDate(currentNote.updatedAt)}</small>
          </div>
          <div className="note-content">
            {currentNote.content && currentNote.content.split('\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </div>
      </div>

      {/* Silme Modal */}
      {showDeleteModal && (
        <div className="modal d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Notu Sil</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowDeleteModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p>"{currentNote.title}" başlıklı notu silmek istediğinize emin misiniz?</p>
                <p className="text-danger">Bu işlem geri alınamaz.</p>
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
        </div>
      )}
    </div>
  );
};

export default NoteDetail; 