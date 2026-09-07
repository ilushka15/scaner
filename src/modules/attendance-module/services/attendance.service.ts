import database, { DatabaseResult } from "../../../utils/database";
import ApiError from "../../../utils/api-error";
import { AttendanceState, Checkin, Group, ScanResult, Student } from "../models/attendance.models";
import { GroupInput, StudentInput } from "../dto/attendance.dto";

export default class AttendanceService {
  public async getState(date = new Date().toISOString().slice(0, 10)): Promise<AttendanceState> {
    this.validateDate(date);
    const students = await database.query<Student[]>("SELECT id, naam, studentnummer, groep FROM students ORDER BY naam");
    const groups = await database.query<Group[]>("SELECT name FROM `groups` ORDER BY name");
    const checkins = await database.query<Checkin[]>(
      "SELECT studentnummer, DATE_FORMAT(datum, '%Y-%m-%d') AS datum, DATE_FORMAT(tijd, '%H:%i:%s') AS tijd, CASE WHEN TIME(tijd) <= '08:45:00' THEN 'op tijd' ELSE 'te laat' END AS status FROM checkins WHERE datum = ? ORDER BY tijd DESC",
      [date]
    );
    return { students, groups: groups.map((group) => group.name), checkins };
  }

  public async getStudents(): Promise<Student[]> {
    return database.query<Student[]>("SELECT id, naam, studentnummer, groep FROM students ORDER BY naam");
  }

  public async getStudent(id: number): Promise<Student> {
    const rows = await database.query<Student[]>("SELECT id, naam, studentnummer, groep FROM students WHERE id = ?", [id]);
    if (rows.length === 0) throw new ApiError("Student niet gevonden.", 404);
    return rows[0];
  }

  public async addStudent(input: StudentInput): Promise<Student> {
    try {
      const result = await database.query<DatabaseResult>("INSERT INTO students (naam, studentnummer, groep) VALUES (?, ?, ?)", [input.naam, input.studentnummer, input.groep]);
      return this.getStudent(result.insertId);
    } catch (error) {
      if ((error as { code?: string }).code === "ER_DUP_ENTRY") throw new ApiError("Dit studentnummer bestaat al.", 409);
      throw error;
    }
  }

  public async updateStudent(id: number, input: StudentInput): Promise<Student> {
    const result = await database.query<DatabaseResult>("UPDATE students SET naam = ?, studentnummer = ?, groep = ? WHERE id = ?", [input.naam, input.studentnummer, input.groep, id]);
    if (result.affectedRows === 0) throw new ApiError("Student niet gevonden.", 404);
    return this.getStudent(id);
  }

  public async deleteStudent(id: number): Promise<void> {
    const result = await database.query<DatabaseResult>("DELETE FROM students WHERE id = ?", [id]);
    if (result.affectedRows === 0) throw new ApiError("Student niet gevonden.", 404);
  }

  public async getGroups(): Promise<string[]> {
    const groups = await database.query<Group[]>("SELECT name FROM `groups` ORDER BY name");
    return groups.map((group) => group.name);
  }

  public async addGroup(input: GroupInput): Promise<string> {
    try {
      await database.query<DatabaseResult>("INSERT INTO `groups` (name) VALUES (?)", [input.name]);
      return input.name;
    } catch (error) {
      if ((error as { code?: string }).code === "ER_DUP_ENTRY") throw new ApiError("Deze groep bestaat al.", 409);
      throw error;
    }
  }

  public async deleteGroup(name: string): Promise<void> {
    const result = await database.query<DatabaseResult>("DELETE FROM `groups` WHERE name = ?", [name]);
    if (result.affectedRows === 0) throw new ApiError("Groep niet gevonden.", 404);
  }

  public async scan(code: string): Promise<ScanResult> {
    const students = await database.query<Student[]>("SELECT id, naam, studentnummer, groep FROM students WHERE studentnummer = ?", [code]);
    if (students.length === 0) return { type: "onbekend", code };
    const student = students[0];
    const existing = await database.query<Checkin[]>("SELECT DATE_FORMAT(tijd, '%H:%i:%s') AS tijd FROM checkins WHERE studentnummer = ? AND datum = CURDATE()", [code]);
    if (existing.length > 0) return { type: "dubbel", student, tijd: existing[0].tijd };
    await database.query<DatabaseResult>("INSERT INTO checkins (studentnummer, datum, tijd) VALUES (?, CURDATE(), NOW())", [code]);
    return { type: "ok", student, tijd: new Date().toTimeString().slice(0, 8) };
  }

  private validateDate(date: string): void {
    const parsed = new Date(`${date}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(parsed.getTime()) || parsed > today) {
      throw new ApiError("Kies een geldige datum tot en met vandaag.", 400);
    }
  }
}
