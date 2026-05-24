<template>
  <div class="shimmer" :class="rounded ? `rounded-${rounded}` : 'rounded'" :style="style" />
</template>

<script setup lang="ts">
import { computed } from "vue";

interface Props {
  width?: string;
  height?: string;
  rounded?: "none" | "sm" | "md" | "lg" | "xl" | "full";
}

const props = withDefaults(defineProps<Props>(), {
  width: "100%",
  height: "1rem",
  rounded: "md",
});

const style = computed(() => ({
  width: props.width,
  height: props.height,
}));
</script>

<style scoped>
.shimmer {
  background: linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%);
  background-size: 400% 100%;
  animation: shimmer 1.4s ease-in-out infinite;
  display: block;
}

@keyframes shimmer {
  0% {
    background-position: 100% 0;
  }
  100% {
    background-position: -100% 0;
  }
}
</style>
