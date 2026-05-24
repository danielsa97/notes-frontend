<template>
  <teleport to="body">
    <transition name="fade">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-[70] bg-black/90 flex flex-col"
        @click.self="emit('close')"
      >
        <div class="flex items-center justify-between px-4 py-3 text-white/90">
          <p class="text-sm font-medium">
            {{ t("common.imagePosition", { current: currentIndex + 1, total: images.length }) }}
          </p>
          <button
            type="button"
            class="p-2 rounded-full bg-white/10 hover:bg-white/20 transition"
            :aria-label="t('common.close')"
            @click="emit('close')"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <div class="flex-1 relative overflow-hidden flex items-center justify-center px-2">
          <img
            v-if="currentImage"
            ref="imageRef"
            :src="currentImage"
            :alt="alt"
            class="max-w-full max-h-full object-contain select-none transition-transform duration-200"
            :style="{ transform: `scale(${zoom})`, transformOrigin }"
            draggable="false"
            @pointerdown="handleImagePointerDown"
          />

          <button
            v-if="images.length > 1"
            type="button"
            class="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-2 sm:p-3 rounded-full bg-white/15 hover:bg-white/25 text-white transition"
            :aria-label="t('common.previous')"
            @click="prev"
          >
            <ChevronLeft class="w-5 h-5" />
          </button>
          <button
            v-if="images.length > 1"
            type="button"
            class="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-2 sm:p-3 rounded-full bg-white/15 hover:bg-white/25 text-white transition"
            :aria-label="t('common.next')"
            @click="next"
          >
            <ChevronRight class="w-5 h-5" />
          </button>
        </div>

        <div class="px-3 pb-4 pt-2">
          <div class="mx-auto w-full max-w-sm bg-black/40 border border-white/20 rounded-xl p-2.5 flex items-center justify-center gap-2">
            <button
              type="button"
              class="px-3 py-2 rounded-lg bg-white/10 text-white text-sm font-medium hover:bg-white/20 transition"
              :aria-label="t('common.zoomOut')"
              @click="zoomOut"
            >
              -
            </button>
            <button
              type="button"
              class="px-3 py-2 rounded-lg bg-white/10 text-white text-sm font-medium hover:bg-white/20 transition"
              :aria-label="t('common.resetZoom')"
              @click="resetZoom"
            >
              {{ Math.round(zoom * 100) }}%
            </button>
            <button
              type="button"
              class="px-3 py-2 rounded-lg bg-white/10 text-white text-sm font-medium hover:bg-white/20 transition"
              :aria-label="t('common.zoomIn')"
              @click="zoomIn"
            >
              +
            </button>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { ChevronLeft, ChevronRight, X } from "lucide-vue-next";

interface Props {
  isOpen: boolean;
  images: string[];
  startIndex?: number;
  alt?: string;
}

const props = withDefaults(defineProps<Props>(), {
  startIndex: 0,
  alt: "",
});

const emit = defineEmits<{
  close: [];
}>();

const { t } = useI18n();

const currentIndex = ref(0);
const zoom = ref(1);
const transformOrigin = ref("50% 50%");
const imageRef = ref<HTMLImageElement | null>(null);

const currentImage = computed(() => props.images[currentIndex.value] || "");

function clampIndex(index: number) {
  if (!props.images.length) return 0;
  if (index < 0) return props.images.length - 1;
  if (index >= props.images.length) return 0;
  return index;
}

function next() {
  currentIndex.value = clampIndex(currentIndex.value + 1);
  zoom.value = 1;
  transformOrigin.value = "50% 50%";
}

function prev() {
  currentIndex.value = clampIndex(currentIndex.value - 1);
  zoom.value = 1;
  transformOrigin.value = "50% 50%";
}

function zoomIn() {
  zoom.value = Math.min(zoom.value + 0.25, 3);
}

function zoomOut() {
  zoom.value = Math.max(zoom.value - 0.25, 1);
}

function resetZoom() {
  zoom.value = 1;
  transformOrigin.value = "50% 50%";
}

function setFocusPoint(clientX: number, clientY: number) {
  const imageEl = imageRef.value;
  if (!imageEl) return;

  const rect = imageEl.getBoundingClientRect();
  if (!rect.width || !rect.height) return;

  const x = Math.min(Math.max(clientX - rect.left, 0), rect.width);
  const y = Math.min(Math.max(clientY - rect.top, 0), rect.height);
  const xPercent = (x / rect.width) * 100;
  const yPercent = (y / rect.height) * 100;

  transformOrigin.value = `${xPercent}% ${yPercent}%`;
}

function handleImagePointerDown(event: PointerEvent) {
  setFocusPoint(event.clientX, event.clientY);

  if (zoom.value === 1) {
    zoom.value = 2;
  }
}

watch(
  () => props.isOpen,
  (open) => {
    if (!open) return;
    currentIndex.value = clampIndex(props.startIndex);
    zoom.value = 1;
    transformOrigin.value = "50% 50%";
  },
);
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
