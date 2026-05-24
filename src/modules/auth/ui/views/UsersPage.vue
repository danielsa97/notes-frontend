<template>
  <AppLayout>
    <div class="max-w-7xl mx-auto px-4 py-8">
      <div class="flex justify-between items-center gap-3 mb-8">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">{{ t("users.title") }}</h1>
          <p class="text-gray-600">{{ t("users.subtitle") }}</p>
        </div>
        <Button :aria-label="t('users.add')" @click="openCreateModal">
          <span class="sm:hidden">+</span>
          <span class="hidden sm:inline">{{ t("users.add") }}</span>
        </Button>
      </div>

      <Alert
        v-if="fetchError"
        type="error"
        :title="t('users.errorTitle')"
        :message="fetchError"
      />

      <Alert
        v-if="actionSuccess"
        type="success"
        :title="t('common.save')"
        :message="actionSuccess"
      />

      <!-- Shimmer skeleton while loading -->
      <div v-if="loading">
        <!-- Mobile shimmer -->
        <div class="md:hidden space-y-3">
          <div v-for="row in 5" :key="row" class="bg-white rounded-lg shadow px-4 py-4 space-y-3">
            <div class="flex items-center justify-between">
              <Shimmer height="0.9rem" width="45%" />
              <Shimmer height="1.5rem" width="4rem" rounded="full" />
            </div>
            <Shimmer height="0.75rem" width="30%" />
            <div class="flex gap-2">
              <Shimmer height="1.4rem" width="3.5rem" rounded="full" />
              <Shimmer height="1.4rem" width="5rem" rounded="full" />
            </div>
          </div>
        </div>
        <!-- Desktop shimmer -->
        <div class="hidden md:block bg-white rounded-lg shadow overflow-hidden">
          <div class="bg-gray-50 border-b border-gray-200 px-6 py-3 flex gap-6">
            <Shimmer v-for="i in 6" :key="i" height="0.75rem" :width="i === 1 ? '15%' : i === 2 ? '12%' : i === 3 ? '8%' : i === 4 ? '10%' : i === 5 ? '12%' : '6%'" />
          </div>
          <div class="divide-y divide-gray-100">
            <div v-for="row in 6" :key="row" class="px-6 py-4 flex gap-6 items-center">
              <Shimmer height="0.875rem" width="18%" />
              <Shimmer height="0.875rem" width="13%" />
              <Shimmer height="1.5rem" width="4rem" rounded="full" />
              <Shimmer height="0.875rem" width="6rem" />
              <Shimmer height="0.875rem" width="10%" />
              <Shimmer height="0.875rem" width="5rem" />
            </div>
          </div>
        </div>
      </div>

      <div v-else>
        <!-- Mobile card list -->
        <div v-if="users.length > 0" class="md:hidden space-y-3">
          <div
            v-for="user in users"
            :key="user.id"
            class="bg-white rounded-lg shadow px-4 py-4"
          >
            <div class="flex items-start justify-between gap-2">
              <div class="min-w-0">
                <p class="font-semibold text-gray-900 truncate">{{ user.full_name }}</p>
                <p class="text-sm text-gray-500 mt-0.5">@{{ user.username }}</p>
              </div>
              <button
                @click.stop="toggleMenu($event, user)"
                class="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 transition-colors shrink-0"
                :aria-label="t('users.table.actions')"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
              </button>
            </div>
            <div class="flex flex-wrap gap-2 mt-3">
              <Badge :variant="user.is_admin ? 'success' : 'primary'">
                {{ user.is_admin ? t("users.role.admin") : t("users.role.user") }}
              </Badge>
              <Badge :variant="statusBadgeVariant(user.status)">
                {{ t(`users.statusValues.${user.status}`) }}
              </Badge>
            </div>
            <div class="flex gap-4 mt-3 text-xs text-gray-500">
              <span>{{ (user.hotel_memberships || []).length }} {{ t("users.hotelCount") }}</span>
              <span>{{ formatDate(user.created_at) }}</span>
            </div>
          </div>
        </div>

        <!-- Desktop table -->
        <div class="hidden md:block bg-white rounded-lg shadow overflow-hidden">
          <table v-if="users.length > 0" class="w-full text-sm">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr>
                <th class="text-left px-6 py-3 font-medium text-gray-600">
                  {{ t("users.table.name") }}
                </th>
                <th class="text-left px-6 py-3 font-medium text-gray-600">
                  {{ t("users.table.username") }}
                </th>
                <th class="text-left px-6 py-3 font-medium text-gray-600">
                  {{ t("users.table.role") }}
                </th>
                <th class="text-left px-6 py-3 font-medium text-gray-600">
                  {{ t("users.table.status") }}
                </th>
                <th class="text-left px-6 py-3 font-medium text-gray-600">
                  {{ t("users.table.hotels") }}
                </th>
                <th class="text-left px-6 py-3 font-medium text-gray-600">
                  {{ t("users.table.createdAt") }}
                </th>
                <th class="text-left px-6 py-3 font-medium text-gray-600">
                  {{ t("users.table.actions") }}
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr
                v-for="user in users"
                :key="user.id"
                class="hover:bg-gray-50 transition"
              >
                <td class="px-6 py-4 font-medium text-gray-900">
                  {{ user.full_name }}
                </td>
                <td class="px-6 py-4 text-gray-600">@{{ user.username }}</td>
                <td class="px-6 py-4">
                  <Badge :variant="user.is_admin ? 'success' : 'primary'">
                    {{ user.is_admin ? t("users.role.admin") : t("users.role.user") }}
                  </Badge>
                </td>
                <td class="px-6 py-4">
                  <Badge :variant="statusBadgeVariant(user.status)">
                    {{ t(`users.statusValues.${user.status}`) }}
                  </Badge>
                </td>
                <td class="px-6 py-4 text-gray-600 text-sm">
                  {{ (user.hotel_memberships || []).length }}
                  {{ t("users.hotelCount") }}
                </td>
                <td class="px-6 py-4 text-gray-500">
                  {{ formatDate(user.created_at) }}
                </td>
                <td class="px-6 py-4 text-right">
                  <button
                    @click.stop="toggleMenu($event, user)"
                    class="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
                    :aria-label="t('users.table.actions')"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                    </svg>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>

          <div v-else class="p-12 text-center">
            <p class="text-gray-600 text-lg">{{ t("users.empty") }}</p>
          </div>
        </div>

        <div v-if="users.length === 0" class="md:hidden bg-white rounded-lg shadow p-8 text-center">
          <p class="text-gray-600">{{ t("users.empty") }}</p>
        </div>
      </div>
    </div>

    <Modal
      :isOpen="isCreateModalOpen"
      :title="t('users.modalTitle')"
      @close="closeCreateModal"
      @confirm="handleCreate"
    >
      <Alert
        v-if="createError"
        type="error"
        :title="t('users.errorTitle')"
        :message="createError"
      />
      <Alert
        v-if="createSuccess"
        type="success"
        :title="t('auth.register.successTitle')"
        :message="createSuccess"
      />
      <FormGroup @submit="handleCreate" class="space-y-4">
        <Input
          v-model="form.fullName"
          type="text"
          :label="t('auth.register.fullName')"
          :placeholder="t('auth.register.fullNamePlaceholder')"
          required
        />
        <Input
          v-model="form.username"
          type="text"
          :label="t('auth.register.username')"
          :placeholder="t('auth.register.usernamePlaceholder')"
          required
        />
        <Input
          v-model="form.password"
          type="password"
          :label="t('auth.register.password')"
          placeholder="••••••••"
          required
        />
        <Input
          v-model="form.confirmPassword"
          type="password"
          :label="t('auth.register.confirmPassword')"
          placeholder="••••••••"
          required
          :error="
            form.confirmPassword && form.password !== form.confirmPassword
              ? t('auth.register.passwordMismatch')
              : ''
          "
        />
        <label class="flex items-center gap-2 text-sm text-gray-700">
          <input v-model="form.isAdmin" type="checkbox" class="rounded border-gray-300" />
          {{ t("auth.register.adminCheckbox") }}
        </label>

        <!-- Hotel association -->
        <div v-if="hotelStore.hotels.length > 0">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {{ t("users.associateHotels") }}
          </label>
          <div class="space-y-1 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-3">
            <label
              v-for="hotel in hotelStore.hotels"
              :key="hotel.id"
              class="flex items-center gap-2 text-sm text-gray-700 cursor-pointer p-1 rounded hover:bg-gray-50"
            >
              <input
                type="checkbox"
                :value="hotel.id"
                v-model="form.selectedHotelIds"
                class="rounded border-gray-300"
              />
              {{ hotel.name }}
            </label>
          </div>
        </div>
      </FormGroup>
      <template #footer>
        <Button variant="ghost" :disabled="saving" @click="closeCreateModal">
          {{ t("common.cancel") }}
        </Button>
        <Button :loading="saving" :disabled="saving" @click="handleCreate">
          {{ t("common.confirm") }}
        </Button>
      </template>
    </Modal>

    <Modal
      :isOpen="isEditModalOpen"
      :title="t('users.editModalTitle')"
      @close="closeEditModal"
      @confirm="saveUserEdit"
    >
      <Alert
        v-if="editError"
        type="error"
        :title="t('users.errorTitle')"
        :message="editError"
      />
      <FormGroup @submit="saveUserEdit" class="space-y-4">
        <Input
          v-model="editForm.fullName"
          type="text"
          :label="t('auth.register.fullName')"
          :placeholder="t('auth.register.fullNamePlaceholder')"
          required
        />
        <Input
          v-model="editForm.username"
          type="text"
          :label="t('auth.register.username')"
          disabled
        />
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {{ t("users.table.status") }}
          </label>
          <select
            v-model="editForm.status"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ENABLED">{{ t("users.statusValues.ENABLED") }}</option>
            <option
              value="DISABLED"
              :disabled="isCurrentUserById(editForm.id) || isLastActiveAdminEditing"
            >
              {{ t("users.statusValues.DISABLED") }}
            </option>
            <option
              value="DELETED"
              :disabled="isCurrentUserById(editForm.id) || isLastActiveAdminEditing"
            >
              {{ t("users.statusValues.DELETED") }}
            </option>
          </select>
        </div>
        <label class="flex items-center gap-2 text-sm text-gray-700">
          <input
            v-model="editForm.isAdmin"
            type="checkbox"
            class="rounded border-gray-300"
            :disabled="isLastActiveAdminEditing"
          />
          {{ t("auth.register.adminCheckbox") }}
        </label>
        <p v-if="isLastActiveAdminEditing" class="text-xs text-amber-600">
          {{ t("users.lastActiveAdminHint") }}
        </p>
      </FormGroup>
      <template #footer>
        <Button variant="ghost" :disabled="editing" @click="closeEditModal">
          {{ t("common.cancel") }}
        </Button>
        <Button :loading="editing" :disabled="editing" @click="saveUserEdit">
          {{ t("common.save") }}
        </Button>
      </template>
    </Modal>

    <Modal
      :isOpen="isPasswordModalOpen"
      :title="t('users.passwordModalTitle', { name: passwordTarget?.full_name ?? '' })"
      @close="closePasswordModal"
      @confirm="saveUserPassword"
    >
      <Alert
        v-if="passwordError"
        type="error"
        :title="t('users.errorTitle')"
        :message="passwordError"
      />
      <FormGroup @submit="saveUserPassword" class="space-y-4">
        <Input
          v-model="passwordForm.newPassword"
          type="password"
          :label="t('users.newPassword')"
          :placeholder="t('users.newPasswordPlaceholder')"
          required
        />
        <Input
          v-model="passwordForm.confirmPassword"
          type="password"
          :label="t('users.confirmNewPassword')"
          :placeholder="t('users.confirmNewPasswordPlaceholder')"
          required
          :error="
            passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword
              ? t('users.errors.passwordMismatch')
              : ''
          "
        />
      </FormGroup>
      <template #footer>
        <Button variant="ghost" :disabled="updatingPassword" @click="closePasswordModal">
          {{ t("common.cancel") }}
        </Button>
        <Button
          :loading="updatingPassword"
          :disabled="updatingPassword"
          @click="saveUserPassword"
        >
          {{ t("common.save") }}
        </Button>
      </template>
    </Modal>

    <Modal
      :isOpen="isDeleteModalOpen"
      :title="t('users.deleteModalTitle')"
      @close="closeDeleteModal"
      @confirm="confirmSoftDelete"
    >
      <Alert
        v-if="deleteError"
        type="error"
        :title="t('users.errorTitle')"
        :message="deleteError"
      />
      <p class="text-sm text-gray-700 mb-3">{{ t("users.deleteConfirmMessage") }}</p>
      <p class="text-sm text-gray-900 font-medium mb-4">{{ deletingUser?.full_name }}</p>
      
      <!-- Show hotels that will be transferred -->
      <div v-if="deletingUserOwnedHotels.length > 0" class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p class="text-sm font-medium text-blue-900 mb-2">{{ t("users.hotelTransferWarning") }}</p>
        <ul class="space-y-1">
          <li v-for="hotel in deletingUserOwnedHotels" :key="hotel.id" class="text-sm text-blue-800">
            • {{ hotel.name }}
          </li>
        </ul>
      </div>
      
      <template #footer>
        <Button variant="ghost" :disabled="deleting" @click="closeDeleteModal">
          {{ t("common.cancel") }}
        </Button>
        <Button variant="danger" :loading="deleting" :disabled="deleting" @click="confirmSoftDelete">
          {{ t("users.actions.delete") }}
        </Button>
      </template>
    </Modal>

    <!-- Actions dropdown (teleported to avoid overflow-hidden clipping) -->
    <Teleport to="body">
      <template v-if="menuUser">
        <div class="fixed inset-0 z-40" @click="closeMenu" />
        <div
          :style="{ top: menuPosition.top + 'px', left: menuPosition.left + 'px' }"
          class="fixed z-50 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1 text-sm"
        >
          <button
            @click="handleMenuEdit"
            class="w-full text-left px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            {{ t("users.actions.edit") }}
          </button>
          <button
            @click="handleMenuPassword"
            class="w-full text-left px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            {{ t("users.actions.password") }}
          </button>
          <button
            @click="handleMenuManageHotels"
            :disabled="menuUser.status === 'DELETED'"
            class="w-full text-left px-4 py-2.5 text-gray-700 hover:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {{ t("users.actions.manageHotels") }}
          </button>
          <button
            @click="handleMenuToggleStatus"
            :disabled="isCurrentUser(menuUser!) || menuUser!.status === 'DELETED' || isLastActiveAdmin(menuUser!)"
            class="w-full text-left px-4 py-2.5 text-gray-700 hover:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {{ menuUser?.status === "ENABLED" ? t("users.actions.disable") : t("users.actions.enable") }}
          </button>
          <hr class="my-1 border-gray-100" />
          <button
            @click="handleMenuDelete"
            :disabled="isCurrentUser(menuUser) || menuUser.status === 'DELETED' || isLastActiveAdmin(menuUser)"
            class="w-full text-left px-4 py-2.5 text-red-600 hover:bg-red-50 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {{ t("users.actions.delete") }}
          </button>
        </div>
      </template>
    </Teleport>

    <!-- Hotel membership management modal -->
    <Modal
      :isOpen="isMembershipModalOpen"
      :title="t('users.manageHotelsTitle', { name: managingUser?.full_name ?? '' })"
      @close="isMembershipModalOpen = false"
      @confirm="saveHotelMemberships"
    >
      <Alert
        v-if="membershipError"
        type="error"
        :title="t('users.errorTitle')"
        :message="membershipError"
      />
      <div class="space-y-1 max-h-60 overflow-y-auto">
        <label
          v-for="hotel in hotelStore.hotels"
          :key="hotel.id"
          class="flex items-center gap-2 text-sm text-gray-700 cursor-pointer p-2 rounded hover:bg-gray-50"
          :class="{ 'opacity-60': isOwnerOf(hotel.id) }"
        >
          <input
            type="checkbox"
            :value="hotel.id"
            v-model="membershipForm"
            class="rounded border-gray-300"
            :disabled="isOwnerOf(hotel.id)"
          />
          <span class="flex-1">{{ hotel.name }}</span>
          <span v-if="isOwnerOf(hotel.id)" class="text-xs text-gray-400 ml-auto">
            {{ t("workspace.owner") }}
          </span>
        </label>
      </div>
      <template #footer>
        <Button variant="ghost" :disabled="savingMembership" @click="isMembershipModalOpen = false">
          {{ t("common.cancel") }}
        </Button>
        <Button :loading="savingMembership" :disabled="savingMembership" @click="saveHotelMemberships">
          {{ t("common.confirm") }}
        </Button>
      </template>
    </Modal>
  </AppLayout>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useAuthStore } from "@/modules/auth/ui/stores/authStore";
