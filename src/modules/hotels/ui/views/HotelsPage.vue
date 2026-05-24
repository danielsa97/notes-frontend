<template>
  <AppLayout>
    <div class="max-w-7xl mx-auto px-4 py-8">
      <div class="flex justify-between items-center gap-3 mb-8">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">{{ t("hotels.title") }}</h1>
          <p class="text-gray-600">{{ t("hotels.subtitle") }}</p>
        </div>
        <Button v-if="authStore.isAdmin" :aria-label="t('hotels.add')" @click="openAddModal">
          <span class="sm:hidden">+</span>
          <span class="hidden sm:inline">{{ t("hotels.add") }}</span>
        </Button>
      </div>

      <Alert
        v-if="hotelStore.error"
        type="error"
        :title="t('hotels.errorTitle')"
        :message="hotelStore.error"
      />

      <Loading v-if="false" />

      <!-- Shimmer skeleton while loading -->
      <div
        v-if="hotelStore.loading"
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <div
          v-for="i in 6"
          :key="i"
          class="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-3"
        >
          <Shimmer height="10rem" rounded="lg" />
          <div class="flex items-start justify-between">
            <div class="flex-1 space-y-2">
              <Shimmer height="1.1rem" width="60%" />
              <Shimmer height="1.4rem" width="3.5rem" rounded="full" />
            </div>
          </div>
          <Shimmer height="0.75rem" width="80%" />
          <Shimmer height="0.75rem" width="45%" />
        </div>
      </div>

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
            <img
              v-if="hotel.image_urls?.length"
              :src="hotel.image_urls[0]"
              :alt="t('hotels.imageAlt', { name: hotel.name })"
              class="w-full h-40 object-cover rounded-lg mb-4"
            />
            <div
              v-else
              class="w-full h-40 rounded-lg mb-4 border border-dashed border-gray-200 bg-gray-50 flex items-center justify-center"
            >
              <div class="flex flex-col items-center gap-1 text-gray-400">
                <Building2 class="w-6 h-6" />
                <span class="text-xs">{{ t("hotels.noImage") }}</span>
              </div>
            </div>

            <div class="flex items-start justify-between mb-4">
              <div class="flex-1">
                <h3 class="text-lg font-bold text-gray-900">
                  {{ hotel.name }}
                </h3>
                <Badge
                  :variant="hotel.status === 'ENABLED' ? 'success' : hotel.status === 'DISABLED' ? 'warning' : 'secondary'"
                >
                  {{ t(`hotels.statusValues.${hotel.status}`) }}
                </Badge>
              </div>
              <div v-if="authStore.isAdmin" class="relative">
                <button
                  @click="openMenu(hotel.id)"
                  class="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <MoreVertical class="w-5 h-5 text-gray-500" />
                </button>
                <div
                  v-if="activeMenu === hotel.id"
                  class="absolute right-0 top-10 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[160px]"
                >
                  <button
                    @click="editHotel(hotel)"
                    class="block w-full text-left px-4 py-2 hover:bg-gray-50 transition text-sm"
                  >
                    {{ t("hotels.edit") }}
                  </button>
                  <button
                    @click="toggleStatus(hotel)"
                    :disabled="hotel.status === 'ARCHIVED'"
                    class="block w-full text-left px-4 py-2 hover:bg-gray-50 transition text-sm"
                    :class="hotel.status === 'ARCHIVED' ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700'"
                  >
                    {{ t("hotels.toggleStatus") }}
                  </button>
                  <button
                    @click="requestArchive(hotel)"
                    :disabled="hotel.status === 'ARCHIVED'"
                    class="block w-full text-left px-4 py-2 hover:bg-gray-50 transition text-sm"
                    :class="hotel.status === 'ARCHIVED' ? 'text-gray-300 cursor-not-allowed' : 'text-orange-600'"
                  >
                    {{ t("hotels.archive") }}
                  </button>
                </div>
              </div>
            </div>

            <p v-if="hotel.description" class="text-gray-600 text-sm mb-4">
              {{ hotel.description }}
            </p>
            <div class="flex items-center gap-2 text-sm text-gray-500">
              <span>{{ t("hotels.createdAt", { date: formatDate(hotel.created_at) }) }}</span>
            </div>
          </Card>
        </div>

        <div v-else class="bg-white rounded-lg shadow p-12 text-center">
          <p class="text-gray-600 text-lg mb-4">
            {{ t("hotels.empty") }}
          </p>
          <Button v-if="authStore.isAdmin" @click="openAddModal">{{ t("hotels.createFirst") }}</Button>
        </div>
      </div>

      <Modal
        :isOpen="isModalOpen"
        :title="editingHotel ? t('hotels.modalEditTitle') : t('hotels.modalAddTitle')"
        @close="closeModal"
        @confirm="saveHotel"
      >
        <FormGroup @submit="saveHotel">
          <Input
            v-model="form.name"
            :label="t('hotels.hotelName')"
            :placeholder="t('hotels.hotelNamePlaceholder')"
            required
          />
          <Input
            v-model="form.description"
            :label="t('hotels.description')"
            :placeholder="t('hotels.descriptionPlaceholder')"
          />
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2"
              >{{ t("hotels.status") }}</label
            >
            <select
              v-if="editingHotel"
              v-model="form.status"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ENABLED">{{ t("hotels.statusValues.ENABLED") }}</option>
              <option value="DISABLED">{{ t("hotels.statusValues.DISABLED") }}</option>
            </select>
            <p v-else class="text-sm text-gray-500">{{ t("hotels.statusValues.ENABLED") }}</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2"
              >{{ t("hotels.imageUploadLabel") }}</label
            >

            <div
              v-if="existingImageUrls.length"
              class="grid grid-cols-3 gap-2 mb-3"
            >
              <div
                v-for="(imageUrl, index) in existingImageUrls"
                :key="imageUrl"
                class="relative"
              >
                <img
                  :src="imageUrl"
                  :alt="t('hotels.imagePreviewAlt')"
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
              :maxFiles="Math.max(0, 3 - existingImageUrls.length)"
              :disabled="savingHotel"
              @files-selected="handleImageSelection"
            />
            <p class="text-xs text-gray-500 mt-2">
              {{ t("hotels.imageUploadHint") }}
            </p>

            <div
              v-if="imagePreviews.length"
              class="grid grid-cols-3 gap-2 mt-3"
            >
              <img
                v-for="preview in imagePreviews"
                :key="preview"
                :src="preview"
                :alt="t('hotels.imagePreviewAlt')"
                class="h-20 w-full object-cover rounded-md border border-gray-200"
              />
            </div>
          </div>
        </FormGroup>
        <template #footer>
          <Button variant="ghost" :disabled="savingHotel" @click="closeModal">
            {{ t("common.cancel") }}
          </Button>
          <Button :loading="savingHotel" :disabled="savingHotel" @click="saveHotel">
            {{ t("common.confirm") }}
          </Button>
        </template>
      </Modal>

      <!-- Archive confirmation modal -->
      <Modal
        :isOpen="isArchiveModalOpen"
        :title="t('hotels.archiveWarningTitle')"
        @close="isArchiveModalOpen = false"
        @confirm="confirmArchive"
      >
        <div class="flex gap-3 p-4 bg-orange-50 border border-orange-200 rounded-lg mb-2">
          <AlertTriangle class="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
          <p class="text-sm text-orange-800">{{ t("hotels.archiveWarningMessage") }}</p>
        </div>
        <p class="text-sm text-gray-600 mt-3">
          <strong>{{ archivingHotel?.name }}</strong>
        </p>
      </Modal>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useI18n } from "vue-i18n";
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
import Shimmer from "@/shared/components/Shimmer.vue";
import Badge from "@/shared/components/Badge.vue";
import ImagePicker from "@/shared/components/ImagePicker.vue";
import { MoreVertical, AlertTriangle, Building2 } from "lucide-vue-next";
import type { Hotel } from "@/core/utils/types";

