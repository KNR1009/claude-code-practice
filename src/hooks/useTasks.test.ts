import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useTasks } from "@/hooks/useTasks";
import { makeTask } from "@/test/factories";

const initial = [makeTask({ id: "1", title: "既存タスク" })];

describe("useTasks", () => {
  it("初期タスクを保持する", () => {
    const { result } = renderHook(() => useTasks(initial));
    expect(result.current.tasks).toEqual(initial);
  });

  it("addTask で未着手のタスクが増える", () => {
    const { result } = renderHook(() => useTasks());

    act(() => {
      result.current.addTask({
        title: "新規",
        description: "説明",
        dueDate: "2026-09-30",
        categoryId: "work",
      });
    });

    expect(result.current.tasks).toHaveLength(1);
    expect(result.current.tasks[0]).toMatchObject({
      title: "新規",
      description: "説明",
      status: "todo",
      dueDate: "2026-09-30",
      categoryId: "work",
      archived: false,
    });
  });

  it("moveTask で状態が変わる", () => {
    const { result } = renderHook(() => useTasks(initial));

    act(() => {
      result.current.moveTask("1", "in-progress");
    });

    expect(result.current.tasks[0].status).toBe("in-progress");
  });

  it("updateTask で編集内容が反映される", () => {
    const { result } = renderHook(() => useTasks(initial));

    act(() => {
      result.current.updateTask("1", {
        title: "編集後",
        categoryId: "urgent",
      });
    });

    expect(result.current.tasks[0]).toMatchObject({
      title: "編集後",
      categoryId: "urgent",
    });
  });

  it("deleteTask でタスクが消える", () => {
    const { result } = renderHook(() => useTasks(initial));

    act(() => {
      result.current.deleteTask("1");
    });

    expect(result.current.tasks).toEqual([]);
  });

  it("archiveTask / unarchiveTask でアーカイブ状態が切り替わる", () => {
    const { result } = renderHook(() => useTasks(initial));

    act(() => {
      result.current.archiveTask("1");
    });
    expect(result.current.tasks[0].archived).toBe(true);

    act(() => {
      result.current.unarchiveTask("1");
    });
    expect(result.current.tasks[0].archived).toBe(false);
  });

  it("初期タスクの配列を破壊しない", () => {
    const { result } = renderHook(() => useTasks(initial));

    act(() => {
      result.current.addTask({ title: "新規", description: "" });
    });

    expect(initial).toHaveLength(1);
  });
});
