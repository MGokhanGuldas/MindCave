import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import ApiService from '../services/ApiService';
import { useAuth } from './AuthContext';

// Workspace Context oluştur
const WorkspaceContext = createContext(null);

// Workspace Provider bileşeni
export const WorkspaceProvider = ({ children }) => {
  const [workspaces, setWorkspaces] = useState([]);
  const [currentWorkspace, setCurrentWorkspace] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const { isAuthenticated } = useAuth();
  
  // Tüm çalışma alanlarını getir - useCallback ile memoize ediyoruz
  const fetchWorkspaces = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await ApiService.workspaces.getAll();
      setWorkspaces(response.data);
    } catch (err) {
      console.error('Çalışma alanları yüklenirken hata oluştu:', err);
      setError('Çalışma alanları yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);
  
  // Çalışma alanlarını yükle
  useEffect(() => {
    if (isAuthenticated) {
      fetchWorkspaces();
    } else {
      setWorkspaces([]);
    }
  }, [isAuthenticated, fetchWorkspaces]);
  
  // Belirli bir çalışma alanını getir - useCallback ile memoize ediyoruz
  const fetchWorkspaceById = useCallback(async (id) => {
    if (!isAuthenticated || !id) return null;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await ApiService.workspaces.getById(id);
      setCurrentWorkspace(response.data);
      return response.data;
    } catch (err) {
      console.error('Çalışma alanı yüklenirken hata oluştu:', err);
      setError('Çalışma alanı yüklenirken bir hata oluştu');
      return null;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);
  
  // Yeni çalışma alanı oluştur - useCallback ile memoize ediyoruz
  const createWorkspace = useCallback(async (workspaceData) => {
    if (!isAuthenticated) return { success: false, error: 'Kimlik doğrulama gerekli' };
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await ApiService.workspaces.create(workspaceData);
      setWorkspaces(prevWorkspaces => [...prevWorkspaces, response.data]);
      return { success: true, data: response.data };
    } catch (err) {
      console.error('Çalışma alanı oluşturulurken hata oluştu:', err);
      setError('Çalışma alanı oluşturulurken bir hata oluştu');
      return { 
        success: false, 
        error: err.response?.data?.message || 'Çalışma alanı oluşturulurken bir hata oluştu' 
      };
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);
  
  // Çalışma alanını güncelle - useCallback ile memoize ediyoruz
  const updateWorkspace = useCallback(async (id, workspaceData) => {
    if (!isAuthenticated || !id) return { success: false, error: 'Kimlik doğrulama gerekli veya geçersiz çalışma alanı ID' };
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await ApiService.workspaces.update(id, workspaceData);
      
      // State'i güncelle
      setWorkspaces(prevWorkspaces => prevWorkspaces.map(workspace => 
        workspace.id === id ? response.data : workspace
      ));
      
      setCurrentWorkspace(prevWorkspace => prevWorkspace?.id === id ? response.data : prevWorkspace);
      
      return { success: true, data: response.data };
    } catch (err) {
      console.error('Çalışma alanı güncellenirken hata oluştu:', err);
      setError('Çalışma alanı güncellenirken bir hata oluştu');
      return { 
        success: false, 
        error: err.response?.data?.message || 'Çalışma alanı güncellenirken bir hata oluştu' 
      };
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);
  
  // Çalışma alanını sil - useCallback ile memoize ediyoruz
  const deleteWorkspace = useCallback(async (id) => {
    if (!isAuthenticated || !id) return { success: false, error: 'Kimlik doğrulama gerekli veya geçersiz çalışma alanı ID' };
    
    try {
      setLoading(true);
      setError(null);
      
      await ApiService.workspaces.delete(id);
      
      // State'i güncelle
      setWorkspaces(prevWorkspaces => prevWorkspaces.filter(workspace => workspace.id !== id));
      
      setCurrentWorkspace(prevWorkspace => prevWorkspace?.id === id ? null : prevWorkspace);
      
      return { success: true };
    } catch (err) {
      console.error('Çalışma alanı silinirken hata oluştu:', err);
      setError('Çalışma alanı silinirken bir hata oluştu');
      return { 
        success: false, 
        error: err.response?.data?.message || 'Çalışma alanı silinirken bir hata oluştu' 
      };
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);
  
  // Çalışma alanına ait notları getir - useCallback ile memoize ediyoruz
  const fetchWorkspaceNotes = useCallback(async (id) => {
    if (!isAuthenticated || !id) return [];
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await ApiService.workspaces.getById(id);
      const notesResponse = await ApiService.notes.getByWorkspaceId(id);
      
      setCurrentWorkspace({
        ...response.data,
        notes: notesResponse.data
      });
      
      return notesResponse.data;
    } catch (err) {
      console.error('Çalışma alanı notları yüklenirken hata oluştu:', err);
      setError('Çalışma alanı notları yüklenirken bir hata oluştu');
      return [];
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);
  
  // Context değerlerini döndür
  const value = {
    workspaces,
    currentWorkspace,
    loading,
    error,
    fetchWorkspaces,
    fetchWorkspaceById,
    createWorkspace,
    updateWorkspace,
    deleteWorkspace,
    fetchWorkspaceNotes
  };
  
  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
};

// Custom hook
export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (context === null) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};

export default WorkspaceContext; 