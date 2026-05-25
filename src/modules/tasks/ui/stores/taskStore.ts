import { defineStore } from "pinia";
import { ref } from "vue";
import { i18n } from "@/core/i18n";
import type {
  DailyTaskOverview,
  RecurringRoomIssue,
  TaskFrequency,
  TaskHistoryPeriod,
  TaskRun,
  TaskStatus,
  TaskType,
} from "@/core/utils/types";
import { useAuthStore } from "@/modules/auth/ui/stores/authStore";
import { taskService } from "@/modules/tasks/data/services/taskService";

export const useTaskStore = defineStore("task", () => {
  const t = i18n.global.t;

  const runs = ref<TaskRun[]>([]);
  const activeRun = ref<TaskRun | null>(null);
  const dailyOverview = ref<DailyTaskOverview | null>(null);
  const history = ref<TaskHistoryPeriod | null>(null);
  const recurringIssues = ref<RecurringRoomIssue[]>([]);
  const loading = ref(false);
  const loadingDetail = ref(false);
  const error = ref<string | null>(null);

  async function fetchRuns(
    hotelId: string,
    filters: {
      date?: string;
      status?: TaskStatus;
      orderByDueDate?: "asc" | "desc";
    } = {},
  ) {
    loading.value = true;
    error.value = null;
    try {
      const token = useAuthStore().token ?? "";
      runs.value = await taskService.listRuns(hotelId, token, filters);
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : t("tasks.errors.fetchTasks");
    } finally {
      loading.value = false;
    }
  }

  async function fetchRun(id: string) {
    loadingDetail.value = true;
    error.value = null;
    try {
      const token = useAuthStore().token ?? "";
      activeRun.value = await taskService.getRun(id, token);
      const index = runs.value.findIndex((run) => run.id === id);
      if (index !== -1) {
        runs.value[index] = activeRun.value;
      }
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : t("tasks.errors.fetchTask");
    } finally {
      loadingDetail.value = false;
    }
  }

  async function fetchDailyOverview(hotelId: string, date?: string) {
    try {
      const token = useAuthStore().token ?? "";
      dailyOverview.value = await taskService.getDailyOverview(
        hotelId,
        token,
        date,
      );
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : t("tasks.errors.fetchTasks");
    }
  }

  async function fetchHistory(
    hotelId: string,
    filters: { from: string; to: string; status?: TaskStatus },
  ) {
    try {
      const token = useAuthStore().token ?? "";
      history.value = await taskService.getHistory(hotelId, token, filters);
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : t("tasks.errors.fetchTasks");
    }
  }

  async function fetchRecurringIssues(
    hotelId: string,
    filters: { periodDays?: number; minOccurrences?: number } = {},
  ) {
    try {
      const token = useAuthStore().token ?? "";
      const response = await taskService.getRecurringIssues(
        hotelId,
        token,
        filters,
      );
      recurringIssues.value = response.recurringRooms;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : t("tasks.errors.fetchTasks");
    }
  }

  async function exportDailyCsv(hotelId: string, date?: string) {
    const token = useAuthStore().token ?? "";
    const { blob, fileName } = await taskService.exportDailyCsv(
      hotelId,
      token,
      date,
    );
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }

  async function createTask(
    payload: {
      hotelId: string;
      title: string;
      description?: string;
      dueDate?: string;
      startsOn?: string;
      endsOn?: string;
      roomIds?: string[];
      isCommonArea?: boolean;
      type?: TaskType;
      frequency?: TaskFrequency;
    },
    imageFiles: File[] = [],
  ) {
    loading.value = true;
    error.value = null;
    try {
      const token = useAuthStore().token ?? "";
      return await taskService.createTask(payload, token, imageFiles);
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : t("tasks.errors.createTask");
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function updateRunStatus(runId: string, status: TaskStatus) {
    error.value = null;
    try {
      const token = useAuthStore().token ?? "";
      const updated = await taskService.updateRunStatus(runId, status, token);
      const index = runs.value.findIndex((run) => run.id === runId);
      if (index !== -1) {
        runs.value[index] = updated;
      }
      if (activeRun.value?.id === runId) {
        activeRun.value = updated;
      }
      return updated;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : t("tasks.errors.updateStatus");
      return null;
    }
  }

  async function updateRunItem(
    runId: string,
    roomId: string,
    payload: { status?: TaskStatus; note?: string },
    imageFiles: File[] = [],
  ) {
    error.value = null;
    try {
      const token = useAuthStore().token ?? "";
      await taskService.updateRunItem(
        runId,
        roomId,
        payload,
        token,
        imageFiles,
      );
      await fetchRun(runId);
      return activeRun.value;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : t("tasks.errors.addComment");
      return null;
    }
  }

  function clearActiveRun() {
    activeRun.value = null;
  }

  return {
    runs,
    activeRun,
    dailyOverview,
    history,
    recurringIssues,
    loading,
    loadingDetail,
    error,
    fetchRuns,
    fetchRun,
    fetchDailyOverview,
    fetchHistory,
    fetchRecurringIssues,
    exportDailyCsv,
    createTask,
    updateRunStatus,
    updateRunItem,
    clearActiveRun,
  };
});
