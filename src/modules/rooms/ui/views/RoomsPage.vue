<template>
  <AppLayout>
    <div class="max-w-7xl mx-auto px-4 py-8">
      <div class="flex justify-between items-center gap-3 mb-8">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">{{ t("rooms.title") }}</h1>
          <p class="text-gray-600">{{ t("rooms.subtitle", { workspace: workspaceName }) }}</p>
        </div>
        <Button :aria-label="t('rooms.add')" @click="openCreateModal">
          {{ t("rooms.add") }}
        </Button>
      </div>

      <Alert
        v-if="roomStore.error"
        type="error"
        :title="t('rooms.errorTitle')"
        :message="roomStore.error"
      />

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <Card>
          <p class="text-sm text-gray-500 mb-1">{{ t("rooms.activeCount") }}</p>
          <p class="text-3xl font-bold text-green-600">{{ roomStore.enabledRooms.length }}</p>
        </Card>
        <Card>
          <p class="text-sm text-gray-500 mb-1">{{ t("rooms.inactiveCount") }}</p>
          <p class="text-3xl font-bold text-gray-700">{{ roomStore.disabledRooms.length }}</p>
        </Card>
      </div>

      <div class="bg-white rounded-lg shadow overflow-hidden">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="text-left px-6 py-3 font-medium text-gray-600">{{ t("rooms.table.roomId") }}</th>
              <th class="text-left px-6 py-3 font-medium text-gray-600">{{ t("rooms.table.type") }}</th>
              <th class="text-left px-6 py-3 font-medium text-gray-600">{{ t("rooms.table.description") }}</th>
              <th class="text-left px-6 py-3 font-medium text-gray-600">{{ t("rooms.table.status") }}</th>
              <th class="text-right px-6 py-3 font-medium text-gray-600">{{ t("rooms.table.actions") }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-if="!roomStore.loading && roomStore.rooms.length === 0">
              <td colspan="5" class="px-6 py-6 text-center text-gray-500">{{ t("rooms.empty") }}</td>
            </tr>
            <tr v-for="room in roomStore.rooms" :key="room.id" class="hover:bg-gray-50 transition">
              <td class="px-6 py-4 font-medium text-gray-900">{{ room.room_id }}</td>
              <td class="px-6 py-4 text-gray-700">{{ t(`rooms.typeValues.${room.type}`) }}</td>
              <td class="px-6 py-4 text-gray-600">{{ room.description || t("rooms.noDescription") }}</td>
              <td class="px-6 py-4">
                <Badge :variant="room.status === 'ENABLED' ? 'success' : 'secondary'">
                  {{ t(`rooms.statusValues.${room.status}`) }}
                </Badge>
              </td>
              <td class="px-6 py-4 text-right">
                <button
                  @click="openEditModal(room)"
                  class="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  {{ t("rooms.edit") }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <Modal
        :isOpen="isModalOpen"
        :title="isEditing ? t('rooms.modalEditTitle') : t('rooms.modalAddTitle')"
        @close="closeModal"
        @confirm="saveRoom"
      >
        <FormGroup @submit="saveRoom" class="space-y-4">
          <Input
            v-model="form.roomId"
            :label="t('rooms.form.roomId')"
            :placeholder="t('rooms.form.roomIdPlaceholder')"
            required
          />

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">{{ t("rooms.form.type") }}</label>
            <select
              v-model="form.type"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="CONFORT">{{ t("rooms.typeValues.CONFORT") }}</option>
              <option value="STANDARD">{{ t("rooms.typeValues.STANDARD") }}</option>
              <option value="OUTRO">{{ t("rooms.typeValues.OUTRO") }}</option>
            </select>
          </div>

          <Input
            v-model="form.description"
            :label="t('rooms.form.description')"
            :placeholder="t('rooms.form.descriptionPlaceholder')"
          />

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">{{ t("rooms.form.status") }}</label>
            <select
              v-model="form.status"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ENABLED">{{ t("rooms.statusValues.ENABLED") }}</option>
              <option value="DISABLED">{{ t("rooms.statusValues.DISABLED") }}</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">{{ t("rooms.imageUploadLabel") }}</label>

            <div v-if="existingImageUrls.length" class="grid grid-cols-3 gap-2 mb-3">
              <div
                v-for="(imageUrl, index) in existingImageUrls"
                :key="imageUrl"
                class="relative"
              >
                <img
                  :src="imageUrl"
                  :alt="t('rooms.imagePreviewAlt')"
                  class="h-20 w-full object-cover rounded-md border border-gray-200"
                />
                <button
                  type="button"
                  class="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white border border-gray-200 text-red-600 text-xs"
                  @click="removeExistingImage(index)"
                >
                  ×
                </button>
              </div>
            </div>

            <ImagePicker
              :key="imageInputKey"
              :maxFiles="Math.max(0, 5 - existingImageUrls.length)"
              :disabled="roomStore.loading"
              @files-selected="handleImageSelection"
            />
            <p class="text-xs text-gray-500 mt-2">{{ t("rooms.imageUploadHint") }}</p>

            <div v-if="imagePreviews.length" class="grid grid-cols-3 gap-2 mt-3">
              <img
                v-for="preview in imagePreviews"
                :key="preview"
                :src="preview"
                :alt="t('rooms.imagePreviewAlt')"
                class="h-20 w-full object-cover rounded-md border border-gray-200"
              />
            </div>
          </div>
        </FormGroup>
      </Modal>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import type { Room } from "@/core/utils/types";
import { useWorkspaceStore } from "@/modules/hotels/ui/stores/workspaceStore";
import { useRoomStore } from "@/modules/rooms/ui/stores/roomStore";
import AppLayout from "@/shared/layouts/AppLayout.vue";
import Alert from "@/shared/components/Alert.vue";
import Badge from "@/shared/components/Badge.vue";
import Button from "@/shared/components/Button.vue";
import Card from "@/shared/components/Card.vue";
import FormGroup from "@/shared/components/FormGroup.vue";
import Input from "@/shared/components/Input.vue";
import ImagePicker from "@/shared/components/ImagePicker.vue";
import Modal from "@/shared/components/Modal.vue";

const { t } = useI18n();
const router = useRouter();
const workspaceStore = useWorkspaceStore();
const roomStore = useRoomStore();

const isModalOpen = ref(false);
const isEditing = ref(false);
const editingRoomId = ref<string | null>(null);
const selectedImages = ref<File[]>([]);
const imagePreviews = ref<string[]>([]);
const existingImageUrls = ref<string[]>([]);
const imageInputKey = ref(0);

const form = ref({
  roomId: "",
  type: "STANDARD" as "CONFORT" | "STANDARD" | "OUTRO",
  description: "",
  status: "ENABLED" as "ENABLED" | "DISABLED",
});

const workspaceName = computed(() => workspaceStore.activeHotel?.name ?? "-");

function resetForm() {
  form.value = {
    roomId: "",
    type: "STANDARD",
    description: "",
    status: "ENABLED",
  };
  imagePreviews.value.forEach((url) => URL.revokeObjectURL(url));
  selectedImages.value = [];
  imagePreviews.value = [];
  existingImageUrls.value = [];
  imageInputKey.value += 1;
}

function openCreateModal() {
  isEditing.value = false;
  editingRoomId.value = null;
  resetForm();
  isModalOpen.value = true;
}

function openEditModal(room: Room) {
  isEditing.value = true;
  editingRoomId.value = room.id;
  form.value = {
    roomId: room.room_id,
    type: room.type,
    description: room.description ?? "",
    status: room.status,
  };
  existingImageUrls.value = [...(room.image_urls || [])];
  imagePreviews.value.forEach((url) => URL.revokeObjectURL(url));
  selectedImages.value = [];
  imagePreviews.value = [];
  imageInputKey.value += 1;
  isModalOpen.value = true;
}

function removeExistingImage(index: number) {
  existingImageUrls.value.splice(index, 1);
}

function handleImageSelection(files: File[]) {
  if (files.length + existingImageUrls.value.length > 5) {
    alert(t("rooms.maxImagesError"));
    return;
  }

  const hasInvalidType = files.some((file) => !file.type.startsWith("image/"));
  if (hasInvalidType) {
    alert(t("rooms.invalidImageError"));
    return;
  }

  imagePreviews.value.forEach((url) => URL.revokeObjectURL(url));
  selectedImages.value = files;
  imagePreviews.value = files.map((file) => URL.createObjectURL(file));
  imageInputKey.value += 1;
}

function closeModal() {
  isModalOpen.value = false;
  resetForm();
}

async function saveRoom() {
  const hotelId = workspaceStore.activeHotel?.id;
  if (!hotelId || !form.value.roomId.trim()) return;

  if (isEditing.value && editingRoomId.value) {
    await roomStore.updateRoom(editingRoomId.value, {
      roomId: form.value.roomId.trim(),
      type: form.value.type,
      description: form.value.description.trim() || null,
      status: form.value.status,
      image_urls: existingImageUrls.value,
    }, selectedImages.value);
  } else {
    await roomStore.createRoom({
      hotelId,
      roomId: form.value.roomId.trim(),
      type: form.value.type,
      description: form.value.description.trim() || undefined,
      status: form.value.status,
    }, selectedImages.value);
  }

  if (!roomStore.error) {
    closeModal();
  }
}

onMounted(async () => {
  const hotelId = workspaceStore.activeHotel?.id;
  if (!hotelId) {
    router.push("/hotel-select");
    return;
  }
  await roomStore.fetchRooms(hotelId);
});
</script>
