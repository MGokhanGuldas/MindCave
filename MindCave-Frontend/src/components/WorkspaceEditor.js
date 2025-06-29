import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import ApiService from '../services/ApiService';

const WorkspaceEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#3498db');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Düzenleme modunda ise çalışma alanını yükle
  useEffect(() => {
    if (isEditMode) {
      const fetchWorkspace = async () => {
        try {
          setLoading(true);
          const response = await ApiService.workspaces.getById(id);
          const workspace = response.data;
          
          setName(workspace.name);
          setDescription(workspace.description || '');
          setColor(workspace.color || '#3498db');
          setError(null);
        } catch (err) {
          console.error('Çalışma alanı yüklenirken hata oluştu:', err);
          setError('Çalışma alanı yüklenirken bir hata oluştu. Lütfen tekrar deneyin.');
        } finally {
          setLoading(false);
        }
      };

      fetchWorkspace();
    }
  }, [id, isEditMode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Çalışma alanı adı boş olamaz');
      return;
    }
    
    setSaving(true);
    setError(null);
    
    try {
      const workspaceData = {
        name: name.trim(),
        description: description.trim(),
        color: color
      };
      
      if (isEditMode) {
        await ApiService.workspaces.update(id, workspaceData);
      } else {
        await ApiService.workspaces.create(workspaceData);
      }
      
      navigate('/workspaces');
    } catch (err) {
      console.error('Çalışma alanı kaydedilirken hata oluştu:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Çalışma alanı kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setSaving(false);
    }
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

  return (
    <div className="container workspace-editor">
      <div className="mb-4">
        <Link to="/workspaces" className="btn btn-sm btn-outline-secondary">
          <i className="bi bi-arrow-left"></i> Çalışma Alanlarına Dön
        </Link>
      </div>
      
      <h2 className="mb-4">{isEditMode ? 'Çalışma Alanını Düzenle' : 'Yeni Çalışma Alanı'}</h2>
      
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="workspace-name" className="form-label">Çalışma Alanı Adı</label>
          <input 
            type="text" 
            className="form-control" 
            id="workspace-name" 
            placeholder="Çalışma alanı adını girin" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        
        <div className="mb-3">
          <label htmlFor="workspace-description" className="form-label">Açıklama (İsteğe Bağlı)</label>
          <textarea 
            className="form-control" 
            id="workspace-description" 
            rows="6" 
            placeholder="Çalışma alanı hakkında açıklama yazın..." 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        
        <div className="mb-3">
          <label htmlFor="workspace-color" className="form-label">Renk</label>
          <input 
            type="color" 
            className="form-control form-control-color" 
            id="workspace-color" 
            value={color}
            onChange={(e) => setColor(e.target.value)}
            title="Çalışma alanı rengi seçin"
          />
        </div>
        
        <div className="d-flex">
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={saving}
          >
            {saving ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
          <Link to="/workspaces" className="btn btn-outline-secondary ms-2">
            İptal
          </Link>
        </div>
      </form>
    </div>
  );
};

export default WorkspaceEditor; 