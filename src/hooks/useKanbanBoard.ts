import { useCallback, useState } from "react";
import { useAppDispatch, useAppSelector } from "./useRedux";
import { COLUMN_CONFIG, type ColumnId, type Task } from "@/types";
import { findTaskInCache, useUpdateTask } from "./useTasks";
import {
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";

const useKanbanBoard = () => {
  const dispatch = useAppDispatch();
  const searchQuery = useAppSelector((s) => s.ui.searchQuery);

  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const { mutate: updateTask } = useUpdateTask({ optimistic: true });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  // Drag handlers

  const handleDragStart = useCallback(({ active }: DragStartEvent) => {
    setActiveTask(findTaskInCache(String(active.id)));
  }, []);

  const handleDragEnd = useCallback(
    ({ active, over }: DragEndEvent) => {
      setActiveTask(null);
      if (!over) return;

      const overId = String(over.id);

      const isColumnTarget = COLUMN_CONFIG.some((c) => c.id === overId);

      const targetColumn: ColumnId | null = isColumnTarget
        ? (overId as ColumnId)
        : (findTaskInCache(overId)?.column ?? null);

      if (!targetColumn) return;
      if (activeTask?.column === targetColumn) return; // same column — no-op

      updateTask({ id: Number(active.id), column: targetColumn });
    },
    [activeTask, updateTask],
  );

  return {
    searchQuery,
    dispatch,
    sensors,
    handleDragStart,
    handleDragEnd,
    activeTask,
  };
};

export { useKanbanBoard };
