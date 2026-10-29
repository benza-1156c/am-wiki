<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between">
        <span class="text-sm font-bold flex items-center gap-2">
          <UIcon name="i-lucide-shield" class="text-primary w-4 h-4" />
          <span>Equipped Gears</span>
        </span>
        <div class="flex items-center gap-2">
          <!-- View Mode Toggle: List / Grid -->
          <div class="flex items-center bg-white/5 rounded-lg p-0.5 border border-default">
            <button
              type="button"
              class="px-2 py-0.5 rounded text-xs flex items-center gap-1 transition-all cursor-pointer"
              :class="viewMode === 'list' ? 'bg-primary/20 text-primary font-semibold shadow-sm' : 'text-muted hover:text-white'"
              @click="viewMode = 'list'"
              title="List View"
            >
              <UIcon name="i-lucide-list" class="w-3.5 h-3.5" />
              <span class="hidden sm:inline">List</span>
            </button>
            <button
              type="button"
              class="px-2 py-0.5 rounded text-xs flex items-center gap-1 transition-all cursor-pointer"
              :class="viewMode === 'grid' ? 'bg-primary/20 text-primary font-semibold shadow-sm' : 'text-muted hover:text-white'"
              @click="viewMode = 'grid'"
              title="2x2 Grid View"
            >
              <UIcon name="i-lucide-layout-grid" class="w-3.5 h-3.5" />
              <span class="hidden sm:inline">Grid</span>
            </button>
          </div>

          <UBadge
            :color="equippedCount > 0 ? 'primary' : 'neutral'"
            :variant="equippedCount > 0 ? 'subtle' : 'outline'"
            size="xs"
          >
            {{ equippedCount }} / 4
          </UBadge>

          <UButton
            v-if="equippedCount > 0"
            label="Clear"
            variant="ghost"
            color="neutral"
            size="xs"
            class="h-6 px-2 text-xs text-muted hover:text-white"
            @click="clearGears"
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
              {{ recommendedGears.map(r => `${r.gear.Name} - ${r.slot}`).join(', ') }}
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

      <!-- Mode 1: List View (Head -> Body -> Arm -> Legs) -->
      <div v-if="viewMode === 'list'" class="space-y-2.5">
        <div
          v-for="slotDef in slots"
          :key="slotDef.slot"
          class="p-2.5 rounded-lg border bg-neutral-900/60 transition-all hover:border-neutral-700/80"
          :class="[
            getRecommendedForSlot(slotDef.slot) && !gears[slotDef.slot]
              ? 'border-amber-500/40 ring-1 ring-amber-500/20'
              : 'border-default',
            gears[slotDef.slot] ? 'bg-neutral-900/80' : 'bg-neutral-950/30'
          ]"
        >
          <!-- Top Row: Slot Icon/Label, SelectMenu, Badges -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <!-- Slot Identity -->
            <div class="flex items-center gap-2.5 min-w-0 sm:w-32 shrink-0">
              <div class="w-8 h-8 rounded-md bg-black/50 border border-default flex items-center justify-center shrink-0 overflow-hidden">
                <img
                  v-if="getActiveGear(slotDef.slot)?.Icon && getRobloxImageUrl(getActiveGear(slotDef.slot)?.Icon)"
                  :src="getRobloxImageUrl(getActiveGear(slotDef.slot)?.Icon)!"
                  class="w-full h-full object-contain p-0.5"
                  alt="Gear"
                  loading="lazy"
                />
                <UIcon v-else :name="slotDef.icon" class="w-4 h-4 text-primary shrink-0" />
              </div>
              <span class="text-sm font-bold text-white">{{ slotDef.label }}</span>
            </div>

            <!-- Selector Menu -->
            <div class="flex-1 min-w-0">
              <USelectMenu
                :model-value="gears[slotDef.slot] || 'none'"
                :items="getSlotOptions(slotDef.slot)"
                value-key="value"
                label-key="label"
                size="md"
                class="w-full font-mono text-sm font-medium"
                placeholder="Select gear..."
                :search-input="{ placeholder: 'Search ' + slotDef.label + '...' }"
                @update:model-value="(val) => handleGearSelect(slotDef.slot, val)"
              >
                <template #leading>
                  <img
                    v-if="getActiveGear(slotDef.slot)?.Icon && getRobloxImageUrl(getActiveGear(slotDef.slot)?.Icon)"
                    :src="getRobloxImageUrl(getActiveGear(slotDef.slot)?.Icon)!"
                    class="w-5 h-5 rounded object-contain bg-black/40 shrink-0"
                    alt=""
                  />
                </template>
                <template #item-leading="{ item }">
                  <img
                    v-if="(item as any).icon && getRobloxImageUrl((item as any).icon)"
                    :src="getRobloxImageUrl((item as any).icon)!"
                    class="w-7 h-7 rounded-lg object-contain bg-black/60 border border-default shrink-0"
                    alt=""
                    loading="lazy"
                  />
                  <UIcon v-else-if="item.value === 'none'" name="i-lucide-ban" class="w-5 h-5 text-neutral-500 shrink-0" />
                </template>
              </USelectMenu>
            </div>

            <!-- Rarity/Signature Badge & Unequip -->
            <div class="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
              <UBadge
                v-if="getRecommendedForSlot(slotDef.slot) && gears[slotDef.slot] === getRecommendedForSlot(slotDef.slot)?.id"
                color="warning"
                variant="subtle"
                size="xs"
                class="font-medium"
              >
                Signature
              </UBadge>
              <UBadge
                v-else-if="getActiveGear(slotDef.slot)"
                :color="getRarityBadgeColor(getActiveGear(slotDef.slot)?.Rarity)"
                variant="subtle"
                size="xs"
                class="font-medium"
              >
                {{ getActiveGear(slotDef.slot)?.Rarity }}
              </UBadge>
              <span v-else class="text-xs text-muted font-mono">Empty</span>

              <UButton
                v-if="gears[slotDef.slot]"
                icon="i-lucide-x"
                variant="ghost"
                color="neutral"
                size="xs"
                class="h-5 w-5 p-0 text-muted hover:text-white"
                @click="handleGearSelect(slotDef.slot, null)"
              />
            </div>
          </div>

          <!-- Bottom Row: Unified Stats Chips & Signature Bonus -->
          <div
            v-if="getActiveGear(slotDef.slot)"
            class="mt-2 pt-2 border-t border-default flex flex-wrap items-center gap-1.5"
          >
            <!-- Base Stats Chips -->
            <span
              v-for="(val, key) in getBaseStats(getActiveGear(slotDef.slot))"
              :key="key"
              class="text-xs font-mono px-2 py-0.5 rounded bg-white/5 border border-default text-neutral-200 font-medium"
            >
              {{ formatStatBadge(String(key), Number(val)) }}
            </span>

            <!-- Signature / Exclusive Bonus Active -->
            <template v-for="ex in getExclusiveInfo(getActiveGear(slotDef.slot))" :key="ex.unitKey">
              <div
                v-if="ex.isMatched"
                class="flex flex-wrap items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/35 text-amber-300 text-xs font-mono"
              >
                <span class="flex items-center gap-1 font-bold text-amber-400">
                  <UIcon name="i-lucide-sparkles" class="w-3.5 h-3.5" />
                  <span>Signature:</span>
                </span>
                <span
                  v-for="(subVal, subKey) in ex.stats"
                  :key="subKey"
                  class="px-1.5 py-0.2 rounded bg-black/40 text-amber-200 font-semibold"
                >
                  {{ formatStatBadge(String(subKey), Number(subVal)) }}
                </span>
              </div>
            </template>
          </div>
        </div>
      </div>

      <!-- Mode 2: 2x2 Grid View -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
        <div
          v-for="slotDef in slots"
          :key="slotDef.slot"
          class="p-3 rounded-lg border bg-neutral-900/60 space-y-2 flex flex-col justify-between transition-all hover:border-neutral-700/80"
          :class="[
            getRecommendedForSlot(slotDef.slot) && !gears[slotDef.slot]
              ? 'border-amber-500/40 ring-1 ring-amber-500/20'
              : 'border-default',
            gears[slotDef.slot] ? 'bg-neutral-900/80' : 'bg-neutral-950/30'
          ]"
        >
          <div class="space-y-2">
            <!-- Slot Header & Rarity/Signature pill -->
            <div class="flex items-center justify-between gap-2">
              <span class="text-sm font-bold flex items-center gap-2 text-white truncate">
                <div class="w-8 h-8 rounded-md bg-black/50 border border-default flex items-center justify-center shrink-0 overflow-hidden">
                  <img
                    v-if="getActiveGear(slotDef.slot)?.Icon && getRobloxImageUrl(getActiveGear(slotDef.slot)?.Icon)"
                    :src="getRobloxImageUrl(getActiveGear(slotDef.slot)?.Icon)!"
                    class="w-full h-full object-contain p-0.5"
                    alt="Gear"
                    loading="lazy"
                  />
                  <UIcon v-else :name="slotDef.icon" class="w-4 h-4 text-primary shrink-0" />
                </div>
                <span>{{ slotDef.label }}</span>
              </span>
              <div class="flex items-center gap-1.5 shrink-0">
                <UBadge
                  v-if="getRecommendedForSlot(slotDef.slot) && gears[slotDef.slot] === getRecommendedForSlot(slotDef.slot)?.id"
                  color="warning"
                  variant="subtle"
                  size="xs"
                >
                  Signature
                </UBadge>
                <UBadge
                  v-else-if="getActiveGear(slotDef.slot)"
                  :color="getRarityBadgeColor(getActiveGear(slotDef.slot)?.Rarity)"
                  variant="subtle"
                  size="xs"
                >
                  {{ getActiveGear(slotDef.slot)?.Rarity }}
                </UBadge>
                <span v-else class="text-xs text-muted font-mono">Empty</span>

                <UButton
                  v-if="gears[slotDef.slot]"
                  icon="i-lucide-x"
                  variant="ghost"
                  color="neutral"
                  size="xs"
                  class="h-5 w-5 p-0 text-muted hover:text-white"
                  @click="handleGearSelect(slotDef.slot, null)"
                />
              </div>
            </div>

            <!-- Searchable Select Menu -->
            <USelectMenu
              :model-value="gears[slotDef.slot] || 'none'"
              :items="getSlotOptions(slotDef.slot)"
              value-key="value"
              label-key="label"
              size="md"
              class="w-full font-mono text-sm font-medium"
              placeholder="Select gear..."
              :search-input="{ placeholder: 'Search ' + slotDef.label + '...' }"
              @update:model-value="(val) => handleGearSelect(slotDef.slot, val)"
            >
              <template #leading>
                <img
                  v-if="getActiveGear(slotDef.slot)?.Icon && getRobloxImageUrl(getActiveGear(slotDef.slot)?.Icon)"
                  :src="getRobloxImageUrl(getActiveGear(slotDef.slot)?.Icon)!"
                  class="w-5 h-5 rounded object-contain bg-black/40 shrink-0"
                  alt=""
                />
              </template>
              <template #item-leading="{ item }">
                <img
                  v-if="(item as any).icon && getRobloxImageUrl((item as any).icon)"
                  :src="getRobloxImageUrl((item as any).icon)!"
                  class="w-7 h-7 rounded-lg object-contain bg-black/60 border border-default shrink-0"
                  alt=""
                  loading="lazy"
                />
                <UIcon v-else-if="item.value === 'none'" name="i-lucide-ban" class="w-5 h-5 text-neutral-500 shrink-0" />
              </template>
            </USelectMenu>
          </div>

          <!-- Bottom Row: Unified Stats Chips & Signature Bonus -->
          <div
            v-if="getActiveGear(slotDef.slot)"
            class="pt-2 border-t border-default flex flex-wrap items-center gap-1.5"
          >
            <!-- Base Stats Chips -->
            <span
              v-for="(val, key) in getBaseStats(getActiveGear(slotDef.slot))"
              :key="key"
              class="text-xs font-mono px-2 py-0.5 rounded bg-white/5 border border-default text-neutral-200 font-medium"
            >
              {{ formatStatBadge(String(key), Number(val)) }}
            </span>

            <!-- Signature / Exclusive Bonus Active -->
            <template v-for="ex in getExclusiveInfo(getActiveGear(slotDef.slot))" :key="ex.unitKey">
              <div
                v-if="ex.isMatched"
                class="flex flex-wrap items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/35 text-amber-300 text-xs font-mono"
              >
                <span class="flex items-center gap-1 font-bold text-amber-400">
                  <UIcon name="i-lucide-sparkles" class="w-3.5 h-3.5" />
                  <span>Signature:</span>
                </span>
                <span
                  v-for="(subVal, subKey) in ex.stats"
                  :key="subKey"
                  class="px-1.5 py-0.2 rounded bg-black/40 text-amber-200 font-semibold"
                >
                  {{ formatStatBadge(String(subKey), Number(subVal)) }}
                </span>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { GearSlot, GearItem } from '~/types/unit'
