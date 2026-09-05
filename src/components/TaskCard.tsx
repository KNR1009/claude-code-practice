"use client";

import type { CSSProperties, DragEvent, KeyboardEvent } from "react";
import { TASK_ID_MIME } from "@/lib/dnd";
import type { Category } from "@/types/category";
import type { Task } from "@/types/task";
import { CategoryBadge } from "./CategoryBadge";
import { DueDateBadge } from "./DueDateBadge";
import styles from "./TaskCard.module.css";

type Props = {
  task: Task;
  category: Category | null;
  today: string | null;
  onSelect: (taskId: string) => void;
};

/** 1 件のタスクを表示するカード。ドラッグ移動と詳細を開く操作を受け付ける */
export function TaskCard({ task, category, today, onSelect }: Props) {
  const handleDragStart = (event: DragEvent<HTMLElement>) => {
    event.dataTransfer.setData(TASK_ID_MIME, task.id);
    event.dataTransfer.effectAllowed = "move";
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect(task.id);
    }
  };

  return (
    <article
      className={styles.card}
      style={
        category
          ? ({ "--category-color": category.color } as CSSProperties)
          : undefined
      }
      draggable
      role="button"
      tabIndex={0}
      aria-label={`${task.title} の詳細を開く`}
      aria-roledescription="ドラッグ可能なタスク"
      data-testid={`task-${task.id}`}
      onDragStart={handleDragStart}
      onClick={() => onSelect(task.id)}
      onKeyDown={handleKeyDown}
    >
      <h3 className={styles.title}>{task.title}</h3>
      {task.description && (
        <p className={styles.description}>{task.description}</p>
      )}
      {(category || task.dueDate) && (
        <div className={styles.meta}>
          <CategoryBadge category={category} />
          {task.dueDate && (
            <DueDateBadge dueDate={task.dueDate} today={today} />
          )}
        </div>
      )}
    </article>
  );
}
