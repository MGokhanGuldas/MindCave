using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MindCave.Backend.Models;

namespace MindCave.Backend.Services
{
    public interface IUserService
    {
        Task<IEnumerable<User>> GetAllUsersAsync();
        Task<User> GetUserByIdAsync(int id);
        Task<User> GetUserByUsernameAsync(string username);
        Task<User> GetCurrentUserAsync(int userId);
        Task<(bool isSuccess, string message, User user, string token)> RegisterUserAsync(string username, string email, string password);
        Task<(bool isSuccess, string message, User user, string token)> LoginAsync(string username, string password);
        Task<bool> ValidatePasswordAsync(string password);
        string GenerateJwtToken(User user);
    }
} 