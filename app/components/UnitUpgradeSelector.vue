<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between">
        <span class="text-sm font-bold flex items-center gap-1.5">
          <UIcon name="i-lucide-arrow-up-circle" />
          <span>In-Game Upgrade Level</span>
        </span>
        <UBadge color="primary" variant="subtle" size="xs">
          Upgrade {{ modelValue }} / {{ maxUpgrade }}
        </UBadge>
      </div>
    </template>

    <div class="flex flex-wrap items-center gap-1.5">
      <UButton
        v-for="u in maxUpgrade + 1"
        :key="u - 1"
        :label="String(u - 1)"
        :variant="modelValue === (u - 1) ? 'solid' : 'outline'"
        :color="modelValue === (u - 1) ? 'primary' : 'neutral'"
        size="sm"
        @click="$emit('update:modelValue', u - 1)"
      />
    </div>
  </UCard>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: number
  maxUpgrade: number
}>()

defineEmits<{
  (e: 'update:modelValue', val: number): void
}>()
</script>

