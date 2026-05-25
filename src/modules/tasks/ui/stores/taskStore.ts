import { defineStore } from "pinia";
import { ref } from "vue";
import { i18n } from "@/core/i18n";
import type { Task, TaskComment, TaskStatus } from "@/core/utils/types";
import { useAuthStore } from "@/modules/auth/ui/stores/authStore";
import { taskService } from "@/modules/tasks/data/services/taskService";

export const useTaskStore = defineStore("task", () => {
  const t = i18n.global.t;

  const tasks = ref<Task[]>([]);
  const activeTask = ref<Task | null>(null);
  const loading = ref(false);
  const loadingDetail = ref(false);
  const error = ref<string | null>(null);

  async function fetchTasks(
    hotelId: string,
    filters: { status?: TaskStatus; orderByDueDate?: "asc" | "desc" } = {},
  ) {
    loading.value = true;
    error.value = null;
    try {
      const token = useAuthStore().token ?? "";
      tasks.value = await taskService.listTasks(hotelId, token, filters);
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : t("tasks.errors.fetchTasks");
    } finally {
      loading.value = false;
    }
  }

  async function fetchTask(id: string) {
    loadingDetail.value = true;
    error.value = null;
    try {
      const token = useAuthStore().token ?? "";
      activeTask.value = await taskService.getTask(id, token);
      // sync into list
      const idx = tasks.value.findIndex((t) => t.id === id);
      if (idx !== -1) tasks.value[idx] = activeTask.value;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : t("tasks.errors.fetchTask");
    } finally {
      loadingDetail.value = false;
    }
  }

  async function createTask(
    payload: {
      hotelId: string;
      title: string;
      description?: string;
      dueDate?: string;
      roomIds?: string[];
      isCommonArea?: boolean;
    },
    imageFiles: File[] = [],
  ) {
    loading.value = true;
    error.value = null;
    try {
      const token = useAuthStore().token ?? "";
      const task = await taskService.createTask(payload, token, imageFiles);
      tasks.value.unshift(task);
      return task;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : t("tasks.errors.createTask");
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function updateStatus(
    id: string,
    status: "EM_ANDAMENTO" | "CONCLUIDA" | "CANCELADA",
  ) {
    error.value = null;
    try {
      const token = useAuthStore().token ?? "";
      const updated = await taskService.updateStatus(id, status, token);
      const idx = tasks.value.findIndex((t) => t.id === id);
      if (idx !== -1) tasks.value[idx] = updated;
      if (activeTask.value?.id === id) {
        activeTask.value = { ...activeTask.value, ...updated };
      }
      return updated;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : t("tasks.errors.updateStatus");
      return null;
    }
  }

  async function addComment(
    taskId: string,
    body: string,
    imageFiles: File[] = [],
  ) {
    error.value = null;
    try {
      const token = useAuthStore().token ?? "";
      const comment = await taskService.addComment(
        taskId,
        body,
        token,
        imageFiles,
      );
      if (activeTask.value?.id === taskId) {
        if (!activeTask.value.comments) activeTask.value.comments = [];
        activeTask.value.comments.push(comment as TaskComment);
      }
      return comment;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : t("tasks.errors.addComment");
      return null;
    }
  }

  function clearActiveTask() {
    activeTask.value = null;
  }

  return {
    tasks,
    activeTask,
    loading,
    loadingDetail,
    error,
    fetchTasks,
    fetchTask,
    createTask,
    updateStatus,
    addComment,
    clearActiveTask,
  };
});
