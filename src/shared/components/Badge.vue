<template>
  <span
    :class="[
      'inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium',
      variantClasses,
    ]"
  >
    <slot></slot>
  </span>
</template>

<script setup lang="ts">
import { computed } from "vue";

export type BadgeVariant = "primary" | "success" | "warning" | "danger" | "info" | "secondary";

interface Props {
  variant?: BadgeVariant;
}

const props = withDefaults(defineProps<Props>(), {
  variant: "primary",
});

const variantClasses = computed(() => {
  switch (props.variant) {
    case "success":
      return "bg-green-100 text-green-800";
    case "warning":
      return "bg-yellow-100 text-yellow-800";
    case "danger":
      return "bg-red-100 text-red-800";
    case "info":
      return "bg-blue-100 text-blue-800";
    case "secondary":
      return "bg-gray-100 text-gray-600";
    default:
      return "bg-blue-100 text-blue-800";
  }
});
</script>

<style scoped></style>
