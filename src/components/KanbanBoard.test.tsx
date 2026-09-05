import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { KanbanBoard } from "@/components/KanbanBoard";
import { createDataTransfer } from "@/test/dataTransfer";
import { makeTask } from "@/test/factories";

const initialTasks = [makeTask({ id: "1" })];

/** カード → 列 のドラッグ＆ドロップを再現する */
const dragCardTo = (card: HTMLElement, column: HTMLElement) => {
  const dataTransfer = createDataTransfer();
  fireEvent.dragStart(card, { dataTransfer });
  fireEvent.dragOver(column, { dataTransfer });
  fireEvent.drop(column, { dataTransfer });
};

/**
 * カード → カード のドラッグ＆ドロップを再現する。
 * jsdom では矩形も clientY も取れないため、落ちる側は常に "after"（＝直後）になる
 */
const dragCardOnto = (card: HTMLElement, target: HTMLElement) => {
  const dataTransfer = createDataTransfer();
  fireEvent.dragStart(card, { dataTransfer });
  fireEvent.dragOver(target, { dataTransfer });
  fireEvent.drop(target, { dataTransfer });
};

/** 列に並んでいるカードのタイトルを上から順に返す */
const titlesIn = (column: HTMLElement) =>
  within(column)
    .getAllByRole("heading", { level: 3 })
    .map((heading) => heading.textContent);

const openDetail = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(screen.getByTestId("task-1"));
  return screen.getByRole("dialog");
};

const openArchivePanel = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(screen.getByRole("button", { name: /アーカイブ一覧/ }));
  return screen.getByTestId("archive-list");
};

const openCategoryPanel = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(screen.getByRole("button", { name: /カテゴリ管理/ }));
  return screen.getByTestId("category-manager");
};

