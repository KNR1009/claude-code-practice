import type { Task } from "@/types/task";

/** テスト用のタスク。必要な項目だけ上書きして使う */
export function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: "1",
    title: "設計する",
    description: "画面構成",
    status: "todo",
    dueDate: null,
    categoryId: "none",
    archived: false,
    ...overrides,
  };
}
