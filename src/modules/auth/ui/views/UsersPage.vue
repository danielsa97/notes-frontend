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

      <!-- Shimmer skeleton while loading -->
      <div v-if="loading" class="bg-white rounded-lg shadow overflow-hidden">
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

      <div v-else class="bg-white rounded-lg shadow overflow-hidden">
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
                {{ t("users.table.hotels") }}
              </th>
              <th class="text-left px-6 py-3 font-medium text-gray-600">
                {{ t("users.table.createdAt") }}
              </th>
              <th class="px-6 py-3"></th>
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
              <td class="px-6 py-4 text-gray-600 text-sm">
                {{ (user.hotel_memberships || []).length }}
                {{ t("users.hotelCount") }}
              </td>
              <td class="px-6 py-4 text-gray-500">
                {{ formatDate(user.created_at) }}
              </td>
              <td class="px-6 py-4">
                <button
                  @click="openMembershipModal(user)"
                  class="text-sm text-blue-600 hover:underline whitespace-nowrap"
                >
                  {{ t("users.manageHotels") }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-else class="p-12 text-center">
          <p class="text-gray-600 text-lg">{{ t("users.empty") }}</p>
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
    </Modal>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
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
import Loading from "@/shared/components/Loading.vue";
import Shimmer from "@/shared/components/Shimmer.vue";
import Modal from "@/shared/components/Modal.vue";
import type { User } from "@/core/utils/types";

const authStore = useAuthStore();
const hotelStore = useHotelStore();
const { t, locale } = useI18n();

const users = ref<User[]>([]);
const loading = ref(false);
const fetchError = ref("");
const isCreateModalOpen = ref(false);
const createError = ref("");
const createSuccess = ref("");
const saving = ref(false);

// Hotel membership modal
const isMembershipModalOpen = ref(false);
const managingUser = ref<User | null>(null);
const membershipForm = ref<string[]>([]);
const membershipError = ref("");

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
  try {
    const token = authStore.token ?? "";
    await authService.updateUserHotels(
      managingUser.value.id,
      membershipForm.value,
      token,
    );
    isMembershipModalOpen.value = false;
    await loadUsers();
  } catch (err) {
    membershipError.value =
      err instanceof Error ? err.message : t("users.errors.updateHotels");
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
