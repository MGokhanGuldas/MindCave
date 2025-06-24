using MindCave.Backend.Models;
using System;
using System.Linq;

namespace MindCave.Backend.Data
{
    public static class DbInitializer
    {
        public static void Initialize(ApplicationDbContext context)
        {
            // Veritabanını oluştur (yoksa)
            context.Database.EnsureCreated();

            // Örnek veriler ekle (boşsa)
            if (!context.Users.Any())
            {
                // Örnek kullanıcı
                var demoUser = new User
                {
                    Username = "demo",
                    Email = "demo@example.com",
                    Password = BCrypt.Net.BCrypt.HashPassword("Demo123!"),
                    CreatedAt = DateTime.Now,
                    Role = "User"
                };

                context.Users.Add(demoUser);
                context.SaveChanges();

                // Örnek çalışma alanları
                var workspaces = new Workspace[]
                {
                    new Workspace
                    {
                        Name = "Kişisel Notlar",
                        Description = "Günlük kişisel notlarım",
                        Color = "#3498db", // Mavi
                        UserId = demoUser.Id,
                        CreatedAt = DateTime.Now,
                        UpdatedAt = DateTime.Now
                    },
                    new Workspace
                    {
                        Name = "İş Notları",
                        Description = "İş ile ilgili notlar ve görevler",
                        Color = "#e74c3c", // Kırmızı
                        UserId = demoUser.Id,
                        CreatedAt = DateTime.Now,
                        UpdatedAt = DateTime.Now
                    }
                };

                context.Workspaces.AddRange(workspaces);
                context.SaveChanges();

                // Örnek notlar
                var notes = new Note[]
                {
                    new Note
                    {
                        Title = "Hoş Geldiniz",
                        Content = "MindCave not alma uygulamasına hoş geldiniz! Bu uygulama ile notlarınızı düzenleyebilir ve çalışma alanları içinde organize edebilirsiniz.",
                        UserId = demoUser.Id,
                        WorkspaceId = workspaces[0].Id,
                        CreatedAt = DateTime.Now,
                        UpdatedAt = DateTime.Now
                    },
                    new Note
                    {
                        Title = "Alışveriş Listesi",
                        Content = "- Ekmek\n- Süt\n- Yumurta\n- Meyve",
                        UserId = demoUser.Id,
                        WorkspaceId = workspaces[0].Id,
                        CreatedAt = DateTime.Now,
                        UpdatedAt = DateTime.Now
                    },
                    new Note
                    {
                        Title = "Toplantı Notları",
                        Content = "Pazartesi 10:00 - Ekip toplantısı\nSalı 14:00 - Müşteri görüşmesi\nPerşembe 15:30 - Sprint planlama",
                        UserId = demoUser.Id,
                        WorkspaceId = workspaces[1].Id,
                        CreatedAt = DateTime.Now,
                        UpdatedAt = DateTime.Now
                    }
                };

                context.Notes.AddRange(notes);
                context.SaveChanges();
            }
        }
    }
} 