import { useHotelStore } from "@/modules/hotels/ui/stores/hotelStore";
import { authService } from "@/modules/auth/data/services/authService";
import AppLayout from "@/shared/layouts/AppLayout.vue";
import Alert from "@/shared/components/Alert.vue";
import Badge from "@/shared/components/Badge.vue";
import Button from "@/shared/components/Button.vue";
import FormGroup from "@/shared/components/FormGroup.vue";
import Input from "@/shared/components/Input.vue";
import Shimmer from "@/shared/components/Shimmer.vue";
import Modal from "@/shared/components/Modal.vue";
import type { User } from "@/core/utils/types";

const authStore = useAuthStore();
const hotelStore = useHotelStore();
const { t, locale } = useI18n();

const users = ref<User[]>([]);
const loading = ref(false);
const fetchError = ref("");
const actionSuccess = ref("");
const isCreateModalOpen = ref(false);
const createError = ref("");
const createSuccess = ref("");
const saving = ref(false);

// Hotel membership modal
const isMembershipModalOpen = ref(false);
const managingUser = ref<User | null>(null);
const membershipForm = ref<string[]>([]);
const membershipError = ref("");
const membershipSuccess = ref("");
const transferredHotels = ref<any[]>([]);
const savingMembership = ref(false);

// Edit user modal
const isEditModalOpen = ref(false);
const editing = ref(false);
const editError = ref("");
const editForm = ref({
  id: "",
  fullName: "",
  username: "",
  isAdmin: false,
  status: "ENABLED" as "ENABLED" | "DISABLED" | "DELETED",
});

