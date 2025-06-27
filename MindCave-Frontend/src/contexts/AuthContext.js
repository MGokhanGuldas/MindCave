import React, { createContext, useState, useEffect, useContext } from 'react';
import AuthService from '../services/AuthService';
import ApiService from '../services/ApiService';

// Auth Context oluştur
const AuthContext = createContext(null);

// Auth Provider bileşeni
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Kullanıcı oturum durumunu kontrol et
  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);
      const user = AuthService.getCurrentUser();
      
      if (user) {
        try {
          // API'den güncel kullanıcı bilgilerini al
          const refreshedUser = await AuthService.refreshUserData();
          if (refreshedUser) {
            setCurrentUser(refreshedUser);
          } else {
            // Token geçerli değilse veya kullanıcı bilgileri alınamazsa çıkış yap
            logout();
          }
        } catch (error) {
          console.error("Kullanıcı bilgileri yüklenirken hata:", error);
          logout();
        }
      } else {
        setCurrentUser(null);
      }
      
      setLoading(false);
    };
    
    checkAuth();
  }, []);
  
  // Giriş işlemi
  const login = (userData) => {
    AuthService.setCurrentUser(userData);
    setCurrentUser(userData.user);
  };
  
  // Çıkış işlemi
  const logout = () => {
    AuthService.logout();
    setCurrentUser(null);
  };
  
  // Register işlemi
  const register = async (username, email, password) => {
    try {
      const response = await ApiService.users.register({ username, email, password });
      AuthService.setCurrentUser(response.data);
      setCurrentUser(response.data.user);
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Kayıt olurken hata:", error);
      return { 
        success: false, 
        error: error.response?.data?.message || "Kayıt işlemi sırasında bir hata oluştu" 
      };
    }
  };
  
  // Context değerlerini döndür
  const value = {
    currentUser,
    loading,
    login,
    logout,
    register,
    isAuthenticated: !!currentUser
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within a AuthProvider');
  }
  return context;
};

export default AuthContext; 