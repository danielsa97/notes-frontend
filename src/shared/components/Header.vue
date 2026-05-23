<template>
  <header class="bg-white shadow-sm sticky top-0 z-40">
    <div class="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <div
          class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center"
        >
          <span class="text-white font-bold text-lg">M</span>
        </div>
        <h1 class="text-xl font-bold text-gray-900">Hotel Mindu</h1>
      </div>

      <nav class="hidden md:flex items-center gap-8">
        <router-link
          to="/dashboard"
          class="text-gray-600 hover:text-gray-900 transition"
        >
          Dashboard
        </router-link>
        <router-link
          to="/hotels"
          class="text-gray-600 hover:text-gray-900 transition"
        >
          Hotéis
        </router-link>
      </nav>

      <div class="flex items-center gap-4">
        <button
          class="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition"
        >
          <span class="text-sm text-gray-700">{{ userEmail }}</span>
          <div class="w-8 h-8 bg-gray-300 rounded-full"></div>
        </button>

        <button
          @click="handleLogout"
          class="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition text-sm font-medium"
        >
          Sair
        </button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/authStore";

const router = useRouter();
const authStore = useAuthStore();

const userEmail = computed(() => {
  return authStore.user?.email || "Usuário";
});

async function handleLogout() {
  await authStore.logout();
  router.push("/login");
}
</script>

<style scoped></style>
