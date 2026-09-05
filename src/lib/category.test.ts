import { describe, expect, it } from "vitest";
import {
  addCategory,
  canAddCategory,
  createCategory,
  deleteCategory,
  findCategory,
  normalizeColor,
} from "@/lib/category";
import { makeCategory } from "@/test/factories";
import { COLOR_PALETTE, DEFAULT_COLOR } from "@/types/category";

const categories = [
  makeCategory(),
  makeCategory({ id: "urgent", label: "緊急", color: "#dc2626" }),
];

describe("COLOR_PALETTE", () => {
  it("10 色を重複なく用意している", () => {
    expect(COLOR_PALETTE).toHaveLength(10);
    expect(new Set(COLOR_PALETTE.map((color) => color.value)).size).toBe(10);
  });
});

describe("canAddCategory", () => {
  it("空でなく重複しない名前なら追加できる", () => {
    expect(canAddCategory(categories, "会議")).toBe(true);
  });

  it("空白のみの名前は追加できない", () => {
    expect(canAddCategory(categories, "   ")).toBe(false);
  });

  it("既存と同じ名前は追加できない", () => {
    expect(canAddCategory(categories, "仕事")).toBe(false);
    expect(canAddCategory(categories, "  仕事  ")).toBe(false);
  });
});

describe("normalizeColor", () => {
  it("パレットの色はそのまま通す", () => {
    expect(normalizeColor("#dc2626")).toBe("#dc2626");
  });

  it("パレットに無い色は既定色に丸める", () => {
    expect(normalizeColor("#123456")).toBe(DEFAULT_COLOR);
  });
});

describe("createCategory", () => {
  it("名前の空白を落として生成する", () => {
    const created = createCategory(
      { label: "  会議  ", color: "#9333ea" },
      () => "id-1",
    );

    expect(created).toEqual({ id: "id-1", label: "会議", color: "#9333ea" });
  });

  it("パレット外の色は既定色になる", () => {
    const created = createCategory(
      { label: "会議", color: "not-a-color" },
      () => "id-1",
    );

    expect(created.color).toBe(DEFAULT_COLOR);
  });
});

describe("addCategory / deleteCategory", () => {
  it("末尾に追加し、元の配列は変更しない", () => {
    const added = addCategory(categories, makeCategory({ id: "x", label: "会議" }));

    expect(added.map((category) => category.id)).toEqual([
      "work",
      "urgent",
      "x",
    ]);
    expect(categories).toHaveLength(2);
  });

  it("指定 ID を取り除く", () => {
    expect(deleteCategory(categories, "work").map((c) => c.id)).toEqual([
      "urgent",
    ]);
    expect(deleteCategory(categories, "unknown")).toEqual(categories);
  });
});

describe("findCategory", () => {
  it("ID に一致するカテゴリを返す", () => {
    expect(findCategory(categories, "urgent")?.label).toBe("緊急");
  });

  it("未設定や削除済みの ID なら null を返す", () => {
    expect(findCategory(categories, null)).toBeNull();
    expect(findCategory(categories, "deleted")).toBeNull();
  });
});
