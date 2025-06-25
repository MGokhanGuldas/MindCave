using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MindCave.Backend.Models;
using MindCave.Backend.Repositories;

namespace MindCave.Backend.Services
{
    public class WorkspaceService : IWorkspaceService
    {
        private readonly IWorkspaceRepository _workspaceRepository;
        private readonly INoteRepository _noteRepository;

        public WorkspaceService(IWorkspaceRepository workspaceRepository, INoteRepository noteRepository)
        {
            _workspaceRepository = workspaceRepository;
            _noteRepository = noteRepository;
        }

        public async Task<IEnumerable<Workspace>> GetAllWorkspacesByUserIdAsync(int userId)
        {
            return await _workspaceRepository.GetAllByUserIdAsync(userId);
        }

        public async Task<Workspace> GetWorkspaceByIdAsync(int id, int userId)
        {
            return await _workspaceRepository.GetByIdAndUserIdAsync(id, userId);
        }

        public async Task<(bool isSuccess, string message, Workspace workspace)> CreateWorkspaceAsync(
            string name, string description, string color, int userId)
        {
            if (string.IsNullOrWhiteSpace(name))
            {
                return (false, "Çalışma alanı adı boş olamaz", null);
            }

            var workspace = new Workspace
            {
                Name = name,
                Description = description ?? string.Empty,
                Color = color ?? "#3498db",
                UserId = userId,
                CreatedAt = DateTime.Now,
                UpdatedAt = DateTime.Now
            };

            await _workspaceRepository.AddAsync(workspace);
            bool result = await _workspaceRepository.SaveChangesAsync();

            if (!result)
            {
                return (false, "Çalışma alanı oluşturulurken bir hata oluştu", null);
            }

            return (true, "Çalışma alanı başarıyla oluşturuldu", workspace);
        }

        public async Task<(bool isSuccess, string message, Workspace workspace)> UpdateWorkspaceAsync(
            int id, string name, string description, string color, int userId)
        {
            if (string.IsNullOrWhiteSpace(name))
            {
                return (false, "Çalışma alanı adı boş olamaz", null);
            }

            // Çalışma alanını bul
            var workspace = await _workspaceRepository.GetByIdAndUserIdAsync(id, userId);

            if (workspace == null)
            {
                return (false, "Çalışma alanı bulunamadı", null);
            }

            // Çalışma alanını güncelle
            workspace.Name = name;
            workspace.Description = description ?? workspace.Description;
            workspace.Color = color ?? workspace.Color;
            workspace.UpdatedAt = DateTime.Now;

            _workspaceRepository.Update(workspace);
            bool result = await _workspaceRepository.SaveChangesAsync();

            if (!result)
            {
                return (false, "Çalışma alanı güncellenirken bir hata oluştu", null);
            }

            return (true, "Çalışma alanı başarıyla güncellendi", workspace);
        }

        public async Task<(bool isSuccess, string message)> DeleteWorkspaceAsync(int id, int userId)
        {
            // Çalışma alanını bul
            var workspace = await _workspaceRepository.GetByIdAndUserIdAsync(id, userId);

            if (workspace == null)
            {
                return (false, "Çalışma alanı bulunamadı");
            }

            try
            {
                // İlgili notları güncelle (çalışma alanı referansını kaldır)
                var notes = await _noteRepository.GetAllByWorkspaceIdAsync(id);
                foreach (var note in notes)
                {
                    note.WorkspaceId = null;
                    note.UpdatedAt = DateTime.Now;
                    _noteRepository.Update(note);
                }

                // Çalışma alanını sil
                _workspaceRepository.Remove(workspace);
                bool result = await _workspaceRepository.SaveChangesAsync();

                if (!result)
                {
                    return (false, "Çalışma alanı silinirken bir hata oluştu");
                }

                return (true, "Çalışma alanı başarıyla silindi");
            }
            catch (Exception ex)
            {
                return (false, $"Çalışma alanı silinirken bir hata oluştu: {ex.Message}");
            }
        }

        public async Task<IEnumerable<Note>> GetWorkspaceNotesAsync(int workspaceId, int userId)
        {
            // Önce çalışma alanının kullanıcıya ait olduğunu kontrol et
            if (!await _workspaceRepository.BelongsToUserAsync(workspaceId, userId))
            {
                return new List<Note>();
            }

            return await _noteRepository.GetAllByWorkspaceIdAsync(workspaceId);
        }
    }
} 