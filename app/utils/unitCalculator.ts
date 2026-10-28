export interface RawUnitConfig {
  Name?: string
  name?: string
  Id?: string
  id?: string
  DisplayName?: string
  displayName?: string
  Series?: string
  series?: string
  Rarity?: string
  rarity?: string
  Element?: string
  element?: string
  SkillMode?: string
  skillMode?: string
  Damage?: number
  BaseDamage?: number
  HP?: number
  Range?: number
  AttackSpeed?: number
  Cost?: number
  SkillRadius?: number
  SkillRange?: number
  SkillWidth?: number
  SkillDamage?: number
  SkillCooldown?: number
  CritChance?: number
  CritDamage?: number
  SellCost?: number
  SpawnCooldown?: number
  WalkSpeed?: number
  UnitCap?: number
  MaxUpgradeLevel?: number
  UpgradeStatMultiplier?: number
  UpgradeCostMultiplier?: number
  UpgradeOverrides?: Record<string, any>
  UpgradeBase?: Record<string, number> | number
  Evolution?: any
  levels?: Record<string, any>
  skill?: any
}

export function calculateUnitLevels(raw: RawUnitConfig): Record<string, any> {
  if (raw.levels && Object.keys(raw.levels).length > 0) {
    return raw.levels
  }

  const maxLvl = raw.MaxUpgradeLevel || 5
  const baseDamage = raw.Damage || raw.BaseDamage || 50
  const baseHP = raw.HP || 100
  const baseRange = raw.Range || 15
  const baseSpeed = raw.AttackSpeed || 3
  const baseCost = raw.Cost || 800
  const statMult = raw.UpgradeStatMultiplier || 1.2
  const overrides = raw.UpgradeOverrides || {}
  const upgradeBase = raw.UpgradeBase || {}

  const levels: Record<string, any> = {}

  for (let lvl = 0; lvl <= maxLvl; lvl++) {
    const lvlOverrides = overrides[String(lvl)] || {}
    const multiplier = lvl <= 1 ? 1 : Math.pow(statMult, lvl - 1)

    const attack = lvlOverrides.Attack || lvlOverrides.Damage || Math.round((baseDamage * multiplier) * 10) / 10
    const health = lvlOverrides.Health || lvlOverrides.HP || Math.round((baseHP * multiplier) * 10) / 10
    const range = lvlOverrides.Range !== undefined ? lvlOverrides.Range : baseRange
    const attackSpeed = lvlOverrides.AttackSpeed !== undefined ? lvlOverrides.AttackSpeed : baseSpeed
    const skillRange = lvlOverrides.SkillRange !== undefined ? lvlOverrides.SkillRange : (raw.SkillRange || range)
    const skillRadius = lvlOverrides.SkillRadius !== undefined ? lvlOverrides.SkillRadius : (raw.SkillRadius || 0)
    const skillWidth = lvlOverrides.SkillWidth !== undefined ? lvlOverrides.SkillWidth : (raw.SkillWidth || 0)
    const skillDamage = raw.SkillDamage ? Math.round(attack * raw.SkillDamage * 10) / 10 : attack
    const skillCooldown = lvlOverrides.SkillCooldown !== undefined ? lvlOverrides.SkillCooldown : (raw.SkillCooldown || 5)

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
      Speed: lvlOverrides.WalkSpeed || raw.WalkSpeed || 8,
      unitsCapp: raw.UnitCap || 2,
      Name: raw.Name || raw.name || raw.Id || 'Unit'
    }
  }

  return levels
}

