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

      <!-- Pending ownership transfer requests -->
      <div v-if="hotelStore.pendingTransfers.length > 0" class="mb-8">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">{{ t("hotels.pendingTransfers.sectionTitle") }}</h2>
        <p class="text-sm text-gray-600 mb-4">{{ t("hotels.pendingTransfers.sectionSubtitle") }}</p>
        
        <div class="bg-white rounded-lg shadow overflow-hidden">
          <table class="w-full text-sm">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr>
                <th class="text-left px-6 py-3 font-medium text-gray-600">Hotel</th>
                <th class="text-left px-6 py-3 font-medium text-gray-600">{{ t("hotels.pendingTransfers.sentBy") }}</th>
                <th class="text-left px-6 py-3 font-medium text-gray-600">Expira em</th>
                <th class="text-right px-6 py-3 font-medium text-gray-600">{{ t("users.table.actions") }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="transfer in hotelStore.pendingTransfers" :key="transfer.id" class="hover:bg-gray-50 transition">
                <td class="px-6 py-4 font-medium text-gray-900">{{ transfer.hotel.name }}</td>
                <td class="px-6 py-4 text-gray-600">{{ transfer.from_user.full_name }}</td>
                <td class="px-6 py-4 text-amber-600 font-medium">{{ expiresIn(transfer.expires_at) }}</td>
                <td class="px-6 py-4 text-right">
                  <button
                    @click.stop="toggleTransferMenu($event, transfer)"
                    class="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
                    :aria-label="t('users.table.actions')"
                  >
                    <MoreVertical class="h-5 w-5" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <Loading v-if="false" />

      <!-- Hotels section header -->
      <div v-if="hotelStore.hotels.length > 0 || hotelStore.loading" class="mb-8">
        <h2 class="text-lg font-semibold text-gray-900 mb-6">{{ t("hotels.myHotels") }}</h2>

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
                <div class="flex items-center gap-2 mt-2">
                  <Badge
                    :variant="hotel.status === 'ENABLED' ? 'success' : hotel.status === 'DISABLED' ? 'warning' : 'secondary'"
                  >
                    {{ t(`hotels.statusValues.${hotel.status}`) }}
                  </Badge>
                  <Badge
                    :variant="hotel.my_role === 'owner' ? 'primary' : 'secondary'"
                  >
                    {{ t(`hotels.roles.${hotel.my_role}`) }}
                  </Badge>
                </div>
              </div>
              <div v-if="authStore.isAdmin || hotel.my_role === 'owner'" class="relative">
                <button
                  @click="openMenu(hotel.id)"
                  class="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <MoreVertical class="w-5 h-5 text-gray-500" />
                </button>
                <div
                  v-if="activeMenu === hotel.id"
                  class="absolute right-0 top-10 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[180px]"
                >
                  <template v-if="authStore.isAdmin">
                    <button
                      @click="editHotel(hotel)"
                      class="block w-full text-left px-4 py-2 hover:bg-gray-50 transition text-sm"
                    >
                      {{ t("hotels.edit") }}
                    </button>
                    <button
                      @click="toggleStatus(hotel)"
                      :disabled="hotel.status === 'ARCHIVED' || isActiveWorkspace(hotel.id)"
                      :title="isActiveWorkspace(hotel.id) ? t('hotels.cantDisableActiveWorkspace') : ''"
                      class="block w-full text-left px-4 py-2 hover:bg-gray-50 transition text-sm relative group"
                      :class="hotel.status === 'ARCHIVED' || isActiveWorkspace(hotel.id) ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700'"
                    >
                      {{ t("hotels.toggleStatus") }}
                      <span v-if="isActiveWorkspace(hotel.id)" class="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap hidden group-hover:block z-20">{{ t('hotels.cantDisableActiveWorkspace') }}</span>
                    </button>
                    <button
                      @click="requestArchive(hotel)"
                      :disabled="hotel.status === 'ARCHIVED' || isActiveWorkspace(hotel.id)"
                      :title="isActiveWorkspace(hotel.id) ? t('hotels.cantArchiveActiveWorkspace') : ''"
                      class="block w-full text-left px-4 py-2 hover:bg-gray-50 transition text-sm relative group"
                      :class="hotel.status === 'ARCHIVED' || isActiveWorkspace(hotel.id) ? 'text-gray-300 cursor-not-allowed' : 'text-orange-600'"
                    >
                      {{ t("hotels.archive") }}
                      <span v-if="isActiveWorkspace(hotel.id)" class="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap hidden group-hover:block z-20">{{ t('hotels.cantArchiveActiveWorkspace') }}</span>
                    </button>
                    <hr v-if="hotel.my_role === 'owner'" class="my-1 border-gray-100" />
                  </template>
                  <!-- Transfer ownership: always active, opens modal showing status or search -->
                  <button
                    v-if="hotel.my_role === 'owner'"
                    @click="requestTransfer(hotel)"
                    :disabled="hotel.status === 'ARCHIVED'"
                    class="block w-full text-left px-4 py-2 hover:bg-gray-50 transition text-sm"
                    :class="hotel.status === 'ARCHIVED' ? 'text-gray-300 cursor-not-allowed' : 'text-blue-600'"
                  >
                    {{ t("hotels.transferOwnership") }}
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

      <!-- Transfer ownership modal -->
      <Modal
        :isOpen="isTransferModalOpen"
        :title="t('hotels.transferModal.title', { name: transferHotel?.name ?? '' })"
        @close="closeTransferModal"
      >
        <Alert
          v-if="transferError"
          type="error"
          :title="t('hotels.errorTitle')"
          :message="transferError"
        />

        <!-- STATUS MODE: a pending transfer already exists -->
        <div v-if="transferHotel?.pending_transfer" class="space-y-4">
          <Alert
            v-if="transferSuccess"
            type="success"
            :title="t('hotels.transferModal.sendRequest')"
            :message="transferSuccess"
          />
          <p class="text-sm text-gray-600">{{ t("hotels.transferModal.sentTo") }}</p>
          <div class="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
            <div class="w-9 h-9 rounded-full bg-amber-200 flex items-center justify-center text-amber-800 font-semibold text-sm shrink-0">
              {{ transferHotel.pending_transfer.to_user.full_name.charAt(0).toUpperCase() }}
            </div>
            <div class="min-w-0">
              <p class="text-sm font-medium text-gray-900">{{ transferHotel.pending_transfer.to_user.full_name }}</p>
              <p class="text-xs text-gray-500">@{{ transferHotel.pending_transfer.to_user.username }}</p>
            </div>
            <div class="ml-auto text-right shrink-0">
              <p class="text-xs text-amber-600 font-medium">
                {{ t("hotels.pendingTransfers.expiresIn", { time: expiresIn(transferHotel.pending_transfer.expires_at) }) }}
              </p>
            </div>
          </div>
        </div>

        <!-- SEARCH MODE: send a new transfer request -->
        <div v-else class="space-y-4">
          <Alert
            v-if="transferSuccess"
            type="success"
            :title="t('hotels.transferModal.sendRequest')"
            :message="transferSuccess"
          />
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              {{ t("hotels.transferModal.searchLabel") }}
            </label>
            <Input
              v-model="transferSearch"
              :placeholder="t('hotels.transferModal.searchPlaceholder')"
              @input="onTransferSearchInput"
            />
          </div>

          <!-- Search results -->
          <div v-if="transferSearchLoading" class="text-sm text-gray-500">
            {{ t("hotels.transferModal.searching") }}
          </div>
          <ul
            v-else-if="transferSearchResults.length > 0 && !transferSelectedUser"
            class="border border-gray-200 rounded-lg divide-y divide-gray-100 max-h-48 overflow-y-auto"
          >
            <li
              v-for="user in transferSearchResults"
              :key="user.id"
              @click="selectTransferUser(user)"
              class="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 cursor-pointer transition"
            >
              <div>
                <p class="text-sm font-medium text-gray-900">{{ user.full_name }}</p>
                <p class="text-xs text-gray-500">@{{ user.username }}</p>
              </div>
            </li>
          </ul>
          <p
            v-else-if="transferSearch.length >= 2 && !transferSearchLoading && transferSearchResults.length === 0 && !transferSelectedUser"
            class="text-sm text-gray-500"
          >
            {{ t("hotels.transferModal.noResults") }}
          </p>

          <!-- Selected user -->
          <div
            v-if="transferSelectedUser"
            class="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg px-4 py-2.5"
          >
            <div>
              <p class="text-sm font-medium text-blue-900">{{ transferSelectedUser.full_name }}</p>
              <p class="text-xs text-blue-600">@{{ transferSelectedUser.username }}</p>
            </div>
            <button
              @click="clearTransferUser"
              class="text-blue-400 hover:text-blue-600 text-lg leading-none"
              aria-label="Remove"
            >×</button>
          </div>
        </div>

        <template #footer>
          <!-- Status mode footer -->
          <template v-if="transferHotel?.pending_transfer">
            <Button variant="ghost" :disabled="cancelingTransfer" @click="closeTransferModal">
              {{ t("common.close") }}
            </Button>
            <Button
              variant="danger"
              :loading="cancelingTransfer"
              :disabled="cancelingTransfer"
              @click="cancelTransfer"
            >
              {{ t("hotels.transferModal.cancelTransfer") }}
            </Button>
          </template>
          <!-- Search mode footer -->
          <template v-else>
            <Button variant="ghost" :disabled="submittingTransfer" @click="closeTransferModal">
              {{ t("common.cancel") }}
            </Button>
            <Button
              :loading="submittingTransfer"
              :disabled="submittingTransfer || !transferSelectedUser"
              @click="submitTransfer"
            >
              {{ t("hotels.transferModal.sendRequest") }}
            </Button>
          </template>
        </template>
      </Modal>

      <!-- Actions dropdown for pending transfers (teleported to avoid overflow-hidden clipping) -->
      <Teleport to="body">
        <template v-if="menuTransfer">
          <div class="fixed inset-0 z-40" @click="closeTransferMenu" />
          <div
            :style="{ top: menuPosition.top + 'px', left: menuPosition.left + 'px' }"
            class="fixed z-50 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1 text-sm"
          >
            <button
              @click="handleMenuAccept"
              class="w-full text-left px-4 py-2.5 text-green-600 hover:bg-green-50 transition-colors"
            >
              {{ t("hotels.pendingTransfers.accept") }}
            </button>
            <button
              @click="handleMenuReject"
              class="w-full text-left px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              {{ t("hotels.pendingTransfers.reject") }}
            </button>
          </div>
        </template>
      </Teleport>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useHotelStore } from "@/modules/hotels/ui/stores/hotelStore";