// Password modal
const isPasswordModalOpen = ref(false);
const updatingPassword = ref(false);
const passwordError = ref("");
const passwordTarget = ref<User | null>(null);
const passwordForm = ref({
  newPassword: "",
  confirmPassword: "",
});

// Soft delete modal
const isDeleteModalOpen = ref(false);
const deleting = ref(false);
const deleteError = ref("");
const deletingUser = ref<User | null>(null);
const deletingUserOwnedHotels = ref<any[]>([]);

// Actions dropdown menu
const openMenuId = ref<string | null>(null);
const menuUser = ref<User | null>(null);
const menuPosition = ref({ top: 0, left: 0 });

function toggleMenu(event: MouseEvent, user: User) {
  if (openMenuId.value === user.id) {
    closeMenu();
    return;
  }
  const btn = event.currentTarget as HTMLElement;
  const rect = btn.getBoundingClientRect();
  const menuWidth = 192; // w-48
  const menuHeight = 168; // approximate height for 4 items + separator

  let top = rect.bottom + 4;
  let left = rect.right - menuWidth;

  if (left < 8) left = 8;
  if (left + menuWidth > window.innerWidth - 8) left = window.innerWidth - menuWidth - 8;
  if (top + menuHeight > window.innerHeight - 8) top = rect.top - menuHeight - 4;

  menuPosition.value = { top, left };
  menuUser.value = user;
  openMenuId.value = user.id;
}

