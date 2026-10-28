<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between">
        <span class="text-sm font-bold flex items-center gap-2">
          <UIcon name="i-lucide-shield" class="text-primary w-4 h-4" />
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
            class="h-6 px-2 text-xs text-neutral-400 hover:text-white"
            @click="store.clearGears()"
          />
        </div>
      </div>
    </template>

    <div class="space-y-3">
      <!-- Recommended Signature Gears Banner -->
      <div
        v-if="recommendedGears.length > 0"
        class="p-2.5 rounded-lg border border-amber-500/40 bg-amber-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
      >
        <div class="flex items-center gap-2 min-w-0">
          <UIcon name="i-lucide-sparkles" class="w-4 h-4 text-amber-400 shrink-0" />
          <div class="truncate">
            <span class="font-bold text-amber-300">Signature: </span>
            <span class="text-amber-200/90 font-medium">
              {{ recommendedGears.map(r => `${r.gear.Name} (${r.slot})`).join(', ') }}
            </span>
          </div>
        </div>

        <div class="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <UButton
            v-if="hasUnequippedRecommended"
            label="Equip Signature"
            icon="i-lucide-check"
            color="warning"
            variant="solid"
            size="xs"
            class="h-6 text-xs px-2.5"
            @click="equipAllRecommended"
          />
          <UBadge
            v-else
            color="warning"
            variant="subtle"
            size="xs"
          >
            Equipped
          </UBadge>
        </div>
      </div>

      <!-- 4 Gear Slots: Head, Body, Arm, Legs (Spacious & Clear) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div
          v-for="slotDef in slots"
          :key="slotDef.slot"
          class="p-3 rounded-xl border bg-neutral-900/60 space-y-2.5 flex flex-col justify-between transition-all hover:border-neutral-700/80"
          :class="[
            getRecommendedForSlot(slotDef.slot) && !store.activeEquippedGears[slotDef.slot] ? 'border-amber-500/40 ring-1 ring-amber-500/20' : 'border-white/5',
            store.activeEquippedGears[slotDef.slot] ? 'bg-neutral-900/80' : 'bg-neutral-950/40'
          ]"
        >
          <div class="space-y-2">
            <!-- Slot Header & Rarity/Signature pill -->
            <div class="flex items-center justify-between gap-1.5">
              <span class="text-xs font-bold flex items-center gap-1.5 text-neutral-200 truncate">
                <UIcon :name="slotDef.icon" class="w-4 h-4 text-primary shrink-0" />
                <span>{{ slotDef.label }}</span>
              </span>
              <div class="flex items-center gap-1.5 shrink-0">
                <UBadge
                  v-if="getRecommendedForSlot(slotDef.slot) && store.equippedGears[slotDef.slot] === getRecommendedForSlot(slotDef.slot)?.id"
                  color="warning"
                  variant="subtle"
                  size="xs"
                  class="font-medium"
                >
                  Signature
                </UBadge>
                <UBadge
                  v-else-if="store.activeEquippedGears[slotDef.slot]"
                  :color="getRarityBadgeColor(store.activeEquippedGears[slotDef.slot]?.Rarity)"
                  variant="subtle"
                  size="xs"
                  class="font-medium"
                >
                  {{ store.activeEquippedGears[slotDef.slot]?.Rarity }}
                </UBadge>
                <span v-else class="text-xs text-neutral-500 font-mono">Empty</span>

                <!-- Quick Unequip Button -->
                <UButton
                  v-if="store.equippedGears[slotDef.slot]"
                  icon="i-lucide-x"
                  variant="ghost"
                  color="neutral"
                  size="xs"
                  class="h-5 w-5 p-0 text-neutral-400 hover:text-white"
                  @click="store.setGear(slotDef.slot, null)"
                />
              </div>
            </div>

            <!-- Searchable Select Menu for gear in this slot -->
            <USelectMenu
              :model-value="store.equippedGears[slotDef.slot] || 'none'"
              :items="getSlotOptions(slotDef.slot)"
              value-key="value"
              label-key="label"
              size="sm"
              class="w-full font-mono font-medium"
              placeholder="Select gear..."
              :search-input="{ placeholder: 'Search ' + slotDef.label + '...' }"
              @update:model-value="(val) => handleGearSelect(slotDef.slot, val)"
            />

            <!-- Quick Equip Recommended Pill if not equipped -->
            <div
              v-if="getRecommendedForSlot(slotDef.slot) && store.equippedGears[slotDef.slot] !== getRecommendedForSlot(slotDef.slot)?.id"
              class="flex items-center justify-between p-2 rounded-lg bg-amber-950/30 border border-amber-500/30 text-xs"
            >
              <div class="flex items-center gap-1.5 text-amber-300 font-medium truncate">
                <UIcon name="i-lucide-sparkles" class="w-3.5 h-3.5 shrink-0" />
                <span class="truncate">Rec: {{ getRecommendedForSlot(slotDef.slot)?.Name }}</span>
              </div>
              <UButton
                label="Equip"
                size="xs"
                variant="solid"
                color="warning"
                class="shrink-0 text-xs h-6 px-2"
                @click="store.setGear(slotDef.slot, getRecommendedForSlot(slotDef.slot)!.id)"
              />
            </div>
          </div>

          <!-- Active Gear Stats Preview (Clear & Readable) -->
          <div
            v-if="store.activeEquippedGears[slotDef.slot]"
            class="space-y-2 pt-2 border-t border-white/5"
          >
            <!-- Gear Description / Lore -->
            <p
              v-if="store.activeEquippedGears[slotDef.slot]?.Description"
              class="text-xs text-neutral-300 font-mono leading-relaxed bg-black/40 p-2.5 rounded-lg border border-neutral-800/80"
            >
              {{ store.activeEquippedGears[slotDef.slot]?.Description }}
            </p>

            <!-- Base Stats Chips -->
            <div
              v-if="Object.keys(getBaseStats(store.activeEquippedGears[slotDef.slot])).length > 0"
              class="flex flex-wrap gap-1.5"
            >
              <span
                v-for="(val, key) in getBaseStats(store.activeEquippedGears[slotDef.slot])"
                :key="key"
                class="text-xs font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-neutral-200 font-medium"
              >
                {{ formatStatBadge(String(key), Number(val)) }}
              </span>
            </div>

            <!-- Exclusive Unit Bonuses -->
            <div
              v-for="ex in getExclusiveInfo(store.activeEquippedGears[slotDef.slot])"
              :key="ex.unitKey"
              class="text-xs rounded-lg border transition-all"
              :class="ex.isMatched
                ? 'p-2.5 border-amber-500/40 bg-amber-950/30 text-amber-300 space-y-1.5'
                : 'p-1.5 border-neutral-800 bg-neutral-900/40 text-neutral-500'"
            >
              <!-- Matched Exclusive Active -->
              <template v-if="ex.isMatched">
                <div class="flex items-center gap-1.5 font-bold">
                  <UIcon name="i-lucide-sparkles" class="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Exclusive Bonus Active</span>
                </div>
                <div class="flex flex-wrap gap-1.5 font-mono text-xs">
                  <span
                    v-for="(subVal, subKey) in ex.stats"
                    :key="subKey"
                    class="px-2 py-0.5 rounded bg-amber-500/20 text-amber-200 font-semibold"
                  >
                    {{ formatStatBadge(String(subKey), Number(subVal)) }}
                  </span>
                </div>
              </template>

              <!-- Locked Exclusive for another unit (Muted & compact) -->
              <template v-else>
                <div class="flex items-center gap-1.5 text-neutral-500 text-[11px]">
                  <UIcon name="i-lucide-lock" class="w-3.5 h-3.5 shrink-0" />
                  <span class="truncate">Locked for {{ ex.unitKey }}:</span>
                  <span class="truncate font-mono">
                    {{ Object.entries(ex.stats).map(([k, v]) => formatStatBadge(k, Number(v))).join(', ') }}
                  </span>
                </div>
              </template>
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

