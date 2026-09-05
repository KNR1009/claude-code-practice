import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Column } from "@/components/Column";
import { createDataTransfer } from "@/test/dataTransfer";
import type { Task } from "@/types/task";

const tasks: Task[] = [
  { id: "1", title: "設計する", description: "画面構成", status: "todo" },
  { id: "2", title: "実装する", description: "", status: "todo" },
];

const renderColumn = (onDropTask = vi.fn()) => {
  render(
    <Column
      status="todo"
      label="未着手"
      tasks={tasks}
      onDropTask={onDropTask}
    />,
  );
  return onDropTask;
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
      <Column status="done" label="完了" tasks={[]} onDropTask={vi.fn()} />,
    );

    expect(screen.getByText("タスクなし")).toBeInTheDocument();
  });

  it("ドロップされたタスク ID と自分の状態を onDropTask に渡す", () => {
    const onDropTask = renderColumn();
    const dataTransfer = createDataTransfer();
    dataTransfer.setData("text/plain", "42");

    fireEvent.drop(screen.getByTestId("column-todo"), { dataTransfer });

    expect(onDropTask).toHaveBeenCalledWith("42", "todo");
  });

  it("ID を持たないドロップは無視する", () => {
    const onDropTask = renderColumn();

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
});
