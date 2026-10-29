<template>
  <div class="space-y-6 max-w-6xl mx-auto">
    <!-- Page Header & Quick Controls -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl border border-white/10 bg-[#0f172a]/90 backdrop-blur-md shadow-xl">
      <div class="space-y-1">
        <div class="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
          <UIcon name="i-lucide-swords" class="w-4 h-4" />
          <span>Versus Combat Analyzer</span>
        </div>
      </div>

      <!-- Quick Action Toolbars -->
      <div class="flex items-center gap-2 flex-wrap self-start md:self-auto">
        <UButton
          icon="i-lucide-zap"
          label="Sync Both Max"
          size="xs"
          variant="solid"
          color="primary"
          @click="syncBothMax"
        />
        <UButton
          icon="i-lucide-crosshair"
          label="Base Lv.1"
          size="xs"
          variant="soft"
          color="neutral"
          @click="syncBothBase"
        />
        <UButton
          icon="i-lucide-arrow-left-right"
          label="Swap Sides"
          size="xs"
          variant="outline"
          color="neutral"
          @click="swapSides"
        />
        <UButton
          icon="i-lucide-dices"
          size="xs"
          variant="ghost"
          color="neutral"
          @click="randomMatchup"
        />
      </div>
    </div>

    <!-- Side-by-Side Character Column Cards (Same uniform clean theme) -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
      <!-- Unit 1 Column -->
      <CompareUnitPanel
        v-if="unit1"
        :unit="unit1"
        :state="unit1State"
        :all-traits="traitsList"
        :all-gears="gearsList"
        @open-picker="openPicker('left')"
      />

      <!-- Unit 2 Column -->
      <CompareUnitPanel
        v-if="unit2"
        :unit="unit2"
        :state="unit2State"
        :all-traits="traitsList"
        :all-gears="gearsList"
        @open-picker="openPicker('right')"
      />
    </div>

    <!-- Statistics Comparison (Exact styling and metrics as Calculator's UnitStatsGrid) -->
    <div v-if="stats1 && stats2" class="p-5 rounded-2xl border border-white/10 bg-[#0f172a]/70 backdrop-blur-md shadow-xl">
      <CompareStatsGrid
        :stats1="stats1"
        :stats2="stats2"
        :potentials1="unit1State.potentials"
        :potentials2="unit2State.potentials"
      />
    </div>

    <!-- Unit Selection Modal -->
    <CompareUnitPickerModal
      v-model:open="isPickerOpen"
      :units="unitsList"
      :title="pickingSlot === 'left' ? 'Select Unit 1' : 'Select Unit 2'"
      @select="onSelectUnit"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, reactive } from 'vue'
import type { GearSlot, UnitTrait, GearStatsAggregated } from '~/types/unit'
import { findUnitByParam, toUnitSlug } from '~/utils/unitSlug'
import {
  calculateCombatStats,
  resolveGearStatsForUnit,
} from '~/utils/unitCalculator'
import { formatNumber } from '~/utils/formatters'
import CompareUnitPanel, { type CompareUnitPanelState } from '~/components/compare/CompareUnitPanel.vue'
import CompareStatsGrid from '~/components/compare/CompareStatsGrid.vue'
import CompareUnitPickerModal from '~/components/compare/CompareUnitPickerModal.vue'

const route = useRoute()
const router = useRouter()

useHead({
  title: 'Unit Comparison - Anime Mysterious Wiki',
  meta: [
    {
      name: 'description',
      content: 'Compare combat stats, DPS, range, gears, and traits between Anime Mysterious characters.'
    }
  ]
})

const { data: dbData } = await useFetch<any>('/api/database', {
  key: 'am-db-data',
  default: () => null
})

const unitsList = computed(() => dbData.value?.units || [])

// Normalized traits list
const traitsList = computed<UnitTrait[]>(() => {
  const raw = dbData.value?.traits || {}
  return Object.entries(raw).map(([key, t]: [string, any]) => ({
    id: key,
    TraitDisplayName: t.TraitDisplayName || t.name || `Trait ${key}`,
    RarityName: t.RarityName || 'Rare',
    TraitStatus: t.TraitStatus || '',
    TraitIcon: t.TraitIcon || '',
    Stats: t.Stats || {},
    Weight: t.Weight || 0
  }))
})

// Normalized gears list
const gearsList = computed(() => {
  const raw = dbData.value?.gears || {}
  return Object.entries(raw).map(([key, g]: [string, any]) => ({
    id: key,
    ...g,
    slot: g.Slot || g.slot
  }))
})

// State for Unit 1
const selectedUnit1Id = ref<string>('')
const unit1State = reactive<CompareUnitPanelState>({
  stars: 6,
  level: 80,
  upgradeLevel: 7,
  potentials: {
    damage: 'GOD',
    health: 'GOD',
    range: 'GOD',
    speed: 'GOD',
    cooldown: 'GOD'
  },
  traitIds: [null, null],
  gears: {
    Head: null,
    Body: null,
    Arm: null,
    Legs: null
  }
})

// State for Unit 2
const selectedUnit2Id = ref<string>('')
const unit2State = reactive<CompareUnitPanelState>({
  stars: 6,
  level: 80,
  upgradeLevel: 7,
  potentials: {
    damage: 'GOD',
    health: 'GOD',
    range: 'GOD',
    speed: 'GOD',
    cooldown: 'GOD'
  },
  traitIds: [null, null],
  gears: {
    Head: null,
    Body: null,
    Arm: null,
    Legs: null
  }
})

// Modal state
const isPickerOpen = ref<boolean>(false)
const pickingSlot = ref<'left' | 'right'>('left')

// Initialize units from Query or Defaults
function initUnits() {
  if (!unitsList.value || unitsList.value.length === 0) return

  const q1 = route.query.u1 as string
  const q2 = route.query.u2 as string

  // Unit 1
  const u1Found = q1 ? findUnitByParam(unitsList.value, q1) : null
  const defaultU1 = u1Found || findUnitByParam(unitsList.value, 'Alucard_001_evo') || unitsList.value[0]
  if (defaultU1) {
    selectedUnit1Id.value = defaultU1.id
    unit1State.upgradeLevel = defaultU1.maxLevel ?? 5
  }

  // Unit 2
  const u2Found = q2 ? findUnitByParam(unitsList.value, q2) : null
  const defaultU2 = u2Found || findUnitByParam(unitsList.value, 'Sungjinwoo_001_Evo') || unitsList.value[1] || unitsList.value[0]
  if (defaultU2) {
    selectedUnit2Id.value = defaultU2.id
    unit2State.upgradeLevel = defaultU2.maxLevel ?? 5
  }
}

initUnits()

const unit1 = computed(() => {
  return unitsList.value.find((u: any) => u.id === selectedUnit1Id.value) || unitsList.value[0]
})

const unit2 = computed(() => {
  return unitsList.value.find((u: any) => u.id === selectedUnit2Id.value) || unitsList.value[1] || unitsList.value[0]
})

// Canonical helper to compute stats using the exact same logic as Calculator store
function computeSlotStats(unitData: any, state: CompareUnitPanelState) {
  if (!unitData) return null

  // Resolve active traits
  const activeTraits: UnitTrait[] = []
  for (const tid of state.traitIds) {
    if (!tid || tid === 'none') continue
    const found = traitsList.value.find(t => t.id === tid)
    if (found) activeTraits.push(found)
  }

  // Aggregate gear stats
  const gearTotals: GearStatsAggregated = {
    DamageBoost: 0,
    HealthBoost: 0,
    AttackSpeedBoost: 0,
    RangeBoost: 0,
    SpeedBoost: 0,
    SkillDamageBoost: 0,
    SkillCooldownReduction: 0,
    CostReduction: 0,
    CritDamageBoost: 0,
    CritChanceBoost: 0,
    SpawnCooldownReduction: 0,
    LifeSteal: 0,
    ArmorPen: 0,
    EvadeBoost: 0,
    BurnBoost: 0,
    Accuracy: 0,
    Armor: 0,
    Shield: 0,
    UnitCap: 0,
    activeExclusiveBonuses: []
  }

  const slots: GearSlot[] = ['Head', 'Body', 'Arm', 'Legs']
  for (const s of slots) {
    const gid = state.gears[s]
    if (!gid || gid === 'none') continue
    const g = gearsList.value.find(item => item.id === gid)
    if (!g) continue

    const { baseStats, exclusiveBonus } = resolveGearStatsForUnit(g, unitData)
    for (const [k, v] of Object.entries(baseStats)) {
      if (typeof (gearTotals as any)[k] === 'number') {
        (gearTotals as any)[k] += v
      } else {
        (gearTotals as any)[k] = v
      }
    }
    if (exclusiveBonus) {
      gearTotals.activeExclusiveBonuses.push({
        gearName: g.Name,
        unitKey: exclusiveBonus.unitKey,
        stats: exclusiveBonus.stats
      })
    }
  }

  // Canonical function call with 7 positional parameters!
  return calculateCombatStats(
    unitData,
    state.level,
    state.stars,
    state.upgradeLevel,
    state.potentials,
    activeTraits,
    gearTotals
  )
}

const stats1 = computed(() => computeSlotStats(unit1.value, unit1State))
const stats2 = computed(() => computeSlotStats(unit2.value, unit2State))

// Verdict analysis
const dpsWinner = computed<'1' | '2' | 'tie'>(() => {
  if (!stats1.value || !stats2.value) return 'tie'
  if (Math.abs(stats1.value.dps - stats2.value.dps) < 1) return 'tie'
  return stats1.value.dps > stats2.value.dps ? '1' : '2'
})

const verdictMessage = computed(() => {
  if (!stats1.value || !stats2.value) return ''
  if (dpsWinner.value === 'tie') return 'deal equal damage output at current settings.'
  const maxDps = Math.max(stats1.value.dps, stats2.value.dps)
  const diff = Math.abs(stats1.value.dps - stats2.value.dps)
  const pct = Math.round((diff / (maxDps || 1)) * 100)
  return `deals +${pct}% higher DPS output (+${formatNumber(diff)} damage/sec)!`
})

// Quick Action Controls
function syncBothMax() {
  unit1State.stars = 6
  unit1State.level = 80
  unit1State.upgradeLevel = unit1.value?.maxLevel ?? 5

  unit2State.stars = 6
  unit2State.level = 80
  unit2State.upgradeLevel = unit2.value?.maxLevel ?? 5
}

function syncBothBase() {
  unit1State.stars = 0
  unit1State.level = 1
  unit1State.upgradeLevel = 0

  unit2State.stars = 0
  unit2State.level = 1
  unit2State.upgradeLevel = 0
}

function swapSides() {
  const tempId = selectedUnit1Id.value
  const tempState = JSON.parse(JSON.stringify(unit1State))

  selectedUnit1Id.value = selectedUnit2Id.value
  Object.assign(unit1State, JSON.parse(JSON.stringify(unit2State)))

  selectedUnit2Id.value = tempId
  Object.assign(unit2State, tempState)
}

function randomMatchup() {
  const list = unitsList.value
  if (!list || list.length < 2) return
  const idx1 = Math.floor(Math.random() * list.length)
  let idx2 = Math.floor(Math.random() * list.length)
  while (idx2 === idx1) {
    idx2 = Math.floor(Math.random() * list.length)
  }
  selectedUnit1Id.value = list[idx1].id
  unit1State.upgradeLevel = list[idx1].maxLevel ?? 5

  selectedUnit2Id.value = list[idx2].id
  unit2State.upgradeLevel = list[idx2].maxLevel ?? 5
}

// Modal handling
function openPicker(slot: 'left' | 'right') {
  pickingSlot.value = slot
  isPickerOpen.value = true
}

function onSelectUnit(selected: any) {
  if (!selected) return
  if (pickingSlot.value === 'left') {
    selectedUnit1Id.value = selected.id
    unit1State.upgradeLevel = selected.maxLevel ?? 5
  } else {
    selectedUnit2Id.value = selected.id
    unit2State.upgradeLevel = selected.maxLevel ?? 5
  }
}

// URL Query Sync
watch(
  [() => unit1.value, () => unit2.value],
  ([u1, u2]) => {
    if (!u1 || !u2 || import.meta.server) return
    const s1 = toUnitSlug(u1)
    const s2 = toUnitSlug(u2)
    router.replace({
      path: '/compare',
      query: { u1: s1, u2: s2 }
    })
  }
)
</script>
