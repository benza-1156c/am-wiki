<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between">
        <span class="text-sm font-bold flex items-center gap-1.5">
          <UIcon name="i-lucide-gauge" />
          <span>Unit Level</span>
        </span>
        <UBadge color="primary" variant="subtle" size="xs">
          Lv. {{ currentLevel }} / {{ currentMaxLevel }}
        </UBadge>
      </div>
    </template>

    <div class="space-y-3">
      <USlider
        :model-value="currentLevel"
        :min="1"
        :max="currentMaxLevel"
        size="lg"
        @update:model-value="updateLevel(Number($event))"
      />

      <div class="flex items-center justify-between text-xs text-muted">
        <span>Lv. 1 (Base)</span>
        <div class="flex items-center gap-1">
          <UButton label="Min" size="xs" variant="ghost" color="neutral" @click="updateLevel(1)" />
          <UButton label="Lv.50" size="xs" variant="ghost" color="neutral" @click="updateLevel(50)" />
          <UButton :label="'Max (' + currentMaxLevel + ')'" size="xs" variant="ghost" color="primary" @click="updateLevel(currentMaxLevel)" />
        </div>
      </div>

      <div class="p-2.5 rounded border border-default flex items-center justify-between text-xs">
        <span class="text-muted">Level Stat Multiplier:</span>
        <span class="font-bold text-primary font-mono">
          {{ currentMultiplier.toFixed(2) }}x (+{{ Math.round((currentMultiplier - 1) * 100) }}%)
        </span>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
const store = useCombatCalculatorStore()

const props = defineProps<{
  modelValue?: number
  maxLevel?: number
  levelMultiplier?: number
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: number): void
}>()

const currentLevel = computed(() => {
  return props.modelValue !== undefined ? props.modelValue : store.unitLevel
})

const currentMaxLevel = computed(() => {
  return props.maxLevel !== undefined ? props.maxLevel : store.currentMaxLevel
})

const currentMultiplier = computed(() => {
  return props.levelMultiplier !== undefined ? props.levelMultiplier : store.levelMultiplier
})

function updateLevel(val: number) {
  store.setLevel(val)
  emit('update:modelValue', val)
}
</script>
