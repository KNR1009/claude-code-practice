# claude-code-practice

Claude Code を試すための練習用リポジトリ。

コマンド・スキル・MCP・フックなどを実際に動かして検証し、
使えるものだけを他プロジェクトへ持ち出すことを目的にしている。

## セットアップ

```bash
npm install -g @anthropic-ai/claude-code
cd claude-code-practice
claude
```

## ディレクトリ構成

```
.
├── .claude/          # このリポジトリ固有の設定
│   ├── settings.json #   権限・環境変数・フック
│   ├── commands/     #   スラッシュコマンド（/xxx）
│   └── skills/       #   スキル
├── CLAUDE.md         # Claude に常時読ませるプロジェクト方針
└── README.md
```

いずれもまだ未作成。必要になった時点で追加する。

## 使い方メモ

| やりたいこと | 方法 |
| --- | --- |
| プロジェクト方針を常に読ませる | `CLAUDE.md` に書く（`/init` で雛形生成） |
| 定型作業をコマンド化 | `.claude/commands/<name>.md` を作り `/<name>` で呼ぶ |
| 手順つきの専門タスクを定義 | `.claude/skills/<name>/SKILL.md` を作る |
| 権限確認を減らす | `.claude/settings.json` の `permissions.allow` に追記 |
| 外部サービスと連携 | MCP サーバーを追加する |

## 検証ログ

試したことと結果をここに追記していく。

| 日付 | 試したこと | 結果 |
| --- | --- | --- |
| 2026-09-05 | リポジトリ作成 | - |
