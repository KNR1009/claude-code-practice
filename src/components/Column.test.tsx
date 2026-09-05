import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Column } from "@/components/Column";
import { createDataTransfer } from "@/test/dataTransfer";
import { makeCategory, makeTask } from "@/test/factories";
import type { TaskStatus } from "@/types/task";

const tasks = [
  makeTask({ id: "1" }),
  makeTask({ id: "2", title: "実装する", description: "" }),
];

const renderColumn = () => {
  const onDropTask =
    vi.fn<
      (taskId: string, status: TaskStatus, beforeTaskId: string | null) => void
    >();
  const onSelectTask = vi.fn<(taskId: string) => void>();
  render(
    <Column
      status="todo"
      label="未着手"
      tasks={tasks}
      categories={[makeCategory()]}
      today="2026-09-05"
      onDropTask={onDropTask}
      onSelectTask={onSelectTask}
    />,
  );
  return { onDropTask, onSelectTask };
};

describe("Column", () => {
  it("列名・件数・タスクを表示する", () => {
    renderColumn();

    expect(screen.getByRole("heading", { name: "未着手" })).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("設計する")).toBeInTheDocument();
    expect(screen.getByText("画面構成")).toBeInTheDocument();
  });

  it("タスクが無い列にはプレースホルダを表示する", () => {
    render(
      <Column
        status="done"
        label="完了"
        tasks={[]}
        categories={[]}
        today={null}
        onDropTask={vi.fn()}
        onSelectTask={vi.fn()}
      />,
    );

    expect(screen.getByText("タスクなし")).toBeInTheDocument();
  });

  it("ドロップされたタスク ID と自分の状態を onDropTask に渡す", () => {
    const { onDropTask } = renderColumn();
    const dataTransfer = createDataTransfer();
    dataTransfer.setData("text/plain", "42");

    fireEvent.drop(screen.getByTestId("column-todo"), { dataTransfer });

    // 列の余白へのドロップは末尾（beforeTaskId は null）
    expect(onDropTask).toHaveBeenCalledWith("42", "todo", null);
  });

  it("ID を持たないドロップは無視する", () => {
    const { onDropTask } = renderColumn();

    fireEvent.drop(screen.getByTestId("column-todo"), {
      dataTransfer: createDataTransfer(),
    });

    expect(onDropTask).not.toHaveBeenCalled();
  });

  it("dragOver を preventDefault してドロップを許可する", () => {
    renderColumn();

    const dragOver = fireEvent.dragOver(screen.getByTestId("column-todo"), {
      dataTransfer: createDataTransfer(),
    });

    // fireEvent は preventDefault されると false を返す
    expect(dragOver).toBe(false);
  });

  it("カードの上へのドロップは、その位置を beforeTaskId として渡す", () => {
    const { onDropTask } = renderColumn();
    const dataTransfer = createDataTransfer();
    dataTransfer.setData("text/plain", "42");

    // jsdom では矩形が 0 で clientY も載らないため side は "after" になる
    // （上下の判定そのものは lib/dnd.test.ts と TaskCard.test.tsx で確認する）。
    // 1 件目の後ろ = 2 件目の直前
    fireEvent.drop(screen.getByTestId("task-1"), { dataTransfer });

    expect(onDropTask).toHaveBeenCalledWith("42", "todo", "2");
  });

  it("末尾のカードの後ろへのドロップは beforeTaskId が null になる", () => {
    const { onDropTask } = renderColumn();
    const dataTransfer = createDataTransfer();
    dataTransfer.setData("text/plain", "42");

    fireEvent.drop(screen.getByTestId("task-2"), { dataTransfer });

    expect(onDropTask).toHaveBeenCalledWith("42", "todo", null);
  });

  it("カードへのドロップは列まで伝播せず、1 回だけ通知される", () => {
    const { onDropTask } = renderColumn();
    const dataTransfer = createDataTransfer();
    dataTransfer.setData("text/plain", "42");

    fireEvent.drop(screen.getByTestId("task-1"), { dataTransfer });

    expect(onDropTask).toHaveBeenCalledTimes(1);
  });

  it("絞り込み中の空の列には該当なしと表示する", () => {
    render(
      <Column
        status="done"
        label="完了"
        tasks={[]}
        categories={[]}
        today={null}
        filtered
        onDropTask={vi.fn()}
        onSelectTask={vi.fn()}
      />,
    );

    expect(screen.getByText("該当なし")).toBeInTheDocument();
  });

  it("カードのクリックを onSelectTask に伝える", async () => {
    const user = userEvent.setup();
    const { onSelectTask } = renderColumn();

    await user.click(screen.getByTestId("task-2"));

    expect(onSelectTask).toHaveBeenCalledWith("2");
  });
});
