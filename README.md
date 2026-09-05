# claude-code-practice

Claude Code を試すための練習用リポジトリ。
検証の題材として、**カンバン形式のタスク管理アプリ**（Next.js + TypeScript）を実装している。

---

## 1. 動かす

前提: Node.js 20 以降（開発時は v24.4.1）。

```bash
npm install
npm run dev        # http://localhost:3000
```

| コマンド | 内容 |
| --- | --- |
| `npm run dev` | 開発サーバー起動 |
| `npm run build` | 本番ビルド（型チェックも走る） |
| `npm start` | ビルド結果の起動 |
| `npm test` | Vitest を1回実行 |
| `npm run test:watch` | Vitest を watch で実行 |
| `npm run typecheck` | `tsc --noEmit` のみ |

ESLint は未導入。型チェックとテストで担保している。

---

## 2. アプリでできること

- 未着手 / 進行中 / 完了 の3列のカンバンボード
- タスクの追加（タイトル・説明・締切日・カテゴリ）
- ドラッグ＆ドロップで列間を移動
- カードをクリックすると詳細モーダルが開き、全項目を編集・保存
- タスクの削除（2段階の確認あり）
- アーカイブ / アーカイブ一覧からの復帰・削除
- 締切日のバッジ表示（期限切れ・当日・予定で色分け）
- カテゴリの追加・削除（10色のパレットから色を選択）。カード背景に反映される
- ライト / ダークテーマの切り替え（`localStorage` に保存）

タスクとカテゴリの永続化は未実装。リロードすると初期状態に戻る（テーマのみ保存される）。

---

## 3. ディレクトリ構成

```
.
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── layout.tsx            #   <html>/<body>、テーマ初期化スクリプト
│   │   ├── page.tsx              #   トップページ。KanbanBoard を置くだけ
│   │   ├── globals.css           #   テーマトークン（ライト/ダーク）とリセット
│   │   └── page.module.css
│   │
│   ├── types/                    # 型と定数。ここだけは誰でも import してよい
│   │   ├── task.ts               #   Task / TaskStatus / COLUMNS（3列の定義）
│   │   └── category.ts           #   Category / COLOR_PALETTE（10色）/ 既定カテゴリ
│   │
│   ├── lib/                      # 純粋関数。React に依存しない
│   │   ├── task.ts               #   タスクの生成・更新・移動・削除・絞り込み
│   │   ├── category.ts           #   カテゴリの生成・追加・削除・検索・バリデーション
│   │   ├── date.ts               #   締切日の比較と整形
│   │   ├── theme.ts              #   テーマの解決ロジックと初期化スクリプト
│   │   └── dnd.ts                #   ドラッグ＆ドロップで使う dataTransfer のキー
│   │
│   ├── hooks/                    # React の状態。更新は lib の関数に委譲する
│   │   ├── useTasks.ts           #   タスク一覧
│   │   ├── useCategories.ts      #   カテゴリ一覧
│   │   ├── useTheme.ts           #   テーマ（localStorage / <html data-theme>）
│   │   └── useToday.ts           #   今日の日付（マウント後に確定させる）
│   │
│   ├── components/               # 表示とユーザー操作。1ファイル1責務
│   │   ├── KanbanBoard.tsx       #   全体の組み立て。状態と各パーツの結線役
│   │   ├── TaskForm.tsx          #   タスク追加フォーム
│   │   ├── Column.tsx            #   1列の表示とドロップの受け取り
│   │   ├── TaskCard.tsx          #   1枚のカード。ドラッグ開始と詳細を開く操作
│   │   ├── TaskDetailDialog.tsx  #   詳細モーダル（編集・削除・アーカイブ）
│   │   ├── ArchiveList.tsx       #   アーカイブ一覧パネル
│   │   ├── CategoryManager.tsx   #   カテゴリの追加・削除パネル
│   │   ├── CategorySelect.tsx    #   カテゴリ選択（フォームと詳細で共用）
│   │   ├── CategoryBadge.tsx     #   カテゴリ名の色付きバッジ
│   │   ├── DueDateBadge.tsx      #   締切日のバッジ
│   │   ├── ThemeToggle.tsx       #   テーマ切り替えボタン
│   │   └── *.module.css          #   各コンポーネントのスタイル（CSS Modules）
│   │
│   └── test/                     # テスト補助（本番コードには含まれない）
│       ├── setup.ts              #   jest-dom の登録と後始末
│       ├── factories.ts          #   makeTask / makeCategory
│       └── dataTransfer.ts       #   jsdom に無い DataTransfer の最小実装
│
├── next.config.ts
├── tsconfig.json                 # パスエイリアス @/* → src/*
├── vitest.config.mts             # jsdom 環境・setupFiles・エイリアス
└── README.md
```

