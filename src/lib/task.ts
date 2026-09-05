import type { Task, TaskDraft, TaskEdit, TaskStatus } from "@/types/task";

/** ID 生成関数。テストからは決定的な実装を差し込める */
export type IdGenerator = () => string;

export const defaultIdGenerator: IdGenerator = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `task-${Math.random().toString(36).slice(2)}`;

/** タイトルが空（空白のみを含む）の下書きは不正とみなす */
export function isValidDraft(draft: TaskDraft): boolean {
  return draft.title.trim().length > 0;
}

/** 下書きから未着手のタスクを作る。前後の空白は落とす */
export function createTask(
  draft: TaskDraft,
  generateId: IdGenerator = defaultIdGenerator,
): Task {
  return {
    id: generateId(),
    title: draft.title.trim(),
    description: draft.description.trim(),
    status: "todo",
    dueDate: draft.dueDate?.trim() ? draft.dueDate : null,
    categoryId: draft.categoryId ?? null,
    archived: false,
  };
}

/** タスクを末尾に追加した新しい配列を返す */
export function addTask(tasks: readonly Task[], task: Task): Task[] {
  return [...tasks, task];
}

/**
 * 指定タスクの状態を変更した新しい配列を返す。
 * 該当 ID がない場合や状態が変わらない場合は元の並びのまま返す。
 */
export function moveTask(
  tasks: readonly Task[],
  taskId: string,
  status: TaskStatus,
): Task[] {
  return tasks.map((task) =>
    task.id === taskId && task.status !== status ? { ...task, status } : task,
  );
}

/** 指定タスクに編集内容を反映した新しい配列を返す。空タイトルは無視する */
export function updateTask(
  tasks: readonly Task[],
  taskId: string,
  edit: TaskEdit,
): Task[] {
  return tasks.map((task) => {
    if (task.id !== taskId) return task;
    const title = edit.title?.trim();
    return {
      ...task,
      ...edit,
      title: title ? title : task.title,
      description: edit.description?.trim() ?? task.description,
      dueDate: edit.dueDate === undefined ? task.dueDate : edit.dueDate || null,
    };
  });
}

/** 指定タスクを取り除いた新しい配列を返す */
export function deleteTask(tasks: readonly Task[], taskId: string): Task[] {
  return tasks.filter((task) => task.id !== taskId);
}

/** アーカイブ状態を切り替えた新しい配列を返す */
export function setArchived(
  tasks: readonly Task[],
  taskId: string,
  archived: boolean,
): Task[] {
  return tasks.map((task) =>
    task.id === taskId && task.archived !== archived
      ? { ...task, archived }
      : task,
  );
}

/** ボードに表示するタスク（未アーカイブ） */
export function activeTasks(tasks: readonly Task[]): Task[] {
  return tasks.filter((task) => !task.archived);
}

/** アーカイブ一覧に表示するタスク */
export function archivedTasks(tasks: readonly Task[]): Task[] {
  return tasks.filter((task) => task.archived);
}

/** 指定した列に属する未アーカイブのタスクを元の並び順で取り出す */
export function tasksByStatus(
  tasks: readonly Task[],
  status: TaskStatus,
): Task[] {
  return activeTasks(tasks).filter((task) => task.status === status);
}

/** ID からタスクを引く。見つからなければ null */
export function findTask(tasks: readonly Task[], taskId: string | null): Task | null {
  if (!taskId) return null;
  return tasks.find((task) => task.id === taskId) ?? null;
}

/** 削除されたカテゴリを参照しているタスクから、そのカテゴリを外す */
export function clearCategory(
  tasks: readonly Task[],
  categoryId: string,
): Task[] {
  return tasks.map((task) =>
    task.categoryId === categoryId ? { ...task, categoryId: null } : task,
  );
}

/** そのカテゴリが付いているタスクの件数 */
export function countTasksByCategory(
  tasks: readonly Task[],
  categoryId: string,
): number {
  return tasks.filter((task) => task.categoryId === categoryId).length;
}
