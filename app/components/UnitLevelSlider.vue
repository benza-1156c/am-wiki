<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between">
        <span class="text-sm font-bold flex items-center gap-1.5">
          <UIcon name="i-lucide-gauge" />
          <span>Unit Level</span>
        </span>
        <UBadge color="primary" variant="subtle" size="xs">
          Lv. {{ store.unitLevel }} / {{ store.currentMaxLevel }}
        </UBadge>
      </div>
    </template>

    <div class="space-y-3">
      <USlider
        :model-value="store.unitLevel"
        :min="1"
        :max="store.currentMaxLevel"
        size="lg"
        @update:model-value="store.setLevel(Number($event))"
      />

      <div class="flex items-center justify-between text-xs text-muted">
        <span>Lv. 1</span>
        <div class="flex items-center gap-1">
          <UButton label="Min" size="xs" variant="ghost" color="neutral" @click="store.setLevel(1)" />
          <UButton label="Lv.50" size="xs" variant="ghost" color="neutral" @click="store.setLevel(50)" />
          <UButton :label="'Max ' + store.currentMaxLevel" size="xs" variant="ghost" color="primary" @click="store.setLevel(store.currentMaxLevel)" />
        </div>
      </div>

      <div class="p-2.5 rounded border border-default flex items-center justify-between text-xs">
        <span class="text-muted">Level Stat Multiplier:</span>
        <span class="font-bold text-primary font-mono">
          {{ store.levelMultiplier.toFixed(2) }}x +{{ Math.round((store.levelMultiplier - 1) * 100) }}%
        </span>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
const store = useCombatCalculatorStore()
</script>