function closeMenu() {
  openMenuId.value = null;
  menuUser.value = null;
}

function handleMenuEdit() { if (menuUser.value) { openEditModal(menuUser.value); closeMenu(); } }
function handleMenuPassword() { if (menuUser.value) { openPasswordModal(menuUser.value); closeMenu(); } }
function handleMenuManageHotels() { if (menuUser.value) { openMembershipModal(menuUser.value); closeMenu(); } }
function handleMenuToggleStatus() { if (menuUser.value) { toggleUserStatus(menuUser.value); closeMenu(); } }
function handleMenuDelete() { if (menuUser.value) { openDeleteModal(menuUser.value); closeMenu(); } }

const form = ref({
  fullName: "",
  username: "",
  password: "",
  confirmPassword: "",
  isAdmin: false,
  selectedHotelIds: [] as string[],
});

function resetForm() {
  form.value = {
    fullName: "",
    username: "",
    password: "",
    confirmPassword: "",
    isAdmin: false,
    selectedHotelIds: [],
  };
  createError.value = "";
  createSuccess.value = "";
}

function isCurrentUser(user: User) {
  return authStore.user?.id === user.id;
}

function isCurrentUserById(userId: string) {
  return authStore.user?.id === userId;
}

function statusBadgeVariant(status: User["status"]): "success" | "warning" | "danger" {
  if (status === "ENABLED") return "success";
  if (status === "DISABLED") return "warning";
  return "danger";
}

