import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { TaskForm } from "@/components/TaskForm";
import { makeCategory } from "@/test/factories";

describe("TaskForm", () => {
  it("入力内容を onAdd に渡す", async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    render(<TaskForm categories={[makeCategory()]} onAdd={onAdd} />);

    await user.type(screen.getByLabelText("タイトル"), "設計する");
    await user.type(screen.getByLabelText("説明"), "画面構成を決める");
    await user.type(screen.getByLabelText("締切日"), "2026-09-30");
    await user.selectOptions(screen.getByLabelText("カテゴリ"), "work");
    await user.click(screen.getByRole("button", { name: "追加" }));

    expect(onAdd).toHaveBeenCalledWith({
      title: "設計する",
      description: "画面構成を決める",
      dueDate: "2026-09-30",
      categoryId: "work",
    });
  });

  it("締切日とカテゴリは省略できる", async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    render(<TaskForm categories={[makeCategory()]} onAdd={onAdd} />);

    await user.type(screen.getByLabelText("タイトル"), "設計する");
    await user.click(screen.getByRole("button", { name: "追加" }));

    expect(onAdd).toHaveBeenCalledWith({
      title: "設計する",
      description: "",
      dueDate: null,
      categoryId: null,
    });
  });

  it("送信後に入力欄が空に戻る", async () => {
    const user = userEvent.setup();
    render(<TaskForm categories={[makeCategory()]} onAdd={vi.fn()} />);

    const title = screen.getByLabelText("タイトル");
    await user.type(title, "設計する");
    await user.type(screen.getByLabelText("締切日"), "2026-09-30");
    await user.click(screen.getByRole("button", { name: "追加" }));

    expect(title).toHaveValue("");
    expect(screen.getByLabelText("締切日")).toHaveValue("");
  });

  it("タイトルが空のうちは追加ボタンを押せない", async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    render(<TaskForm categories={[makeCategory()]} onAdd={onAdd} />);

    const submit = screen.getByRole("button", { name: "追加" });
    expect(submit).toBeDisabled();

    await user.type(screen.getByLabelText("説明"), "説明だけ");
    expect(submit).toBeDisabled();
    expect(onAdd).not.toHaveBeenCalled();
  });
});
