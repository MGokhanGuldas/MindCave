using System;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace MindCave.Backend.Models
{
    public class Note
    {
        public int Id { get; set; }
        
        [Required]
        [StringLength(100)]
        public string Title { get; set; } = string.Empty;
        
        public string Content { get; set; } = string.Empty;
        
        public int UserId { get; set; }
        
        public int? WorkspaceId { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        
        public DateTime UpdatedAt { get; set; } = DateTime.Now;
        
        [JsonIgnore]
        public virtual User User { get; set; } = null!;
        
        [JsonIgnore]
        public virtual Workspace? Workspace { get; set; }
    }
} 