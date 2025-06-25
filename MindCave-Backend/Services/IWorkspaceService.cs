using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MindCave.Backend.Models;

namespace MindCave.Backend.Services
{
    public interface IWorkspaceService
    {
        Task<IEnumerable<Workspace>> GetAllWorkspacesByUserIdAsync(int userId);
        Task<Workspace> GetWorkspaceByIdAsync(int id, int userId);
        Task<(bool isSuccess, string message, Workspace workspace)> CreateWorkspaceAsync(string name, string description, string color, int userId);
        Task<(bool isSuccess, string message, Workspace workspace)> UpdateWorkspaceAsync(int id, string name, string description, string color, int userId);
        Task<(bool isSuccess, string message)> DeleteWorkspaceAsync(int id, int userId);
        Task<IEnumerable<Note>> GetWorkspaceNotesAsync(int workspaceId, int userId);
    }
} 