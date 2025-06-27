import axios from 'axios';
import AuthService from './AuthService';

const ApiService = {
  // API temel URL'i - Backend'in çalıştığı URL'i belirt
  baseURL: 'http://localhost:5000/api',
  
  // Axios instance oluştur
  client: axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: {
      'Content-Type': 'application/json'
    },
    // Timeout ekleyelim
    timeout: 10000 // 10 saniye
  }),
  
  // İstek interceptor'ları ayarla
  setupInterceptors() {
    // İstek interceptor'ı
    this.client.interceptors.request.use(
      config => {
        const token = AuthService.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Debug için istek bilgilerini loglayalım
        console.log(`API İsteği: ${config.method.toUpperCase()} ${config.url}`);
        
        return config;
      },
      error => {
        console.error('API İsteği Hatası:', error);
        return Promise.reject(error);
      }
    );
    
    // Yanıt interceptor'ı
    this.client.interceptors.response.use(
      response => {
        // Debug için yanıt bilgilerini loglayalım
        console.log(`API Yanıtı: ${response.status} ${response.config.url}`);
        
        return response;
      },
      error => {
        // Hata detaylarını loglayalım
        if (error.response) {
          // Sunucu yanıtı ile dönen hata
          console.error('API Hata Yanıtı:', {
            status: error.response.status,
            url: error.config?.url,
            data: error.response.data,
            headers: error.response.headers
          });
        } else if (error.request) {
          // İstek yapıldı ama yanıt alınamadı (network hatası, sunucu çalışmıyor vs.)
          console.error('API Ağ Hatası:', {
            url: error.config?.url,
            message: 'Sunucudan yanıt alınamadı. Lütfen internet bağlantınızı kontrol edin veya daha sonra tekrar deneyin.'
          });
        } else {
          // İstek yapılırken bir hata oluştu
          console.error('API İstek Hatası:', {
            url: error.config?.url,
            message: error.message
          });
        }
        
        // 401 Unauthorized hatası - token geçersiz veya süresi dolmuş
        if (error.response && error.response.status === 401) {
          console.log('Oturum süresi doldu. Çıkış yapılıyor...');
          AuthService.logout();
          window.location.href = '/login?session=expired';
        }
        
        // Zaman aşımı hatası
        if (error.code === 'ECONNABORTED') {
          console.error('API İstek Zaman Aşımı:', {
            url: error.config?.url,
            message: 'İstek zaman aşımına uğradı. Lütfen daha sonra tekrar deneyin.'
          });
        }
        
        return Promise.reject(error);
      }
    );
  },
  
  // Kullanıcı işlemleri
  users: {
    register(userData) {
      return ApiService.client.post('/users/register', userData);
    },
    
    login(credentials) {
      return ApiService.client.post('/users/login', credentials);
    },
    
    getById(id) {
      return ApiService.client.get(`/users/${id}`);
    },
    
    getCurrentUser() {
      return ApiService.client.get('/users/current');
    }
  },
  
  // Not işlemleri
  notes: {
    getAll() {
      return ApiService.client.get('/notes');
    },
    
    getById(id) {
      return ApiService.client.get(`/notes/${id}`);
    },
    
    getByWorkspaceId(workspaceId) {
      return ApiService.client.get(`/workspaces/${workspaceId}/notes`);
    },
    
    create(noteData) {
      return ApiService.client.post('/notes', noteData);
    },
    
    update(id, noteData) {
      return ApiService.client.put(`/notes/${id}`, noteData);
    },
    
    delete(id) {
      return ApiService.client.delete(`/notes/${id}`);
    }
  },
  
  // Çalışma alanı işlemleri
  workspaces: {
    getAll() {
      return ApiService.client.get('/workspaces');
    },
    
    getById(id) {
      return ApiService.client.get(`/workspaces/${id}`);
    },
    
    create(workspaceData) {
      return ApiService.client.post('/workspaces', workspaceData);
    },
    
    update(id, workspaceData) {
      return ApiService.client.put(`/workspaces/${id}`, workspaceData);
    },
    
    delete(id) {
      return ApiService.client.delete(`/workspaces/${id}`);
    }
  },
  
  // Basit bir ping testi - API'nin çalışıp çalışmadığını kontrol etmek için
  ping() {
    return this.client.get('/ping')
      .then(() => true)
      .catch(() => false);
  }
};

// Interceptor'ları ayarla
ApiService.setupInterceptors();

export default ApiService; 