using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MindCave.Backend.Models;
using MindCave.Backend.Repositories;

namespace MindCave.Backend.Services
{
    public class NoteService : INoteService
    {
        private readonly INoteRepository _noteRepository;
        private readonly IWorkspaceRepository _workspaceRepository;

        public NoteService(INoteRepository noteRepository, IWorkspaceRepository workspaceRepository)
        {
            _noteRepository = noteRepository;
            _workspaceRepository = workspaceRepository;
        }

        public async Task<IEnumerable<Note>> GetAllNotesByUserIdAsync(int userId)
        {
            return await _noteRepository.GetAllByUserIdAsync(userId);
        }

        public async Task<IEnumerable<Note>> GetNotesByWorkspaceIdAsync(int workspaceId, int userId)
        {
            // Önce çalışma alanının kullanıcıya ait olduğunu kontrol et
            if (!await _workspaceRepository.BelongsToUserAsync(workspaceId, userId))
            {
                return new List<Note>();
            }

            return await _noteRepository.GetAllByWorkspaceIdAsync(workspaceId);
        }

        public async Task<Note> GetNoteByIdAsync(int id, int userId)
        {
            return await _noteRepository.GetByIdAndUserIdAsync(id, userId);
        }

        public async Task<(bool isSuccess, string message, Note note)> CreateNoteAsync(
            string title, string content, int? workspaceId, int userId)
        {
            if (string.IsNullOrWhiteSpace(title))
            {
                return (false, "Not başlığı boş olamaz", null);
            }

            // Çalışma alanının kullanıcıya ait olduğunu kontrol et
            if (workspaceId.HasValue && !await _workspaceRepository.BelongsToUserAsync(workspaceId.Value, userId))
            {
                return (false, "Geçersiz çalışma alanı", null);
            }

            var note = new Note
            {
                Title = title,
                Content = content ?? string.Empty,
                WorkspaceId = workspaceId,
                UserId = userId,
                CreatedAt = DateTime.Now,
                UpdatedAt = DateTime.Now
            };

            await _noteRepository.AddAsync(note);
            bool result = await _noteRepository.SaveChangesAsync();

            if (!result)
            {
                return (false, "Not oluşturulurken bir hata oluştu", null);
            }

            return (true, "Not başarıyla oluşturuldu", note);
        }

        public async Task<(bool isSuccess, string message, Note note)> UpdateNoteAsync(
            int id, string title, string content, int? workspaceId, int userId)
        {
            if (string.IsNullOrWhiteSpace(title))
            {
                return (false, "Not başlığı boş olamaz", null);
            }

            // Notu bul
            var note = await _noteRepository.GetByIdAndUserIdAsync(id, userId);

            if (note == null)
            {
                return (false, "Not bulunamadı", null);
            }

            // Çalışma alanının kullanıcıya ait olduğunu kontrol et
            if (workspaceId.HasValue && !await _workspaceRepository.BelongsToUserAsync(workspaceId.Value, userId))
            {
                return (false, "Geçersiz çalışma alanı", null);
            }

            // Notu güncelle
            note.Title = title;
            note.Content = content ?? string.Empty;
            note.WorkspaceId = workspaceId;
            note.UpdatedAt = DateTime.Now;

            _noteRepository.Update(note);
            bool result = await _noteRepository.SaveChangesAsync();

            if (!result)
            {
                return (false, "Not güncellenirken bir hata oluştu", null);
            }

            return (true, "Not başarıyla güncellendi", note);
        }

        public async Task<(bool isSuccess, string message)> DeleteNoteAsync(int id, int userId)
        {
            // Notu bul
            var note = await _noteRepository.GetByIdAndUserIdAsync(id, userId);

            if (note == null)
            {
                return (false, "Not bulunamadı");
            }

            _noteRepository.Remove(note);
            bool result = await _noteRepository.SaveChangesAsync();

            if (!result)
            {
                return (false, "Not silinirken bir hata oluştu");
            }

            return (true, "Not başarıyla silindi");
        }
    }
} 