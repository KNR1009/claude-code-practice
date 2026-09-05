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

/** 締切による絞り込みの選択肢 */
export type DueFilter = "all" | "overdue" | "today" | "upcoming" | "none";

/** カテゴリで絞らないことを表す番兵。Category.id とは衝突しない */
export const CATEGORY_ALL = "all";
/** カテゴリ未設定のタスクだけに絞ることを表す番兵 */
export const CATEGORY_NONE = "none";

/** ボードの絞り込み条件 */
export type TaskFilter = {
  /** タイトル・説明への部分一致。空文字なら絞らない */
  keyword: string;
  /** CATEGORY_ALL / CATEGORY_NONE / Category.id のいずれか */
  category: string;
  due: DueFilter;
};

/** 何も絞っていない状態 */
export const EMPTY_FILTER: TaskFilter = {
  keyword: "",
  category: CATEGORY_ALL,
  due: "all",
};