import { getRobloxImageUrl } from '~/utils/formatters'
import { matchesUnit } from '~/utils/unitCalculator'

const props = defineProps<{
  unit: any
  gears: Record<GearSlot, string | null>
  allGears: GearItem[]
}>()

const emit = defineEmits<{
  (e: 'update:gear', slot: GearSlot, gearId: string | null): void
  (e: 'clear'): void
}>()

const viewMode = ref<'list' | 'grid'>('list')

const slots: Array<{ slot: GearSlot; label: string; icon: string }> = [
  { slot: 'Head', label: 'Head', icon: 'i-lucide-hard-hat' },
  { slot: 'Body', label: 'Body', icon: 'i-lucide-shirt' },
  { slot: 'Arm', label: 'Arm', icon: 'i-lucide-sword' },
  { slot: 'Legs', label: 'Legs', icon: 'i-lucide-footprints' }
]

const equippedCount = computed(() => {
  return Object.values(props.gears).filter(Boolean).length
})

function getActiveGear(slot: GearSlot): GearItem | null {
  const id = props.gears[slot]
  if (!id || id === 'none') return null
  return (props.allGears || []).find((g: any) => g.id === id) || null
}

const recommendedGears = computed<Array<{ slot: GearSlot; gear: GearItem }>>(() => {
  if (!props.unit) return []
  const list: Array<{ slot: GearSlot; gear: GearItem }> = []
  for (const g of props.allGears || []) {
    if (!g.Stats) continue
    for (const [k, v] of Object.entries(g.Stats)) {
      if (typeof v === 'object' && v !== null && matchesUnit(k, props.unit)) {
        list.push({ slot: g.Slot || (g as any).slot, gear: g })
        break
      }
    }
  }
  return list
})

