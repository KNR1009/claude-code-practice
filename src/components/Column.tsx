"use client";

import { useState, type DragEvent } from "react";
import { TASK_ID_MIME } from "@/lib/dnd";
import type { Task, TaskStatus } from "@/types/task";
import { TaskCard } from "./TaskCard";
import styles from "./Column.module.css";

type Props = {
  status: TaskStatus;
  label: string;
  tasks: readonly Task[];
  today: string | null;
  onDropTask: (taskId: string, status: TaskStatus) => void;
  onSelectTask: (taskId: string) => void;
};

/** 1 つの列。タスクの一覧表示とドロップの受け取りを担う */
export function Column({
  status,
  label,
  tasks,
  today,
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

  const handleDrop = (event: DragEvent<HTMLElement>) => {
    event.preventDefault();
    setIsOver(false);
    const taskId = event.dataTransfer.getData(TASK_ID_MIME);
    if (taskId) {
      onDropTask(taskId, status);
    }
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
            today={today}
            onSelect={onSelectTask}
          />
        ))}
        {tasks.length === 0 && <p className={styles.empty}>タスクなし</p>}
      </div>
    </section>
  );
}
