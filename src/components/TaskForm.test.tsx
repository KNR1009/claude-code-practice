import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { TaskForm } from "@/components/TaskForm";

describe("TaskForm", () => {
  it("タイトルと説明を入力して送信すると onAdd が呼ばれる", async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    render(<TaskForm onAdd={onAdd} />);

    await user.type(screen.getByLabelText("タイトル"), "設計する");
    await user.type(screen.getByLabelText("説明"), "画面構成を決める");
    await user.click(screen.getByRole("button", { name: "追加" }));

    expect(onAdd).toHaveBeenCalledWith({
      title: "設計する",
      description: "画面構成を決める",
    });
  });

  it("送信後に入力欄が空になる", async () => {
    const user = userEvent.setup();
    render(<TaskForm onAdd={vi.fn()} />);

    const title = screen.getByLabelText("タイトル");
    await user.type(title, "設計する");
    await user.click(screen.getByRole("button", { name: "追加" }));

    expect(title).toHaveValue("");
  });

  it("タイトルが空のうちは追加ボタンを押せない", async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    render(<TaskForm onAdd={onAdd} />);

    const submit = screen.getByRole("button", { name: "追加" });
    expect(submit).toBeDisabled();

    await user.type(screen.getByLabelText("説明"), "説明だけ");
    expect(submit).toBeDisabled();
    expect(onAdd).not.toHaveBeenCalled();
  });
});
