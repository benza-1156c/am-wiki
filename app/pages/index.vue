<template>
  <div class="space-y-8">
    <!-- Hero Header -->
    <div class="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#0f172a] via-[#090d16] to-[#1e1b4b] p-6 sm:p-8 md:p-10 shadow-2xl">
      <!-- Background Ambient Glow -->
      <div class="absolute -top-24 -right-24 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none"></div>
      <div class="absolute -bottom-24 -left-24 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div class="relative z-10 space-y-4 max-w-3xl">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-wider uppercase">
          <UIcon name="i-lucide-book-open" class="w-3.5 h-3.5" />
          <span>Anime Mysterious Wiki & Database</span>
        </div>

        <h1 class="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
          Units Encyclopedia <span class="text-primary">& Calculator</span>
        </h1>

        <p class="text-sm sm:text-base text-neutral-300 leading-relaxed">
          สารบัญตัวละครและคลังข้อมูลสกิลทั้งหมด {{ allUnits.length }} ตัวละครใน Anime Mysterious เลือกตัวละครเพื่อเปิดหน้าจำลองบิลด์, คำนวณสเตตัส, ใส่ Gear 4 ช่อง และทดสอบ Trait แบบ Real-time
        </p>

        <!-- Fast Stats Badges -->
        <div class="flex flex-wrap items-center gap-3 pt-2 text-xs font-mono">
          <div class="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-neutral-300 flex items-center gap-2">
            <UIcon name="i-lucide-users" class="w-4 h-4 text-primary" />
            <span><strong class="text-white font-bold">{{ allUnits.length }}</strong> Units</span>
          </div>
          <div class="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-neutral-300 flex items-center gap-2">
            <UIcon name="i-lucide-shield" class="w-4 h-4 text-emerald-400" />
            <span><strong class="text-white font-bold">50</strong> Gears</span>
          </div>
          <div class="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-neutral-300 flex items-center gap-2">
            <UIcon name="i-lucide-sparkles" class="w-4 h-4 text-amber-400" />
            <span><strong class="text-white font-bold">18</strong> Traits</span>
          </div>
          <NuxtLink to="/units/dracula-vampire-progenitor">
            <div class="px-3 py-1.5 rounded-lg bg-primary/20 border border-primary/40 text-primary hover:bg-primary/30 transition-colors flex items-center gap-1.5 cursor-pointer font-sans font-semibold">
              <UIcon name="i-lucide-calculator" class="w-4 h-4" />
              <span>Go to Calculator</span>
              <UIcon name="i-lucide-arrow-right" class="w-3.5 h-3.5" />
            </div>
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Filter & Search Toolbar -->
    <div class="space-y-4 p-4 sm:p-5 rounded-xl border border-white/5 bg-[#0f172a]/60 backdrop-blur-md">
      <!-- Row 1: Search & Sort -->
      <div class="grid grid-cols-1 md:grid-cols-12 gap-3">
        <!-- Search Input -->
        <div class="md:col-span-8">
          <UInput
            v-model="searchQuery"
            icon="i-lucide-search"
            placeholder="ค้นหาด้วยชื่อตัวละคร (เช่น Dracula, Jinwoo, Sukuna), ซีรีส์ หรือ ธาตุ..."
            size="md"
            class="w-full"
          />
        </div>

        <!-- Sort Select -->
        <div class="md:col-span-4 flex items-center gap-2">
          <span class="text-xs text-muted whitespace-nowrap shrink-0">Sort By:</span>
          <select
            v-model="sortBy"
            class="w-full px-3 py-1.5 text-xs rounded-md bg-[#090d16] border border-white/10 text-white focus:outline-none focus:border-primary"
          >
            <option value="rarity">Rarity (Highest First)</option>
            <option value="attack">Max Attack (Highest)</option>
            <option value="dps">Max DPS (Highest)</option>
            <option value="name">Name (A - Z)</option>
            <option value="series">Series</option>
          </select>
        </div>
      </div>

      <!-- Row 2: Rarity Filter Pills -->
      <div class="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
        <button
          type="button"
          class="px-3 py-1 rounded-lg text-xs font-semibold transition-all shrink-0 border"
          :class="selectedRarity === 'ALL' ? 'bg-primary text-black border-primary' : 'bg-white/5 text-neutral-300 border-white/10 hover:bg-white/10'"
          @click="selectedRarity = 'ALL'"
        >
          All Rarities ({{ allUnits.length }})
        </button>

        <button
          v-for="r in popularRarities"
          :key="r"
          type="button"
          class="px-2.5 py-1 rounded-lg text-xs font-semibold transition-all shrink-0 border flex items-center gap-1.5"
          :class="selectedRarity === r ? getRarityPillActiveStyle(r) : 'bg-white/5 text-neutral-400 border-white/10 hover:bg-white/10'"
          @click="selectedRarity = r"
        >
          <span class="w-1.5 h-1.5 rounded-full" :class="getRarityDotColor(r)"></span>
          <span>{{ r }}</span>
          <span class="text-[10px] opacity-75">({{ getRarityCount(r) }})</span>
        </button>
      </div>

      <!-- Row 3: Series & Element Dropdowns -->
      <div class="flex flex-wrap items-center gap-3 pt-1 border-t border-white/5 text-xs">
        <!-- Series Filter -->
        <div class="flex items-center gap-2">
          <span class="text-muted">Series:</span>
          <select
            v-model="selectedSeries"
            class="px-2.5 py-1 rounded bg-[#090d16] border border-white/10 text-neutral-300 text-xs focus:outline-none focus:border-primary"
          >
            <option value="ALL">All Series ({{ allSeries.length }})</option>
            <option v-for="s in allSeries" :key="s" :value="s">{{ s }}</option>
          </select>
        </div>

        <!-- Element Filter -->
        <div class="flex items-center gap-2">
          <span class="text-muted">Element:</span>
          <select
            v-model="selectedElement"
            class="px-2.5 py-1 rounded bg-[#090d16] border border-white/10 text-neutral-300 text-xs focus:outline-none focus:border-primary"
          >
            <option value="ALL">All Elements ({{ allElements.length }})</option>
            <option v-for="e in allElements" :key="e" :value="e">{{ e }}</option>
          </select>
        </div>

        <!-- Active Results / Reset Button -->
        <div class="ml-auto flex items-center gap-2 text-xs">
          <span class="text-neutral-400">
            Showing <strong class="text-white">{{ filteredUnits.length }}</strong> of {{ allUnits.length }} units
          </span>
          <button
            v-if="hasActiveFilter"
            type="button"
            class="text-primary hover:underline font-semibold ml-2"
            @click="resetFilters"
          >
            Reset Filters
          </button>
        </div>
      </div>
    </div>

    <!-- Units Grid -->
    <div v-if="filteredUnits.length > 0" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      <NuxtLink
        v-for="u in filteredUnits"
        :key="u.id"
        :to="`/units/${toUnitSlug(u)}`"
        class="group relative rounded-xl border bg-[#0d1322]/80 backdrop-blur-sm p-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl flex flex-col justify-between"
        :class="getRarityCardBorder(u.rarity)"
      >
        <!-- Top Card Meta -->
        <div>
          <div class="flex items-center justify-between gap-1.5 mb-2.5">
            <UBadge
              v-if="u.rarity"
              :color="getRarityBadgeColor(u.rarity)"
              variant="subtle"
              size="xs"
              class="font-bold tracking-wide"
            >
              {{ u.rarity }}
            </UBadge>
            <UBadge
              v-if="u.element && u.element !== 'None'"
              color="neutral"
              variant="outline"
              size="xs"
              class="text-[10px]"
            >
              {{ u.element }}
            </UBadge>
          </div>

          <!-- Unit Display Name -->
          <h3 class="font-extrabold text-sm text-white group-hover:text-primary transition-colors tracking-tight line-clamp-1">
            {{ u.displayName || u.name }}
          </h3>

          <!-- Subtitle: Series & SkillMode -->
          <div class="flex items-center gap-1.5 text-[11px] text-neutral-400 mt-0.5">
            <span class="truncate">{{ u.series || 'Other' }}</span>
            <span v-if="u.skillMode">•</span>
            <span v-if="u.skillMode" class="truncate">{{ u.skillMode }}</span>
          </div>
        </div>

        <!-- Quick Stats Preview -->
        <div class="mt-4 pt-3 border-t border-white/5 space-y-1.5 text-xs font-mono">
          <div class="flex items-center justify-between text-neutral-400">
            <span class="text-[11px] flex items-center gap-1">
              <UIcon name="i-lucide-sword" class="w-3 h-3 text-rose-400" />
              <span>Max ATK</span>
            </span>
            <span class="font-bold text-slate-200">
              {{ formatStat(u.statsAtMax?.attack || u.baseDamage) }}
            </span>
          </div>

          <div class="flex items-center justify-between text-neutral-400">
            <span class="text-[11px] flex items-center gap-1">
              <UIcon name="i-lucide-flame" class="w-3 h-3 text-amber-400" />
              <span>Max DPS</span>
            </span>
            <span class="font-bold text-amber-300">
              {{ formatStat(u.statsAtMax?.dps) }}
            </span>
          </div>

          <div class="flex items-center justify-between text-neutral-400">
            <span class="text-[11px] flex items-center gap-1">
              <UIcon name="i-lucide-crosshair" class="w-3 h-3 text-cyan-400" />
              <span>Range</span>
            </span>
            <span class="text-neutral-300">
              {{ u.statsAtMax?.range || u.statsAtBase?.range || '-' }}
            </span>
          </div>
        </div>

        <!-- Bottom Action CTA -->
        <div class="mt-3 pt-2 flex items-center justify-between text-[11px] font-semibold text-primary group-hover:underline">
          <span>Calculate & Build</span>
          <UIcon name="i-lucide-arrow-right" class="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
        </div>
      </NuxtLink>
    </div>

    <!-- Empty Results State -->
    <div
      v-else
      class="flex flex-col items-center justify-center p-12 rounded-xl border border-white/5 bg-[#0f172a]/40 text-center space-y-3"
    >
      <div class="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-neutral-400">
        <UIcon name="i-lucide-search-x" class="w-6 h-6" />
      </div>
      <div>
        <h3 class="text-base font-bold text-white">No Units Found</h3>
        <p class="text-xs text-muted mt-1">
          No characters matched your search query or filter criteria.
        </p>
      </div>
      <UButton
        label="Clear All Filters"
        icon="i-lucide-rotate-ccw"
        variant="outline"
        color="primary"
        size="sm"
        @click="resetFilters"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { toUnitSlug } from '~/utils/unitSlug'

