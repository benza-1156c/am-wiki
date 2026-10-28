<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between">
        <span class="text-sm font-bold flex items-center gap-1.5">
          <UIcon name="i-lucide-shield" class="text-primary" />
          <span>Equipped Gears</span>
        </span>
        <div class="flex items-center gap-2">
          <UBadge
            :color="equippedCount > 0 ? 'primary' : 'neutral'"
            :variant="equippedCount > 0 ? 'subtle' : 'outline'"
            size="xs"
          >
            {{ equippedCount }} / 4 Gears
          </UBadge>
          <UButton
            v-if="equippedCount > 0"
            label="Clear"
            variant="ghost"
            color="neutral"
            size="xs"
            @click="store.clearGears()"
          />
        </div>
      </div>
    </template>

    <div class="space-y-4">
      <!-- 4 Gear Slots: Head, Body, Arm, Legs -->
      <div
        v-for="slotDef in slots"
        :key="slotDef.slot"
        class="p-3 rounded-lg border border-default bg-neutral-900/40 space-y-2.5"
      >
        <!-- Slot Label & Status -->
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold flex items-center gap-1.5 text-neutral-200">
            <UIcon :name="slotDef.icon" class="w-4 h-4 text-muted" />
            <span>{{ slotDef.label }}</span>
          </span>
          <UBadge
            v-if="store.activeEquippedGears[slotDef.slot]"
            :color="getRarityBadgeColor(store.activeEquippedGears[slotDef.slot]?.Rarity)"
            variant="subtle"
            size="xs"
          >
            {{ store.activeEquippedGears[slotDef.slot]?.Rarity }}
          </UBadge>
          <span v-else class="text-[10px] text-muted">Empty</span>
        </div>

        <!-- USelect dropdown for gear in this slot -->
        <USelect
          :model-value="store.equippedGears[slotDef.slot] || 'none'"
          :items="getSlotOptions(slotDef.slot)"
          size="xs"
          class="w-full font-mono font-medium"
          placeholder="Select Gear"
          @update:model-value="(val) => store.setGear(slotDef.slot, val as string)"
        />

        <!-- Active Gear Stats Preview -->
        <div
          v-if="store.activeEquippedGears[slotDef.slot]"
          class="space-y-1.5 pt-1"
        >
          <!-- Regular Stats Badges -->
          <div class="flex flex-wrap gap-1">
            <UBadge
              v-for="(val, key) in getBaseStats(store.activeEquippedGears[slotDef.slot])"
              :key="key"
              color="neutral"
              variant="subtle"
              size="xs"
            >
              {{ formatStatBadge(String(key), Number(val)) }}
            </UBadge>
          </div>

          <!-- Exclusive Unit Bonus Detection -->
          <div
            v-for="ex in getExclusiveInfo(store.activeEquippedGears[slotDef.slot])"
            :key="ex.unitKey"
            class="text-[11px] p-2 rounded border"
            :class="ex.isMatched
              ? 'border-amber-500/60 bg-amber-950/30 text-amber-300'
              : 'border-neutral-800 bg-neutral-900/60 text-muted'"
          >
            <div class="flex items-center gap-1 font-bold mb-1">
              <UIcon :name="ex.isMatched ? 'i-lucide-sparkles' : 'i-lucide-lock'" class="w-3.5 h-3.5" />
              <span>{{ ex.isMatched ? 'Exclusive Bonus Active' : 'Exclusive Unit Bonus Locked' }}</span>
              <span class="text-[10px] font-normal text-muted">({{ ex.unitKey }})</span>
            </div>
            <div class="flex flex-wrap gap-1 font-mono text-[10px]">
              <span
                v-for="(subVal, subKey) in ex.stats"
                :key="subKey"
                class="px-1.5 py-0.5 rounded bg-black/50"
              >
                {{ formatStatBadge(String(subKey), Number(subVal)) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { GearSlot, GearItem } from '~/types/unit'
import { matchesUnit } from '~/utils/unitCalculator'

const store = useCombatCalculatorStore()

interface SlotDefinition {
  slot: GearSlot
  label: string
  icon: string
}

const slots: SlotDefinition[] = [
  { slot: 'Head', label: 'Head Gear', icon: 'i-lucide-hard-hat' },
  { slot: 'Body', label: 'Body Gear', icon: 'i-lucide-shirt' },
  { slot: 'Arm', label: 'Arm Gear', icon: 'i-lucide-shield' },
  { slot: 'Legs', label: 'Legs Gear', icon: 'i-lucide-footprints' }
]

const equippedCount = computed(() => {
  return Object.values(store.equippedGears).filter(Boolean).length
})

function getSlotOptions(slot: GearSlot) {
  const options = [{ label: 'None', value: 'none' }]
  const gearsInSlot = store.gearsBySlot[slot] || []
  const list = gearsInSlot.map((g: GearItem) => ({
    label: `${g.Rarity} - ${g.Name}`,
    value: g.id
  }))
  return [...options, ...list]
}

function getBaseStats(gear?: GearItem | null): Record<string, number> {
  if (!gear || !gear.Stats) return {}
  const res: Record<string, number> = {}
  for (const [k, v] of Object.entries(gear.Stats)) {
    if (typeof v === 'number') {
      res[k] = v
    }
  }
  return res
}

interface ExclusiveInfo {
  unitKey: string
  stats: Record<string, number>
  isMatched: boolean
}

function getExclusiveInfo(gear?: GearItem | null): ExclusiveInfo[] {
  if (!gear || !gear.Stats) return []
  const list: ExclusiveInfo[] = []
  for (const [k, v] of Object.entries(gear.Stats)) {
    if (typeof v === 'object' && v !== null) {
      list.push({
        unitKey: k,
        stats: v as Record<string, number>,
        isMatched: matchesUnit(k, store.currentUnit)
      })
    }
  }
  return list
}

function formatStatBadge(key: string, val: number): string {
  if (key === 'LifeSteal') return `Life Steal +${Math.round(val * 100)}%`
  if (key === 'ArmorPen') return `Armor Pen +${Math.round(val * 100)}%`
  if (key === 'DamageBoost') return `ATK +${Math.round(val * 100)}%`
  if (key === 'HealthBoost') return `HP +${Math.round(val * 100)}%`
  if (key === 'RangeBoost') return `Range +${Math.round(val * 100)}%`
  if (key === 'SpeedBoost') return `Speed +${Math.round(val * 100)}%`
  if (key === 'AttackSpeedBoost') return `SPA -${Math.round(val * 100)}%`
  if (key === 'SkillDamageBoost') return `Skill DMG +${Math.round(val * 100)}%`
  if (key === 'SkillCooldownReduction') return `Skill CD -${Math.round(val * 100)}%`
  if (key === 'CostReduction') return `Cost -${Math.round(val * 100)}%`
  if (key === 'CritDamageBoost') return `Crit DMG +${Math.round(val * 100)}%`
  if (key === 'CritChanceBoost') return `Crit +${Math.round(val * 100)}%`
  if (key === 'EvadeBoost') return `Evade +${Math.round(val * 100)}%`
  if (key === 'BurnBoost') return `Burn +${Math.round(val * 100)}%`
  if (key === 'Accuracy') return `Accuracy +${Math.round(val * 100)}%`
  if (key === 'Armor') return `Armor +${val}`
  if (key === 'Shield') return `Shield +${val}`
  if (key === 'UnitCap') return `Cap +${val}`
  return `${key} +${val}`
}

function getRarityBadgeColor(rarity?: string): any {
  switch (rarity) {
    case 'Exclusive': return 'primary'
    case 'Secret': return 'error'
    case 'Mythic': return 'error'
    case 'Legendary': return 'warning'
    case 'Epic': return 'secondary'
    case 'Rare': return 'info'
    default: return 'neutral'
  }
}
</script>
