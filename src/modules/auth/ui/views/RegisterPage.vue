<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 px-4"
  >
    <div class="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
      <div class="text-center mb-8">
        <div class="flex justify-end mb-2">
          <LanguageSwitcher />
        </div>
        <h1 class="text-2xl font-bold text-gray-900">
          {{ t("auth.register.title") }}
        </h1>
        <p class="text-gray-600 text-sm">{{ t("auth.register.subtitle") }}</p>
      </div>

      <Alert
        v-if="error"
        type="error"
        :title="t('auth.register.errorTitle')"
        :message="error"
      />

      <Alert
        v-if="successMessage"
        type="success"
        :title="t('auth.register.successTitle')"
        :message="successMessage"
      />

      <FormGroup @submit="handleRegister" class="space-y-4">
        <Input
          v-model="fullName"
          type="text"
          :label="t('auth.register.fullName')"
          :placeholder="t('auth.register.fullNamePlaceholder')"
          required
        />

        <Input
          v-model="username"
          type="text"
          :label="t('auth.register.username')"
          :placeholder="t('auth.register.usernamePlaceholder')"
          required
        />

        <Input
          v-model="password"
          type="password"
          :label="t('auth.register.password')"
          placeholder="••••••••"
          required
        />

        <Input
          v-model="confirmPassword"
          type="password"
          :label="t('auth.register.confirmPassword')"
          placeholder="••••••••"
          required
          :error="password !== confirmPassword ? t('auth.register.passwordMismatch') : ''"
        />

        <label class="flex items-center gap-2 text-sm text-gray-700">
          <input v-model="isAdminUser" type="checkbox" class="rounded border-gray-300" />
          {{ t("auth.register.adminCheckbox") }}
        </label>

        <Button
          type="submit"
          :loading="loading"
          :disabled="password !== confirmPassword"
          class="w-full"
        >
          {{ t("auth.register.submit") }}
        </Button>
      </FormGroup>

      <div class="mt-6 text-center">
        <router-link to="/dashboard" class="text-blue-600 hover:underline text-sm">
          {{ t("auth.register.backToDashboard") }}
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { useAuthStore } from "@/modules/auth/ui/stores/authStore";
import FormGroup from "@/shared/components/FormGroup.vue";
import Input from "@/shared/components/Input.vue";
import Button from "@/shared/components/Button.vue";
import Alert from "@/shared/components/Alert.vue";
import LanguageSwitcher from "@/shared/components/LanguageSwitcher.vue";

const authStore = useAuthStore();
const { t } = useI18n();

const fullName = ref("");
const username = ref("");
const password = ref("");
const confirmPassword = ref("");
const isAdminUser = ref(false);
const loading = ref(false);
const error = ref("");
const successMessage = ref("");

async function handleRegister() {
  if (password.value !== confirmPassword.value) {
    error.value = t("auth.register.passwordMismatch");
    return;
  }

  loading.value = true;
  error.value = "";
  successMessage.value = "";

  if (!authStore.isAdmin) {
    error.value = t("auth.register.adminOnlyError");
    loading.value = false;
    return;
  }

  try {
    await authStore.register(
      username.value,
      password.value,
      fullName.value,
      isAdminUser.value,
    );
    successMessage.value = t("auth.register.successMessage");
    fullName.value = "";
    username.value = "";
    password.value = "";
    confirmPassword.value = "";
    isAdminUser.value = false;
  } catch (err) {
    error.value =
      err instanceof Error ? err.message : t("auth.register.errorFallback");
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped></style>
