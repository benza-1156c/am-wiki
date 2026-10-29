import type {
  RawUnitConfig,
  AwakeningBonus,
  PotentialRank,
  PotentialConfig,
  StatPotentials,
  CalculatedStats,
  UnitTrait,
  GearStatsAggregated
} from '~/types/unit'

/**
 * Checks if a gear's exclusive unit target matches the current unit
 */
export function matchesUnit(key: string, unit: any): boolean {
  if (!unit || !key) return false
  const targets = key.split(',').map(s => s.trim().toLowerCase())
  const unitId = (unit.id || '').toLowerCase()
  const unitName = (unit.name || '').toLowerCase()
  const unitDisplayName = (unit.displayName || '').toLowerCase()
  return targets.some(t =>
    t === unitId ||
    t === unitName ||
    t === unitDisplayName
  )
}

/**
 * Resolves a gear's active stats given the current unit (including exclusive bonuses if matched)
 */
export function resolveGearStatsForUnit(gear: any, unit: any) {
  const baseStats: Record<string, number> = {}
  let exclusiveBonus: { unitKey: string; stats: Record<string, number> } | null = null

  if (!gear || !gear.Stats) return { baseStats, exclusiveBonus }

  for (const [k, v] of Object.entries(gear.Stats)) {
    if (typeof v === 'number') {
      baseStats[k] = (baseStats[k] || 0) + v
    } else if (typeof v === 'object' && v !== null) {
      if (matchesUnit(k, unit)) {
        exclusiveBonus = { unitKey: k, stats: v as Record<string, number> }
        for (const [subK, subV] of Object.entries(v)) {
          if (typeof subV === 'number') {
            baseStats[subK] = (baseStats[subK] || 0) + subV
          }
        }
      }
    }
  }

  return { baseStats, exclusiveBonus }
}

/**
 * Potential / Stat Grade ranks (from status.md and in-game UI)
 * Each rank directly defines its label, multiplier, text color, and select box style.
 */
export const POTENTIAL_CONFIGS: Record<PotentialRank, PotentialConfig> = {
  NONE: {
    key: 'NONE',
    label: '-',
    percent: 0,
    color: 'text-neutral-400',
    selectClass: 'border-neutral-700 text-neutral-400 bg-neutral-900'
  },
  D: {
    key: 'D',
    label: 'D',
    percent: 0.05,
    color: 'text-neutral-300',
    selectClass: 'border-neutral-500 text-neutral-300 bg-neutral-900'
  },
  C: {
    key: 'C',
    label: 'C',
    percent: 0.10,
    color: 'text-emerald-400',
    selectClass: 'border-emerald-500 text-emerald-300 bg-emerald-950/40'
  },
  B: {
    key: 'B',
    label: 'B',
    percent: 0.15,
    color: 'text-blue-400',
    selectClass: 'border-blue-500 text-blue-300 bg-blue-950/40'
  },
  A: {
    key: 'A',
    label: 'A',
    percent: 0.20,
    color: 'text-sky-400',
    selectClass: 'border-sky-500 text-sky-300 bg-sky-950/40'
  },
  S: {
    key: 'S',
    label: 'S',
    percent: 0.25,
    color: 'text-yellow-400',
    selectClass: 'border-yellow-500 text-yellow-300 bg-yellow-950/40 shadow-sm shadow-yellow-500/20'
  },
  SS: {
    key: 'SS',
    label: 'SS',
    percent: 0.30,
    color: 'text-amber-400',
    selectClass: 'border-amber-500 text-amber-300 bg-amber-950/40 shadow-sm shadow-amber-500/20'
  },
  SSS: {
    key: 'SSS',
    label: 'SSS',
    percent: 0.35,
    color: 'text-rose-400',
    selectClass: 'border-rose-500 text-rose-300 bg-rose-950/40 shadow-sm shadow-rose-500/20'
  },
  GOD: {
    key: 'GOD',
    label: '神',
    percent: 0.50,
    color: 'text-fuchsia-400',
    selectClass: 'border-fuchsia-500 text-fuchsia-300 bg-fuchsia-950/40 shadow-sm shadow-fuchsia-500/20'
  }
}

export const POTENTIAL_RANK_ORDER: PotentialRank[] = [
  'NONE', 'D', 'C', 'B', 'A', 'S', 'SS', 'SSS', 'GOD'
]

