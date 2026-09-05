/** カンバンの列に対応するタスクの状態 */
export type TaskStatus = "todo" | "in-progress" | "done";

export type Task = {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  /** 締切日。"YYYY-MM-DD" 形式。未設定なら null */
  dueDate: string | null;
  /** カテゴリの ID。未設定なら null */
  categoryId: string | null;
  /** アーカイブ済みのタスクはボードに表示せず、アーカイブ一覧に回す */
  archived: boolean;
};

/** タスク新規作成時にユーザーが入力する値 */
export type TaskDraft = {
  title: string;
  description: string;
  dueDate?: string | null;
  categoryId?: string | null;
};

/** 詳細画面から編集できる項目 */
export type TaskEdit = Partial<
  Pick<Task, "title" | "description" | "status" | "dueDate" | "categoryId">
>;

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
