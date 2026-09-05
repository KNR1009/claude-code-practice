"use client";

import {
  useState,
  type CSSProperties,
  type DragEvent,
  type KeyboardEvent,
} from "react";
import { dropSide, TASK_ID_MIME, type DropSide } from "@/lib/dnd";
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
  /** カードの上に落とされたとき。渡さなければカードはドロップ先にならない */
  onDropOnCard?: (
    draggedTaskId: string,
    targetTaskId: string,
    side: DropSide,
  ) => void;
};

/** 1 件のタスクを表示するカード。ドラッグ移動と詳細を開く操作を受け付ける */
export function TaskCard({
  task,
  category,
  today,
  onSelect,
  onDropOnCard,
}: Props) {
  const [side, setSide] = useState<DropSide | null>(null);

  const handleDragStart = (event: DragEvent<HTMLElement>) => {
    event.dataTransfer.setData(TASK_ID_MIME, task.id);
    event.dataTransfer.effectAllowed = "move";
  };

  const sideAt = (event: DragEvent<HTMLElement>) =>
    dropSide(event.clientY, event.currentTarget.getBoundingClientRect());

  const handleDragOver = (event: DragEvent<HTMLElement>) => {
    if (!onDropOnCard) return;
    // preventDefault しないとドロップが許可されない。
    // stopPropagation しないと列の dragOver と表示が競合する
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = "move";
    setSide(sideAt(event));
  };

  const handleDrop = (event: DragEvent<HTMLElement>) => {
    if (!onDropOnCard) return;
    event.preventDefault();
    // 列の drop まで伝播すると「列の末尾へ移動」で上書きされてしまう
    event.stopPropagation();
    const draggedTaskId = event.dataTransfer.getData(TASK_ID_MIME);
    const resolved = side ?? sideAt(event);
    setSide(null);
    if (draggedTaskId) {
      onDropOnCard(draggedTaskId, task.id, resolved);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect(task.id);
    }
  };

  const dropClass = side ? styles[side === "before" ? "dropBefore" : "dropAfter"] : "";

  return (
    <article
      className={`${styles.card} ${dropClass}`}
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
      onDragOver={handleDragOver}
      onDragLeave={() => setSide(null)}
      onDrop={handleDrop}
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
