import type {
  RawUnitConfig,
  AwakeningBonus,
  NormalizedUnit,
  MergeMode,
  MergeResult,
  PotentialRank,
  PotentialConfig,
  StatPotentials,
  CalculatedStats,
  UnitTrait
} from '~/types/unit'

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
  trait?: UnitTrait | null
): CalculatedStats {
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
      trait: null
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

  // Trait Boosts (from database.json traits)
  const tStats = trait?.Stats || {}
  const traitDmg = tStats.DamageBoost || 0
  const traitHp = tStats.HealthBoost || 0
  const traitRange = tStats.RangeBoost || 0
  const traitSpeed = tStats.SpeedBoost || 0
  const traitAs = tStats.AttackSpeedBoost || 0
  const traitSkillDmg = tStats.SkillDamageBoost || 0
  const traitSkillCd = tStats.SkillCooldownReduction || 0
  const traitCostRed = tStats.CostReduction || 0
  const traitCritChance = tStats.CritChanceBoost || 0
  const traitCritDmg = tStats.CritDamageBoost || 0

  // 1. Damage (ATK) - boosted by level, awakening, potential, and trait
  const attack = Math.round(rawAtk * lvlMult * (1 + awk.damage) * (1 + potDmg) * (1 + traitDmg) * 10) / 10

  // 2. Health (HP) - boosted by level, awakening, potential, and trait
  const health = Math.round(rawHp * lvlMult * (1 + awk.health) * (1 + potHp) * (1 + traitHp) * 10) / 10

  // 3. Range - boosted by awakening, potential, and trait
  const range = Math.round(rawRange * (1 + awk.range) * (1 + potRange) * (1 + traitRange) * 10) / 10
  const rawSkillRange = lvlOverrides.SkillRange || unit.SkillRange || range
  const skillRange = Math.round(rawSkillRange * (1 + potRange) * (1 + traitRange) * 10) / 10

  // 4. Speed - boosted by awakening, potential, and trait
  const speed = Math.round(rawSpeed * (1 + awk.speed) * (1 + potSpeed) * (1 + traitSpeed) * 10) / 10

  // 5. Attack Speed (SPA) / Attack Cooldown:
  // Potential cooldown and trait AttackSpeedBoost both reduce SPA (faster hits)
  const attackSpeed = Math.round(rawSpa * (1 - potCd) * (1 - traitAs) * 100) / 100

  // DPS (ATK / SPA)
  const dps = Math.round((attack / (attackSpeed || 1)) * 10) / 10

  // Skill Damage: Damage Potential & Trait SkillDamageBoost both increase Skill Damage
  const rawSkillDmg = lvlOverrides.SkillDamage || (unit.skillDamage ? unit.skillDamage : rawAtk * 1.5)
  const skillDamage = Math.round(rawSkillDmg * lvlMult * (1 + awk.skillDamage) * (1 + potDmg) * (1 + traitSkillDmg) * 10) / 10

  // Skill Cooldown: Trait SkillCooldownReduction reduces skill cooldown (Potential does not affect skill cooldown)
  const skillCooldown = Math.round(rawCd * (1 - traitSkillCd) * 100) / 100

  // Cost: Trait CostReduction lowers cost
  const cost = Math.max(0, Math.round(baseCost * (1 - traitCostRed)))

  // Crit Chance & Damage
  const critChance = Math.round(((unit.CritChance || 0.05) + traitCritChance) * 100) / 100
  const critDamage = Math.round(((unit.CritDamage || 1.1) + traitCritDmg) * 100) / 100

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
    trait: trait || null
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

/**
 * Normalizes a unit config into clean wiki representation
 */
export function normalizeUnit(key: string, raw: RawUnitConfig, existingSkill?: any): NormalizedUnit {
  const id = raw.Id || raw.id || key
  const name = raw.Name || raw.name || key
  const maxLvl = raw.MaxUpgradeLevel || (raw.levels ? Object.keys(raw.levels).length - 1 : 5)

  // Base stats at Lv. 1, 0 Stars, Upgrade 0
  const baseLevels = calculateUnitLevels(raw, 1, 0)
  const baseLvlData = baseLevels['0'] || {}

  // Max stats at Lv. 80, 6 Stars, Max Upgrade
  const maxLevels = calculateUnitLevels(raw, 80, 6)
  const maxLvlData = maxLevels[String(maxLvl)] || maxLevels['0'] || {}

  const baseAtk = baseLvlData.Attack || raw.Damage || 50
  const baseSpa = baseLvlData.AttackSpeed || raw.AttackSpeed || 3
  const maxAtk = maxLvlData.Attack || baseAtk
  const maxSpa = maxLvlData.AttackSpeed || baseSpa

  return {
    id,
    name,
    icon: raw.Icon || raw.icon || raw.TextureId || raw.Texture || raw.thumbnail || null,
    model: raw.Model || raw.model || raw.MeshId || null,
    displayName: raw.DisplayName || raw.displayName || name,
    series: raw.Series || raw.series || 'Other',
    rarity: raw.Rarity || raw.rarity || 'Secret',
    element: raw.Element || raw.element || 'Neutral',
    skillMode: raw.SkillMode || raw.skillMode || 'AOE',
    baseDamage: raw.Damage || raw.BaseDamage || baseAtk,
    maxLevel: maxLvl,
    unitCap: raw.UnitCap || 2,
    spawnCooldown: raw.SpawnCooldown || 15,
    evolution: raw.Evolution || null,
    upgradeBase: raw.UpgradeBase || {},
    upgradeOverrides: raw.UpgradeOverrides || {},
    upgradeStatMultiplier: raw.UpgradeStatMultiplier || 1.2,
    levels: baseLevels,
    skill: existingSkill || raw.skill || null,
    ultimateName: raw.UltimateName,
    ultimateCooldown: raw.UltimateCooldown,
    statsAtBase: {
      attack: baseAtk,
      dps: Math.round((baseAtk / (baseSpa || 1)) * 10) / 10,
      attackSpeed: baseSpa,
      range: baseLvlData.Range || raw.Range || 15,
      health: baseLvlData.Health || raw.HP || 100,
      speed: baseLvlData.Speed || raw.WalkSpeed || 8,
      skillDamage: baseLvlData.SkillDamage || baseAtk,
      cost: baseLvlData.Cost || raw.Cost || 800
    },
    statsAtMax: {
      attack: maxAtk,
      dps: Math.round((maxAtk / (maxSpa || 1)) * 10) / 10,
      attackSpeed: maxSpa,
      range: maxLvlData.Range || baseLvlData.Range || 15,
      health: maxLvlData.Health || baseLvlData.Health || 100,
      speed: maxLvlData.Speed || baseLvlData.Speed || 8,
      skillDamage: maxLvlData.SkillDamage || maxAtk,
      cost: maxLvlData.Cost || baseLvlData.Cost || 800
    }
  }
}

/**
 * Robust JSON parser and merger for test.json, am_dump.json, database.json
 */
export function parseAndMergeUnits(
  importedJson: any,
  currentUnits: any[],
  skillsData: Record<string, any> = {},
  mode: MergeMode = 'merge'
): MergeResult {
  let rawList: { key: string; data: any }[] = []

  // Auto-detect embedded skills from dumped payload
  const activeSkills: Record<string, any> = {
    ...skillsData,
    ...(importedJson && typeof importedJson === 'object' && importedJson.skills && typeof importedJson.skills === 'object' ? importedJson.skills : {})
  }

  if (Array.isArray(importedJson)) {
    rawList = importedJson.map(item => ({
      key: item.id || item.name || item.Id || item.Name || 'Unit',
      data: item
    }))
  } else if (typeof importedJson === 'object' && importedJson !== null) {
    if (importedJson.units && typeof importedJson.units === 'object') {
      const u = importedJson.units
      if (Array.isArray(u)) {
        rawList = u.map(item => ({ key: item.id || item.name, data: item }))
      } else {
        rawList = Object.entries(u).map(([k, v]) => ({ key: k, data: v }))
      }
    } else {
      rawList = Object.entries(importedJson)
        .filter(([k]) => (
          k !== 'RunConfig' &&
          k !== 'ShinySwapData' &&
          k !== 'meta' &&
          k !== 'formulas' &&
          k !== 'skills' &&
          k !== 'gears' &&
          k !== 'traits'
        ))
        .map(([k, v]) => ({ key: k, data: v }))
    }
  }

  // Filter out invalid items that lack unit stats
  rawList = rawList.filter(item => {
    const d = item.data
    return d && typeof d === 'object' && (
      d.Damage !== undefined ||
      d.BaseDamage !== undefined ||
      d.AttackSpeed !== undefined ||
      d.Cost !== undefined ||
      d.HP !== undefined ||
      d.statsAtBase !== undefined
    )
  })

  if (mode === 'overwrite_all') {
    const list = rawList.map(r => normalizeUnit(r.key, r.data, activeSkills[r.data.Name || r.key]))
    return {
      mergedUnits: list,
      addedCount: list.length,
      updatedCount: 0,
      skippedCount: 0,
      newUnitsList: list
    }
  }

  const resultList = [...currentUnits]
  const idMap = new Map<string, number>()
  const nameMap = new Map<string, number>()

  resultList.forEach((u, idx) => {
    if (u.id) idMap.set(String(u.id).toLowerCase(), idx)
    if (u.name) nameMap.set(String(u.name).toLowerCase(), idx)
  })

  let addedCount = 0
  let updatedCount = 0
  let skippedCount = 0
  const newUnitsList: NormalizedUnit[] = []

  for (const item of rawList) {
    const raw = item.data
    const key = item.key
    const id = String(raw.Id || raw.id || key).toLowerCase()
    const name = String(raw.Name || raw.name || key).toLowerCase()

    const existingIdx = idMap.has(id) ? idMap.get(id)! : (nameMap.has(name) ? nameMap.get(name)! : -1)

    if (existingIdx !== -1) {
      if (mode === 'skip_duplicates') {
        skippedCount++
      } else {
        const existing = resultList[existingIdx]
        const normalized = normalizeUnit(key, raw, existing.skill || activeSkills[raw.Name || key])
        resultList[existingIdx] = {
          ...existing,
          ...normalized,
          skill: existing.skill || normalized.skill
        }
        updatedCount++
      }
    } else {
      const normalized = normalizeUnit(key, raw, activeSkills[raw.Name || key])
      resultList.push(normalized)
      const newIdx = resultList.length - 1
      idMap.set(normalized.id.toLowerCase(), newIdx)
      nameMap.set(normalized.name.toLowerCase(), newIdx)
      addedCount++
      newUnitsList.push(normalized)
    }
  }

  return {
    mergedUnits: resultList,
    addedCount,
    updatedCount,
    skippedCount,
    newUnitsList
  }
}
