import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import ApiService from '../services/ApiService';
import { useAuth } from './AuthContext';

// Note Context oluştur
const NoteContext = createContext(null);

// Note Provider bileşeni
export const NoteProvider = ({ children }) => {
  const [notes, setNotes] = useState([]);
  const [currentNote, setCurrentNote] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const { isAuthenticated } = useAuth();
  
  // Tüm notları getir - useCallback ile memoize ediyoruz
  const fetchNotes = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await ApiService.notes.getAll();
      setNotes(response.data);
    } catch (err) {
      console.error('Notlar yüklenirken hata oluştu:', err);
      setError('Notlar yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);
  
  // Notları yükle
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotes();
    } else {
      setNotes([]);
    }
  }, [isAuthenticated, fetchNotes]);
  
  // Belirli bir notu getir - useCallback ile memoize ediyoruz
  const fetchNoteById = useCallback(async (id) => {
    if (!isAuthenticated || !id) return null;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await ApiService.notes.getById(id);
      setCurrentNote(response.data);
      return response.data;
    } catch (err) {
      console.error('Not yüklenirken hata oluştu:', err);
      setError('Not yüklenirken bir hata oluştu');
      return null;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);
  
  // Yeni not oluştur - useCallback ile memoize ediyoruz
  const createNote = useCallback(async (noteData) => {
    if (!isAuthenticated) return { success: false, error: 'Kimlik doğrulama gerekli' };
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await ApiService.notes.create(noteData);
      setNotes(prevNotes => [...prevNotes, response.data]);
      return { success: true, data: response.data };
    } catch (err) {
      console.error('Not oluşturulurken hata oluştu:', err);
      setError('Not oluşturulurken bir hata oluştu');
      return { 
        success: false, 
        error: err.response?.data?.message || 'Not oluşturulurken bir hata oluştu' 
      };
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);
  
  // Notu güncelle - useCallback ile memoize ediyoruz
  const updateNote = useCallback(async (id, noteData) => {
    if (!isAuthenticated || !id) return { success: false, error: 'Kimlik doğrulama gerekli veya geçersiz not ID' };
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await ApiService.notes.update(id, noteData);
      
      // State'i güncelle
      setNotes(prevNotes => prevNotes.map(note => 
        note.id === id ? response.data : note
      ));
      
      setCurrentNote(prevNote => prevNote?.id === id ? response.data : prevNote);
      
      return { success: true, data: response.data };
    } catch (err) {
      console.error('Not güncellenirken hata oluştu:', err);
      setError('Not güncellenirken bir hata oluştu');
      return { 
        success: false, 
        error: err.response?.data?.message || 'Not güncellenirken bir hata oluştu' 
      };
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);
  
  // Notu sil - useCallback ile memoize ediyoruz
  const deleteNote = useCallback(async (id) => {
    if (!isAuthenticated || !id) return { success: false, error: 'Kimlik doğrulama gerekli veya geçersiz not ID' };
    
    try {
      setLoading(true);
      setError(null);
      
      await ApiService.notes.delete(id);
      
      // State'i güncelle
      setNotes(prevNotes => prevNotes.filter(note => note.id !== id));
      
      setCurrentNote(prevNote => prevNote?.id === id ? null : prevNote);
      
      return { success: true };
    } catch (err) {
      console.error('Not silinirken hata oluştu:', err);
      setError('Not silinirken bir hata oluştu');
      return { 
        success: false, 
        error: err.response?.data?.message || 'Not silinirken bir hata oluştu' 
      };
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);
  
  // Context değerlerini döndür
  const value = {
    notes,
    currentNote,
    loading,
    error,
    fetchNotes,
    fetchNoteById,
    createNote,
    updateNote,
    deleteNote
  };
  
  return (
    <NoteContext.Provider value={value}>
      {children}
    </NoteContext.Provider>
  );
};

// Custom hook
export const useNote = () => {
  const context = useContext(NoteContext);
  if (context === null) {
    throw new Error('useNote must be used within a NoteProvider');
  }
  return context;
};

export default NoteContext; 