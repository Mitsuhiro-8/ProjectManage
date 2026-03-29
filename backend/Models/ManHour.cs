namespace ProjectManageApi.Models;

public class ManHour
{
    public int Id { get; set; }
    public int ProjectId { get; set; }
    public int MemberId { get; set; }
    public int Year { get; set; }
    public int Month { get; set; }
    public double PlannedHours { get; set; } = 0;
    public double? ActualHours { get; set; }
    public string? Memo { get; set; }
    public DateTime UpdatedAt { get; set; }

    public Project Project { get; set; } = null!;
    public Member Member { get; set; } = null!;
}
