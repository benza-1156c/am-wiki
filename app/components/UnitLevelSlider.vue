<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between">
        <span class="text-sm font-bold flex items-center gap-1.5">
          <UIcon name="i-lucide-gauge" />
          <span>Unit Level</span>
        </span>
        <UBadge color="primary" variant="subtle" size="xs">
          Lv. {{ modelValue }} / {{ maxLevel }}
        </UBadge>
      </div>
    </template>

    <div class="space-y-3">
      <USlider
        :model-value="modelValue"
        :min="1"
        :max="maxLevel"
        size="lg"
        @update:model-value="$emit('update:modelValue', Number($event))"
      />

      <div class="flex items-center justify-between text-xs text-muted">
        <span>Lv. 1 (Base)</span>
        <div class="flex items-center gap-1">
          <UButton label="Min" size="xs" variant="ghost" color="neutral" @click="$emit('update:modelValue', 1)" />
          <UButton label="Lv.50" size="xs" variant="ghost" color="neutral" @click="$emit('update:modelValue', 50)" />
          <UButton :label="'Max (' + maxLevel + ')'" size="xs" variant="ghost" color="primary" @click="$emit('update:modelValue', maxLevel)" />
        </div>
      </div>

      <div class="p-2.5 rounded border border-default flex items-center justify-between text-xs">
        <span class="text-muted">Level Stat Multiplier:</span>
        <span class="font-bold text-primary font-mono">
          {{ levelMultiplier.toFixed(2) }}x (+{{ Math.round((levelMultiplier - 1) * 100) }}%)
        </span>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: number
  maxLevel: number
  levelMultiplier: number
}>()

defineEmits<{
  (e: 'update:modelValue', val: number): void
}>()
</script>

