"use client";

import { useCallback, useState } from "react";
import { addTask, createTask, moveTask } from "@/lib/task";
import type { Task, TaskDraft, TaskStatus } from "@/types/task";

export type UseTasks = {
  tasks: Task[];
  addTask: (draft: TaskDraft) => void;
  moveTask: (taskId: string, status: TaskStatus) => void;
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

  return { tasks, addTask: add, moveTask: move };
}
