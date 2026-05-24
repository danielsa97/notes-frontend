<template>
  <div class="space-y-2">
    <div v-if="isMobile" class="grid grid-cols-1 sm:grid-cols-3 gap-2">
      <Button
        type="button"
        variant="secondary"
        :disabled="disabled || maxFiles <= 0"
        @click="openCameraBack"
      >
        {{ t("hotels.imagePicker.cameraBack") }}
      </Button>
      <Button
        type="button"
        variant="secondary"
        :disabled="disabled || maxFiles <= 0"
        @click="openCameraFront"
      >
        {{ t("hotels.imagePicker.cameraFront") }}
      </Button>
      <Button
        type="button"
        variant="ghost"
        :disabled="disabled || maxFiles <= 0"
        @click="openGallery"
      >
        {{ t("hotels.imagePicker.gallery") }}
      </Button>
    </div>

    <div v-else>
      <Button
        type="button"
        variant="secondary"
        :disabled="disabled || maxFiles <= 0"
        @click="openGallery"
      >
        {{ t("hotels.imagePicker.gallery") }}
      </Button>
    </div>

    <p class="text-xs text-gray-500">{{ t("hotels.imagePicker.hint") }}</p>

    <input
      ref="galleryInput"
      type="file"
      class="hidden"
      accept="image/*"
      :multiple="maxFiles > 1"
      @change="onInputChange"
    />
    <input
      ref="cameraBackInput"
      type="file"
      class="hidden"
      accept="image/*"
      capture="environment"
      @change="onInputChange"
    />
    <input
      ref="cameraFrontInput"
      type="file"
      class="hidden"
      accept="image/*"
      capture="user"
      @change="onInputChange"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import Button from "@/shared/components/Button.vue";

interface Props {
  maxFiles?: number;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  maxFiles: 1,
  disabled: false,
});

const emit = defineEmits<{
  (e: "files-selected", files: File[]): void;
}>();

const { t } = useI18n();

const galleryInput = ref<HTMLInputElement | null>(null);
const cameraBackInput = ref<HTMLInputElement | null>(null);
const cameraFrontInput = ref<HTMLInputElement | null>(null);

const isMobile = computed(() => {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  const mobileUa = /Android|iPhone|iPad|iPod|IEMobile|Opera Mini/i.test(ua);
  const coarsePointer =
    typeof window !== "undefined" && window.matchMedia
      ? window.matchMedia("(pointer: coarse)").matches
      : false;
  return mobileUa || coarsePointer;
});

function openGallery() {
  galleryInput.value?.click();
}

function openCameraBack() {
  cameraBackInput.value?.click();
}

function openCameraFront() {
  cameraFrontInput.value?.click();
}

function onInputChange(event: Event) {
  const input = event.target as HTMLInputElement;
  const files = Array.from(input.files || []);
  emit("files-selected", files);
  input.value = "";
}
</script>

<style scoped></style>
