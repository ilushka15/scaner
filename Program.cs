using Aanwezigheidssysteem.Models;
using Aanwezigheidssysteem.Services;
using Microsoft.Extensions.FileProviders;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddSingleton<AttendanceService>();
var app = builder.Build();
var root = new PhysicalFileProvider(app.Environment.ContentRootPath);
app.UseDefaultFiles(new DefaultFilesOptions { FileProvider = root });
app.UseStaticFiles(new StaticFileOptions { FileProvider = root });

app.MapGet("/api/state", async (HttpRequest request, AttendanceService service) =>
{
    var date = request.Query["date"].FirstOrDefault();
    DateOnly? selected = string.IsNullOrWhiteSpace(date) ? null : DateOnly.Parse(date);
    return Results.Ok(await service.GetStateAsync(selected));
});
app.MapPost("/api/scan", async (ScanRequest request, AttendanceService service) =>
    string.IsNullOrWhiteSpace(request.Code) ? Results.BadRequest(new { error = "Validatie mislukt." }) : Results.Ok(await service.ScanAsync(request.Code.Trim())));
app.MapPost("/api/students", async (StudentRequest request, AttendanceService service) =>
{
    if (string.IsNullOrWhiteSpace(request.Naam) || string.IsNullOrWhiteSpace(request.Studentnummer) || string.IsNullOrWhiteSpace(request.Groep)) return Results.BadRequest(new { error = "Validatie mislukt." });
    try { await service.AddStudentAsync(request.Naam.Trim(), request.Studentnummer.Trim(), request.Groep.Trim()); return Results.Created("/api/students", new { ok = true }); }
    catch (Exception error) when (error.Message.Contains("Duplicate", StringComparison.OrdinalIgnoreCase)) { return Results.Conflict(new { error = "Dit studentnummer bestaat al." }); }
});
app.MapDelete("/api/students/{id:int}", async (int id, AttendanceService service) => { await service.DeleteStudentAsync(id); return Results.Ok(new { ok = true }); });
app.MapPost("/api/groups", async (GroupRequest request, AttendanceService service) =>
{
    if (string.IsNullOrWhiteSpace(request.Name)) return Results.BadRequest(new { error = "Validatie mislukt." });
    try { await service.AddGroupAsync(request.Name.Trim()); return Results.Created("/api/groups", new { ok = true }); }
    catch (Exception error) when (error.Message.Contains("Duplicate", StringComparison.OrdinalIgnoreCase)) { return Results.Conflict(new { error = "Deze groep bestaat al." }); }
});
app.MapDelete("/api/groups/{name}", async (string name, AttendanceService service) => { await service.DeleteGroupAsync(name); return Results.Ok(new { ok = true }); });
app.Run();

public sealed record ScanRequest(string Code);
public sealed record StudentRequest(string Naam, string Studentnummer, string Groep);
public sealed record GroupRequest(string Name);
