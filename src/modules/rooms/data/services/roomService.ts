import { apiRequest, API_BASE_URL } from "@/core/utils/apiClient";
import type { Room } from "@/core/utils/types";
import { i18n } from "@/core/i18n";

type CreateRoomPayload = {
  hotelId: string;
  roomId: string;
  type: "CONFORT" | "STANDARD" | "OUTRO";
  description?: string;
  status?: "ENABLED" | "DISABLED";
};

type UpdateRoomPayload = {
  roomId?: string;
  type?: "CONFORT" | "STANDARD" | "OUTRO";
  description?: string | null;
  status?: "ENABLED" | "DISABLED";
  image_urls?: string[];
};

export const roomService = {
  async listRooms(hotelId: string, token: string) {
    return apiRequest<Room[]>(`/rooms?hotelId=${encodeURIComponent(hotelId)}`, {
      token,
    });
  },

  async createRoom(
    payload: CreateRoomPayload,
    token: string,
    imageFiles: File[] = [],
  ) {
    if (imageFiles.length > 5) {
      throw new Error(i18n.global.t("rooms.maxImagesError"));
    }

    const formData = new FormData();
    formData.append("hotelId", payload.hotelId);
    formData.append("roomId", payload.roomId);
    formData.append("type", payload.type);
    if (payload.description)
      formData.append("description", payload.description);
    if (payload.status) formData.append("status", payload.status);
    for (const file of imageFiles) {
      formData.append("images", file);
    }

    const response = await fetch(`${API_BASE_URL}/rooms`, {
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

    return (await response.json()) as Room;
  },

  async updateRoom(
    id: string,
    payload: UpdateRoomPayload,
    token: string,
    imageFiles: File[] = [],
  ) {
    if (imageFiles.length > 5) {
      throw new Error(i18n.global.t("rooms.maxImagesError"));
    }

    if (imageFiles.length > 0 || payload.image_urls !== undefined) {
      const formData = new FormData();
      if (payload.roomId !== undefined)
        formData.append("roomId", payload.roomId);
      if (payload.type !== undefined) formData.append("type", payload.type);
      if (payload.description !== undefined) {
        formData.append("description", payload.description ?? "");
      }
      if (payload.status !== undefined)
        formData.append("status", payload.status);
      if (payload.image_urls !== undefined) {
        formData.append("image_urls", JSON.stringify(payload.image_urls));
      }
      for (const file of imageFiles) {
        formData.append("images", file);
      }

      const response = await fetch(`${API_BASE_URL}/rooms/${id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData?.error || i18n.global.t("common.requestFailed"),
        );
      }

      return (await response.json()) as Room;
    }

    return apiRequest<Room>(`/rooms/${id}`, {
      method: "PUT",
      body: payload,
      token,
    });
  },
};
