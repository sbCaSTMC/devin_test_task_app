import { describe, it, expect } from "vitest";
import { sortEntries, SortOption } from "../sort";
import { Entry } from "../types";

const createEntry = (
  overrides: Partial<Entry> & Pick<Entry, "id" | "title" | "date" | "value">
): Entry => ({
  tags: [],
  ...overrides,
});

const entries: Entry[] = [
  createEntry({ id: "1", title: "プログラミング学習", date: "2025-06-15T10:00:00.000Z", value: 50 }),
  createEntry({ id: "2", title: "朝のランニング", date: "2025-06-17T08:00:00.000Z", value: 30 }),
  createEntry({ id: "3", title: "読書", date: "2025-06-13T12:00:00.000Z", value: 80 }),
  createEntry({ id: "4", title: "英語学習", date: "2025-06-16T09:00:00.000Z", value: 10 }),
];

describe("sortEntries", () => {
  it("date-desc: 日付の新しい順にソートされる", () => {
    const result = sortEntries(entries, "date-desc");
    expect(result.map((e) => e.id)).toEqual(["2", "4", "1", "3"]);
  });

  it("date-asc: 日付の古い順にソートされる", () => {
    const result = sortEntries(entries, "date-asc");
    expect(result.map((e) => e.id)).toEqual(["3", "1", "4", "2"]);
  });

  it("value-desc: 値の大きい順にソートされる", () => {
    const result = sortEntries(entries, "value-desc");
    expect(result.map((e) => e.id)).toEqual(["3", "1", "2", "4"]);
  });

  it("value-asc: 値の小さい順にソートされる", () => {
    const result = sortEntries(entries, "value-asc");
    expect(result.map((e) => e.id)).toEqual(["4", "2", "1", "3"]);
  });

  it("title-asc: タイトルの昇順（A→Z）にソートされる", () => {
    const result = sortEntries(entries, "title-asc");
    const titles = result.map((e) => e.title);
    for (let i = 0; i < titles.length - 1; i++) {
      expect(titles[i].localeCompare(titles[i + 1], "ja")).toBeLessThanOrEqual(0);
    }
  });

  it("title-desc: タイトルの降順（Z→A）にソートされる", () => {
    const result = sortEntries(entries, "title-desc");
    const titles = result.map((e) => e.title);
    for (let i = 0; i < titles.length - 1; i++) {
      expect(titles[i].localeCompare(titles[i + 1], "ja")).toBeGreaterThanOrEqual(0);
    }
  });

  it("元の配列が変更されない", () => {
    const original = [...entries];
    sortEntries(entries, "value-desc");
    expect(entries).toEqual(original);
  });

  it("空配列が渡された場合、空配列を返す", () => {
    const result = sortEntries([], "date-desc");
    expect(result).toEqual([]);
  });

  it("要素が1つの場合、そのまま返す", () => {
    const single = [createEntry({ id: "1", title: "テスト", date: "2025-06-15T10:00:00.000Z", value: 10 })];
    const result = sortEntries(single, "date-desc");
    expect(result).toEqual(single);
  });

  it("同じ日付のエントリが存在する場合でもエラーにならない", () => {
    const sameDate = [
      createEntry({ id: "1", title: "A", date: "2025-06-15T10:00:00.000Z", value: 10 }),
      createEntry({ id: "2", title: "B", date: "2025-06-15T10:00:00.000Z", value: 20 }),
    ];
    const result = sortEntries(sameDate, "date-desc");
    expect(result).toHaveLength(2);
  });

  it("同じ値のエントリが存在する場合でもエラーにならない", () => {
    const sameValue = [
      createEntry({ id: "1", title: "A", date: "2025-06-15T10:00:00.000Z", value: 50 }),
      createEntry({ id: "2", title: "B", date: "2025-06-16T10:00:00.000Z", value: 50 }),
    ];
    const result = sortEntries(sameValue, "value-desc");
    expect(result).toHaveLength(2);
  });

  it("同じタイトルのエントリが存在する場合でもエラーにならない", () => {
    const sameTitle = [
      createEntry({ id: "1", title: "読書", date: "2025-06-15T10:00:00.000Z", value: 10 }),
      createEntry({ id: "2", title: "読書", date: "2025-06-16T10:00:00.000Z", value: 20 }),
    ];
    const result = sortEntries(sameTitle, "title-asc");
    expect(result).toHaveLength(2);
  });

  it("デフォルト（不明なソートオプション）はdate-descと同じ結果になる", () => {
    const resultDefault = sortEntries(entries, "unknown" as SortOption);
    const resultDateDesc = sortEntries(entries, "date-desc");
    expect(resultDefault.map((e) => e.id)).toEqual(resultDateDesc.map((e) => e.id));
  });
});
