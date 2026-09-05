import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { TaskCard } from "@/components/TaskCard";
import { makeTask } from "@/test/factories";

describe("TaskCard", () => {
  it("タイトル・説明・カテゴリ・締切日を表示する", () => {
    render(
      <TaskCard
        task={makeTask({ categoryId: "work", dueDate: "2026-09-30" })}
        today="2026-09-05"
        onSelect={vi.fn()}
      />,
    );

    expect(screen.getByText("設計する")).toBeInTheDocument();
    expect(screen.getByText("画面構成")).toBeInTheDocument();
    expect(screen.getByText("仕事")).toBeInTheDocument();
    expect(screen.getByText("9/30")).toBeInTheDocument();
  });

  it("締切を過ぎたタスクには期限切れの印を付ける", () => {
    render(
      <TaskCard
        task={makeTask({ dueDate: "2026-09-01" })}
        today="2026-09-05"
        onSelect={vi.fn()}
      />,
    );

    expect(screen.getByText("9/1").dataset.state).toBe("overdue");
    expect(screen.getByText("期限切れ")).toBeInTheDocument();
  });

  it("カテゴリなしのときはカテゴリ名を出さない", () => {
    render(
      <TaskCard task={makeTask()} today="2026-09-05" onSelect={vi.fn()} />,
    );

    expect(screen.queryByText("なし")).not.toBeInTheDocument();
  });

  it("クリックすると onSelect が呼ばれる", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<TaskCard task={makeTask()} today={null} onSelect={onSelect} />);

    await user.click(screen.getByTestId("task-1"));

    expect(onSelect).toHaveBeenCalledWith("1");
  });

  it("Enter キーでも onSelect が呼ばれる", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<TaskCard task={makeTask()} today={null} onSelect={onSelect} />);

    screen.getByTestId("task-1").focus();
    await user.keyboard("{Enter}");

    expect(onSelect).toHaveBeenCalledWith("1");
  });
});