import { useAuthStore } from "@/modules/auth/ui/stores/authStore";
import { useWorkspaceStore } from "@/modules/hotels/ui/stores/workspaceStore";
import { hotelService } from "@/modules/hotels/data/services/hotelService";
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
import type { Hotel, UserSearchResult } from "@/core/utils/types";

const hotelStore = useHotelStore();
const authStore = useAuthStore();
const workspaceStore = useWorkspaceStore();
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

// Transfer ownership state
const isTransferModalOpen = ref(false);
const transferHotel = ref<Hotel | null>(null);
const transferSearch = ref("");
const transferSearchResults = ref<UserSearchResult[]>([]);
const transferSearchLoading = ref(false);
const transferSelectedUser = ref<UserSearchResult | null>(null);
const submittingTransfer = ref(false);
const cancelingTransfer = ref(false);
const transferError = ref("");
const transferSuccess = ref("");
const respondingTransferId = ref<string | null>(null);

// Transfer menu state (for pending transfers table)
const openTransferMenuId = ref<string | null>(null);
const menuTransfer = ref<any | null>(null);
const menuPosition = ref({ top: 0, left: 0 });
let transferSearchTimer: ReturnType<typeof setTimeout> | null = null;

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

function isActiveWorkspace(hotelId: string): boolean {
  return workspaceStore.activeHotel?.id === hotelId;
}