const { units } = useDatabase()

const allUnits = computed<any[]>(() => units.value || [])

// Filter states
const searchQuery = ref('')
const selectedRarity = ref('ALL')
const selectedSeries = ref('ALL')
const selectedElement = ref('ALL')
const sortBy = ref<'rarity' | 'attack' | 'dps' | 'name' | 'series'>('rarity')

// Rarity ordering for sorting & priority
const rarityPriority: Record<string, number> = {
  Secret: 100,
  Celestial: 95,
  Mythic: 90,
  Tactical: 85,
  Mysterious: 80,
  Exclusive: 75,
  Exclusive_Yisang: 70,
  Legendary: 60,
  Epic: 50,
  Rare: 40,
  Common: 10
}

const popularRarities = ['Secret', 'Mythic', 'Celestial', 'Tactical', 'Legendary', 'Epic', 'Rare']

// Extract unique series & elements
const allSeries = computed(() => {
  const set = new Set<string>()
  for (const u of allUnits.value) {
    if (u.series) set.add(u.series)
  }
  return Array.from(set).sort()
})

const allElements = computed(() => {
  const set = new Set<string>()
  for (const u of allUnits.value) {
    if (u.element && u.element !== 'None' && u.element !== 'Neutral') set.add(u.element)
  }
  return Array.from(set).sort()
})

