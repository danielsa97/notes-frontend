<template>
  <aside :class="asideClasses">
    <div class="flex items-center justify-center px-4 pt-6 pb-2">
      <img
        src="@/assets/logo.png"
        :alt="t('common.appName')"
        class="h-20 w-auto rounded-xl"
      />
    </div>
    <nav class="flex-1 px-4 py-4 space-y-2">
      <router-link
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        @click="handleNavigate"
        class="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition"
        :class="{ 'bg-blue-50 text-blue-600 font-medium': isActive(item.path) }"
      >
        <component :is="item.icon" class="w-5 h-5" />
        <span>{{ item.label }}</span>
      </router-link>
    </nav>

    <div class="px-4 py-4 border-t border-gray-200">
      <div class="flex items-center gap-3 mb-4">
        <div class="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center shrink-0">
          <span class="text-white text-sm font-bold">{{ initials }}</span>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-gray-900 truncate">{{ userName }}</p>
          <p class="text-xs text-gray-500 truncate">{{ userEmail }}</p>
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
import { LayoutDashboard, Building2, BedDouble, Users } from "lucide-vue-next";

const props = withDefaults(
  defineProps<{
    mobile?: boolean;
    isOpen?: boolean;
  }>(),
  {
    mobile: false,
    isOpen: false,
  },
);

const emit = defineEmits<{
  (e: "close"): void;
}>();

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const { t } = useI18n();

const navItems = computed(() => [
  { path: "/dashboard", label: t("navigation.dashboard"), icon: LayoutDashboard },
  { path: "/hotels", label: t("navigation.hotels"), icon: Building2 },
  { path: "/rooms", label: t("navigation.rooms"), icon: BedDouble },
  ...(authStore.user?.is_admin
    ? [{ path: "/users", label: t("navigation.users"), icon: Users }]
    : []),
]);

const asideClasses = computed(() => {
  if (!props.mobile) {
    return "hidden md:flex flex-col w-64 bg-white border-r border-gray-200";
  }

  return [
    "fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-white border-r border-gray-200 transition-transform duration-200 md:hidden",
    props.isOpen ? "translate-x-0" : "-translate-x-full",
  ];
});

const userName = computed(() => authStore.user?.full_name || t("common.userFallback"));
const userEmail = computed(() => {
  if (!authStore.user) return "";
  return authStore.user.is_admin
    ? `@${authStore.user.username} • ${t("navigation.admin")}`
    : `@${authStore.user.username}`;
});
const initials = computed(() => {
  const name = authStore.user?.full_name || "";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
});

function isActive(path: string) {
  return route.path === path || route.path.startsWith(path + "/");
}

function handleNavigate() {
  if (props.mobile) {
    emit("close");
  }
}

async function handleLogout() {
  if (props.mobile) {
    emit("close");
  }
  await authStore.logout();
  router.push("/login");
}
</script>

<style scoped></style>
