/** カンバンの列に対応するタスクの状態 */
export type TaskStatus = "todo" | "in-progress" | "done";

export type Task = {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
};

/** タスク新規作成時にユーザーが入力する値 */
export type TaskDraft = {
  title: string;
  description: string;
};

export type Column = {
  status: TaskStatus;
  label: string;
};

/** 画面に表示する列の定義と並び順 */
export const COLUMNS: readonly Column[] = [
  { status: "todo", label: "未着手" },
  { status: "in-progress", label: "進行中" },
  { status: "done", label: "完了" },
] as const;
