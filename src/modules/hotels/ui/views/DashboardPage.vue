<template>
  <AppLayout>
    <div class="max-w-7xl mx-auto px-4 py-8">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ t("dashboard.title") }}</h1>
        <p class="text-gray-600">{{ t("dashboard.welcome", { name: userName }) }}</p>
      </div>

      <template v-if="hotelStore.loading">
        <Card class="mb-8">
          <Shimmer height="2rem" width="50%" class="mb-4" />
          <Shimmer height="1rem" width="80%" />
        </Card>
      </template>

      <template v-else>
        <Card class="mb-8">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <p class="text-xs uppercase tracking-wide text-gray-500 mb-2">{{ t("dashboard.workspaceOverview") }}</p>
              <h2 class="text-2xl font-bold text-gray-900 mb-2">
                {{ currentHotel?.name || t("dashboard.noWorkspaceSelected") }}
              </h2>
              <p class="text-gray-600 mb-4">{{ currentHotel?.description || t("workspace.noDescription") }}</p>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-700 mb-3">{{ t("dashboard.workspaceImages") }}</p>
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

        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          <Card>
            <p class="text-xs text-gray-500 mb-1">{{ t("tasks.counts.PENDENTE") }}</p>
            <p class="text-3xl font-bold text-yellow-600">{{ byStatus.PENDENTE }}</p>
          </Card>
          <Card>
            <p class="text-xs text-gray-500 mb-1">{{ t("tasks.counts.EM_ANDAMENTO") }}</p>
            <p class="text-3xl font-bold text-blue-600">{{ byStatus.EM_ANDAMENTO }}</p>
          </Card>
          <Card>
            <p class="text-xs text-gray-500 mb-1">{{ t("dashboard.completedToday") }}</p>
            <p class="text-3xl font-bold text-green-600">{{ byStatus.CONCLUIDA }}</p>
          </Card>
          <Card>
            <p class="text-xs text-gray-500 mb-1">{{ t("dashboard.pendingItems") }}</p>
            <p class="text-3xl font-bold text-red-600">{{ taskStore.dailyOverview?.totalItemsPending ?? 0 }}</p>
          </Card>
        </div>

        <div class="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
          <Card class="xl:col-span-2">
            <h2 class="text-lg font-bold text-gray-900 mb-4">{{ t("dashboard.chartTitle") }}</h2>
            <div class="space-y-3">
              <div v-for="item in chartData" :key="item.key">
                <div class="flex justify-between text-sm mb-1">
                  <span class="text-gray-700">{{ item.label }}</span>
                  <span class="text-gray-500">{{ item.value }}</span>
                </div>
                <div class="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    class="h-full rounded-full transition-all duration-300"
                    :class="item.color"
                    :style="{ width: item.percent + '%' }"
                  />
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-lg font-bold text-gray-900">{{ t("dashboard.roomsOverview") }}</h2>
              <BedDouble class="w-8 h-8 text-blue-500" />
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

        <Card class="mb-6">
          <h2 class="text-lg font-bold text-gray-900 mb-3">{{ t("dashboard.roomsWithProblems") }}</h2>
          <div v-if="roomsWithPending.length === 0" class="text-sm text-gray-500">
            {{ t("dashboard.noRoomsWithProblems") }}
          </div>
          <div v-else class="space-y-2">
            <div
              v-for="room in roomsWithPending"
              :key="room.roomId"
              class="flex items-center justify-between rounded-lg border border-red-100 bg-red-50 px-3 py-2"
            >
              <span class="font-medium text-red-800">{{ displayRoom(room.roomId) }}</span>
              <span class="text-sm text-red-700">{{ room.pendingCount }} pendência(s)</span>
            </div>
          </div>
        </Card>

        <Card class="mb-6" v-if="recurringIssues.length">
          <h2 class="text-lg font-bold text-red-800 mb-3">{{ t("dashboard.recurringIssuesTitle") }}</h2>
          <div class="space-y-2">
            <div
              v-for="issue in recurringIssues"
              :key="issue.roomId"
              class="flex items-center justify-between rounded-lg border border-red-100 bg-red-50 px-3 py-2"
            >
              <div>
                <p class="font-medium text-red-800">{{ displayRoom(issue.roomId) }}</p>
                <p class="text-xs text-red-700">{{ issue.examples.join(', ') }}</p>
              </div>
              <span class="text-sm text-red-700">{{ issue.occurrences }}x</span>
            </div>
          </div>
        </Card>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <h2 class="text-lg font-bold text-gray-900 mb-4">{{ t("dashboard.quickAction") }}</h2>
            <div class="flex flex-wrap gap-2">
              <router-link
                to="/tasks"
                class="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                {{ t("navigation.tasks") }}
              </router-link>
              <router-link
                to="/hotels"
                class="inline-block px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
              >
                {{ t("dashboard.manageHotels") }}
              </router-link>
            </div>
          </Card>

          <Card>
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-lg font-bold text-gray-900 mb-1">{{ t("dashboard.dailyExecutionOverview") }}</h2>
                <p class="text-sm text-gray-600">{{ t("dashboard.pendingTasksDescription") }}</p>
              </div>
              <ClipboardList class="w-10 h-10 text-yellow-400" />
            </div>
            <p class="text-3xl font-bold text-yellow-600 mt-4">{{ byStatus.PENDENTE + byStatus.EM_ANDAMENTO }}</p>
          </Card>
        </div>
      </template>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { ClipboardList, BedDouble } from "lucide-vue-next";
