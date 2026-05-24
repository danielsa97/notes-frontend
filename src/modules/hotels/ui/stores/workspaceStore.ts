import { defineStore } from "pinia";
import { ref } from "vue";
import useLocalStorage from "@/core/utils/composables/useLocalStorage";
import type { Hotel } from "@/core/utils/types";

export const useWorkspaceStore = defineStore("workspace", () => {
  const { value: storedHotel, setItem: setStoredHotel } = useLocalStorage(
    "active_hotel",
    null,
  );

  const activeHotel = ref<Hotel | null>(
    storedHotel.value ? (storedHotel.value as Hotel) : null,
  );

  function setActiveHotel(hotel: Hotel) {
    activeHotel.value = hotel;
    setStoredHotel(hotel);
  }

  function clearActiveHotel() {
    activeHotel.value = null;
    setStoredHotel(null);
  }

  function validateAgainstHotels(hotels: Hotel[]) {
    if (
      activeHotel.value &&
      !hotels.find((h) => h.id === activeHotel.value!.id)
    ) {
      clearActiveHotel();
    }
  }

  return { activeHotel, setActiveHotel, clearActiveHotel, validateAgainstHotels };
});
