using Microsoft.EntityFrameworkCore;
using MindCave.Backend.Models;

namespace MindCave.Backend.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Note> Notes { get; set; }
        public DbSet<Workspace> Workspaces { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // User - Note ilişkisi
            modelBuilder.Entity<Note>()
                .HasOne(n => n.User)
                .WithMany(u => u.Notes)
                .HasForeignKey(n => n.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // User - Workspace ilişkisi
            modelBuilder.Entity<Workspace>()
                .HasOne(w => w.User)
                .WithMany(u => u.Workspaces)
                .HasForeignKey(w => w.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // Workspace - Note ilişkisi
            modelBuilder.Entity<Note>()
                .HasOne(n => n.Workspace)
                .WithMany(w => w.Notes)
                .HasForeignKey(n => n.WorkspaceId)
                .OnDelete(DeleteBehavior.ClientSetNull);
        }
    }
} 