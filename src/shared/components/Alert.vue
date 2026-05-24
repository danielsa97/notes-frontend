<template>
  <div
    v-if="isVisible"
    :class="['rounded-lg p-4 flex items-start gap-3 mb-4', colorClasses]"
  >
    <component :is="icon" class="w-5 h-5 mt-0.5 shrink-0" />
    <div class="flex-1">
      <p class="font-medium">{{ title }}</p>
      <p v-if="message" class="text-sm mt-1">{{ message }}</p>
    </div>
    <button
      @click="isVisible = false"
      class="opacity-60 hover:opacity-100 transition"
    >
      <X class="w-4 h-4" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from "lucide-vue-next";

export type AlertType = "success" | "error" | "warning" | "info";

interface Props {
  type?: AlertType;
  title: string;
  message?: string;
  duration?: number;
}

const props = withDefaults(defineProps<Props>(), {
  type: "info",
  duration: 5000,
});

const isVisible = ref(true);

const { icon, colorClasses } = computed(() => {
  switch (props.type) {
    case "success":
      return {
        icon: CheckCircle2,
        colorClasses: "bg-green-50 text-green-800 border border-green-200",
      };
    case "error":
      return {
        icon: XCircle,
        colorClasses: "bg-red-50 text-red-800 border border-red-200",
      };
    case "warning":
      return {
        icon: AlertTriangle,
        colorClasses: "bg-yellow-50 text-yellow-800 border border-yellow-200",
      };
    default:
      return {
        icon: Info,
        colorClasses: "bg-blue-50 text-blue-800 border border-blue-200",
      };
  }
}).value;

if (props.duration) {
  setTimeout(() => {
    isVisible.value = false;
  }, props.duration);
}
</script>

<style scoped></style>
