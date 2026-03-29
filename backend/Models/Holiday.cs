namespace ProjectManageApi.Models;

public class Holiday
{
    public int Id { get; set; }
    public DateOnly Date { get; set; }
    public string Name { get; set; } = string.Empty;
    public HolidayType Type { get; set; } = HolidayType.National;
}

public enum HolidayType
{
    National = 0,
    Company = 1
}
