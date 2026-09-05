"use client";

import { useState } from "react";
import { useTasks } from "@/hooks/useTasks";
import { useToday } from "@/hooks/useToday";
import { archivedTasks, findTask, tasksByStatus } from "@/lib/task";
import { COLUMNS, type Task, type TaskEdit } from "@/types/task";
import { ArchiveList } from "./ArchiveList";
import { Column } from "./Column";
import { TaskDetailDialog } from "./TaskDetailDialog";
import { TaskForm } from "./TaskForm";
import { ThemeToggle } from "./ThemeToggle";
import styles from "./KanbanBoard.module.css";

type Props = {
  initialTasks?: readonly Task[];
};

/** フォーム・3 列・アーカイブ一覧・詳細モーダルを束ねるボード */
export function KanbanBoard({ initialTasks = [] }: Props) {
  const {
    tasks,
    addTask,
    moveTask,
    updateTask,
    deleteTask,
    archiveTask,
    unarchiveTask,
  } = useTasks(initialTasks);
  const today = useToday();
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [showArchive, setShowArchive] = useState(false);

  const selectedTask = findTask(tasks, selectedTaskId);
  const archived = archivedTasks(tasks);
  const closeDetail = () => setSelectedTaskId(null);

  const handleSave = (edit: TaskEdit) => {
    if (!selectedTaskId) return;
    updateTask(selectedTaskId, edit);
    closeDetail();
  };

  const withClose = (action: (taskId: string) => void) => () => {
    if (!selectedTaskId) return;
    action(selectedTaskId);
    closeDetail();
  };

  return (
    <div className={styles.board}>
      <div className={styles.toolbar}>
        <button
          className={styles.toolbarButton}
          type="button"
          aria-expanded={showArchive}
          onClick={() => setShowArchive((current) => !current)}
        >
          アーカイブ一覧（{archived.length}）
        </button>
        <ThemeToggle />
      </div>

      <TaskForm onAdd={addTask} />

      <div className={styles.columns}>
        {COLUMNS.map((column) => (
          <Column
            key={column.status}
            status={column.status}
            label={column.label}
            tasks={tasksByStatus(tasks, column.status)}
            today={today}
            onDropTask={moveTask}
            onSelectTask={setSelectedTaskId}
          />
        ))}
      </div>

      {showArchive && (
        <ArchiveList
          tasks={archived}
          today={today}
          onSelectTask={setSelectedTaskId}
          onUnarchive={unarchiveTask}
          onDelete={deleteTask}
        />
      )}

      {selectedTask && (
        <TaskDetailDialog
          key={selectedTask.id}
          task={selectedTask}
          onSave={handleSave}
          onDelete={withClose(deleteTask)}
          onArchive={withClose(archiveTask)}
          onUnarchive={withClose(unarchiveTask)}
          onClose={closeDetail}
        />
      )}
    </div>
  );
}
