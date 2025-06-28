import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const { register } = useAuth();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Form doğrulama
    if (!username || !email || !password || !confirmPassword) {
      setError('Lütfen tüm alanları doldurun');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Şifreler eşleşmiyor');
      return;
    }
    
    // Basit e-posta doğrulaması
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Lütfen geçerli bir e-posta adresi girin');
      return;
    }
    
    // Şifre karmaşıklık kontrolü
    if (password.length < 8) {
      setError('Şifre en az 8 karakter uzunluğunda olmalıdır');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      // Context üzerinden kayıt ol
      const result = await register(username, email, password);
      
      if (result.success) {
        // Ana sayfaya yönlendir
        navigate('/');
      } else {
        setError(result.error);
      }
    } catch (error) {
      console.error('Kayıt hatası:', error);
      setError(error.response?.data?.message || 'Kayıt olurken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="auth-form-container">
      <div className="auth-form">
        <h3 className="mb-4 text-center">Kayıt Ol</h3>
        
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="username" className="form-label">Kullanıcı Adı</label>
            <input 
              type="text" 
              className="form-control" 
              id="username" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          
          <div className="mb-3">
            <label htmlFor="email" className="form-label">E-posta Adresi</label>
            <input 
              type="email" 
              className="form-control" 
              id="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          
          <div className="mb-3">
            <label htmlFor="password" className="form-label">Şifre</label>
            <input 
              type="password" 
              className="form-control" 
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
            <div className="form-text">
              Şifreniz en az 8 karakter uzunluğunda olmalıdır.
            </div>
          </div>
          
          <div className="mb-3">
            <label htmlFor="confirmPassword" className="form-label">Şifre Tekrarı</label>
            <input 
              type="password" 
              className="form-control" 
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
              {isLoading ? 'Kayıt Yapılıyor...' : 'Kayıt Ol'}
            </button>
          </div>
          
          <p className="mt-3 text-center">
            Zaten hesabınız var mı? <Link to="/login">Giriş yap</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register; 