"use client";

import { isFilterActive } from "@/lib/task";
import type { Category } from "@/types/category";
import {
  CATEGORY_ALL,
  CATEGORY_NONE,
  type DueFilter,
  type TaskFilter,
} from "@/types/task";
import styles from "./TaskFilterBar.module.css";

type Props = {
  filter: TaskFilter;
  categories: readonly Category[];
  /** 絞り込み後にボードへ表示されている件数 */
  visibleCount: number;
  onKeywordChange: (keyword: string) => void;
  onCategoryChange: (category: string) => void;
  onDueChange: (due: DueFilter) => void;
  onReset: () => void;
};

const DUE_OPTIONS: readonly { value: DueFilter; label: string }[] = [
  { value: "all", label: "すべて" },
  { value: "overdue", label: "期限切れ" },
  { value: "today", label: "今日" },
  { value: "upcoming", label: "予定" },
  { value: "none", label: "締切なし" },
] as const;

/**
 * ボードの絞り込みバー。
 * カテゴリの選択肢は「すべて / カテゴリなし」を含むため CategorySelect は使わない
 * （あちらは「なし = null」という別の意味を持つ）。
 */
export function TaskFilterBar({
  filter,
  categories,
  visibleCount,
  onKeywordChange,
  onCategoryChange,
  onDueChange,
  onReset,
}: Props) {
  return (
    <div className={styles.bar} role="search" aria-label="タスクの絞り込み">
      <label className={styles.field}>
        <span className={styles.labelText}>検索</span>
        <input
          className={styles.input}
          type="search"
          value={filter.keyword}
          onChange={(event) => onKeywordChange(event.target.value)}
          placeholder="タイトル・説明"
        />
      </label>

      <label className={styles.fieldNarrow}>
        <span className={styles.labelText}>カテゴリで絞る</span>
        <select
          className={styles.input}
          value={filter.category}
          onChange={(event) => onCategoryChange(event.target.value)}
        >
          <option value={CATEGORY_ALL}>すべて</option>
          <option value={CATEGORY_NONE}>カテゴリなし</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.label}
            </option>
          ))}
        </select>
      </label>

      <label className={styles.fieldNarrow}>
        <span className={styles.labelText}>締切で絞る</span>
        <select
          className={styles.input}
          value={filter.due}
          onChange={(event) => onDueChange(event.target.value as DueFilter)}
        >
          {DUE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <p className={styles.count} aria-live="polite">
        {visibleCount} 件表示中
      </p>

      {isFilterActive(filter) && (
        <button className={styles.clear} type="button" onClick={onReset}>
          クリア
        </button>
      )}
    </div>
  );
}
