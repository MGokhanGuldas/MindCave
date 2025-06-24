# MindCave Projesi

MindCave, kullanıcıların notlarını oluşturup düzenleyebileceği ve çalışma alanları içinde organize edebileceği bir not alma uygulamasıdır.

## Proje Yapısı

Proje, frontend ve backend olarak iki ayrı uygulamaya bölünmüştür:

- `MindCave-Backend/`: ASP.NET Core 8.0 API
- `MindCave-Frontend/`: React tabanlı frontend uygulaması

## Başlangıç

### Backend

1. SQL Server'ı kurun ve çalıştırın
2. `MindCave-Backend/appsettings.json` dosyasındaki bağlantı dizesini kendi SQL Server ayarlarınıza göre düzenleyin
3. Backend'i çalıştırın:

```bash
cd MindCave-Backend
dotnet restore
dotnet run
```

Backend API, varsayılan olarak http://localhost:5000 adresinde çalışacaktır.

### Frontend

1. Node.js ve npm'i yükleyin
2. Frontend bağımlılıklarını yükleyin ve uygulamayı başlatın:

```bash
cd MindCave-Frontend
npm install
npm start
```

Frontend uygulaması, varsayılan olarak http://localhost:3000 adresinde çalışacaktır.

## Özellikler

- Kullanıcı kaydı ve kimlik doğrulama
- Not oluşturma, düzenleme ve silme
- Çalışma alanları oluşturma ve yönetme
- Notları çalışma alanlarına göre organize etme
- JWT tabanlı kimlik doğrulama
- Responsive tasarım

## Teknolojiler

### Backend
- ASP.NET Core 8.0
- Entity Framework Core
- SQL Server
- JWT Authentication

### Frontend
- React 18
- React Router
- Axios
- Bootstrap 5
- Bootstrap Icons 