import { Controller } from "react-hook-form";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  Stack,
  CircularProgress,
} from "@mui/material";

import { COLUMN_CONFIG } from "@/types";
import { useTaskFormModal } from "@/hooks";

const TaskFormModal = () => {
  const {
    isOpen,
    handleClose,
    isEditMode,
    handleSubmit,
    onSubmit,
    control,
    errors,
    isLoading,
  } = useTaskFormModal();

  return (
    <Dialog open={isOpen} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 700 }}>
        {isEditMode ? "Edit Task" : "Create New Task"}
      </DialogTitle>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <DialogContent>
          <Stack spacing={2.5} pt={0.5}>
            {/* Title */}
            <Controller
              name="title"
              control={control}
              rules={{
                required: "Title is required",
                maxLength: { value: 120, message: "Max 120 characters" },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Title"
                  required
                  fullWidth
                  autoFocus
                  error={Boolean(errors.title)}
                  helperText={errors.title?.message}
                />
              )}
            />

            {/* Description */}
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Description"
                  fullWidth
                  multiline
                  minRows={3}
                />
              )}
            />

            {/* Column */}
            <Controller
              name="column"
              control={control}
              rules={{ required: "Column is required" }}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label="Column"
                  fullWidth
                  error={Boolean(errors.column)}
                  helperText={errors.column?.message}
                >
                  {COLUMN_CONFIG.map((col) => (
                    <MenuItem key={col.id} value={col.id}>
                      {col.label}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isLoading}
            startIcon={
              isLoading ? <CircularProgress size={16} color="inherit" /> : null
            }
          >
            {isEditMode ? "Save Changes" : "Create Task"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export { TaskFormModal };
