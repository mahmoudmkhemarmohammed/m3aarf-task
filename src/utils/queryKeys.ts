import type { ColumnId } from '@/types';

export const QUERY_KEYS = {
  /** Invalidates ALL task queries in one call. */
  tasks: () => ['tasks'] as const,

  /** Per-column paginated slice (scoped to page + search). */
  tasksByColumn: (col: ColumnId, page: number, search: string) =>
    ['tasks', col, page, search] as const,

  /** Board-wide search results. */
  allTasks: (search: string) => ['tasks', 'all', search] as const,
};

export const PAGE_SIZE = 5;