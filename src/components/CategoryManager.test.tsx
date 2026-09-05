import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CategoryManager } from "@/components/CategoryManager";
import { makeCategory } from "@/test/factories";
import type { Category } from "@/types/category";

const categories = [
  makeCategory(),
  makeCategory({ id: "urgent", label: "緊急", color: "#dc2626" }),
];

const renderManager = (list: Category[] = categories) => {
  const handlers = { onAdd: vi.fn(), onDelete: vi.fn() };
  render(
    <CategoryManager
      categories={list}
      taskCounts={{ work: 2, urgent: 0 }}
      {...handlers}
    />,
  );
  return handlers;
};

describe("CategoryManager", () => {
  it("カテゴリと使用件数を表示する", () => {
    renderManager();

    expect(screen.getByText("仕事")).toBeInTheDocument();
    expect(screen.getByText("2件")).toBeInTheDocument();
    expect(screen.getByText("緊急")).toBeInTheDocument();
  });

  it("色は 10 種類から選べる", () => {
    renderManager();

    expect(screen.getAllByRole("radio")).toHaveLength(10);
    expect(screen.getByRole("radio", { name: "パープル" })).toBeInTheDocument();
  });

  it("名前と色を指定して追加できる", async () => {
    const user = userEvent.setup();
    const { onAdd } = renderManager();

    await user.type(screen.getByLabelText("カテゴリ名"), "会議");
    await user.click(screen.getByRole("radio", { name: "パープル" }));
    await user.click(screen.getByRole("button", { name: "カテゴリを追加" }));

    expect(onAdd).toHaveBeenCalledWith({ label: "会議", color: "#9333ea" });
  });

  it("追加後に入力欄が空に戻る", async () => {
    const user = userEvent.setup();
    renderManager();

    const input = screen.getByLabelText("カテゴリ名");
    await user.type(input, "会議");
    await user.click(screen.getByRole("button", { name: "カテゴリを追加" }));

    expect(input).toHaveValue("");
  });

  it("名前が空のうちは追加できない", () => {
    renderManager();

    expect(
      screen.getByRole("button", { name: "カテゴリを追加" }),
    ).toBeDisabled();
  });

  it("重複した名前は追加できず、理由を表示する", async () => {
    const user = userEvent.setup();
    const { onAdd } = renderManager();

    await user.type(screen.getByLabelText("カテゴリ名"), "仕事");

    expect(
      screen.getByText("同じ名前のカテゴリがすでにあります"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "カテゴリを追加" }),
    ).toBeDisabled();
    expect(onAdd).not.toHaveBeenCalled();
  });

  it("削除ボタンで onDelete を呼ぶ", async () => {
    const user = userEvent.setup();
    const { onDelete } = renderManager();

    await user.click(screen.getByRole("button", { name: "仕事 を削除" }));

    expect(onDelete).toHaveBeenCalledWith("work");
  });

  it("カテゴリが空のときはその旨を表示する", () => {
    renderManager([]);

    expect(screen.getByText("カテゴリはまだありません")).toBeInTheDocument();
  });
});
