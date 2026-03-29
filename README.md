# ProjectManage

システム開発向けプロジェクト管理システム。
メンバーの予定工数・実績工数と月間稼働カレンダーを可視化する。

---

## 機能

- **プロジェクト管理** — プロジェクトの登録・編集・削除・メンバーアサイン
- **メンバー管理** — メンバーの登録・編集・論理削除
- **工数管理** — 月次の予定工数・実績工数の入力・編集（UPSERT対応）
- **月間稼働カレンダー** — 土日・祝日を除いた稼働日数とメンバー別工数を可視化

---

## 技術スタック

| 層 | 技術 |
|---|---|
| フロントエンド | React 19 + TypeScript + Vite |
| UI ライブラリ | MUI v7 (Material UI) |
| バックエンド | .NET 9 Web API (C#) |
| ORM | Entity Framework Core 9 |
| DB | SQLite |

---

## 起動方法

### 前提条件

- .NET 9 SDK
- Node.js 20+

### 一括起動

```bash
./start.sh
```

| サービス | URL |
|---|---|
| フロントエンド | http://localhost:5173 |
| バックエンド API | http://localhost:5000 |

### 個別起動

```bash
# バックエンド
cd backend && dotnet run

# フロントエンド
cd frontend && npm install && npm run dev
```

初回起動時にデータベース（`backend/projectmanage.db`）が自動作成され、デモデータが投入される。

---

## ディレクトリ構成

```
ProjectManage/
├── backend/                  # .NET 9 Web API
│   ├── Controllers/          # REST API コントローラー
│   ├── Models/               # EF Core エンティティ
│   ├── Data/                 # DbContext・初期データ
│   └── Program.cs
├── frontend/
│   └── src/
│       ├── api/              # axios API クライアント
│       ├── components/       # UI コンポーネント
│       ├── pages/            # ページコンポーネント
│       └── types/index.ts    # 型定義
└── docs/                     # 設計書
    ├── 基本設計書.md
    ├── プロジェクト管理設計書.md
    ├── メンバー管理設計書.md
    ├── 工数管理設計書.md
    └── 月間稼働カレンダー設計書.md
```

---

## テスト

### バックエンド

```bash
cd backend.Tests && dotnet test
```

| 種別 | フレームワーク |
|---|---|
| ユニットテスト | xUnit + Moq |
| 統合テスト | xUnit + WebApplicationFactory（SQLite インメモリ） |

### フロントエンド

```bash
cd frontend && npm run test
```

| 種別 | フレームワーク |
|---|---|
| ユニットテスト | Vitest + React Testing Library |

---

## ドキュメント

| ドキュメント | 説明 |
|---|---|
| [基本設計書](docs/基本設計書.md) | システム全体のアーキテクチャ・DB・API設計 |
| [プロジェクト管理設計書](docs/プロジェクト管理設計書.md) | プロジェクト管理機能の詳細設計 |
| [メンバー管理設計書](docs/メンバー管理設計書.md) | メンバー管理機能の詳細設計 |
| [工数管理設計書](docs/工数管理設計書.md) | 工数管理機能の詳細設計 |
| [月間稼働カレンダー設計書](docs/月間稼働カレンダー設計書.md) | 月間稼働カレンダー機能の詳細設計 |
