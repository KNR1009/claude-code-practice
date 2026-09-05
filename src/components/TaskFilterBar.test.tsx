import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { TaskFilterBar } from "@/components/TaskFilterBar";
import { makeCategory } from "@/test/factories";
import { CATEGORY_NONE, EMPTY_FILTER, type TaskFilter } from "@/types/task";

const categories = [makeCategory({ id: "work", label: "仕事" })];

const renderBar = (filter: TaskFilter = EMPTY_FILTER) => {
  const handlers = {
    onKeywordChange: vi.fn(),
    onCategoryChange: vi.fn(),
    onDueChange: vi.fn(),
    onReset: vi.fn(),
  };
  render(
    <TaskFilterBar
      filter={filter}
      categories={categories}
      visibleCount={3}
      {...handlers}
    />,
  );
  return handlers;
};

describe("TaskFilterBar", () => {
  it("表示件数を出す", () => {
    renderBar();

    expect(screen.getByText("3 件表示中")).toBeInTheDocument();
  });

  it("入力を onKeywordChange に伝える", async () => {
    const user = userEvent.setup();
    const { onKeywordChange } = renderBar();

    await user.type(screen.getByLabelText("検索"), "設");

    expect(onKeywordChange).toHaveBeenCalledWith("設");
  });

  it("カテゴリの選択を伝える", async () => {
    const user = userEvent.setup();
    const { onCategoryChange } = renderBar();

    await user.selectOptions(screen.getByLabelText("カテゴリで絞る"), "work");

    expect(onCategoryChange).toHaveBeenCalledWith("work");
  });

  it("カテゴリなしも選べる", async () => {
    const user = userEvent.setup();
    const { onCategoryChange } = renderBar();

    await user.selectOptions(
      screen.getByLabelText("カテゴリで絞る"),
      "カテゴリなし",
    );

    expect(onCategoryChange).toHaveBeenCalledWith(CATEGORY_NONE);
  });

  it("締切の選択を伝える", async () => {
    const user = userEvent.setup();
    const { onDueChange } = renderBar();

    await user.selectOptions(screen.getByLabelText("締切で絞る"), "期限切れ");

    expect(onDueChange).toHaveBeenCalledWith("overdue");
  });

  it("絞り込んでいないときはクリアボタンを出さない", () => {
    renderBar();

    expect(
      screen.queryByRole("button", { name: "クリア" }),
    ).not.toBeInTheDocument();
  });

  it("絞り込み中はクリアボタンを出し、押すと onReset を呼ぶ", async () => {
    const user = userEvent.setup();
    const { onReset } = renderBar({ ...EMPTY_FILTER, keyword: "設計" });

    await user.click(screen.getByRole("button", { name: "クリア" }));

    expect(onReset).toHaveBeenCalled();
  });
});
