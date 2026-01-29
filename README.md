# Personal Dashboard

パーソナル・ダッシュボード - 日々の記録を管理するWebアプリケーション

## 前提条件

- Node.js 18.x 以上（推奨: 20.x）
- npm 9.x 以上

## インストール手順

```bash
# リポジトリをクローン
git clone https://github.com/sbCaSTMC/devin_test_task_app.git
cd devin_test_task_app

# 依存関係をインストール
npm install
```

## 起動手順

```bash
# 開発サーバーを起動
npm run dev
```

ブラウザで http://localhost:3000 を開くとアプリケーションが表示されます。

## 画面構成

1. **/dashboard** - ダッシュボード（トップページ）
   - KPIカード（今週の記録数、連続日数、目標達成率）
   - 記録推移チャート（7日/30日切替）
   - 最新アクティビティ

2. **/entries** - 記録一覧
   - 記録の一覧表示（カード形式）
   - キーワード検索
   - タグ・期間フィルタ
   - 追加・編集・削除（CRUD）

3. **/settings** - 設定
   - ダミーデータ投入/リセット
   - エクスポート/インポート（JSON）
   - テーマ切替（ライト/ダーク）

## データ保存について

データはブラウザの **localStorage** に保存されます。

- **キー名**: `personal_dashboard_v1`
- **形式**: JSON
- サーバーやデータベースは使用しません

### データモデル

```typescript
interface Entry {
  id: string;
  title: string;
  note?: string;
  tags: string[];
  date: string; // ISO形式
  value: number;
}
```

## エクスポート/インポート方法

### エクスポート

1. 設定画面（/settings）を開く
2. 「エクスポート (JSON)」ボタンをクリック
3. JSONファイルがダウンロードされます

### インポート

1. 設定画面（/settings）を開く
2. 「インポート (JSON)」ボタンをクリック
3. エクスポートしたJSONファイルを選択
4. データが復元されます

## 技術スタック

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS v4
- shadcn/ui
- Recharts

## 開発コマンド

```bash
# 開発サーバー起動
npm run dev

# ビルド
npm run build

# 本番サーバー起動
npm run start

# リント
npm run lint
```
