using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProjectManageApi.Data;
using ProjectManageApi.Models;
using TaskStatus = ProjectManageApi.Models.TaskStatus;

namespace ProjectManageApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TasksController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] int? projectId,
        [FromQuery] int? memberId,
        [FromQuery] TaskStatus? status)
    {
        var query = db.Tasks
            .Include(t => t.Project)
            .Include(t => t.Member)
            .AsQueryable();

        if (projectId.HasValue)
            query = query.Where(t => t.ProjectId == projectId.Value);
        if (memberId.HasValue)
            query = query.Where(t => t.MemberId == memberId.Value);
        if (status.HasValue)
            query = query.Where(t => t.Status == status.Value);

        var tasks = await query.OrderBy(t => t.CreatedAt).ToListAsync();
        return Ok(tasks);
    }

    // {id} より先にマッチさせるため GetById より前に定義する
    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary(
        [FromQuery] int? projectId,
        [FromQuery] int? memberId)
    {
        var query = db.Tasks
            .Include(t => t.Project)
            .Include(t => t.Member)
            .AsQueryable();

        if (projectId.HasValue)
            query = query.Where(t => t.ProjectId == projectId.Value);
        if (memberId.HasValue)
            query = query.Where(t => t.MemberId == memberId.Value);

        var summary = await query
            .GroupBy(t => new { t.ProjectId, t.Project.Name, t.MemberId, MemberName = t.Member.Name })
            .Select(g => new
            {
                projectId = g.Key.ProjectId,
                projectName = g.Key.Name,
                memberId = g.Key.MemberId,
                memberName = g.Key.MemberName,
                taskCount = g.Count(),
                plannedHours = g.Sum(t => t.PlannedHours),
                actualHours = g.Sum(t => t.ActualHours ?? 0.0),
            })
            .ToListAsync();

        return Ok(summary);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var task = await db.Tasks
            .Include(t => t.Project)
            .Include(t => t.Member)
            .FirstOrDefaultAsync(t => t.Id == id);
        return task is null ? NotFound() : Ok(task);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Models.Task task)
    {
        if (string.IsNullOrWhiteSpace(task.Name))
            return BadRequest("タスク名は必須です。");
        if (task.PlannedHours < 0)
            return BadRequest("予定工数は0以上で入力してください。");
        if (task.ActualHours.HasValue && task.ActualHours.Value < 0)
            return BadRequest("実績工数は0以上で入力してください。");

        task.CreatedAt = DateTime.UtcNow;
        task.UpdatedAt = DateTime.UtcNow;
        db.Tasks.Add(task);
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = task.Id }, task);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] Models.Task task)
    {
        if (id != task.Id) return BadRequest();

        // EntityState.Modified はナビゲーションプロパティへの意図しない変更を防ぐため使わない
        var existing = await db.Tasks.FindAsync(id);
        if (existing is null) return NotFound();

        existing.Name = task.Name;
        existing.Description = task.Description;
        existing.Status = task.Status;
        existing.PlannedHours = task.PlannedHours;
        existing.ActualHours = task.ActualHours;
        existing.StartDate = task.StartDate;
        existing.EndDate = task.EndDate;
        existing.MemberId = task.MemberId;
        existing.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var task = await db.Tasks.FindAsync(id);
        if (task is null) return NotFound();
        db.Tasks.Remove(task);
        await db.SaveChangesAsync();
        return NoContent();
    }
}
