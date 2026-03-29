import type { ColumnId, CreateTaskPayload } from "@/types";
import {
  useAppDispatch,
  useAppSelector,
  useCreateTask,
  useUpdateTask,
} from "@/hooks";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { closeCreateModal, closeEditModal } from "@/store";

interface TaskFormValues {
  title: string;
  description: string;
  column: ColumnId;
}
const useTaskFormModal = () => {
  const dispatch = useAppDispatch();
  const { isCreateModalOpen, defaultColumn, editingTask } = useAppSelector(
    (s) => s.ui,
  );

  const isEditMode = editingTask !== null;
  const isOpen = isCreateModalOpen || isEditMode;

  const { mutate: createTask, isPending: isCreating } = useCreateTask();
  const { mutate: updateTask, isPending: isUpdating } = useUpdateTask();
  const isLoading = isCreating || isUpdating;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TaskFormValues>({
    defaultValues: { title: "", description: "", column: defaultColumn },
  });

  // Sync form when modal opens or editing target changes
  useEffect(() => {
    if (isEditMode && editingTask) {
      reset({
        title: editingTask.title,
        description: editingTask.description,
        column: editingTask.column,
      });
    } else if (isCreateModalOpen) {
      reset({ title: "", description: "", column: defaultColumn });
    }
  }, [isEditMode, editingTask, isCreateModalOpen, defaultColumn, reset]);

  const handleClose = () => {
    if (isEditMode) {
      dispatch(closeEditModal());
    } else {
      dispatch(closeCreateModal());
    }
    reset();
  };

  const onSubmit = (formData: TaskFormValues) => {
    if (isEditMode && editingTask) {
      updateTask(
        { id: editingTask.id, ...formData },
        { onSuccess: handleClose },
      );
    } else {
      const payload: CreateTaskPayload = {
        title: formData.title,
        description: formData.description,
        column: formData.column,
      };
      createTask(payload, { onSuccess: handleClose });
    }
  };

  return {
    isOpen,
    handleClose,
    isEditMode,
    handleSubmit,
    onSubmit,
    control,
    errors,
    isLoading,
  };
};

export { useTaskFormModal };
