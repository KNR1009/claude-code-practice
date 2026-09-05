import { describe, expect, it } from "vitest";
import {
  activeTasks,
  addTask,
  archivedTasks,
  clearCategory,
  countTasksByCategory,
  createTask,
  deleteTask,
  findTask,
  isValidDraft,
  moveTask,
  setArchived,
  tasksByStatus,
  updateTask,
} from "@/lib/task";
import { makeTask } from "@/test/factories";
import type { Task } from "@/types/task";

const task = (id: string, overrides: Partial<Task> = {}) =>
  makeTask({ id, title: `task ${id}`, description: "", ...overrides });

describe("isValidDraft", () => {
  it("タイトルがあれば有効", () => {
    expect(isValidDraft({ title: "設計する", description: "" })).toBe(true);
  });

  it("タイトルが空白のみなら無効", () => {
    expect(isValidDraft({ title: "   ", description: "説明" })).toBe(false);
  });
});

describe("createTask", () => {
  it("未着手・未アーカイブで生成し、前後の空白を落とす", () => {
    const created = createTask(
      { title: "  設計する  ", description: "  詳細  " },
      () => "id-1",
    );

    expect(created).toEqual({
      id: "id-1",
      title: "設計する",
      description: "詳細",
      status: "todo",
      dueDate: null,
      categoryId: null,
      archived: false,
    });
  });

  it("締切日とカテゴリを指定できる", () => {
    const created = createTask(
      {
        title: "設計する",
        description: "",
        dueDate: "2026-09-30",
        categoryId: "work",
      },
      () => "id-1",
    );

    expect(created.dueDate).toBe("2026-09-30");
    expect(created.categoryId).toBe("work");
  });

  it("空文字の締切日は未設定として扱う", () => {
    const created = createTask(
      { title: "設計する", description: "", dueDate: "" },
      () => "id-1",
    );

    expect(created.dueDate).toBeNull();
  });

  it("ID 生成関数を呼び出して一意な ID を振る", () => {
    let count = 0;
    const generateId = () => `id-${++count}`;

    expect(createTask({ title: "A", description: "" }, generateId).id).toBe(
      "id-1",
    );
    expect(createTask({ title: "B", description: "" }, generateId).id).toBe(
      "id-2",
    );
  });
});

describe("addTask", () => {
  it("末尾に追加した新しい配列を返し、元の配列は変更しない", () => {
    const tasks = [task("1")];
    const added = addTask(tasks, task("2"));

    expect(added.map((t) => t.id)).toEqual(["1", "2"]);
    expect(tasks).toHaveLength(1);
  });
});

describe("moveTask", () => {
  it("指定したタスクの状態だけを変更する", () => {
    const tasks = [task("1"), task("2")];
    const moved = moveTask(tasks, "2", "done");

    expect(moved.find((t) => t.id === "2")?.status).toBe("done");
    expect(moved.find((t) => t.id === "1")?.status).toBe("todo");
  });

  it("元の配列を変更しない", () => {
    const tasks = [task("1")];
    moveTask(tasks, "1", "in-progress");

    expect(tasks[0].status).toBe("todo");
  });

  it("存在しない ID なら中身は変わらない", () => {
    const tasks = [task("1")];
    expect(moveTask(tasks, "unknown", "done")).toEqual(tasks);
  });

  it("同じ状態への移動ではオブジェクトを作り直さない", () => {
    const tasks = [task("1")];
    expect(moveTask(tasks, "1", "todo")[0]).toBe(tasks[0]);
  });

  it("並び順を保つ", () => {
    const tasks = [task("1"), task("2"), task("3")];
    expect(moveTask(tasks, "1", "done").map((t) => t.id)).toEqual([
      "1",
      "2",
      "3",
    ]);
  });
});

