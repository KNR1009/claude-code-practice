"use client";

import { useCallback, useState } from "react";
import {
  addTask,
  clearCategory,
  createTask,
  deleteTask,
  moveTaskTo,
  setArchived,
  updateTask,
} from "@/lib/task";
import type { Task, TaskDraft, TaskEdit, TaskStatus } from "@/types/task";

export type UseTasks = {
  tasks: Task[];
  addTask: (draft: TaskDraft) => void;
  /** beforeTaskId の直前へ差し込む。省略すると列の末尾へ移動する */
  moveTask: (
    taskId: string,
    status: TaskStatus,
    beforeTaskId?: string | null,
  ) => void;
  updateTask: (taskId: string, edit: TaskEdit) => void;
  deleteTask: (taskId: string) => void;
  archiveTask: (taskId: string) => void;
  unarchiveTask: (taskId: string) => void;
  /** 削除されたカテゴリを全タスクから外す */
  clearCategory: (categoryId: string) => void;
};

/** カンバン全体のタスク状態を保持するフック */
export function useTasks(initialTasks: readonly Task[] = []): UseTasks {
  const [tasks, setTasks] = useState<Task[]>(() => [...initialTasks]);

  const add = useCallback((draft: TaskDraft) => {
    setTasks((current) => addTask(current, createTask(draft)));
  }, []);

  const move = useCallback(
    (taskId: string, status: TaskStatus, beforeTaskId: string | null = null) => {
      setTasks((current) => moveTaskTo(current, taskId, status, beforeTaskId));
    },
    [],
  );

  const update = useCallback((taskId: string, edit: TaskEdit) => {
    setTasks((current) => updateTask(current, taskId, edit));
  }, []);

  const remove = useCallback((taskId: string) => {
    setTasks((current) => deleteTask(current, taskId));
  }, []);

  const archive = useCallback((taskId: string) => {
    setTasks((current) => setArchived(current, taskId, true));
  }, []);

  const unarchive = useCallback((taskId: string) => {
    setTasks((current) => setArchived(current, taskId, false));
  }, []);

  const clearCategoryFromTasks = useCallback((categoryId: string) => {
    setTasks((current) => clearCategory(current, categoryId));
  }, []);

  return {
    tasks,
    addTask: add,
    moveTask: move,
    updateTask: update,
    deleteTask: remove,
    archiveTask: archive,
    unarchiveTask: unarchive,
    clearCategory: clearCategoryFromTasks,
  };
}
