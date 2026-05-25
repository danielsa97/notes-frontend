<template>
  <aside class="hidden md:flex flex-col w-64 bg-white border-r border-gray-200">
    <nav class="flex-1 px-4 py-8 space-y-2">
      <router-link
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        class="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition"
        :class="{ 'bg-blue-50 text-blue-600 font-medium': isActive(item.path) }"
      >
        <component :is="item.icon" class="w-5 h-5" />
        <span>{{ item.label }}</span>
      </router-link>
    </nav>

    <div class="px-4 py-4 border-t border-gray-200">
      <div class="flex items-center gap-3 mb-4">
        <div class="w-10 h-10 bg-gray-300 rounded-full"></div>
        <div class="flex-1">
          <p class="text-sm font-medium text-gray-900">{{ userName }}</p>
          <p class="text-xs text-gray-500">{{ userEmail }}</p>
        </div>
      </div>
      <button
        @click="handleLogout"
        class="w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
      >
        {{ t("navigation.logout") }}
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useAuthStore } from "@/modules/auth/ui/stores/authStore";
import { LayoutDashboard, Building2, BedDouble, ClipboardList } from "lucide-vue-next";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const { t } = useI18n();

const navItems = computed(() => [
  { path: "/dashboard", label: t("navigation.dashboard"), icon: LayoutDashboard },
  { path: "/hotels", label: t("navigation.hotels"), icon: Building2 },
  { path: "/rooms", label: t("navigation.rooms"), icon: BedDouble },
  { path: "/tasks", label: t("navigation.tasks"), icon: ClipboardList },
]);

const userName = computed(() => authStore.user?.full_name || t("common.userFallback"));
const userEmail = computed(() => authStore.user?.username || "");

function isActive(path: string) {
  return route.path === path;
}

async function handleLogout() {
  await authStore.logout();
  router.push("/login");
}
</script>

<style scoped></style>
