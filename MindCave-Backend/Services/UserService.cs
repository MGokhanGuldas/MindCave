using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using MindCave.Backend.Models;
using MindCave.Backend.Repositories;

namespace MindCave.Backend.Services
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _userRepository;
        private readonly IConfiguration _configuration;

        public UserService(IUserRepository userRepository, IConfiguration configuration)
        {
            _userRepository = userRepository;
            _configuration = configuration;
        }

        public async Task<IEnumerable<User>> GetAllUsersAsync()
        {
            return await _userRepository.GetAllAsync();
        }

        public async Task<User> GetUserByIdAsync(int id)
        {
            return await _userRepository.GetByIdAsync(id);
        }

        public async Task<User> GetUserByUsernameAsync(string username)
        {
            return await _userRepository.GetByUsernameAsync(username);
        }

        public async Task<User> GetCurrentUserAsync(int userId)
        {
            return await _userRepository.GetByIdAsync(userId);
        }

        public async Task<(bool isSuccess, string message, User user, string token)> RegisterUserAsync(
            string username, string email, string password)
        {
            // Kullanıcı adının benzersiz olduğunu kontrol et
            if (!await _userRepository.IsUsernameUniqueAsync(username))
            {
                return (false, "Bu kullanıcı adı zaten kullanılıyor", null, null);
            }

            // E-posta adresinin benzersiz olduğunu kontrol et
            if (!await _userRepository.IsEmailUniqueAsync(email))
            {
                return (false, "Bu e-posta adresi zaten kullanılıyor", null, null);
            }

            // Şifre güvenliğini kontrol et
            if (!await ValidatePasswordAsync(password))
            {
                return (false, "Şifre en az 8 karakter uzunluğunda olmalı ve en az bir büyük harf, bir küçük harf, bir rakam ve bir özel karakter içermelidir", null, null);
            }

            // Yeni kullanıcı oluştur
            var user = new User
            {
                Username = username,
                Email = email,
                Password = BCrypt.Net.BCrypt.HashPassword(password),
                CreatedAt = DateTime.Now,
                Role = "User"
            };

            // Kullanıcıyı veritabanına ekle
            await _userRepository.AddAsync(user);
            await _userRepository.SaveChangesAsync();

            // Token oluştur
            var token = GenerateJwtToken(user);

            return (true, "Kayıt başarılı", user, token);
        }

        public async Task<(bool isSuccess, string message, User user, string token)> LoginAsync(
            string username, string password)
        {
            // Kullanıcıyı bul
            var user = await _userRepository.GetByUsernameAsync(username);

            // Kullanıcı bulunamadı veya şifre yanlış
            if (user == null || !BCrypt.Net.BCrypt.Verify(password, user.Password))
            {
                return (false, "Geçersiz kullanıcı adı veya şifre", null, null);
            }

            // Token oluştur
            var token = GenerateJwtToken(user);

            return (true, "Giriş başarılı", user, token);
        }

        public async Task<bool> ValidatePasswordAsync(string password)
        {
            if (string.IsNullOrEmpty(password) || password.Length < 8)
            {
                return false;
            }

            if (!Regex.IsMatch(password, @"[A-Z]"))
            {
                return false;
            }

            if (!Regex.IsMatch(password, @"[a-z]"))
            {
                return false;
            }

            if (!Regex.IsMatch(password, @"[0-9]"))
            {
                return false;
            }

            if (!Regex.IsMatch(password, @"[^A-Za-z0-9]"))
            {
                return false;
            }

            return true;
        }

        public string GenerateJwtToken(User user)
        {
            try
            {
                var tokenHandler = new JwtSecurityTokenHandler();
                var key = Encoding.ASCII.GetBytes(_configuration["Jwt:Key"] ?? "DefaultSecretKey12345678901234567890");
                var tokenDescriptor = new SecurityTokenDescriptor
                {
                    Subject = new ClaimsIdentity(new[]
                    {
                        new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                        new Claim(ClaimTypes.Name, user.Username),
                        new Claim(ClaimTypes.Email, user.Email),
                        new Claim(ClaimTypes.Role, user.Role)
                    }),
                    Expires = DateTime.UtcNow.AddDays(7),
                    SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature),
                    Issuer = _configuration["Jwt:Issuer"] ?? "MindCave",
                    Audience = _configuration["Jwt:Audience"] ?? "MindCaveUsers"
                };
                var token = tokenHandler.CreateToken(tokenDescriptor);
                return tokenHandler.WriteToken(token);
            }
            catch (Exception ex)
            {
                // Exception'ı fırlat yerine loglama yap ve null dön
                Console.WriteLine($"Token oluşturma hatası: {ex.Message}");
                return null;
            }
        }
    }
} 