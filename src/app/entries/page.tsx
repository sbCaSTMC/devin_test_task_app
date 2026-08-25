"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getEntries,
  addEntry,
  updateEntry,
  deleteEntry,
  generateId,
} from "@/lib/storage";
import { Entry } from "@/lib/types";
import { toast } from "sonner";

const toDateInputValue = (isoDate: string) => {
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return "";
  const month = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${d.getFullYear()}-${month}-${day}`;
};

const fromDateInputValue = (value: string, baseIsoDate?: string) => {
  const [year, month, day] = value.split("-").map(Number);
  const base = baseIsoDate ? new Date(baseIsoDate) : new Date();
  const time = Number.isNaN(base.getTime()) ? new Date() : base;
  return new Date(
    year,
    month - 1,
    day,
    time.getHours(),
    time.getMinutes(),
    time.getSeconds()
  ).toISOString();
};

export default function EntriesPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [tagFilter, setTagFilter] = useState<string>("all");
  const [periodFilter, setPeriodFilter] = useState<string>("all");
  const [sortOption, setSortOption] = useState<string>("date-desc");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    note: "",
    tags: "",
    value: "",
    date: "",
  });

  const loadData = useCallback(() => {
    setEntries(getEntries());
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    entries.forEach((e) => e.tags.forEach((t) => tags.add(t)));
    return Array.from(tags);
  }, [entries]);

  const filteredEntries = useMemo(() => {
    let result = [...entries];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (e) =>
          e.title.toLowerCase().includes(query) ||
          e.note?.toLowerCase().includes(query)
      );
    }

    if (tagFilter !== "all") {
      result = result.filter((e) => e.tags.includes(tagFilter));
    }

    if (periodFilter !== "all") {
      const now = new Date();
      const days = parseInt(periodFilter);
      const start = new Date(now);
      start.setDate(start.getDate() - days);
      result = result.filter((e) => new Date(e.date) >= start);
    }

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
  }, [entries, searchQuery, tagFilter, periodFilter, sortOption]);

  const openAddDialog = () => {
    setEditingEntry(null);
    setFormData({
      title: "",
      note: "",
      tags: "",
      value: "",
      date: toDateInputValue(new Date().toISOString()),
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (entry: Entry) => {
    setEditingEntry(entry);
    setFormData({
      title: entry.title,
      note: entry.note || "",
      tags: entry.tags.join(", "),
      value: entry.value.toString(),
      date: toDateInputValue(entry.date),
    });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.title.trim()) {
      toast.error("タイトルを入力してください");
      return;
    }

    if (!formData.date) {
      toast.error("日付を選択してください");
      return;
    }

    const tags = formData.tags
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t);
    const value = parseInt(formData.value) || 0;
    const date = fromDateInputValue(formData.date, editingEntry?.date);

    if (editingEntry) {
      updateEntry(editingEntry.id, {
        title: formData.title,
        note: formData.note || undefined,
        tags,
        date,
        value,
      });
      toast.success("記録を更新しました");
    } else {
      const newEntry: Entry = {
        id: generateId(),
        title: formData.title,
        note: formData.note || undefined,
        tags,
        date,
        value,
      };
      addEntry(newEntry);
      toast.success("記録を追加しました");
    }

    setEntries(getEntries());
    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    deleteEntry(id);
    setEntries(getEntries());
    toast.success("記録を削除しました");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">記録一覧</h1>
        <Button
          onClick={openAddDialog}
          className="transition-transform hover:scale-105"
        >
          新規追加
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>検索・フィルタ</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <Label htmlFor="search">キーワード検索</Label>
              <Input
                id="search"
                placeholder="タイトルやメモで検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div>
              <Label>タグ</Label>
              <Select value={tagFilter} onValueChange={setTagFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="タグを選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべて</SelectItem>
                  {allTags.map((tag) => (
                    <SelectItem key={tag} value={tag}>
                      {tag}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>期間</Label>
              <Select value={periodFilter} onValueChange={setPeriodFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="期間を選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべて</SelectItem>
                  <SelectItem value="7">過去7日</SelectItem>
                  <SelectItem value="30">過去30日</SelectItem>
                  <SelectItem value="90">過去90日</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>並び替え</Label>
              <Select value={sortOption} onValueChange={setSortOption}>
                <SelectTrigger>
                  <SelectValue placeholder="並び替えを選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date-desc">日付（新しい順）</SelectItem>
                  <SelectItem value="date-asc">日付（古い順）</SelectItem>
                  <SelectItem value="value-desc">値（大きい順）</SelectItem>
                  <SelectItem value="value-asc">値（小さい順）</SelectItem>
                  <SelectItem value="title-asc">タイトル（A→Z）</SelectItem>
                  <SelectItem value="title-desc">タイトル（Z→A）</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {filteredEntries.length === 0 ? (
        <Card>
          <CardContent className="py-16">
            <div className="text-center space-y-4">
              <div className="text-6xl">📝</div>
              <h3 className="text-xl font-semibold">記録がありません</h3>
              <p className="text-muted-foreground">
                {entries.length === 0
                  ? "最初の記録を追加してみましょう！"
                  : "検索条件に一致する記録がありません"}
              </p>
              {entries.length === 0 && (
                <Button onClick={openAddDialog}>最初の記録を追加</Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredEntries.map((entry, index) => (
            <Card
              key={entry.id}
              className="transition-all hover:shadow-lg animate-in fade-in slide-in-from-bottom duration-300"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{entry.title}</CardTitle>
                  <span className="text-2xl font-bold text-primary">
                    {entry.value}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {new Date(entry.date).toLocaleDateString("ja-JP", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
              </CardHeader>
              <CardContent>
                {entry.note && (
                  <p className="text-sm text-muted-foreground mb-3">
                    {entry.note}
                  </p>
                )}
                <div className="flex flex-wrap gap-1 mb-4">
                  {entry.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(entry)}
                    className="flex-1"
                  >
                    編集
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(entry.id)}
                    className="flex-1"
                  >
                    削除
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingEntry ? "記録を編集" : "新規記録"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="title">タイトル *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="例: 朝のランニング"
              />
            </div>
            <div>
              <Label htmlFor="date">日付 *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="note">メモ</Label>
              <Input
                id="note"
                value={formData.note}
                onChange={(e) =>
                  setFormData({ ...formData, note: e.target.value })
                }
                placeholder="例: 今日も頑張った！"
              />
            </div>
            <div>
              <Label htmlFor="tags">タグ（カンマ区切り）</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) =>
                  setFormData({ ...formData, tags: e.target.value })
                }
                placeholder="例: 運動, 健康"
              />
            </div>
            <div>
              <Label htmlFor="value">値</Label>
              <Input
                id="value"
                type="number"
                value={formData.value}
                onChange={(e) =>
                  setFormData({ ...formData, value: e.target.value })
                }
                placeholder="例: 30"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              キャンセル
            </Button>
            <Button onClick={handleSave}>
              {editingEntry ? "更新" : "追加"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
