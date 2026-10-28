<template>
  <div
    class="group relative flex flex-col justify-between rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl overflow-hidden cursor-pointer"
    :class="[rarityConfig.border, rarityConfig.glow, 'bg-gradient-to-b ' + rarityConfig.bg]"
    @click="$emit('select-unit', unit)"
  >
    <!-- Top ambient glow light -->
    <div
      class="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-2xl opacity-30 pointer-events-none group-hover:opacity-50 transition-opacity"
      :style="{ backgroundColor: rarityConfig.accent }"
    ></div>

    <!-- Card Top Header -->
    <div class="p-3.5 pb-2">
      <div class="flex items-center justify-between gap-1.5">
        <!-- Rarity Badge -->
        <span
          class="text-[10px] font-black tracking-wider px-2 py-0.5 rounded-full border shadow-sm font-['Outfit']"
          :class="rarityConfig.badge"
        >
          {{ rarityConfig.label }}
        </span>

        <!-- Element & Mode Pills -->
        <div class="flex items-center gap-1">
          <span
            class="text-[11px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 shadow-sm"
            :class="[elementConfig.bg, elementConfig.border, elementConfig.color]"
          >
            <UIcon :name="elementConfig.uiIcon" class="w-3 h-3" />
            <span class="hidden sm:inline">{{ elementConfig.label }}</span>
          </span>
          <span class="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-900/80 text-slate-300 border border-slate-700/60">
            {{ unit.skillMode }}
          </span>
        </div>
      </div>

      <!-- Character Shield / Emblem with Nuxt UI UIcon -->
      <div class="relative my-3 flex flex-col items-center">
        <div class="relative flex flex-col items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-950 p-1 border border-white/10 shadow-inner group-hover:scale-105 transition-transform duration-300">
          <div
            class="w-full h-full rounded-xl flex flex-col items-center justify-center shadow-md border border-white/5 relative overflow-hidden"
            :style="{ background: `linear-gradient(135deg, ${rarityConfig.accent}44 0%, #0f172a 100%)` }"
          >
            <UIcon :name="getUnitIcon(unit.name)" class="w-8 h-8 text-white drop-shadow-md mb-0.5" />
            <span class="text-[9px] font-black uppercase text-cyan-200 tracking-wider">{{ getInitials(unit.name) }}</span>
          </div>

          <!-- Evolution Icon Indicator -->
          <div
            v-if="unit.evolution"
            class="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 flex items-center justify-center text-xs font-black shadow-md"
            title="Evolution Available"
          >
            <UIcon name="i-lucide-zap" class="w-3.5 h-3.5 text-slate-950" />
          </div>

          <!-- Level 5 Max Badge -->
          <div class="absolute -bottom-2 px-2 py-0.2 rounded-full bg-slate-900/90 text-cyan-300 border border-cyan-500/40 text-[9px] font-bold">
            MAX LV.{{ unit.maxLevel }}
          </div>
        </div>

        <!-- Name & Display Name -->
        <div class="mt-2 text-center w-full px-2">
          <h3 class="font-black text-base text-white tracking-tight truncate group-hover:text-cyan-300 transition-colors font-['Outfit']">
            {{ unit.name }}
          </h3>
          <div class="flex items-center justify-center gap-1.5 text-xs text-slate-400 mt-0.5">
            <span v-if="unit.displayName && unit.displayName !== unit.name" class="text-slate-300 truncate max-w-[100px]">
              "{{ unit.displayName }}"
            </span>
            <span class="text-slate-600">•</span>
            <span class="px-1.5 py-0.2 rounded bg-slate-800/80 text-[10px] font-semibold text-slate-300 border border-slate-700/50">
              {{ seriesLabel }}
            </span>
          </div>
        </div>
      </div>

      <!-- efootbase 6-Stat Grid with Nuxt UI Icons -->
      <div class="grid grid-cols-3 gap-1.5 mt-2 bg-slate-950/60 p-2 rounded-xl border border-slate-800/80">
        <!-- ATK -->
        <div class="flex flex-col items-center bg-slate-900/70 p-1.5 rounded-lg border border-slate-800/50">
          <span class="text-[9px] font-bold text-slate-400 flex items-center gap-1">
            <UIcon name="i-lucide-swords" class="w-3 h-3 text-amber-400" /> ATK
          </span>
          <span class="text-xs font-extrabold text-amber-300 mt-0.5">{{ formatNumber(currentStats.attack) }}</span>
        </div>

        <!-- DPS -->
        <div class="flex flex-col items-center bg-slate-900/70 p-1.5 rounded-lg border border-slate-800/50">
          <span class="text-[9px] font-bold text-slate-400 flex items-center gap-1">
            <UIcon name="i-lucide-flame" class="w-3 h-3 text-red-400" /> DPS
          </span>
          <span class="text-xs font-extrabold text-red-400 mt-0.5">{{ formatNumber(currentStats.dps) }}</span>
        </div>

        <!-- SPA -->
        <div class="flex flex-col items-center bg-slate-900/70 p-1.5 rounded-lg border border-slate-800/50">
          <span class="text-[9px] font-bold text-slate-400 flex items-center gap-1">
            <UIcon name="i-lucide-zap" class="w-3 h-3 text-cyan-400" /> SPA
          </span>
          <span class="text-xs font-extrabold text-cyan-300 mt-0.5">{{ currentStats.attackSpeed }}s</span>
        </div>

        <!-- Range -->
        <div class="flex flex-col items-center bg-slate-900/70 p-1.5 rounded-lg border border-slate-800/50">
          <span class="text-[9px] font-bold text-slate-400 flex items-center gap-1">
            <UIcon name="i-lucide-crosshair" class="w-3 h-3 text-emerald-400" /> RNG
          </span>
          <span class="text-xs font-extrabold text-emerald-300 mt-0.5">{{ currentStats.range }}</span>
        </div>

        <!-- HP -->
        <div class="flex flex-col items-center bg-slate-900/70 p-1.5 rounded-lg border border-slate-800/50">
          <span class="text-[9px] font-bold text-slate-400 flex items-center gap-1">
            <UIcon name="i-lucide-heart" class="w-3 h-3 text-rose-400" /> HP
          </span>
          <span class="text-xs font-extrabold text-rose-300 mt-0.5">{{ formatNumber(currentStats.health) }}</span>
        </div>

        <!-- Cost -->
        <div class="flex flex-col items-center bg-slate-900/70 p-1.5 rounded-lg border border-slate-800/50">
          <span class="text-[9px] font-bold text-slate-400 flex items-center gap-1">
            <UIcon name="i-lucide-coins" class="w-3 h-3 text-yellow-400" /> COST
          </span>
          <span class="text-xs font-extrabold text-yellow-300 mt-0.5">{{ currentStats.cost }}</span>
        </div>
      </div>
    </div>

    <!-- Card Bottom Footer / Action Bar -->
    <div class="p-3 pt-2 bg-slate-950/80 border-t border-slate-800/80 flex items-center justify-between gap-2">
      <!-- Passive preview badge -->
      <div class="flex-1 min-w-0">
        <span
          v-if="unit.skill?.PassiveHeader"
          class="text-[10px] text-slate-400 truncate flex items-center gap-1"
          :title="cleanHtml(unit.skill.PassiveHeader)"
        >
          <UIcon name="i-lucide-sparkles" class="w-3 h-3 text-amber-400 flex-shrink-0" />
          <span class="truncate">{{ cleanHtml(unit.skill.PassiveHeader) }}</span>
        </span>
        <span v-else class="text-[10px] text-slate-500 italic block truncate">
          No passive skill
        </span>
      </div>

      <!-- Compare toggle button -->
      <button
        type="button"
        @click.stop="$emit('toggle-compare', unit)"
        class="flex-shrink-0 px-2 py-1 rounded-lg text-[10px] font-bold border transition-all flex items-center gap-1"
        :class="isCompared
          ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm'
          : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700'"
      >
        <UIcon name="i-lucide-scale" class="w-3 h-3" />
        <span>{{ isCompared ? 'Compared' : 'Compare' }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getRarityConfig, getElementConfig, getSeriesName, formatNumber, cleanHtml, getUnitIcon } from '~/utils/formatters'

interface UnitItem {
  id: string
  name: string
  displayName?: string
  series?: string
  rarity?: string
  element?: string
  skillMode?: string
  maxLevel: number
  unitCap?: number
  evolution?: any
  levels: Record<string, any>
  skill?: any
  statsAtMax: any
  statsAtBase: any
}

const props = defineProps<{
  unit: UnitItem
  statsMode: 'max' | 'base'
  isCompared: boolean
}>()

defineEmits<{
  (e: 'select-unit', unit: UnitItem): void
  (e: 'toggle-compare', unit: UnitItem): void
}>()

const rarityConfig = computed(() => getRarityConfig(props.unit.rarity))
const elementConfig = computed(() => getElementConfig(props.unit.element))
const seriesLabel = computed(() => getSeriesName(props.unit.series))

const currentStats = computed(() => {
  return props.statsMode === 'max' ? props.unit.statsAtMax : props.unit.statsAtBase
})

function getInitials(name: string): string {
  if (!name) return 'AM'
  const parts = name.split('_').filter(Boolean)
  const first = parts[0]
  const second = parts[1]
  if (parts.length >= 2 && first && second && first[0] && second[0]) {
    return (first[0] + second[0]).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}
</script>
