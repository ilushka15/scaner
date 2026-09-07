export interface Student {
  id: number;
  naam: string;
  studentnummer: string;
  groep: string | null;
}

export interface Group {
  name: string;
}

export interface Checkin {
  studentnummer: string;
  datum: string;
  tijd: string;
  status: "op tijd" | "te laat";
}

export interface AttendanceState {
  students: Student[];
  groups: string[];
  checkins: Checkin[];
}

export interface ScanResult {
  type: "ok" | "dubbel" | "onbekend";
  code?: string;
  student?: Student;
  tijd?: string;
}
