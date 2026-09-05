"use client";

import { CategoryBadge } from "./CategoryBadge";
import { DueDateBadge } from "./DueDateBadge";
import type { Task } from "@/types/task";
import styles from "./ArchiveList.module.css";

type Props = {
  tasks: readonly Task[];
  today: string | null;
  onSelectTask: (taskId: string) => void;
  onUnarchive: (taskId: string) => void;
  onDelete: (taskId: string) => void;
};

/** アーカイブ済みタスクの一覧。復帰と削除を受け付ける */
export function ArchiveList({
  tasks,
  today,
  onSelectTask,
  onUnarchive,
  onDelete,
}: Props) {
  return (
    <section
      className={styles.panel}
      aria-label="アーカイブ一覧"
      data-testid="archive-list"
    >
      <h2 className={styles.heading}>アーカイブ一覧</h2>
      {tasks.length === 0 ? (
        <p className={styles.empty}>アーカイブされたタスクはありません</p>
      ) : (
        <ul className={styles.list}>
          {tasks.map((task) => (
            <li key={task.id} className={styles.item}>
              <button
                className={styles.title}
                type="button"
                onClick={() => onSelectTask(task.id)}
              >
                {task.title}
              </button>
              <div className={styles.meta}>
                <CategoryBadge categoryId={task.categoryId} />
                {task.dueDate && (
                  <DueDateBadge dueDate={task.dueDate} today={today} />
                )}
              </div>
              <div className={styles.actions}>
                <button
                  className={styles.action}
                  type="button"
                  onClick={() => onUnarchive(task.id)}
                >
                  元に戻す
                </button>
                <button
                  className={styles.action}
                  type="button"
                  onClick={() => onDelete(task.id)}
                >
                  削除
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
