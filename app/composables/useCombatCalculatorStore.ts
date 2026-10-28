import { ref, computed, watch, reactive } from 'vue'
import type { PotentialRank, StatPotentials, UnitTrait, CalculatedStats, NormalizedUnit } from '~/types/unit'
import {
  DEFAULT_POTENTIALS,
  calculateCombatStats,
  getLevelMultiplier,
  getMaxUnitLevel
} from '~/utils/unitCalculator'

// Global Singleton Reactive State (Shared across all calculator components without emits)
const selectedUnitId = ref<string>('')
const unitLevel = ref<number>(1)
const selectedStars = ref<number>(0)
const upgradeLevel = ref<number>(0)
const potentials = ref<StatPotentials>({ ...DEFAULT_POTENTIALS })
const selectedTraitId = ref<string | null>(null)
const isSelectorOpen = ref<boolean>(false)

export function useCombatCalculatorStore() {
  const { units, skills, traits, dbPending: pending, dbError: error, refresh } = useDatabase()

  // Preselect first unit once units are loaded
  watch(
    () => units.value,
    (newUnits) => {
      if (newUnits && newUnits.length > 0 && !selectedUnitId.value) {
        selectedUnitId.value = newUnits[0].id || newUnits[0].name
      }
    },
    { immediate: true }
  )

  const currentUnit = computed<NormalizedUnit | null>(() => {
    return units.value.find((u: any) => u.id === selectedUnitId.value || u.name === selectedUnitId.value)
      || units.value[0]
      || null
  })

  // Normalized list of traits from database.json, sorted by Rarity Tier (Mythic > Legendary > Epic > Rare)
  const traitsList = computed<UnitTrait[]>(() => {
    const raw = traits.value || {}
    const list = Object.entries(raw).map(([key, t]: [string, any]) => ({
      id: key,
      TraitDisplayName: t.TraitDisplayName || t.name || `Trait ${key}`,
      RarityName: t.RarityName || 'Rare',
      TraitStatus: t.TraitStatus || '',
      TraitIcon: t.TraitIcon || '',
      Stats: t.Stats || {},
      Weight: t.Weight || 0
    }))

    const rarityOrder: Record<string, number> = {
      Mythic: 1,
      Legendary: 2,
      Epic: 3,
      Rare: 4
    }

    return list.sort((a, b) => {
      const orderA = rarityOrder[a.RarityName] ?? 99
      const orderB = rarityOrder[b.RarityName] ?? 99
      if (orderA !== orderB) return orderA - orderB
      return a.TraitDisplayName.localeCompare(b.TraitDisplayName)
    })
  })

  const currentTrait = computed<UnitTrait | null>(() => {
    if (!selectedTraitId.value || selectedTraitId.value === 'none') return null
    return traitsList.value.find(t => t.id === selectedTraitId.value) || null
  })

  const maxUpgradeLevel = computed<number>(() => {
    return currentUnit.value?.maxLevel || 5
  })

  const currentMaxLevel = computed<number>(() => {
    return getMaxUnitLevel(selectedStars.value)
  })

  watch(currentMaxLevel, (newMax) => {
    if (unitLevel.value > newMax) {
      unitLevel.value = newMax
    }
  })

  const levelMultiplier = computed<number>(() => {
    return getLevelMultiplier(unitLevel.value)
  })

  const unitSkillInfo = computed(() => {
    if (!currentUnit.value) return null
    const name = currentUnit.value.name || currentUnit.value.displayName
    return currentUnit.value.skill || skills.value[name] || skills.value[currentUnit.value.displayName] || null
  })

  // Canonical central stats computation with Trait support
  const calculatedStats = computed<CalculatedStats>(() => {
    return calculateCombatStats(
      currentUnit.value,
      unitLevel.value,
      selectedStars.value,
      upgradeLevel.value,
      potentials.value,
      currentTrait.value
    )
  })

  // Action methods
  function setUnit(id: string) {
    selectedUnitId.value = id
    if (upgradeLevel.value > maxUpgradeLevel.value) {
      upgradeLevel.value = maxUpgradeLevel.value
    }
  }

  function setLevel(lvl: number) {
    unitLevel.value = Math.max(1, Math.min(currentMaxLevel.value, lvl))
  }

  function setStars(stars: number) {
    selectedStars.value = Math.max(0, Math.min(6, stars))
  }

  function setUpgradeLevel(lvl: number) {
    upgradeLevel.value = Math.max(0, Math.min(maxUpgradeLevel.value, lvl))
  }

  function setPotential(key: keyof StatPotentials, rank: PotentialRank) {
    potentials.value = {
      ...potentials.value,
      [key]: rank
    }
  }

  function setTrait(traitId: string | null) {
    selectedTraitId.value = traitId
  }

  function resetPotentials(defaultRank: PotentialRank = 'D') {
    potentials.value = {
      damage: defaultRank,
      health: defaultRank,
      range: defaultRank,
      speed: defaultRank,
      cooldown: defaultRank
    }
  }

  // Returning reactive ensures all refs and computed values are automatically unwrapped in templates and script
  return reactive({
    // Database async state
    pending,
    error,
    refresh,
    units,

    // Central state
    selectedUnitId,
    unitLevel,
    selectedStars,
    upgradeLevel,
    potentials,
    selectedTraitId,
    isSelectorOpen,

    // Computeds
    currentUnit,
    currentTrait,
    traitsList,
    maxUpgradeLevel,
    currentMaxLevel,
    levelMultiplier,
    unitSkillInfo,
    calculatedStats,

    // Actions
    setUnit,
    setLevel,
    setStars,
    setUpgradeLevel,
    setPotential,
    setTrait,
    resetPotentials
  })
}