function getRarityCount(rarity: string): number {
  return allUnits.value.filter(u => u.rarity === rarity).length
}

const hasActiveFilter = computed(() => {
  return searchQuery.value.trim() !== '' ||
    selectedRarity.value !== 'ALL' ||
    selectedSeries.value !== 'ALL' ||
    selectedElement.value !== 'ALL'
})

function resetFilters() {
  searchQuery.value = ''
  selectedRarity.value = 'ALL'
  selectedSeries.value = 'ALL'
  selectedElement.value = 'ALL'
  sortBy.value = 'rarity'
}

// Filtered and Sorted list
const filteredUnits = computed(() => {
  let list = allUnits.value

  // 1. Search Query
  const q = searchQuery.value.toLowerCase().trim()
  if (q) {
    list = list.filter((u: any) =>
      (u.name || '').toLowerCase().includes(q) ||
      (u.displayName || '').toLowerCase().includes(q) ||
      (u.series || '').toLowerCase().includes(q) ||
      (u.rarity || '').toLowerCase().includes(q) ||
      (u.element || '').toLowerCase().includes(q)
    )
  }

  // 2. Rarity Filter
  if (selectedRarity.value !== 'ALL') {
    list = list.filter((u: any) => u.rarity === selectedRarity.value)
  }

  // 3. Series Filter
  if (selectedSeries.value !== 'ALL') {
    list = list.filter((u: any) => u.series === selectedSeries.value)
  }

  // 4. Element Filter
  if (selectedElement.value !== 'ALL') {
    list = list.filter((u: any) => u.element === selectedElement.value)
  }

  // 5. Sorting
  return [...list].sort((a: any, b: any) => {
    switch (sortBy.value) {
      case 'attack':
        return (b.statsAtMax?.attack || 0) - (a.statsAtMax?.attack || 0)
      case 'dps':
        return (b.statsAtMax?.dps || 0) - (a.statsAtMax?.dps || 0)
      case 'name':
        return (a.displayName || a.name || '').localeCompare(b.displayName || b.name || '')
      case 'series':
        return (a.series || '').localeCompare(b.series || '')
      case 'rarity':
      default:
        const prioA = rarityPriority[a.rarity] || 0
        const prioB = rarityPriority[b.rarity] || 0
        if (prioA !== prioB) return prioB - prioA
        return (b.statsAtMax?.attack || 0) - (a.statsAtMax?.attack || 0)
    }
  })
})

