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
  selectClass: string
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

export interface TraitStats {
  DamageBoost?: number
  HealthBoost?: number
  AttackSpeedBoost?: number
  RangeBoost?: number
  SpeedBoost?: number
  SkillDamageBoost?: number
  SkillCooldownReduction?: number
  CostReduction?: number
  CritDamageBoost?: number
  CritChanceBoost?: number
  SpawnCooldownReduction?: number
  SpawnCap?: number
  UnitCap?: number
  EvadeBoost?: number
}

export interface UnitTrait {
  id: string
  TraitDisplayName: string
  RarityName: string
  TraitStatus?: string
  TraitIcon?: string
  Stats: TraitStats
  Weight?: number
}

export type GearSlot = 'Head' | 'Body' | 'Arm' | 'Legs'

export interface GearItem {
  id: string
  Name: string
  Slot: GearSlot
  Rarity: string
  Stats: Record<string, any>
  Icon?: string
  Description?: string
}

export interface EquippedGears {
  Head: string | null
  Body: string | null
  Arm: string | null
  Legs: string | null
}

export interface GearStatsAggregated {
  DamageBoost: number
  HealthBoost: number
  AttackSpeedBoost: number
  RangeBoost: number
  SpeedBoost: number
  SkillDamageBoost: number
  SkillCooldownReduction: number
  CostReduction: number
  CritDamageBoost: number
  CritChanceBoost: number
  SpawnCooldownReduction: number
  LifeSteal?: number
  ArmorPen?: number
  EvadeBoost?: number
  BurnBoost?: number
  Accuracy?: number
  Armor?: number
  Shield?: number
  UnitCap?: number
  activeExclusiveBonuses: Array<{
    gearName: string
    unitKey: string
    stats: Record<string, number>
  }>
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
  critChance?: number
  critDamage?: number
  potentials?: StatPotentials
  potentialPercents?: Record<string, number>
  trait?: UnitTrait | null
  gearStats?: Partial<GearStatsAggregated>
}

export type MergeMode = 'merge' | 'skip_duplicates' | 'overwrite_all'

export interface MergeResult {
  mergedUnits: NormalizedUnit[]
  addedCount: number
  updatedCount: number
  skippedCount: number
  newUnitsList: NormalizedUnit[]
}

