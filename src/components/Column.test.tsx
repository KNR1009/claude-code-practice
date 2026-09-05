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
  const onDropTask = vi.fn<(taskId: string, status: TaskStatus) => void>();
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

    expect(onDropTask).toHaveBeenCalledWith("42", "todo");
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

  it("カードのクリックを onSelectTask に伝える", async () => {
    const user = userEvent.setup();
    const { onSelectTask } = renderColumn();

    await user.click(screen.getByTestId("task-2"));

    expect(onSelectTask).toHaveBeenCalledWith("2");
  });
});