function isLastActiveAdmin(user: User) {
  if (!user.is_admin || user.status !== "ENABLED" || user.deleted_at) return false;

  const activeAdmins = users.value.filter(
    (u) => u.is_admin && u.status === "ENABLED" && !u.deleted_at,
  );

  return activeAdmins.length === 1 && activeAdmins[0]?.id === user.id;
}

const isLastActiveAdminEditing = computed(() => {
  const current = users.value.find((u) => u.id === editForm.value.id);
  if (!current) return false;
  return isLastActiveAdmin(current);
});

function openCreateModal() {
  resetForm();
  isCreateModalOpen.value = true;
}

function closeCreateModal() {
  isCreateModalOpen.value = false;
  resetForm();
}

function isOwnerOf(hotelId: string): boolean {
  return (
    managingUser.value?.hotel_memberships?.some(
      (m) => m.hotel_id === hotelId && m.role === "owner",
    ) ?? false
  );
}

function openMembershipModal(user: User) {
  managingUser.value = user;
  membershipError.value = "";
  membershipForm.value = (user.hotel_memberships ?? []).map((m) => m.hotel_id);
  isMembershipModalOpen.value = true;
}

async function saveHotelMemberships() {
  if (!managingUser.value) return;
  membershipError.value = "";
  membershipSuccess.value = "";
  transferredHotels.value = [];
  savingMembership.value = true;
  try {
    const token = authStore.token ?? "";
    const result = await authService.updateUserHotels(
      managingUser.value.id,
      membershipForm.value,
      token,
    );
    
    // Check if any hotels were transferred
    if (result.transferredHotels && result.transferredHotels.length > 0) {
      transferredHotels.value = result.transferredHotels;
      const hotelNames = result.transferredHotels
        .map((h: any) => h.name)
        .join(", ");
      membershipSuccess.value = t(
        "users.hotelTransferSuccess",
        { hotels: hotelNames },
      );
    }
    
    isMembershipModalOpen.value = false;
    await loadUsers();
    if (membershipSuccess.value) {
      actionSuccess.value = membershipSuccess.value;
    }
  } catch (err) {
    membershipError.value =
      err instanceof Error ? err.message : t("users.errors.updateHotels");
  } finally {
    savingMembership.value = false;
  }
}

