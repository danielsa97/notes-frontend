<template>
  <label class="inline-flex items-center gap-2 text-xs text-gray-600">
    <span>{{ t("language.label") }}</span>
    <select
      :value="locale"
      class="border border-gray-300 rounded-md px-2 py-1 bg-white text-gray-700"
      @change="onChange"
    >
      <option value="pt-BR">{{ t("language.ptBR") }}</option>
      <option value="en-US">{{ t("language.enUS") }}</option>
    </select>
  </label>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { setAppLocale, type AppLocale } from "@/core/i18n";

const { t, locale } = useI18n();

const currentLocale = computed(() => locale.value as AppLocale);

function onChange(event: Event) {
  const target = event.target as HTMLSelectElement;
  const nextLocale = target.value as AppLocale;
  if (nextLocale === currentLocale.value) return;
  setAppLocale(nextLocale);
}
</script>
