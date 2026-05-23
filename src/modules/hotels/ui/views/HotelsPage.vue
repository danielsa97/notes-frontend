<template>
  <AppLayout>
    <div class="max-w-7xl mx-auto px-4 py-8">
      <div class="flex justify-between items-center mb-8">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Hotéis</h1>
          <p class="text-gray-600">Gerencie todos os seus hotéis</p>
        </div>
        <Button @click="openAddModal">+ Adicionar Hotel</Button>
      </div>

      <Alert
        v-if="hotelStore.error"
        type="error"
        title="Erro"
        :message="hotelStore.error"
      />

      <Loading v-if="hotelStore.loading" text="Carregando hotéis..." />

      <div v-else class="space-y-4">
        <div
          v-if="hotelStore.hotels.length > 0"
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <Card
            v-for="hotel in hotelStore.hotels"
            :key="hotel.id"
            class="cursor-pointer hover:shadow-lg transition"
          >
            <div class="flex items-start justify-between mb-4">
              <div class="flex-1">
                <h3 class="text-lg font-bold text-gray-900">
                  {{ hotel.name }}
                </h3>
                <Badge
                  :variant="hotel.status === 'ativo' ? 'success' : 'warning'"
                >
                  {{ hotel.status }}
                </Badge>
              </div>
              <div class="relative">
                <button
                  @click="openMenu(hotel.id)"
                  class="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  ⋮
                </button>
                <div
                  v-if="activeMenu === hotel.id"
                  class="absolute right-0 top-10 bg-white border border-gray-200 rounded-lg shadow-lg z-10"
                >
                  <button
                    @click="editHotel(hotel)"
                    class="block w-full text-left px-4 py-2 hover:bg-gray-50 transition"
                  >
                    Editar
                  </button>
                  <button
                    @click="archiveHotel(hotel.id)"
                    class="block w-full text-left px-4 py-2 hover:bg-gray-50 transition text-orange-600"
                  >
                    Arquivar
                  </button>
                  <button
                    @click="deleteHotel(hotel.id)"
                    class="block w-full text-left px-4 py-2 hover:bg-gray-50 transition text-red-600"
                  >
                    Deletar
                  </button>
                </div>
              </div>
            </div>

            <p v-if="hotel.description" class="text-gray-600 text-sm mb-4">
              {{ hotel.description }}
            </p>
            <div class="flex items-center gap-2 text-sm text-gray-500">
              <span>Criado em {{ formatDate(hotel.created_at) }}</span>
            </div>
          </Card>
        </div>

        <div v-else class="bg-white rounded-lg shadow p-12 text-center">
          <p class="text-gray-600 text-lg mb-4">
            Nenhum hotel cadastrado ainda
          </p>
          <Button @click="openAddModal">Criar Primeiro Hotel</Button>
        </div>
      </div>

      <Modal
        :isOpen="isModalOpen"
        :title="editingHotel ? 'Editar Hotel' : 'Adicionar Hotel'"
        @close="closeModal"
        @confirm="saveHotel"
      >
        <FormGroup @submit="saveHotel">
          <Input
            v-model="form.name"
            label="Nome do Hotel"
            placeholder="Ex: Hotel Central"
            required
          />
          <Input
            v-model="form.description"
            label="Descrição"
            placeholder="Descreva o hotel..."
          />
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2"
              >Status</label
            >
            <select
              v-model="form.status"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
            </select>
          </div>
        </FormGroup>
      </Modal>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useHotelStore } from "@/modules/hotels/ui/stores/hotelStore";
import { useAuthStore } from "@/modules/auth/ui/stores/authStore";
import AppLayout from "@/shared/layouts/AppLayout.vue";
import Card from "@/shared/components/Card.vue";
import Button from "@/shared/components/Button.vue";
import Modal from "@/shared/components/Modal.vue";
import Input from "@/shared/components/Input.vue";
import FormGroup from "@/shared/components/FormGroup.vue";
import Alert from "@/shared/components/Alert.vue";
import Loading from "@/shared/components/Loading.vue";
import Badge from "@/shared/components/Badge.vue";
import type { Hotel } from "@/core/utils/types";

const hotelStore = useHotelStore();
const authStore = useAuthStore();

const isModalOpen = ref(false);
const activeMenu = ref<string | null>(null);
const editingHotel = ref<Hotel | null>(null);
const form = ref({
  name: "",
  description: "",
  status: "ativo" as const,
});

function openAddModal() {
  editingHotel.value = null;
  form.value = { name: "", description: "", status: "ativo" };
  isModalOpen.value = true;
}

function editHotel(hotel: Hotel) {
  editingHotel.value = hotel;
  form.value = {
    name: hotel.name,
    description: hotel.description || "",
    status: hotel.status,
  };
  isModalOpen.value = true;
  activeMenu.value = null;
}

function closeModal() {
  isModalOpen.value = false;
  editingHotel.value = null;
}

async function saveHotel() {
  if (!form.value.name) return;

  try {
    if (editingHotel.value) {
      await hotelStore.updateHotel(editingHotel.value.id, form.value);
    } else {
      await hotelStore.createHotel({
        name: form.value.name,
        description: form.value.description,
        status: form.value.status,
        archived: false,
        owner_id: authStore.user?.id || "",
      });
    }
    closeModal();
  } catch (error) {
    console.error("Erro ao salvar hotel:", error);
  }
}

async function deleteHotel(id: string) {
  if (confirm("Tem certeza que deseja deletar este hotel?")) {
    await hotelStore.deleteHotel(id);
    activeMenu.value = null;
  }
}

async function archiveHotel(id: string) {
  await hotelStore.updateHotel(id, { archived: true });
  activeMenu.value = null;
}

function openMenu(hotelId: string) {
  activeMenu.value = activeMenu.value === hotelId ? null : hotelId;
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("pt-BR");
}

onMounted(async () => {
  await hotelStore.fetchHotels();
});
</script>

<style scoped></style>
