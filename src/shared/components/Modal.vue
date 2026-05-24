<template>
  <teleport to="body">
    <transition name="fade">
      <div
        v-if="isOpen"
        class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      >
        <transition name="scale">
          <div class="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div
              class="flex items-center justify-between p-6 border-b border-gray-200"
            >
              <h2 class="text-lg font-bold text-gray-900">{{ title }}</h2>
              <button
                @click="emit('close')"
                class="text-gray-500 hover:text-gray-700 transition"
              >
                ✕
              </button>
            </div>

            <div class="p-6">
              <slot></slot>
            </div>

            <div class="flex gap-3 p-6 border-t border-gray-200">
              <slot name="footer">
                <Button variant="ghost" @click="emit('close')">
                  {{ t("common.cancel") }}
                </Button>
                <Button @click="emit('confirm')">{{ t("common.confirm") }}</Button>
              </slot>
            </div>
          </div>
        </transition>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import Button from "./Button.vue";

interface Props {
  isOpen: boolean;
  title: string;
}

withDefaults(defineProps<Props>(), {
  isOpen: false,
});

const emit = defineEmits<{
  close: [];
  confirm: [];
}>();

const { t } = useI18n();
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.scale-enter-active,
.scale-leave-active {
  transition: transform 0.3s ease;
}

.scale-enter-from,
.scale-leave-to {
  transform: scale(0.95);
}
</style>
