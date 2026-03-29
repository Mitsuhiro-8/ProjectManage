namespace ProjectManageApi.Models;

public class Project
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }
    public ProjectStatus Status { get; set; } = ProjectStatus.Active;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public ICollection<ProjectMember> ProjectMembers { get; set; } = [];
    public ICollection<ManHour> ManHours { get; set; } = [];
}

public enum ProjectStatus
{
    Active = 0,
    Completed = 1,
    OnHold = 2
}
