using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using MindCave.Backend.Data;
using MindCave.Backend.Models;
using MindCave.Backend.Services;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace MindCave.Backend.Controllers
{
    [Route("api/users")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;

        public UserController(IUserService userService)
        {
            _userService = userService;
        }

        // GET: api/users/health
        [HttpGet("health")]
        public ActionResult<object> Health()
        {
            return Ok(new { status = "API is running" });
        }

        // GET: api/users
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<IEnumerable<User>>> GetUsers()
        {
            var users = await _userService.GetAllUsersAsync();
            return Ok(users);
        }

        // GET: api/users/5
        [HttpGet("{id}")]
        [Authorize]
        public async Task<ActionResult<User>> GetUser(int id)
        {
            var user = await _userService.GetUserByIdAsync(id);

            if (user == null)
            {
                return NotFound(new { message = "Kullanıcı bulunamadı" });
            }

            return Ok(user);
        }

        // GET: api/users/current
        [HttpGet("current")]
        [Authorize]
        public async Task<ActionResult<object>> GetCurrentUser()
        {
            // Kullanıcı kimliğini al
            var userId = GetUserIdFromClaims();
            if (userId <= 0)
            {
                return Unauthorized(new { message = "Kimlik doğrulama gerekli" });
            }
            
            // Kullanıcıyı bul
            var user = await _userService.GetCurrentUserAsync(userId);

            if (user == null)
            {
                return NotFound(new { message = "Kullanıcı bulunamadı" });
            }

            // Kullanıcı bilgilerini döndür
            return Ok(new
            {
                id = user.Id,
                username = user.Username ?? "Kullanıcı",
                email = user.Email ?? ""
            });
        }

        // POST: api/users/register
        [HttpPost("register")]
        public async Task<ActionResult<object>> Register([FromBody] RegisterModel model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _userService.RegisterUserAsync(model.Username, model.Email, model.Password);

            if (!result.isSuccess)
            {
                return BadRequest(new { message = result.message });
            }

            // Kullanıcı bilgilerini ve token'ı döndür
            return Ok(new
            {
                token = result.token,
                user = new
                {
                    id = result.user.Id,
                    username = result.user.Username ?? "Kullanıcı",
                    email = result.user.Email ?? ""
                }
            });
        }

        // POST: api/users/login
        [HttpPost("login")]
        public async Task<ActionResult<object>> Login([FromBody] LoginModel model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _userService.LoginAsync(model.Username, model.Password);

            if (!result.isSuccess)
            {
                return BadRequest(new { message = result.message });
            }

            // Kullanıcı bilgilerini ve token'ı döndür
            return Ok(new
            {
                token = result.token,
                user = new
                {
                    id = result.user.Id,
                    username = result.user.Username ?? "Kullanıcı",
                    email = result.user.Email ?? ""
                }
            });
        }

        // GET: api/users/me
        [HttpGet("me")]
        [Authorize]
        public async Task<ActionResult<object>> GetMe()
        {
            // Kullanıcı kimliğini al
            var userId = GetUserIdFromClaims();
            if (userId <= 0)
            {
                return Unauthorized(new { message = "Kimlik doğrulama gerekli" });
            }
            
            // Kullanıcıyı bul
            var user = await _userService.GetUserByIdAsync(userId);

            if (user == null)
            {
                return NotFound(new { message = "Kullanıcı bulunamadı" });
            }

            // Kullanıcı bilgilerini döndür
            return Ok(new
            {
                id = user.Id,
                username = user.Username ?? "Kullanıcı",
                email = user.Email ?? ""
            });
        }

        // Kullanıcı kimliğini token'dan al
        private int GetUserIdFromClaims()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim != null && int.TryParse(userIdClaim.Value, out int userId))
            {
                return userId;
            }
            return 0;
        }
    }

    public class RegisterModel
    {
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class LoginModel
    {
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
} 