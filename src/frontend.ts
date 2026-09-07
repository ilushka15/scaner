type Page = "scan" | "dashboard";
type Tab = "overview" | "manage";
type FeedbackType = "success" | "error";

interface Student {
  id: number;
  naam: string;
  studentnummer: string;
  groep: string | null;
}

interface Checkin {
  studentnummer: string;
  datum: string;
  tijd: string;
  status: "op tijd" | "te laat";
}

interface AttendanceState {
  students: Student[];
  groups: string[];
  checkins: Checkin[];
}

interface ScanResult {
  type: "ok" | "dubbel" | "onbekend";
  code?: string;
  student?: Student;
  tijd?: string;
}

interface AppState {
  page: Page;
  tab: Tab;
  date: string;
  group: string;
  search: string;
  lateOnly: boolean;
  data: AttendanceState;
}

const app = document.querySelector<HTMLElement>("#app");
const today = new Date().toISOString().slice(0, 10);
const state: AppState = {
  page: "scan",
  tab: "overview",
  date: today,
  group: "",
  search: "",
  lateOnly: false,
  data: { students: [], groups: [], checkins: [] }
};

async function api<T>(path: string, options: RequestInit = {}): Promise<T | null> {
  const response = await fetch(`/api/v1/attendance${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options
  });

  if (response.status === 204) return null;
  const body = await response.json() as { message?: string } & T;
  if (!response.ok) throw new Error(body.message ?? "Er is iets misgegaan.");
  return body;
}

function escapeHtml(value: unknown): string {
  return String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character] ?? character);
}

function dateLabel(value: string): string {
  return new Intl.DateTimeFormat("nl-NL", {
    weekday: "long",
    day: "numeric",
    month: "long"
  }).format(new Date(`${value}T12:00:00`));
}

async function load(): Promise<void> {
  const result = await api<AttendanceState>(`/state?date=${encodeURIComponent(state.date)}`);
  if (result) state.data = result;
  render();
}

function showError(error: unknown): void {
  const message = error instanceof Error ? error.message : "Er is iets misgegaan.";
  const feedback = document.querySelector<HTMLElement>("#feedback");
  if (feedback) {
    feedback.textContent = message;
    feedback.className = "feedback error";
  } else {
    window.alert(message);
  }
}

function render(): void {
  if (!app) return;
  app.innerHTML = state.page === "scan" ? scanView() : dashboardView();
}

function scanView(): string {
  const rows = state.data.checkins.map((checkin) => {
    const student = state.data.students.find((item) => item.studentnummer === checkin.studentnummer);
    const statusClass = checkin.status === "te laat" ? "late" : "on-time";
    return `<div class="mini-row"><span>${escapeHtml(student?.naam ?? checkin.studentnummer)}</span><span class="status ${statusClass}">${checkin.tijd} · ${escapeHtml(checkin.status)}</span></div>`;
  }).join("");

  return `<section class="screen scan-hero">
    <p class="eyebrow">Scanstation</p>
    <h1>Houd je pas voor de scanner</h1>
    <p>Of voer je studentnummer handmatig in als scannen niet lukt.</p>
    <div class="scan-box"><div><strong>Wachten op scan...</strong><span>De scanner is klaar</span></div></div>
    <form class="scan-form" id="scanForm">
      <input id="scanCode" autocomplete="off" placeholder="Typ een studentnummer, bv. 252272" autofocus>
      <button>Scan</button>
    </form>
    <div id="feedback" class="feedback"></div>
    <div class="today-list"><h3>Vandaag ingecheckt (${state.data.checkins.length})</h3>${rows || "<p>Nog niemand ingecheckt vandaag.</p>"}</div>
  </section>`;
}

function dashboardView(): string {
  return `<section class="screen">
    <p class="eyebrow">Dashboard</p>
    <h1>Overzicht en beheer</h1>
    <div class="tabs">
      <button data-action="tab" data-tab="overview" class="${state.tab === "overview" ? "active" : ""}">Dagoverzicht</button>
      <button data-action="tab" data-tab="manage" class="${state.tab === "manage" ? "active" : ""}">Studenten en groepen</button>
    </div>
    ${state.tab === "overview" ? overviewView() : manageView()}
  </section>`;
}

function overviewView(): string {
  const filtered = state.data.students.filter((student) => {
    const checkin = state.data.checkins.find((item) => item.studentnummer === student.studentnummer);
    const text = `${student.naam} ${student.studentnummer}`.toLowerCase();
    return (!state.group || student.groep === state.group)
      && (!state.search || text.includes(state.search.toLowerCase()))
      && (!state.lateOnly || checkin?.status === "te laat");
  });
  const present = filtered.filter((student) => state.data.checkins.some((item) => item.studentnummer === student.studentnummer)).length;
  const rows = filtered.map((student) => {
    const checkin = state.data.checkins.find((item) => item.studentnummer === student.studentnummer);
    const status = checkin?.status ?? "afwezig";
    const statusClass = status === "te laat" ? "late" : status === "op tijd" ? "on-time" : "absent";
    return `<tr><td><strong>${escapeHtml(student.naam)}</strong><br><small>${escapeHtml(student.studentnummer)}</small></td><td>${escapeHtml(student.groep ?? "Geen groep")}</td><td>${checkin?.tijd ?? "-"}</td><td><span class="status ${statusClass}">${escapeHtml(status)}</span></td></tr>`;
  }).join("");

  const groups = state.data.groups.map((group) => `<option value="${escapeHtml(group)}" ${state.group === group ? "selected" : ""}>${escapeHtml(group)}</option>`).join("");
  return `<div class="toolbar">
    <div><label for="date">Datum</label><input id="date" type="date" max="${today}" value="${state.date}"></div>
    <label class="check"><input id="lateOnly" type="checkbox" ${state.lateOnly ? "checked" : ""}> Toon alleen te laat</label>
    <div><label for="search">Zoeken</label><input id="search" value="${escapeHtml(state.search)}" placeholder="Naam of studentnummer"></div>
    <div><label for="group">Groep</label><select id="group"><option value="">Alle groepen</option>${groups}</select></div>
  </div>
  <div class="summary"><div><h2>${escapeHtml(dateLabel(state.date))}</h2><p>${present} van ${filtered.length} studenten ingecheckt</p></div><a class="api-link" href="/docs" target="_blank">Open API docs</a></div>
  <div class="table-wrap"><table><thead><tr><th>Student</th><th>Groep</th><th>Tijd</th><th>Status</th></tr></thead><tbody>${rows || '<tr><td colspan="4" class="empty">Geen studenten gevonden.</td></tr>'}</tbody></table></div>`;
}

function manageView(): string {
  const students = state.data.students.map((student) => `<li><span><strong>${escapeHtml(student.naam)}</strong><small>${escapeHtml(student.studentnummer)} · ${escapeHtml(student.groep ?? "Geen groep")}</small></span><button class="danger" data-action="remove-student" data-id="${student.id}">Verwijder</button></li>`).join("");
  const groups = state.data.groups.map((group) => `<li><span>${escapeHtml(group)}</span><button class="danger" data-action="remove-group" data-name="${encodeURIComponent(group)}">Verwijder</button></li>`).join("");
  const groupOptions = state.data.groups.map((group) => `<option value="${escapeHtml(group)}">${escapeHtml(group)}</option>`).join("");

  return `<div class="management">
    <section class="panel"><h2>Studenten</h2><form class="form-grid" id="studentForm"><input class="full" id="studentName" placeholder="Naam" required><input id="studentNumber" placeholder="Studentnummer" required><select id="studentGroup"><option value="">Geen groep</option>${groupOptions}</select><button class="full">Student toevoegen</button></form><ul class="list">${students || "<li>Geen studenten gevonden.</li>"}</ul></section>
    <section class="panel"><h2>Groepen</h2><form class="form-grid" id="groupForm"><input class="full" id="groupName" placeholder="Groepsnaam" required><button class="full">Groep toevoegen</button></form><ul class="list">${groups || "<li>Geen groepen gevonden.</li>"}</ul></section>
  </div>`;
}

async function scan(): Promise<void> {
  const input = document.querySelector<HTMLInputElement>("#scanCode");
  if (!input) return;
  const result = await api<ScanResult>("/scan", { method: "POST", body: JSON.stringify({ code: input.value }) });
  await load();
  const feedback = document.querySelector<HTMLElement>("#feedback");
  if (!feedback || !result) return;
  feedback.textContent = result.type === "ok"
    ? `Welkom, ${result.student?.naam} · ${result.student?.groep ?? "Geen groep"} · ${result.tijd} · Ingecheckt.`
    : result.type === "dubbel"
      ? `${result.student?.naam} was al ingecheckt om ${result.tijd}.`
      : `Onbekend studentnummer: ${result.code}.`;
  feedback.className = `feedback ${result.type === "onbekend" ? "error" : "success"}`;
}

async function save(action: () => Promise<unknown>): Promise<void> {
  try {
    await action();
    await load();
  } catch (error) {
    showError(error);
  }
}

function value(id: string): string {
  return document.querySelector<HTMLInputElement | HTMLSelectElement>(`#${id}`)?.value.trim() ?? "";
}

document.addEventListener("click", (event) => {
  const target = event.target as HTMLElement;
  const action = target.dataset.action;
  if (action === "tab") {
    state.tab = target.dataset.tab as Tab;
    render();
  }
  if (action === "remove-student" && window.confirm("Student verwijderen?")) {
    void save(() => api(`/students/${target.dataset.id}`, { method: "DELETE" }));
  }
  if (action === "remove-group" && window.confirm("Groep verwijderen?")) {
    void save(() => api(`/groups/${target.dataset.name}`, { method: "DELETE" }));
  }
});

document.addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.target as HTMLFormElement;
  if (form.id === "scanForm") void scan().catch(showError);
  if (form.id === "studentForm") void save(() => api("/students", { method: "POST", body: JSON.stringify({ naam: value("studentName"), studentnummer: value("studentNumber"), groep: value("studentGroup") || null }) }));
  if (form.id === "groupForm") void save(() => api("/groups", { method: "POST", body: JSON.stringify({ name: value("groupName") }) }));
});

document.addEventListener("change", (event) => {
  const target = event.target as HTMLInputElement | HTMLSelectElement;
  if (target.id === "date") { state.date = target.value; void load().catch(showError); }
  if (target.id === "group") { state.group = target.value; render(); }
  if (target.id === "lateOnly" && target instanceof HTMLInputElement) { state.lateOnly = target.checked; render(); }
});

document.addEventListener("input", (event) => {
  const target = event.target as HTMLInputElement;
  if (target.id === "search") { state.search = target.value; render(); document.querySelector<HTMLInputElement>("#search")?.focus(); }
});

document.querySelector<HTMLElement>("nav")?.addEventListener("click", (event) => {
  const target = event.target as HTMLElement;
  if (!(target instanceof HTMLButtonElement)) return;
  state.page = target.textContent?.includes("Dashboard") ? "dashboard" : "scan";
  render();
  if (state.page === "dashboard") void load().catch(showError);
});

void load().catch(showError);