function requestTransfer(hotel: Hotel) {
  transferHotel.value = hotel;
  transferSearch.value = "";
  transferSearchResults.value = [];
  transferSelectedUser.value = null;
  transferError.value = "";
  transferSuccess.value = "";
  cancelingTransfer.value = false;
  activeMenu.value = null;
  isTransferModalOpen.value = true;
}

function closeTransferModal() {
  isTransferModalOpen.value = false;
  transferHotel.value = null;
  transferSearch.value = "";
  transferSearchResults.value = [];
  transferSelectedUser.value = null;
  transferError.value = "";
  transferSuccess.value = "";
  cancelingTransfer.value = false;
}

function onTransferSearchInput() {
  transferSelectedUser.value = null;
  if (transferSearchTimer) clearTimeout(transferSearchTimer);
  if (transferSearch.value.trim().length < 2) {
    transferSearchResults.value = [];
    return;
  }
  transferSearchLoading.value = true;
  transferSearchTimer = setTimeout(async () => {
    try {
      const token = authStore.token ?? "";
      transferSearchResults.value = await hotelService.searchUsersForTransfer(
        transferSearch.value.trim(),
        token,
      );
    } catch {
      transferSearchResults.value = [];
    } finally {
      transferSearchLoading.value = false;
    }
  }, 350);
}

