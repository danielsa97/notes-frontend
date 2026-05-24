import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { i18n } from "@/core/i18n";
import type { Room } from "@/core/utils/types";
import { useAuthStore } from "@/modules/auth/ui/stores/authStore";
import { roomService } from "@/modules/rooms/data/services/roomService";

export const useRoomStore = defineStore("room", () => {
  const t = i18n.global.t;

  const rooms = ref<Room[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const enabledRooms = computed(() =>
    rooms.value.filter((room) => room.status === "ENABLED"),
  );
  const disabledRooms = computed(() =>
    rooms.value.filter((room) => room.status === "DISABLED"),
  );

  async function fetchRooms(hotelId: string) {
    loading.value = true;
    error.value = null;
    try {
      const token = useAuthStore().token ?? "";
      rooms.value = await roomService.listRooms(hotelId, token);
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : t("rooms.errors.fetchRooms");
    } finally {
      loading.value = false;
    }
  }

  async function createRoom(
    payload: {
      hotelId: string;
      roomId: string;
      type: "CONFORT" | "STANDARD" | "OUTRO";
      description?: string;
      status?: "ENABLED" | "DISABLED";
    },
    imageFiles: File[] = [],
  ) {
    loading.value = true;
    error.value = null;
    try {
      const token = useAuthStore().token ?? "";
      const room = await roomService.createRoom(payload, token, imageFiles);
      rooms.value.unshift(room);
      return room;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : t("rooms.errors.createRoom");
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function updateRoom(
    id: string,
    payload: {
      roomId?: string;
      type?: "CONFORT" | "STANDARD" | "OUTRO";
      description?: string | null;
      status?: "ENABLED" | "DISABLED";
      image_urls?: string[];
    },
    imageFiles: File[] = [],
  ) {
    loading.value = true;
    error.value = null;
    try {
      const token = useAuthStore().token ?? "";
      const updated = await roomService.updateRoom(
        id,
        payload,
        token,
        imageFiles,
      );
      const index = rooms.value.findIndex((room) => room.id === id);
      if (index !== -1) {
        rooms.value[index] = updated;
      }
      return updated;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : t("rooms.errors.updateRoom");
      return null;
    } finally {
      loading.value = false;
    }
  }

  return {
    rooms,
    loading,
    error,
    enabledRooms,
    disabledRooms,
    fetchRooms,
    createRoom,
    updateRoom,
  };
});
