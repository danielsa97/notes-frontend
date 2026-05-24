<template>
  <div
    class="min-h-screen bg-gradient-to-b from-slate-100 via-blue-50 to-cyan-50 flex items-center justify-center px-4 py-12"
  >
    <div class="w-full max-w-2xl">
      <!-- Logo + heading -->
      <div class="mb-8 text-center">
        <img
          src="@/assets/logo.png"
          :alt="t('common.appName')"
          class="h-14 w-auto mx-auto mb-4 rounded"
        />
        <h1 class="text-2xl font-bold text-gray-900">
          {{ t("workspace.selectTitle") }}
        </h1>
        <p class="text-gray-500 text-sm mt-1">
          {{ t("workspace.selectSubtitle") }}
        </p>
      </div>

      <Loading v-if="loading" />

      <!-- No hotels -->
      <div
        v-else-if="selectableHotels.length === 0"
        class="text-center bg-white rounded-2xl p-10 shadow-md"
      >
        <Building2 class="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p class="text-gray-600 mb-4">{{ t("workspace.noHotels") }}</p>
        <Button v-if="authStore.isAdmin" @click="router.push('/hotels')">
          {{ t("workspace.createHotel") }}
        </Button>
      </div>

      <!-- Hotel cards -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          v-for="hotel in selectableHotels"
          :key="hotel.id"
          @click="selectHotel(hotel)"
          class="bg-white rounded-2xl p-5 shadow border-2 border-transparent hover:border-blue-500 hover:shadow-lg transition text-left group"
        >
          <div class="flex items-center gap-4">
            <div
              class="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center group-hover:bg-blue-100 transition shrink-0"
            >
              <Building2 class="w-6 h-6 text-blue-600" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-semibold text-gray-900 truncate">
                {{ hotel.name }}
              </p>
              <p class="text-sm text-gray-500 truncate">
                {{ hotel.description || t("workspace.noDescription") }}
              </p>
            </div>
          </div>
          <div class="mt-3 flex items-center gap-2">
            <Badge :variant="hotel.status === 'ENABLED' ? 'success' : hotel.status === 'DISABLED' ? 'warning' : 'secondary'">
              {{ t(`hotels.statusValues.${hotel.status}`) }}
            </Badge>
            <Badge v-if="hotel.my_role === 'owner'" variant="primary">
              {{ t("workspace.owner") }}
            </Badge>
          </div>
        </button>
      </div>

      <div class="mt-6 text-center">
        <button
          @click="handleLogout"
          class="text-sm text-gray-500 hover:text-red-600 transition"
        >
          {{ t("navigation.logout") }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useAuthStore } from "@/modules/auth/ui/stores/authStore";
import { useHotelStore } from "@/modules/hotels/ui/stores/hotelStore";
import { useWorkspaceStore } from "@/modules/hotels/ui/stores/workspaceStore";
import { Building2 } from "lucide-vue-next";
import Badge from "@/shared/components/Badge.vue";
import Button from "@/shared/components/Button.vue";
import Loading from "@/shared/components/Loading.vue";
import type { Hotel } from "@/core/utils/types";

const router = useRouter();
const authStore = useAuthStore();
const hotelStore = useHotelStore();
const workspaceStore = useWorkspaceStore();
const { t } = useI18n();

const loading = ref(false);

const selectableHotels = computed(() =>
  hotelStore.hotels.filter((h) => h.status === "ENABLED"),
);

function selectHotel(hotel: Hotel) {
  workspaceStore.setActiveHotel(hotel);
  router.push("/dashboard");
}

async function handleLogout() {
  await authStore.logout();
  router.push("/login");
}

onMounted(async () => {
  loading.value = true;
  try {
    await hotelStore.fetchHotels();
  } finally {
    loading.value = false;
  }

  // Validate that stored active hotel still belongs to the user
  workspaceStore.validateAgainstHotels(hotelStore.hotels);

  // Already has a valid workspace → skip selection
  if (workspaceStore.activeHotel) {
    router.push("/dashboard");
    return;
  }

  // Auto-select when user has exactly one selectable hotel
  if (selectableHotels.value.length === 1) {
    selectHotel(selectableHotels.value[0]);
  }
});
</script>
