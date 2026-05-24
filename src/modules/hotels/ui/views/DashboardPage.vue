<template>
  <AppLayout>
    <div class="max-w-7xl mx-auto px-4 py-8">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">
          {{ t("dashboard.title") }}
        </h1>
        <p class="text-gray-600">{{ t("dashboard.welcome", { name: userName }) }}</p>
      </div>

      <!-- Skeleton while loading -->
      <template v-if="hotelStore.loading">
        <Card class="mb-8">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div class="space-y-3">
              <Shimmer height="0.75rem" width="35%" />
              <Shimmer height="2rem" width="65%" />
              <Shimmer height="1rem" width="95%" />
              <Shimmer height="1rem" width="80%" />
            </div>
            <div class="grid grid-cols-3 gap-3">
              <Shimmer v-for="i in 3" :key="i" height="6rem" rounded="xl" />
            </div>
          </div>
        </Card>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <Shimmer height="1rem" width="45%" class="mb-4" />
            <Shimmer height="2.5rem" width="55%" />
          </Card>
          <Card>
            <Shimmer height="1rem" width="45%" class="mb-4" />
            <Shimmer height="2.5rem" width="55%" />
          </Card>
        </div>
      </template>

      <!-- Content -->
      <template v-else>
        <Card class="mb-8">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <p class="text-xs uppercase tracking-wide text-gray-500 mb-2">
                {{ t("dashboard.workspaceOverview") }}
              </p>
              <h2 class="text-2xl font-bold text-gray-900 mb-2">
                {{ currentHotel?.name || t("dashboard.noWorkspaceSelected") }}
              </h2>
              <p class="text-gray-600 mb-4">
                {{ currentHotel?.description || t("workspace.noDescription") }}
              </p>
              <div
                v-if="currentHotel"
                class="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium"
                :class="
                  currentHotel.status === 'ENABLED'
                    ? 'bg-green-100 text-green-700'
                    : currentHotel.status === 'DISABLED'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-gray-100 text-gray-700'
                "
              >
                {{ t(`hotels.statusValues.${currentHotel.status}`) }}
              </div>
            </div>

            <div>
              <p class="text-sm font-medium text-gray-700 mb-3">
                {{ t("dashboard.workspaceImages") }}
              </p>
              <div v-if="hotelImages.length" class="grid grid-cols-3 gap-3">
                <img
                  v-for="(image, index) in hotelImages"
                  :key="`${image}-${index}`"
                  :src="image"
                  :alt="t('hotels.imageAlt', { name: currentHotel?.name || t('common.appName') })"
                  class="h-24 w-full rounded-xl object-cover"
                />
              </div>
              <div
                v-else
                class="h-24 rounded-xl border border-dashed border-gray-300 bg-gray-50 flex items-center justify-center text-sm text-gray-500"
              >
                {{ t("dashboard.noWorkspaceImages") }}
              </div>
            </div>
          </div>
        </Card>

        <!-- Quick Actions -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <h2 class="text-lg font-bold text-gray-900 mb-4">{{ t("dashboard.quickAction") }}</h2>
            <router-link
              to="/hotels"
              class="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              {{ t("dashboard.manageHotels") }}
            </router-link>
          </Card>

          <Card>
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-lg font-bold text-gray-900 mb-1">{{ t("dashboard.pendingTasks") }}</h2>
                <p class="text-sm text-gray-600">{{ t("dashboard.pendingTasksDescription") }}</p>
              </div>
              <ClipboardList class="w-10 h-10 text-yellow-400" />
            </div>
            <p class="text-3xl font-bold text-yellow-600 mt-4">{{ pendingTasks }}</p>
          </Card>

          <Card>
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-lg font-bold text-gray-900">{{ t("dashboard.roomsOverview") }}</h2>
              <BedDouble class="w-10 h-10 text-blue-500" />
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div class="rounded-xl bg-green-50 border border-green-100 p-3">
                <p class="text-xs text-green-700">{{ t("dashboard.activeRooms") }}</p>
                <p class="text-2xl font-bold text-green-700">{{ activeRoomsCount }}</p>
              </div>
              <div class="rounded-xl bg-gray-50 border border-gray-200 p-3">
                <p class="text-xs text-gray-700">{{ t("dashboard.inactiveRooms") }}</p>
                <p class="text-2xl font-bold text-gray-700">{{ inactiveRoomsCount }}</p>
              </div>
            </div>
          </Card>
        </div>
      </template>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useAuthStore } from "@/modules/auth/ui/stores/authStore";
import { useHotelStore } from "@/modules/hotels/ui/stores/hotelStore";
import { useWorkspaceStore } from "@/modules/hotels/ui/stores/workspaceStore";
import { useRoomStore } from "@/modules/rooms/ui/stores/roomStore";
import AppLayout from "@/shared/layouts/AppLayout.vue";
import Card from "@/shared/components/Card.vue";
import Shimmer from "@/shared/components/Shimmer.vue";
import { ClipboardList, BedDouble } from "lucide-vue-next";

const authStore = useAuthStore();
const hotelStore = useHotelStore();
const workspaceStore = useWorkspaceStore();
const roomStore = useRoomStore();
const { t } = useI18n();

const userName = computed(
  () => authStore.user?.full_name?.split(" ")[0] || t("common.userFallback"),
);
const pendingTasks = computed(() => 0); // TODO: implementar
const currentHotel = computed(() => {
  const activeId = workspaceStore.activeHotel?.id;
  if (!activeId) return null;
  return hotelStore.hotels.find((hotel) => hotel.id === activeId) || workspaceStore.activeHotel;
});
const hotelImages = computed(() => currentHotel.value?.image_urls?.filter(Boolean).slice(0, 3) || []);
const activeRoomsCount = computed(() => roomStore.enabledRooms.length);
const inactiveRoomsCount = computed(() => roomStore.disabledRooms.length);

onMounted(async () => {
  await hotelStore.fetchHotels();
  workspaceStore.validateAgainstHotels(hotelStore.hotels);
  if (workspaceStore.activeHotel?.id) {
    await roomStore.fetchRooms(workspaceStore.activeHotel.id);
  }
});

</script>

<style scoped></style>
