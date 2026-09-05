"use client";

import { useState, type FormEvent } from "react";
import { isValidDraft } from "@/lib/task";
import type { Category } from "@/types/category";
import type { TaskDraft } from "@/types/task";
import { CategorySelect } from "./CategorySelect";
import styles from "./TaskForm.module.css";

type Props = {
  categories: readonly Category[];
  onAdd: (draft: TaskDraft) => void;
};

/** タスク追加フォーム。入力値の保持と最小限の検証だけを担う */
export function TaskForm({ categories, onAdd }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isValidDraft({ title, description })) return;
    onAdd({ title, description, dueDate: dueDate || null, categoryId });
    setTitle("");
    setDescription("");
    setDueDate("");
    setCategoryId(null);
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.fields}>
        <label className={styles.field}>
          <span className={styles.labelText}>タイトル</span>
          <input
            className={styles.input}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="やることを入力"
          />
        </label>
        <label className={styles.field}>
          <span className={styles.labelText}>説明</span>
          <input
            className={styles.input}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="補足（任意）"
          />
        </label>
        <label className={styles.fieldNarrow}>
          <span className={styles.labelText}>締切日</span>
          <input
            className={styles.input}
            type="date"
            value={dueDate}
            onChange={(event) => setDueDate(event.target.value)}
          />
        </label>
        <label className={styles.fieldNarrow}>
          <span className={styles.labelText}>カテゴリ</span>
          <CategorySelect
            className={styles.input}
            categories={categories}
            value={categoryId}
            onChange={setCategoryId}
          />
        </label>
      </div>
      <button
        className={styles.submit}
        type="submit"
        disabled={!isValidDraft({ title, description })}
      >
        追加
      </button>
    </form>
  );
}
