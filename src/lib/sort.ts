import { Entry } from "./types";

export type SortOption =
  | "date-desc"
  | "date-asc"
  | "value-desc"
  | "value-asc"
  | "title-asc"
  | "title-desc";

export function sortEntries(entries: Entry[], sortOption: SortOption): Entry[] {
  const result = [...entries];

  switch (sortOption) {
    case "date-asc":
      return result.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
    case "value-desc":
      return result.sort((a, b) => b.value - a.value);
    case "value-asc":
      return result.sort((a, b) => a.value - b.value);
    case "title-asc":
      return result.sort((a, b) => a.title.localeCompare(b.title, "ja"));
    case "title-desc":
      return result.sort((a, b) => b.title.localeCompare(a.title, "ja"));
    case "date-desc":
    default:
      return result.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
  }
}
