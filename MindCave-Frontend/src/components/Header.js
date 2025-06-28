import React, { useState } from 'react';

const Header = ({ isLoggedIn, user, onLogout }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  const toggleProfileDropdown = () => {
    setIsProfileOpen(!isProfileOpen);
  };
  
  // Profil dropdown'ı dışında bir yere tıklandığında dropdown'ı kapat
  const handleClickOutside = (e) => {
    if (!e.target.closest('.profile-dropdown')) {
      setIsProfileOpen(false);
    }
  };
  
  // Sayfa yüklendiğinde event listener ekle
  React.useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);
  
  // Kullanıcı adı ve e-posta bilgilerini al
  const username = user?.username || 'Kullanıcı';
  const email = user?.email || '';
  
  return (
    <header className="header">
      <div className="d-flex align-items-center">
        <button 
          className="btn btn-sm btn-outline-secondary d-md-none me-2" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#sidebar"
        >
          <i className="bi bi-list"></i>
        </button>
        <h4 className="mb-0 text-light">MindCave</h4>
      </div>
      
      <div>
        {isLoggedIn && (
          <div className="profile-dropdown">
            <button className="btn btn-sm btn-outline-light profile-button" onClick={toggleProfileDropdown}>
              <i className="bi bi-person-fill"></i>
            </button>
            
            {isProfileOpen && (
              <div className="profile-dropdown-content position-absolute end-0 mt-2 p-3 rounded shadow">
                <div className="profile-info">
                  <div className="mb-2">
                    <strong>{username}</strong>
                  </div>
                  <div className="text-muted small mb-2">{email}</div>
                </div>
                <div className="profile-actions">
                  <button 
                    className="btn btn-sm btn-outline-light w-100"
                    onClick={onLogout}
                  >
                    Çıkış Yap
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header; 