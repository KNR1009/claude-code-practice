"use client";

import { useState, type DragEvent } from "react";
import { findCategory } from "@/lib/category";
import { resolveBeforeId, TASK_ID_MIME, type DropSide } from "@/lib/dnd";
import type { Category } from "@/types/category";
import type { Task, TaskStatus } from "@/types/task";
import { TaskCard } from "./TaskCard";
import styles from "./Column.module.css";

type Props = {
  status: TaskStatus;
  label: string;
  tasks: readonly Task[];
  categories: readonly Category[];
  today: string | null;
  /** 絞り込み中なら空表示の文言を変える */
  filtered?: boolean;
  onDropTask: (
    taskId: string,
    status: TaskStatus,
    beforeTaskId: string | null,
  ) => void;
  onSelectTask: (taskId: string) => void;
};

/** 1 つの列。タスクの一覧表示とドロップの受け取りを担う */
export function Column({
  status,
  label,
  tasks,
  categories,
  today,
  filtered = false,
  onDropTask,
  onSelectTask,
}: Props) {
  const [isOver, setIsOver] = useState(false);

  const handleDragOver = (event: DragEvent<HTMLElement>) => {
    // preventDefault しないとドロップが許可されない
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    setIsOver(true);
  };

  // 列の余白へのドロップは「この列の末尾へ」
  const handleDrop = (event: DragEvent<HTMLElement>) => {
    event.preventDefault();
    setIsOver(false);
    const taskId = event.dataTransfer.getData(TASK_ID_MIME);
    if (taskId) {
      onDropTask(taskId, status, null);
    }
  };

  // 差し込み先の解決は、表示中の並びを知っているこの列で行う
  const handleDropOnCard = (
    draggedTaskId: string,
    targetTaskId: string,
    side: DropSide,
  ) => {
    setIsOver(false);
    const orderedIds = tasks.map((task) => task.id);
    onDropTask(
      draggedTaskId,
      status,
      resolveBeforeId(orderedIds, targetTaskId, side),
    );
  };

  return (
    <section
      className={`${styles.column} ${isOver ? styles.over : ""}`}
      aria-label={label}
      data-testid={`column-${status}`}
      onDragOver={handleDragOver}
      onDragLeave={() => setIsOver(false)}
      onDrop={handleDrop}
    >
      <header className={styles.header}>
        <h2 className={styles.label}>{label}</h2>
        <span className={styles.count}>{tasks.length}</span>
      </header>
      <div className={styles.list}>
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            category={findCategory(categories, task.categoryId)}
            today={today}
            onSelect={onSelectTask}
            onDropOnCard={handleDropOnCard}
          />
        ))}
        {tasks.length === 0 && (
          <p className={styles.empty}>{filtered ? "該当なし" : "タスクなし"}</p>
        )}
      </div>
    </section>
  );
}
