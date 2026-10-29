<template>
  <div class="rounded-xl border border-white/10 bg-[#0f172a]/70 backdrop-blur-md p-4 sm:p-5 flex flex-col gap-4 shadow-xl">
    <!-- Header & Unit Identity -->
    <div class="flex items-start justify-between gap-3">
      <div class="flex items-center gap-3 min-w-0">
        <!-- 3D Avatar -->
        <div class="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-neutral-900 border border-white/10 shrink-0 overflow-hidden relative shadow-md">
          <NuxtImg
            v-if="unit?.icon && getRobloxImageUrl(unit.icon)"
            :src="getRobloxImageUrl(unit.icon)!"
            class="w-full h-full object-cover"
            alt="Unit portrait"
            loading="lazy"
            :unoptimized="getRobloxImageUrl(unit.icon)?.startsWith('/api')"
          />
          <div v-else class="w-full h-full flex items-center justify-center text-neutral-600">
            <UIcon name="i-lucide-user" class="w-7 h-7" />
          </div>
        </div>

        <!-- Meta -->
        <div class="min-w-0">
          <div class="flex items-center gap-2 flex-wrap">
            <UBadge
              v-if="unit?.rarity"
              :color="getRarityColor(unit.rarity)"
              variant="subtle"
              size="xs"
            >
              {{ unit.rarity }}
            </UBadge>

            <div
              v-if="unit?.element && unit.element !== 'None'"
              class="px-1.5 py-0.5 rounded text-[10px] font-bold border flex items-center gap-1 shadow-sm"
              :class="[getElementConfig(unit.element).bg, getElementConfig(unit.element).color, getElementConfig(unit.element).border]"
            >
              <UIcon :name="getElementConfig(unit.element).uiIcon" class="w-3 h-3" />
              <span>{{ unit.element }}</span>
            </div>
          </div>

          <h2 class="text-base sm:text-lg font-bold text-white truncate mt-1">
            {{ unit?.displayName || unit?.name || 'Select Unit' }}
          </h2>

          <div class="text-xs text-neutral-400 truncate">
            {{ unit?.series || 'Other' }}
            <span v-if="unit?.skillMode">• {{ unit.skillMode }}</span>
          </div>
        </div>
      </div>

      <!-- Change Unit Button -->
      <UButton
        icon="i-lucide-arrow-left-right"
        label="Change"
        size="xs"
        variant="soft"
        color="primary"
        class="shrink-0"
        @click="$emit('open-picker')"
      />
    </div>

    <!-- Core Controls: Awakening Stars, Level & In-Game Upgrade -->
    <div class="space-y-3 pt-3 border-t border-white/5">
      <!-- Awakening Stars (0-6★) -->
      <div>
        <div class="flex items-center justify-between text-xs mb-1.5">
          <span class="text-neutral-300 font-medium flex items-center gap-1">
            <UIcon name="i-lucide-sparkles" class="w-3.5 h-3.5 text-amber-400" />
            Awakening Stars
          </span>
          <span class="font-bold text-amber-400 font-mono">{{ state.stars }}★</span>
        </div>
        <div class="flex items-center gap-1">
          <button
            v-for="s in [0, 1, 2, 3, 4, 5, 6]"
            :key="s"
            class="flex-1 py-1 rounded text-xs font-bold transition-all"
            :class="state.stars === s ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-sm shadow-amber-500/20' : 'bg-white/5 text-neutral-400 hover:bg-white/10'"
            @click="onUpdateStars(s)"
          >
            {{ s }}★
          </button>
        </div>
      </div>

      <!-- Unit Level (1-80) -->
      <div>
        <div class="flex items-center justify-between text-xs mb-1">
          <span class="text-neutral-300 font-medium flex items-center gap-1">
            <UIcon name="i-lucide-gauge" class="w-3.5 h-3.5 text-primary" />
            Unit Level
          </span>
          <span class="font-bold text-primary font-mono">Lv. {{ state.level }}</span>
        </div>
        <input
          type="range"
          min="1"
          :max="maxLevelForStars"
          :value="state.level"
          class="w-full accent-cyan-400 cursor-pointer h-1.5 bg-neutral-800 rounded-lg"
          @input="state.level = Number(($event.target as HTMLInputElement).value)"
        />
        <div class="flex items-center justify-between text-[10px] text-neutral-500 font-mono mt-0.5">
          <span>Lv. 1</span>
          <span>Max Lv. {{ maxLevelForStars }}</span>
        </div>
      </div>

      <!-- In-Game Upgrade Level -->
      <div>
        <div class="flex items-center justify-between text-xs mb-1">
          <span class="text-neutral-300 font-medium flex items-center gap-1">
            <UIcon name="i-lucide-chevrons-up" class="w-3.5 h-3.5 text-emerald-400" />
            In-Game Upgrade
          </span>
          <span class="font-bold text-emerald-400 font-mono">Upg. {{ state.upgradeLevel }} / {{ unit?.maxLevel || 5 }}</span>
        </div>
        <div class="flex items-center gap-1 overflow-x-auto pb-1">
          <button
            v-for="u in (unit?.maxLevel !== undefined ? unit.maxLevel + 1 : 6)"
            :key="u - 1"
            class="flex-1 min-w-[28px] py-1 rounded text-xs font-bold transition-all"
            :class="state.upgradeLevel === (u - 1) ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-sm shadow-emerald-500/20' : 'bg-white/5 text-neutral-400 hover:bg-white/10'"
            @click="state.upgradeLevel = u - 1"
          >
            {{ u - 1 }}
          </button>
        </div>
      </div>
    </div>

    <!-- Accordion Section: Traits, Gears & Potentials -->
    <div class="space-y-3 pt-3 border-t border-white/5">
      <!-- Tab Toggle between Gears / Traits / Potentials -->
      <div class="flex items-center bg-white/5 rounded-lg p-0.5 border border-white/10 text-xs">
        <button
          v-for="tab in ['gears', 'traits', 'potentials']"
          :key="tab"
          type="button"
          class="flex-1 py-1 rounded text-center capitalize font-semibold transition-all"
          :class="activeTab === tab ? 'bg-primary/20 text-primary border border-primary/40 shadow-sm' : 'text-neutral-400 hover:text-white'"
          @click="activeTab = tab"
        >
          {{ tab }}
        </button>
      </div>

      <!-- Tab 1: Equipped Gears (4 Slots) -->
      <div v-show="activeTab === 'gears'" class="space-y-2">
        <!-- Signature Gear Banner if available -->
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

        <div
          v-for="slot in (['Head', 'Body', 'Arm', 'Legs'] as const)"
          :key="slot"
          class="p-2.5 rounded-lg border bg-neutral-900/50 flex items-center justify-between gap-2 transition-all"
          :class="[
            getRecommendedForSlot(slot) && state.gears[slot] !== getRecommendedForSlot(slot)?.id
              ? 'border-amber-500/40 ring-1 ring-amber-500/20'
              : 'border-white/5'
          ]"
        >
          <div class="flex items-center gap-2 min-w-0 w-24 shrink-0">
            <UIcon :name="getSlotIcon(slot)" class="w-4 h-4 text-primary shrink-0" />
            <span class="text-xs font-bold text-neutral-200">{{ slot }}</span>
          </div>

          <div class="flex-1 min-w-0">
            <USelectMenu
              :model-value="state.gears[slot] || 'none'"
              :items="getGearOptionsForSlot(slot)"
              value-key="value"
              label-key="label"
              size="xs"
              class="w-full font-mono text-xs"
              placeholder="Select gear..."
              :search-input="{ placeholder: 'Search ' + slot + '...' }"
              @update:model-value="(val) => state.gears[slot] = val === 'none' ? null : val"
            >
              <template #leading>
                <img
                  v-if="getGearIcon(state.gears[slot])"
                  :src="getGearIcon(state.gears[slot])!"
                  class="w-4 h-4 rounded object-contain bg-black/40 shrink-0"
                  alt=""
                />
              </template>
              <template #item-leading="{ item }">
                <img
                  v-if="(item as any).icon && getRobloxImageUrl((item as any).icon)"
                  :src="getRobloxImageUrl((item as any).icon)!"
                  class="w-5 h-5 rounded object-contain bg-black/60 border border-white/10 shrink-0"
                  alt=""
                  loading="lazy"
                />
                <UIcon v-else-if="item.value === 'none'" name="i-lucide-ban" class="w-4 h-4 text-neutral-500 shrink-0" />
              </template>
            </USelectMenu>
          </div>

          <div class="flex items-center gap-1.5 shrink-0">
            <UBadge
              v-if="getRecommendedForSlot(slot) && state.gears[slot] === getRecommendedForSlot(slot)?.id"
              color="warning"
              variant="subtle"
              size="xs"
            >
              Signature
            </UBadge>

            <UButton
              v-if="state.gears[slot]"
              icon="i-lucide-x"
              variant="ghost"
              color="neutral"
              size="xs"
              class="h-6 w-6 p-0 text-neutral-400 hover:text-white shrink-0"
              @click="state.gears[slot] = null"
            />
          </div>
        </div>
      </div>

      <!-- Tab 2: Equipped Traits (2 Slots) -->
      <div v-show="activeTab === 'traits'" class="space-y-2">
        <div
          v-for="slotIdx in [0, 1]"
          :key="slotIdx"
          class="p-2 rounded-lg border border-white/5 bg-neutral-900/50 flex items-center justify-between gap-2"
        >
          <div class="flex items-center gap-2 min-w-0 w-24 shrink-0">
            <UIcon name="i-lucide-zap" class="w-4 h-4 text-amber-400 shrink-0" />
            <span class="text-xs font-bold text-neutral-200">Trait {{ slotIdx + 1 }}</span>
          </div>

          <USelectMenu
            :model-value="state.traitIds[slotIdx] || 'none'"
            :items="traitOptions"
            value-key="value"
            label-key="label"
            size="xs"
            class="flex-1 font-mono text-xs"
            placeholder="Select trait..."
            :search-input="{ placeholder: 'Search trait...' }"
            @update:model-value="(val) => state.traitIds[slotIdx] = val === 'none' ? null : val"
          >
            <template #leading>
              <img
                v-if="getTraitIcon(state.traitIds[slotIdx])"
                :src="getTraitIcon(state.traitIds[slotIdx])!"
                class="w-4 h-4 rounded object-contain bg-black/40 shrink-0"
                alt=""
              />
            </template>
            <template #item-leading="{ item }">
              <img
                v-if="(item as any).icon && getRobloxImageUrl((item as any).icon)"
                :src="getRobloxImageUrl((item as any).icon)!"
                class="w-5 h-5 rounded object-contain bg-black/60 border border-white/10 shrink-0"
                alt=""
                loading="lazy"
              />
              <UIcon v-else-if="item.value === 'none'" name="i-lucide-ban" class="w-4 h-4 text-neutral-500 shrink-0" />
            </template>
          </USelectMenu>

          <UButton
            v-if="state.traitIds[slotIdx]"
            icon="i-lucide-x"
            variant="ghost"
            color="neutral"
            size="xs"
            class="h-6 w-6 p-0 text-neutral-400 hover:text-white shrink-0"
            @click="state.traitIds[slotIdx] = null"
          />
        </div>
      </div>

      <!-- Tab 3: Status Potentials (Damage, Health, Range, Speed, Cooldown) -->
      <div v-show="activeTab === 'potentials'" class="space-y-1.5">
        <div
          v-for="stat in potentialFields"
          :key="stat.key"
          class="flex items-center justify-between p-2 rounded-lg border border-white/5 bg-neutral-900/40 text-xs"
        >
          <span class="font-bold flex items-center gap-2" :class="stat.textColor">
            <UIcon :name="stat.icon" class="w-4 h-4" />
            <span>{{ stat.label }}</span>
          </span>

          <USelect
            :model-value="state.potentials[stat.key] || 'D'"
            :items="stat.key === 'cooldown' ? cooldownRankItems : rankItems"
            size="xs"
            variant="outline"
            color="neutral"
            class="w-28 font-mono font-semibold"
            :class="getRankSelectStyle(state.potentials[stat.key])"
            @update:model-value="(val) => state.potentials[stat.key] = val as PotentialRank"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { PotentialRank, StatPotentials, GearSlot } from '~/types/unit'
