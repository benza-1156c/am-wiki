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
      <UCard>
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <UButton icon="i-lucide-calculator" variant="subtle" color="primary" square size="lg" />
            <div>
              <h1 class="text-lg font-bold">
                Unit Stat & Awakening Calculator
              </h1>
              <p class="text-xs text-muted">
                Canonical formulas from CalculateUnitsStats & UnitLevelData
              </p>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <UBadge variant="subtle" color="primary" size="md">
              Level Scaling: 1 + (Level - 1) × 10%
            </UBadge>
            <UBadge variant="subtle" color="warning" size="md">
              Max Level: 50 + (Stars × 5) [Max 80]
            </UBadge>
          </div>
        </div>
      </UCard>

      <!-- Main Layout: 2 Columns -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <!-- Left Column: Controls (Unit, Stars, Level, Upgrade) -->
        <div class="lg:col-span-5 space-y-5">
          <!-- 1. Unit Selector -->
          <UCard>
            <template #header>
              <div class="flex items-center justify-between">
                <span class="text-sm font-bold flex items-center gap-1.5">
                  <UIcon name="i-lucide-user" />
                  <span>Select Unit</span>
                </span>
                <UBadge color="neutral" variant="subtle" size="xs">{{ units.length }} units</UBadge>
              </div>
            </template>

            <div class="space-y-3">
              <UInput
                v-model="unitSearch"
                placeholder="Search unit by name or series..."
                icon="i-lucide-search"
                size="sm"
              />

              <div class="max-h-52 overflow-y-auto space-y-1 pr-1 border border-default rounded-md p-1">
                <div
                  v-for="u in filteredUnits"
                  :key="u.id"
                  class="cursor-pointer p-2 rounded text-xs flex items-center justify-between transition-colors"
                  :class="selectedUnitId === u.id ? 'bg-primary/10 font-bold text-primary' : 'hover:bg-muted/50'"
                  @click="selectedUnitId = u.id"
                >
                  <div class="flex items-center gap-2 truncate">
                    <span>{{ u.displayName || u.name }}</span>
                    <span class="text-[10px] text-muted">({{ u.name }})</span>
                  </div>
                  <UBadge color="neutral" variant="subtle" size="xs">{{ u.rarity }}</UBadge>
                </div>
              </div>
            </div>
          </UCard>

          <!-- 2. Awakening Stars (0 to 6★) -->
          <UCard>
            <template #header>
              <div class="flex items-center justify-between">
                <span class="text-sm font-bold flex items-center gap-1.5">
                  <UIcon name="i-lucide-star" />
                  <span>Awakening Stars</span>
                </span>
                <UBadge color="warning" variant="subtle" size="xs">{{ selectedStars }} / 6 Stars</UBadge>
              </div>
            </template>

            <div class="space-y-4">
              <!-- Star Buttons -->
              <div class="grid grid-cols-7 gap-1">
                <UButton
                  v-for="s in [0, 1, 2, 3, 4, 5, 6]"
                  :key="s"
                  :label="s + '★'"
                  :variant="selectedStars === s ? 'solid' : 'outline'"
                  :color="selectedStars === s ? 'warning' : 'neutral'"
                  size="sm"
                  block
                  @click="selectedStars = s"
                />
              </div>
            </div>
          </UCard>

          <!-- 3. Unit Level Slider -->
          <UCard>
            <template #header>
              <div class="flex items-center justify-between">
                <span class="text-sm font-bold flex items-center gap-1.5">
                  <UIcon name="i-lucide-gauge" />
                  <span>Unit Level</span>
                </span>
                <UBadge color="primary" variant="subtle" size="xs">
                  Lv. {{ unitLevel }} / {{ currentMaxLevel }}
                </UBadge>
              </div>
            </template>

            <div class="space-y-3">
              <USlider
                v-model="unitLevel"
                :min="1"
                :max="currentMaxLevel"
                size="lg"
              />

              <div class="flex items-center justify-between text-xs text-muted">
                <span>Lv. 1 (Base)</span>
                <div class="flex items-center gap-1">
                  <UButton label="Min" size="xs" variant="ghost" color="neutral" @click="unitLevel = 1" />
                  <UButton label="Lv.50" size="xs" variant="ghost" color="neutral" @click="unitLevel = 50" />
                  <UButton :label="'Max (' + currentMaxLevel + ')'" size="xs" variant="ghost" color="primary" @click="unitLevel = currentMaxLevel" />
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

          <!-- 4. In-Game Upgrade Level -->
          <UCard>
            <template #header>
              <div class="flex items-center justify-between">
                <span class="text-sm font-bold flex items-center gap-1.5">
                  <UIcon name="i-lucide-arrow-up-circle" />
                  <span>In-Game Upgrade Level</span>
                </span>
                <UBadge color="primary" variant="subtle" size="xs">
                  Upgrade {{ upgradeLevel }} / {{ maxUpgradeLevel }}
                </UBadge>
              </div>
            </template>

            <div class="flex flex-wrap items-center gap-1.5">
              <UButton
                v-for="u in maxUpgradeLevel + 1"
                :key="u - 1"
                :label="String(u - 1)"
                :variant="upgradeLevel === (u - 1) ? 'solid' : 'outline'"
                :color="upgradeLevel === (u - 1) ? 'primary' : 'neutral'"
                size="sm"
                @click="upgradeLevel = u - 1"
              />
            </div>
          </UCard>
        </div>

        <!-- Right Column: Stats Display, Skills, and Milestones -->
        <div class="lg:col-span-7 space-y-5">
          <!-- Active Unit Info Card -->
          <UCard v-if="currentUnit">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div class="flex items-center gap-2">
                  <h2 class="text-xl font-bold">
                    {{ currentUnit.displayName || currentUnit.name }}
                  </h2>
                  <UBadge color="primary" variant="subtle" size="xs">{{ currentUnit.rarity }}</UBadge>
                  <UBadge color="neutral" variant="subtle" size="xs">{{ currentUnit.element }}</UBadge>
                </div>
                <p class="text-xs text-muted mt-1">
                  Series: <span class="font-semibold">{{ currentUnit.series }}</span> •
                  Skill Mode: <span class="font-semibold">{{ currentUnit.skillMode }}</span> •
                  Max Upgrade: <span class="font-semibold">Lv. {{ maxUpgradeLevel }}</span>
                </p>
              </div>

              <div class="text-right">
                <span class="text-[10px] text-muted block uppercase tracking-wider font-bold">Deploy Cost</span>
                <span class="text-lg font-bold font-mono">¥{{ currentStats.cost }}</span>
              </div>
            </div>
          </UCard>

          <!-- Computed Stats Grid (Pure Nuxt UI cards) -->
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <UCard>
              <div class="text-xs text-muted flex items-center justify-between mb-1">
                <span class="font-bold flex items-center gap-1">
                  <UIcon name="i-lucide-sword" />
                  <span>Damage (ATK)</span>
                </span>
                <span>Lv. {{ unitLevel }}</span>
              </div>
              <div class="text-2xl font-bold font-mono">
                {{ currentStats.attack.toLocaleString() }}
              </div>
              <div class="text-xs text-muted mt-1 flex items-center justify-between">
                <span>Base: {{ currentStats.baseAttack }}</span>
                <UBadge color="success" variant="subtle" size="xs">+{{ currentStats.atkGainPercent }}%</UBadge>
              </div>
            </UCard>

            <UCard>
              <div class="text-xs text-muted flex items-center justify-between mb-1">
                <span class="font-bold flex items-center gap-1">
                  <UIcon name="i-lucide-flame" />
                  <span>DPS</span>
                </span>
                <span>ATK / SPA</span>
              </div>
              <div class="text-2xl font-bold font-mono text-warning">
                {{ currentStats.dps.toLocaleString() }}
              </div>
              <div class="text-xs text-muted mt-1">
                SPA: <span class="font-bold">{{ currentStats.attackSpeed }}s</span>
              </div>
            </UCard>

            <UCard>
              <div class="text-xs text-muted flex items-center justify-between mb-1">
                <span class="font-bold flex items-center gap-1">
                  <UIcon name="i-lucide-heart" />
                  <span>Health (HP)</span>
                </span>
                <span>Lv. {{ unitLevel }}</span>
              </div>
              <div class="text-2xl font-bold font-mono text-success">
                {{ currentStats.health.toLocaleString() }}
              </div>
              <div class="text-xs text-muted mt-1 flex items-center justify-between">
                <span>Base: {{ currentStats.baseHealth }}</span>
                <UBadge color="success" variant="subtle" size="xs">+{{ currentStats.hpGainPercent }}%</UBadge>
              </div>
            </UCard>

            <UCard>
              <div class="text-xs text-muted flex items-center justify-between mb-1">
                <span class="font-bold flex items-center gap-1">
                  <UIcon name="i-lucide-target" />
                  <span>Range</span>
                </span>
              </div>
              <div class="text-xl font-bold font-mono">
                {{ currentStats.range }}
              </div>
              <div class="text-xs text-muted mt-1">
                Skill Range: <span class="font-bold">{{ currentStats.skillRange }}</span>
              </div>
            </UCard>

            <UCard>
              <div class="text-xs text-muted flex items-center justify-between mb-1">
                <span class="font-bold flex items-center gap-1">
                  <UIcon name="i-lucide-zap" />
                  <span>Walk Speed</span>
                </span>
              </div>
              <div class="text-xl font-bold font-mono">
                {{ currentStats.speed }}
              </div>
              <div class="text-xs text-muted mt-1">
                Attack Speed: <span class="font-bold">{{ currentStats.attackSpeed }}s</span>
              </div>
            </UCard>

            <UCard>
              <div class="text-xs text-muted flex items-center justify-between mb-1">
                <span class="font-bold flex items-center gap-1">
                  <UIcon name="i-lucide-sparkles" />
                  <span>Skill Damage</span>
                </span>
              </div>
              <div class="text-xl font-bold font-mono text-primary">
                {{ currentStats.skillDamage.toLocaleString() }}
              </div>
              <div class="text-xs text-muted mt-1">
                Cooldown: <span class="font-bold">{{ currentStats.skillCooldown }}s</span>
              </div>
            </UCard>
          </div>

          <!-- Unit Passive & Ultimate Details Card -->
          <UCard v-if="unitSkillInfo">
            <template #header>
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-shield-alert" />
                <h3 class="font-bold text-sm">Passive & Ultimate Abilities</h3>
              </div>
            </template>

            <div class="space-y-4">
              <!-- Passive -->
              <div v-if="unitSkillInfo.PassiveDescription" class="space-y-1.5">
                <div class="flex items-center gap-2">
                  <UBadge color="warning" variant="subtle" size="xs">Passive</UBadge>
                  <span class="text-xs font-bold" v-html="formatSkillHtml(unitSkillInfo.PassiveHeader) || 'Inherent Passive'"></span>
                </div>
                <div
                  class="text-xs leading-relaxed p-3 rounded border border-default bg-muted/20"
                  v-html="formatSkillHtml(unitSkillInfo.PassiveDescription)"
                ></div>
              </div>

              <!-- Ultimate -->
              <div v-if="unitSkillInfo.UltimateHeader || unitSkillInfo.UltimateDescription || currentUnit?.ultimateName" class="space-y-1.5 pt-2 border-t border-default">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <UBadge color="primary" variant="subtle" size="xs">Ultimate</UBadge>
                    <span class="text-xs font-bold" v-html="formatSkillHtml(unitSkillInfo.UltimateHeader) || currentUnit?.ultimateName || 'Ultimate Skill'"></span>
                  </div>
                  <UBadge v-if="currentUnit?.ultimateCooldown" color="neutral" variant="outline" size="xs">
                    Cooldown: {{ currentUnit.ultimateCooldown }}s
                  </UBadge>
                </div>
                <div
                  v-if="unitSkillInfo.UltimateDescription"
                  class="text-xs leading-relaxed p-3 rounded border border-default bg-muted/20"
                  v-html="formatSkillHtml(unitSkillInfo.UltimateDescription)"
                ></div>
              </div>
            </div>
          </UCard>

          <!-- Milestone Progression Card -->
          <UCard>
            <template #header>
              <div class="flex items-center justify-between">
                <span class="text-sm font-bold flex items-center gap-1.5">
                  <UIcon name="i-lucide-table-properties" />
                  <span>Power Milestones at Upgrade {{ upgradeLevel }}</span>
                </span>
                <UBadge color="neutral" variant="subtle" size="xs">3 Tiers</UBadge>
              </div>
            </template>

            <div class="overflow-x-auto">
              <table class="w-full text-xs text-left">
                <thead>
                  <tr class="border-b border-default text-muted font-mono">
                    <th class="py-2 px-2.5">Milestone</th>
                    <th class="py-2 px-2.5">Level</th>
                    <th class="py-2 px-2.5">Stars</th>
                    <th class="py-2 px-2.5 text-right">Damage (ATK)</th>
                    <th class="py-2 px-2.5 text-right">DPS</th>
                    <th class="py-2 px-2.5 text-right">Health (HP)</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-default font-mono">
                  <tr>
                    <td class="py-2 px-2.5 font-bold text-muted font-sans">Base</td>
                    <td class="py-2 px-2.5">Lv. 1</td>
                    <td class="py-2 px-2.5 text-muted">0★</td>
                    <td class="py-2 px-2.5 text-right font-bold">{{ milestoneBase.attack.toLocaleString() }}</td>
                    <td class="py-2 px-2.5 text-right font-bold text-warning">{{ milestoneBase.dps.toLocaleString() }}</td>
                    <td class="py-2 px-2.5 text-right text-success">{{ milestoneBase.health.toLocaleString() }}</td>
                  </tr>

                  <tr>
                    <td class="py-2 px-2.5 font-bold font-sans">Standard Max</td>
                    <td class="py-2 px-2.5">Lv. 50</td>
                    <td class="py-2.5 px-2.5 text-muted">0★</td>
                    <td class="py-2 px-2.5 text-right font-bold">{{ milestoneLvl50.attack.toLocaleString() }}</td>
                    <td class="py-2 px-2.5 text-right font-bold text-warning">{{ milestoneLvl50.dps.toLocaleString() }}</td>
                    <td class="py-2 px-2.5 text-right text-success">{{ milestoneLvl50.health.toLocaleString() }}</td>
                  </tr>

                  <tr class="font-bold">
                    <td class="py-2 px-2.5 font-bold font-sans flex items-center gap-1 text-warning">
                      <UIcon name="i-lucide-crown" />
                      <span>Max Awakened</span>
                    </td>
                    <td class="py-2 px-2.5 text-warning">Lv. 80</td>
                    <td class="py-2 px-2.5 text-warning">6★</td>
                    <td class="py-2 px-2.5 text-right font-black">{{ milestoneMax80.attack.toLocaleString() }}</td>
                    <td class="py-2 px-2.5 text-right font-black text-warning">{{ milestoneMax80.dps.toLocaleString() }}</td>
                    <td class="py-2 px-2.5 text-right font-bold text-success">{{ milestoneMax80.health.toLocaleString() }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </UCard>
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
import { formatSkillHtml } from '~/utils/formatters'
import { useDatabase } from '~/composables/useDatabase'

const {
  dbPending: pending,
  dbError: error,
  refresh,
  units,
  skills
} = useDatabase()

const unitSearch = ref('')
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

const filteredUnits = computed(() => {
  if (!unitSearch.value.trim()) return units.value.slice(0, 30)
  const q = unitSearch.value.toLowerCase()
  return units.value.filter(u =>
    (u.name && u.name.toLowerCase().includes(q)) ||
    (u.displayName && u.displayName.toLowerCase().includes(q)) ||
    (u.series && u.series.toLowerCase().includes(q))
  ).slice(0, 30)
})

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

const awakeningPerksList = [
  { star: 1, label: '1 Star (★)', bonus: '+1% Damage' },
  { star: 2, label: '2 Stars (★★)', bonus: '+2% Health' },
  { star: 3, label: '3 Stars (★★★)', bonus: '+2% Speed' },
  { star: 4, label: '4 Stars (★★★★)', bonus: '+2% Skill Damage' },
  { star: 5, label: '5 Stars (★★★★★)', bonus: '+2% Range' },
  { star: 6, label: '6 Stars (★★★★★★)', bonus: '+5% Damage (+6% Total)' }
]

function computeStatsFor(u: any, uLevel: number, stars: number, upgLvl: number) {
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