async function loadUsers() {
  loading.value = true;
  fetchError.value = "";
  try {
    const token = authStore.token ?? "";
    const data = await authService.listUsers(token);
    users.value = data.users;
  } catch (err) {
    fetchError.value = err instanceof Error ? err.message : t("users.errors.fetchUsers");
  } finally {
    loading.value = false;
  }
}

function openEditModal(user: User) {
  editError.value = "";
  editForm.value = {
    id: user.id,
    fullName: user.full_name,
    username: user.username,
    isAdmin: user.is_admin,
    status: user.status,
  };
  isEditModalOpen.value = true;
}

function closeEditModal() {
  isEditModalOpen.value = false;
  editError.value = "";
}

async function saveUserEdit() {
  if (!editForm.value.id || editing.value) return;
  if (!editForm.value.fullName) return;

  editing.value = true;
  editError.value = "";

  try {
    const token = authStore.token ?? "";
    await authService.updateUser(
      editForm.value.id,
      {
        fullName: editForm.value.fullName,
        isAdmin: editForm.value.isAdmin,
        status: editForm.value.status,
      },
      token,
    );

    closeEditModal();
    actionSuccess.value = t("users.updateSuccess");
    await loadUsers();
  } catch (err) {
    editError.value = err instanceof Error ? err.message : t("users.errors.updateUser");
  } finally {
    editing.value = false;
  }
}

function openPasswordModal(user: User) {
  passwordTarget.value = user;
  passwordError.value = "";
  passwordForm.value = { newPassword: "", confirmPassword: "" };
  isPasswordModalOpen.value = true;
}

