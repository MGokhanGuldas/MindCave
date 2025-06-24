using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using MindCave.Backend.Data;
using MindCave.Backend.Models;

namespace MindCave.Backend.Repositories
{
    public class WorkspaceRepository : Repository<Workspace>, IWorkspaceRepository
    {
        private readonly ApplicationDbContext _appContext;

        public WorkspaceRepository(ApplicationDbContext context) : base(context)
        {
            _appContext = context;
        }

        public async Task<IEnumerable<Workspace>> GetAllByUserIdAsync(int userId)
        {
            return await _dbSet
                .Where(w => w.UserId == userId)
                .OrderBy(w => w.Name)
                .ToListAsync();
        }

        public async Task<Workspace> GetByIdAndUserIdAsync(int id, int userId)
        {
            return await _dbSet
                .AsNoTracking()
                .FirstOrDefaultAsync(w => w.Id == id && w.UserId == userId);
        }

        public async Task<bool> BelongsToUserAsync(int workspaceId, int userId)
        {
            return await _dbSet.AnyAsync(w => w.Id == workspaceId && w.UserId == userId);
        }

        public async Task<int> GetNoteCountAsync(int workspaceId)
        {
            return await _appContext.Notes.CountAsync(n => n.WorkspaceId == workspaceId);
        }
    }
} 