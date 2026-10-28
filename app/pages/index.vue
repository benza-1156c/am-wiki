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
      <!-- Header Formula Banner Card -->
      <UnitCalculatorBanner />

      <!-- Main Layout: 2 Columns -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <!-- Left Column: Controls (Unit, Stars, Level, Upgrade) -->
        <div class="lg:col-span-5 space-y-5">
          <UnitSelector
            v-model="selectedUnitId"
            :units="units"
          />

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

        <!-- Right Column: Stats Display, Skills, and Milestones -->
        <div class="lg:col-span-7 space-y-5">
          <UnitProfileCard
            v-if="currentUnit"
            :unit="currentUnit"
            :cost="currentStats.cost"
            :max-upgrade="maxUpgradeLevel"
          />

          <UnitStatsGrid
            :stats="currentStats"
            :unit-level="unitLevel"
          />

          <UnitSkillCard
            v-if="unitSkillInfo"
            :skill="unitSkillInfo"
            :ultimate-name="currentUnit?.ultimateName"
            :ultimate-cooldown="currentUnit?.ultimateCooldown"
          />

          <UnitMilestonesTable
            :upgrade-level="upgradeLevel"
            :base="milestoneBase"
            :lvl50="milestoneLvl50"
            :max80="milestoneMax80"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  getAwakeningBonuses,
  getMaxUnitLevel,
  getLevelMultiplier
} from '~/utils/unitCalculator'
import type { CalculatedStats } from '~/types/unit'
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

function computeStatsFor(u: any, uLevel: number, stars: number, upgLvl: number): CalculatedStats {
  if (!u) {
    return {
      attack: 0,
      baseAttack: 0,
      atkGainPercent: 0,
      health: 0,
      baseHealth: 0,
      hpGainPercent: 0,
      dps: 0,
      attackSpeed: 1,
      range: 0,
      skillRange: 0,
      speed: 0,
      skillDamage: 0,
      skillCooldown: 0,
      cost: 0
    }
  }

  const baseDmg = u.baseDamage || u.Damage || 50
  const baseHp = u.statsAtBase?.health || u.HP || 100
  const baseRange = u.statsAtBase?.range || u.Range || 15
  const baseSpeed = u.statsAtBase?.speed || u.WalkSpeed || 8
  const baseSpa = u.statsAtBase?.attackSpeed || u.AttackSpeed || 3
  const baseCost = u.statsAtBase?.cost || u.Cost || 800
  const statMult = u.upgradeStatMultiplier || 1.2
  const overrides = u.upgradeOverrides || {}

  const lvlOverrides = overrides[String(upgLvl)] || {}
  const upgMult = upgLvl <= 1 ? 1 : Math.pow(statMult, upgLvl - 1)

  const rawAtk = lvlOverrides.Attack || lvlOverrides.Damage || Math.round(baseDmg * upgMult * 10) / 10
  const rawHp = lvlOverrides.Health || lvlOverrides.HP || Math.round(baseHp * upgMult * 10) / 10
  const rawRange = lvlOverrides.Range !== undefined ? lvlOverrides.Range : baseRange
  const rawSpeed = lvlOverrides.WalkSpeed || baseSpeed
  const rawSpa = lvlOverrides.AttackSpeed !== undefined ? lvlOverrides.AttackSpeed : baseSpa

  const lvlMult = getLevelMultiplier(uLevel)
  const awk = getAwakeningBonuses(stars)

  const attack = Math.round(rawAtk * lvlMult * (1 + awk.damage) * 10) / 10
  const health = Math.round(rawHp * lvlMult * (1 + awk.health) * 10) / 10
  const range = Math.round(rawRange * (1 + awk.range) * 10) / 10
  const speed = Math.round(rawSpeed * (1 + awk.speed) * 10) / 10
  const attackSpeed = Math.round(rawSpa * 100) / 100
  const dps = Math.round((attack / (attackSpeed || 1)) * 10) / 10

  const rawSkillDmg = u.skillDamage || rawAtk * 1.5
  const skillDamage = Math.round(rawSkillDmg * lvlMult * (1 + awk.skillDamage) * 10) / 10

  return {
    attack,
    baseAttack: rawAtk,
    atkGainPercent: Math.round(((attack - rawAtk) / (rawAtk || 1)) * 100),
    health,
    baseHealth: rawHp,
    hpGainPercent: Math.round(((health - rawHp) / (rawHp || 1)) * 100),
    dps,
    attackSpeed,
    range,
    skillRange: lvlOverrides.SkillRange || u.SkillRange || range,
    speed,
    skillDamage,
    skillCooldown: lvlOverrides.SkillCooldown || u.SkillCooldown || 5,
    cost: baseCost
  }
}

const currentStats = computed(() => {
  return computeStatsFor(currentUnit.value, unitLevel.value, selectedStars.value, upgradeLevel.value)
})

const milestoneBase = computed(() => {
  return computeStatsFor(currentUnit.value, 1, 0, upgradeLevel.value)
})

const milestoneLvl50 = computed(() => {
  return computeStatsFor(currentUnit.value, 50, 0, upgradeLevel.value)
})

const milestoneMax80 = computed(() => {
  return computeStatsFor(currentUnit.value, 80, 6, upgradeLevel.value)
})
</script>
