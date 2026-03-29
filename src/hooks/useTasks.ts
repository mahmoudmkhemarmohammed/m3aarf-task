import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import {
  fetchTasksByColumn,
  fetchAllTasks,
  createTask,
  updateTask,
  deleteTask,
} from "@/services";

import { QUERY_KEYS, PAGE_SIZE } from "@/utils";
import { queryClient as globalQueryClient } from "@/lib";

import type {
  ColumnId,
  Task,
  CreateTaskPayload,
  UpdateTaskPayload,
  PaginatedResult,
} from "@/types";

// Queries

export const useBoardTasks = (search: string) => {
  return useQuery<Task[], Error>({
    queryKey: QUERY_KEYS.allTasks(search),
    queryFn: () => fetchAllTasks(search),
    enabled: Boolean(search.trim()),
    placeholderData: (prev) => prev,
  });
};

export interface UseColumnTasksResult {
  data: PaginatedResult<Task> | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  page: number;
  totalPages: number;
  goToPage: (page: number) => void;
}

export const useColumnTasks = (
  column: ColumnId,
  search: string,
): UseColumnTasksResult => {
  const [page, setPage] = useState(1);

  const query = useQuery<PaginatedResult<Task>, Error>({
    queryKey: QUERY_KEYS.tasksByColumn(column, page, search),
    queryFn: () =>
      fetchTasksByColumn({ column, page, limit: PAGE_SIZE, search }),
    // placeholderData keeps the previous page visible while loading.
    // select normalises the shape so callers always get a valid array 
    // guards against undefined placeholders or unexpected server responses.
    placeholderData: (prev) => prev,
    select: (raw): PaginatedResult<Task> => ({
      data: Array.isArray(raw?.data) ? raw.data : [],
      total: typeof raw?.total === "number" ? raw.total : 0,
    }),
  });

  const totalPages = Math.ceil((query.data?.total ?? 0) / PAGE_SIZE);

  const goToPage = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) setPage(newPage);
  };

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    page,
    totalPages,
    goToPage,
  };
};

// Shared invalidation

const useInvalidateTasks = () => {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: QUERY_KEYS.tasks() });
};

// Mutations

export const useCreateTask = () => {
  const invalidate = useInvalidateTasks();
  return useMutation<Task, Error, CreateTaskPayload>({
    mutationFn: createTask,
    onSuccess: invalidate,
  });
};

interface UseUpdateTaskOptions {
  /**
   * Enable optimistic update — the card moves instantly in the UI
   * and rolls back automatically on server error.
   * Use for drag-and-drop interactions.
   */
  optimistic?: boolean;
}

export const useUpdateTask = ({
  optimistic = false,
}: UseUpdateTaskOptions = {}) => {
  const qc = useQueryClient();
  const invalidate = useInvalidateTasks();

  return useMutation<Task, Error, UpdateTaskPayload>({
    mutationFn: updateTask,

    onMutate: optimistic
      ? async (variables) => {
          await qc.cancelQueries({ queryKey: QUERY_KEYS.tasks() });

          const snapshot = qc.getQueriesData<PaginatedResult<Task>>({
            queryKey: QUERY_KEYS.tasks(),
          });

          qc.setQueriesData<PaginatedResult<Task>>(
            { queryKey: QUERY_KEYS.tasks() },
            (old) => {
              if (!old) return old;
              return {
                ...old,
                data: old.data.map((t) =>
                  t.id === variables.id ? { ...t, ...variables } : t,
                ),
              };
            },
          );

          return { snapshot };
        }
      : undefined,

    onError: optimistic
      ? (_err, _vars, ctx) => {
          const context = ctx as
            | {
                snapshot: [unknown, PaginatedResult<Task> | undefined][];
              }
            | undefined;
          context?.snapshot?.forEach(([key, value]) =>
            qc.setQueryData(
              key as Parameters<typeof qc.setQueryData>[0],
              value,
            ),
          );
        }
      : undefined,

    onSettled: invalidate,
  });
};

export const useDeleteTask = () => {
  const invalidate = useInvalidateTasks();
  return useMutation<void, Error, Task["id"]>({
    mutationFn: deleteTask,
    onSuccess: invalidate,
  });
};

// DragOverlay helper

/**
 * Look up a task by id across every cached column page.
 * Used by KanbanBoard to resolve the active task during a drag.
 */
export const findTaskInCache = (id: string): Task | null => {
  const allCaches = globalQueryClient.getQueriesData<PaginatedResult<Task>>({
    queryKey: QUERY_KEYS.tasks(),
  });

  for (const [, cache] of allCaches) {
    const match = cache?.data?.find((t) => String(t.id) === id);
    if (match) return match;
  }

  return null;
};
