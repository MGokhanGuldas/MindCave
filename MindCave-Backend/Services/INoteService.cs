using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MindCave.Backend.Models;

namespace MindCave.Backend.Services
{
    public interface INoteService
    {
        Task<IEnumerable<Note>> GetAllNotesByUserIdAsync(int userId);
        Task<IEnumerable<Note>> GetNotesByWorkspaceIdAsync(int workspaceId, int userId);
        Task<Note> GetNoteByIdAsync(int id, int userId);
        Task<(bool isSuccess, string message, Note note)> CreateNoteAsync(string title, string content, int? workspaceId, int userId);
        Task<(bool isSuccess, string message, Note note)> UpdateNoteAsync(int id, string title, string content, int? workspaceId, int userId);
        Task<(bool isSuccess, string message)> DeleteNoteAsync(int id, int userId);
    }
} 