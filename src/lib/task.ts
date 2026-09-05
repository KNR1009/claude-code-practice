import { dueState } from "@/lib/date";
import { CATEGORY_ALL, CATEGORY_NONE } from "@/types/task";
import type {
  Task,
  TaskDraft,
  TaskEdit,
  TaskFilter,
  TaskStatus,
} from "@/types/task";

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

/**
 * 差し込み位置を決める。beforeTaskId があればその直前、
 * 無ければ同じ列の最後のタスクの次（その列が空なら配列の末尾）。
 */
function insertionIndex(
  tasks: readonly Task[],
  status: TaskStatus,
  beforeTaskId: string | null,
): number {
  if (beforeTaskId) {
    const index = tasks.findIndex((task) => task.id === beforeTaskId);
    if (index >= 0) return index;
  }
  let last = -1;
  tasks.forEach((task, index) => {
    if (task.status === status) last = index;
  });
  return last === -1 ? tasks.length : last + 1;
}

/**
 * タスクを status の列へ移し、beforeTaskId の直前に差し込んだ新しい配列を返す。
 * beforeTaskId が null なら、その列の末尾へ置く。
 *
 * 列内の並び順は配列内の相対順序そのものなので、差し込み直すだけで並び替えになる。
 */
export function moveTaskTo(
  tasks: readonly Task[],
  taskId: string,
  status: TaskStatus,
  beforeTaskId: string | null,
): Task[] {
  const target = tasks.find((task) => task.id === taskId);
  if (!target) return [...tasks];
  // 自分自身の上に落としたときは位置を変えず、状態だけ合わせる
  if (beforeTaskId === taskId) return moveTask(tasks, taskId, status);

  const rest = tasks.filter((task) => task.id !== taskId);
  const index = insertionIndex(rest, status, beforeTaskId);
  return [...rest.slice(0, index), { ...target, status }, ...rest.slice(index)];
}

function matchesKeyword(task: Task, keyword: string): boolean {
  const needle = keyword.trim().toLowerCase();
  if (!needle) return true;
  return (
    task.title.toLowerCase().includes(needle) ||
    task.description.toLowerCase().includes(needle)
  );
}

function matchesCategory(task: Task, category: string): boolean {
  if (category === CATEGORY_ALL) return true;
  if (category === CATEGORY_NONE) return task.categoryId === null;
  return task.categoryId === category;
}

function matchesDue(
  task: Task,
  due: TaskFilter["due"],
  today: string | null,
): boolean {
  if (due === "all") return true;
  if (due === "none") return task.dueDate === null;
  // 今日が確定するまで（useToday がマウント後に返すまで）は締切条件を評価しない。
  // ここで弾くと初回描画で一瞬カードが消える
  if (!today) return true;
  if (task.dueDate === null) return false;
  return dueState(task.dueDate, today) === due;
}

/** 1 件のタスクが絞り込み条件に合うか */
export function matchesFilter(
  task: Task,
  filter: TaskFilter,
  today: string | null,
): boolean {
  return (
    matchesKeyword(task, filter.keyword) &&
    matchesCategory(task, filter.category) &&
    matchesDue(task, filter.due, today)
  );
}

/** 絞り込み条件に合うタスクだけを元の並び順で返す */
export function filterTasks(
  tasks: readonly Task[],
  filter: TaskFilter,
  today: string | null,
): Task[] {
  return tasks.filter((task) => matchesFilter(task, filter, today));
}

/** 何か 1 つでも絞り込みが効いているか。クリアボタンの表示判定に使う */
export function isFilterActive(filter: TaskFilter): boolean {
  return (
    filter.keyword.trim().length > 0 ||
    filter.category !== CATEGORY_ALL ||
    filter.due !== "all"
  );
}
