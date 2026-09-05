import { createEvent, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TaskCard } from "@/components/TaskCard";
import { createDataTransfer } from "@/test/dataTransfer";
import { makeCategory, makeTask } from "@/test/factories";

/**
 * jsdom の getBoundingClientRect は常に 0 を返すため、
 * 上半分 / 下半分の判定を試すにはカードの矩形を差し替える必要がある。
 */
const stubRect = () => {
  vi.spyOn(Element.prototype, "getBoundingClientRect").mockReturnValue({
    top: 100,
    height: 40,
  } as DOMRect);
};

/**
 * jsdom の drop イベントは clientY を落としてしまうため、
 * createEvent で作ってから明示的に載せる。
 */
const dropAt = (
  element: Element,
  clientY: number,
  dataTransfer: ReturnType<typeof createDataTransfer>,
) => {
  const event = createEvent.drop(element, { dataTransfer });
  Object.defineProperty(event, "clientY", { value: clientY });
  fireEvent(element, event);
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe("TaskCard", () => {
  it("タイトル・説明・カテゴリ・締切日を表示する", () => {
    render(
      <TaskCard
        task={makeTask({ categoryId: "work", dueDate: "2026-09-30" })}
        category={makeCategory()}
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
        category={null}
        today="2026-09-05"
        onSelect={vi.fn()}
      />,
    );

    expect(screen.getByText("9/1").dataset.state).toBe("overdue");
    expect(screen.getByText("期限切れ")).toBeInTheDocument();
  });

  it("カテゴリなしのときはカテゴリ名を出さない", () => {
    render(
      <TaskCard
        task={makeTask()}
        category={null}
        today="2026-09-05"
        onSelect={vi.fn()}
      />,
    );

    expect(screen.queryByText("仕事")).not.toBeInTheDocument();
  });

  it("クリックすると onSelect が呼ばれる", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <TaskCard
        task={makeTask()}
        category={null}
        today={null}
        onSelect={onSelect}
      />,
    );

    await user.click(screen.getByTestId("task-1"));

    expect(onSelect).toHaveBeenCalledWith("1");
  });

  it("Enter キーでも onSelect が呼ばれる", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <TaskCard
        task={makeTask()}
        category={null}
        today={null}
        onSelect={onSelect}
      />,
    );

    screen.getByTestId("task-1").focus();
    await user.keyboard("{Enter}");

    expect(onSelect).toHaveBeenCalledWith("1");
  });

  it("カードの上半分へのドロップは before として通知する", () => {
    stubRect();
    const onDropOnCard = vi.fn();
    render(
      <TaskCard
        task={makeTask({ id: "target" })}
        category={null}
        today={null}
        onSelect={vi.fn()}
        onDropOnCard={onDropOnCard}
      />,
    );
    const dataTransfer = createDataTransfer();
    dataTransfer.setData("text/plain", "dragged");

    dropAt(screen.getByTestId("task-target"), 105, dataTransfer);

    expect(onDropOnCard).toHaveBeenCalledWith("dragged", "target", "before");
  });

  it("カードの下半分へのドロップは after として通知する", () => {
    stubRect();
    const onDropOnCard = vi.fn();
    render(
      <TaskCard
        task={makeTask({ id: "target" })}
        category={null}
        today={null}
        onSelect={vi.fn()}
        onDropOnCard={onDropOnCard}
      />,
    );
    const dataTransfer = createDataTransfer();
    dataTransfer.setData("text/plain", "dragged");

    dropAt(screen.getByTestId("task-target"), 135, dataTransfer);

    expect(onDropOnCard).toHaveBeenCalledWith("dragged", "target", "after");
  });

  it("ID を持たないドロップは無視する", () => {
    const onDropOnCard = vi.fn();
    render(
      <TaskCard
        task={makeTask()}
        category={null}
        today={null}
        onSelect={vi.fn()}
        onDropOnCard={onDropOnCard}
      />,
    );

    fireEvent.drop(screen.getByTestId("task-1"), {
      dataTransfer: createDataTransfer(),
    });

    expect(onDropOnCard).not.toHaveBeenCalled();
  });

  it("onDropOnCard が無いカードはドロップを受け付けない", () => {
    render(
      <TaskCard
        task={makeTask()}
        category={null}
        today={null}
        onSelect={vi.fn()}
      />,
    );

    // preventDefault されなければ fireEvent は true を返す＝ドロップ先ではない
    const dragOver = fireEvent.dragOver(screen.getByTestId("task-1"), {
      dataTransfer: createDataTransfer(),
    });

    expect(dragOver).toBe(true);
  });
});
