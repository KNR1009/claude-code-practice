"use client";

import { useCallback, useState } from "react";
import {
  addCategory,
  createCategory,
  deleteCategory,
} from "@/lib/category";
import type { Category, CategoryDraft } from "@/types/category";
import { DEFAULT_CATEGORIES } from "@/types/category";

export type UseCategories = {
  categories: Category[];
  addCategory: (draft: CategoryDraft) => void;
  deleteCategory: (categoryId: string) => void;
};

/** カテゴリの一覧を保持するフック */
export function useCategories(
  initialCategories: readonly Category[] = DEFAULT_CATEGORIES,
): UseCategories {
  const [categories, setCategories] = useState<Category[]>(() => [
    ...initialCategories,
  ]);

  const add = useCallback((draft: CategoryDraft) => {
    setCategories((current) => addCategory(current, createCategory(draft)));
  }, []);

  const remove = useCallback((categoryId: string) => {
    setCategories((current) => deleteCategory(current, categoryId));
  }, []);

  return { categories, addCategory: add, deleteCategory: remove };
}
