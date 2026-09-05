import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ArchiveList } from "@/components/ArchiveList";
import { makeCategory, makeTask } from "@/test/factories";

const tasks = [
  makeTask({ id: "1", archived: true, categoryId: "work", dueDate: "2026-09-30" }),
];

const renderList = (list = tasks) => {
  const handlers = {
    onSelectTask: vi.fn(),
    onUnarchive: vi.fn(),
    onDelete: vi.fn(),
  };
  render(
    <ArchiveList
      tasks={list}
      categories={[makeCategory()]}
      today="2026-09-05"
      {...handlers}
    />,
  );
  return handlers;
};

describe("ArchiveList", () => {
  it("アーカイブ済みタスクを表示する", () => {
    renderList();

    expect(screen.getByText("設計する")).toBeInTheDocument();
    expect(screen.getByText("仕事")).toBeInTheDocument();
    expect(screen.getByText("9/30")).toBeInTheDocument();
  });

  it("空のときはその旨を表示する", () => {
    renderList([]);

    expect(
      screen.getByText("アーカイブされたタスクはありません"),
    ).toBeInTheDocument();
  });

  it("タイトルをクリックすると詳細を開く", async () => {
    const user = userEvent.setup();
    const { onSelectTask } = renderList();

    await user.click(screen.getByRole("button", { name: "設計する" }));

    expect(onSelectTask).toHaveBeenCalledWith("1");
  });

  it("元に戻す・削除をそれぞれ通知する", async () => {
    const user = userEvent.setup();
    const { onUnarchive, onDelete } = renderList();

    await user.click(screen.getByRole("button", { name: "元に戻す" }));
    await user.click(screen.getByRole("button", { name: "削除" }));

    expect(onUnarchive).toHaveBeenCalledWith("1");
    expect(onDelete).toHaveBeenCalledWith("1");
  });
});
