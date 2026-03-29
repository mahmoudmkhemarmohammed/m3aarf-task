import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Task, ColumnId } from "@/types";

interface UiState {
  searchQuery: string;
  isCreateModalOpen: boolean;
  defaultColumn: ColumnId;
  editingTask: Task | null;
}

const initialState: UiState = {
  searchQuery: "",
  isCreateModalOpen: false,
  defaultColumn: "backlog",
  editingTask: null,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    // Search
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
    },

    // Create modal
    openCreateModal(state, action: PayloadAction<ColumnId | undefined>) {
      state.isCreateModalOpen = true;
      state.defaultColumn = action.payload ?? "backlog";
    },
    closeCreateModal(state) {
      state.isCreateModalOpen = false;
      state.defaultColumn = "backlog";
    },

    // Edit modal
    openEditModal(state, action: PayloadAction<Task>) {
      state.editingTask = action.payload;
    },
    closeEditModal(state) {
      state.editingTask = null;
    },
  },
});

export const {
  setSearchQuery,
  openCreateModal,
  closeCreateModal,
  openEditModal,
  closeEditModal,
} = uiSlice.actions;

export default uiSlice.reducer;
