import { apiRequest, API_BASE_URL } from "@/core/utils/apiClient";
import type { Hotel } from "@/core/utils/types";
import { i18n } from "@/core/i18n";

type CreateHotelPayload = Omit<
  Hotel,
  "id" | "created_at" | "updated_at" | "image_urls"
>;

export const hotelService = {
  async getHotels(token: string) {
    const data = await apiRequest<Hotel[]>("/hotels", { token });
    return { data, error: null };
  },

  async getHotelById(id: string, token: string) {
    const data = await apiRequest<Hotel>(`/hotels/${id}`, { token });
    return { data, error: null };
  },

  async createHotel(
    hotel: CreateHotelPayload,
    imageFiles: File[] = [],
    token: string,
  ) {
    if (imageFiles.length > 3) {
      throw new Error(i18n.global.t("hotels.maxImagesError"));
    }

    const formData = new FormData();
    formData.append("name", hotel.name);
    if (hotel.description) formData.append("description", hotel.description);
    formData.append("status", hotel.status);
    for (const file of imageFiles) {
      formData.append("images", file);
    }

    const response = await fetch(`${API_BASE_URL}/hotels`, {
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

    const data = await response.json();
    return { data: [data] as Hotel[], error: null };
  },

  async updateHotel(id: string, updates: Partial<Hotel>, token: string) {
    const data = await apiRequest<Hotel>(`/hotels/${id}`, {
      method: "PUT",
      body: updates,
      token,
    });
    return { data: [data] as Hotel[], error: null };
  },

  async deleteHotel(id: string, token: string) {
    await apiRequest<void>(`/hotels/${id}`, { method: "DELETE", token });
    return { error: null };
  },

  async toggleHotelStatus(
    id: string,
    status: "ativo" | "inativo",
    token: string,
  ) {
    return this.updateHotel(id, { status }, token);
  },

  async archiveHotel(id: string, token: string) {
    await apiRequest<void>(`/hotels/${id}/archive`, {
      method: "PATCH",
      token,
    });
    return { error: null };
  },
};
