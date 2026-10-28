<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 shadow-xl">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 class="text-xl font-black text-white font-['Outfit'] flex items-center gap-2">
            <UIcon name="i-lucide-trophy" class="w-5 h-5 text-amber-400" /> Tier & Performance Rankings
          </h2>
          <p class="text-xs text-slate-400">Discover the strongest units by DPS, raw Attack, Range, and Attack Speed at Level 5 Max Upgrade.</p>
        </div>

        <div class="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            v-for="cat in rankingCategories"
            :key="cat.id"
            @click="activeCategory = cat.id"
            class="px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"
            :class="activeCategory === cat.id
              ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white'"
          >
            <UIcon :name="cat.icon" class="w-3.5 h-3.5" />
            <span>{{ cat.label }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Leaderboard Table -->
    <div class="bg-slate-900/80 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
      <div class="p-4 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
        <span class="text-xs font-bold uppercase tracking-wider text-cyan-400">
          Top 20 Units - {{ currentCategoryLabel }}
        </span>
        <span class="text-xs text-slate-400">Calculated at Max Level (Lv.5)</span>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-900/90 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
            <tr>
              <th class="py-3 px-4 w-12 text-center">Rank</th>
              <th class="py-3 px-4">Unit Name</th>
              <th class="py-3 px-4">Series</th>
              <th class="py-3 px-4">Rarity</th>
              <th class="py-3 px-4">Element</th>
              <th class="py-3 px-4 text-right" :class="activeCategory === 'dps' ? 'text-red-400' : ''">DPS</th>
              <th class="py-3 px-4 text-right" :class="activeCategory === 'atk' ? 'text-amber-400' : ''">ATK</th>
              <th class="py-3 px-4 text-right" :class="activeCategory === 'spa' ? 'text-cyan-400' : ''">SPA</th>
              <th class="py-3 px-4 text-right" :class="activeCategory === 'range' ? 'text-emerald-400' : ''">Range</th>
              <th class="py-3 px-4 text-right">Cost</th>
              <th class="py-3 px-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800/60 bg-slate-950/40">
            <tr
              v-for="(unit, idx) in sortedUnits"
              :key="unit.id"
              class="hover:bg-slate-800/40 transition-colors cursor-pointer"
              @click="$emit('select-unit', unit)"
            >
              <!-- Rank with Top 3 Badges -->
              <td class="py-3 px-4 text-center font-extrabold text-sm">
                <span v-if="idx === 0" class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 font-black text-xs">1</span>
                <span v-else-if="idx === 1" class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-300/20 text-slate-200 border border-slate-300/40 font-black text-xs">2</span>
                <span v-else-if="idx === 2" class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-700/20 text-amber-400 border border-amber-600/40 font-black text-xs">3</span>
                <span v-else class="text-slate-500 font-mono text-xs">#{{ idx + 1 }}</span>
              </td>

              <!-- Unit Name -->
              <td class="py-3 px-4">
                <div class="flex items-center gap-2.5">
                  <span class="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-white">
                    {{ unit.name.slice(0, 2).toUpperCase() }}
                  </span>
                  <div>
                    <span class="font-bold text-white hover:text-cyan-300 text-sm block font-['Outfit']">{{ unit.name }}</span>
                    <span v-if="unit.displayName && unit.displayName !== unit.name" class="text-[10px] text-slate-400">"{{ unit.displayName }}"</span>
                  </div>
                </div>
              </td>

              <!-- Series -->
              <td class="py-3 px-4 text-slate-300">{{ getSeriesName(unit.series) }}</td>

              <!-- Rarity -->
              <td class="py-3 px-4">
                <span class="text-[10px] font-bold px-2 py-0.5 rounded-full border" :class="getRarityConfig(unit.rarity).badge">
                  {{ unit.rarity }}
                </span>
              </td>

              <!-- Element -->
              <td class="py-3 px-4">
                <span class="text-xs font-semibold flex items-center gap-1" :class="getElementConfig(unit.element).color">
                  <UIcon :name="getElementConfig(unit.element).uiIcon" class="w-3.5 h-3.5" />
                  <span>{{ unit.element }}</span>
                </span>
              </td>

              <!-- Stats Values -->
              <td class="py-3 px-4 text-right font-extrabold" :class="activeCategory === 'dps' ? 'text-red-400 text-sm' : 'text-slate-300'">
                {{ formatNumber(unit.statsAtMax.dps) }}
              </td>
              <td class="py-3 px-4 text-right font-extrabold" :class="activeCategory === 'atk' ? 'text-amber-300 text-sm' : 'text-slate-300'">
                {{ formatNumber(unit.statsAtMax.attack) }}
              </td>
              <td class="py-3 px-4 text-right font-extrabold" :class="activeCategory === 'spa' ? 'text-cyan-300 text-sm' : 'text-slate-300'">
                {{ unit.statsAtMax.attackSpeed }}s
              </td>
              <td class="py-3 px-4 text-right font-extrabold" :class="activeCategory === 'range' ? 'text-emerald-300 text-sm' : 'text-slate-300'">
                {{ unit.statsAtMax.range }}
              </td>
              <td class="py-3 px-4 text-right text-yellow-300 font-bold">
                <span class="flex items-center justify-end gap-1">
                  <UIcon name="i-lucide-coins" class="w-3.5 h-3.5 text-yellow-400" />
                  <span>{{ formatNumber(unit.statsAtMax.totalCost || unit.statsAtMax.cost) }}</span>
                </span>
              </td>

              <!-- Action button -->
              <td class="py-3 px-4 text-center">
                <button
                  type="button"
                  @click.stop="$emit('select-unit', unit)"
                  class="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-cyan-600 hover:text-white text-slate-300 text-[11px] font-bold transition-all border border-slate-700"
                >
                  View
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getRarityConfig, getElementConfig, getSeriesName, formatNumber } from '~/utils/formatters'

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
  units: UnitItem[]
}>()

defineEmits<{
  (e: 'select-unit', unit: UnitItem): void
}>()

type CategoryType = 'dps' | 'atk' | 'range' | 'spa'
const activeCategory = ref<CategoryType>('dps')

const rankingCategories: { id: CategoryType; label: string; icon: string }[] = [
  { id: 'dps', label: 'Top DPS', icon: 'i-lucide-flame' },
  { id: 'atk', label: 'Highest ATK', icon: 'i-lucide-swords' },
  { id: 'range', label: 'Longest Range', icon: 'i-lucide-crosshair' },
  { id: 'spa', label: 'Fastest SPA', icon: 'i-lucide-zap' }
]

const currentCategoryLabel = computed(() => {
  return rankingCategories.find(c => c.id === activeCategory.value)?.label || 'Top Units'
})

const sortedUnits = computed(() => {
  const list = [...props.units]
  switch (activeCategory.value) {
    case 'dps':
      return list.sort((a, b) => (b.statsAtMax.dps || 0) - (a.statsAtMax.dps || 0)).slice(0, 20)
    case 'atk':
      return list.sort((a, b) => (b.statsAtMax.attack || 0) - (a.statsAtMax.attack || 0)).slice(0, 20)
    case 'range':
      return list.sort((a, b) => (b.statsAtMax.range || 0) - (a.statsAtMax.range || 0)).slice(0, 20)
    case 'spa':
      return list.sort((a, b) => (a.statsAtMax.attackSpeed || 99) - (b.statsAtMax.attackSpeed || 99)).slice(0, 20)
    default:
      return list.slice(0, 20)
  }
})
</script>
