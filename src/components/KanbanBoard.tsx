"use client";

import { useState } from "react";
import { useCategories } from "@/hooks/useCategories";
import { useTasks } from "@/hooks/useTasks";
import { useToday } from "@/hooks/useToday";
import { archivedTasks, countTasksByCategory, findTask, tasksByStatus } from "@/lib/task";
import type { Category } from "@/types/category";
import { COLUMNS, type Task, type TaskEdit } from "@/types/task";
import { ArchiveList } from "./ArchiveList";
import { CategoryManager } from "./CategoryManager";
import { Column } from "./Column";
import { TaskDetailDialog } from "./TaskDetailDialog";
import { TaskForm } from "./TaskForm";
import { ThemeToggle } from "./ThemeToggle";
import styles from "./KanbanBoard.module.css";

type Props = {
  initialTasks?: readonly Task[];
  initialCategories?: readonly Category[];
};

/** フォーム・3 列・各パネル・詳細モーダルを束ねるボード */
export function KanbanBoard({ initialTasks = [], initialCategories }: Props) {
  const {
    tasks,
    addTask,
    moveTask,
    updateTask,
    deleteTask,
    archiveTask,
    unarchiveTask,
    clearCategory,
  } = useTasks(initialTasks);
  const { categories, addCategory, deleteCategory } =
    useCategories(initialCategories);
  const today = useToday();
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [showArchive, setShowArchive] = useState(false);
  const [showCategories, setShowCategories] = useState(false);

  const selectedTask = findTask(tasks, selectedTaskId);
  const archived = archivedTasks(tasks);
  const closeDetail = () => setSelectedTaskId(null);

  const taskCounts = Object.fromEntries(
    categories.map((category) => [
      category.id,
      countTasksByCategory(tasks, category.id),
    ]),
  );

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

  // カテゴリを消したら、それを参照していたタスクからも外す
  const handleDeleteCategory = (categoryId: string) => {
    deleteCategory(categoryId);
    clearCategory(categoryId);
  };

  return (
    <div className={styles.board}>
      <div className={styles.toolbar}>
        <button
          className={styles.toolbarButton}
          type="button"
          aria-expanded={showCategories}
          onClick={() => setShowCategories((current) => !current)}
        >
          カテゴリ管理（{categories.length}）
        </button>
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

      {showCategories && (
        <CategoryManager
          categories={categories}
          taskCounts={taskCounts}
          onAdd={addCategory}
          onDelete={handleDeleteCategory}
        />
      )}

      <TaskForm categories={categories} onAdd={addTask} />

      <div className={styles.columns}>
        {COLUMNS.map((column) => (
          <Column
            key={column.status}
            status={column.status}
            label={column.label}
            tasks={tasksByStatus(tasks, column.status)}
            categories={categories}
            today={today}
            onDropTask={moveTask}
            onSelectTask={setSelectedTaskId}
          />
        ))}
      </div>

      {showArchive && (
        <ArchiveList
          tasks={archived}
          categories={categories}
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
          categories={categories}
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
