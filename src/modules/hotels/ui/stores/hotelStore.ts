import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { hotelService } from "@/modules/hotels/data/services/hotelService";
import { useAuthStore } from "@/modules/auth/ui/stores/authStore";
import type { Hotel } from "@/core/utils/types";
import { i18n } from "@/core/i18n";

export const useHotelStore = defineStore("hotel", () => {
  const t = i18n.global.t;

  const hotels = ref<Hotel[]>([]);
  const currentHotel = ref<Hotel | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const activeHotels = computed(() =>
    hotels.value.filter((h) => !h.archived && h.status === "ativo"),
  );
  const archivedHotels = computed(() => hotels.value.filter((h) => h.archived));

  async function fetchHotels() {
    loading.value = true;
    error.value = null;
    try {
      const token = useAuthStore().token ?? "";
      const { data, error: err } = await hotelService.getHotels(token);
      if (err) throw err;
      hotels.value = data || [];
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : t("hotels.errors.fetchHotels");
    } finally {
      loading.value = false;
    }
  }

  async function fetchHotelById(id: string) {
    loading.value = true;
    error.value = null;
    try {
      const token = useAuthStore().token ?? "";
      const { data, error: err } = await hotelService.getHotelById(id, token);
      if (err) throw err;
      currentHotel.value = data;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : t("hotels.errors.fetchHotel");
    } finally {
      loading.value = false;
    }
  }

  async function createHotel(
    hotel: Omit<Hotel, "id" | "created_at" | "updated_at" | "image_urls">,
    imageFiles: File[] = [],
  ) {
    loading.value = true;
    error.value = null;
    try {
      const token = useAuthStore().token ?? "";
      const { data, error: err } = await hotelService.createHotel(
        hotel,
        imageFiles,
        token,
      );
      if (err) throw err;
      if (data) hotels.value.push(...data);
      return data;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : t("hotels.errors.createHotel");
    } finally {
      loading.value = false;
    }
  }

  async function updateHotel(id: string, updates: Partial<Hotel>) {
    loading.value = true;
    error.value = null;
    try {
      const token = useAuthStore().token ?? "";
      const { data, error: err } = await hotelService.updateHotel(
        id,
        updates,
        token,
      );
      if (err) throw err;
      const index = hotels.value.findIndex((h) => h.id === id);
      if (index !== -1 && data) {
        hotels.value[index] = data[0];
      }
      return data;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : t("hotels.errors.updateHotel");
    } finally {
      loading.value = false;
    }
  }

  async function deleteHotel(id: string) {
    loading.value = true;
    error.value = null;
    try {
      const token = useAuthStore().token ?? "";
      const { error: err } = await hotelService.deleteHotel(id, token);
      if (err) throw err;
      hotels.value = hotels.value.filter((h) => h.id !== id);
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : t("hotels.errors.deleteHotel");
    } finally {
      loading.value = false;
    }
  }

  return {
    hotels,
    currentHotel,
    loading,
    error,
    activeHotels,
    archivedHotels,
    fetchHotels,
    fetchHotelById,
    createHotel,
    updateHotel,
    deleteHotel,
  };
});
