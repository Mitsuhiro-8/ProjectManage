using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProjectManageApi.Data;
using ProjectManageApi.Models;

namespace ProjectManageApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ManHoursController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] int? projectId, [FromQuery] int? year, [FromQuery] int? month)
    {
        var query = db.ManHours
            .Include(mh => mh.Member)
            .Include(mh => mh.Project)
            .AsQueryable();

        if (projectId.HasValue) query = query.Where(mh => mh.ProjectId == projectId.Value);
        if (year.HasValue) query = query.Where(mh => mh.Year == year.Value);
        if (month.HasValue) query = query.Where(mh => mh.Month == month.Value);

        var result = await query.OrderBy(mh => mh.Year).ThenBy(mh => mh.Month).ToListAsync();
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var mh = await db.ManHours
            .Include(m => m.Member)
            .Include(m => m.Project)
            .FirstOrDefaultAsync(m => m.Id == id);
        return mh is null ? NotFound() : Ok(mh);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] ManHour manHour)
    {
        var existing = await db.ManHours.FirstOrDefaultAsync(mh =>
            mh.ProjectId == manHour.ProjectId &&
            mh.MemberId == manHour.MemberId &&
            mh.Year == manHour.Year &&
            mh.Month == manHour.Month);

        if (existing is not null)
        {
            existing.PlannedHours = manHour.PlannedHours;
            existing.ActualHours = manHour.ActualHours;
            existing.Memo = manHour.Memo;
            existing.UpdatedAt = DateTime.UtcNow;
            await db.SaveChangesAsync();
            return Ok(existing);
        }

        manHour.UpdatedAt = DateTime.UtcNow;
        db.ManHours.Add(manHour);
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = manHour.Id }, manHour);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] ManHour manHour)
    {
        if (id != manHour.Id) return BadRequest();
        // Member・Project のナビゲーションプロパティを Modified にしないよう既存エンティティを取得して上書き
        var existing = await db.ManHours.FindAsync(id);
        if (existing is null) return NotFound();
        existing.PlannedHours = manHour.PlannedHours;
        existing.ActualHours = manHour.ActualHours;
        existing.Memo = manHour.Memo;
        existing.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var mh = await db.ManHours.FindAsync(id);
        if (mh is null) return NotFound();
        db.ManHours.Remove(mh);
        await db.SaveChangesAsync();
        return NoContent();
    }

    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary([FromQuery] int memberId, [FromQuery] int year)
    {
        var records = await db.ManHours
            .Where(mh => mh.MemberId == memberId && mh.Year == year)
            .Include(mh => mh.Project)
            .OrderBy(mh => mh.Month)
            .ToListAsync();
        return Ok(records);
    }
}
