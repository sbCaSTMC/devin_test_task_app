"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  getEntries,
  loadDummyData,
  resetData,
  exportData,
  exportDataAsCsv,
  importData,
  importCsvData,
  previewImportData,
} from "@/lib/storage";
import { Entry } from "@/lib/types";
import { toast } from "sonner";

export default function SettingsPage() {
  const [entryCount, setEntryCount] = useState(0);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [importMode, setImportMode] = useState<"replace" | "merge">("replace");
  const [isImportPreviewOpen, setIsImportPreviewOpen] = useState(false);
  const [importPreview, setImportPreview] = useState<{ entries: Entry[]; count: number } | null>(null);
  const [pendingImportContent, setPendingImportContent] = useState<string>("");
  const [pendingImportFormat, setPendingImportFormat] = useState<"json" | "csv">("json");

  const initializeState = useCallback(() => {
    setEntryCount(getEntries().length);
    const isDark = document.documentElement.classList.contains("dark");
    setIsDarkMode(isDark);
  }, []);

  useEffect(() => {
    initializeState();
  }, [initializeState]);

  const handleLoadDummy = () => {
    loadDummyData();
    setEntryCount(getEntries().length);
    toast.success("ダミーデータを投入しました");
  };

  const handleReset = () => {
    resetData();
    setEntryCount(0);
    setIsResetDialogOpen(false);
    toast.success("データをリセットしました");
  };

  const handleExportJson = () => {
    const data = exportData();
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `personal_dashboard_export_${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("JSONファイルをエクスポートしました");
  };

  const handleExportCsv = () => {
    const data = exportDataAsCsv();
    const bom = "\uFEFF";
    const blob = new Blob([bom + data], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `personal_dashboard_export_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("CSVファイルをエクスポートしました");
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const format = file.name.endsWith(".csv") ? "csv" : "json";
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const preview = previewImportData(content, format);
      if (preview) {
        setImportPreview(preview);
        setPendingImportContent(content);
        setPendingImportFormat(format);
        setIsImportPreviewOpen(true);
      } else {
        toast.error("ファイルの読み取りに失敗しました。形式を確認してください。");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleConfirmImport = () => {
    let success = false;
    if (pendingImportFormat === "csv") {
      success = importCsvData(pendingImportContent, importMode);
    } else {
      success = importData(pendingImportContent, importMode);
    }

    if (success) {
      setEntryCount(getEntries().length);
      const modeLabel = importMode === "merge" ? "マージ" : "置換";
      toast.success(`データを${modeLabel}モードでインポートしました`);
    } else {
      toast.error("インポートに失敗しました。ファイル形式を確認してください。");
    }

    setIsImportPreviewOpen(false);
    setImportPreview(null);
    setPendingImportContent("");
  };

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
    toast.success(`${newMode ? "ダーク" : "ライト"}モードに切り替えました`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <h1 className="text-3xl font-bold">設定</h1>

      <Card>
        <CardHeader>
          <CardTitle>データ管理</CardTitle>
          <CardDescription>
            現在 {entryCount} 件の記録があります
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <Button onClick={handleLoadDummy} variant="outline">
              ダミーデータを投入
            </Button>
            <Button
              onClick={() => setIsResetDialogOpen(true)}
              variant="destructive"
            >
              データをリセット
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>エクスポート</CardTitle>
          <CardDescription>
            データをファイルとしてダウンロードできます
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <Button onClick={handleExportJson} variant="outline">
              エクスポート (JSON)
            </Button>
            <Button onClick={handleExportCsv} variant="outline">
              エクスポート (CSV)
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            JSONはバックアップ・復元に、CSVはExcelなどの表計算ソフトでの利用に適しています。
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>インポート</CardTitle>
          <CardDescription>
            JSONまたはCSVファイルからデータを読み込めます
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Label className="text-sm font-medium whitespace-nowrap">インポートモード:</Label>
              <Select value={importMode} onValueChange={(v) => setImportMode(v as "replace" | "merge")}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="replace">置換（既存データを上書き）</SelectItem>
                  <SelectItem value="merge">マージ（既存データに追加）</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className="text-sm text-muted-foreground">
              {importMode === "replace"
                ? "既存のデータをすべて削除し、インポートしたデータで置き換えます。"
                : "既存のデータを保持したまま、新しいデータを追加します（IDが重複するデータはスキップされます）。"}
            </p>
          </div>
          <div>
            <Label htmlFor="import-file" className="cursor-pointer">
              <Button variant="outline" asChild>
                <span>ファイルを選択 (JSON / CSV)</span>
              </Button>
            </Label>
            <Input
              id="import-file"
              type="file"
              accept=".json,.csv"
              onChange={handleImportFile}
              className="hidden"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>テーマ設定</CardTitle>
          <CardDescription>
            アプリの外観を変更できます
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={toggleDarkMode} variant="outline">
            {isDarkMode ? "ライトモードに切り替え" : "ダークモードに切り替え"}
          </Button>
        </CardContent>
      </Card>

      <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>データをリセット</DialogTitle>
            <DialogDescription>
              すべての記録が削除されます。この操作は取り消せません。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsResetDialogOpen(false)}
            >
              キャンセル
            </Button>
            <Button variant="destructive" onClick={handleReset}>
              リセット
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isImportPreviewOpen} onOpenChange={setIsImportPreviewOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>インポートプレビュー</DialogTitle>
            <DialogDescription>
              インポートするデータの内容を確認してください。
            </DialogDescription>
          </DialogHeader>
          {importPreview && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{pendingImportFormat.toUpperCase()}</Badge>
                <span className="text-sm text-muted-foreground">
                  {importPreview.count} 件のデータ
                </span>
                <Badge variant={importMode === "replace" ? "destructive" : "default"}>
                  {importMode === "replace" ? "置換" : "マージ"}
                </Badge>
              </div>
              <div className="max-h-60 overflow-y-auto rounded-md border p-3 space-y-2">
                {importPreview.entries.slice(0, 10).map((entry, i) => (
                  <div key={i} className="flex items-center justify-between text-sm py-1 border-b last:border-0">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{entry.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(entry.date).toLocaleDateString("ja-JP")} / 値: {entry.value}
                      </p>
                    </div>
                    <div className="flex gap-1 ml-2">
                      {entry.tags.map((tag, j) => (
                        <Badge key={j} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
                {importPreview.count > 10 && (
                  <p className="text-xs text-muted-foreground text-center pt-1">
                    ...他 {importPreview.count - 10} 件
                  </p>
                )}
              </div>
              {importMode === "replace" && (
                <p className="text-sm text-destructive">
                  既存のデータ（{entryCount} 件）はすべて削除されます。
                </p>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsImportPreviewOpen(false);
                setImportPreview(null);
                setPendingImportContent("");
              }}
            >
              キャンセル
            </Button>
            <Button onClick={handleConfirmImport}>
              インポート実行
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
