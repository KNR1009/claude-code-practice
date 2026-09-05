"use client";

import { useState, type CSSProperties, type FormEvent } from "react";
import { canAddCategory } from "@/lib/category";
import type { Category, CategoryDraft } from "@/types/category";
import { COLOR_PALETTE, DEFAULT_COLOR } from "@/types/category";
import styles from "./CategoryManager.module.css";

type Props = {
  categories: readonly Category[];
  /** カテゴリ ID ごとの使用タスク数 */
  taskCounts: Record<string, number>;
  onAdd: (draft: CategoryDraft) => void;
  onDelete: (categoryId: string) => void;
};

/** カテゴリの追加・削除を行うパネル */
export function CategoryManager({
  categories,
  taskCounts,
  onAdd,
  onDelete,
}: Props) {
  const [label, setLabel] = useState("");
  const [color, setColor] = useState(DEFAULT_COLOR);

  const canAdd = canAddCategory(categories, label);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canAdd) return;
    onAdd({ label, color });
    setLabel("");
    setColor(DEFAULT_COLOR);
  };

  return (
    <section
      className={styles.panel}
      aria-label="カテゴリ管理"
      data-testid="category-manager"
    >
      <h2 className={styles.heading}>カテゴリ管理</h2>

      {categories.length === 0 ? (
        <p className={styles.empty}>カテゴリはまだありません</p>
      ) : (
        <ul className={styles.list}>
          {categories.map((category) => (
            <li key={category.id} className={styles.item}>
              <span
                className={styles.swatch}
                style={{ "--category-color": category.color } as CSSProperties}
                aria-hidden="true"
              />
              <span className={styles.itemLabel}>{category.label}</span>
              <span className={styles.count}>
                {taskCounts[category.id] ?? 0}件
              </span>
              <button
                className={styles.delete}
                type="button"
                aria-label={`${category.label} を削除`}
                onClick={() => onDelete(category.id)}
              >
                削除
              </button>
            </li>
          ))}
        </ul>
      )}

      <form className={styles.form} onSubmit={handleSubmit}>
        <label className={styles.field}>
          <span className={styles.labelText}>カテゴリ名</span>
          <input
            className={styles.input}
            value={label}
            onChange={(event) => setLabel(event.target.value)}
            placeholder="例: 会議"
          />
        </label>

        <fieldset className={styles.colors}>
          <legend className={styles.labelText}>色</legend>
          {COLOR_PALETTE.map((paletteColor) => (
            <label
              key={paletteColor.value}
              className={styles.colorOption}
              style={
                { "--category-color": paletteColor.value } as CSSProperties
              }
            >
              <input
                className={styles.radio}
                type="radio"
                name="category-color"
                value={paletteColor.value}
                checked={color === paletteColor.value}
                onChange={() => setColor(paletteColor.value)}
                aria-label={paletteColor.label}
              />
              <span className={styles.colorDot} aria-hidden="true" />
            </label>
          ))}
        </fieldset>

        <button className={styles.submit} type="submit" disabled={!canAdd}>
          カテゴリを追加
        </button>
      </form>
      {label.trim() && !canAdd && (
        <p className={styles.error}>同じ名前のカテゴリがすでにあります</p>
      )}
    </section>
  );
}
