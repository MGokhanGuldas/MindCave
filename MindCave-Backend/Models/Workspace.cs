using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace MindCave.Backend.Models
{
    public class Workspace
    {
        public int Id { get; set; }
        
        [Required]
        [StringLength(50)]
        public string Name { get; set; } = string.Empty;
        
        public string Description { get; set; } = string.Empty;
        
        public string Color { get; set; } = "#3498db";
        
        public int UserId { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        
        public DateTime UpdatedAt { get; set; } = DateTime.Now;
        
        // İlişkiler
        [JsonIgnore]
        public virtual User User { get; set; } = null!;
        
        [JsonIgnore]
        public virtual ICollection<Note> Notes { get; set; } = new List<Note>();
    }
} 