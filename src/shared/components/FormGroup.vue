<template>
  <form @submit.prevent="emit('submit')" class="space-y-6">
    <slot></slot>
  </form>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  submit: [];
}>();
</script>

<style scoped></style>
