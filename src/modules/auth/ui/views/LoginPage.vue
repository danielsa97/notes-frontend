<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 px-4"
  >
    <div class="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
      <div class="text-center mb-8">
        <div class="flex justify-end mb-2">
          <LanguageSwitcher />
        </div>
        <img
          src="@/assets/logo.png"
          :alt="t('common.appName')"
          class="mx-auto mb-4 h-16 w-auto"
        />
        <h1 class="text-2xl font-bold text-gray-900">{{ t("auth.login.title") }}</h1>
        <p class="text-gray-600 text-sm">{{ t("auth.login.subtitle") }}</p>
      </div>

      <Alert
        v-if="error"
        type="error"
        :title="t('auth.login.errorTitle')"
        :message="error"
      />

      <FormGroup @submit="handleLogin" class="space-y-4">
        <Input
          v-model="username"
          type="text"
          :label="t('auth.login.username')"
          :placeholder="t('auth.login.usernamePlaceholder')"
          required
        />

        <Input
          v-model="password"
          type="password"
          :label="t('auth.login.password')"
          placeholder="••••••••"
          required
        />

        <Button type="submit" :loading="loading" class="w-full">
          {{ t("auth.login.submit") }}
        </Button>
      </FormGroup>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useAuthStore } from "@/modules/auth/ui/stores/authStore";
import FormGroup from "@/shared/components/FormGroup.vue";
import Input from "@/shared/components/Input.vue";
import Button from "@/shared/components/Button.vue";
import Alert from "@/shared/components/Alert.vue";
import LanguageSwitcher from "@/shared/components/LanguageSwitcher.vue";

const router = useRouter();
const authStore = useAuthStore();
const { t } = useI18n();

const username = ref("");
const password = ref("");
const loading = ref(false);
const error = ref("");

async function handleLogin() {
  loading.value = true;
  error.value = "";
  try {
    await authStore.login(username.value, password.value);
    router.push("/dashboard");
  } catch (err) {
    error.value =
      err instanceof Error ? err.message : t("auth.login.errorFallback");
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped></style>
