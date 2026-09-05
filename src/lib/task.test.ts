import { describe, expect, it } from "vitest";
import {
  activeTasks,
  addTask,
  archivedTasks,
  clearCategory,
  countTasksByCategory,
  createTask,
  deleteTask,
  filterTasks,
  findTask,
  isFilterActive,
  isValidDraft,
  matchesFilter,
  moveTask,
  moveTaskTo,
  setArchived,
  tasksByStatus,
  updateTask,
} from "@/lib/task";
import { makeTask } from "@/test/factories";
import {
  CATEGORY_ALL,
  CATEGORY_NONE,
  EMPTY_FILTER,
  type Task,
  type TaskFilter,
} from "@/types/task";

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

describe("moveTaskTo", () => {
  const ids = (tasks: readonly Task[]) => tasks.map((item) => item.id);

  it("同じ列で上へ動かす", () => {
    const tasks = [task("1"), task("2"), task("3")];

    expect(ids(moveTaskTo(tasks, "3", "todo", "1"))).toEqual(["3", "1", "2"]);
  });

  it("同じ列で下へ動かす", () => {
    const tasks = [task("1"), task("2"), task("3")];

    expect(ids(moveTaskTo(tasks, "1", "todo", "3"))).toEqual(["2", "1", "3"]);
  });

  it("beforeTaskId が null なら、その列の末尾へ置く", () => {
    const tasks = [
      task("1"),
      task("2", { status: "done" }),
      task("3"),
      task("4", { status: "done" }),
    ];
    const moved = moveTaskTo(tasks, "1", "todo", null);

    // 最後の todo（"3"）の直後に入り、done の "4" は飛び越えない
    expect(ids(moved)).toEqual(["2", "3", "1", "4"]);
  });

  it("別の列へ位置を指定して移す", () => {
    const tasks = [
      task("1"),
      task("2", { status: "done" }),
      task("3", { status: "done" }),
    ];
    const moved = moveTaskTo(tasks, "1", "done", "3");

    expect(ids(moved)).toEqual(["2", "1", "3"]);
    expect(moved[1].status).toBe("done");
  });

  it("空の列へ移すと配列の末尾に入る", () => {
    const tasks = [task("1"), task("2")];
    const moved = moveTaskTo(tasks, "1", "in-progress", null);

    expect(ids(moved)).toEqual(["2", "1"]);
    expect(moved[1].status).toBe("in-progress");
  });

  it("自分自身の上に落としても位置は変えず、状態だけ合わせる", () => {
    const tasks = [task("1"), task("2"), task("3")];
    const moved = moveTaskTo(tasks, "2", "done", "2");

    expect(ids(moved)).toEqual(["1", "2", "3"]);
    expect(moved[1].status).toBe("done");
  });

  it("知らない beforeTaskId は列の末尾として扱う", () => {
    const tasks = [task("1"), task("2"), task("3")];

    expect(ids(moveTaskTo(tasks, "1", "todo", "unknown"))).toEqual([
      "2",
      "3",
      "1",
    ]);
  });

  it("知らないタスク ID なら並びを変えない", () => {
    const tasks = [task("1"), task("2")];

    expect(ids(moveTaskTo(tasks, "unknown", "done", null))).toEqual(["1", "2"]);
  });

  it("元の配列を書き換えない", () => {
    const tasks = [task("1"), task("2"), task("3")];
    moveTaskTo(tasks, "3", "done", "1");

    expect(ids(tasks)).toEqual(["1", "2", "3"]);
    expect(tasks[2].status).toBe("todo");
  });
});

