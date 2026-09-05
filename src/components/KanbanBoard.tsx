"use client";

import { useState } from "react";
import { useCategories } from "@/hooks/useCategories";
import { useTaskFilter } from "@/hooks/useTaskFilter";
import { useTasks } from "@/hooks/useTasks";
import { useToday } from "@/hooks/useToday";
import {
  activeTasks,
  archivedTasks,
  countTasksByCategory,
  filterTasks,
  findTask,
  isFilterActive,
  tasksByStatus,
} from "@/lib/task";
import type { Category } from "@/types/category";
import { COLUMNS, type Task, type TaskEdit } from "@/types/task";
import { ArchiveList } from "./ArchiveList";
import { CategoryManager } from "./CategoryManager";
import { Column } from "./Column";
import { TaskDetailDialog } from "./TaskDetailDialog";
import { TaskFilterBar } from "./TaskFilterBar";
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
  const { filter, setKeyword, setCategory, setDue, reset } = useTaskFilter();
  const today = useToday();
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [showArchive, setShowArchive] = useState(false);
  const [showCategories, setShowCategories] = useState(false);

  const selectedTask = findTask(tasks, selectedTaskId);
  // アーカイブ一覧とカテゴリの件数は絞り込みの影響を受けない
  const archived = archivedTasks(tasks);
  const visibleTasks = filterTasks(tasks, filter, today);
  const filtering = isFilterActive(filter);
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

      <TaskFilterBar
        filter={filter}
        categories={categories}
        visibleCount={activeTasks(visibleTasks).length}
        onKeywordChange={setKeyword}
        onCategoryChange={setCategory}
        onDueChange={setDue}
        onReset={reset}
      />

      <TaskForm categories={categories} onAdd={addTask} />

      <div className={styles.columns}>
        {COLUMNS.map((column) => (
          <Column
            key={column.status}
            status={column.status}
            label={column.label}
            tasks={tasksByStatus(visibleTasks, column.status)}
            categories={categories}
            today={today}
            filtered={filtering}
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
