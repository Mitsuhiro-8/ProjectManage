using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProjectManageApi.Controllers;
using ProjectManageApi.Data;
using ProjectManageApi.Models;
using Xunit;
// ProjectManageApi.Models.Task と System.Threading.Tasks.Task の衝突を回避する
using ModelTask = ProjectManageApi.Models.Task;
using TaskStatus = ProjectManageApi.Models.TaskStatus;

namespace backend.Tests.Unit.Controllers;

/// <summary>
/// TasksController のユニットテスト。
/// InMemory DB を使用してテストごとに独立した状態を保つ。
/// </summary>
public class TasksControllerTests : IDisposable
{
    private readonly AppDbContext _db;
    private readonly TasksController _controller;

    public TasksControllerTests()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        _db = new AppDbContext(options);
        _controller = new TasksController(_db);
    }

    public void Dispose() => _db.Dispose();

    // ────────────────────────────────────────────
    // テストデータ作成ヘルパー
    // ────────────────────────────────────────────

    private async System.Threading.Tasks.Task<(Project project, Member member)> SeedProjectAndMemberAsync()
    {
        var project = new Project
        {
            Name = "テストプロジェクト",
            StartDate = new DateOnly(2026, 4, 1),
            EndDate = new DateOnly(2026, 9, 30),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };
        var member = new Member
        {
            Name = "山田 太郎",
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };
        _db.Projects.Add(project);
        _db.Members.Add(member);
        await _db.SaveChangesAsync();
        return (project, member);
    }

    private async System.Threading.Tasks.Task<ModelTask> SeedTaskAsync(
        int projectId, int memberId,
        TaskStatus status = TaskStatus.Todo,
        double plannedHours = 8.0, double? actualHours = null,
        string name = "タスク1")
    {
        var task = new ModelTask
        {
            ProjectId = projectId,
            MemberId = memberId,
            Name = name,
            Status = status,
            PlannedHours = plannedHours,
            ActualHours = actualHours,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };
        _db.Tasks.Add(task);
        await _db.SaveChangesAsync();
        return task;
    }

    // ────────────────────────────────────────────
    // GET /tasks
    // ────────────────────────────────────────────

    [Fact]
    public async System.Threading.Tasks.Task GetAll_フィルタなし_全件返す()
    {
        var (proj, mem) = await SeedProjectAndMemberAsync();
        await SeedTaskAsync(proj.Id, mem.Id, name: "タスクA");
        await SeedTaskAsync(proj.Id, mem.Id, name: "タスクB");

        var result = await _controller.GetAll(null, null, null) as OkObjectResult;

        Assert.NotNull(result);
        var tasks = Assert.IsAssignableFrom<IEnumerable<ModelTask>>(result.Value);
        Assert.Equal(2, tasks.Count());
    }

    [Fact]
    public async System.Threading.Tasks.Task GetAll_projectIdフィルタ_該当プロジェクトのみ返す()
    {
        var (proj1, mem) = await SeedProjectAndMemberAsync();
        var proj2 = new Project
        {
            Name = "別プロジェクト",
            StartDate = new DateOnly(2026, 4, 1),
            EndDate = new DateOnly(2026, 9, 30),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };
        _db.Projects.Add(proj2);
        await _db.SaveChangesAsync();

        await SeedTaskAsync(proj1.Id, mem.Id, name: "proj1タスク");
        await SeedTaskAsync(proj2.Id, mem.Id, name: "proj2タスク");

        var result = await _controller.GetAll(proj1.Id, null, null) as OkObjectResult;

        Assert.NotNull(result);
        var tasks = Assert.IsAssignableFrom<IEnumerable<ModelTask>>(result.Value).ToList();
        Assert.Single(tasks);
        Assert.Equal("proj1タスク", tasks[0].Name);
    }

    [Fact]
    public async System.Threading.Tasks.Task GetAll_memberIdフィルタ_該当メンバーのみ返す()
    {
        var (proj, mem1) = await SeedProjectAndMemberAsync();
        var mem2 = new Member { Name = "佐藤 花子", IsActive = true, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow };
        _db.Members.Add(mem2);
        await _db.SaveChangesAsync();

        await SeedTaskAsync(proj.Id, mem1.Id, name: "mem1タスク");
        await SeedTaskAsync(proj.Id, mem2.Id, name: "mem2タスク");

        var result = await _controller.GetAll(null, mem1.Id, null) as OkObjectResult;

        Assert.NotNull(result);
        var tasks = Assert.IsAssignableFrom<IEnumerable<ModelTask>>(result.Value).ToList();
        Assert.Single(tasks);
        Assert.Equal("mem1タスク", tasks[0].Name);
    }

    [Fact]
    public async System.Threading.Tasks.Task GetAll_statusフィルタ_該当ステータスのみ返す()
    {
        var (proj, mem) = await SeedProjectAndMemberAsync();
        await SeedTaskAsync(proj.Id, mem.Id, status: TaskStatus.Todo, name: "未着手");
        await SeedTaskAsync(proj.Id, mem.Id, status: TaskStatus.InProgress, name: "進行中");
        await SeedTaskAsync(proj.Id, mem.Id, status: TaskStatus.Done, name: "完了");

        var result = await _controller.GetAll(null, null, TaskStatus.InProgress) as OkObjectResult;

        Assert.NotNull(result);
        var tasks = Assert.IsAssignableFrom<IEnumerable<ModelTask>>(result.Value).ToList();
        Assert.Single(tasks);
        Assert.Equal("進行中", tasks[0].Name);
    }

    // ────────────────────────────────────────────
    // GET /tasks/summary
    // ────────────────────────────────────────────

    [Fact]
    public async System.Threading.Tasks.Task GetSummary_集計結果が正しく返る()
    {
        var (proj, mem) = await SeedProjectAndMemberAsync();
        await SeedTaskAsync(proj.Id, mem.Id, plannedHours: 10.0, actualHours: 8.0, name: "T1");
        await SeedTaskAsync(proj.Id, mem.Id, plannedHours: 6.0, actualHours: null, name: "T2");

        var result = await _controller.GetSummary(proj.Id, null) as OkObjectResult;

        Assert.NotNull(result);
        var summaries = Assert.IsAssignableFrom<IEnumerable<object>>(result.Value).ToList();
        Assert.Single(summaries);

        // 匿名型は System.Text.Json.JsonElement にシリアライズされるため JsonElement で取得する
        var json = System.Text.Json.JsonSerializer.Serialize(summaries[0]);
        var elem = System.Text.Json.JsonDocument.Parse(json).RootElement;
        Assert.Equal(2, elem.GetProperty("taskCount").GetInt32());
        Assert.Equal(16.0, elem.GetProperty("plannedHours").GetDouble());
        Assert.Equal(8.0, elem.GetProperty("actualHours").GetDouble());
    }

    // ────────────────────────────────────────────
    // POST /tasks
    // ────────────────────────────────────────────

    [Fact]
    public async System.Threading.Tasks.Task Create_正常入力_タスクが作成されCreatedAtが設定される()
    {
        var (proj, mem) = await SeedProjectAndMemberAsync();
        var input = new ModelTask
        {
            ProjectId = proj.Id,
            MemberId = mem.Id,
            Name = "新しいタスク",
            PlannedHours = 16.0,
            Status = TaskStatus.Todo,
        };

        var result = await _controller.Create(input) as CreatedAtActionResult;

        Assert.NotNull(result);
        var created = Assert.IsType<ModelTask>(result.Value);
        Assert.Equal("新しいタスク", created.Name);
        Assert.NotEqual(default, created.CreatedAt);
        Assert.NotEqual(default, created.UpdatedAt);
        Assert.True(created.Id > 0);
    }

    [Fact]
    public async System.Threading.Tasks.Task Create_名前が空_BadRequestを返す()
    {
        var (proj, mem) = await SeedProjectAndMemberAsync();
        var input = new ModelTask
        {
            ProjectId = proj.Id,
            MemberId = mem.Id,
            Name = "",
            PlannedHours = 8.0,
        };

        var result = await _controller.Create(input);

        Assert.IsType<BadRequestObjectResult>(result);
    }

    [Fact]
    public async System.Threading.Tasks.Task Create_PlannedHoursが負_BadRequestを返す()
    {
        var (proj, mem) = await SeedProjectAndMemberAsync();
        var input = new ModelTask
        {
            ProjectId = proj.Id,
            MemberId = mem.Id,
            Name = "タスク",
            PlannedHours = -1.0,
        };

        var result = await _controller.Create(input);

        Assert.IsType<BadRequestObjectResult>(result);
    }

    // ────────────────────────────────────────────
    // PUT /tasks/{id}
    // ────────────────────────────────────────────

    [Fact]
    public async System.Threading.Tasks.Task Update_正常入力_スカラー値が更新される()
    {
        var (proj, mem) = await SeedProjectAndMemberAsync();
        var task = await SeedTaskAsync(proj.Id, mem.Id, name: "旧タスク名", plannedHours: 8.0);

        var updateInput = new ModelTask
        {
            Id = task.Id,
            ProjectId = proj.Id,
            MemberId = mem.Id,
            Name = "新タスク名",
            Status = TaskStatus.InProgress,
            PlannedHours = 16.0,
            ActualHours = 10.0,
        };

        var result = await _controller.Update(task.Id, updateInput);

        Assert.IsType<NoContentResult>(result);
        var updated = await _db.Tasks.FindAsync(task.Id);
        Assert.Equal("新タスク名", updated!.Name);
        Assert.Equal(TaskStatus.InProgress, updated.Status);
        Assert.Equal(16.0, updated.PlannedHours);
        Assert.Equal(10.0, updated.ActualHours);
    }

    [Fact]
    public async System.Threading.Tasks.Task Update_存在しないId_NotFoundを返す()
    {
        var input = new ModelTask { Id = 999, Name = "x", PlannedHours = 1 };
        var result = await _controller.Update(999, input);
        Assert.IsType<NotFoundResult>(result);
    }

    [Fact]
    public async System.Threading.Tasks.Task Update_IdミスマッチURLとBody_BadRequestを返す()
    {
        var input = new ModelTask { Id = 2, Name = "x", PlannedHours = 1 };
        var result = await _controller.Update(1, input);
        Assert.IsType<BadRequestResult>(result);
    }

    // ────────────────────────────────────────────
    // DELETE /tasks/{id}
    // ────────────────────────────────────────────

    [Fact]
    public async System.Threading.Tasks.Task Delete_存在するId_タスクが削除される()
    {
        var (proj, mem) = await SeedProjectAndMemberAsync();
        var task = await SeedTaskAsync(proj.Id, mem.Id);

        var result = await _controller.Delete(task.Id);

        Assert.IsType<NoContentResult>(result);
        Assert.Null(await _db.Tasks.FindAsync(task.Id));
    }

    [Fact]
    public async System.Threading.Tasks.Task Delete_存在しないId_NotFoundを返す()
    {
        var result = await _controller.Delete(999);
        Assert.IsType<NotFoundResult>(result);
    }
}
