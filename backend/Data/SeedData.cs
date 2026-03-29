using ProjectManageApi.Models;

namespace ProjectManageApi.Data;

public static class SeedData
{
    public static void Initialize(AppDbContext db)
    {
        if (db.Members.Any()) return;

        var now = DateTime.UtcNow;

        // メンバー
        var members = new[]
        {
            new Member { Name = "山田 太郎", Email = "yamada@example.com", Role = "PM",  DefaultMonthlyHours = 160, IsActive = true, CreatedAt = now, UpdatedAt = now },
            new Member { Name = "佐藤 花子", Email = "sato@example.com",   Role = "Dev", DefaultMonthlyHours = 160, IsActive = true, CreatedAt = now, UpdatedAt = now },
            new Member { Name = "鈴木 一郎", Email = "suzuki@example.com", Role = "Dev", DefaultMonthlyHours = 140, IsActive = true, CreatedAt = now, UpdatedAt = now },
            new Member { Name = "田中 美咲", Email = "tanaka@example.com", Role = "QA",  DefaultMonthlyHours = 120, IsActive = true, CreatedAt = now, UpdatedAt = now },
        };
        db.Members.AddRange(members);
        db.SaveChanges();

        // プロジェクト
        var projects = new[]
        {
            new Project
            {
                Name = "ECサイトリニューアル",
                Description = "既存ECサイトのフルリプレース。React + .NET 構成。",
                StartDate = new DateOnly(2026, 1, 1),
                EndDate   = new DateOnly(2026, 6, 30),
                Status    = ProjectStatus.Active,
                CreatedAt = now, UpdatedAt = now,
            },
            new Project
            {
                Name = "社内勤怠システム改修",
                Description = "レガシー勤怠システムのUI刷新とAPI整備。",
                StartDate = new DateOnly(2026, 2, 1),
                EndDate   = new DateOnly(2026, 4, 30),
                Status    = ProjectStatus.Active,
                CreatedAt = now, UpdatedAt = now,
            },
            new Project
            {
                Name = "データ分析基盤構築",
                Description = "DWH整備とダッシュボード作成。",
                StartDate = new DateOnly(2025, 10, 1),
                EndDate   = new DateOnly(2026, 3, 31),
                Status    = ProjectStatus.Completed,
                CreatedAt = now, UpdatedAt = now,
            },
        };
        db.Projects.AddRange(projects);
        db.SaveChanges();

        // メンバーアサイン
        var assigns = new[]
        {
            new ProjectMember { ProjectId = projects[0].Id, MemberId = members[0].Id, AssignedAt = now },
            new ProjectMember { ProjectId = projects[0].Id, MemberId = members[1].Id, AssignedAt = now },
            new ProjectMember { ProjectId = projects[0].Id, MemberId = members[2].Id, AssignedAt = now },
            new ProjectMember { ProjectId = projects[1].Id, MemberId = members[0].Id, AssignedAt = now },
            new ProjectMember { ProjectId = projects[1].Id, MemberId = members[3].Id, AssignedAt = now },
            new ProjectMember { ProjectId = projects[2].Id, MemberId = members[1].Id, AssignedAt = now },
            new ProjectMember { ProjectId = projects[2].Id, MemberId = members[2].Id, AssignedAt = now },
        };
        db.ProjectMembers.AddRange(assigns);
        db.SaveChanges();

        // 工数データ (2026年 2〜4月)
        var manHours = new List<ManHour>();
        foreach (var (projectIndex, memberIndex, month, planned, actual) in new[]
        {
            // ECサイトリニューアル
            (0, 0, 2,  40.0, (double?)38.0),
            (0, 1, 2, 160.0, 155.0),
            (0, 2, 2, 120.0, 118.0),
            (0, 0, 3,  40.0,  null),
            (0, 1, 3, 160.0,  null),
            (0, 2, 3, 140.0,  null),
            (0, 0, 4,  40.0,  null),
            (0, 1, 4, 160.0,  null),
            (0, 2, 4, 140.0,  null),
            // 社内勤怠システム改修
            (1, 0, 2,  40.0,  36.0),
            (1, 3, 2,  80.0,  78.0),
            (1, 0, 3,  40.0,  null),
            (1, 3, 3,  80.0,  null),
            (1, 0, 4,  20.0,  null),
            (1, 3, 4,  40.0,  null),
            // データ分析基盤構築
            (2, 1, 2,  80.0,  80.0),
            (2, 2, 2,  60.0,  58.0),
            (2, 1, 3,  40.0,  40.0),
            (2, 2, 3,  30.0,  30.0),
        })
        {
            manHours.Add(new ManHour
            {
                ProjectId    = projects[projectIndex].Id,
                MemberId     = members[memberIndex].Id,
                Year         = 2026,
                Month        = month,
                PlannedHours = planned,
                ActualHours  = actual,
                UpdatedAt    = now,
            });
        }
        db.ManHours.AddRange(manHours);
        db.SaveChanges();
    }
}
