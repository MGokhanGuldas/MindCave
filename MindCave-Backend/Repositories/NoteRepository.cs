using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using MindCave.Backend.Data;
using MindCave.Backend.Models;

namespace MindCave.Backend.Repositories
{
    public class NoteRepository : Repository<Note>, INoteRepository
    {
        public NoteRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<Note>> GetAllByUserIdAsync(int userId)
        {
            return await _dbSet
                .Where(n => n.UserId == userId)
                .Include(n => n.Workspace)
                .OrderByDescending(n => n.UpdatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<Note>> GetAllByWorkspaceIdAsync(int workspaceId)
        {
            return await _dbSet
                .Where(n => n.WorkspaceId == workspaceId)
                .OrderByDescending(n => n.UpdatedAt)
                .ToListAsync();
        }

        public async Task<Note> GetByIdAndUserIdAsync(int id, int userId)
        {
            return await _dbSet
                .Include(n => n.Workspace)
                .FirstOrDefaultAsync(n => n.Id == id && n.UserId == userId);
        }

        public async Task<bool> BelongsToUserAsync(int noteId, int userId)
        {
            return await _dbSet.AnyAsync(n => n.Id == noteId && n.UserId == userId);
        }
    }
} 