function selectTransferUser(user: UserSearchResult) {
  transferSelectedUser.value = user;
  transferSearchResults.value = [];
}

function clearTransferUser() {
  transferSelectedUser.value = null;
  transferSearch.value = "";
}

async function submitTransfer() {
  if (!transferHotel.value || !transferSelectedUser.value || submittingTransfer.value) return;
  submittingTransfer.value = true;
  transferError.value = "";
  transferSuccess.value = "";
  try {
    const token = authStore.token ?? "";
    await hotelService.createOwnershipTransfer(
      transferHotel.value.id,
      transferSelectedUser.value.username,
      token,
    );
    await hotelStore.fetchHotels();
    // Refresh transferHotel so the modal switches to STATUS MODE
    const updated = hotelStore.hotels.find((h) => h.id === transferHotel.value!.id);
    if (updated) transferHotel.value = updated;
    transferSuccess.value = t("hotels.transferModal.successMessage");
    transferSelectedUser.value = null;
    transferSearch.value = "";
  } catch (err) {
    transferError.value =
      err instanceof Error ? err.message : t("hotels.transferModal.errorFallback");
  } finally {
    submittingTransfer.value = false;
  }
}

async function cancelTransfer() {
  if (!transferHotel.value?.pending_transfer || cancelingTransfer.value) return;
  cancelingTransfer.value = true;
  transferError.value = "";
  try {
    await hotelStore.cancelTransfer(transferHotel.value.pending_transfer.id);
    closeTransferModal();
  } catch (err) {
    transferError.value =
      err instanceof Error ? err.message : t("hotels.transferModal.cancelError");
    cancelingTransfer.value = false;
  }
}

function expiresIn(expiresAt: string): string {
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return t("hotels.pendingTransfers.expired");
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

async function handleRespondTransfer(
  transferId: string,
  action: "accept" | "reject",
  hotelName: string,
) {
  respondingTransferId.value = transferId;
  try {
    await hotelStore.respondToTransfer(transferId, action);
    if (action === "accept") {
      // brief feedback via store error repurpose — use a local alert instead
      hotelStore.error = null;
    }
  } catch {
    // handled in store
  } finally {
    respondingTransferId.value = null;
  }
}

function toggleTransferMenu(event: MouseEvent, transfer: any) {
  if (openTransferMenuId.value === transfer.id) {
    closeTransferMenu();
    return;
  }
  const btn = event.currentTarget as HTMLElement;
  const rect = btn.getBoundingClientRect();
  const menuWidth = 192; // w-48
  const menuHeight = 100; // approximate height for 2 items

  let top = rect.bottom + 4;
  let left = rect.right - menuWidth;

  if (left < 8) left = 8;
  if (left + menuWidth > window.innerWidth - 8) left = window.innerWidth - menuWidth - 8;
  if (top + menuHeight > window.innerHeight - 8) top = rect.top - menuHeight - 4;

  menuPosition.value = { top, left };
  menuTransfer.value = transfer;
  openTransferMenuId.value = transfer.id;
}

function closeTransferMenu() {
  openTransferMenuId.value = null;
  menuTransfer.value = null;
}

function handleMenuAccept() {
  if (menuTransfer.value) {
    handleRespondTransfer(menuTransfer.value.id, "accept", menuTransfer.value.hotel.name);
    closeTransferMenu();
  }
}

function handleMenuReject() {
  if (menuTransfer.value) {
    handleRespondTransfer(menuTransfer.value.id, "reject", menuTransfer.value.hotel.name);
    closeTransferMenu();
  }
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString(locale.value);
}

onMounted(async () => {
  await Promise.all([hotelStore.fetchHotels(), hotelStore.fetchPendingTransfers()]);
});
</script>

<style scoped></style>
