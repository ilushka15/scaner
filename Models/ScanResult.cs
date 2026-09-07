namespace Aanwezigheidssysteem.Models;

public sealed record ScanResult(string Type, string? Code, Student? Student, DateTime Tijd);