import { useAuthStore } from "@/modules/auth/ui/stores/authStore";
import { useHotelStore } from "@/modules/hotels/ui/stores/hotelStore";
import { useWorkspaceStore } from "@/modules/hotels/ui/stores/workspaceStore";
import { useRoomStore } from "@/modules/rooms/ui/stores/roomStore";
import { useTaskStore } from "@/modules/tasks/ui/stores/taskStore";
import AppLayout from "@/shared/layouts/AppLayout.vue";
import Card from "@/shared/components/Card.vue";
import Shimmer from "@/shared/components/Shimmer.vue";

const authStore = useAuthStore();
const hotelStore = useHotelStore();
const workspaceStore = useWorkspaceStore();
const roomStore = useRoomStore();
const taskStore = useTaskStore();
const { t } = useI18n();

const userName = computed(() => authStore.user?.full_name?.split(" ")[0] || t("common.userFallback"));
const currentHotel = computed(() => {
  const activeId = workspaceStore.activeHotel?.id;
  if (!activeId) return null;
  return hotelStore.hotels.find((hotel) => hotel.id === activeId) || workspaceStore.activeHotel;
});
const hotelImages = computed(() => currentHotel.value?.image_urls?.filter(Boolean).slice(0, 3) || []);
const activeRoomsCount = computed(() => roomStore.enabledRooms.length);
const inactiveRoomsCount = computed(() => roomStore.disabledRooms.length);

const byStatus = computed(() => {
  return (
    taskStore.dailyOverview?.byStatus ?? {
      PENDENTE: 0,
      EM_ANDAMENTO: 0,
      CONCLUIDA: 0,
      CANCELADA: 0,
    }
  );
});

const chartData = computed(() => {
  const total = Math.max(1, Object.values(byStatus.value).reduce((acc, value) => acc + value, 0));
  return [
    {
      key: "PENDENTE",
      label: t("tasks.counts.PENDENTE"),
      value: byStatus.value.PENDENTE,
      percent: (byStatus.value.PENDENTE / total) * 100,
      color: "bg-yellow-500",
    },
    {
      key: "EM_ANDAMENTO",
      label: t("tasks.counts.EM_ANDAMENTO"),
      value: byStatus.value.EM_ANDAMENTO,
      percent: (byStatus.value.EM_ANDAMENTO / total) * 100,
      color: "bg-blue-500",
    },
    {
      key: "CONCLUIDA",
      label: t("tasks.counts.CONCLUIDA"),
      value: byStatus.value.CONCLUIDA,
      percent: (byStatus.value.CONCLUIDA / total) * 100,
      color: "bg-green-500",
    },
    {
      key: "CANCELADA",
      label: t("tasks.counts.CANCELADA"),
      value: byStatus.value.CANCELADA,
      percent: (byStatus.value.CANCELADA / total) * 100,
      color: "bg-gray-500",
    },
  ];
});

const roomsWithPending = computed(() => taskStore.dailyOverview?.roomsWithPending ?? []);
const recurringIssues = computed(() => taskStore.recurringIssues ?? []);

function displayRoom(roomId: string) {
  return roomId === "AREA_COMUM" ? t("tasks.commonAreaLabel") : roomId;
}

onMounted(async () => {
  await hotelStore.fetchHotels();
  workspaceStore.validateAgainstHotels(hotelStore.hotels);

  if (workspaceStore.activeHotel?.id) {
    await Promise.all([
      roomStore.fetchRooms(workspaceStore.activeHotel.id),
      taskStore.fetchDailyOverview(workspaceStore.activeHotel.id),
      taskStore.fetchRecurringIssues(workspaceStore.activeHotel.id, {
        periodDays: 7,
        minOccurrences: 3,
      }),
    ]);
  }
});
</script>
