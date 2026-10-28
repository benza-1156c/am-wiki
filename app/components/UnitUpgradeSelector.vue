<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between">
        <span class="text-sm font-bold flex items-center gap-1.5">
          <UIcon name="i-lucide-arrow-up-circle" />
          <span>In-Game Upgrade Level</span>
        </span>
        <UBadge color="primary" variant="subtle" size="xs">
          Upgrade {{ currentUpgrade }} / {{ maxUpgrade }}
        </UBadge>
      </div>
    </template>

    <div class="flex flex-wrap items-center gap-1.5">
      <UButton
        v-for="u in maxUpgrade + 1"
        :key="u - 1"
        :label="String(u - 1)"
        :variant="currentUpgrade === (u - 1) ? 'solid' : 'outline'"
        :color="currentUpgrade === (u - 1) ? 'primary' : 'neutral'"
        size="sm"
        @click="selectUpgrade(u - 1)"
      />
    </div>
  </UCard>
</template>

<script setup lang="ts">
const store = useCombatCalculatorStore()

const props = defineProps<{
  modelValue?: number
  maxUpgrade?: number
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: number): void
}>()

const currentUpgrade = computed(() => {
  return props.modelValue !== undefined ? props.modelValue : store.upgradeLevel
})

const maxUpgrade = computed(() => {
  return props.maxUpgrade !== undefined ? props.maxUpgrade : store.maxUpgradeLevel
})

function selectUpgrade(val: number) {
  store.setUpgradeLevel(val)
  emit('update:modelValue', val)
}
</script>
