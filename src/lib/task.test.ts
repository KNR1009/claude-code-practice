import { describe, expect, it } from "vitest";
import {
  addTask,
  createTask,
  isValidDraft,
  moveTask,
  tasksByStatus,
} from "@/lib/task";
import type { Task } from "@/types/task";

const task = (id: string, status: Task["status"]): Task => ({
  id,
  title: `task ${id}`,
  description: "",
  status,
});

describe("isValidDraft", () => {
  it("タイトルがあれば有効", () => {
    expect(isValidDraft({ title: "設計する", description: "" })).toBe(true);
  });

  it("タイトルが空白のみなら無効", () => {
    expect(isValidDraft({ title: "   ", description: "説明" })).toBe(false);
  });
});

describe("createTask", () => {
  it("未着手のタスクを生成し、前後の空白を落とす", () => {
    const created = createTask(
      { title: "  設計する  ", description: "  詳細  " },
      () => "id-1",
    );

    expect(created).toEqual({
      id: "id-1",
      title: "設計する",
      description: "詳細",
      status: "todo",
    });
  });

  it("ID 生成関数を呼び出して一意な ID を振る", () => {
    let count = 0;
    const generateId = () => `id-${++count}`;

    const first = createTask({ title: "A", description: "" }, generateId);
    const second = createTask({ title: "B", description: "" }, generateId);

    expect(first.id).toBe("id-1");
    expect(second.id).toBe("id-2");
  });
});

describe("addTask", () => {
  it("末尾に追加した新しい配列を返し、元の配列は変更しない", () => {
    const tasks = [task("1", "todo")];
    const added = addTask(tasks, task("2", "todo"));

    expect(added.map((t) => t.id)).toEqual(["1", "2"]);
    expect(tasks).toHaveLength(1);
  });
});

describe("moveTask", () => {
  it("指定したタスクの状態だけを変更する", () => {
    const tasks = [task("1", "todo"), task("2", "todo")];
    const moved = moveTask(tasks, "2", "done");

    expect(moved.find((t) => t.id === "2")?.status).toBe("done");
    expect(moved.find((t) => t.id === "1")?.status).toBe("todo");
  });

  it("元の配列を変更しない", () => {
    const tasks = [task("1", "todo")];
    moveTask(tasks, "1", "in-progress");

    expect(tasks[0].status).toBe("todo");
  });

  it("存在しない ID なら中身は変わらない", () => {
    const tasks = [task("1", "todo")];
    expect(moveTask(tasks, "unknown", "done")).toEqual(tasks);
  });

  it("同じ状態への移動ではオブジェクトを作り直さない", () => {
    const tasks = [task("1", "todo")];
    expect(moveTask(tasks, "1", "todo")[0]).toBe(tasks[0]);
  });

  it("並び順を保つ", () => {
    const tasks = [task("1", "todo"), task("2", "todo"), task("3", "todo")];
    expect(moveTask(tasks, "1", "done").map((t) => t.id)).toEqual([
      "1",
      "2",
      "3",
    ]);
  });
});

describe("tasksByStatus", () => {
  it("該当する状態のタスクだけを元の順で返す", () => {
    const tasks = [
      task("1", "todo"),
      task("2", "done"),
      task("3", "todo"),
    ];

    expect(tasksByStatus(tasks, "todo").map((t) => t.id)).toEqual(["1", "3"]);
    expect(tasksByStatus(tasks, "in-progress")).toEqual([]);
  });
});
