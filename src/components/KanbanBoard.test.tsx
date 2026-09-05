import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { KanbanBoard } from "@/components/KanbanBoard";
import { createDataTransfer } from "@/test/dataTransfer";
import type { Task } from "@/types/task";

const initialTasks: Task[] = [
  { id: "1", title: "設計する", description: "画面構成", status: "todo" },
];

/** カード → 列 のドラッグ＆ドロップを再現する */
const dragCardTo = (card: HTMLElement, column: HTMLElement) => {
  const dataTransfer = createDataTransfer();
  fireEvent.dragStart(card, { dataTransfer });
  fireEvent.dragOver(column, { dataTransfer });
  fireEvent.drop(column, { dataTransfer });
};

describe("KanbanBoard", () => {
  it("3 つの列を表示する", () => {
    render(<KanbanBoard />);

    expect(screen.getByRole("heading", { name: "未着手" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "進行中" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "完了" })).toBeInTheDocument();
  });

  it("追加したタスクは未着手の列に並ぶ", async () => {
    const user = userEvent.setup();
    render(<KanbanBoard />);

    await user.type(screen.getByLabelText("タイトル"), "設計する");
    await user.type(screen.getByLabelText("説明"), "画面構成");
    await user.click(screen.getByRole("button", { name: "追加" }));

    const todo = screen.getByTestId("column-todo");
    expect(within(todo).getByText("設計する")).toBeInTheDocument();
    expect(within(todo).getByText("画面構成")).toBeInTheDocument();
  });

  it("カードをドラッグ＆ドロップすると別の列へ移動する", () => {
    render(<KanbanBoard initialTasks={initialTasks} />);

    dragCardTo(
      screen.getByTestId("task-1"),
      screen.getByTestId("column-in-progress"),
    );

    const inProgress = screen.getByTestId("column-in-progress");
    expect(within(inProgress).getByText("設計する")).toBeInTheDocument();
    expect(
      within(screen.getByTestId("column-todo")).queryByText("設計する"),
    ).not.toBeInTheDocument();
  });

  it("進行中から完了へも移動できる", () => {
    render(<KanbanBoard initialTasks={initialTasks} />);

    dragCardTo(
      screen.getByTestId("task-1"),
      screen.getByTestId("column-in-progress"),
    );
    dragCardTo(
      screen.getByTestId("task-1"),
      screen.getByTestId("column-done"),
    );

    expect(
      within(screen.getByTestId("column-done")).getByText("設計する"),
    ).toBeInTheDocument();
  });
});
