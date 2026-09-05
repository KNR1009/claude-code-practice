import type { Category, CategoryDraft } from "@/types/category";
import { COLOR_PALETTE, DEFAULT_COLOR } from "@/types/category";
import type { IdGenerator } from "@/lib/task";
import { defaultIdGenerator } from "@/lib/task";

/** 名前が空でなく、既存カテゴリと重複していなければ追加できる */
export function canAddCategory(
  categories: readonly Category[],
  label: string,
): boolean {
  const trimmed = label.trim();
  if (!trimmed) return false;
  return !categories.some((category) => category.label === trimmed);
}

/** パレットに無い色は既定色に丸める */
export function normalizeColor(color: string): string {
  return COLOR_PALETTE.some((paletteColor) => paletteColor.value === color)
    ? color
    : DEFAULT_COLOR;
}

export function createCategory(
  draft: CategoryDraft,
  generateId: IdGenerator = defaultIdGenerator,
): Category {
  return {
    id: generateId(),
    label: draft.label.trim(),
    color: normalizeColor(draft.color),
  };
}

/** カテゴリを末尾に追加した新しい配列を返す */
export function addCategory(
  categories: readonly Category[],
  category: Category,
): Category[] {
  return [...categories, category];
}

/** カテゴリを取り除いた新しい配列を返す */
export function deleteCategory(
  categories: readonly Category[],
  categoryId: string,
): Category[] {
  return categories.filter((category) => category.id !== categoryId);
}

/** ID からカテゴリを引く。未設定・削除済みなら null */
export function findCategory(
  categories: readonly Category[],
  categoryId: string | null,
): Category | null {
  if (!categoryId) return null;
  return categories.find((category) => category.id === categoryId) ?? null;
}
