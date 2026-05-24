<template>
  <AppLayout>
    <div class="max-w-7xl mx-auto px-4 py-8">
      <div class="flex justify-between items-center gap-3 mb-8">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">{{ t("rooms.title") }}</h1>
          <p class="text-gray-600">{{ t("rooms.subtitle", { workspace: workspaceName }) }}</p>
        </div>
        <Button :aria-label="t('rooms.add')" @click="openCreateModal">
          <span class="sm:hidden">+</span>
          <span class="hidden sm:inline">{{ t("rooms.add") }}</span>
        </Button>
      </div>

      <Alert
        v-if="roomStore.error"
        type="error"
        :title="t('rooms.errorTitle')"
        :message="roomStore.error"
      />

      <div v-if="roomStore.loading" class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <Card>
          <Shimmer height="0.875rem" width="40%" class="mb-2" />
          <Shimmer height="2rem" width="30%" />
        </Card>
        <Card>
          <Shimmer height="0.875rem" width="45%" class="mb-2" />
          <Shimmer height="2rem" width="30%" />
        </Card>
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <Card>
          <p class="text-sm text-gray-500 mb-1">{{ t("rooms.activeCount") }}</p>
          <p class="text-3xl font-bold text-green-600">{{ roomStore.enabledRooms.length }}</p>
        </Card>
        <Card>
          <p class="text-sm text-gray-500 mb-1">{{ t("rooms.inactiveCount") }}</p>
          <p class="text-3xl font-bold text-gray-700">{{ roomStore.disabledRooms.length }}</p>
        </Card>
      </div>

      <div v-if="roomStore.loading" class="grid grid-cols-2 gap-3 md:grid md:gap-4" :class="getGridClass(0)">
        <div v-for="row in 4" :key="row" class="space-y-2">
          <Shimmer height="160px" rounded="lg" />
          <Shimmer height="0.875rem" width="40%" />
          <Shimmer height="0.75rem" width="50%" />
          <Shimmer height="0.75rem" width="60%" />
        </div>
      </div>

      <div v-else>
        <div v-if="roomStore.rooms.length === 0" class="bg-white rounded-lg shadow px-4 py-6 text-center text-gray-500">
          {{ t("rooms.empty") }}
        </div>

        <div v-else :class="getRoomsGridClass">
          <Card v-for="room in roomStore.rooms" :key="room.id" class="overflow-hidden hover:shadow-lg transition flex flex-col">
            <!-- Image Section -->
            <button
              v-if="room.image_urls?.length"
              type="button"
              @click="openImagePreview(room.image_urls, 0)"
              class="relative w-full h-40 bg-gray-100 overflow-hidden group"
            >
              <img
                :src="room.image_urls[0]"
                :alt="t('rooms.imagePreviewAlt')"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              />
              <div class="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <span class="text-white opacity-0 group-hover:opacity-100 transition text-sm font-medium">
                  {{ t('rooms.imageCount', { count: room.image_urls.length }) }}
                </span>
              </div>
            </button>
            <div v-else class="w-full h-40 bg-gray-50 border-b border-gray-200 flex items-center justify-center">
              <p class="text-gray-400 text-sm">{{ t("rooms.noImages") }}</p>
            </div>

            <!-- Content Section -->
            <div class="flex-1 p-4 space-y-3">
              <div class="flex items-start justify-between gap-2">
                <div>
                  <p class="text-xs text-gray-500">{{ t("rooms.table.roomId") }}</p>
                  <p class="text-lg font-bold text-gray-900">{{ room.room_id }}</p>
                </div>
                <Badge :variant="room.status === 'ENABLED' ? 'success' : 'secondary'">
                  {{ t(`rooms.statusValues.${room.status}`) }}
                </Badge>
              </div>

              <div class="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p class="text-xs text-gray-500">{{ t("rooms.table.type") }}</p>
                  <p class="text-gray-700 font-medium">{{ t(`rooms.typeValues.${room.type}`) }}</p>
                </div>
              </div>

              <div>
                <p class="text-xs text-gray-500">{{ t("rooms.table.description") }}</p>
                <p class="text-sm text-gray-700">{{ room.description || t("rooms.noDescription") }}</p>
              </div>
            </div>

            <!-- Actions Footer -->
            <div class="border-t border-gray-100 px-4 py-3 flex justify-end">
              <button
                type="button"
                @click.stop="toggleRoomMenu($event, room)"
                class="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
                :aria-label="t('rooms.table.actions')"
              >
                <MoreVertical class="w-5 h-5" />
              </button>
            </div>
          </Card>
        </div>
      </div>

      <Teleport to="body">
        <template v-if="menuRoom">
          <div class="fixed inset-0 z-40" @click="closeRoomMenu" />
          <div
            :style="{ top: roomMenuPosition.top + 'px', left: roomMenuPosition.left + 'px' }"
            class="fixed z-50 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1 text-sm"
          >
            <button
              @click="handleMenuEdit"
              class="w-full text-left px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              {{ t("rooms.edit") }}
            </button>
            <button
              @click="handleMenuToggleStatus"
              class="w-full text-left px-4 py-2.5 text-amber-700 hover:bg-amber-50 transition-colors"
            >
              {{ menuRoom.status === "ENABLED" ? t("rooms.actions.disable") : t("rooms.actions.enable") }}
            </button>
          </div>
        </template>
      </Teleport>

      <ImagePreviewLightbox
        :isOpen="isImagePreviewOpen"
        :images="previewImages"
        :startIndex="previewStartIndex"
        :alt="t('rooms.imagePreviewAlt')"
        @close="closeImagePreview"
      />

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
        <template #footer>
          <Button variant="ghost" :disabled="savingRoom" @click="closeModal">
            {{ t("common.cancel") }}
          </Button>
          <Button :loading="savingRoom" :disabled="savingRoom" @click="saveRoom">
            {{ t("common.confirm") }}
          </Button>
        </template>
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
import ImagePreviewLightbox from "@/shared/components/ImagePreviewLightbox.vue";
import Modal from "@/shared/components/Modal.vue";
import Shimmer from "@/shared/components/Shimmer.vue";
import { MoreVertical } from "lucide-vue-next";

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
const isImagePreviewOpen = ref(false);
const previewImages = ref<string[]>([]);
const previewStartIndex = ref(0);
const savingRoom = ref(false);
const menuRoom = ref<Room | null>(null);
const openRoomMenuId = ref<string | null>(null);
const roomMenuPosition = ref({ top: 0, left: 0 });

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

