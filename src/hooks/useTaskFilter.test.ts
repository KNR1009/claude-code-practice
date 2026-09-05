import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useTaskFilter } from "@/hooks/useTaskFilter";
import { CATEGORY_NONE, EMPTY_FILTER } from "@/types/task";

describe("useTaskFilter", () => {
  it("初期値は絞り込みなし", () => {
    const { result } = renderHook(() => useTaskFilter());

    expect(result.current.filter).toEqual(EMPTY_FILTER);
  });

  it("setKeyword でキーワードだけが変わる", () => {
    const { result } = renderHook(() => useTaskFilter());

    act(() => {
      result.current.setKeyword("設計");
    });

    expect(result.current.filter).toEqual({ ...EMPTY_FILTER, keyword: "設計" });
  });

  it("setCategory / setDue はそれぞれ独立して効く", () => {
    const { result } = renderHook(() => useTaskFilter());

    act(() => {
      result.current.setCategory(CATEGORY_NONE);
    });
    act(() => {
      result.current.setDue("overdue");
    });

    expect(result.current.filter).toEqual({
      keyword: "",
      category: CATEGORY_NONE,
      due: "overdue",
    });
  });

  it("reset で絞り込みなしに戻る", () => {
    const { result } = renderHook(() => useTaskFilter());

    act(() => {
      result.current.setKeyword("設計");
      result.current.setDue("today");
    });
    act(() => {
      result.current.reset();
    });

    expect(result.current.filter).toEqual(EMPTY_FILTER);
  });
});
