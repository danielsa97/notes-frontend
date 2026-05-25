import { apiRequest, API_BASE_URL } from "@/core/utils/apiClient";
import type {
  DailyTaskOverview,
  RecurringRoomIssuesResponse,
  Task,
  TaskFrequency,
  TaskHistoryPeriod,
  TaskRunItem,
  TaskRun,
  TaskStatus,
  TaskType,
} from "@/core/utils/types";
import { i18n } from "@/core/i18n";

type CreateTaskPayload = {
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
};

type ListRunsFilters = {
  date?: string;
  status?: TaskStatus;
  orderByDueDate?: "asc" | "desc";
};

type UpdateRunItemPayload = {
  status?: TaskStatus;
  note?: string;
};

export const taskService = {
  async listRuns(
    hotelId: string,
    token: string,
    filters: ListRunsFilters = {},
  ) {
    const params = new URLSearchParams({ hotelId });
    if (filters.date) params.set("date", filters.date);
    if (filters.status) params.set("status", filters.status);
    if (filters.orderByDueDate)
      params.set("orderByDueDate", filters.orderByDueDate);
    return apiRequest<TaskRun[]>(`/tasks?${params.toString()}`, { token });
  },

  async getRun(id: string, token: string) {
    return apiRequest<TaskRun>(`/tasks/runs/${id}`, { token });
  },

  async getDailyOverview(hotelId: string, token: string, date?: string) {
    const params = new URLSearchParams({ hotelId });
    if (date) params.set("date", date);
    return apiRequest<DailyTaskOverview>(
      `/tasks/overview/daily?${params.toString()}`,
      {
        token,
      },
    );
  },

  async getHistory(
    hotelId: string,
    token: string,
    filters: { from: string; to: string; status?: TaskStatus },
  ) {
    const params = new URLSearchParams({
      hotelId,
      from: filters.from,
      to: filters.to,
    });
    if (filters.status) params.set("status", filters.status);
    return apiRequest<TaskHistoryPeriod>(
      `/tasks/history?${params.toString()}`,
      {
        token,
      },
    );
  },

  async getRecurringIssues(
    hotelId: string,
    token: string,
    filters: { periodDays?: number; minOccurrences?: number } = {},
  ) {
    const params = new URLSearchParams({ hotelId });
    if (filters.periodDays !== undefined) {
      params.set("periodDays", String(filters.periodDays));
    }
    if (filters.minOccurrences !== undefined) {
      params.set("minOccurrences", String(filters.minOccurrences));
    }
    return apiRequest<RecurringRoomIssuesResponse>(
      `/tasks/overview/recurring-issues?${params.toString()}`,
      { token },
    );
  },

  async exportDailyCsv(hotelId: string, token: string, date?: string) {
    const params = new URLSearchParams({ hotelId });
    if (date) params.set("date", date);
    const response = await fetch(
      `${API_BASE_URL}/tasks/export/daily.csv?${params.toString()}`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData?.error || i18n.global.t("common.requestFailed"),
      );
    }

    const blob = await response.blob();
    const contentDisposition =
      response.headers.get("content-disposition") || "";
    const match = /filename="([^"]+)"/.exec(contentDisposition);
    const fileName = match?.[1] || "fechamento-tarefas.csv";

    return { blob, fileName };
  },

  async createTask(
    payload: CreateTaskPayload,
    token: string,
    imageFiles: File[] = [],
  ) {
    if (imageFiles.length > 5) {
      throw new Error(i18n.global.t("tasks.maxImagesError"));
    }

    const formData = new FormData();
    formData.append("hotelId", payload.hotelId);
    formData.append("title", payload.title);
    if (payload.description)
      formData.append("description", payload.description);
    if (payload.dueDate) formData.append("dueDate", payload.dueDate);
    if (payload.startsOn) formData.append("startsOn", payload.startsOn);
    if (payload.endsOn) formData.append("endsOn", payload.endsOn);
    if (payload.roomIds)
      formData.append("roomIds", JSON.stringify(payload.roomIds));
    if (payload.isCommonArea !== undefined) {
      formData.append("isCommonArea", String(payload.isCommonArea));
    }
    if (payload.type) formData.append("type", payload.type);
    if (payload.frequency) formData.append("frequency", payload.frequency);
    for (const file of imageFiles) {
      formData.append("images", file);
    }

    const response = await fetch(`${API_BASE_URL}/tasks`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData?.error || i18n.global.t("common.requestFailed"),
      );
    }

    return (await response.json()) as Task;
  },

  async updateRunStatus(runId: string, status: TaskStatus, token: string) {
    return apiRequest<TaskRun>(`/tasks/runs/${runId}/status`, {
      method: "PATCH",
      body: { status },
      token,
    });
  },

  async updateRunItem(
    runId: string,
    roomId: string,
    payload: UpdateRunItemPayload,
    token: string,
    imageFiles: File[] = [],
  ) {
    if (imageFiles.length > 5) {
      throw new Error(i18n.global.t("tasks.maxImagesError"));
    }

    if (imageFiles.length > 0) {
      const formData = new FormData();
      if (payload.status) formData.append("status", payload.status);
      if (payload.note) formData.append("note", payload.note);
      for (const file of imageFiles) {
        formData.append("images", file);
      }

      const response = await fetch(
        `${API_BASE_URL}/tasks/runs/${runId}/items/${roomId}`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData?.error || i18n.global.t("common.requestFailed"),
        );
      }

      return (await response.json()) as TaskRunItem;
    }

    return apiRequest<TaskRunItem>(`/tasks/runs/${runId}/items/${roomId}`, {
      method: "PATCH",
      body: payload,
      token,
    });
  },
};
