using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProjectManageApi.Data;
using ProjectManageApi.Models;

namespace ProjectManageApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProjectsController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var projects = await db.Projects
            .Include(p => p.ProjectMembers)
                .ThenInclude(pm => pm.Member)
            .OrderBy(p => p.StartDate)
            .ToListAsync();
        return Ok(projects);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var project = await db.Projects
            .Include(p => p.ProjectMembers)
                .ThenInclude(pm => pm.Member)
            .FirstOrDefaultAsync(p => p.Id == id);
        return project is null ? NotFound() : Ok(project);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Project project)
    {
        project.CreatedAt = DateTime.UtcNow;
        project.UpdatedAt = DateTime.UtcNow;
        db.Projects.Add(project);
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = project.Id }, project);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] Project project)
    {
        if (id != project.Id) return BadRequest();
        // EntityState.Modified を全体に適用するとナビゲーションプロパティが誤って変更されるため、
        // FindAsync で既存エンティティを取得してスカラー値のみ上書きする
        var existing = await db.Projects.FindAsync(id);
        if (existing is null) return NotFound();
        existing.Name = project.Name;
        existing.Description = project.Description;
        existing.StartDate = project.StartDate;
        existing.EndDate = project.EndDate;
        existing.Status = project.Status;
        existing.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var project = await db.Projects.FindAsync(id);
        if (project is null) return NotFound();
        db.Projects.Remove(project);
        await db.SaveChangesAsync();
        return NoContent();
    }

    [HttpGet("{id}/members")]
    public async Task<IActionResult> GetMembers(int id)
    {
        var members = await db.ProjectMembers
            .Where(pm => pm.ProjectId == id)
            .Include(pm => pm.Member)
            .Select(pm => pm.Member)
            .ToListAsync();
        return Ok(members);
    }

    [HttpPost("{id}/members/{memberId}")]
    public async Task<IActionResult> AssignMember(int id, int memberId)
    {
        var exists = await db.ProjectMembers
            .AnyAsync(pm => pm.ProjectId == id && pm.MemberId == memberId);
        if (exists) return Conflict("既にアサイン済みです。");

        var pm = new ProjectMember
        {
            ProjectId = id,
            MemberId = memberId,
            AssignedAt = DateTime.UtcNow
        };
        db.ProjectMembers.Add(pm);
        await db.SaveChangesAsync();
        return Ok(pm);
    }

    [HttpDelete("{id}/members/{memberId}")]
    public async Task<IActionResult> RemoveMember(int id, int memberId)
    {
        var pm = await db.ProjectMembers
            .FirstOrDefaultAsync(pm => pm.ProjectId == id && pm.MemberId == memberId);
        if (pm is null) return NotFound();
        db.ProjectMembers.Remove(pm);
        await db.SaveChangesAsync();
        return NoContent();
    }
}
