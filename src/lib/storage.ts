import { Entry } from "./types";

const STORAGE_KEY = "personal_dashboard_v1";

export function getEntries(): Entry[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return [];
  try {
    const parsed = JSON.parse(data);
    return parsed.entries || [];
  } catch {
    return [];
  }
}

export function saveEntries(entries: Entry[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ entries }));
}

export function addEntry(entry: Entry): void {
  const entries = getEntries();
  entries.push(entry);
  saveEntries(entries);
}

export function updateEntry(id: string, updated: Partial<Entry>): void {
  const entries = getEntries();
  const index = entries.findIndex((e) => e.id === id);
  if (index !== -1) {
    entries[index] = { ...entries[index], ...updated };
    saveEntries(entries);
  }
}

export function deleteEntry(id: string): void {
  const entries = getEntries().filter((e) => e.id !== id);
  saveEntries(entries);
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function exportData(): string {
  const entries = getEntries();
  return JSON.stringify({ entries }, null, 2);
}

export function exportDataAsCsv(): string {
  const entries = getEntries();
  const header = "id,title,note,tags,date,value";
  const rows = entries.map((e) => {
    const escapeCsv = (val: string) => {
      if (val.includes('"') || val.includes(",") || val.includes("\n")) {
        return `"${val.replace(/"/g, '""')}"`;
      }
      return val;
    };
    return [
      escapeCsv(e.id),
      escapeCsv(e.title),
      escapeCsv(e.note || ""),
      escapeCsv(e.tags.join(";")),
      escapeCsv(e.date),
      String(e.value),
    ].join(",");
  });
  return [header, ...rows].join("\n");
}

export function importData(jsonString: string, mode: "replace" | "merge" = "replace"): boolean {
  try {
    const data = JSON.parse(jsonString);
    if (data.entries && Array.isArray(data.entries)) {
      if (mode === "merge") {
        const existing = getEntries();
        const existingIds = new Set(existing.map((e) => e.id));
        const newEntries = data.entries.filter((e: Entry) => !existingIds.has(e.id));
        saveEntries([...existing, ...newEntries]);
      } else {
        saveEntries(data.entries);
      }
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export function parseCsvToEntries(csvString: string): Entry[] | null {
  try {
    const lines = csvString.trim().split("\n");
    if (lines.length < 2) return null;

    const header = lines[0].toLowerCase();
    if (!header.includes("title") || !header.includes("date")) return null;

    const entries: Entry[] = [];
    for (let i = 1; i < lines.length; i++) {
      const fields = parseCsvLine(lines[i]);
      if (fields.length < 6) continue;
      entries.push({
        id: fields[0] || generateId(),
        title: fields[1],
        note: fields[2] || undefined,
        tags: fields[3] ? fields[3].split(";").filter(Boolean) : [],
        date: fields[4],
        value: Number(fields[5]) || 0,
      });
    }
    return entries.length > 0 ? entries : null;
  } catch {
    return null;
  }
}

function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (inQuotes) {
      if (char === '"' && i + 1 < line.length && line[i + 1] === '"') {
        current += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ",") {
        fields.push(current);
        current = "";
      } else {
        current += char;
      }
    }
  }
  fields.push(current);
  return fields;
}

export function importCsvData(csvString: string, mode: "replace" | "merge" = "replace"): boolean {
  const parsed = parseCsvToEntries(csvString);
  if (!parsed) return false;

  if (mode === "merge") {
    const existing = getEntries();
    const existingIds = new Set(existing.map((e) => e.id));
    const newEntries = parsed.filter((e) => !existingIds.has(e.id));
    saveEntries([...existing, ...newEntries]);
  } else {
    saveEntries(parsed);
  }
  return true;
}

export function previewImportData(content: string, format: "json" | "csv"): { entries: Entry[]; count: number } | null {
  try {
    if (format === "json") {
      const data = JSON.parse(content);
      if (data.entries && Array.isArray(data.entries)) {
        return { entries: data.entries, count: data.entries.length };
      }
      return null;
    } else {
      const entries = parseCsvToEntries(content);
      if (entries) {
        return { entries, count: entries.length };
      }
      return null;
    }
  } catch {
    return null;
  }
}

export function resetData(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

export function loadDummyData(): void {
  const now = new Date();
  const dummyEntries: Entry[] = [];
  
  const titles = [
    "朝のランニング",
    "読書",
    "プログラミング学習",
    "瞑想",
    "英語学習",
    "筋トレ",
    "日記を書く",
  ];
  const tags = ["運動", "学習", "健康", "習慣", "趣味"];

  for (let i = 0; i < 30; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const numEntries = Math.floor(Math.random() * 3) + 1;
    
    for (let j = 0; j < numEntries; j++) {
      dummyEntries.push({
        id: generateId() + `-${i}-${j}`,
        title: titles[Math.floor(Math.random() * titles.length)],
        note: Math.random() > 0.5 ? "今日も頑張った！" : undefined,
        tags: [tags[Math.floor(Math.random() * tags.length)]],
        date: date.toISOString(),
        value: Math.floor(Math.random() * 100) + 1,
      });
    }
  }
  
  saveEntries(dummyEntries);
}
