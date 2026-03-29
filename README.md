# Production Kanban Board (React + TypeScript)

## Project high-level overview

A modular, production-quality Kanban board built top-down around real world engineering concerns:

- `%`  Award: Robust state synchronization using React Query with `json-server` backend.
- `%`  UI-driven architecture: `MUI` controls + presentational components.
- `%`  Business state in Redux Toolkit UI slice and resource state in React Query.
- `%`  Drag-and-drop using `@dnd-kit/core` + `@dnd-kit/sortable`.
- `%`  Clean separation of concerns (`components`, `hooks`, `services`, `store`).

## Why this architecture

1. **React Query for data layer**: (see `src/hooks/useTasks.ts`) ensures cache consistency, stale-while-revalidate behavior, and optimistic updates for DnD interactions. This avoids manual `useEffect` loading states across multiple columns.
2. **Redux Toolkit for UI state**: (see `src/store/uiSlice.ts`) uses a simple slice for modal state + search query, keeping global UI reactions consistent and predictable.
3. **Single source of truth for API**: (`src/services/task.service.ts`) centralizes all HTTP behavior, making migration from `json-server` to a real API a low-friction step.
4. **Component-driven UI**: `KanbanBoard → KanbanColumn → SortableTaskCard → TaskCard` flow is lightweight and easy to test.
5. **Hooks for behavior**: Custom hooks (`useKanbanBoard`, `useColumnTasks`, `useTaskFormModal`, `useTasks`) keep presentation clean and encapsulate domain logic.

## Folder structure (real)

- `src/components` UI components (reusable and presentational)
- `src/hooks` custom hooks and logic units (state + API glue)
- `src/store` Redux toolkit slice & store configuration
- `src/services` REST client adapter (`task.service.ts`)
- `src/lib` infrastructure
  - `queryClient.ts` (React Query defaults)
  - `axios.ts` (API client, error normalization)
- `src/types` domain types (`task.types.ts`)
- `src/utils` constants (`queryKeys.ts`, `PAGE_SIZE` 5)

---

## Drag-and-drop details (dnd-kit)

### 1. Drag start (`src/hooks/useKanbanBoard.ts`)
- `DndContext` uses `useSensors` with `PointerSensor` (activation distance 6 px) for improved UX.
- `handleDragStart` uses `findTaskInCache(active.id)` to capture full task metadata.
- `DragOverlay` renders a ghost `TaskCard` while dragging.

### 2. Drop end
- `handleDragEnd` resolves column target by `over.id`:
  - if `over` is a column (`column.id`), move task to that column.
  - if `over` is another card, uses cached target task's `column`.
- No-op if dropped in same column.
- Calls `updateTask` with `optimistic: true` via `useUpdateTask`.

### 3. Sortable items (`src/components/SortableTaskCard.tsx`)
- `useSortable({ id: String(task.id) })` hooks each card into `@dnd-kit/sortable`.
- transform + transition are controlled with `CSS.Transform.toString`.
- Drag handle listeners passed to `TaskCard` with `dragHandleProps`.

### 4. Droppable column (`src/components/KanbanColumn.tsx`)
- `useDroppable({ id: column.id })` for each column container.
- Visual highlight when `isOver`.
- `SortableContext` with `verticalListSortingStrategy` for correct reorder behavior.

---

## State + server data flow

### App-level providers
- `src/providers/AppProviders.tsx`
  - Redux Provider (`store`)
  - React Query client provider
  - MUI `ThemeProvider + CssBaseline`
  -,ReactQueryDevtools in dev mode

### UI state (Redux)
- `searchQuery`, `isCreateModalOpen`, `defaultColumn`, `editingTask`
- Actions:
  - `setSearchQuery`, `openCreateModal`, `closeCreateModal`, `openEditModal`, `closeEditModal`

### Data layer (React Query)
- `useColumnTasks` (paginated per column): `QUERY_KEYS.tasksByColumn(column,page,search)`
- `useBoardTasks` (search across all tasks by query)

### HTTP layer
- `src/lib/axios.ts`: `apiClient` with `baseURL` from `VITE_API_URL`
- `src/services/task.service.ts`: `GET /tasks`, `POST /tasks`, `PATCH /tasks/:id`, `DELETE /tasks/:id`.

### Optimistic updates
- `useUpdateTask({ optimistic: true })`: updates query cache then rolls back on failure. Works for drag-and-drop transitions.
- `onSettled: invalidate` keeps UI in sync with server after mutations.

### Pagination
- By default, `PAGE_SIZE` = 5 (in `src/utils/queryKeys.ts`), improves performance and initial render on large datasets.

---

## Detailed component behavior

- `src/components/KanbanBoard.tsx`: top-level rendering, search bar, new-task button, context provider, dnd context.
- `src/components/KanbanColumn.tsx`: docking logic (droppable), fetch + loading/error states, per-column pagination, add task shortcut.
- `src/components/TaskFormModal.tsx`: create/edit modal using `react-hook-form` + validation.
- `src/components/TaskCard.tsx`: action buttons (`edit`, `delete`) + status chip + drag handle.

---

## Install and run

```bash
# clone and enter
git clone https://github.com/mahmoudmkhemarmohammed/m3aarf-task.git
cd inside project

# dependencies
pnpm install

# set env
cat > .env <<EOL
VITE_API_URL=http://localhost:4000
EOL

# run mock backend & app
pnpm mock-api
pnpm dev
```

### Available scripts
- `pnpm dev` — run Vite dev server
- `pnpm build` — typecheck + build production bundle
- `pnpm preview` — preview built app
- `pnpm lint` — lint source
- `pnpm mock-api` — start `json-server` on `http://localhost:4000`

---

## json-server API contract

`db.json` currently has:
- `tasks` array (id, title, description, column)

### Endpoints:
- GET `/tasks?_page=<n>&_limit=5&column=<column>&q=<search>`
- GET `/tasks?q=<search>`
- GET `/tasks/:id`
- POST `/tasks` (body: `{ title, description, column }`)
- PATCH `/tasks/:id` (body partial among `title`, `description`, `column`)
- DELETE `/tasks/:id`

### Notes
- `fetchTasksByColumn` reads `X-Total-Count` header and falls back to list length.
- Column mapping is handled by `COLUMN_CONFIG` (lookup in `task.types.ts`).

---

## Performance & reliability considerations

- `queryClient`: `staleTime: 30_000`, `retry: 1`, `refetchOnWindowFocus: false`.
- Local `useDebounce` for search input with 400ms to avoid flood fetch.
- `placeholderData` ensures UI stability while query transitions.
- Row-level loading skeletons and inline alerts for errors.
- Lightweight rerenders: `TaskCard` separation + `SortableTaskCard` wrapper.
- Minimal data weight: pagination by column and global search just for results.

---

## Troubleshooting

### 1. `pnpm mock-api` EADDRINUSE
- default port: `4000`. kill processes or do `PORT=4001 pnpm mock-api` and update `.env`.

### 2. `VITE_API_URL` wrong
- confirm `.env` uses `VITE_API_URL=http://localhost:4000`.
- in browser devtools network APIs should target `/tasks` at that host.

### 3. DnD seems non-responsive
- `activeTask` from `useKanbanBoard` depends on query cache. Ensure task queries are active and have data in cache.
- check console if `handleDragStart` returns `null` due missing tasks in cache due filter/pagination.

### 4. React Query type mismatch
- synchronous typed `Task` shape defined in `src/types/task.types.ts`.
- adapt `createTask`/`updateTask` payloads there.

---