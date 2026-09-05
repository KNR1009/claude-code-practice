"use client";

import { useCallback, useState } from "react";
import {
  addTask,
  createTask,
  deleteTask,
  moveTask,
  setArchived,
  updateTask,
} from "@/lib/task";
import type { Task, TaskDraft, TaskEdit, TaskStatus } from "@/types/task";

export type UseTasks = {
  tasks: Task[];
  addTask: (draft: TaskDraft) => void;
  moveTask: (taskId: string, status: TaskStatus) => void;
  updateTask: (taskId: string, edit: TaskEdit) => void;
  deleteTask: (taskId: string) => void;
  archiveTask: (taskId: string) => void;
  unarchiveTask: (taskId: string) => void;
};

/** カンバン全体のタスク状態を保持するフック */
export function useTasks(initialTasks: readonly Task[] = []): UseTasks {
  const [tasks, setTasks] = useState<Task[]>(() => [...initialTasks]);

  const add = useCallback((draft: TaskDraft) => {
    setTasks((current) => addTask(current, createTask(draft)));
  }, []);

  const move = useCallback((taskId: string, status: TaskStatus) => {
    setTasks((current) => moveTask(current, taskId, status));
  }, []);

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

  return {
    tasks,
    addTask: add,
    moveTask: move,
    updateTask: update,
    deleteTask: remove,
    archiveTask: archive,
    unarchiveTask: unarchive,
  };
}
