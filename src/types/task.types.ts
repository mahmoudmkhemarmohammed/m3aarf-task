export type ColumnId = "backlog" | "in_progress" | "review" | "done";

export const COLUMNS = {
  BACKLOG: "backlog",
  IN_PROGRESS: "in_progress",
  REVIEW: "review",
  DONE: "done",
} as const satisfies Record<string, ColumnId>;

export interface ColumnConfig {
  id: ColumnId;
  label: string;
  /** Accent hex — used for dot, badge, droppable border. */
  color: string;
  /** Tinted panel background. */
  lightBg: string;
}

export const COLUMN_CONFIG: readonly ColumnConfig[] = [
  { id: "backlog", label: "Backlog", color: "#6366f1", lightBg: "#eef2ff" },
  {
    id: "in_progress",
    label: "In Progress",
    color: "#f59e0b",
    lightBg: "#fffbeb",
  },
  { id: "review", label: "Review", color: "#8b5cf6", lightBg: "#f5f3ff" },
  { id: "done", label: "Done", color: "#10b981", lightBg: "#ecfdf5" },
] as const;

// Task entity

export interface Task {
  id: number;
  title: string;
  description: string;
  column: ColumnId;
}

/** POST /tasks — server assigns the id. */
export type CreateTaskPayload = Omit<Task, "id">;

/** PATCH /tasks/:id — id is required; all other fields are optional. */
export type UpdateTaskPayload = Pick<Task, "id"> & Partial<Omit<Task, "id">>;

// Generic wrappers
export interface PaginatedResult<T> {
  data: T[];
  total: number;
}
