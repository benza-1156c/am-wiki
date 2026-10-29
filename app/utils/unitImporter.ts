import type {
  RawUnitConfig,
  NormalizedUnit,
  MergeMode,
  MergeResult,
  UnitDiffField,
  UnitDiffItem
} from '~/types/unit'
import { calculateUnitLevels } from '~/utils/unitCalculator'

const BANNED_ASSET_IDS = new Set(['70720622687708', '0'])

/**
 * Filters out common UI background patterns / placeholder textures
 */
export function cleanUnitIcon(icon: string | null | undefined): string | null {
  if (!icon) return null
  const str = String(icon)
  const match = str.match(/rbxassetid:\/\/(\d+)/) || str.match(/(\d{6,})/)
  if (match && match[1] && BANNED_ASSET_IDS.has(match[1])) {
    return null
  }
  return icon
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
    icon: cleanUnitIcon(raw.Icon || raw.icon || raw.TextureId || raw.Texture || raw.thumbnail || null),
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
 * Computes deep differences between existing unit and new merged unit
 */
export function computeUnitDiff(oldU: NormalizedUnit, newU: NormalizedUnit): UnitDiffField[] {
  const diffs: UnitDiffField[] = []

  const oldIcon = oldU.icon || null
  const newIcon = newU.icon || null
  if (oldIcon !== newIcon) {
    diffs.push({
      field: 'icon',
      label: 'Icon',
      oldValue: oldIcon,
      newValue: newIcon
    })
  }

  const oldModel = oldU.model || null
  const newModel = newU.model || null
  if (oldModel !== newModel) {
    diffs.push({
      field: 'model',
      label: '3D Model',
      oldValue: oldModel,
      newValue: newModel
    })
  }

  if (newU.rarity && oldU.rarity && newU.rarity !== oldU.rarity) {
    diffs.push({
      field: 'rarity',
      label: 'Rarity',
      oldValue: oldU.rarity,
      newValue: newU.rarity
    })
  }

  if (newU.element && oldU.element && newU.element !== oldU.element) {
    diffs.push({
      field: 'element',
      label: 'Element',
      oldValue: oldU.element,
      newValue: newU.element
    })
  }

  if (newU.baseDamage !== undefined && oldU.baseDamage !== undefined && newU.baseDamage !== oldU.baseDamage) {
    diffs.push({
      field: 'baseDamage',
      label: 'Base DMG',
      oldValue: oldU.baseDamage,
      newValue: newU.baseDamage
    })
  }

  if (newU.spawnCooldown !== undefined && oldU.spawnCooldown !== undefined && newU.spawnCooldown !== oldU.spawnCooldown) {
    diffs.push({
      field: 'spawnCooldown',
      label: 'Spawn Cooldown',
      oldValue: oldU.spawnCooldown,
      newValue: newU.spawnCooldown
    })
  }

  if (newU.statsAtBase?.attack !== undefined && oldU.statsAtBase?.attack !== undefined && newU.statsAtBase?.attack !== oldU.statsAtBase?.attack) {
    diffs.push({
      field: 'statsAtBase.attack',
      label: 'Base ATK',
      oldValue: oldU.statsAtBase?.attack,
      newValue: newU.statsAtBase?.attack
    })
  }

  if (newU.statsAtBase?.cost !== undefined && oldU.statsAtBase?.cost !== undefined && newU.statsAtBase?.cost !== oldU.statsAtBase?.cost) {
    diffs.push({
      field: 'statsAtBase.cost',
      label: 'Cost',
      oldValue: oldU.statsAtBase?.cost,
      newValue: newU.statsAtBase?.cost
    })
  }

  return diffs
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
    const diffItems: UnitDiffItem[] = list.map(u => ({
      id: u.id,
      name: u.name,
      displayName: u.displayName || u.name,
      status: 'new' as const,
      diffs: [],
      unit: u
    }))
    return {
      mergedUnits: list,
      addedCount: list.length,
      updatedCount: 0,
      unchangedCount: 0,
      skippedCount: 0,
      newUnitsList: list,
      diffItems
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
  let unchangedCount = 0
  let skippedCount = 0
  const newUnitsList: NormalizedUnit[] = []
  const diffItems: UnitDiffItem[] = []

  for (const item of rawList) {
    const raw = item.data
    const key = item.key
    const id = String(raw.Id || raw.id || key).toLowerCase()
    const name = String(raw.Name || raw.name || key).toLowerCase()

    const existingIdx = idMap.has(id) ? idMap.get(id)! : (nameMap.has(name) ? nameMap.get(name)! : -1)

    if (existingIdx !== -1) {
      const existing = resultList[existingIdx]
      if (mode === 'skip_duplicates') {
        skippedCount++
        unchangedCount++
        diffItems.push({
          id: existing.id,
          name: existing.name,
          displayName: existing.displayName || existing.name,
          status: 'unchanged',
          diffs: [],
          unit: existing,
          oldUnit: existing
        })
      } else {
        const normalized = normalizeUnit(key, raw, existing.skill || activeSkills[raw.Name || key])
        const merged: NormalizedUnit = {
          ...existing,
          ...normalized,
          skill: existing.skill || normalized.skill
        }
        const diffs = computeUnitDiff(existing, merged)
        resultList[existingIdx] = merged

        if (diffs.length > 0) {
          updatedCount++
          diffItems.push({
            id: merged.id,
            name: merged.name,
            displayName: merged.displayName || merged.name,
            status: 'modified',
            diffs,
            unit: merged,
            oldUnit: existing
          })
        } else {
          unchangedCount++
          diffItems.push({
            id: merged.id,
            name: merged.name,
            displayName: merged.displayName || merged.name,
            status: 'unchanged',
            diffs: [],
            unit: merged,
            oldUnit: existing
          })
        }
      }
    } else {
      const normalized = normalizeUnit(key, raw, activeSkills[raw.Name || key])
      resultList.push(normalized)
      const newIdx = resultList.length - 1
      idMap.set(normalized.id.toLowerCase(), newIdx)
      nameMap.set(normalized.name.toLowerCase(), newIdx)
      addedCount++
      newUnitsList.push(normalized)
      diffItems.push({
        id: normalized.id,
        name: normalized.name,
        displayName: normalized.displayName || normalized.name,
        status: 'new',
        diffs: [],
        unit: normalized
      })
    }
  }

  return {
    mergedUnits: resultList,
    addedCount,
    updatedCount,
    unchangedCount,
    skippedCount,
    newUnitsList,
    diffItems
  }
}