interface RecommendedGearInfo {
  slot: GearSlot
  gear: GearItem
}

const recommendedGears = computed<RecommendedGearInfo[]>(() => {
  const unit = store.currentUnit
  if (!unit) return []

  const list: RecommendedGearInfo[] = []
  for (const g of store.gearsList) {
    if (!g.Stats) continue
    for (const [k, v] of Object.entries(g.Stats)) {
      if (typeof v === 'object' && v !== null && matchesUnit(k, unit)) {
        list.push({ slot: g.Slot, gear: g })
        break
      }
    }
  }
  return list
})

function getRecommendedForSlot(slot: GearSlot): GearItem | null {
  return recommendedGears.value.find(r => r.slot === slot)?.gear || null
}

const hasUnequippedRecommended = computed(() => {
  return recommendedGears.value.some(r => store.equippedGears[r.slot] !== r.gear.id)
})

function equipAllRecommended() {
  for (const r of recommendedGears.value) {
    store.setGear(r.slot, r.gear.id)
  }
}

function getSlotOptions(slot: GearSlot) {
  const options = [{ label: 'None', value: 'none', description: '' }]
  const gearsInSlot = store.gearsBySlot[slot] || []
  const recommended = getRecommendedForSlot(slot)

  const mapped = gearsInSlot.map((g: GearItem) => {
    const isRec = recommended?.id === g.id
    const statsSummary = Object.entries(g.Stats || {})
      .filter(([_, v]) => typeof v === 'number')
      .map(([k, v]) => formatStatBadge(k, v as number))
      .slice(0, 3)
      .join(', ')

    return {
      label: isRec ? `Recommended - ${g.Name}` : `${g.Rarity} - ${g.Name}`,
      value: g.id,
      description: isRec
        ? `Signature Gear for ${store.currentUnit?.displayName || store.currentUnit?.name}`
        : (statsSummary || g.Description || ''),
      isRecommended: isRec
    }
  })

  mapped.sort((a, b) => {
    if (a.isRecommended && !b.isRecommended) return -1
    if (!a.isRecommended && b.isRecommended) return 1
    return 0
  })

  return [...options, ...mapped]
}

