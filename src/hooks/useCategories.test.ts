import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useCategories } from "@/hooks/useCategories";
import { makeCategory } from "@/test/factories";
import { DEFAULT_CATEGORIES } from "@/types/category";

describe("useCategories", () => {
  it("既定のカテゴリから始まる", () => {
    const { result } = renderHook(() => useCategories());
    expect(result.current.categories).toEqual([...DEFAULT_CATEGORIES]);
  });

  it("addCategory で追加できる", () => {
    const { result } = renderHook(() => useCategories([]));

    act(() => {
      result.current.addCategory({ label: "会議", color: "#9333ea" });
    });

    expect(result.current.categories).toHaveLength(1);
    expect(result.current.categories[0]).toMatchObject({
      label: "会議",
      color: "#9333ea",
    });
  });

  it("deleteCategory で削除できる", () => {
    const { result } = renderHook(() => useCategories([makeCategory()]));

    act(() => {
      result.current.deleteCategory("work");
    });

    expect(result.current.categories).toEqual([]);
  });

  it("初期配列を破壊しない", () => {
    const initial = [makeCategory()];
    const { result } = renderHook(() => useCategories(initial));

    act(() => {
      result.current.deleteCategory("work");
    });

    expect(initial).toHaveLength(1);
  });
});
