namespace Aanwezigheidssysteem.Models;

public sealed record Checkin(string Studentnummer, DateOnly Datum, DateTime Tijd);
