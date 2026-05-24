<template>
  <div class="relative min-h-[100svh] bg-gradient-to-b from-slate-100 via-blue-50 to-cyan-50">
    <div class="pointer-events-none absolute inset-x-0 top-0 h-40 bg-white/30 blur-2xl"></div>

    <div class="relative flex min-h-[100svh] items-center justify-center px-4 py-8 sm:px-6 sm:py-12">
      <div class="w-full max-w-md rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_12px_34px_rgba(15,23,42,0.10)] sm:p-7">
        <div class="mb-5 flex justify-center sm:mb-6">
          <img
            src="@/assets/logo.png"
            :alt="t('common.appName')"
            class="h-14 w-auto sm:h-16"
          />
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

          <Button type="submit" :loading="loading" class="w-full py-3 text-base">
            {{ t("auth.login.submit") }}
          </Button>
        </FormGroup>
      </div>
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
