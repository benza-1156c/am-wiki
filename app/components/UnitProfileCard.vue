<template>
  <UCard v-if="unitData">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <div class="flex flex-wrap items-center gap-2">
          <h2 class="text-xl font-bold">
            {{ unitData.displayName || unitData.name }}
          </h2>
          <UBadge color="primary" variant="subtle" size="xs">{{ unitData.rarity }}</UBadge>
          <UBadge color="neutral" variant="subtle" size="xs">{{ unitData.element }}</UBadge>

          <UButton
            icon="i-lucide-arrow-left-right"
            label="Switch Unit"
            variant="outline"
            color="primary"
            size="xs"
            class="ml-1"
            @click="openUnitSelector"
          />
        </div>
        <p class="text-xs text-muted mt-1">
          Series: <span class="font-semibold">{{ unitData.series }}</span> •
          Skill Mode: <span class="font-semibold">{{ unitData.skillMode }}</span> •
          Max Upgrade: <span class="font-semibold">Lv. {{ maxLvl }}</span>
        </p>
      </div>

      <div class="text-right">
        <span class="text-[10px] text-muted block uppercase tracking-wider font-bold">Deploy Cost</span>
        <span class="text-lg font-bold font-mono">¥{{ deployCost }}</span>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { NormalizedUnit } from '~/types/unit'

const store = useCombatCalculatorStore()

const props = defineProps<{
  unit?: NormalizedUnit | null
  cost?: number
  maxUpgrade?: number
}>()

const emit = defineEmits<{
  (e: 'openSelector'): void
}>()

const unitData = computed(() => props.unit || store.currentUnit)
const deployCost = computed(() => props.cost !== undefined ? props.cost : store.calculatedStats.cost)
const maxLvl = computed(() => props.maxUpgrade !== undefined ? props.maxUpgrade : store.maxUpgradeLevel)

function openUnitSelector() {
  store.isSelectorOpen = true
  emit('openSelector')
}
</script>