import { getRobloxImageUrl, getElementConfig } from '~/utils/formatters'
import {
  getMaxUnitLevel,
  POTENTIAL_CONFIGS,
  POTENTIAL_RANK_ORDER,
  getRankSelectStyle,
  matchesUnit
} from '~/utils/unitCalculator'

export interface CompareUnitPanelState {
  stars: number
  level: number
  upgradeLevel: number
  potentials: StatPotentials
  traitIds: [string | null, string | null]
  gears: Record<GearSlot, string | null>
}

const props = defineProps<{
  unit: any
  state: CompareUnitPanelState
  allTraits: any[]
  allGears: any[]
}>()

defineEmits<{
  (e: 'open-picker'): void
}>()

const activeTab = ref<'gears' | 'traits' | 'potentials'>('gears')

const maxLevelForStars = computed(() => {
  return getMaxUnitLevel(props.state.stars)
})

function onUpdateStars(s: number) {
  props.state.stars = s
  const maxLvl = getMaxUnitLevel(s)
  if (props.state.level > maxLvl) {
    props.state.level = maxLvl
  }
}

// Recommended Signature Gears for this unit
const recommendedGears = computed<Array<{ slot: GearSlot; gear: any }>>(() => {
  if (!props.unit) return []
  const list: Array<{ slot: GearSlot; gear: any }> = []
  for (const g of props.allGears || []) {
    if (!g.Stats) continue
    for (const [k, v] of Object.entries(g.Stats)) {
      if (typeof v === 'object' && v !== null && matchesUnit(k, props.unit)) {
        list.push({ slot: g.Slot || g.slot, gear: g })
        break
      }
    }
  }
  return list
})

