<template>
  <div class="space-y-8 pb-12">
    <!-- Hero Banner -->
    <div
      class="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#0b0f19] via-[#090d16] to-[#121324] p-6 sm:p-8 md:p-10 shadow-2xl">
      <!-- Glow ambient lights -->
      <div class="absolute -top-32 -right-32 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none"></div>
      <div class="absolute -bottom-32 -left-32 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none">
      </div>

      <div class="relative z-10 max-w-3xl space-y-4">
        <div
          class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/25 text-primary text-xs font-bold tracking-wider uppercase">
          <UIcon name="i-lucide-book-open" class="w-3.5 h-3.5" />
          <span>Anime Mysterious Wiki & Calculator</span>
        </div>

        <h1 class="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
          Units Encyclopedia <span class="text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-400">&
            Calculator</span>
        </h1>


        <!-- Quick Action Buttons -->
        <div class="pt-2 flex flex-wrap items-center gap-3">
          <NuxtLink v-if="featuredUnitSlug" :to="'/units/' + featuredUnitSlug">
            <UButton icon="i-lucide-calculator" label="Open Calculator" variant="solid" color="primary" size="md" />
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Units Directory Section -->
    <div id="units-directory" class="space-y-4 pt-2">
      <!-- Search & Filters Toolbar Component -->
      <HomeDirectoryFilter v-model:search-query="searchQuery" v-model:selected-rarity="selectedRarity"
        v-model:selected-element="selectedElement" v-model:selected-series="selectedSeries" v-model:sort-by="sortBy"
        :series-options="seriesOptions" :sort-options="sortOptions" :rarity-pills="rarityPills"
        :element-pills="elementPills" />

      <!-- Directory Header & Count -->
      <div class="flex items-center justify-between px-1">
        <div class="flex items-center gap-2">
          <span class="text-xs font-bold uppercase tracking-wider text-neutral-300">
            Units Directory
          </span>
          <UBadge color="neutral" variant="subtle" size="xs">
            {{ filteredUnits.length }} of {{ unitsList.length }}
          </UBadge>
        </div>

        <div v-if="searchQuery || selectedRarity !== 'All' || selectedElement !== 'All' || selectedSeries !== 'all'"
          class="flex items-center gap-2">
          <UButton icon="i-lucide-rotate-ccw" label="Reset Filters" variant="ghost" color="neutral" size="xs"
            class="text-neutral-400 hover:text-white text-xs" @click="resetFilters" />
        </div>
      </div>

      <!-- Clean Units Grid (Featured card style without damage calculation) -->
      <div v-if="filteredUnits.length > 0"
        class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5">
        <HomeUnitCard v-for="u in filteredUnits" :key="u.id" :unit="u" />
      </div>

      <!-- Empty State -->
      <div v-else
        class="p-12 text-center rounded-2xl border border-white/10 bg-[#0d1322]/50 flex flex-col items-center justify-center space-y-3">
        <div
          class="w-12 h-12 rounded-full bg-neutral-900 border border-white/10 flex items-center justify-center text-neutral-500">
          <UIcon name="i-lucide-search-x" class="w-6 h-6" />
        </div>
        <div class="space-y-1">
          <h3 class="text-sm font-bold text-white">No units found</h3>
          <p class="text-xs text-neutral-400">No units match your current search and filter settings.</p>
        </div>
        <UButton icon="i-lucide-rotate-ccw" label="Clear All Filters" variant="outline" color="primary" size="xs"
          @click="resetFilters" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { toUnitSlug } from '~/utils/unitSlug'
import { getSeriesName } from '~/utils/formatters'

// Preload database on SSR for fast first render and indexing
const { data: dbData } = await useFetch<any>('/api/database', {
  key: 'am-db-data',
  default: () => null
})
const store = useCombatCalculatorStore()

const unitsList = computed<any[]>(() => {
  if (dbData.value?.units && dbData.value.units.length > 0) {
    return dbData.value.units
  }
  return store.units || []
})

// Search & Filter State
const searchQuery = ref('')
const selectedRarity = ref('All')
const selectedElement = ref('All')
const selectedSeries = ref('all')
const sortBy = ref('name-asc')

const rarityPills = ['All', 'Secret', 'Mythic', 'Legendary', 'Epic', 'Rare']
const elementPills = ['All', 'Luminus', 'Flora', 'Noctis', 'Fire', 'Water', 'Thunder', 'Cosmic']

