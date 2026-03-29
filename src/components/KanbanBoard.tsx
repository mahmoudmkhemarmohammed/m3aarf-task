import { DndContext, DragOverlay, closestCorners } from "@dnd-kit/core";
import {
  Box,
  Typography,
  Button,
  AppBar,
  Toolbar,
  Container,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ViewKanbanIcon from "@mui/icons-material/ViewKanban";

import { KanbanColumn } from "./KanbanColumn";
import { TaskCard } from "./TaskCard";
import { TaskFormModal } from "./TaskFormModal";
import { SearchBar } from "./SearchBar";

import { useKanbanBoard } from "@/hooks";
import { openCreateModal, setSearchQuery } from "@/store";
import { COLUMN_CONFIG } from "@/types";

const KanbanBoard = () => {
  const {
    searchQuery,
    dispatch,
    sensors,
    handleDragStart,
    handleDragEnd,
    activeTask,
  } = useKanbanBoard();

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      {/* AppBar */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: "background.paper",
          borderBottom: "1px solid",
          borderColor: "divider",
          color: "text.primary",
        }}
      >
        <Toolbar sx={{ gap: 2, flexWrap: "wrap" }}>
          <Box display="flex" alignItems="center" gap={1} mr="auto">
            <ViewKanbanIcon color="primary" />
            <Typography variant="h6" color="primary">
              Kanban Board
            </Typography>
          </Box>

          <SearchBar
            value={searchQuery}
            onChange={(val) => dispatch(setSearchQuery(val))}
          />

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            size="small"
            onClick={() => dispatch(openCreateModal())}
          >
            New Task
          </Button>
        </Toolbar>
      </AppBar>

      {/* Board */}
      <Container maxWidth={false} sx={{ py: 3, px: { xs: 2, md: 3 } }}>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <Box
            sx={{
              display: "flex",
              gap: 2,
              overflowX: "auto",
              pb: 2,
              alignItems: "flex-start",
            }}
          >
            {COLUMN_CONFIG.map((column) => (
              <KanbanColumn
                key={column.id}
                column={column}
                searchQuery={searchQuery}
              />
            ))}
          </Box>

          {/* Ghost card above all columns during drag */}
          <DragOverlay>
            {activeTask ? <TaskCard task={activeTask} /> : null}
          </DragOverlay>
        </DndContext>
      </Container>

      {/* Single global create / edit dialog */}
      <TaskFormModal />
    </Box>
  );
};

export { KanbanBoard };
