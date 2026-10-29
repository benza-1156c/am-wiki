<template>
  <div class="rounded-xl border border-white/10 bg-[#0f172a]/70 backdrop-blur-md p-4 sm:p-5 flex flex-col gap-4 relative overflow-hidden shadow-xl">
    <!-- Top colored accent glow matching element/rarity -->
    <div
      class="absolute inset-x-0 top-0 h-1"
      :class="side === 'left' ? 'bg-gradient-to-r from-cyan-500 to-blue-600' : 'bg-gradient-to-r from-purple-500 to-pink-600'"
    ></div>

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
        :color="side === 'left' ? 'primary' : 'secondary'"
        class="shrink-0"
        @click="$emit('open-picker')"
      />
    </div>

    <!-- Quick Stat Pill (DPS & Cost) -->
    <div class="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-black/40 border border-white/5 text-center">
      <div>
        <div class="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold">Calculated DPS</div>
        <div class="text-base sm:text-lg font-extrabold font-mono text-cyan-400">
          {{ formatNumber(stats.dps) }}
        </div>
      </div>
      <div>
        <div class="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold">Total Cost</div>
        <div class="text-base sm:text-lg font-extrabold font-mono text-amber-300">
          ¥{{ formatNumber(stats.cost, 0) }}
        </div>
      </div>
    </div>

    <!-- Controls (Stars, Level, Upgrade) -->
    <div class="space-y-3 pt-2 border-t border-white/5">
      <!-- Awakening Stars (0-6★) -->
      <div>
        <div class="flex items-center justify-between text-xs mb-1.5">
          <span class="text-neutral-300 font-medium flex items-center gap-1">
            <UIcon name="i-lucide-sparkles" class="w-3.5 h-3.5 text-amber-400" />
            Awakening
          </span>
          <span class="font-bold text-amber-400 font-mono">{{ stars }}★</span>
        </div>
        <div class="flex items-center gap-1">
          <button
            v-for="s in [0, 1, 2, 3, 4, 5, 6]"
            :key="s"
            class="flex-1 py-1 rounded text-xs font-bold transition-all"
            :class="stars === s ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-sm shadow-amber-500/20' : 'bg-white/5 text-neutral-400 hover:bg-white/10'"
            @click="$emit('update:stars', s)"
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
          <span class="font-bold text-primary font-mono">Lv. {{ level }}</span>
        </div>
        <input
          type="range"
          min="1"
          :max="maxLevelForStars"
          :value="level"
          class="w-full accent-cyan-400 cursor-pointer h-1.5 bg-neutral-800 rounded-lg"
          @input="$emit('update:level', Number(($event.target as HTMLInputElement).value))"
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
          <span class="font-bold text-emerald-400 font-mono">Upg. {{ upgradeLevel }} / {{ unit?.maxLevel || 5 }}</span>
        </div>
        <div class="flex items-center gap-1 overflow-x-auto pb-1">
          <button
            v-for="u in (unit?.maxLevel !== undefined ? unit.maxLevel + 1 : 6)"
            :key="u - 1"
            class="flex-1 min-w-[28px] py-1 rounded text-xs font-bold transition-all"
            :class="upgradeLevel === (u - 1) ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-sm shadow-emerald-500/20' : 'bg-white/5 text-neutral-400 hover:bg-white/10'"
            @click="$emit('update:upgradeLevel', u - 1)"
          >
            {{ u - 1 }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { getRobloxImageUrl, getElementConfig, formatNumber } from '~/utils/formatters'
import { getMaxUnitLevel } from '~/utils/unitCalculator'

const props = defineProps<{
  unit: any
  side: 'left' | 'right'
  stats: any
  stars: number
  level: number
  upgradeLevel: number
}>()

defineEmits<{
  (e: 'open-picker'): void
  (e: 'update:stars', val: number): void
  (e: 'update:level', val: number): void
  (e: 'update:upgradeLevel', val: number): void
}>()

const maxLevelForStars = computed(() => {
  return getMaxUnitLevel(props.stars)
})

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
</script>
