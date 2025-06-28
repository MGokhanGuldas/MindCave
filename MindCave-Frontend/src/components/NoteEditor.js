import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useNote } from '../contexts/NoteContext';
import { useWorkspace } from '../contexts/WorkspaceContext';

const NoteEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  // Note ve Workspace context'lerini kullan
  const { fetchNoteById, currentNote, createNote, updateNote, loading: noteLoading, error: noteError } = useNote();
  const { workspaces, fetchWorkspaces, loading: workspacesLoading } = useWorkspace();
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [workspaceId, setWorkspaceId] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Çalışma alanlarını yükle
  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  // Düzenleme modunda ise notu yükle
  useEffect(() => {
    if (isEditMode) {
      fetchNoteById(id);
    }
  }, [id, isEditMode, fetchNoteById]);
  
  // Not yüklendiğinde form alanlarını doldur
  useEffect(() => {
    if (isEditMode && currentNote) {
      setTitle(currentNote.title || '');
      setContent(currentNote.content || '');
      setWorkspaceId(currentNote.workspaceId || '');
    }
  }, [isEditMode, currentNote]);
  
  // API hatalarını takip et
  useEffect(() => {
    if (noteError) {
      setError(noteError);
    }
  }, [noteError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title) {
      setError('Not başlığı boş olamaz');
      return;
    }
    
    setSaving(true);
    setError(null);
    
    try {
      const noteData = {
        title,
        content,
        workspaceId: workspaceId || null
      };
      
      let result;
      
      if (isEditMode) {
        result = await updateNote(id, noteData);
      } else {
        result = await createNote(noteData);
      }
      
      if (result.success) {
        navigate('/notes');
      } else {
        setError(result.error || 'Not kaydedilirken bir hata oluştu');
      }
    } catch (err) {
      console.error('Not kaydedilirken beklenmeyen hata oluştu:', err);
      setError('Not kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setSaving(false);
    }
  };

  const loading = noteLoading || workspacesLoading;

  if (loading && isEditMode) {
    return (
      <div className="d-flex justify-content-center my-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Yükleniyor...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container note-editor">
      <div className="mb-4">
        <Link to="/notes" className="btn btn-sm btn-outline-secondary">
          <i className="bi bi-arrow-left"></i> Notlara Dön
        </Link>
      </div>
      
      <h2 className="mb-4">{isEditMode ? 'Notu Düzenle' : 'Yeni Not'}</h2>
      
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <input 
            type="text" 
            className="form-control form-control-lg border-0 fw-bold" 
            id="note-title" 
            placeholder="Başlık" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        
        <div className="mb-3">
          <textarea 
            className="form-control border-0" 
            id="note-content" 
            rows="15" 
            placeholder="İçerik yazın..." 
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>
        
        <div className="d-flex justify-content-between">
          <div>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={saving || loading}
            >
              {saving ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
            <Link to="/notes" className="btn btn-outline-secondary ms-2">
              İptal
            </Link>
          </div>
          
          <div id="note-workspace-selector">
            <select 
              className="form-select" 
              id="workspace-select"
              value={workspaceId}
              onChange={(e) => setWorkspaceId(e.target.value)}
              disabled={workspacesLoading}
            >
              <option value="">Çalışma Alanı Seçin</option>
              {workspaces.map(workspace => (
                <option key={workspace.id} value={workspace.id}>
                  {workspace.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </form>
    </div>
  );
};

export default NoteEditor; 