const hasUnequippedRecommended = computed(() => {
  return recommendedGears.value.some(r => props.gears[r.slot] !== r.gear.id)
})

function equipAllRecommended() {
  for (const r of recommendedGears.value) {
    props.gears[r.slot] = r.gear.id
    emit('update:gear', r.slot, r.gear.id)
  }
}

function clearGears() {
  for (const s of ['Head', 'Body', 'Arm', 'Legs'] as GearSlot[]) {
    props.gears[s] = null
    emit('update:gear', s, null)
  }
  emit('clear')
}

function getRecommendedForSlot(slot: GearSlot): GearItem | null {
  return recommendedGears.value.find(r => r.slot === slot)?.gear || null
}

interface GearOptionItem {
  value: string
  label: string
  description: string
  icon: string | null
  isRecommended: boolean
  rarity?: string
  weight?: number
}

const RARITY_WEIGHT: Record<string, number> = {
  Exclusive: 10,
  Secret: 9,
  Celestial: 9,
  Mysterious: 9,
  Mythic: 8,
  Legendary: 7,
  Epic: 6,
  Rare: 5,
  Uncommon: 4,
  Common: 3
}

function getRarityWeight(rarity?: string): number {
  if (!rarity) return 0
  return RARITY_WEIGHT[rarity.trim()] || 0
}

