using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MindCave.Backend.Models;
using MindCave.Backend.Services;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;

namespace MindCave.Backend.Controllers
{
    [Route("api/notes")]
    [ApiController]
    [Authorize]
    public class NoteController : ControllerBase
    {
        private readonly INoteService _noteService;
        private readonly IWorkspaceService _workspaceService;

        public NoteController(INoteService noteService, IWorkspaceService workspaceService)
        {
            _noteService = noteService;
            _workspaceService = workspaceService;
        }

        // GET: api/notes
        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetNotes()
        {
            // Kullanıcı kimliğini al
            var userId = GetUserIdFromClaims();
            if (userId <= 0)
            {
                return Unauthorized(new { message = "Kimlik doğrulama gerekli" });
            }

            // Kullanıcının notlarını al
            var notes = await _noteService.GetAllNotesByUserIdAsync(userId);
            
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
                    workspaceId = note.WorkspaceId,
                    workspace = note.Workspace != null ? new { id = note.Workspace.Id, name = note.Workspace.Name } : null
                });
            }

            return Ok(noteList);
        }

        // GET: api/notes/5
        [HttpGet("{id}")]
        public async Task<ActionResult<object>> GetNote(int id)
        {
            // Kullanıcı kimliğini al
            var userId = GetUserIdFromClaims();
            if (userId <= 0)
            {
                return Unauthorized(new { message = "Kimlik doğrulama gerekli" });
            }

            // Notu bul
            var note = await _noteService.GetNoteByIdAsync(id, userId);

            if (note == null)
            {
                return NotFound(new { message = "Not bulunamadı" });
            }

            return Ok(new
            {
                id = note.Id,
                title = note.Title,
                content = note.Content,
                createdAt = note.CreatedAt,
                updatedAt = note.UpdatedAt,
                workspaceId = note.WorkspaceId,
                workspace = note.Workspace != null ? new { id = note.Workspace.Id, name = note.Workspace.Name } : null
            });
        }

        // POST: api/notes
        [HttpPost]
        public async Task<ActionResult<object>> CreateNote(NoteModel model)
        {
            if (!model.IsValid())
            {
                return BadRequest(new { message = "Not başlığı boş olamaz" });
            }

            // Kullanıcı kimliğini al
            var userId = GetUserIdFromClaims();
            if (userId <= 0)
            {
                return Unauthorized(new { message = "Kimlik doğrulama gerekli" });
            }

            // Notu oluştur
            var result = await _noteService.CreateNoteAsync(model.Title, model.Content, model.WorkspaceId, userId);

            if (!result.isSuccess)
            {
                return BadRequest(new { message = result.message });
            }

            // Çalışma alanı bilgilerini ekle
            var note = result.note;
            var workspaceData = note.WorkspaceId.HasValue ? 
                await _workspaceService.GetWorkspaceByIdAsync(note.WorkspaceId.Value, userId) : null;

            return CreatedAtAction(nameof(GetNote), new { id = note.Id }, new
            {
                id = note.Id,
                title = note.Title,
                content = note.Content,
                createdAt = note.CreatedAt,
                updatedAt = note.UpdatedAt,
                workspaceId = note.WorkspaceId,
                workspace = workspaceData != null ? new { id = workspaceData.Id, name = workspaceData.Name } : null
            });
        }

        // PUT: api/notes/5
        [HttpPut("{id}")]
        public async Task<ActionResult<object>> UpdateNote(int id, NoteModel model)
        {
            if (!model.IsValid())
            {
                return BadRequest(new { message = "Not başlığı boş olamaz" });
            }

            // Kullanıcı kimliğini al
            var userId = GetUserIdFromClaims();
            if (userId <= 0)
            {
                return Unauthorized(new { message = "Kimlik doğrulama gerekli" });
            }

            // Notu güncelle
            var result = await _noteService.UpdateNoteAsync(id, model.Title, model.Content, model.WorkspaceId, userId);

            if (!result.isSuccess)
            {
                return BadRequest(new { message = result.message });
            }

            // Çalışma alanı bilgilerini ekle
            var note = result.note;
            var workspaceData = note.WorkspaceId.HasValue ? 
                await _workspaceService.GetWorkspaceByIdAsync(note.WorkspaceId.Value, userId) : null;

            return Ok(new
            {
                id = note.Id,
                title = note.Title,
                content = note.Content,
                createdAt = note.CreatedAt,
                updatedAt = note.UpdatedAt,
                workspaceId = note.WorkspaceId,
                workspace = workspaceData != null ? new { id = workspaceData.Id, name = workspaceData.Name } : null
            });
        }

        // DELETE: api/notes/5
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteNote(int id)
        {
            // Kullanıcı kimliğini al
            var userId = GetUserIdFromClaims();
            if (userId <= 0)
            {
                return Unauthorized(new { message = "Kimlik doğrulama gerekli" });
            }

            // Notu sil
            var result = await _noteService.DeleteNoteAsync(id, userId);

            if (!result.isSuccess)
            {
                return BadRequest(new { message = result.message });
            }

            return Ok(new { message = result.message });
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

    public class NoteModel
    {
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public int? WorkspaceId { get; set; }

        public bool IsValid()
        {
            return !string.IsNullOrWhiteSpace(Title);
        }
    }
} 