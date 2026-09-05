"use client";

import { useState, type FormEvent } from "react";
import { isValidDraft } from "@/lib/task";
import type { TaskDraft } from "@/types/task";
import styles from "./TaskForm.module.css";

type Props = {
  onAdd: (draft: TaskDraft) => void;
};

/** タスク追加フォーム。入力値の保持と最小限の検証だけを担う */
export function TaskForm({ onAdd }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const draft = { title, description };
    if (!isValidDraft(draft)) return;
    onAdd(draft);
    setTitle("");
    setDescription("");
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