/**
 * Default StatPotentials starts at 'D' (+5%) as requested
 */
export const DEFAULT_POTENTIALS: StatPotentials = {
  damage: 'D',
  health: 'D',
  range: 'D',
  speed: 'D',
  cooldown: 'D'
}

export function getNextPotentialRank(current?: PotentialRank): PotentialRank {
  const cur = current || 'NONE'
  const idx = POTENTIAL_RANK_ORDER.indexOf(cur)
  if (idx === -1 || idx === POTENTIAL_RANK_ORDER.length - 1) {
    return POTENTIAL_RANK_ORDER[0] ?? 'NONE'
  }
  return POTENTIAL_RANK_ORDER[idx + 1] ?? 'NONE'
}

export function getPotentialMultiplier(rank?: PotentialRank): number {
  if (!rank || !POTENTIAL_CONFIGS[rank]) return 0
  return POTENTIAL_CONFIGS[rank].percent
}

export function getRankTextColor(rank?: PotentialRank): string {
  return POTENTIAL_CONFIGS[rank || 'NONE']?.color || 'text-neutral-400'
}

export function getRankSelectStyle(rank?: PotentialRank): string {
  return POTENTIAL_CONFIGS[rank || 'NONE']?.selectClass || 'border-neutral-700 text-neutral-400 bg-neutral-900'
}

/**
 * Resolves upgrade overrides for a specific upgrade level,
 * supporting both exact keys ("1") and range keys ("5-10").
 */
export function getUpgradeOverridesForLevel(
  overrides: Record<string, any> = {},
  level: number
): Record<string, any> {
  let resolved: Record<string, any> = {}
  for (const [key, val] of Object.entries(overrides)) {
    if (key.includes('-')) {
      const parts = key.split('-')
      const start = parseInt(parts[0] || '0', 10)
      const end = parseInt(parts[1] || '0', 10)
      if (level >= start && level <= end) {
        resolved = { ...resolved, ...val }
      }
    } else if (parseInt(key, 10) === level) {
      resolved = { ...resolved, ...val }
    }
  }
  return resolved
}

/**
 * Global canonical combat calculation engine
 */
