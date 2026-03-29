namespace ProjectManageApi.Models;

public class ProjectMember
{
    public int Id { get; set; }
    public int ProjectId { get; set; }
    public int MemberId { get; set; }
    public DateTime AssignedAt { get; set; }

    public Project Project { get; set; } = null!;
    public Member Member { get; set; } = null!;
}
