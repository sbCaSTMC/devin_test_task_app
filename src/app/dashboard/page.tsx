"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getEntries, loadDummyData } from "@/lib/storage";
import { Entry } from "@/lib/types";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function initializeEntries(): Entry[] {
  const data = getEntries();
  if (data.length === 0) {
    loadDummyData();
    return getEntries();
  }
  return data;
}

export default function DashboardPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [period, setPeriod] = useState<7 | 30>(7);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(() => {
    const data = initializeEntries();
    setEntries(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const now = new Date();
  const periodStart = new Date(now);
  periodStart.setDate(periodStart.getDate() - period);

  const thisWeekStart = new Date(now);
  thisWeekStart.setDate(thisWeekStart.getDate() - 7);
  const thisWeekCount = entries.filter(
    (e) => new Date(e.date) >= thisWeekStart
  ).length;

  const consecutiveDays = (() => {
    const dateSet = new Set(
      entries.map((e) => new Date(e.date).toDateString())
    );
    let count = 0;
    const checkDate = new Date(now);
    while (dateSet.has(checkDate.toDateString())) {
      count++;
      checkDate.setDate(checkDate.getDate() - 1);
    }
    return count;
  })();

  const goalRate = Math.min(100, Math.round((thisWeekCount / 7) * 100));

  const chartData = (() => {
    const data: { date: string; count: number; value: number }[] = [];
    for (let i = period - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toDateString();
      const dayEntries = entries.filter(
        (e) => new Date(e.date).toDateString() === dateStr
      );
      data.push({
        date: `${d.getMonth() + 1}/${d.getDate()}`,
        count: dayEntries.length,
        value: dayEntries.reduce((sum, e) => sum + e.value, 0),
      });
    }
    return data;
  })();

  const recentEntries = [...entries]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

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
        <h1 className="text-3xl font-bold">ダッシュボード</h1>
        <Link href="/entries">
          <Button className="transition-transform hover:scale-105">
            記録を追加
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="transition-all hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">今週の記録数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{thisWeekCount}</div>
            <p className="text-xs text-muted-foreground">件の記録</p>
          </CardContent>
        </Card>
        <Card className="transition-all hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">連続日数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{consecutiveDays}</div>
            <p className="text-xs text-muted-foreground">日連続で記録中</p>
          </CardContent>
        </Card>
        <Card className="transition-all hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">目標達成率</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{goalRate}%</div>
            <div className="mt-2 h-2 w-full bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-500"
                style={{ width: `${goalRate}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>記録推移</CardTitle>
            <div className="flex gap-2">
              <Button
                variant={period === 7 ? "default" : "outline"}
                size="sm"
                onClick={() => setPeriod(7)}
              >
                7日
              </Button>
              <Button
                variant={period === 30 ? "default" : "outline"}
                size="sm"
                onClick={() => setPeriod(30)}
              >
                30日
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--primary))" }}
                  name="記録数"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>最新のアクティビティ</CardTitle>
        </CardHeader>
        <CardContent>
          {recentEntries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              まだ記録がありません
            </div>
          ) : (
            <div className="space-y-4">
              {recentEntries.map((entry, index) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 transition-all hover:bg-muted animate-in slide-in-from-left duration-300"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex-1">
                    <div className="font-medium">{entry.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(entry.date).toLocaleDateString("ja-JP")}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {entry.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                    <span className="font-semibold">{entry.value}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
