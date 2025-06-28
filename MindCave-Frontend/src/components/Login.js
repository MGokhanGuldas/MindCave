import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ApiService from '../services/ApiService';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!username || !password) {
      setError('Lütfen tüm alanları doldurun');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const response = await ApiService.users.login({ username, password });
      
      // Context üzerinden giriş yap
      login(response.data);
      
      // Ana sayfaya yönlendir
      navigate('/');
    } catch (error) {
      console.error('Giriş hatası:', error);
      setError(error.response?.data?.message || 'Giriş yapılırken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="auth-form-container">
      <div className="auth-form">
        <h3 className="mb-4 text-center text-light">Giriş Yap</h3>
        
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="username" className="form-label text-light">Kullanıcı Adı</label>
            <input 
              type="text" 
              className="form-control bg-dark text-light border-secondary" 
              id="username" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          
          <div className="mb-3">
            <label htmlFor="password" className="form-label text-light">Şifre</label>
            <input 
              type="password" 
              className="form-control bg-dark text-light border-secondary" 
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          
          <div className="d-grid gap-2">
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
            </button>
          </div>
          
          <p className="mt-3 text-center text-light">
            Hesabınız yok mu? <Link to="/register" className="text-info">Kayıt ol</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login; 