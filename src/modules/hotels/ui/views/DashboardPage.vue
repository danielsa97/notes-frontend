<template>
  <AppLayout>
    <div class="max-w-7xl mx-auto px-4 py-8">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p class="text-gray-600">Bem-vindo de volta, {{ userName }}!</p>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm">Total de Hotéis</p>
              <p class="text-3xl font-bold text-gray-900">{{ totalHotels }}</p>
            </div>
            <span class="text-4xl">🏨</span>
          </div>
        </Card>

        <Card>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm">Hotéis Ativos</p>
              <p class="text-3xl font-bold text-green-600">
                {{ activeHotels }}
              </p>
            </div>
            <span class="text-4xl">✓</span>
          </div>
        </Card>

        <Card>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm">Tarefas Pendentes</p>
              <p class="text-3xl font-bold text-yellow-600">
                {{ pendingTasks }}
              </p>
            </div>
            <span class="text-4xl">📋</span>
          </div>
        </Card>
      </div>

      <!-- Quick Actions -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <h2 class="text-lg font-bold text-gray-900 mb-4">Ação Rápida</h2>
          <router-link
            to="/hotels"
            class="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Gerenciar Hotéis
          </router-link>
        </Card>

        <Card>
          <h2 class="text-lg font-bold text-gray-900 mb-4">Últimos Hotéis</h2>
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
          <p v-else class="text-gray-600">Nenhum hotel cadastrado ainda</p>
        </Card>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useAuthStore } from "@/modules/auth/ui/stores/authStore";
import { useHotelStore } from "@/modules/hotels/ui/stores/hotelStore";
import AppLayout from "@/shared/layouts/AppLayout.vue";
import Card from "@/shared/components/Card.vue";

const authStore = useAuthStore();
const hotelStore = useHotelStore();

const userName = computed(
  () => authStore.user?.full_name?.split(" ")[0] || "Usuário",
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