テストは `src/**/*.test.ts(x)` として実装ファイルの隣に置く（例: `src/lib/task.ts` と `src/lib/task.test.ts`）。

---

## 4. 設計の考え方

**依存は一方向**。下の層は上の層を知らない。

```mermaid
graph TD
    C["components/<br/>表示・イベント"] --> H["hooks/<br/>状態の保持"]
    C --> L["lib/<br/>純粋関数"]
    H --> L
    L --> T["types/<br/>型・定数"]
    C --> T
    H --> T
```

| 層 | 役割 | やらないこと |
| --- | --- | --- |
| `types/` | 型とアプリ全体で共有する定数 | ロジックを持たない |
| `lib/` | 状態の計算。入力を受けて新しい値を返す | React を import しない。副作用を持たない |
| `hooks/` | 状態の保持と更新の入口 | 計算そのものは書かず `lib/` を呼ぶ |
| `components/` | 表示とユーザー操作の受け取り | 状態の計算をしない |

### なぜこの形か

- **ロジックを `lib/` に寄せると、テストが速くて壊れにくい。** DOM を起こさずに済むので、仕様の確認はほぼここで完結する
- **`lib/` の関数はすべて非破壊**（引数の配列・オブジェクトを書き換えず、新しい値を返す）。React の再描画が確実に走り、「なぜか画面が更新されない」が起きにくい
- **状態の持ち主は `KanbanBoard` ひとつ。** 子コンポーネントは props で受け取った値を表示し、操作をコールバックで返すだけ。どこで何が変わるかを1ファイルで追える

### データの流れ（例: カードを別の列にドロップする）

```
TaskCard          dragStart で dataTransfer に task.id を載せる
   ↓
Column            drop で id を取り出し onDropTask(id, 自分の status) を呼ぶ
   ↓
KanbanBoard       useTasks の moveTask に渡す
   ↓
useTasks          setTasks(current => moveTask(current, id, status))
   ↓
lib/task.ts       moveTask が新しい配列を返す
   ↓
再描画            Column が tasksByStatus で自分の列の分だけ受け取る
```

---

## 5. データモデル

```ts
type Task = {
  id: string;
  title: string;
  description: string;
  status: "todo" | "in-progress" | "done";
  dueDate: string | null;      // "YYYY-MM-DD"
  categoryId: string | null;   // Category.id への参照。未設定なら null
  archived: boolean;           // true ならボードから外れ、アーカイブ一覧へ
};

type Category = {
  id: string;
  label: string;
  color: string;               // COLOR_PALETTE のいずれか
};
```

- タスクはカテゴリを **ID で参照**する。カテゴリを削除したら、参照していたタスクの `categoryId` を `null` に戻す（`lib/task.ts` の `clearCategory`）
- 参照が外れた ID が残っていても `findCategory` が `null` を返すため、表示は「カテゴリなし」になり壊れない
- アーカイブは `status` とは独立したフラグ。戻したときに元の列へ復帰する

---

## 6. 知っておくと迷わない実装メモ

**ドラッグ＆ドロップはブラウザ標準の HTML5 DnD**（追加ライブラリなし）。`TaskCard` が `dataTransfer` に ID を載せ、`Column` が `drop` で受け取る。`dragOver` で `preventDefault()` を呼ばないとドロップが許可されない点に注意。

