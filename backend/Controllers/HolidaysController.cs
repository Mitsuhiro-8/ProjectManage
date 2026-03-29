using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProjectManageApi.Data;
using ProjectManageApi.Models;

namespace ProjectManageApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HolidaysController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] int? year, [FromQuery] int? month)
    {
        var query = db.Holidays.AsQueryable();
        if (year.HasValue) query = query.Where(h => h.Date.Year == year.Value);
        if (month.HasValue) query = query.Where(h => h.Date.Month == month.Value);
        var holidays = await query.OrderBy(h => h.Date).ToListAsync();
        return Ok(holidays);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Holiday holiday)
    {
        var exists = await db.Holidays.AnyAsync(h => h.Date == holiday.Date);
        if (exists) return Conflict("その日付はすでに登録されています。");
        db.Holidays.Add(holiday);
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetAll), holiday);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var holiday = await db.Holidays.FindAsync(id);
        if (holiday is null) return NotFound();
        db.Holidays.Remove(holiday);
        await db.SaveChangesAsync();
        return NoContent();
    }

    [HttpPost("seed/{year}")]
    public async Task<IActionResult> SeedNationalHolidays(int year)
    {
        // 春分・秋分の計算式は 1980〜2099 年の範囲のみ正確
        if (year < 1980 || year > 2099)
            return BadRequest("year は 1980〜2099 の範囲で指定してください。");

        var holidays = JapanHolidayCalculator.Calculate(year);
        // ループ内で AnyAsync を呼ぶと N+1 クエリになるため、対象年の既存日付を一括取得して HashSet で重複チェック
        var existingDates = await db.Holidays
            .Where(h => h.Date.Year == year)
            .Select(h => h.Date)
            .ToHashSetAsync();
        var toAdd = holidays.Where(h => !existingDates.Contains(h.Date)).ToList();
        db.Holidays.AddRange(toAdd);
        await db.SaveChangesAsync();
        return Ok(new { added = toAdd.Count });
    }
}

public static class JapanHolidayCalculator
{
    public static List<Holiday> Calculate(int year)
    {
        var list = new List<Holiday>();

        void Add(DateOnly date, string name)
        {
            list.Add(new Holiday { Date = date, Name = name, Type = HolidayType.National });
        }

        // 固定祝日
        Add(new DateOnly(year, 1, 1), "元日");
        Add(new DateOnly(year, 2, 11), "建国記念の日");
        Add(new DateOnly(year, 2, 23), "天皇誕生日");
        Add(new DateOnly(year, 4, 29), "昭和の日");
        Add(new DateOnly(year, 5, 3), "憲法記念日");
        Add(new DateOnly(year, 5, 4), "みどりの日");
        Add(new DateOnly(year, 5, 5), "こどもの日");
        Add(new DateOnly(year, 8, 11), "山の日");
        Add(new DateOnly(year, 11, 3), "文化の日");
        Add(new DateOnly(year, 11, 23), "勤労感謝の日");

        // 成人の日（1月第2月曜日）
        Add(GetNthWeekday(year, 1, DayOfWeek.Monday, 2), "成人の日");
        // 海の日（7月第3月曜日）
        Add(GetNthWeekday(year, 7, DayOfWeek.Monday, 3), "海の日");
        // 敬老の日（9月第3月曜日）
        Add(GetNthWeekday(year, 9, DayOfWeek.Monday, 3), "敬老の日");
        // スポーツの日（10月第2月曜日）
        Add(GetNthWeekday(year, 10, DayOfWeek.Monday, 2), "スポーツの日");

        // 春分の日
        Add(new DateOnly(year, 3, CalcShunbun(year)), "春分の日");
        // 秋分の日
        Add(new DateOnly(year, 9, CalcShubun(year)), "秋分の日");

        // 振替休日の追加
        var originals = list.Select(h => h.Date).ToHashSet();
        var substitutes = new List<Holiday>();
        foreach (var h in list)
        {
            if (h.Date.DayOfWeek == DayOfWeek.Sunday)
            {
                var substitute = h.Date.AddDays(1);
                while (originals.Contains(substitute) || substitute.DayOfWeek == DayOfWeek.Sunday)
                    substitute = substitute.AddDays(1);
                substitutes.Add(new Holiday { Date = substitute, Name = "振替休日", Type = HolidayType.National });
            }
        }
        list.AddRange(substitutes);

        return list.OrderBy(h => h.Date).ToList();
    }

    private static DateOnly GetNthWeekday(int year, int month, DayOfWeek dow, int nth)
    {
        var date = new DateOnly(year, month, 1);
        int count = 0;
        while (true)
        {
            if (date.DayOfWeek == dow) count++;
            if (count == nth) return date;
            date = date.AddDays(1);
        }
    }

    private static int CalcShunbun(int year)
    {
        double x = 20.8431 + 0.242194 * (year - 1980) - Math.Floor((year - 1980) / 4.0);
        return (int)Math.Floor(x);
    }

    private static int CalcShubun(int year)
    {
        double x = 23.2488 + 0.242194 * (year - 1980) - Math.Floor((year - 1980) / 4.0);
        return (int)Math.Floor(x);
    }
}
