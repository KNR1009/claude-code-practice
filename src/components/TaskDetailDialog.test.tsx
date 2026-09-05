import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { TaskDetailDialog } from "@/components/TaskDetailDialog";
import { makeTask } from "@/test/factories";
import type { Task } from "@/types/task";

const renderDialog = (task: Task = makeTask()) => {
  const handlers = {
    onSave: vi.fn(),
    onDelete: vi.fn(),
    onArchive: vi.fn(),
    onUnarchive: vi.fn(),
    onClose: vi.fn(),
  };
  render(<TaskDetailDialog task={task} {...handlers} />);
  return handlers;
};

describe("TaskDetailDialog", () => {
  it("タスクの内容を各入力欄に表示する", () => {
    renderDialog(
      makeTask({ dueDate: "2026-09-30", categoryId: "work", status: "done" }),
    );

    expect(screen.getByLabelText("タイトル")).toHaveValue("設計する");
    expect(screen.getByLabelText("説明")).toHaveValue("画面構成");
    expect(screen.getByLabelText("ステータス")).toHaveValue("done");
    expect(screen.getByLabelText("締切日")).toHaveValue("2026-09-30");
    expect(screen.getByLabelText("カテゴリ")).toHaveValue("work");
  });

  it("編集して保存すると onSave に渡す", async () => {
    const user = userEvent.setup();
    const { onSave } = renderDialog();

    const title = screen.getByLabelText("タイトル");
    await user.clear(title);
    await user.type(title, "設計を見直す");
    await user.type(screen.getByLabelText("締切日"), "2026-10-01");
    await user.selectOptions(screen.getByLabelText("ステータス"), "in-progress");
    await user.selectOptions(screen.getByLabelText("カテゴリ"), "urgent");
    await user.click(screen.getByRole("button", { name: "保存" }));

    expect(onSave).toHaveBeenCalledWith({
      title: "設計を見直す",
      description: "画面構成",
      status: "in-progress",
      dueDate: "2026-10-01",
      categoryId: "urgent",
    });
  });

  it("タイトルを空にすると保存できない", async () => {
    const user = userEvent.setup();
    const { onSave } = renderDialog();

    await user.clear(screen.getByLabelText("タイトル"));

    expect(screen.getByRole("button", { name: "保存" })).toBeDisabled();
    expect(onSave).not.toHaveBeenCalled();
  });

  it("アーカイブを押すと onArchive が呼ばれる", async () => {
    const user = userEvent.setup();
    const { onArchive } = renderDialog();

    await user.click(screen.getByRole("button", { name: "アーカイブ" }));

    expect(onArchive).toHaveBeenCalled();
  });

  it("アーカイブ済みなら戻すボタンを出す", async () => {
    const user = userEvent.setup();
    const { onUnarchive } = renderDialog(makeTask({ archived: true }));

    await user.click(
      screen.getByRole("button", { name: "アーカイブから戻す" }),
    );

    expect(onUnarchive).toHaveBeenCalled();
  });

  it("削除は確認してから onDelete を呼ぶ", async () => {
    const user = userEvent.setup();
    const { onDelete } = renderDialog();

    await user.click(screen.getByRole("button", { name: "削除" }));
    expect(onDelete).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "削除する" }));
    expect(onDelete).toHaveBeenCalled();
  });

  it("削除の確認はキャンセルできる", async () => {
    const user = userEvent.setup();
    const { onDelete } = renderDialog();

    await user.click(screen.getByRole("button", { name: "削除" }));
    await user.click(screen.getByRole("button", { name: "キャンセル" }));

    expect(screen.getByRole("button", { name: "削除" })).toBeInTheDocument();
    expect(onDelete).not.toHaveBeenCalled();
  });

  it("閉じるボタンと Escape キーで閉じる", async () => {
    const user = userEvent.setup();
    const { onClose } = renderDialog();

    await user.click(screen.getByRole("button", { name: "閉じる" }));
    expect(onClose).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});
