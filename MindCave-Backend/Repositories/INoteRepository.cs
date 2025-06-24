using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MindCave.Backend.Models;

namespace MindCave.Backend.Repositories
{
    public interface INoteRepository : IRepository<Note>
    {
        Task<IEnumerable<Note>> GetAllByUserIdAsync(int userId);
        Task<IEnumerable<Note>> GetAllByWorkspaceIdAsync(int workspaceId);
        Task<Note> GetByIdAndUserIdAsync(int id, int userId);
        Task<bool> BelongsToUserAsync(int noteId, int userId);
    }
} 