function closePasswordModal() {
  isPasswordModalOpen.value = false;
  passwordTarget.value = null;
  passwordError.value = "";
  passwordForm.value = { newPassword: "", confirmPassword: "" };
}

async function saveUserPassword() {
  if (!passwordTarget.value || updatingPassword.value) return;

  if (passwordForm.value.newPassword.length < 6) {
    passwordError.value = t("users.errors.passwordTooShort");
    return;
  }

  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    passwordError.value = t("users.errors.passwordMismatch");
    return;
  }

  updatingPassword.value = true;
  passwordError.value = "";

  try {
    const token = authStore.token ?? "";
    await authService.updateUserPassword(
      passwordTarget.value.id,
      passwordForm.value.newPassword,
      token,
    );
    closePasswordModal();
    actionSuccess.value = t("users.passwordSuccess");
  } catch (err) {
    passwordError.value =
      err instanceof Error ? err.message : t("users.errors.updatePassword");
  } finally {
    updatingPassword.value = false;
  }
}

function openDeleteModal(user: User) {
  deleteError.value = "";
  deletingUser.value = user;
  
  // Find hotels where this user is the owner
  deletingUserOwnedHotels.value = hotelStore.hotels.filter(
    (hotel) =>
      user.hotel_memberships?.some(
        (m) => m.hotel_id === hotel.id && m.role === "owner",
      ) ?? false,
  );
  
  isDeleteModalOpen.value = true;
}

function closeDeleteModal() {
  isDeleteModalOpen.value = false;
  deleteError.value = "";
  deletingUser.value = null;
  deletingUserOwnedHotels.value = [];
}

async function confirmSoftDelete() {
  if (!deletingUser.value || deleting.value) return;

  deleting.value = true;
  deleteError.value = "";

  try {
    const token = authStore.token ?? "";
    const result = await authService.softDeleteUser(deletingUser.value.id, token);
    closeDeleteModal();
    
    // Check if any hotels were transferred
    if (result.transferredHotels && result.transferredHotels.length > 0) {
      const hotelNames = result.transferredHotels
        .map((h: any) => h.name)
        .join(", ");
      actionSuccess.value = t(
        "users.hotelTransferSuccess",
        { hotels: hotelNames },
      );
    } else {
      actionSuccess.value = t("users.deleteSuccess");
    }
    
    await loadUsers();
  } catch (err) {
    deleteError.value = err instanceof Error ? err.message : t("users.errors.deleteUser");
  } finally {
    deleting.value = false;
  }
}

async function toggleUserStatus(user: User) {
  const token = authStore.token ?? "";
  try {
    const updated = await authService.toggleUserStatus(user.id, token);
    actionSuccess.value = t("users.statusToggleSuccess", { 
      name: user.full_name,
      status: updated.status === "ENABLED" ? t("users.statusValues.ENABLED") : t("users.statusValues.DISABLED")
    });
    await loadUsers();
  } catch (err) {
    actionSuccess.value = "";
    fetchError.value = err instanceof Error ? err.message : t("users.errors.toggleStatus");
  }
}

async function handleCreate() {
  if (saving.value) return;

  if (form.value.password !== form.value.confirmPassword) {
    createError.value = t("auth.register.passwordMismatch");
    return;
  }
  if (form.value.selectedHotelIds.length === 0) {
    createError.value = t("users.errors.selectHotelRequired");
    return;
  }
  if (!form.value.fullName || !form.value.username || !form.value.password) return;

  saving.value = true;
  createError.value = "";
  createSuccess.value = "";
  try {
    const result = await authStore.register(
      form.value.username,
      form.value.password,
      form.value.fullName,
      form.value.isAdmin,
    );

    if (result?.user?.id) {
      const token = authStore.token ?? "";
      await authService.updateUserHotels(
        result.user.id,
        form.value.selectedHotelIds,
        token,
      );
    }

    await loadUsers();
    closeCreateModal();
  } catch (err) {
    createError.value = err instanceof Error ? err.message : t("users.errors.createUser");
  } finally {
    saving.value = false;
  }
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString(locale.value);
}

onMounted(async () => {
  await Promise.all([loadUsers(), hotelStore.fetchHotels()]);
});
</script>
