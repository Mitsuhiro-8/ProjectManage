using Microsoft.EntityFrameworkCore;
using ProjectManageApi.Models;

namespace ProjectManageApi.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Project> Projects { get; set; }
    public DbSet<Member> Members { get; set; }
    public DbSet<ProjectMember> ProjectMembers { get; set; }
    public DbSet<ManHour> ManHours { get; set; }
    public DbSet<Holiday> Holidays { get; set; }
    public DbSet<ProjectManageApi.Models.Task> Tasks { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<ProjectMember>()
            .HasIndex(pm => new { pm.ProjectId, pm.MemberId })
            .IsUnique();

        modelBuilder.Entity<ManHour>()
            .HasIndex(mh => new { mh.ProjectId, mh.MemberId, mh.Year, mh.Month })
            .IsUnique();

        modelBuilder.Entity<Holiday>()
            .HasIndex(h => h.Date)
            .IsUnique();

        modelBuilder.Entity<Project>()
            .Property(p => p.Status)
            .HasConversion<int>();

        modelBuilder.Entity<Holiday>()
            .Property(h => h.Type)
            .HasConversion<int>();

        modelBuilder.Entity<ProjectManageApi.Models.Task>()
            .Property(t => t.Status)
            .HasConversion<int>();
    }
}