beforeEach(() => {
  window.localStorage.clear();
  document.documentElement.removeAttribute("data-theme");
  vi.stubGlobal("matchMedia", vi.fn().mockReturnValue({ matches: false }));
});

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
    await user.selectOptions(screen.getByLabelText("カテゴリ"), "work");
    await user.click(screen.getByRole("button", { name: "追加" }));

    const todo = screen.getByTestId("column-todo");
    expect(within(todo).getByText("設計する")).toBeInTheDocument();
    expect(within(todo).getByText("画面構成")).toBeInTheDocument();
    expect(within(todo).getByText("仕事")).toBeInTheDocument();
  });

  it("カードをドラッグ＆ドロップすると別の列へ移動する", () => {
    render(<KanbanBoard initialTasks={initialTasks} />);

    dragCardTo(
      screen.getByTestId("task-1"),
      screen.getByTestId("column-in-progress"),
    );

    expect(
      within(screen.getByTestId("column-in-progress")).getByText("設計する"),
    ).toBeInTheDocument();
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
    dragCardTo(screen.getByTestId("task-1"), screen.getByTestId("column-done"));

    expect(
      within(screen.getByTestId("column-done")).getByText("設計する"),
    ).toBeInTheDocument();
  });

  it("カードをクリックすると詳細が開く", async () => {
    const user = userEvent.setup();
    render(<KanbanBoard initialTasks={initialTasks} />);

    const dialog = await openDetail(user);

    expect(within(dialog).getByLabelText("タイトル")).toHaveValue("設計する");
    expect(within(dialog).getByLabelText("説明")).toHaveValue("画面構成");
  });

  it("詳細で編集した内容がボードに反映される", async () => {
    const user = userEvent.setup();
    render(<KanbanBoard initialTasks={initialTasks} />);

    const dialog = await openDetail(user);
    const title = within(dialog).getByLabelText("タイトル");
    await user.clear(title);
    await user.type(title, "設計を見直す");
    await user.type(within(dialog).getByLabelText("締切日"), "2026-10-01");
    await user.selectOptions(
      within(dialog).getByLabelText("ステータス"),
      "done",
    );
    await user.click(within(dialog).getByRole("button", { name: "保存" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    const done = screen.getByTestId("column-done");
    expect(within(done).getByText("設計を見直す")).toBeInTheDocument();
    expect(within(done).getByText("10/1")).toBeInTheDocument();
  });

  it("詳細から削除するとボードから消える", async () => {
    const user = userEvent.setup();
    render(<KanbanBoard initialTasks={initialTasks} />);

    const dialog = await openDetail(user);
    await user.click(within(dialog).getByRole("button", { name: "削除" }));
    await user.click(within(dialog).getByRole("button", { name: "削除する" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.queryByTestId("task-1")).not.toBeInTheDocument();
  });

  it("アーカイブするとボードから消え、アーカイブ一覧に載る", async () => {
    const user = userEvent.setup();
    render(<KanbanBoard initialTasks={initialTasks} />);

    const dialog = await openDetail(user);
    await user.click(within(dialog).getByRole("button", { name: "アーカイブ" }));

    expect(screen.queryByTestId("task-1")).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "アーカイブ一覧（1）" }),
    ).toBeInTheDocument();

    const panel = await openArchivePanel(user);
    expect(within(panel).getByText("設計する")).toBeInTheDocument();
  });

  it("アーカイブ一覧から元に戻すとボードに復帰する", async () => {
    const user = userEvent.setup();
    render(
      <KanbanBoard initialTasks={[makeTask({ id: "1", archived: true })]} />,
    );

    const panel = await openArchivePanel(user);
    await user.click(within(panel).getByRole("button", { name: "元に戻す" }));

    expect(
      within(screen.getByTestId("column-todo")).getByText("設計する"),
    ).toBeInTheDocument();
  });

  it("アーカイブ一覧から削除できる", async () => {
    const user = userEvent.setup();
    render(
      <KanbanBoard initialTasks={[makeTask({ id: "1", archived: true })]} />,
    );

    const panel = await openArchivePanel(user);
    await user.click(within(panel).getByRole("button", { name: "削除" }));

    expect(
      within(screen.getByTestId("archive-list")).getByText(
        "アーカイブされたタスクはありません",
      ),
    ).toBeInTheDocument();
  });

  it("ダークモードに切り替えると html に data-theme が付く", async () => {
    const user = userEvent.setup();
    render(<KanbanBoard />);

    await user.click(
      screen.getByRole("button", { name: "ダークモードに切り替え" }),
    );

    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(
      screen.getByRole("button", { name: "ライトモードに切り替え" }),
    ).toBeInTheDocument();
  });

  it("追加したカテゴリをタスクに設定できる", async () => {
    const user = userEvent.setup();
    render(<KanbanBoard />);

    const panel = await openCategoryPanel(user);
    await user.type(within(panel).getByLabelText("カテゴリ名"), "会議");
    await user.click(within(panel).getByRole("radio", { name: "パープル" }));
    await user.click(
      within(panel).getByRole("button", { name: "カテゴリを追加" }),
    );

    expect(within(panel).getByText("会議")).toBeInTheDocument();

    await user.type(screen.getByLabelText("タイトル"), "定例の準備");
    await user.selectOptions(screen.getByLabelText("カテゴリ"), "会議");
    await user.click(screen.getByRole("button", { name: "追加" }));

    const todo = screen.getByTestId("column-todo");
    expect(within(todo).getByText("定例の準備")).toBeInTheDocument();
    expect(within(todo).getByText("会議")).toBeInTheDocument();
  });

  it("カテゴリを削除すると、そのカテゴリのタスクから外れる", async () => {
    const user = userEvent.setup();
    render(
      <KanbanBoard initialTasks={[makeTask({ id: "1", categoryId: "work" })]} />,
    );

    const todo = screen.getByTestId("column-todo");
    expect(within(todo).getByText("仕事")).toBeInTheDocument();

    const panel = await openCategoryPanel(user);
    expect(within(panel).getByText("1件")).toBeInTheDocument();
    await user.click(within(panel).getByRole("button", { name: "仕事 を削除" }));

    expect(within(panel).queryByText("仕事")).not.toBeInTheDocument();
    expect(within(todo).queryByText("仕事")).not.toBeInTheDocument();
    expect(within(todo).getByText("設計する")).toBeInTheDocument();
  });

  it("同じ列の中でカードを並び替えられる", () => {
    render(
      <KanbanBoard
        initialTasks={[
          makeTask({ id: "1", title: "設計する" }),
          makeTask({ id: "2", title: "実装する" }),
          makeTask({ id: "3", title: "レビューする" }),
        ]}
      />,
    );
    const todo = screen.getByTestId("column-todo");
    expect(titlesIn(todo)).toEqual(["設計する", "実装する", "レビューする"]);

    // 3 枚目を 1 枚目の直後へ
    dragCardOnto(screen.getByTestId("task-3"), screen.getByTestId("task-1"));

    expect(titlesIn(todo)).toEqual(["設計する", "レビューする", "実装する"]);
  });

  it("別の列へは位置を指定して移せる", () => {
    render(
      <KanbanBoard
        initialTasks={[
          makeTask({ id: "1", title: "設計する" }),
          makeTask({ id: "2", title: "実装する", status: "done" }),
          makeTask({ id: "3", title: "レビューする", status: "done" }),
        ]}
      />,
    );

    // 未着手の "設計する" を、完了列の "実装する" の直後へ
    dragCardOnto(screen.getByTestId("task-1"), screen.getByTestId("task-2"));

    expect(titlesIn(screen.getByTestId("column-done"))).toEqual([
      "実装する",
      "設計する",
      "レビューする",
    ]);
    expect(screen.getByTestId("column-todo")).toHaveTextContent("タスクなし");
  });

  it("キーワードで絞り込み、クリアで元に戻る", async () => {
    const user = userEvent.setup();
    render(
      <KanbanBoard
        initialTasks={[
          makeTask({ id: "1", title: "設計する", description: "画面構成" }),
          makeTask({ id: "2", title: "実装する", description: "" }),
        ]}
      />,
    );
    expect(screen.getByText("2 件表示中")).toBeInTheDocument();

    await user.type(screen.getByLabelText("検索"), "設計");

    expect(screen.getByText("設計する")).toBeInTheDocument();
    expect(screen.queryByText("実装する")).not.toBeInTheDocument();
    expect(screen.getByText("1 件表示中")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "クリア" }));

    expect(screen.getByText("実装する")).toBeInTheDocument();
    expect(screen.getByText("2 件表示中")).toBeInTheDocument();
  });

  it("絞り込みで空になった列には該当なしと出す", async () => {
    const user = userEvent.setup();
    render(
      <KanbanBoard initialTasks={[makeTask({ id: "1", title: "設計する" })]} />,
    );

    await user.type(screen.getByLabelText("検索"), "存在しない");

    expect(screen.getByTestId("column-todo")).toHaveTextContent("該当なし");
    expect(screen.getByText("0 件表示中")).toBeInTheDocument();
  });

  it("カテゴリで絞り込める", async () => {
    const user = userEvent.setup();
    render(
      <KanbanBoard
        initialTasks={[
          makeTask({ id: "1", title: "設計する", categoryId: "work" }),
          makeTask({ id: "2", title: "実装する", categoryId: null }),
        ]}
      />,
    );

    await user.selectOptions(screen.getByLabelText("カテゴリで絞る"), "work");

    expect(screen.getByText("設計する")).toBeInTheDocument();
    expect(screen.queryByText("実装する")).not.toBeInTheDocument();
  });

  it("絞り込んでもアーカイブ一覧の件数は変わらない", async () => {
    const user = userEvent.setup();
    render(
      <KanbanBoard
        initialTasks={[
          makeTask({ id: "1", title: "設計する" }),
          makeTask({ id: "2", title: "実装する", archived: true }),
        ]}
      />,
    );

    await user.type(screen.getByLabelText("検索"), "設計");

    expect(
      screen.getByRole("button", { name: "アーカイブ一覧（1）" }),
    ).toBeInTheDocument();
  });
});
