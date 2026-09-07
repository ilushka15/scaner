import ApiError from "../../../utils/api-error";

export interface StudentInput {
  naam: string;
  studentnummer: string;
  groep?: string | null;
}

export interface GroupInput {
  name: string;
}

export interface ScanInput {
  code: string;
}

function requiredText(value: unknown, field: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new ApiError(`${field} is verplicht.`, 400);
  }
  return value.trim();
}

export function studentInput(body: unknown): StudentInput {
  const value = body as Partial<StudentInput>;
  return {
    naam: requiredText(value?.naam, "Naam"),
    studentnummer: requiredText(value?.studentnummer, "Studentnummer"),
    groep: typeof value?.groep === "string" && value.groep.trim() ? value.groep.trim() : null
  };
}

export function groupInput(body: unknown): GroupInput {
  return { name: requiredText((body as Partial<GroupInput>)?.name, "Groepsnaam") };
}

export function scanInput(body: unknown): ScanInput {
  return { code: requiredText((body as Partial<ScanInput>)?.code, "Code") };
}