function openImagePreview(images: string[], startIndex = 0) {
  previewImages.value = images;
  previewStartIndex.value = startIndex;
  isImagePreviewOpen.value = true;
}

function closeImagePreview() {
  isImagePreviewOpen.value = false;
  previewImages.value = [];
  previewStartIndex.value = 0;
}

function toggleRoomMenu(event: MouseEvent, room: Room) {
  if (openRoomMenuId.value === room.id) {
    closeRoomMenu();
    return;
  }

  const btn = event.currentTarget as HTMLElement;
  const rect = btn.getBoundingClientRect();
  const menuWidth = 192;
  const menuHeight = 104;

  let top = rect.bottom + 4;
  let left = rect.right - menuWidth;

  if (left < 8) left = 8;
  if (left + menuWidth > window.innerWidth - 8) left = window.innerWidth - menuWidth - 8;
  if (top + menuHeight > window.innerHeight - 8) top = rect.top - menuHeight - 4;

  roomMenuPosition.value = { top, left };
  menuRoom.value = room;
  openRoomMenuId.value = room.id;
}

function closeRoomMenu() {
  openRoomMenuId.value = null;
  menuRoom.value = null;
}

function handleMenuEdit() {
  if (!menuRoom.value) return;
  openEditModal(menuRoom.value);
  closeRoomMenu();
}

function handleMenuToggleStatus() {
  if (!menuRoom.value) return;
  toggleRoomStatus(menuRoom.value);
  closeRoomMenu();
}

function getGridClass(roomCount: number) {
  if (roomCount === 0 || roomStore.rooms.length === 0) return "grid-cols-1";
  const count = roomStore.rooms.length;
  if (count === 1) return "grid-cols-1";
  if (count === 2) return "grid-cols-2";
  if (count === 3) return "grid-cols-3";
  if (count <= 6) return "grid-cols-2 md:grid-cols-3";
  return "grid-cols-2 md:grid-cols-3 lg:grid-cols-4";
}

const getRoomsGridClass = computed(() => {
  const count = roomStore.rooms.length;
  if (count === 1) return "grid grid-cols-1 gap-4";
  if (count === 2) return "grid grid-cols-1 sm:grid-cols-2 gap-4";
  if (count === 3) return "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4";
  if (count <= 6) return "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4";
  return "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4";
});

async function toggleRoomStatus(room: Room) {
  const nextStatus = room.status === "ENABLED" ? "DISABLED" : "ENABLED";
  await roomStore.updateRoom(room.id, {
    status: nextStatus,
  });
}

async function saveRoom() {
  const hotelId = workspaceStore.activeHotel?.id;
  if (!hotelId || !form.value.roomId.trim()) return;

  savingRoom.value = true;
  try {
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
  } finally {
    savingRoom.value = false;
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
