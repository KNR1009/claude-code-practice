"use client";

import { useCallback, useState } from "react";
import { EMPTY_FILTER, type DueFilter, type TaskFilter } from "@/types/task";

export type UseTaskFilter = {
  filter: TaskFilter;
  setKeyword: (keyword: string) => void;
  setCategory: (category: string) => void;
  setDue: (due: DueFilter) => void;
  /** 絞り込みを解除して全件表示に戻す */
  reset: () => void;
};

/** ボードの絞り込み条件を保持するフック */
export function useTaskFilter(
  initialFilter: TaskFilter = EMPTY_FILTER,
): UseTaskFilter {
  const [filter, setFilter] = useState<TaskFilter>(initialFilter);

  const setKeyword = useCallback((keyword: string) => {
    setFilter((current) => ({ ...current, keyword }));
  }, []);

  const setCategory = useCallback((category: string) => {
    setFilter((current) => ({ ...current, category }));
  }, []);

  const setDue = useCallback((due: DueFilter) => {
    setFilter((current) => ({ ...current, due }));
  }, []);

  const reset = useCallback(() => {
    setFilter(EMPTY_FILTER);
  }, []);

  return { filter, setKeyword, setCategory, setDue, reset };
}
