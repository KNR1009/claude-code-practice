import type { Task, TaskDraft, TaskStatus } from "@/types/task";

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

/** 指定した列に属するタスクだけを元の並び順で取り出す */
export function tasksByStatus(
  tasks: readonly Task[],
  status: TaskStatus,
): Task[] {
  return tasks.filter((task) => task.status === status);
}