export function calculateCombatStats(
  unit: any,
  unitLevel: number = 1,
  stars: number = 0,
  upgradeLevel: number = 0,
  potentials: StatPotentials = {},
  traitsInput?: UnitTrait[] | UnitTrait | null,
  gearStats?: Partial<GearStatsAggregated> | null
): CalculatedStats {
  const activeTraits: UnitTrait[] = Array.isArray(traitsInput)
    ? traitsInput.filter((t): t is UnitTrait => !!t)
    : (traitsInput ? [traitsInput] : [])

  if (!unit) {
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
      cost: 0,
      critChance: 0.05,
      critDamage: 1.1,
      potentials,
      potentialPercents: {},
      trait: activeTraits[0] || null,
      traits: activeTraits,
      gearStats: undefined
    }
  }

  const baseDmg = unit.baseDamage || unit.Damage || 50
  const baseHp = unit.statsAtBase?.health || unit.HP || 100
  const baseRange = unit.statsAtBase?.range || unit.Range || 15
  const baseSpeed = unit.statsAtBase?.speed || unit.WalkSpeed || 8
  const baseSpa = unit.statsAtBase?.attackSpeed || unit.AttackSpeed || 3
  const baseCost = unit.statsAtBase?.cost || unit.Cost || 800
  const statMult = unit.upgradeStatMultiplier || 1.2
  const overrides = unit.upgradeOverrides || {}

  const lvlOverrides = getUpgradeOverridesForLevel(overrides, upgradeLevel)
  const upgMult = upgradeLevel <= 1 ? 1 : Math.pow(statMult, upgradeLevel - 1)

  const rawAtk = lvlOverrides.Attack || lvlOverrides.Damage || Math.round(baseDmg * upgMult * 10) / 10
  const rawHp = lvlOverrides.Health || lvlOverrides.HP || Math.round(baseHp * upgMult * 10) / 10
  const rawRange = lvlOverrides.Range !== undefined ? lvlOverrides.Range : baseRange
  const rawSpeed = lvlOverrides.WalkSpeed || baseSpeed
  const rawSpa = lvlOverrides.AttackSpeed !== undefined ? lvlOverrides.AttackSpeed : baseSpa
  const rawCd = lvlOverrides.SkillCooldown || unit.SkillCooldown || 5

  const lvlMult = getLevelMultiplier(unitLevel)
  const awk = getAwakeningBonuses(stars)

  // Potential Rank Multipliers (status.md: D=5%, C=10%, B=15%, SS=30%, SSS=35%, 神=50%)
  const potDmg = getPotentialMultiplier(potentials.damage)
  const potHp = getPotentialMultiplier(potentials.health)
  const potRange = getPotentialMultiplier(potentials.range)
  const potSpeed = getPotentialMultiplier(potentials.speed)
  const potCd = getPotentialMultiplier(potentials.cooldown)

  // Trait Boosts (aggregated across all equipped traits, up to 2 traits)
  let traitDmg = 0
  let traitHp = 0
  let traitRange = 0
  let traitSpeed = 0
  let traitAs = 0
  let traitSkillDmg = 0
  let traitSkillCd = 0
  let traitCostRed = 0
  let traitCritChance = 0
  let traitCritDmg = 0

  for (const t of activeTraits) {
    const tStats = t.Stats || {}
    traitDmg += tStats.DamageBoost || 0
    traitHp += tStats.HealthBoost || 0
    traitRange += tStats.RangeBoost || 0
    traitSpeed += tStats.SpeedBoost || 0
    traitAs += tStats.AttackSpeedBoost || 0
    traitSkillDmg += tStats.SkillDamageBoost || 0
    traitSkillCd += tStats.SkillCooldownReduction || 0
    traitCostRed += tStats.CostReduction || 0
    traitCritChance += tStats.CritChanceBoost || 0
    traitCritDmg += tStats.CritDamageBoost || 0
  }

  // Gear Boosts (aggregated from 4 equipped gear slots + exclusive unit bonuses)
  const gDmg = gearStats?.DamageBoost || 0
  const gHp = gearStats?.HealthBoost || 0
  const gRange = gearStats?.RangeBoost || 0
  const gSpeed = gearStats?.SpeedBoost || 0
  const gAs = gearStats?.AttackSpeedBoost || 0
  const gSkillDmg = gearStats?.SkillDamageBoost || 0
  const gSkillCd = gearStats?.SkillCooldownReduction || 0
  const gCostRed = gearStats?.CostReduction || 0
  const gCritChance = gearStats?.CritChanceBoost || 0
  const gCritDmg = gearStats?.CritDamageBoost || 0

  // 1. Damage (ATK) - boosted by level, awakening, potential, trait, and gear
  const totalDmgFactor = (1 + traitDmg + gDmg)
  const attack = Math.round(rawAtk * lvlMult * (1 + awk.damage) * (1 + potDmg) * totalDmgFactor * 10) / 10

  // 2. Health (HP) - boosted by level, awakening, potential, trait, and gear
  const totalHpFactor = (1 + traitHp + gHp)
  const health = Math.round(rawHp * lvlMult * (1 + awk.health) * (1 + potHp) * totalHpFactor * 10) / 10

  // 3. Range - boosted by awakening, potential, trait, and gear
  const totalRangeFactor = (1 + traitRange + gRange)
  const range = Math.round(rawRange * (1 + awk.range) * (1 + potRange) * totalRangeFactor * 10) / 10
  const rawSkillRange = lvlOverrides.SkillRange || unit.SkillRange || range
  const skillRange = Math.round(rawSkillRange * (1 + potRange) * totalRangeFactor * 10) / 10

  // 4. Speed - boosted by awakening, potential, trait, and gear
  const totalSpeedFactor = (1 + traitSpeed + gSpeed)
  const speed = Math.round(rawSpeed * (1 + awk.speed) * (1 + potSpeed) * totalSpeedFactor * 10) / 10

  // 5. Attack Speed (SPA) / Attack Cooldown:
  // Potential cooldown, trait AttackSpeedBoost, and gear AttackSpeedBoost reduce SPA
  const totalSpaReduction = potCd + traitAs + gAs
  const attackSpeed = Math.round(rawSpa * Math.max(0.05, 1 - totalSpaReduction) * 100) / 100

  // DPS (ATK / SPA)
  const dps = Math.round((attack / (attackSpeed || 1)) * 10) / 10

  // Skill Damage: Boosted by Damage, Trait Skill DMG, and Gear Skill DMG
  const rawSkillDmg = lvlOverrides.SkillDamage || (unit.skillDamage ? unit.skillDamage : rawAtk * 1.5)
  const totalSkillDmgFactor = (1 + traitSkillDmg + gSkillDmg)
  const skillDamage = Math.round(rawSkillDmg * lvlMult * (1 + awk.skillDamage) * (1 + potDmg) * totalDmgFactor * totalSkillDmgFactor * 10) / 10

  // Skill Cooldown: Trait and Gear SkillCooldownReduction reduce skill cooldown
  const totalSkillCdReduction = Math.min(0.9, traitSkillCd + gSkillCd)
  const skillCooldown = Math.round(rawCd * Math.max(0.1, 1 - totalSkillCdReduction) * 100) / 100

  // Cost: Trait and Gear CostReduction lower cost
  const totalCostReduction = Math.min(0.8, traitCostRed + gCostRed)
  const cost = Math.max(0, Math.round(baseCost * (1 - totalCostReduction)))

  // Crit Chance & Damage
  const critChance = Math.round(((unit.CritChance || 0.05) + traitCritChance + gCritChance) * 100) / 100
  const critDamage = Math.round(((unit.CritDamage || 1.1) + traitCritDmg + gCritDmg) * 100) / 100

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
    skillRange,
    speed,
    skillDamage,
    skillCooldown,
    cost,
    critChance,
    critDamage,
    potentials,
    potentialPercents: {
      damage: Math.round(potDmg * 100),
      health: Math.round(potHp * 100),
      range: Math.round(potRange * 100),
      speed: Math.round(potSpeed * 100),
      cooldown: Math.round(potCd * 100),
      attackSpeed: Math.round(traitAs * 100),
      skillDamage: Math.round(potDmg * 100)
    },
    trait: activeTraits[0] || null,
    traits: activeTraits,
    gearStats: gearStats || undefined
  }
}

