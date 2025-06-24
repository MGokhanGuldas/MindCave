using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace MindCave.Backend.Models
{
    public class User
    {
        public int Id { get; set; }
        
        [Required]
        [StringLength(50)]
        public string Username { get; set; } = string.Empty;
        
        [Required]
        [EmailAddress]
        [StringLength(100)]
        public string Email { get; set; } = string.Empty;
        
        [Required]
        [StringLength(100)]
        [JsonIgnore]
        public string Password { get; set; } = string.Empty;
        
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        
        public string Role { get; set; } = "User";
        
        // İlişkiler
        [JsonIgnore]
        public virtual ICollection<Note> Notes { get; set; } = new List<Note>();
        [JsonIgnore]
        public virtual ICollection<Workspace> Workspaces { get; set; } = new List<Workspace>();
    }
} 