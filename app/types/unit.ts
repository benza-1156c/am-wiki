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
  skill?: SkillData | null
  UltimateName?: string
  UltimateCooldown?: number
  Icon?: string
  icon?: string
  TextureId?: string
  Texture?: string
  thumbnail?: string
  Model?: string
  model?: string
  MeshId?: string
  statsAtBase?: UnitStats
  statsAtMax?: UnitStats
}

export interface AwakeningBonus {
  damage: number
  health: number
  speed: number
  skillDamage: number
  range: number
}

export interface SkillData {
  PassiveHeader?: string | string[]
  PassiveDescription?: string | string[]
  isUltimate?: boolean
  UltimateHeader?: string
  UltimateDescription?: string
}

export interface UnitStats {
  attack: number
  dps: number
  attackSpeed: number
  range: number
  health: number
  speed?: number
  skillDamage: number
  cost: number
}

export interface NormalizedUnit {
  id: string
  name: string
  displayName: string
  series: string
  rarity: string
  element: string
  skillMode: string
  baseDamage: number
  maxLevel: number
  unitCap: number
  spawnCooldown: number
  evolution: any
  upgradeBase: Record<string, number> | number
  upgradeOverrides: Record<string, any>
  upgradeStatMultiplier: number
  levels: Record<string, any>
  skill: SkillData | null
  ultimateName?: string
  ultimateCooldown?: number
  statsAtBase: UnitStats
  statsAtMax: UnitStats
  icon?: string | null
  model?: string | null
}

export type PotentialRank = 'NONE' | 'D' | 'C' | 'B' | 'A' | 'S' | 'SS' | 'SSS' | 'GOD'

export interface PotentialConfig {
  key: PotentialRank
  label: string
  percent: number
  color: string
}

export interface StatPotentials {
  damage?: PotentialRank
  health?: PotentialRank
  range?: PotentialRank
  speed?: PotentialRank
  cooldown?: PotentialRank
  attackSpeed?: PotentialRank
  skillDamage?: PotentialRank
  dps?: PotentialRank
}

export interface CalculatedStats {
  attack: number
  baseAttack: number
  atkGainPercent: number
  health: number
  baseHealth: number
  hpGainPercent: number
  dps: number
  attackSpeed: number
  range: number
  skillRange: number
  speed: number
  skillDamage: number
  skillCooldown: number
  cost: number
  potentials?: StatPotentials
  potentialPercents?: Record<string, number>
}

export type MergeMode = 'merge' | 'skip_duplicates' | 'overwrite_all'

export interface MergeResult {
  mergedUnits: NormalizedUnit[]
  addedCount: number
  updatedCount: number
  skippedCount: number
  newUnitsList: NormalizedUnit[]
}

