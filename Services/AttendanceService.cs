using Aanwezigheidssysteem.Models;
using MySqlConnector;

namespace Aanwezigheidssysteem.Services;

public sealed class AttendanceService(IConfiguration configuration)
{
    private readonly string connectionString = configuration.GetConnectionString("Attendance")
        ?? throw new InvalidOperationException("Connection string Attendance ontbreekt.");

    private MySqlConnection Connection() => new(connectionString);

    public async Task<AttendanceState> GetStateAsync(DateOnly? date = null)
    {
        var target = date ?? DateOnly.FromDateTime(DateTime.Now);
        await using var connection = Connection();
        await connection.OpenAsync();
        var students = new List<Student>();
        await using (var command = new MySqlCommand("SELECT id, naam, studentnummer, groep FROM students ORDER BY naam", connection))
        await using (var reader = await command.ExecuteReaderAsync())
            while (await reader.ReadAsync()) students.Add(new(reader.GetInt32(0), reader.GetString(1), reader.GetString(2), reader.IsDBNull(3) ? null : reader.GetString(3)));
        var groups = new List<string>();
        await using (var command = new MySqlCommand("SELECT name FROM `groups` ORDER BY name", connection))
        await using (var reader = await command.ExecuteReaderAsync())
            while (await reader.ReadAsync()) groups.Add(reader.GetString(0));
        var checkins = new List<Checkin>();
        await using (var command = new MySqlCommand("SELECT studentnummer, datum, tijd FROM checkins WHERE datum = @date ORDER BY tijd DESC", connection))
        { command.Parameters.AddWithValue("@date", target.ToDateTime(TimeOnly.MinValue)); await using var reader = await command.ExecuteReaderAsync(); while (await reader.ReadAsync()) checkins.Add(new(reader.GetString(0), DateOnly.FromDateTime(reader.GetDateTime(1)), reader.GetDateTime(2))); }
        return new(students, groups, checkins);
    }

    public async Task<ScanResult> ScanAsync(string code)
    {
        var now = DateTime.Now;
        await using var connection = Connection(); await connection.OpenAsync();
        Student? student = null;
        await using (var command = new MySqlCommand("SELECT id, naam, studentnummer, groep FROM students WHERE studentnummer = @code", connection))
        { command.Parameters.AddWithValue("@code", code); await using var reader = await command.ExecuteReaderAsync(); if (await reader.ReadAsync()) student = new(reader.GetInt32(0), reader.GetString(1), reader.GetString(2), reader.IsDBNull(3) ? null : reader.GetString(3)); }
        if (student is null) return new("onbekend", code, null, now);
        await using var existing = new MySqlCommand("SELECT tijd FROM checkins WHERE studentnummer = @code AND datum = @date", connection); existing.Parameters.AddWithValue("@code", code); existing.Parameters.AddWithValue("@date", now.Date); var value = await existing.ExecuteScalarAsync();
        if (value is null) { await using var insert = new MySqlCommand("INSERT INTO checkins (studentnummer, datum, tijd) VALUES (@code, @date, @time)", connection); insert.Parameters.AddWithValue("@code", code); insert.Parameters.AddWithValue("@date", now.Date); insert.Parameters.AddWithValue("@time", now); await insert.ExecuteNonQueryAsync(); return new("ok", null, student, now); }
        return new("dubbel", null, student, Convert.ToDateTime(value));
    }

    public async Task AddStudentAsync(string naam, string nummer, string groep) { await ExecuteAsync("INSERT INTO students (naam, studentnummer, groep) VALUES (@naam, @nummer, @groep)", ("@naam", naam), ("@nummer", nummer), ("@groep", groep)); }
    public async Task DeleteStudentAsync(int id) { await ExecuteAsync("DELETE FROM students WHERE id = @id", ("@id", id)); }
    public async Task AddGroupAsync(string name) { await ExecuteAsync("INSERT INTO `groups` (name) VALUES (@name)", ("@name", name)); }
    public async Task DeleteGroupAsync(string name) { await ExecuteAsync("UPDATE students SET groep = NULL WHERE groep = @name; DELETE FROM `groups` WHERE name = @name", ("@name", name)); }
    private async Task ExecuteAsync(string sql, params (string Name, object Value)[] parameters) { await using var connection = Connection(); await connection.OpenAsync(); await using var command = new MySqlCommand(sql, connection); foreach (var p in parameters) command.Parameters.AddWithValue(p.Name, p.Value); await command.ExecuteNonQueryAsync(); }
}
