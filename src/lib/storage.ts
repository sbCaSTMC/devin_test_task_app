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

export function importData(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString);
    if (data.entries && Array.isArray(data.entries)) {
      saveEntries(data.entries);
      return true;
    }
    return false;
  } catch {
    return false;
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
