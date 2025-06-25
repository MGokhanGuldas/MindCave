using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MindCave.Backend.Models;
using MindCave.Backend.Services;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;

namespace MindCave.Backend.Controllers
{
    [Route("api/workspaces")]
    [ApiController]
    [Authorize]
    public class WorkspaceController : ControllerBase
    {
        private readonly IWorkspaceService _workspaceService;

        public WorkspaceController(IWorkspaceService workspaceService)
        {
            _workspaceService = workspaceService;
        }

        // GET: api/workspaces
        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetWorkspaces()
        {
            // Kullanıcı kimliğini al
            var userId = GetUserIdFromClaims();
            if (userId <= 0)
            {
                return Unauthorized(new { message = "Kimlik doğrulama gerekli" });
            }

            // Kullanıcının çalışma alanlarını al
            var workspaces = await _workspaceService.GetAllWorkspacesByUserIdAsync(userId);

            // Çalışma alanı bilgilerini döndür
            var workspaceList = new List<object>();
            foreach (var workspace in workspaces)
            {
                int noteCount = workspace.Notes?.Count ?? 0;
                
                workspaceList.Add(new
                {
                    id = workspace.Id,
                    name = workspace.Name ?? string.Empty,
                    description = workspace.Description ?? string.Empty,
                    color = workspace.Color ?? "#3498db",
                    createdAt = workspace.CreatedAt,
                    updatedAt = workspace.UpdatedAt,
                    noteCount = noteCount
                });
            }

            return Ok(workspaceList);
        }

        // GET: api/workspaces/5
        [HttpGet("{id}")]
        public async Task<ActionResult<object>> GetWorkspace(int id)
        {
            try
            {
                // Kullanıcı kimliğini al
                var userId = GetUserIdFromClaims();
                if (userId <= 0)
                {
                    return Unauthorized(new { message = "Kimlik doğrulama gerekli" });
                }

                // Çalışma alanını bul
                var workspace = await _workspaceService.GetWorkspaceByIdAsync(id, userId);

                if (workspace == null)
                {
                    return NotFound(new { message = "Çalışma alanı bulunamadı" });
                }

                // Çalışma alanına ait notları say
                int noteCount = workspace.Notes?.Count ?? 0;

                return Ok(new
                {
                    id = workspace.Id,
                    name = workspace.Name ?? string.Empty,
                    description = workspace.Description ?? string.Empty,
                    color = workspace.Color ?? "#3498db",
                    createdAt = workspace.CreatedAt,
                    updatedAt = workspace.UpdatedAt,
                    noteCount = noteCount
                });
            }
            catch (System.Exception ex)
            {
                // Hata logla
                System.Console.WriteLine($"GetWorkspace Error: {ex.Message}");
                return StatusCode(500, new { message = "Çalışma alanı yüklenirken bir hata oluştu." });
            }
        }

        // POST: api/workspaces
        [HttpPost]
        public async Task<ActionResult<object>> CreateWorkspace(WorkspaceModel model)
        {
            if (!model.IsValid())
            {
                return BadRequest(new { message = "Çalışma alanı adı boş olamaz" });
            }

            // Kullanıcı kimliğini al
            var userId = GetUserIdFromClaims();
            if (userId <= 0)
            {
                return Unauthorized(new { message = "Kimlik doğrulama gerekli" });
            }

            // Çalışma alanı oluştur
            var result = await _workspaceService.CreateWorkspaceAsync(
                model.Name, model.Description, model.Color, userId);

            if (!result.isSuccess)
            {
                return BadRequest(new { message = result.message });
            }

            var workspace = result.workspace;
            return CreatedAtAction(nameof(GetWorkspace), new { id = workspace.Id }, new
            {
                id = workspace.Id,
                name = workspace.Name ?? string.Empty,
                description = workspace.Description ?? string.Empty,
                color = workspace.Color ?? "#3498db",
                createdAt = workspace.CreatedAt,
                updatedAt = workspace.UpdatedAt,
                noteCount = 0
            });
        }

        // PUT: api/workspaces/5
        [HttpPut("{id}")]
        public async Task<ActionResult<object>> UpdateWorkspace(int id, WorkspaceModel model)
        {
            if (!model.IsValid())
            {
                return BadRequest(new { message = "Çalışma alanı adı boş olamaz" });
            }

            // Kullanıcı kimliğini al
            var userId = GetUserIdFromClaims();
            if (userId <= 0)
            {
                return Unauthorized(new { message = "Kimlik doğrulama gerekli" });
            }

            // Çalışma alanını güncelle
            var result = await _workspaceService.UpdateWorkspaceAsync(
                id, model.Name, model.Description, model.Color, userId);

            if (!result.isSuccess)
            {
                return BadRequest(new { message = result.message });
            }

            var workspace = result.workspace;
            int noteCount = workspace.Notes?.Count ?? 0;

            return Ok(new
            {
                id = workspace.Id,
                name = workspace.Name ?? string.Empty,
                description = workspace.Description ?? string.Empty,
                color = workspace.Color ?? "#3498db",
                createdAt = workspace.CreatedAt,
                updatedAt = workspace.UpdatedAt,
                noteCount = noteCount
            });
        }

        // DELETE: api/workspaces/5
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteWorkspace(int id)
        {
            // Kullanıcı kimliğini al
            var userId = GetUserIdFromClaims();
            if (userId <= 0)
            {
                return Unauthorized(new { message = "Kimlik doğrulama gerekli" });
            }

            // Çalışma alanını sil
            var result = await _workspaceService.DeleteWorkspaceAsync(id, userId);

            if (!result.isSuccess)
            {
                return BadRequest(new { message = result.message });
            }

            return Ok(new { message = result.message });
        }

        // GET: api/workspaces/5/notes
        [HttpGet("{id}/notes")]
        public async Task<ActionResult<IEnumerable<object>>> GetWorkspaceNotes(int id)
        {
            // Kullanıcı kimliğini al
            var userId = GetUserIdFromClaims();
            if (userId <= 0)
            {
                return Unauthorized(new { message = "Kimlik doğrulama gerekli" });
            }

            // Çalışma alanına ait notları al
            var notes = await _workspaceService.GetWorkspaceNotesAsync(id, userId);
            
            // Not bilgilerini döndür
            var noteList = new List<object>();
            foreach (var note in notes)
            {
                noteList.Add(new
                {
                    id = note.Id,
                    title = note.Title,
                    content = note.Content,
                    createdAt = note.CreatedAt,
                    updatedAt = note.UpdatedAt,
                    workspaceId = note.WorkspaceId
                });
            }

            return Ok(noteList);
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

    public class WorkspaceModel
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; } = string.Empty;
        public string? Color { get; set; } = string.Empty;

        public bool IsValid()
        {
            return !string.IsNullOrWhiteSpace(Name);
        }
    }
} 