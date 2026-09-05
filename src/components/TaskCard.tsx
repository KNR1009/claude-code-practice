"use client";

import type { DragEvent } from "react";
import { TASK_ID_MIME } from "@/lib/dnd";
import type { Task } from "@/types/task";
import styles from "./TaskCard.module.css";

type Props = {
  task: Task;
};

/** 1 件のタスクを表示するドラッグ可能なカード */
export function TaskCard({ task }: Props) {
  const handleDragStart = (event: DragEvent<HTMLElement>) => {
    event.dataTransfer.setData(TASK_ID_MIME, task.id);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <article
      className={styles.card}
      draggable
      onDragStart={handleDragStart}
      data-testid={`task-${task.id}`}
      aria-roledescription="ドラッグ可能なタスク"
    >
      <h3 className={styles.title}>{task.title}</h3>
      {task.description && (
        <p className={styles.description}>{task.description}</p>
      )}
    </article>
  );
}