**テーマは `<html data-theme>` で切り替える。** `globals.css` は「明示的な選択があればそれ、無ければ OS の設定」の順で効くように書いてある。`layout.tsx` に同期スクリプト（`lib/theme.ts` の `THEME_INIT_SCRIPT`）を1本入れて、初回描画前に属性を当てることでちらつきを防いでいる。

**「今日」はレンダリング中に求めない。** このページは静的に事前生成されるため、`todayIso()` をそのまま呼ぶとビルド日で固定されてしまう。`useToday` がマウント後にクライアントで確定させ、それまでは締切バッジの色分けをしない。

**カテゴリの色は `color-mix()` でカード色と混ぜている。** ライト / ダークで定義を分ける必要がなく、パレットの色を1つ足すだけで両テーマに対応する。

---

## 7. テスト

Vitest + Testing Library（jsdom）。`npm test` で全件実行。

| 対象 | 何を確かめるか |
| --- | --- |
| `lib/*.test.ts` | 仕様の本体。入出力と非破壊性。DOM を起こさないので速い |
| `hooks/*.test.ts` | `renderHook` で状態の遷移 |
| `components/*.test.tsx` | 表示内容と、操作が正しいコールバックを呼ぶか |
| `components/KanbanBoard.test.tsx` | 結合。追加 → ドラッグ移動 → 編集 → アーカイブ → 削除の一連 |

- ユーザー操作は `userEvent` で書く（`fireEvent` は DnD などの低レベルなイベントに限る）
- jsdom には `DataTransfer` が無いので `src/test/dataTransfer.ts` のスタブを `fireEvent` の init に渡す
- テストデータは `src/test/factories.ts` の `makeTask` / `makeCategory` を使い、必要な項目だけ上書きする

```ts
const task = makeTask({ id: "2", status: "done", dueDate: "2026-10-01" });
```

---

## 8. 機能を足すときの手順

例として「タスクに担当者を追加する」場合、次の順で触ると迷いにくい。

1. `types/task.ts` … `Task` に `assignee` を足す
2. `test/factories.ts` … `makeTask` の既定値を足す（既存テストがここで通る）
3. `lib/task.ts` … `createTask` / `updateTask` での扱いを決め、`lib/task.test.ts` にテストを書く
4. `hooks/useTasks.ts` … 新しい操作が要るなら追加する（多くの場合は不要）
5. `components/` … 入力欄（`TaskForm` / `TaskDetailDialog`）と表示（`TaskCard`）を足す
6. `npm test && npm run typecheck` で確認する

**先に `lib/` とそのテストを書いてから UI に降ろす**のが、この構成での基本の進め方。

---

## 9. Claude Code の練習リポジトリとしてのメモ

| やりたいこと | 方法 |
| --- | --- |
| プロジェクト方針を常に読ませる | `CLAUDE.md` に書く（`/init` で雛形生成） |
| 定型作業をコマンド化 | `.claude/commands/<name>.md` を作り `/<name>` で呼ぶ |
| 手順つきの専門タスクを定義 | `.claude/skills/<name>/SKILL.md` を作る |
| 権限確認を減らす | `.claude/settings.json` の `permissions.allow` に追記 |
| 外部サービスと連携 | MCP サーバーを追加する |

`.claude/` と `CLAUDE.md` はいずれも未作成。必要になった時点で追加する。

### 検証ログ

| 日付 | 試したこと | 結果 |
| --- | --- | --- |
| 2026-09-05 | リポジトリ作成 | - |
| 2026-09-05 | カンバンアプリの実装（Next.js + TypeScript + Vitest） | 3列のボード / 追加 / DnD 移動 |
| 2026-09-05 | 詳細・編集・削除・アーカイブ・締切日・カテゴリ・ダークモードを追加 | 完了 |
| 2026-09-05 | カテゴリをユーザー管理化（追加・削除、10色パレット） | 完了 |
