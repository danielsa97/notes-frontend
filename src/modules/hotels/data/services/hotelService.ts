import { apiRequest, API_BASE_URL } from "@/core/utils/apiClient";
import type { Hotel } from "@/core/utils/types";
import { i18n } from "@/core/i18n";

type CreateHotelPayload = {
  name: string;
  description?: string | null;
};

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

  async updateHotel(
    id: string,
    updates: Partial<Hotel>,
    token: string,
    imageFiles: File[] = [],
  ) {
    if (imageFiles.length > 3) {
      throw new Error(i18n.global.t("hotels.maxImagesError"));
    }

    if (imageFiles.length > 0 || updates.image_urls !== undefined) {
      const formData = new FormData();
      if (updates.name !== undefined) formData.append("name", updates.name);
      if (updates.description !== undefined) {
        formData.append("description", updates.description ?? "");
      }
      if (updates.status !== undefined)
        formData.append("status", updates.status);
      if (updates.image_urls !== undefined) {
        formData.append("image_urls", JSON.stringify(updates.image_urls));
      }
      for (const file of imageFiles) {
        formData.append("images", file);
      }

      const response = await fetch(`${API_BASE_URL}/hotels/${id}`, {
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

      const data = await response.json();
      return { data: [data] as Hotel[], error: null };
    }

    const data = await apiRequest<Hotel>(`/hotels/${id}`, {
      method: "PUT",
      body: updates,
      token,
    });
    return { data: [data] as Hotel[], error: null };
  },

  async archiveHotel(id: string, token: string) {
    const data = await apiRequest<Hotel>(`/hotels/${id}/archive`, {
      method: "PATCH",
      token,
    });
    return { data, error: null };
  },
};
