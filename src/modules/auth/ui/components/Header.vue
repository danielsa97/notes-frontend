<template>
  <header class="bg-white shadow-sm sticky top-0 z-40">
    <div class="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">

      <!-- Logo + workspace switcher -->
      <div class="flex items-center gap-3">
        <img
          src="@/assets/logo.png"
          :alt="t('common.appName')"
          class="h-9 w-auto rounded-xl"
        />

        <button
          v-if="workspaceStore.activeHotel"
          @click="isSwitcherOpen = true"
          class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-gray-100 transition group"
          :title="t('workspace.switchTitle')"
        >
          <Building2 class="w-4 h-4 text-blue-600 shrink-0" />
          <span class="text-sm font-semibold text-gray-900 max-w-[140px] truncate">
            {{ workspaceStore.activeHotel.name }}
          </span>
          <ChevronsUpDown class="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600 transition" />
        </button>
      </div>

      <!-- Empty center spacer -->
      <div />

      <!-- Logout (mobile only — desktop uses sidebar) -->
      <button
        @click="handleLogout"
        class="md:hidden px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition text-sm font-medium"
      >
        {{ t("navigation.logout") }}
      </button>
    </div>
  </header>

  <!-- Workspace switcher modal -->
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="isSwitcherOpen"
        class="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4"
        @click.self="isSwitcherOpen = false"
      >
        <div class="absolute inset-0 bg-black/30" @click="isSwitcherOpen = false" />

        <div class="relative bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
          <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div>
              <p class="font-semibold text-gray-900">{{ t('workspace.switchTitle') }}</p>
              <p class="text-xs text-gray-500 mt-0.5">{{ t('workspace.switchSubtitle') }}</p>
            </div>
            <button
              @click="isSwitcherOpen = false"
              class="p-1.5 rounded-lg hover:bg-gray-100 transition"
            >
              <X class="w-4 h-4 text-gray-500" />
            </button>
          </div>

          <ul class="py-2 max-h-72 overflow-y-auto">
            <li v-for="hotel in hotelStore.hotels" :key="hotel.id">
              <button
                @click="switchHotel(hotel)"
                class="w-full flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition text-left"
                :class="{ 'bg-blue-50': isActive(hotel) }"
              >
                <div
                  class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  :class="isActive(hotel) ? 'bg-blue-100' : 'bg-gray-100'"
                >
                  <Building2
                    class="w-4 h-4"
                    :class="isActive(hotel) ? 'text-blue-600' : 'text-gray-500'"
                  />
                </div>
                <span
                  class="flex-1 text-sm font-medium truncate"
                  :class="isActive(hotel) ? 'text-blue-700' : 'text-gray-800'"
                >
                  {{ hotel.name }}
                </span>
                <Check v-if="isActive(hotel)" class="w-4 h-4 text-blue-600 shrink-0" />
              </button>
            </li>
          </ul>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useAuthStore } from "@/modules/auth/ui/stores/authStore";
import { useHotelStore } from "@/modules/hotels/ui/stores/hotelStore";
import { useWorkspaceStore } from "@/modules/hotels/ui/stores/workspaceStore";
import { Building2, ChevronsUpDown, X, Check } from "lucide-vue-next";
import type { Hotel } from "@/core/utils/types";

const router = useRouter();
const authStore = useAuthStore();
const hotelStore = useHotelStore();
const workspaceStore = useWorkspaceStore();
const { t } = useI18n();

const isSwitcherOpen = ref(false);

function isActive(hotel: Hotel) {
  return workspaceStore.activeHotel?.id === hotel.id;
}

function switchHotel(hotel: Hotel) {
  workspaceStore.setActiveHotel(hotel);
  isSwitcherOpen.value = false;
}

async function handleLogout() {
  await authStore.logout();
  router.push("/login");
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
