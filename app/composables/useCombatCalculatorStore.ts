import { ref, computed, watch, reactive } from 'vue'
import type {
  PotentialRank,
  StatPotentials,
  UnitTrait,
  CalculatedStats,
  NormalizedUnit,
  GearSlot,
  GearItem,
  EquippedGears,
  GearStatsAggregated
} from '~/types/unit'
import {
  DEFAULT_POTENTIALS,
  calculateCombatStats,
  getLevelMultiplier,
  getMaxUnitLevel,
  resolveGearStatsForUnit
} from '~/utils/unitCalculator'

// Global Singleton Reactive State (Shared across all calculator components without emits)
const selectedUnitId = ref<string>('')
const unitLevel = ref<number>(1)
const selectedStars = ref<number>(0)
const upgradeLevel = ref<number>(0)
const potentials = ref<StatPotentials>({ ...DEFAULT_POTENTIALS })
const selectedTraitIds = ref<[string | null, string | null]>([null, null])
const isSelectorOpen = ref<boolean>(false)
const equippedGears = ref<EquippedGears>({
  Head: null,
  Body: null,
  Arm: null,
  Legs: null
})

export function useCombatCalculatorStore() {
  const { units, skills, traits, gears, dbPending: pending, dbError: error, refresh } = useDatabase()

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

  const currentTraits = computed<UnitTrait[]>(() => {
    const list: UnitTrait[] = []
    for (const id of selectedTraitIds.value) {
      if (!id || id === 'none') continue
      const found = traitsList.value.find(t => t.id === id)
      if (found) list.push(found)
    }
    return list
  })

  const currentTrait = computed<UnitTrait | null>(() => {
    return currentTraits.value[0] || null
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

  // Normalized list of gears from database.json, sorted by Rarity Tier
  const gearsList = computed<GearItem[]>(() => {
    const raw = gears.value || {}
    const list = Object.entries(raw).map(([key, g]: [string, any]) => ({
      id: key,
      Name: g.Name || `Gear ${key}`,
      Slot: (g.Slot || 'Head') as GearSlot,
      Rarity: g.Rarity || 'Rare',
      Stats: g.Stats || {},
      Icon: g.Icon || '',
      Description: g.Description || ''
    }))

    const rarityOrder: Record<string, number> = {
      Exclusive: 1,
      Secret: 2,
      Mythic: 3,
      Legendary: 4,
      Epic: 5,
      Rare: 6
    }

    return list.sort((a, b) => {
      const orderA = rarityOrder[a.Rarity] ?? 99
      const orderB = rarityOrder[b.Rarity] ?? 99
      if (orderA !== orderB) return orderA - orderB
      return a.Name.localeCompare(b.Name)
    })
  })

  const gearsBySlot = computed<Record<GearSlot, GearItem[]>>(() => {
    const map: Record<GearSlot, GearItem[]> = {
      Head: [],
      Body: [],
      Arm: [],
      Legs: []
    }
    for (const g of gearsList.value) {
      if (map[g.Slot]) {
        map[g.Slot].push(g)
      }
    }
    return map
  })

  const activeEquippedGears = computed<Record<GearSlot, GearItem | null>>(() => {
    return {
      Head: gearsList.value.find(g => g.id === equippedGears.value.Head) || null,
      Body: gearsList.value.find(g => g.id === equippedGears.value.Body) || null,
      Arm: gearsList.value.find(g => g.id === equippedGears.value.Arm) || null,
      Legs: gearsList.value.find(g => g.id === equippedGears.value.Legs) || null
    }
  })

  // Aggregated Gear Stats across all 4 slots + unit exclusive bonuses
  const aggregatedGearStats = computed<GearStatsAggregated>(() => {
    const totals: GearStatsAggregated = {
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

    const equipped = activeEquippedGears.value
    const slots: GearSlot[] = ['Head', 'Body', 'Arm', 'Legs']

    for (const s of slots) {
      const g = equipped[s]
      if (!g) continue

      const { baseStats, exclusiveBonus } = resolveGearStatsForUnit(g, currentUnit.value)

      for (const [k, v] of Object.entries(baseStats)) {
        if (typeof (totals as any)[k] === 'number') {
          ;(totals as any)[k] += v
        } else {
          ;(totals as any)[k] = v
        }
      }

      if (exclusiveBonus) {
        totals.activeExclusiveBonuses.push({
          gearName: g.Name,
          unitKey: exclusiveBonus.unitKey,
          stats: exclusiveBonus.stats
        })
      }
    }

    return totals
  })

  // Canonical central stats computation with 2-Trait & Gear support
  const calculatedStats = computed<CalculatedStats>(() => {
    return calculateCombatStats(
      currentUnit.value,
      unitLevel.value,
      selectedStars.value,
      upgradeLevel.value,
      potentials.value,
      currentTraits.value,
      aggregatedGearStats.value
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

  function setTrait(traitId: string | null, slotIndex: number = 0) {
    const next: [string | null, string | null] = [...selectedTraitIds.value]
    next[slotIndex] = traitId && traitId !== 'none' ? traitId : null
    selectedTraitIds.value = next
  }

  function clearTraits() {
    selectedTraitIds.value = [null, null]
  }

  function setGear(slot: GearSlot, gearId: string | null) {
    equippedGears.value = {
      ...equippedGears.value,
      [slot]: gearId && gearId !== 'none' ? gearId : null
    }
  }

  function clearGears() {
    equippedGears.value = {
      Head: null,
      Body: null,
      Arm: null,
      Legs: null
    }
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
    selectedTraitIds,
    selectedTraitId: computed(() => selectedTraitIds.value[0]),
    equippedGears,
    isSelectorOpen,

    // Computeds
    currentUnit,
    currentTrait,
    currentTraits,
    traitsList,
    gearsList,
    gearsBySlot,
    activeEquippedGears,
    aggregatedGearStats,
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
    clearTraits,
    setGear,
    clearGears,
    resetPotentials
  })
}
