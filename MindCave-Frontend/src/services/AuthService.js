import ApiService from './ApiService';

const AuthService = {
  // Yerel depolama anahtarı
  storageKey: 'mindcave_user',
  
  // Kullanıcı bilgilerini yerel depolamadan yükleme
  getCurrentUser() {
    const userData = localStorage.getItem(this.storageKey);
    if (userData) {
      try {
        const user = JSON.parse(userData);
        
        // Token kontrolü
        if (this.isTokenExpired(user.token)) {
          this.logout();
          return null;
        }
        
        return user.user;
      } catch (e) {
        console.error('Kullanıcı verisi ayrıştırılamadı:', e);
        localStorage.removeItem(this.storageKey);
      }
    }
    return null;
  },
  
  // Token'ı al
  getToken() {
    const userData = localStorage.getItem(this.storageKey);
    if (userData) {
      try {
        const user = JSON.parse(userData);
        return user.token;
      } catch (e) {
        console.error('Token alınamadı:', e);
      }
    }
    return null;
  },
  
  // JWT token'ın süresinin dolup dolmadığını kontrol et
  isTokenExpired(token) {
    if (!token) return true;
    
    try {
      // Token'ı parçalara ayır
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      
      const payload = JSON.parse(jsonPayload);
      const expiry = payload.exp;
      
      // Token'ın süresi dolmuş mu kontrol et
      const currentTime = Math.floor(Date.now() / 1000);
      return expiry < currentTime;
    } catch (e) {
      console.error('Token doğrulanamadı:', e);
      return true; // Hata durumunda süresinin dolduğunu varsay
    }
  },
  
  // Kullanıcı bilgilerini yerel depolamaya kaydetme
  setCurrentUser(userData) {
    if (userData && userData.token) {
      localStorage.setItem(this.storageKey, JSON.stringify(userData));
      return true;
    }
    return false;
  },
  
  // Kullanıcı bilgilerini güncelleme
  async refreshUserData() {
    try {
      const token = this.getToken();
      if (token) {
        const response = await ApiService.users.getCurrentUser();
        const userData = response.data;
        
        // Mevcut token'ı koru, kullanıcı bilgilerini güncelle
        const currentData = JSON.parse(localStorage.getItem(this.storageKey));
        const updatedData = {
          token: currentData.token,
          user: userData
        };
        
        localStorage.setItem(this.storageKey, JSON.stringify(updatedData));
        return userData;
      }
    } catch (error) {
      console.error('Kullanıcı bilgileri güncellenemedi:', error);
    }
    return null;
  },
  
  // Kayıt işlemi
  async register(username, email, password) {
    // Bu fonksiyon ApiService tarafından çağrılacak
    // ApiService'i burada import etmiyoruz çünkü dairesel bağımlılık olur
    return { username, email, password };
  },
  
  // Giriş işlemi
  async login(username, password) {
    // Bu fonksiyon ApiService tarafından çağrılacak
    return { username, password };
  },
  
  // Çıkış işlemi
  logout() {
    localStorage.removeItem(this.storageKey);
  }
};

export default AuthService; 