/**
 * Returns Awakening bonuses based on star count (0 to 6 stars).
 * Exact game logic from CalculateUnitsStats:
 * - Star 1 : +1% Damage
 * - Star 2 : +2% Health
 * - Star 3 : +2% Speed
 * - Star 4 : +2% Skill Damage
 * - Star 5 : +2% Range
 * - Star 6 : +5% Damage (Total +6% Damage)
 */
export function getAwakeningBonuses(stars: number = 0): AwakeningBonus {
  const s = Math.max(0, Math.min(6, Math.floor(stars)))
  return {
    damage: s >= 6 ? 0.06 : (s >= 1 ? 0.01 : 0),
    health: s >= 2 ? 0.02 : 0,
    speed: s >= 3 ? 0.02 : 0,
    skillDamage: s >= 4 ? 0.02 : 0,
    range: s >= 5 ? 0.02 : 0
  }
}

/**
 * Returns max unit level based on star count.
 * Exact formula from GetUnitMaxLevel:
 * MaxLevel = 50 + (Stars * 5)
 * 0 Stars: 50, 6 Stars: 80
 */
export function getMaxUnitLevel(stars: number = 0): number {
  const s = Math.max(0, Math.min(6, Math.floor(stars)))
  return 50 + (s * 5)
}

/**
 * Returns stat multiplier based on unit level (1 to 80).
 * Exact formula from CalculateUnitsStats:
 * LevelMultiplier = 1 + (Level - 1) * 0.1
 * (Each level gives +10% of base stat)
 */
export function getLevelMultiplier(level: number = 1): number {
  const lvl = Math.max(1, Math.min(80, Math.floor(level)))
  return 1 + (lvl - 1) * 0.1
}

/**
 * Returns EXP required for next level.
 * Formula from UnitLevelData:
 * BaseExp = 50, Multiplier = 1.15
 */
export function getExpForLevel(level: number = 1): number {
  return Math.floor(50 * Math.pow(1.15, Math.max(0, level - 1)))
}

/**
 * Calculates in-game upgrade levels (0 to MaxUpgradeLevel)
 */