const hotelStore = useHotelStore();
const authStore = useAuthStore();
const { t, locale } = useI18n();

const isModalOpen = ref(false);
const activeMenu = ref<string | null>(null);
const editingHotel = ref<Hotel | null>(null);
const selectedImages = ref<File[]>([]);
const imagePreviews = ref<string[]>([]);
const imageInputKey = ref(0);
const isArchiveModalOpen = ref(false);
const archivingHotel = ref<Hotel | null>(null);
const savingHotel = ref(false);
const existingImageUrls = ref<string[]>([]);
const form = ref({
  name: "",
  description: "",
  status: "ENABLED" as "ENABLED" | "DISABLED",
});

function resetSelectedImages() {
  imagePreviews.value.forEach((url) => URL.revokeObjectURL(url));
  selectedImages.value = [];
  imagePreviews.value = [];
  existingImageUrls.value = [];
  imageInputKey.value += 1;
}

function resetNewSelectedImages() {
  imagePreviews.value.forEach((url) => URL.revokeObjectURL(url));
  selectedImages.value = [];
  imagePreviews.value = [];
  imageInputKey.value += 1;
}

function handleImageSelection(files: File[]) {

  if (files.length + existingImageUrls.value.length > 3) {
    alert(t("hotels.maxImagesError"));
    return;
  }

  const hasInvalidType = files.some((file) => !file.type.startsWith("image/"));
  if (hasInvalidType) {
    alert(t("hotels.invalidImageError"));
    return;
  }

  resetNewSelectedImages();
  selectedImages.value = files;
  imagePreviews.value = files.map((file) => URL.createObjectURL(file));
}

