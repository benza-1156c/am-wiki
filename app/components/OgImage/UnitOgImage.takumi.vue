<template>
  <div class="w-full h-full flex items-center justify-center bg-[#0a0e14] overflow-hidden">
    <img
      v-if="unitIcon"
      :src="unitIcon"
      class="h-full object-contain"
      alt="Unit"
    />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  unitName?: string
  unitIcon?: string
}>()
</script>
