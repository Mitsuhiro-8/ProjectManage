using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProjectManageApi.Data;
using ProjectManageApi.Models;

namespace ProjectManageApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MembersController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var members = await db.Members
            .Where(m => m.IsActive)
            .OrderBy(m => m.Name)
            .ToListAsync();
        return Ok(members);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var member = await db.Members.FindAsync(id);
        return member is null ? NotFound() : Ok(member);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Member member)
    {
        member.CreatedAt = DateTime.UtcNow;
        member.UpdatedAt = DateTime.UtcNow;
        db.Members.Add(member);
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = member.Id }, member);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] Member member)
    {
        if (id != member.Id) return BadRequest();
        // EntityState.Modified はナビゲーションプロパティへの意図しない変更を防ぐため使わない
        var existing = await db.Members.FindAsync(id);
        if (existing is null) return NotFound();
        existing.Name = member.Name;
        existing.Email = member.Email;
        existing.Role = member.Role;
        existing.DefaultMonthlyHours = member.DefaultMonthlyHours;
        existing.IsActive = member.IsActive;
        existing.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var member = await db.Members.FindAsync(id);
        if (member is null) return NotFound();
        member.IsActive = false;
        member.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
        return NoContent();
    }

    [HttpGet("{id}/projects")]
    public async Task<IActionResult> GetProjects(int id)
    {
        var projects = await db.ProjectMembers
            .Where(pm => pm.MemberId == id)
            .Include(pm => pm.Project)
            .Select(pm => pm.Project)
            .ToListAsync();
        return Ok(projects);
    }
}
