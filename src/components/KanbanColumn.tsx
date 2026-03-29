import {
  Box,
  Typography,
  Button,
  Pagination,
  Skeleton,
  Alert,
  Divider,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { SortableTaskCard } from "./SortableTaskCard";
import { useColumnTasks, useDebounce } from "@/hooks";
import { useAppDispatch } from "@/hooks";
import { openCreateModal } from "@/store";
import type { ColumnConfig, Task } from "@/types";

interface KanbanColumnProps {
  column: ColumnConfig;
  searchQuery: string;
}

const KanbanColumn = ({ column, searchQuery }: KanbanColumnProps) => {
  const dispatch = useAppDispatch();
  const debouncedSearch = useDebounce(searchQuery, 400);

  const { data, isLoading, isError, error, page, totalPages, goToPage } =
    useColumnTasks(column.id, debouncedSearch);

  const tasks: Task[] = Array.isArray(data?.data) ? data.data : [];

  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        flex: "1 1 0",
        minWidth: 240,
        maxWidth: 320,
        bgcolor: isOver ? `${column.color}18` : column.lightBg,
        borderRadius: 2,
        border: `2px solid ${isOver ? column.color : "transparent"}`,
        transition: "border-color 0.2s, background-color 0.2s",
        p: 2,
        height: "100%",
      }}
    >
      {/* Header */}
      <Box display="flex" alignItems="center" gap={1} mb={2}>
        <Box
          sx={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            bgcolor: column.color,
            flexShrink: 0,
          }}
        />

        <Typography variant="subtitle2" fontWeight={700}>
          {column.label.toUpperCase()}
        </Typography>

        <Typography
          variant="caption"
          sx={{
            bgcolor: column.color,
            color: "#fff",
            borderRadius: 10,
            px: 0.9,
            fontWeight: 700,
            fontSize: 11,
          }}
        >
          {data?.total ?? 0}
        </Typography>
      </Box>

      <Divider sx={{ mb: 2, borderColor: `${column.color}40` }} />

      {/* Task list (droppable) */}
      <Box ref={setNodeRef} sx={{ flexGrow: 1, minHeight: 60 }}>
        {isLoading &&
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} variant="rounded" height={90} sx={{ mb: 1.5 }} />
          ))}

        {isError && (
          <Alert severity="error" sx={{ mb: 1 }}>
            {error?.message ?? "Failed to load tasks"}
          </Alert>
        )}

        {!isLoading && !isError && tasks.length === 0 && (
          <Typography
            variant="body2"
            color="text.disabled"
            textAlign="center"
            py={3}
          >
            No tasks yet
          </Typography>
        )}

        <SortableContext
          items={tasks?.map((t) => String(t.id))}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <SortableTaskCard key={task.id} task={task} />
          ))}
        </SortableContext>
      </Box>

      {/* Pagination */}
      {totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={1.5}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, p) => goToPage(p)}
            size="small"
            siblingCount={0}
            sx={{ "& .MuiPaginationItem-root": { fontSize: 11 } }}
          />
        </Box>
      )}

      {/* Add task shortcut */}
      <Button
        startIcon={<AddIcon />}
        size="small"
        fullWidth
        variant="outlined"
        onClick={() => dispatch(openCreateModal(column.id))}
        sx={{
          mt: 1.5,
          color: column.color,
          borderColor: `${column.color}60`,
          "&:hover": { bgcolor: `${column.color}12` },
        }}
      >
        Add task
      </Button>
    </Box>
  );
};

export { KanbanColumn };