function handleGearSelect(slot: GearSlot, val: any) {
  const gearId = typeof val === 'object' && val !== null ? val.value : val
  store.setGear(slot, gearId && gearId !== 'none' ? String(gearId) : null)
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
  if (key === 'SkillCooldownReduction') {
    const sign = val < 0 ? '+' : '-'
    return `Skill CD ${sign}${Math.round(Math.abs(val) * 100)}%`
  }
  if (key === 'SpawnCooldownReduction') {
    const sign = val < 0 ? '+' : '-'
    return `Spawn CD ${sign}${Math.round(Math.abs(val) * 100)}%`
  }
  if (key === 'CostReduction') return `Cost -${Math.round(val * 100)}%`
  if (key === 'CritDamageBoost') return `Crit DMG +${Math.round(val * 100)}%`
  if (key === 'CritChanceBoost') return `Crit +${Math.round(val * 100)}%`
  if (key === 'EvadeBoost') return `Evade +${Math.round(val * 100)}%`
  if (key === 'BurnBoost') return `Burn +${Math.round(val * 100)}%`
  if (key === 'Accuracy') return `Accuracy +${Math.round(val * 100)}%`
  if (key === 'Armor') return `Armor +${val}`
  if (key === 'Shield') return `Shield +${val}`
  if (key === 'UnitCap' || key === 'SpawnCap') return `Cap +${val}`

  if (typeof val === 'number') {
    if (Math.abs(val) <= 1 && val !== 0) {
      return `${key} ${val > 0 ? '+' : ''}${Math.round(val * 100)}%`
    }
    return `${key} ${val > 0 ? '+' : ''}${val}`
  }
  return `${key}: ${val}`
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
