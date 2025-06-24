using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MindCave.Backend.Models;

namespace MindCave.Backend.Repositories
{
    public interface IWorkspaceRepository : IRepository<Workspace>
    {
        Task<IEnumerable<Workspace>> GetAllByUserIdAsync(int userId);
        Task<Workspace> GetByIdAndUserIdAsync(int id, int userId);
        Task<bool> BelongsToUserAsync(int workspaceId, int userId);
        Task<int> GetNoteCountAsync(int workspaceId);
    }
} 