const hasUnequippedRecommended = computed(() => {
  return recommendedGears.value.some(r => props.state.gears[r.slot] !== r.gear.id)
})

function equipAllRecommended() {
  for (const r of recommendedGears.value) {
    props.state.gears[r.slot] = r.gear.id
  }
}

function getRecommendedForSlot(slot: GearSlot): any | null {
  return recommendedGears.value.find(r => r.slot === slot)?.gear || null
}

function getRarityColor(rarity?: string): any {
  if (!rarity) return 'neutral'
  const r = rarity.toLowerCase()
  if (r.includes('secret') || r.includes('mythic')) return 'error'
  if (r.includes('celestial') || r.includes('mysterious') || r.includes('exclusive')) return 'primary'
  if (r.includes('legendary')) return 'warning'
  if (r.includes('epic')) return 'secondary'
  if (r.includes('rare')) return 'info'
  return 'neutral'
}

function getSlotIcon(slot: GearSlot): string {
  switch (slot) {
    case 'Head': return 'i-lucide-hard-hat'
    case 'Body': return 'i-lucide-shirt'
    case 'Arm': return 'i-lucide-sword'
    case 'Legs': return 'i-lucide-footprints'
    default: return 'i-lucide-shield'
  }
}

function getGearIcon(gearId: string | null): string | null {
  if (!gearId) return null
  const found = (props.allGears || []).find((g: any) => g.id === gearId)
  return found?.Icon ? getRobloxImageUrl(found.Icon) : null
}

