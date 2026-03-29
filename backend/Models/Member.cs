namespace ProjectManageApi.Models;

public class Member
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? Role { get; set; }
    public double DefaultMonthlyHours { get; set; } = 160;
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public ICollection<ProjectMember> ProjectMembers { get; set; } = [];
    public ICollection<ManHour> ManHours { get; set; } = [];
}