// Series Options for Dropdown
const availableSeries = computed(() => {
  const sSet = new Set<string>()
  for (const u of unitsList.value) {
    if (u.series) sSet.add(u.series)
  }
  return Array.from(sSet).sort()
})

const seriesOptions = computed(() => {
  const options = [{ label: 'All Series', value: 'all' }]
  for (const s of availableSeries.value) {
    options.push({ label: getSeriesName(s), value: s })
  }
  return options
})

// Sorting Options
const sortOptions = [
  { label: 'Name (A - Z)', value: 'name-asc' },
  { label: 'Name (Z - A)', value: 'name-desc' },
  { label: 'Rarity', value: 'rarity-desc' }
]

// Rarity ranking for sorting
const rarityWeight: Record<string, number> = {
  Secret: 6,
  Mythic: 5,
  Legendary: 4,
  Epic: 3,
  Rare: 2,
  Common: 1
}

// Top Rarity count for summary badge
const topRarityCount = computed(() => {
  return unitsList.value.filter(u => u.rarity === 'Secret' || u.rarity === 'Mythic').length
})

const featuredUnitSlug = computed(() => {
  const first = unitsList.value[0]
  return first ? toUnitSlug(first) : ''
})

// Filtered and Sorted Units List
const filteredUnits = computed(() => {
  let list = [...unitsList.value]

  // 1. Text Search Filter
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim()
    list = list.filter(u => {
      const name = (u.name || '').toLowerCase()
      const dName = (u.displayName || '').toLowerCase()
      const id = (u.id || '').toLowerCase()
      const series = (u.series || '').toLowerCase()
      const fullSeries = getSeriesName(u.series).toLowerCase()
      return name.includes(q) || dName.includes(q) || id.includes(q) || series.includes(q) || fullSeries.includes(q)
    })
  }

  // 2. Rarity Filter
  if (selectedRarity.value !== 'All') {
    list = list.filter(u => (u.rarity || '').toLowerCase() === selectedRarity.value.toLowerCase())
  }

  // 3. Element Filter
  if (selectedElement.value !== 'All') {
    const target = selectedElement.value.toLowerCase()
    list = list.filter(u => {
      const e = (u.element || '').toLowerCase()
      if (target === 'noctis' && (e === 'dark' || e === 'abyss')) return true
      if (target === 'flora' && e === 'nature') return true
      if (target === 'luminus' && e === 'luminous') return true
      return e === target
    })
  }

  // 4. Series Filter
  if (selectedSeries.value !== 'all') {
    list = list.filter(u => u.series === selectedSeries.value)
  }

  // 5. Sorting
  list.sort((a, b) => {
    switch (sortBy.value) {
      case 'name-asc':
        return (a.displayName || a.name || '').localeCompare(b.displayName || b.name || '')
      case 'name-desc':
        return (b.displayName || b.name || '').localeCompare(a.displayName || a.name || '')
      case 'rarity-desc': {
        const rA = rarityWeight[a.rarity] || 0
        const rB = rarityWeight[b.rarity] || 0
        return rB - rA
      }
      default:
        return 0
    }
  })

  return list
})

function resetFilters() {
  searchQuery.value = ''
  selectedRarity.value = 'All'
  selectedElement.value = 'All'
  selectedSeries.value = 'all'
  sortBy.value = 'name-asc'
}

useSeoMeta({
  title: 'Anime Mysterious Wiki - Units Encyclopedia & Calculator',
  description: 'Anime Mysterious comprehensive wiki database: explore all 84+ units, compute combat stats with gears & traits, and optimize builds.',
  ogTitle: 'Anime Mysterious Wiki - Units Encyclopedia & Calculator',
  ogDescription: 'Explore all 84+ units, base & max upgrade stats, and calculate combat builds in Anime Mysterious.',
  ogImage: '/images/og-banner.png',
  ogType: 'website',
  ogSiteName: 'Anime Mysterious',
  twitterCard: 'summary_large_image',
  twitterTitle: 'Anime Mysterious Wiki - Units Encyclopedia & Calculator',
  twitterDescription: 'Explore all 84+ units, base & max upgrade stats, and calculate combat builds in Anime Mysterious.',
  twitterImage: '/images/og-banner.png'
})
</script>
