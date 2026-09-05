/** カンバンの列に対応するタスクの状態 */
export type TaskStatus = "todo" | "in-progress" | "done";

/** タスクに付与できるカテゴリ。カード背景色の元になる */
export type CategoryId =
  | "none"
  | "work"
  | "personal"
  | "urgent"
  | "study"
  | "idea";

export type Task = {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  /** 締切日。"YYYY-MM-DD" 形式。未設定なら null */
  dueDate: string | null;
  categoryId: CategoryId;
  /** アーカイブ済みのタスクはボードに表示せず、アーカイブ一覧に回す */
  archived: boolean;
};

/** タスク新規作成時にユーザーが入力する値 */
export type TaskDraft = {
  title: string;
  description: string;
  dueDate?: string | null;
  categoryId?: CategoryId;
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

export type Category = {
  id: CategoryId;
  label: string;
  /** カード背景・バッジの元になる色 */
  color: string;
};

export const CATEGORIES: readonly Category[] = [
  { id: "none", label: "なし", color: "transparent" },
  { id: "work", label: "仕事", color: "#2563eb" },
  { id: "personal", label: "プライベート", color: "#16a34a" },
  { id: "urgent", label: "緊急", color: "#dc2626" },
  { id: "study", label: "学習", color: "#9333ea" },
  { id: "idea", label: "アイデア", color: "#ea580c" },
] as const;

export function findCategory(categoryId: CategoryId): Category {
  return CATEGORIES.find((category) => category.id === categoryId) ?? CATEGORIES[0];
}
