import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNote } from '../contexts/NoteContext';

const NoteList = () => {
  const { notes, loading, error, fetchNotes, deleteNote } = useNote();
  
  // fetchNotes fonksiyonunu çağıran useEffect
  useEffect(() => {
    // Bileşen mount olduğunda notları yükle
    fetchNotes();
    // fetchNotes bağımlılığını ekliyoruz, ancak artık useCallback ile memoize edildiği için
    // sonsuz döngü oluşmayacak
  }, [fetchNotes]);
  
  // Not silme işlemi
  const handleDeleteNote = async (id) => {
    if (window.confirm('Bu notu silmek istediğinize emin misiniz?')) {
      const result = await deleteNote(id);
      
      if (!result.success) {
        alert(result.error || 'Not silinirken bir hata oluştu');
      }
    }
  };
  
  // Yükleniyor durumu
  if (loading) {
    return (
      <div className="d-flex justify-content-center my-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Yükleniyor...</span>
        </div>
      </div>
    );
  }
  
  // Hata durumu
  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        {error}
      </div>
    );
  }
  
  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Notlarım</h2>
        <Link to="/notes/new" className="btn btn-primary">
          <i className="bi bi-plus-lg"></i> Yeni Not
        </Link>
      </div>
      
      {notes.length === 0 ? (
        <div className="alert alert-info" role="alert">
          Henüz hiç notunuz yok. "Yeni Not" butonuna tıklayarak ilk notunuzu oluşturabilirsiniz.
        </div>
      ) : (
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
          {notes.map(note => (
            <div className="col" key={note.id}>
              <div className="card h-100">
                <div className="card-header d-flex justify-content-between align-items-center">
                  {note.workspace ? (
                    <span className="badge" style={{ backgroundColor: note.workspace.color || '#3498db' }}>
                      {note.workspace.name}
                    </span>
                  ) : (
                    <span></span>
                  )}
                  <small className="text-muted">
                    {new Date(note.updatedAt).toLocaleDateString('tr-TR')}
                  </small>
                </div>
                <div className="card-body">
                  <h5 className="card-title">{note.title}</h5>
                  <p className="card-text">
                    {note.content && note.content.length > 100 
                      ? note.content.substring(0, 100) + '...' 
                      : note.content || ''}
                  </p>
                </div>
                <div className="card-footer bg-transparent">
                  <div className="d-flex justify-content-between">
                    <Link to={`/notes/${note.id}`} className="btn btn-sm btn-outline-primary">
                      <i className="bi bi-eye"></i> Görüntüle
                    </Link>
                    <div>
                      <Link to={`/notes/edit/${note.id}`} className="btn btn-sm btn-outline-secondary me-1">
                        <i className="bi bi-pencil"></i> Düzenle
                      </Link>
                      <button 
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDeleteNote(note.id)}
                      >
                        <i className="bi bi-trash"></i> Sil
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NoteList; 