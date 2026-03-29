using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProjectManageApi.Data;

namespace ProjectManageApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CalendarController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetCalendar([FromQuery] int? projectId, [FromQuery] int year, [FromQuery] int month)
    {
        var holidays = await db.Holidays
            .Where(h => h.Date.Year == year && h.Date.Month == month)
            .Select(h => h.Date)
            .ToListAsync();

        var holidayStrings = holidays.Select(h => h.ToString("yyyy-MM-dd")).ToList();

        int workingDays = 0;
        int daysInMonth = DateTime.DaysInMonth(year, month);
        for (int day = 1; day <= daysInMonth; day++)
        {
            var date = new DateOnly(year, month, day);
            if (date.DayOfWeek != DayOfWeek.Saturday &&
                date.DayOfWeek != DayOfWeek.Sunday &&
                !holidays.Contains(date))
            {
                workingDays++;
            }
        }

        var manHoursQuery = db.ManHours
            .Include(mh => mh.Member)
            .Where(mh => mh.Year == year && mh.Month == month);

        if (projectId.HasValue)
            manHoursQuery = manHoursQuery.Where(mh => mh.ProjectId == projectId.Value);

        var manHours = await manHoursQuery.ToListAsync();

        var memberSummaries = manHours
            .GroupBy(mh => new { mh.MemberId, mh.Member.Name })
            .Select(g => new
            {
                memberId = g.Key.MemberId,
                memberName = g.Key.Name,
                plannedHours = g.Sum(mh => mh.PlannedHours),
                actualHours = g.Sum(mh => mh.ActualHours),
                workingDays,
                dailyPlannedHours = workingDays > 0
                    ? Math.Round(g.Sum(mh => mh.PlannedHours) / workingDays, 1)
                    : 0
            })
            .ToList();

        return Ok(new
        {
            year,
            month,
            holidays = holidayStrings,
            workingDays,
            members = memberSummaries
        });
    }
}
