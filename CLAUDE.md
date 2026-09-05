# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Claude Code の練習用リポジトリ。題材としてカンバン形式のタスク管理アプリ（Next.js App Router + TypeScript）を実装している。
背景・画面の詳細・デプロイ運用は `README.md` に書いてあるので、迷ったらそちらを読む。ここには**コードを触るときに知っておくべきこと**だけを置く。

## コマンド

```bash
npm run dev                                  # 開発サーバー（http://localhost:3000）
npm run build                                # 本番ビルド。next build が型チェックも走らせる
npm test                                     # Vitest を1回実行
npm run test:watch                           # watch
npm run typecheck                            # tsc --noEmit のみ

npx vitest run src/lib/task.test.ts          # ファイル単位で実行
npx vitest run -t "同じ列で上へ動かす"         # テスト名で絞って実行
```

ESLint は未導入。**`npm test` と `npm run typecheck` が唯一のゲート**なので、変更したら必ず両方通す。

## 層構造（この設計を崩さない）

依存は一方向。下の層は上の層を知らない。

```
components/  表示とユーザー操作      →  hooks/ と lib/ と types/
hooks/       状態の保持と更新の入口   →  lib/ と types/
lib/         純粋関数（計算の本体）    →  types/
types/       型とアプリ共通の定数
```

| 層 | やること | やらないこと |
| --- | --- | --- |
| `types/` | 型・定数 | ロジックを持たない |
| `lib/` | 状態の計算。入力を受けて新しい値を返す | React を import しない。副作用を持たない |
| `hooks/` | `useState` を持ち、更新は `lib/` の関数に委譲 | 計算そのものを書かない |
| `components/` | 表示とイベントの受け取り | 状態の計算をしない |

**`lib/` の関数はすべて非破壊**。引数の配列・オブジェクトを書き換えず、新しい値を返す。React の再描画がこれに依存しているので、破壊的変更を入れると「なぜか画面が更新されない」が起きる。新しい `lib/` の関数を書いたら、非破壊であることをテストで確かめる（既存テストにその形がある）。

**状態の持ち主は `KanbanBoard` ひとつ。** 子コンポーネントは props を表示し、操作をコールバックで返すだけ。状態を子に降ろさない。

## 踏み抜きやすい落とし穴

**列内の並び順は `tasks` 配列の相対順序そのもの。** `tasksByStatus` が配列を素通しでフィルタしているだけなので、`Task` に `order` のようなフィールドは無いし、足す必要もない。並び替えは `lib/task.ts` の `moveTaskTo` が配列へ差し込み直すことで実現している。`beforeTaskId` が `null` のときは配列の末尾ではなく**その列の最後のタスクの次**に入れる（末尾に足すと他の列を飛び越える）。

**「今日」をレンダリング中に求めない。** このページは静的に事前生成されるため、`todayIso()` をそのまま呼ぶとビルド日で固定される。`useToday` がマウント後にクライアントで確定させ、それまでは `null` を返す。`null` の間は締切に依存する表示・絞り込みを止める（`filterTasks` は締切条件を無視して全件通す）。

**ドラッグ＆ドロップはブラウザ標準の HTML5 DnD。** ライブラリを足さない。`dragOver` で `preventDefault()` を呼ばないとドロップが許可されない。**カード側の `onDrop` / `onDragOver` では `stopPropagation()` が必須**で、呼ばないと親 `Column` の `onDrop` にも伝播し「列の末尾へ移動」で上書きされる。

**カテゴリはタスクから ID で参照される。** カテゴリを削除したら、参照していたタスクの `categoryId` も外す（`KanbanBoard` の `handleDeleteCategory` が `deleteCategory` と `clearCategory` の両方を呼ぶ）。

**タスクとカテゴリは永続化されていない。** メモリ上にしか無く、リロードで初期状態に戻る（テーマだけ `localStorage`）。

**ラベル文言の重複に注意。** フォームと絞り込みバーのように同じ画面に出るコントロールは、アクセシブルネームが衝突すると支援技術でもテスト（`getByLabelText`）でも区別できなくなる。「カテゴリ」ではなく「カテゴリで絞る」のように分ける。

## テスト

Vitest + Testing Library（jsdom）。テストは実装ファイルの隣（`src/lib/task.ts` と `src/lib/task.test.ts`）。

- **仕様の本体は `lib/*.test.ts` で押さえる。** DOM を起こさないので速く、壊れにくい
- テストデータは `src/test/factories.ts` の `makeTask` / `makeCategory` を使い、必要な項目だけ上書きする
- ユーザー操作は `userEvent`。`fireEvent` は DnD などの低レベルなイベントに限る
- jsdom には `DataTransfer` が無いので `src/test/dataTransfer.ts` のスタブを `fireEvent` の init に渡す
- **jsdom の `getBoundingClientRect()` は常に 0 を返し、`drop` イベントは `clientY` を落とす。** 座標に依存する分岐は `lib/dnd.test.ts` のように純粋関数へ切り出して数値を直接渡す。画面越しに試したい場合は `Element.prototype.getBoundingClientRect` を差し替えたうえで、`createEvent.drop()` で作ったイベントに `clientY` を `defineProperty` で載せる（`TaskCard.test.tsx` に例がある）

## 機能を足すときの順番

**先に `lib/` とそのテストを書いてから UI に降ろす。**

1. `types/` … 型・定数を足す
2. `test/factories.ts` … 既定値を足す（既存テストがここで通る）
3. `lib/` … 計算を書き、`lib/*.test.ts` にテストを書く
4. `hooks/` … 新しい操作が要るときだけ
5. `components/` … 入力欄と表示
6. `npm test && npm run typecheck`

## 書き方

- コメント・UI 文言・テスト名は日本語。コメントは「何をしているか」ではなく**なぜそうしているか**を書く
- スタイルは CSS Modules（`*.module.css`）。色は `globals.css` のトークン（`--surface` / `--border` / `--accent` など）を使い、ライト / ダークで個別に定義しない
- コミットメッセージは英語の命令形1行 + 日本語の本文

## デプロイ

Vercel + GitHub 連携。手動デプロイ操作は不要。

- **`main` へのマージ＝即本番公開。ステージング環境は無い。** 確認は PR のプレビュー URL で行う
- **CI は無く、テストは自動実行されない。** マージ前に手元で `npm test` を走らせること
- ビルドが通らないとデプロイは失敗し、直前の本番が残る
