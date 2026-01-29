export interface Entry {
  id: string;
  title: string;
  note?: string;
  tags: string[];
  date: string;
  value: number;
}

export interface DashboardData {
  entries: Entry[];
}
