# MindCave Backend

MindCave uygulamasının ASP.NET Core 8.0 ile geliştirilmiş backend API'si.

## Teknolojiler

- ASP.NET Core 8.0
- Entity Framework Core
- SQL Server
- JWT Authentication

## Proje Yapısı

- `Controllers/`: API endpoint'leri
- `Models/`: Veri modelleri
- `Data/`: Veritabanı işlemleri
- `Program.cs`: Uygulama başlangıç noktası

## Kurulum

1. SQL Server'ı kurun ve çalıştırın
2. `appsettings.json` dosyasındaki bağlantı dizesini kendi SQL Server ayarlarınıza göre düzenleyin
3. Aşağıdaki komutları çalıştırın:

```bash
dotnet restore
dotnet run
```

## API Endpoint'leri

### Kullanıcı İşlemleri
- `POST /api/users/register`: Yeni kullanıcı kaydı
- `POST /api/users/login`: Kullanıcı girişi
- `GET /api/users/me`: Mevcut kullanıcı bilgileri

### Not İşlemleri
- `GET /api/notes`: Kullanıcıya ait tüm notları listele
- `GET /api/notes/{id}`: Belirli bir notu getir
- `POST /api/notes`: Yeni not oluştur
- `PUT /api/notes/{id}`: Not güncelle
- `DELETE /api/notes/{id}`: Not sil

### Çalışma Alanı İşlemleri
- `GET /api/workspaces`: Kullanıcıya ait tüm çalışma alanlarını listele
- `GET /api/workspaces/{id}`: Belirli bir çalışma alanını getir
- `POST /api/workspaces`: Yeni çalışma alanı oluştur
- `PUT /api/workspaces/{id}`: Çalışma alanını güncelle
- `DELETE /api/workspaces/{id}`: Çalışma alanını sil 