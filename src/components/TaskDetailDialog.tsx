"use client";

import { useEffect, useState, type FormEvent } from "react";
import type { Category } from "@/types/category";
import { COLUMNS, type Task, type TaskEdit, type TaskStatus } from "@/types/task";
import { CategorySelect } from "./CategorySelect";
import styles from "./TaskDetailDialog.module.css";

type Props = {
  task: Task;
  categories: readonly Category[];
  onSave: (edit: TaskEdit) => void;
  onDelete: () => void;
  onArchive: () => void;
  onUnarchive: () => void;
  onClose: () => void;
};

/**
 * タスクの詳細表示と編集を行うモーダル。
 * 対象タスクが変わったときは呼び出し側で key を付け替えて再マウントする。
 */
export function TaskDetailDialog({
  task,
  categories,
  onSave,
  onDelete,
  onArchive,
  onUnarchive,
  onClose,
}: Props) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [status, setStatus] = useState<TaskStatus>(task.status);
  const [dueDate, setDueDate] = useState(task.dueDate ?? "");
  const [categoryId, setCategoryId] = useState<string | null>(task.categoryId);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!title.trim()) return;
    onSave({
      title,
      description,
      status,
      dueDate: dueDate || null,
      categoryId,
    });
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-label="タスクの詳細"
        onClick={(event) => event.stopPropagation()}
      >
        <header className={styles.header}>
          <h2 className={styles.heading}>タスクの詳細</h2>
          <button
            className={styles.close}
            type="button"
            aria-label="閉じる"
            onClick={onClose}
          >
            ×
          </button>
        </header>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.field}>
            <span className={styles.labelText}>タイトル</span>
            <input
              className={styles.input}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
          </label>
          <label className={styles.field}>
            <span className={styles.labelText}>説明</span>
            <textarea
              className={styles.textarea}
              rows={4}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </label>
          <div className={styles.row}>
            <label className={styles.field}>
              <span className={styles.labelText}>ステータス</span>
              <select
                className={styles.input}
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value as TaskStatus)
                }
              >
                {COLUMNS.map((column) => (
                  <option key={column.status} value={column.status}>
                    {column.label}
                  </option>
                ))}
              </select>
            </label>
            <label className={styles.field}>
              <span className={styles.labelText}>締切日</span>
              <input
                className={styles.input}
                type="date"
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
              />
            </label>
            <label className={styles.field}>
              <span className={styles.labelText}>カテゴリ</span>
              <CategorySelect
                className={styles.input}
                categories={categories}
                value={categoryId}
                onChange={setCategoryId}
              />
            </label>
          </div>

          <footer className={styles.actions}>
            <div className={styles.leftActions}>
              {confirmingDelete ? (
                <>
                  <button
                    className={styles.danger}
                    type="button"
                    onClick={onDelete}
                  >
                    削除する
                  </button>
                  <button
                    className={styles.ghost}
                    type="button"
                    onClick={() => setConfirmingDelete(false)}
                  >
                    キャンセル
                  </button>
                </>
              ) : (
                <>
                  <button
                    className={styles.ghost}
                    type="button"
                    onClick={() => setConfirmingDelete(true)}
                  >
                    削除
                  </button>
                  <button
                    className={styles.ghost}
                    type="button"
                    onClick={task.archived ? onUnarchive : onArchive}
                  >
                    {task.archived ? "アーカイブから戻す" : "アーカイブ"}
                  </button>
                </>
              )}
            </div>
            <button
              className={styles.submit}
              type="submit"
              disabled={!title.trim()}
            >
              保存
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}
