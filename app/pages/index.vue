<template>
  <div class="space-y-6">
    <!-- Loading State -->
    <div v-if="pending" class="flex flex-col items-center justify-center min-h-[40vh] space-y-3">
      <UIcon name="i-lucide-loader-2" class="w-8 h-8 animate-spin text-primary" />
      <p class="text-xs text-muted font-medium">Loading Units Data...</p>
    </div>

    <!-- Error State -->
    <UAlert
      v-else-if="error"
      color="error"
      variant="subtle"
      icon="i-lucide-alert-triangle"
      :title="'Failed to load database: ' + error.message"
    >
      <template #description>
        <UButton
          label="Retry Loading"
          color="error"
          variant="solid"
          size="xs"
          class="mt-2"
          @click="refresh()"
        />
      </template>
    </UAlert>

    <!-- Main Calculator View -->
    <div v-else class="space-y-6">
      <!-- Top Formula & Unit Switcher Card -->
      <UCard>
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <UButton icon="i-lucide-calculator" variant="subtle" color="primary" square size="lg" />
            <div>
              <div class="flex items-center gap-2">
                <h1 class="text-lg font-bold">Unit Stat & Awakening Calculator</h1>
                <UBadge variant="subtle" color="primary" size="xs">Level 1–80</UBadge>
              </div>
              <p class="text-xs text-muted">Canonical formulas from CalculateUnitsStats & UnitLevelData</p>
            </div>
          </div>

          <!-- Unit Selector Trigger Button (Replaces bulky list) -->
          <div class="flex flex-wrap items-center gap-2">
            <UButton
              icon="i-lucide-user"
              :label="(currentUnit?.displayName || currentUnit?.name || 'Select Unit') + ' ▾'"
              variant="outline"
              color="primary"
              size="md"
              @click="isSelectorOpen = true"
            />
          </div>
        </div>
      </UCard>

      <!-- Main Layout: 2 Columns -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <!-- Left Column: Controls (Stars, Level, Upgrade) -->
        <div class="lg:col-span-5 space-y-5">
          <UnitAwakeningStars
            v-model="selectedStars"
          />

          <UnitLevelSlider
            v-model="unitLevel"
            :max-level="currentMaxLevel"
            :level-multiplier="levelMultiplier"
          />

          <UnitUpgradeSelector
            v-model="upgradeLevel"
            :max-upgrade="maxUpgradeLevel"
          />
        </div>

        <!-- Right Column: Stats Display, Profile, and Skills -->
        <div class="lg:col-span-7 space-y-5">
          <UnitProfileCard
            v-if="currentUnit"
            :unit="currentUnit"
            :cost="currentStats.cost"
            :max-upgrade="maxUpgradeLevel"
            @open-selector="isSelectorOpen = true"
          />

          <UnitStatsGrid
            v-model:potentials="potentials"
            :stats="currentStats"
            :unit-level="unitLevel"
          />

          <UnitSkillCard
            v-if="unitSkillInfo"
            :skill="unitSkillInfo"
            :ultimate-name="currentUnit?.ultimateName"
            :ultimate-cooldown="currentUnit?.ultimateCooldown"
          />
        </div>
      </div>

      <!-- Unit Selector Modal (Clean & Non-intrusive) -->
      <UnitSelector
        v-model:open="isSelectorOpen"
        v-model="selectedUnitId"
        :units="units"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  getMaxUnitLevel,
  getLevelMultiplier,
  calculateCombatStats
} from '~/utils/unitCalculator'
import type { StatPotentials } from '~/types/unit'
import { useDatabase } from '~/composables/useDatabase'

const {
  dbPending: pending,
  dbError: error,
  refresh,
  units,
  skills
} = useDatabase()

const selectedUnitId = ref<string>('')
const selectedStars = ref<number>(0)
const unitLevel = ref<number>(1)
const upgradeLevel = ref<number>(0)
const isSelectorOpen = ref<boolean>(false)

// Stat Potentials (status.md: D=5%, C=10%, B=15%, SS=30%, SSS=35%, 神=50%)
const potentials = ref<StatPotentials>({
  damage: 'GOD',
  health: 'GOD',
  range: 'GOD',
  speed: 'GOD',
  cooldown: 'GOD',
  skillDamage: 'NONE',
  attackSpeed: 'NONE'
})

// Preselect first unit on load
watch(
  () => units.value,
  (newUnits) => {
    if (newUnits && newUnits.length > 0 && !selectedUnitId.value) {
      selectedUnitId.value = newUnits[0].id
    }
  },
  { immediate: true }
)

const currentUnit = computed(() => {
  return units.value.find(u => u.id === selectedUnitId.value) || units.value[0] || null
})

const maxUpgradeLevel = computed(() => {
  return currentUnit.value?.maxLevel || 5
})

const currentMaxLevel = computed(() => {
  return getMaxUnitLevel(selectedStars.value)
})

watch(currentMaxLevel, (newMax) => {
  if (unitLevel.value > newMax) {
    unitLevel.value = newMax
  }
})

const levelMultiplier = computed(() => {
  return getLevelMultiplier(unitLevel.value)
})

const unitSkillInfo = computed(() => {
  if (!currentUnit.value) return null
  const name = currentUnit.value.name || currentUnit.value.displayName
  return currentUnit.value.skill || skills.value[name] || skills.value[currentUnit.value.displayName] || null
})

// Global canonical calculation call
const currentStats = computed(() => {
  return calculateCombatStats(
    currentUnit.value,
    unitLevel.value,
    selectedStars.value,
    upgradeLevel.value,
    potentials.value
  )
})
</script>
