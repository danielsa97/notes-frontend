import { apiRequest, API_BASE_URL } from "@/core/utils/apiClient";
import type { Task, TaskComment, TaskStatus } from "@/core/utils/types";
import { i18n } from "@/core/i18n";

type CreateTaskPayload = {
  hotelId: string;
  title: string;
  description?: string;
  dueDate?: string;
  roomIds?: string[];
  isCommonArea?: boolean;
};

export const taskService = {
  async listTasks(
    hotelId: string,
    token: string,
    filters: { status?: TaskStatus; orderByDueDate?: "asc" | "desc" } = {},
  ) {
    const params = new URLSearchParams({ hotelId });
    if (filters.status) params.set("status", filters.status);
    if (filters.orderByDueDate)
      params.set("orderByDueDate", filters.orderByDueDate);
    return apiRequest<Task[]>(`/tasks?${params.toString()}`, { token });
  },

  async getTask(id: string, token: string) {
    return apiRequest<Task>(`/tasks/${id}`, { token });
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
    if (payload.roomIds)
      formData.append("roomIds", JSON.stringify(payload.roomIds));
    if (payload.isCommonArea !== undefined)
      formData.append("isCommonArea", String(payload.isCommonArea));
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

  async updateStatus(
    id: string,
    status: "EM_ANDAMENTO" | "CONCLUIDA" | "CANCELADA",
    token: string,
  ) {
    return apiRequest<Task>(`/tasks/${id}/status`, {
      method: "PATCH",
      body: { status },
      token,
    });
  },

  async addComment(
    taskId: string,
    body: string,
    token: string,
    imageFiles: File[] = [],
  ) {
    if (imageFiles.length > 5) {
      throw new Error(i18n.global.t("tasks.maxImagesError"));
    }

    if (imageFiles.length > 0) {
      const formData = new FormData();
      formData.append("body", body);
      for (const file of imageFiles) {
        formData.append("images", file);
      }

      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/comments`, {
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

      return (await response.json()) as TaskComment;
    }

    return apiRequest<TaskComment>(`/tasks/${taskId}/comments`, {
      method: "POST",
      body: { body },
      token,
    });
  },
};
