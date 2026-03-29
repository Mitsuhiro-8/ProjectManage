# ProjectManage — CLAUDE.md

## プロジェクト概要

システム開発向けプロジェクト管理システム。
メンバーの予定工数・実績工数と月間稼働カレンダーを可視化する。

## 技術スタック

| 層 | 技術 |
|---|---|
| フロントエンド | React 19 + TypeScript + Vite |
| UI ライブラリ | MUI v7 (Material UI) |
| バックエンド | .NET 9 Web API (C#) |
| ORM | Entity Framework Core 9 (SQLite) |
| DB | SQLite (`backend/projectmanage.db`) |

## アーキテクチャ

```
ProjectManage/
├── backend/                  # .NET 9 Web API
│   ├── Controllers/          # REST API コントローラー
│   ├── Models/               # EF Core エンティティ
│   ├── Data/AppDbContext.cs  # DB コンテキスト
│   └── Program.cs
└── frontend/
    └── src/
        ├── api/              # axios API クライアント
        ├── components/       # UI コンポーネント
        ├── pages/            # ページコンポーネント
        └── types/index.ts    # 型定義
```

## 起動方法

```bash
./start.sh
# Backend : http://localhost:5000
# Frontend: http://localhost:5173
```

または個別に:
```bash
cd backend && dotnet run
cd frontend && npm run dev
```

## 主な API エンドポイント

| エンドポイント | 説明 |
|---|---|
| GET /api/projects | プロジェクト一覧 |
| POST /api/projects | プロジェクト作成 |
| POST /api/projects/{id}/members/{memberId} | メンバーアサイン |
| GET /api/manhours?projectId=&year=&month= | 月次工数取得 |
| POST /api/manhours | 工数入力（UPSERT） |
| GET /api/calendar?year=&month= | カレンダーデータ |
| POST /api/holidays/seed/{year} | 祝日シード |

## 開発サイクル

すべての機能開発は以下のサイクルを厳守する。
**各ゲート（🔒）では必ずユーザーの承認を得てから次のステップに進む。承認なしに先へ進んではならない。**

```
1. 設計書作成（docs/<機能名>.md）
      ↓
🔒 2. 【ユーザー承認】設計レビュー ← ここで止まる
      ↓
3. テストコード生成（失敗する状態で終わること＝Red）
      ↓
🔒 4. 【ユーザー確認】テストが正しく失敗しているか確認 ← ここで止まる
      ↓
5. 実装（テストをパスさせる＝Green）
      ↓
6. 統合テスト実施
      ↓
🔒 7. 【ユーザー承認】リリース前最終確認 ← ここで止まる
      ↓
8. リリース
```

### サイクルの注意事項

- **設計書なしの実装開始は禁止**
- **テストコードのない実装はマージしない**
- テストと実装は同一フェーズで書かない。テストを先に書き、失敗を確認してから実装に入ること（Red → Green の順を守る）
- リリース（git push 等）はユーザーの明示的な指示なしに実行しない

---

## テスト規約

### テスト構成

| 層 | フレームワーク | タイミング |
|---|---|---|
| バックエンド ユニットテスト | xUnit + Moq | 実装前（TDD） |
| バックエンド 統合テスト | xUnit + WebApplicationFactory | 実装後 |
| フロントエンド ユニットテスト | Vitest + React Testing Library | 実装前（TDD） |

### テスト DB

| フェーズ | DB |
|---|---|
| ユニットテスト | Moq で DbContext をモック化（DB不要） |
| 統合テスト | SQLite インメモリ（`Data Source=:memory:`）をテスト実行ごとに再作成 |

本番 DB（`projectmanage.db`）にはテストから一切アクセスしない。

### カバレッジ基準

| 対象 | 目標 |
|---|---|
| バックエンド（Controller・ロジック） | **80% 以上** |
| フロントエンド（コンポーネント・ページ） | **70% 以上** |

### ディレクトリ構成

```
backend.Tests/               # バックエンドテストプロジェクト
  ├── Unit/                  # ユニットテスト
  │   └── Controllers/
  └── Integration/           # 統合テスト
      └── Controllers/

frontend/src/
  └── __tests__/             # フロントエンドテスト
      ├── pages/
      └── components/
```

---

## 設計書規約

- システム全体の設計は `docs/基本設計書.md` に記載する
- 機能単位の詳細設計は `docs/<機能名>設計書.md` に作成する
- 実装前に必ず対応する設計書を作成・レビューする

---

## コーディング規約

### 共通

- コメントは **日本語** で記述する
- 自明な処理（単純なCRUD等）にはコメント不要。**「なぜ」を説明するコメント**を優先する
- 日付フォーマット: `YYYY-MM-DD` 文字列で統一（`DateOnly` ↔ string）

---

### バックエンド（C#）

- **primary constructor パターン**を使う: `class Foo(AppDbContext db)`
- **PUT は FindAsync → スカラー値のみ上書き**パターンに統一する
  - `EntityState.Modified` をエンティティ全体に適用すると、ナビゲーションプロパティが意図せず変更される恐れがあるため禁止
  - `FindAsync` で取得した既存エンティティのスカラーフィールドのみ更新し `SaveChangesAsync` する
- **ループ内でのDBクエリ禁止**（N+1問題）
  - ループ前に `ToHashSetAsync` 等で一括取得し、メモリ内で重複チェックする
- **入力バリデーションはコントローラー冒頭**で行い、範囲外は即 `BadRequest` を返す
- 工数 POST は UPSERT（同一 ProjectId+MemberId+Year+Month があれば更新）

---

### フロントエンド（React / TypeScript）

- カスタムフックよりページコンポーネント内での直接 `useState` + `useEffect` を優先（規模が小さいため）
- **`useEffect` の依存配列は省略しない**。関数を依存に含めたい場合は関数をエフェクト内に移動するか `reloadKey` パターンを使う
  ```ts
  // 外部トリガーで再フェッチする場合は reloadKey をインクリメントする
  const [reloadKey, setReloadKey] = useState(0);
  useEffect(() => { fetchData(); }, [param1, param2, reloadKey]);
  ```
- **非同期操作中は操作をdisabledにする**（連打・競合防止）
  ```ts
  const [loading, setLoading] = useState(false);
  const handleAction = async () => {
    if (loading) return;
    setLoading(true);
    // ...
    setLoading(false);
  };
  ```
