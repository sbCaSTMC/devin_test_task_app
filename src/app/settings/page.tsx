"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  importData,
} from "@/lib/storage";
import { toast } from "sonner";

export default function SettingsPage() {
  const [entryCount, setEntryCount] = useState(0);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

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

  const handleExport = () => {
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
    toast.success("データをエクスポートしました");
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (importData(content)) {
        setEntryCount(getEntries().length);
        toast.success("データをインポートしました");
      } else {
        toast.error("インポートに失敗しました。ファイル形式を確認してください。");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
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
          <CardTitle>エクスポート / インポート</CardTitle>
          <CardDescription>
            データをJSON形式でバックアップ・復元できます
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <Button onClick={handleExport} variant="outline">
              エクスポート (JSON)
            </Button>
            <div>
              <Label htmlFor="import-file" className="cursor-pointer">
                <Button variant="outline" asChild>
                  <span>インポート (JSON)</span>
                </Button>
              </Label>
              <Input
                id="import-file"
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            localStorageキー名: <code className="bg-muted px-1 rounded">personal_dashboard_v1</code>
          </p>
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
    </div>
  );
}
