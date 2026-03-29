import {
  Card,
  CardContent,
  Typography,
  IconButton,
  Box,
  Tooltip,
  Chip,
} from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import type { DraggableSyntheticListeners } from "@dnd-kit/core";

import { useAppDispatch } from "@/hooks";
import { openEditModal } from "@/store";
import { useDeleteTask } from "@/hooks";
import { COLUMN_CONFIG } from "@/types";
import type { Task } from "@/types";

interface TaskCardProps {
  task: Task;
  dragHandleProps?: DraggableSyntheticListeners;
  isDragging?: boolean;
}

const TaskCard = ({
  task,
  dragHandleProps,
  isDragging = false,
}: TaskCardProps) => {
  const dispatch = useAppDispatch();
  const { mutate: deleteTask, isPending: isDeleting } = useDeleteTask();

  const colConfig = COLUMN_CONFIG.find((c) => c.id === task.column);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Delete "${task.title}"?`)) deleteTask(task.id);
  };

  return (
    <Card
      sx={{
        mb: 1.5,
        cursor: isDragging ? "grabbing" : "grab",
        opacity: isDragging ? 0.45 : 1,
        transition: "box-shadow 0.2s, opacity 0.2s",
        "&:hover": { boxShadow: "0 4px 16px rgba(99,102,241,0.13)" },
      }}
    >
      <CardContent sx={{ pb: "12px !important", pt: 1.5, px: 2 }}>
        {/* Drag handle + actions */}
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          mb={0.5}
        >
          <Box
            display="flex"
            alignItems="center"
            {...dragHandleProps}
            sx={{ cursor: isDragging ? "grabbing" : "grab" }}
          >
            <DragIndicatorIcon sx={{ fontSize: 18, color: "text.disabled" }} />
          </Box>

          <Box display="flex" gap={0.25}>
            <Tooltip title="Edit">
              <IconButton
                size="small"
                aria-label={`Edit ${task.title}`}
                onClick={() => dispatch(openEditModal(task))}
              >
                <EditOutlinedIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>

            <Tooltip title="Delete">
              <IconButton
                size="small"
                color="error"
                aria-label={`Delete ${task.title}`}
                onClick={handleDelete}
                disabled={isDeleting}
              >
                <DeleteOutlineIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Title */}
        <Typography
          variant="body1"
          fontWeight={600}
          gutterBottom
          lineHeight={1.4}
        >
          {task.title}
        </Typography>

        {/* Description — 2-line clamp */}
        {task.description && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              mb: 1,
            }}
          >
            {task.description}
          </Typography>
        )}

        {/* Column badge */}
        <Chip
          label={colConfig?.label ?? task.column}
          size="small"
          sx={{
            bgcolor: colConfig?.lightBg,
            color: colConfig?.color,
            fontWeight: 600,
            fontSize: 11,
            height: 20,
          }}
        />
      </CardContent>
    </Card>
  );
};

export { TaskCard };