function getSlotOptions(slot: GearSlot): GearOptionItem[] {
  const noneOption: GearOptionItem = {
    value: 'none',
    label: 'None (Empty)',
    description: '',
    icon: null,
    isRecommended: false,
    weight: 999
  }
  const gears = (props.allGears || []).filter((g: any) => g.Slot === slot || (g as any).slot === slot)
  const rec = getRecommendedForSlot(slot)

  const mapped: GearOptionItem[] = gears.map((g: any) => {
    const isRec = rec?.id === g.id
    const statsSummary = Object.entries(g.Stats || {})
      .filter(([_, v]) => typeof v === 'number' && v !== 0)
      .map(([k, v]) => formatStatBadge(k, v as number))
      .slice(0, 3)
      .join(', ')

    return {
      value: g.id,
      label: isRec ? `Recommended - ${g.Name}` : `${g.Rarity} - ${g.Name}`,
      description: isRec
        ? `Signature for ${props.unit?.displayName || props.unit?.name}` + (statsSummary ? ` • ${statsSummary}` : '')
        : (statsSummary || (g as any).Description || ''),
      icon: (g.Icon as string) || null,
      isRecommended: isRec,
      rarity: g.Rarity,
      weight: getRarityWeight(g.Rarity)
    }
  })

  mapped.sort((a, b) => {
    if (a.isRecommended && !b.isRecommended) return -1
    if (!a.isRecommended && b.isRecommended) return 1
    const wDiff = (b.weight || 0) - (a.weight || 0)
    if (wDiff !== 0) return wDiff
    return a.label.localeCompare(b.label)
  })

  return [noneOption, ...mapped]
}

function handleGearSelect(slot: GearSlot, val: any) {
  const gearId = typeof val === 'object' && val !== null ? val.value : val
  const finalId = gearId && gearId !== 'none' ? String(gearId) : null
  props.gears[slot] = finalId
  emit('update:gear', slot, finalId)
}

function getBaseStats(gear?: GearItem | null): Record<string, number> {
  if (!gear || !gear.Stats) return {}
  const res: Record<string, number> = {}
  for (const [k, v] of Object.entries(gear.Stats)) {
    if (typeof v === 'number' && v !== 0) {
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
        isMatched: matchesUnit(k, props.unit)
      })
    }
  }
  return list
}

function formatStatBadge(key: string, val: number): string {
  if (key === 'LifeSteal') return `Life Steal +${Math.round(val * 100)}%`
  if (key === 'ArmorPen') return `Armor Pen +${Math.round(val * 100)}%`
  if (key === 'DamageBoost') return `ATK +${Math.round(val * 100)}%`
  if (key === 'HealthBoost') return `HP ${val > 0 ? '+' : ''}${Math.round(val * 100)}%`
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

