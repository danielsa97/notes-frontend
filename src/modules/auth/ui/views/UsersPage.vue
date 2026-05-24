<template>
  <AppLayout>
    <div class="max-w-7xl mx-auto px-4 py-8">
      <div class="flex justify-between items-center mb-8">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">{{ t("users.title") }}</h1>
          <p class="text-gray-600">{{ t("users.subtitle") }}</p>
        </div>
        <Button @click="openModal">{{ t("users.add") }}</Button>
      </div>

      <Alert
        v-if="fetchError"
        type="error"
        :title="t('users.errorTitle')"
        :message="fetchError"
      />

      <Loading v-if="loading" :text="t('users.loading')" />

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
                {{ t("users.table.createdAt") }}
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
              <td class="px-6 py-4 text-gray-500">
                {{ formatDate(user.created_at) }}
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
      :isOpen="isModalOpen"
      :title="t('users.modalTitle')"
      @close="closeModal"
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
      </FormGroup>
    </Modal>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useAuthStore } from "@/modules/auth/ui/stores/authStore";
import { authService } from "@/modules/auth/data/services/authService";
import AppLayout from "@/shared/layouts/AppLayout.vue";
import Alert from "@/shared/components/Alert.vue";
import Badge from "@/shared/components/Badge.vue";
import Button from "@/shared/components/Button.vue";
import FormGroup from "@/shared/components/FormGroup.vue";
import Input from "@/shared/components/Input.vue";
import Loading from "@/shared/components/Loading.vue";
import Modal from "@/shared/components/Modal.vue";
import type { User } from "@/core/utils/types";

const authStore = useAuthStore();
const { t, locale } = useI18n();

const users = ref<User[]>([]);
const loading = ref(false);
const fetchError = ref("");
const isModalOpen = ref(false);
const createError = ref("");
const createSuccess = ref("");
const saving = ref(false);

const form = ref({
  fullName: "",
  username: "",
  password: "",
  confirmPassword: "",
  isAdmin: false,
});

function resetForm() {
  form.value = { fullName: "", username: "", password: "", confirmPassword: "", isAdmin: false };
  createError.value = "";
  createSuccess.value = "";
}

function openModal() {
  resetForm();
  isModalOpen.value = true;
}

function closeModal() {
  isModalOpen.value = false;
  resetForm();
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
  if (form.value.password !== form.value.confirmPassword) {
    createError.value = t("auth.register.passwordMismatch");
    return;
  }
  if (!form.value.fullName || !form.value.username || !form.value.password) return;

  saving.value = true;
  createError.value = "";
  createSuccess.value = "";
  try {
    const token = authStore.token ?? "";
    await authStore.register(
      form.value.username,
      form.value.password,
      form.value.fullName,
      form.value.isAdmin,
    );
    createSuccess.value = t("auth.register.successMessage");
    await loadUsers();
    resetForm();
  } catch (err) {
    createError.value = err instanceof Error ? err.message : t("users.errors.createUser");
  } finally {
    saving.value = false;
  }
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString(locale.value);
}

onMounted(loadUsers);
</script>
