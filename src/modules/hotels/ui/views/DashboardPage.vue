<template>
  <AppLayout>
    <div class="max-w-7xl mx-auto px-4 py-8">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">
          {{ t("dashboard.title") }}
        </h1>
        <p class="text-gray-600">{{ t("dashboard.welcome", { name: userName }) }}</p>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm">{{ t("dashboard.totalHotels") }}</p>
              <p class="text-3xl font-bold text-gray-900">{{ totalHotels }}</p>
            </div>
            <Building2 class="w-10 h-10 text-gray-400" />
          </div>
        </Card>

        <Card>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm">{{ t("dashboard.activeHotels") }}</p>
              <p class="text-3xl font-bold text-green-600">
                {{ activeHotels }}
              </p>
            </div>
            <CheckCircle2 class="w-10 h-10 text-green-400" />
          </div>
        </Card>

        <Card>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm">{{ t("dashboard.pendingTasks") }}</p>
              <p class="text-3xl font-bold text-yellow-600">
                {{ pendingTasks }}
              </p>
            </div>
            <ClipboardList class="w-10 h-10 text-yellow-400" />
          </div>
        </Card>
      </div>

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
          <h2 class="text-lg font-bold text-gray-900 mb-4">{{ t("dashboard.recentHotels") }}</h2>
          <div v-if="recentHotels.length > 0" class="space-y-2">
            <div
              v-for="hotel in recentHotels"
              :key="hotel.id"
              class="p-3 bg-gray-50 rounded-lg"
            >
              <p class="font-medium text-gray-900">{{ hotel.name }}</p>
              <p class="text-sm text-gray-600">{{ hotel.description }}</p>
            </div>
          </div>
          <p v-else class="text-gray-600">{{ t("dashboard.emptyHotels") }}</p>
        </Card>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useAuthStore } from "@/modules/auth/ui/stores/authStore";
import { useHotelStore } from "@/modules/hotels/ui/stores/hotelStore";
import AppLayout from "@/shared/layouts/AppLayout.vue";
import Card from "@/shared/components/Card.vue";
import { Building2, CheckCircle2, ClipboardList } from "lucide-vue-next";

const authStore = useAuthStore();
const hotelStore = useHotelStore();
const { t } = useI18n();

const userName = computed(
  () => authStore.user?.full_name?.split(" ")[0] || t("common.userFallback"),
);
const totalHotels = computed(() => hotelStore.hotels.length);
const activeHotels = computed(() => hotelStore.activeHotels.length);
const pendingTasks = computed(() => 0); // TODO: implementar
const recentHotels = computed(() => hotelStore.hotels.slice(0, 3));

onMounted(async () => {
  await hotelStore.fetchHotels();
});
</script>

<style scoped></style>
