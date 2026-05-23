<template>
  <div class="w-full">
    <label v-if="label" class="block text-sm font-medium text-gray-700 mb-2">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>
    <input
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :required="required"
      :disabled="disabled"
      :class="[
        'w-full px-4 py-2 border rounded-lg transition',
        'focus:outline-none focus:ring-2 focus:ring-blue-500',
        'disabled:bg-gray-100 disabled:text-gray-500',
        error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300',
      ]"
      @input="
        $emit('update:modelValue', ($event.target as HTMLInputElement).value)
      "
    />
    <p v-if="error" class="mt-1 text-sm text-red-500">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
interface Props {
  modelValue: string;
  type?: string;
  label?: string;
  placeholder?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
}

withDefaults(defineProps<Props>(), {
  type: "text",
  disabled: false,
  required: false,
});

defineEmits<{
  "update:modelValue": [value: string];
}>();
</script>

<style scoped></style>
