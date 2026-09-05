import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useTasks } from "@/hooks/useTasks";
import type { Task } from "@/types/task";

const initial: Task[] = [
  { id: "1", title: "既存タスク", description: "", status: "todo" },
];

describe("useTasks", () => {
  it("初期タスクを保持する", () => {
    const { result } = renderHook(() => useTasks(initial));
    expect(result.current.tasks).toEqual(initial);
  });

  it("addTask で未着手のタスクが増える", () => {
    const { result } = renderHook(() => useTasks());

    act(() => {
      result.current.addTask({ title: "新規", description: "説明" });
    });

    expect(result.current.tasks).toHaveLength(1);
    expect(result.current.tasks[0]).toMatchObject({
      title: "新規",
      description: "説明",
      status: "todo",
    });
  });

  it("moveTask で状態が変わる", () => {
    const { result } = renderHook(() => useTasks(initial));

    act(() => {
      result.current.moveTask("1", "in-progress");
    });

    expect(result.current.tasks[0].status).toBe("in-progress");
  });

  it("初期タスクの配列を破壊しない", () => {
    const { result } = renderHook(() => useTasks(initial));

    act(() => {
      result.current.addTask({ title: "新規", description: "" });
    });

    expect(initial).toHaveLength(1);
  });
});