export function normalizeUnit(key: string, raw: RawUnitConfig, existingSkill?: any): any {
  const id = raw.Id || raw.id || key
  const name = raw.Name || raw.name || key
  const maxLvl = raw.MaxUpgradeLevel || (raw.levels ? Object.keys(raw.levels).length - 1 : 5)
  const levels = calculateUnitLevels(raw)

  const baseLvl = levels['0'] || {}
  const maxLvlData = levels[String(maxLvl)] || baseLvl

  const baseAtk = baseLvl.Attack || raw.Damage || 50
  const baseSpa = baseLvl.AttackSpeed || raw.AttackSpeed || 3
  const maxAtk = maxLvlData.Attack || baseAtk
  const maxSpa = maxLvlData.AttackSpeed || baseSpa

  return {
    id,
    name,
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
    levels,
    skill: existingSkill || raw.skill || null,
    statsAtBase: {
      attack: baseAtk,
      dps: Math.round(baseAtk / (baseSpa || 1)),
      attackSpeed: baseSpa,
      range: baseLvl.Range || raw.Range || 15,
      health: baseLvl.Health || raw.HP || 100,
      skillDamage: baseLvl.SkillDamage || baseAtk,
      cost: baseLvl.Cost || raw.Cost || 800
    },
    statsAtMax: {
      attack: maxAtk,
      dps: Math.round(maxAtk / (maxSpa || 1)),
      attackSpeed: maxSpa,
      range: maxLvlData.Range || baseLvl.Range || 15,
      health: maxLvlData.Health || baseLvl.Health || 100,
      skillDamage: maxLvlData.SkillDamage || maxAtk,
      cost: maxLvlData.Cost || baseLvl.Cost || 800
    }
  }
}

export function parseAndMergeUnits(
  importedJson: any,
  currentUnits: any[],
  skillsData: Record<string, any> = {},
  mode: 'merge' | 'skip_duplicates' | 'overwrite_all' = 'merge'
): {
  mergedUnits: any[]
  addedCount: number
  updatedCount: number
  skippedCount: number
  newUnitsList: any[]
} {
  let rawList: { key: string; data: any }[] = []

  if (Array.isArray(importedJson)) {
    rawList = importedJson.map(item => ({
      key: item.id || item.name || item.Id || item.Name || 'Unit',
      data: item
    }))
  } else if (typeof importedJson === 'object' && importedJson !== null) {
    // If it has "units" subkey (like database.json or unit.json)
    if (importedJson.units && typeof importedJson.units === 'object') {
      const u = importedJson.units
      if (Array.isArray(u)) {
        rawList = u.map(item => ({ key: item.id || item.name, data: item }))
      } else {
        rawList = Object.entries(u).map(([k, v]) => ({ key: k, data: v }))
      }
    } else {
      rawList = Object.entries(importedJson)
        .filter(([k]) => k !== 'RunConfig' && k !== 'ShinySwapData')
        .map(([k, v]) => ({ key: k, data: v }))
    }
  }

  if (mode === 'overwrite_all') {
    const list = rawList.map(r => normalizeUnit(r.key, r.data, skillsData[r.data.Name || r.key]))
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
    idMap.set(u.id.toLowerCase(), idx)
    nameMap.set(u.name.toLowerCase(), idx)
  })

  let addedCount = 0
  let updatedCount = 0
  let skippedCount = 0
  const newUnitsList: any[] = []

  for (const item of rawList) {
    const raw = item.data
    const key = item.key
    const id = (raw.Id || raw.id || key).toLowerCase()
    const name = (raw.Name || raw.name || key).toLowerCase()

    const existingIdx = idMap.has(id) ? idMap.get(id)! : (nameMap.has(name) ? nameMap.get(name)! : -1)

    if (existingIdx !== -1) {
      if (mode === 'skip_duplicates') {
        skippedCount++
      } else {
        // Merge updates
        const existing = resultList[existingIdx]
        const normalized = normalizeUnit(key, raw, existing.skill || skillsData[raw.Name || key])
        resultList[existingIdx] = {
          ...existing,
          ...normalized,
          skill: existing.skill || normalized.skill
        }
        updatedCount++
      }
    } else {
      // Brand new unit
      const normalized = normalizeUnit(key, raw, skillsData[raw.Name || key])
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
