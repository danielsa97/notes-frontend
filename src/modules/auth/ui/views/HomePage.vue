<template>
  <div
    class="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 px-4"
  >
    <div class="w-full max-w-4xl flex justify-end mb-6">
      <LanguageSwitcher />
    </div>
    <div class="text-center">
      <h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
        {{ t("home.title") }}
      </h1>
      <p class="text-xl text-gray-600 mb-8">
        {{ t("home.subtitle") }}
      </p>

      <div class="flex gap-4 justify-center">
        <router-link
          to="/login"
          class="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          {{ t("home.loginCta") }}
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import LanguageSwitcher from "@/shared/components/LanguageSwitcher.vue";

const { t } = useI18n();
</script>

<style scoped></style>