function formatStat(num?: number): string {
  if (num === undefined || num === null) return '-'
  return num.toLocaleString(undefined, { maximumFractionDigits: 1 })
}

// Visual badge helpers
function getRarityBadgeColor(rarity?: string): any {
  switch (rarity) {
    case 'Secret':
    case 'Mythic':
      return 'error'
    case 'Celestial':
    case 'Mysterious':
      return 'primary'
    case 'Tactical':
    case 'Legendary':
      return 'warning'
    case 'Epic':
      return 'secondary'
    case 'Rare':
      return 'info'
    default:
      return 'neutral'
  }
}

function getRarityCardBorder(rarity?: string): string {
  switch (rarity) {
    case 'Secret':
      return 'border-rose-500/30 hover:border-rose-500/60 hover:shadow-rose-500/10'
    case 'Mythic':
      return 'border-fuchsia-500/30 hover:border-fuchsia-500/60 hover:shadow-fuchsia-500/10'
    case 'Celestial':
      return 'border-cyan-500/30 hover:border-cyan-500/60 hover:shadow-cyan-500/10'
    case 'Tactical':
      return 'border-amber-500/30 hover:border-amber-500/60 hover:shadow-amber-500/10'
    case 'Legendary':
      return 'border-yellow-500/30 hover:border-yellow-500/60 hover:shadow-yellow-500/10'
    case 'Epic':
      return 'border-violet-500/30 hover:border-violet-500/60'
    case 'Rare':
      return 'border-blue-500/30 hover:border-blue-500/60'
    default:
      return 'border-white/10 hover:border-white/20'
  }
}

function getRarityPillActiveStyle(rarity: string): string {
  switch (rarity) {
    case 'Secret':
      return 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-sm'
    case 'Mythic':
      return 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/40 shadow-sm'
    case 'Celestial':
      return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-sm'
    case 'Tactical':
    case 'Legendary':
      return 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
    case 'Epic':
      return 'bg-violet-500/20 text-violet-300 border-violet-500/40 shadow-sm'
    case 'Rare':
      return 'bg-blue-500/20 text-blue-300 border-blue-500/40 shadow-sm'
    default:
      return 'bg-white/20 text-white border-white/30'
  }
}

function getRarityDotColor(rarity: string): string {
  switch (rarity) {
    case 'Secret': return 'bg-rose-400'
    case 'Mythic': return 'bg-fuchsia-400'
    case 'Celestial': return 'bg-cyan-400'
    case 'Tactical':
    case 'Legendary': return 'bg-amber-400'
    case 'Epic': return 'bg-violet-400'
    case 'Rare': return 'bg-blue-400'
    default: return 'bg-neutral-400'
  }
}

// SEO for Home Page
useSeoMeta({
  title: 'Anime Mysterious Wiki - Units Database & Build Calculator',
  description: 'Comprehensive Anime Mysterious wiki database: 85 units, stats at base & max level, damage calculator, gears, and traits.',
  ogTitle: 'Anime Mysterious Wiki - Units Database & Build Calculator',
  ogDescription: 'Explore all 85 characters, their max stats, and calculate builds with gears and traits in Anime Mysterious.',
  ogType: 'website'
})
</script>
