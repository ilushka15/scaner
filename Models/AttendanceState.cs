namespace Aanwezigheidssysteem.Models;

public sealed record AttendanceState(IReadOnlyList<Student> Students, IReadOnlyList<string> Groups, IReadOnlyList<Checkin> Checkins);