function openAddModal() {
  editingHotel.value = null;
  form.value = { name: "", description: "", status: "ENABLED" };
  resetSelectedImages();
  isModalOpen.value = true;
}

function editHotel(hotel: Hotel) {
  editingHotel.value = hotel;
  form.value = {
    name: hotel.name,
    description: hotel.description || "",
    status: hotel.status === "ARCHIVED" ? "ENABLED" : hotel.status,
  };
  existingImageUrls.value = [...(hotel.image_urls || [])];
  selectedImages.value = [];
  imagePreviews.value = [];
  imageInputKey.value += 1;
  isModalOpen.value = true;
  activeMenu.value = null;
}

function removeExistingImage(index: number) {
  existingImageUrls.value.splice(index, 1);
}

function closeModal() {
  isModalOpen.value = false;
  editingHotel.value = null;
  resetSelectedImages();
}

async function saveHotel() {
  if (!form.value.name || savingHotel.value) return;

  savingHotel.value = true;
  try {
    if (editingHotel.value) {
      const result = await hotelStore.updateHotel(editingHotel.value.id, {
        name: form.value.name,
        description: form.value.description,
        status: form.value.status,
        image_urls: existingImageUrls.value,
      }, selectedImages.value);
      if (!result) return;
    } else {
      const result = await hotelStore.createHotel(
        {
          name: form.value.name,
          description: form.value.description,
        },
        selectedImages.value,
      );
      if (!result) return;
    }
    closeModal();
  } catch (error) {
    console.error(t("hotels.saveError"), error);
  } finally {
    savingHotel.value = false;
  }
}

async function toggleStatus(hotel: Hotel) {
  if (hotel.status === "ARCHIVED") return;
  const newStatus = hotel.status === "ENABLED" ? "DISABLED" : "ENABLED";
  await hotelStore.updateHotel(hotel.id, { status: newStatus });
  activeMenu.value = null;
}

function requestArchive(hotel: Hotel) {
  if (hotel.status === "ARCHIVED") return;
  archivingHotel.value = hotel;
  isArchiveModalOpen.value = true;
  activeMenu.value = null;
}

async function confirmArchive() {
  if (!archivingHotel.value) return;
  await hotelStore.archiveHotel(archivingHotel.value.id);
  isArchiveModalOpen.value = false;
  archivingHotel.value = null;
}

function openMenu(hotelId: string) {
  activeMenu.value = activeMenu.value === hotelId ? null : hotelId;
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString(locale.value);
}

onMounted(async () => {
  await hotelStore.fetchHotels();
});
</script>

<style scoped></style>
