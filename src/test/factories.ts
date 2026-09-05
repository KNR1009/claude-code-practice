import type { Category } from "@/types/category";
import type { Task } from "@/types/task";

/** テスト用のタスク。必要な項目だけ上書きして使う */
export function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: "1",
    title: "設計する",
    description: "画面構成",
    status: "todo",
    dueDate: null,
    categoryId: null,
    archived: false,
    ...overrides,
  };
}

/** テスト用のカテゴリ */
export function makeCategory(overrides: Partial<Category> = {}): Category {
  return { id: "work", label: "仕事", color: "#2563eb", ...overrides };
}
