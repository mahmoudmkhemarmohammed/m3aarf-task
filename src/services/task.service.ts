import { apiClient } from "@/lib";
import type {
  Task,
  ColumnId,
  CreateTaskPayload,
  UpdateTaskPayload,
  PaginatedResult,
} from "@/types";

// Params
interface FetchColumnParams {
  column: ColumnId;
  page: number;
  limit: number;
  search?: string;
}

// Queries
export const fetchTasksByColumn = async ({
  column,
  page,
  limit,
  search,
}: FetchColumnParams): Promise<PaginatedResult<Task>> => {
  const params: Record<string, string | number> = {
    column,
    _page: page,
    _limit: limit,
  };

  if (search?.trim()) params.q = search.trim();

  const response = await apiClient.get<Task[] | PaginatedResult<Task>>(
    "/tasks",
    { params },
  );

  const raw = response.data;
  if (Array.isArray(raw)) {
    const total = Number(response.headers["x-total-count"] ?? raw.length);
    return { data: raw, total };
  }

  // Fallback: already a PaginatedResult shape
  const total = Number(response.headers["x-total-count"] ?? raw.total ?? 0);
  return { data: Array.isArray(raw.data) ? raw.data : [], total };
};

export const fetchAllTasks = async (search?: string): Promise<Task[]> => {
  const params: Record<string, string> = {};
  if (search?.trim()) params.q = search.trim();

  const response = await apiClient.get<Task[]>("/tasks", { params });
  return response.data;
};

//  Mutations
export const createTask = async (payload: CreateTaskPayload): Promise<Task> => {
  const response = await apiClient.post<Task>("/tasks", payload);
  return response.data;
};

export const updateTask = async ({
  id,
  ...patch
}: UpdateTaskPayload): Promise<Task> => {
  const response = await apiClient.patch<Task>(`/tasks/${id}`, patch);
  return response.data;
};

export const deleteTask = async (id: Task["id"]): Promise<void> => {
  await apiClient.delete(`/tasks/${id}`);
};