describe("updateTask", () => {
  it("指定タスクの編集内容だけを反映する", () => {
    const tasks = [task("1"), task("2")];
    const updated = updateTask(tasks, "1", {
      title: "設計を見直す",
      dueDate: "2026-10-01",
      categoryId: "urgent",
      status: "in-progress",
    });

    expect(updated[0]).toMatchObject({
      title: "設計を見直す",
      dueDate: "2026-10-01",
      categoryId: "urgent",
      status: "in-progress",
    });
    expect(updated[1]).toEqual(tasks[1]);
  });

  it("タイトルと説明の前後の空白を落とす", () => {
    const updated = updateTask([task("1")], "1", {
      title: "  新タイトル  ",
      description: "  新説明  ",
    });

    expect(updated[0].title).toBe("新タイトル");
    expect(updated[0].description).toBe("新説明");
  });

  it("空タイトルへの更新は無視して元のタイトルを保つ", () => {
    const updated = updateTask([task("1", { title: "元のまま" })], "1", {
      title: "   ",
    });

    expect(updated[0].title).toBe("元のまま");
  });

  it("締切日を空文字で渡すと未設定になる", () => {
    const updated = updateTask([task("1", { dueDate: "2026-09-30" })], "1", {
      dueDate: "",
    });

    expect(updated[0].dueDate).toBeNull();
  });

  it("元の配列を変更しない", () => {
    const tasks = [task("1")];
    updateTask(tasks, "1", { title: "変更後" });

    expect(tasks[0].title).toBe("task 1");
  });
});

describe("deleteTask", () => {
  it("指定タスクを取り除く", () => {
    const tasks = [task("1"), task("2")];
    expect(deleteTask(tasks, "1").map((t) => t.id)).toEqual(["2"]);
    expect(tasks).toHaveLength(2);
  });

  it("存在しない ID なら変化しない", () => {
    const tasks = [task("1")];
    expect(deleteTask(tasks, "unknown")).toEqual(tasks);
  });
});

describe("setArchived", () => {
  it("アーカイブ状態を切り替える", () => {
    const tasks = [task("1")];
    const archivedList = setArchived(tasks, "1", true);

    expect(archivedList[0].archived).toBe(true);
    expect(setArchived(archivedList, "1", false)[0].archived).toBe(false);
    expect(tasks[0].archived).toBe(false);
  });

  it("状態が同じならオブジェクトを作り直さない", () => {
    const tasks = [task("1")];
    expect(setArchived(tasks, "1", false)[0]).toBe(tasks[0]);
  });
});

describe("activeTasks / archivedTasks", () => {
  const tasks = [task("1"), task("2", { archived: true })];

  it("未アーカイブとアーカイブ済みを分けて取り出す", () => {
    expect(activeTasks(tasks).map((t) => t.id)).toEqual(["1"]);
    expect(archivedTasks(tasks).map((t) => t.id)).toEqual(["2"]);
  });
});

describe("tasksByStatus", () => {
  it("該当する状態のタスクだけを元の順で返す", () => {
    const tasks = [task("1"), task("2", { status: "done" }), task("3")];

    expect(tasksByStatus(tasks, "todo").map((t) => t.id)).toEqual(["1", "3"]);
    expect(tasksByStatus(tasks, "in-progress")).toEqual([]);
  });

  it("アーカイブ済みのタスクは含めない", () => {
    const tasks = [task("1"), task("2", { archived: true })];
    expect(tasksByStatus(tasks, "todo").map((t) => t.id)).toEqual(["1"]);
  });
});

describe("clearCategory", () => {
  it("そのカテゴリを参照しているタスクからだけカテゴリを外す", () => {
    const tasks = [
      task("1", { categoryId: "work" }),
      task("2", { categoryId: "urgent" }),
    ];
    const cleared = clearCategory(tasks, "work");

    expect(cleared[0].categoryId).toBeNull();
    expect(cleared[1].categoryId).toBe("urgent");
    expect(tasks[0].categoryId).toBe("work");
  });
});

describe("countTasksByCategory", () => {
  it("アーカイブ済みも含めて件数を数える", () => {
    const tasks = [
      task("1", { categoryId: "work" }),
      task("2", { categoryId: "work", archived: true }),
      task("3", { categoryId: null }),
    ];

    expect(countTasksByCategory(tasks, "work")).toBe(2);
    expect(countTasksByCategory(tasks, "urgent")).toBe(0);
  });
});

describe("findTask", () => {
  const tasks = [task("1"), task("2")];

  it("ID に一致するタスクを返す", () => {
    expect(findTask(tasks, "2")?.id).toBe("2");
  });

  it("未選択や未知の ID なら null を返す", () => {
    expect(findTask(tasks, null)).toBeNull();
    expect(findTask(tasks, "unknown")).toBeNull();
  });
});