function getTraitIcon(traitId: string | null): string | null {
  if (!traitId) return null
  const found = (props.allTraits || []).find((t: any) => t.id === traitId)
  return found?.TraitIcon ? getRobloxImageUrl(found.TraitIcon) : null
}

function getGearOptionsForSlot(slot: GearSlot) {
  const options = [{ value: 'none', label: 'None', icon: null, isRecommended: false }]
  const gears = (props.allGears || []).filter((g: any) => g.Slot === slot || g.slot === slot)
  const rec = getRecommendedForSlot(slot)

  const mapped = gears.map((g: any) => {
    const isRec = rec?.id === g.id
    return {
      value: g.id,
      label: isRec ? `Recommended - ${g.Name}` : `${g.Name} • ${g.Rarity}`,
      icon: g.Icon,
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

const traitOptions = computed(() => {
  const options = [{ value: 'none', label: 'None', icon: null }]
  for (const t of props.allTraits || []) {
    options.push({
      value: t.id,
      label: `${t.TraitDisplayName} • ${t.RarityName}`,
      icon: t.TraitIcon
    })
  }
  return options
})

const potentialFields = [
  { key: 'damage' as const, label: 'Damage', icon: 'i-lucide-zap', textColor: 'text-rose-400' },
  { key: 'health' as const, label: 'Health', icon: 'i-lucide-heart', textColor: 'text-emerald-400' },
  { key: 'range' as const, label: 'Range', icon: 'i-lucide-target', textColor: 'text-amber-400' },
  { key: 'speed' as const, label: 'Speed', icon: 'i-lucide-footprints', textColor: 'text-cyan-400' },
  { key: 'cooldown' as const, label: 'Attack Cooldown', icon: 'i-lucide-hourglass', textColor: 'text-teal-400' }
]

const rankItems = computed(() => {
  return POTENTIAL_RANK_ORDER.map(key => {
    const cfg = POTENTIAL_CONFIGS[key]
    const pct = Math.round(cfg.percent * 100)
    return {
      value: key,
      label: key === 'NONE' ? '-' : `${cfg.label} +${pct}%`
    }
  })
})

const cooldownRankItems = computed(() => {
  return POTENTIAL_RANK_ORDER.map(key => {
    const cfg = POTENTIAL_CONFIGS[key]
    const pct = Math.round(cfg.percent * 100)
    return {
      value: key,
      label: key === 'NONE' ? '-' : `${cfg.label} -${pct}%`
    }
  })
})
</script>

