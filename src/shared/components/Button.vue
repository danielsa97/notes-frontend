<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="[
      'px-4 py-2 rounded-lg font-medium transition disabled:opacity-50',
      variantClasses,
      sizeClasses,
      { 'cursor-not-allowed': disabled || loading },
    ]"
    @click="$emit('click')"
  >
    <span v-if="!loading">
      <slot></slot>
    </span>
    <span v-else class="inline-flex items-center gap-2">
      <svg
        class="animate-spin h-4 w-4"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        />
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
        />
      </svg>
      {{ t("button.loading") }}
    </span>
  </button>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

export type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

interface Props {
  type?: "button" | "submit" | "reset";
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  type: "button",
  variant: "primary",
  size: "md",
  disabled: false,
  loading: false,
});

const { t } = useI18n();

defineEmits<{
  click: [];
}>();

const variantClasses = computed(() => {
  switch (props.variant) {
    case "primary":
      return "bg-blue-600 text-white hover:bg-blue-700";
    case "secondary":
      return "bg-gray-200 text-gray-900 hover:bg-gray-300";
    case "danger":
      return "bg-red-600 text-white hover:bg-red-700";
    case "ghost":
      return "bg-transparent text-gray-600 hover:bg-gray-100";
    default:
      return "bg-blue-600 text-white hover:bg-blue-700";
  }
});

const sizeClasses = computed(() => {
  switch (props.size) {
    case "sm":
      return "px-3 py-1 text-sm";
    case "lg":
      return "px-6 py-3 text-lg";
    default:
      return "px-4 py-2";
  }
});
</script>

<style scoped></style>