export function calculateUnitLevels(
  raw: RawUnitConfig,
  unitLevel: number = 1,
  stars: number = 0
): Record<string, any> {
  const maxLvl = raw.MaxUpgradeLevel || 5
  const baseDamage = raw.Damage || raw.BaseDamage || 50
  const baseHP = raw.HP || 100
  const baseRange = raw.Range || 15
  const baseSpeed = raw.AttackSpeed || 3
  const baseCost = raw.Cost || 800
  const statMult = raw.UpgradeStatMultiplier || 1.2
  const overrides = raw.UpgradeOverrides || {}
  const upgradeBase = raw.UpgradeBase || {}

  const levelMult = getLevelMultiplier(unitLevel)
  const awakening = getAwakeningBonuses(stars)

  const levels: Record<string, any> = {}

  for (let lvl = 0; lvl <= maxLvl; lvl++) {
    const lvlOverrides = getUpgradeOverridesForLevel(overrides, lvl)
    const multiplier = lvl <= 1 ? 1 : Math.pow(statMult, lvl - 1)

    const rawAtk = lvlOverrides.Attack || lvlOverrides.Damage || Math.round((baseDamage * multiplier) * 10) / 10
    const rawHP = lvlOverrides.Health || lvlOverrides.HP || Math.round((baseHP * multiplier) * 10) / 10
    const rawRange = lvlOverrides.Range !== undefined ? lvlOverrides.Range : baseRange
    const rawSpeed = lvlOverrides.WalkSpeed || raw.WalkSpeed || 8
    const attackSpeed = lvlOverrides.AttackSpeed !== undefined ? lvlOverrides.AttackSpeed : baseSpeed
    const skillRange = lvlOverrides.SkillRange !== undefined ? lvlOverrides.SkillRange : (raw.SkillRange || rawRange)
    const skillRadius = lvlOverrides.SkillRadius !== undefined ? lvlOverrides.SkillRadius : (raw.SkillRadius || 0)
    const skillWidth = lvlOverrides.SkillWidth !== undefined ? lvlOverrides.SkillWidth : (raw.SkillWidth || 0)
    const skillCooldown = lvlOverrides.SkillCooldown !== undefined ? lvlOverrides.SkillCooldown : (raw.SkillCooldown || 5)

    // Apply exact level multiplier & star bonuses
    const attack = Math.round(rawAtk * levelMult * (1 + awakening.damage) * 10) / 10
    const health = Math.round(rawHP * levelMult * (1 + awakening.health) * 10) / 10
    const range = Math.round(rawRange * (1 + awakening.range) * 10) / 10
    const speed = Math.round(rawSpeed * (1 + awakening.speed) * 10) / 10

    const rawSkillDmg = raw.SkillDamage ? Math.round(rawAtk * raw.SkillDamage * 10) / 10 : rawAtk
    const skillDamage = Math.round(rawSkillDmg * levelMult * (1 + awakening.skillDamage) * 10) / 10

    let nextCost = 0
    if (typeof upgradeBase === 'object' && upgradeBase !== null) {
      nextCost = (upgradeBase as Record<string, number>)[String(lvl + 1)] || Math.round(baseCost * 0.25 * (lvl + 1))
    } else {
      nextCost = Math.round(baseCost * 0.25 * (lvl + 1))
    }

    levels[String(lvl)] = {
      Attack: attack,
      Health: health,
      Range: range,
      AttackSpeed: attackSpeed,
      SkillRange: skillRange,
      SkillRadius: skillRadius,
      SkillWidth: skillWidth,
      SkillDamage: skillDamage,
      SkillCooldown: skillCooldown,
      Cost: baseCost,
      NextUpgradeCost: lvl === maxLvl ? 0 : nextCost,
      Element: raw.Element || raw.element || 'Neutral',
      SkillMode: raw.SkillMode || raw.skillMode || 'AOE',
      CritChance: raw.CritChance || 0.05,
      CritDamage: raw.CritDamage || 1.1,
      SellCost: raw.SellCost || Math.round(baseCost * 0.25),
      SpawnCooldown: raw.SpawnCooldown || 15,
      Speed: speed,
      unitsCapp: lvlOverrides.UnitCap || raw.UnitCap || 2,
      Name: raw.Name || raw.name || raw.Id || 'Unit'
    }
  }

  return levels
}
