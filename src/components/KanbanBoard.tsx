"use client";

import { useTasks } from "@/hooks/useTasks";
import { tasksByStatus } from "@/lib/task";
import { COLUMNS, type Task } from "@/types/task";
import { Column } from "./Column";
import { TaskForm } from "./TaskForm";
import styles from "./KanbanBoard.module.css";

type Props = {
  initialTasks?: readonly Task[];
};

/** フォームと 3 列を束ねるボード。状態は useTasks に委譲する */
export function KanbanBoard({ initialTasks = [] }: Props) {
  const { tasks, addTask, moveTask } = useTasks(initialTasks);

  return (
    <div className={styles.board}>
      <TaskForm onAdd={addTask} />
      <div className={styles.columns}>
        {COLUMNS.map((column) => (
          <Column
            key={column.status}
            status={column.status}
            label={column.label}
            tasks={tasksByStatus(tasks, column.status)}
            onDropTask={moveTask}
          />
        ))}
      </div>
    </div>
  );
}
