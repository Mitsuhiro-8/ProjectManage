namespace ProjectManageApi.Models;

public class Task
{
    public int Id { get; set; }
    public int ProjectId { get; set; }
    public int MemberId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public TaskStatus Status { get; set; } = TaskStatus.Todo;
    public double PlannedHours { get; set; } = 0;
    public double? ActualHours { get; set; }
    public DateOnly? StartDate { get; set; }
    public DateOnly? EndDate { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public Project Project { get; set; } = null!;
    public Member Member { get; set; } = null!;
}

public enum TaskStatus
{
    Todo = 0,
    InProgress = 1,
    Done = 2,
}