describe("filterTasks", () => {
  const today = "2026-09-05";
  const filter = (overrides: Partial<TaskFilter> = {}): TaskFilter => ({
    ...EMPTY_FILTER,
    ...overrides,
  });

  const tasks = [
    task("1", { title: "設計する", description: "画面構成", categoryId: "work" }),
    task("2", { title: "Deploy", description: "本番へ", dueDate: "2026-09-01" }),
    task("3", { title: "レビュー", description: "", dueDate: "2026-09-05" }),
    task("4", { title: "調査", description: "", dueDate: "2026-09-30" }),
  ];

  const ids = (filtered: readonly Task[]) => filtered.map((item) => item.id);

  it("条件が空なら全件返す", () => {
    expect(ids(filterTasks(tasks, filter(), today))).toEqual([
      "1",
      "2",
      "3",
      "4",
    ]);
  });

  it("キーワードはタイトルと説明の両方に効く", () => {
    expect(ids(filterTasks(tasks, filter({ keyword: "設計" }), today))).toEqual([
      "1",
    ]);
    expect(ids(filterTasks(tasks, filter({ keyword: "画面" }), today))).toEqual([
      "1",
    ]);
  });

  it("キーワードは大文字小文字を区別せず、前後の空白を無視する", () => {
    expect(
      ids(filterTasks(tasks, filter({ keyword: "  deploy " }), today)),
    ).toEqual(["2"]);
  });

  it("一致しないキーワードでは空になる", () => {
    expect(filterTasks(tasks, filter({ keyword: "存在しない" }), today)).toEqual(
      [],
    );
  });

  it("カテゴリ ID で絞る", () => {
    expect(ids(filterTasks(tasks, filter({ category: "work" }), today))).toEqual(
      ["1"],
    );
  });

  it("カテゴリなしで絞ると未設定のタスクだけになる", () => {
    expect(
      ids(filterTasks(tasks, filter({ category: CATEGORY_NONE }), today)),
    ).toEqual(["2", "3", "4"]);
  });

  it("締切の状態で絞る", () => {
    expect(ids(filterTasks(tasks, filter({ due: "overdue" }), today))).toEqual([
      "2",
    ]);
    expect(ids(filterTasks(tasks, filter({ due: "today" }), today))).toEqual([
      "3",
    ]);
    expect(ids(filterTasks(tasks, filter({ due: "upcoming" }), today))).toEqual([
      "4",
    ]);
    expect(ids(filterTasks(tasks, filter({ due: "none" }), today))).toEqual([
      "1",
    ]);
  });

  it("today が未確定なら締切の条件を無視して全件通す", () => {
    expect(ids(filterTasks(tasks, filter({ due: "overdue" }), null))).toEqual([
      "1",
      "2",
      "3",
      "4",
    ]);
  });

  it("today が未確定でも締切なしの絞り込みは効く", () => {
    expect(ids(filterTasks(tasks, filter({ due: "none" }), null))).toEqual(["1"]);
  });

  it("複数の条件は AND で効く", () => {
    const result = filterTasks(
      tasks,
      filter({ keyword: "レビュー", due: "today" }),
      today,
    );

    expect(ids(result)).toEqual(["3"]);
  });

  it("元の配列を書き換えない", () => {
    filterTasks(tasks, filter({ keyword: "設計" }), today);

    expect(tasks).toHaveLength(4);
  });

  it("matchesFilter は 1 件の判定を返す", () => {
    expect(matchesFilter(tasks[0], filter({ keyword: "設計" }), today)).toBe(
      true,
    );
    expect(matchesFilter(tasks[1], filter({ keyword: "設計" }), today)).toBe(
      false,
    );
  });
});

describe("isFilterActive", () => {
  it("何も絞っていなければ false", () => {
    expect(isFilterActive(EMPTY_FILTER)).toBe(false);
    expect(isFilterActive({ ...EMPTY_FILTER, keyword: "   " })).toBe(false);
  });

  it("いずれかの条件が入っていれば true", () => {
    expect(isFilterActive({ ...EMPTY_FILTER, keyword: "設計" })).toBe(true);
    expect(isFilterActive({ ...EMPTY_FILTER, category: CATEGORY_NONE })).toBe(
      true,
    );
    expect(isFilterActive({ ...EMPTY_FILTER, due: "today" })).toBe(true);
    expect(isFilterActive({ ...EMPTY_FILTER, category: CATEGORY_ALL })).toBe(
      false,
    );
  });
});
