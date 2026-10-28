<template>
  <div class="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
    <!-- 1. Navbar Component from app/components/Navbar.vue -->
    <Navbar
      :current-tab="currentTab"
      :compare-count="comparedUnits.length"
      :units-count="units.length"
      :gears-count="gears.length"
      :traits-count="traits.length"
      @change-tab="currentTab = $event"
      @open-import="isImportModalOpen = true"
    />

    <!-- Main Content Area -->
    <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <!-- Loading State -->
      <div v-if="pending" class="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div class="w-12 h-12 rounded-full border-4 border-cyan-500/20 border-t-cyan-400 animate-spin"></div>
        <p class="text-sm font-semibold text-slate-400">Loading Anime Movement Database...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="p-6 rounded-2xl bg-red-950/40 border border-red-500/30 text-center max-w-lg mx-auto">
        <UIcon name="i-lucide-alert-triangle" class="w-10 h-10 text-red-400 mx-auto mb-2" />
        <h3 class="text-base font-bold text-red-300">Failed to load database.json</h3>
        <p class="text-xs text-slate-400 mt-1">{{ error.message }}</p>
        <button
          type="button"
          @click="refresh()"
          class="mt-4 px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl transition-all"
        >
          Retry
        </button>
      </div>

      <!-- Content Views -->
      <div v-else>
        <!-- TAB 1: UNITS (efootbase cards grid & filters) -->
        <div v-show="currentTab === 'units'" class="space-y-6">
          <!-- Hero Banner & Filter Control Center -->
          <div class="bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-slate-950/90 p-5 sm:p-6 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden">
            <div class="absolute -right-20 -top-20 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <!-- Top Row: Search Input & View Toggles -->
            <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <!-- Search Bar with Instant Filter -->
              <div class="relative flex-1">
                <UIcon name="i-lucide-search" class="absolute left-3.5 top-3 text-slate-400 w-4 h-4 pointer-events-none" />
                <input
                  type="text"
                  v-model="searchQuery"
                  placeholder="Search unit by name (e.g. Saber, Gojo), display name, series, or element..."
                  class="w-full bg-slate-950/90 border border-slate-700/80 rounded-2xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors shadow-inner"
                />
                <button
                  v-if="searchQuery"
                  @click="searchQuery = ''"
                  class="absolute right-3.5 top-3 text-xs text-slate-400 hover:text-white"
                >
                  <UIcon name="i-lucide-x" class="w-4 h-4" />
                </button>
              </div>

              <!-- Controls Group: Stats Mode & View Toggle -->
              <div class="flex flex-wrap items-center gap-2.5">
                <!-- Stats Mode: Base (Lvl 0) vs Max (Lvl 5) -->
                <div class="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
                  <button
                    type="button"
                    @click="statsMode = 'max'"
                    class="px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"
                    :class="statsMode === 'max'
                      ? 'bg-gradient-to-r from-cyan-600 to-teal-500 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'"
                  >
                    <UIcon name="i-lucide-flame" class="w-3.5 h-3.5 text-amber-300" />
                    <span>Max Stats (Lv.5)</span>
                  </button>
                  <button
                    type="button"
                    @click="statsMode = 'base'"
                    class="px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"
                    :class="statsMode === 'base'
                      ? 'bg-gradient-to-r from-cyan-600 to-teal-500 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'"
                  >
                    <UIcon name="i-lucide-sprout" class="w-3.5 h-3.5 text-emerald-300" />
                    <span>Base (Lv.0)</span>
                  </button>
                </div>

                <!-- Sort Selector -->
                <div class="flex items-center bg-slate-950 px-2 py-1 rounded-xl border border-slate-800">
                  <span class="text-[11px] font-bold text-slate-400 mr-1.5 flex items-center gap-1">
                    <UIcon name="i-lucide-arrow-up-down" class="w-3 h-3 text-cyan-400" /> Sort:
                  </span>
                  <select
                    v-model="sortBy"
                    class="bg-transparent text-xs font-bold text-cyan-300 focus:outline-none cursor-pointer py-0.5"
                  >
                    <option value="atk-desc">Highest ATK</option>
                    <option value="dps-desc">Highest DPS</option>
                    <option value="spa-asc">Fastest SPA</option>
                    <option value="range-desc">Longest Range</option>
                    <option value="hp-desc">Highest HP</option>
                    <option value="cost-asc">Lowest Cost</option>
                    <option value="name-asc">Name (A-Z)</option>
                  </select>
                </div>

                <!-- Grid vs Table View Mode -->
                <div class="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
                  <button
                    type="button"
                    @click="viewMode = 'grid'"
                    class="px-2.5 py-1.5 rounded-lg text-xs transition-all flex items-center gap-1"
                    :class="viewMode === 'grid' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'"
                    title="Grid Card View"
                  >
                    <UIcon name="i-lucide-layout-grid" class="w-3.5 h-3.5" />
                    <span>Cards</span>
                  </button>
                  <button
                    type="button"
                    @click="viewMode = 'table'"
                    class="px-2.5 py-1.5 rounded-lg text-xs transition-all flex items-center gap-1"
                    :class="viewMode === 'table' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'"
                    title="Dense Table Spreadsheet"
                  >
                    <UIcon name="i-lucide-table" class="w-3.5 h-3.5" />
                    <span>Table</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- Filter Categories Row (efootbase multi-chips) -->
            <div class="mt-4 pt-4 border-t border-slate-800/80 space-y-2.5">
              <!-- Rarities -->
              <div class="flex flex-wrap items-center gap-1.5 text-xs">
                <span class="font-bold text-slate-400 text-[11px] w-14 flex-shrink-0">Rarity:</span>
                <button
                  @click="selectedRarity = 'all'"
                  class="px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all border"
                  :class="selectedRarity === 'all'
                    ? 'bg-slate-200 text-slate-950 border-white font-extrabold shadow-sm'
                    : 'bg-slate-950/80 text-slate-400 hover:text-white border-slate-800'"
                >
                  All
                </button>
                <button
                  v-for="r in availableRarities"
                  :key="r"
                  @click="selectedRarity = r"
                  class="px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all border"
                  :class="selectedRarity === r
                    ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-extrabold shadow-md'
                    : 'bg-slate-950/80 text-slate-400 hover:text-white border-slate-800'"
                >
                  {{ r }}
                </button>
              </div>

              <!-- Series / Origin -->
              <div class="flex flex-wrap items-center gap-1.5 text-xs">
                <span class="font-bold text-slate-400 text-[11px] w-14 flex-shrink-0">Series:</span>
                <button
                  @click="selectedSeries = 'all'"
                  class="px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all border"
                  :class="selectedSeries === 'all'
                    ? 'bg-slate-200 text-slate-950 border-white font-extrabold shadow-sm'
                    : 'bg-slate-950/80 text-slate-400 hover:text-white border-slate-800'"
                >
                  All
                </button>
                <button
                  v-for="s in availableSeries"
                  :key="s"
                  @click="selectedSeries = s"
                  class="px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all border truncate max-w-[150px]"
                  :class="selectedSeries === s
                    ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-extrabold shadow-md'
                    : 'bg-slate-950/80 text-slate-400 hover:text-white border-slate-800'"
                >
                  {{ getSeriesName(s) }}
                </button>
              </div>

              <!-- Elements & Skill Mode -->
              <div class="flex flex-wrap items-center justify-between gap-2 pt-1">
                <div class="flex flex-wrap items-center gap-1.5 text-xs">
                  <span class="font-bold text-slate-400 text-[11px] w-14 flex-shrink-0">Element:</span>
                  <button
                    @click="selectedElement = 'all'"
                    class="px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all border"
                    :class="selectedElement === 'all'
                      ? 'bg-slate-200 text-slate-950 border-white font-extrabold shadow-sm'
                      : 'bg-slate-950/80 text-slate-400 hover:text-white border-slate-800'"
                  >
                    All
                  </button>
                  <button
                    v-for="elm in availableElements"
                    :key="elm"
                    @click="selectedElement = elm"
                    class="px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all border flex items-center gap-1"
                    :class="selectedElement === elm
                      ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-extrabold shadow-md'
                      : 'bg-slate-950/80 text-slate-400 hover:text-white border-slate-800'"
                  >
                    <UIcon :name="getElementConfig(elm).uiIcon" class="w-3.5 h-3.5" />
                    <span>{{ elm }}</span>
                  </button>
                </div>

                <!-- Reset button & Count -->
                <div class="flex items-center gap-3">
                  <span class="text-xs text-slate-400">
                    Showing <strong class="text-cyan-400">{{ filteredUnits.length }}</strong> of {{ units.length }} units
                  </span>
                  <button
                    v-if="hasActiveFilters"
                    type="button"
                    @click="resetFilters"
                    class="px-2.5 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[11px] font-bold border border-red-500/30 transition-all"
                  >
                    Reset Filters
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Unit Cards Grid View using app/components/UnitCard.vue -->
          <div
            v-if="viewMode === 'grid'"
            class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
          >
            <UnitCard
              v-for="unit in filteredUnits"
              :key="unit.id"
              :unit="unit"
              :stats-mode="statsMode"
              :is-compared="comparedUnits.includes(unit.id)"
              @select-unit="selectedUnit = $event"
              @toggle-compare="toggleCompare($event)"
            />
          </div>

          <!-- Dense Table View -->
          <div v-else class="bg-slate-900/80 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs">
                <thead class="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                  <tr>
                    <th class="py-3 px-3">Unit</th>
                    <th class="py-3 px-3">Series</th>
                    <th class="py-3 px-3">Rarity</th>
                    <th class="py-3 px-3">Element</th>
                    <th class="py-3 px-3 text-right">ATK</th>
                    <th class="py-3 px-3 text-right">DPS</th>
                    <th class="py-3 px-3 text-right">SPA</th>
                    <th class="py-3 px-3 text-right">Range</th>
                    <th class="py-3 px-3 text-right">HP</th>
                    <th class="py-3 px-3 text-right">Skill DMG</th>
                    <th class="py-3 px-3 text-right">Cost</th>
                    <th class="py-3 px-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-800/60 bg-slate-950/40">
                  <tr
                    v-for="unit in filteredUnits"
                    :key="unit.id"
                    @click="selectedUnit = unit"
                    class="hover:bg-slate-800/40 transition-colors cursor-pointer"
                  >
                    <td class="py-2.5 px-3">
                      <div class="flex items-center gap-2">
                        <span class="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-white">
                          {{ unit.name.slice(0, 2).toUpperCase() }}
                        </span>
                        <div>
                          <span class="font-bold text-white hover:text-cyan-300 font-['Outfit'] block">{{ unit.name }}</span>
                          <span v-if="unit.displayName && unit.displayName !== unit.name" class="text-[10px] text-slate-400">"{{ unit.displayName }}"</span>
                        </div>
                      </div>
                    </td>
                    <td class="py-2.5 px-3 text-slate-300">{{ getSeriesName(unit.series) }}</td>
                    <td class="py-2.5 px-3">
                      <span class="text-[10px] font-bold px-2 py-0.5 rounded-full border" :class="getRarityConfig(unit.rarity).badge">
                        {{ unit.rarity }}
                      </span>
                    </td>
                    <td class="py-2.5 px-3">
                      <span class="text-xs font-semibold flex items-center gap-1" :class="getElementConfig(unit.element).color">
                        <UIcon :name="getElementConfig(unit.element).uiIcon" class="w-3.5 h-3.5" />
                        <span>{{ unit.element }}</span>
                      </span>
                    </td>
                    <td class="py-2.5 px-3 text-right font-bold text-amber-300">{{ formatNumber(getUnitDisplayStats(unit).attack) }}</td>
                    <td class="py-2.5 px-3 text-right font-bold text-red-400">{{ formatNumber(getUnitDisplayStats(unit).dps) }}</td>
                    <td class="py-2.5 px-3 text-right font-bold text-cyan-300">{{ getUnitDisplayStats(unit).attackSpeed }}s</td>
                    <td class="py-2.5 px-3 text-right font-bold text-emerald-300">{{ getUnitDisplayStats(unit).range }}</td>
                    <td class="py-2.5 px-3 text-right font-bold text-rose-300">{{ formatNumber(getUnitDisplayStats(unit).health) }}</td>
                    <td class="py-2.5 px-3 text-right font-bold text-purple-300">{{ formatNumber(getUnitDisplayStats(unit).skillDamage) }}</td>
                    <td class="py-2.5 px-3 text-right font-bold text-yellow-300">{{ getUnitDisplayStats(unit).cost }}</td>
                    <td class="py-2.5 px-3 text-center">
                      <button
                        type="button"
                        @click.stop="toggleCompare(unit)"
                        class="px-2 py-1 rounded text-[10px] font-bold border transition-all flex items-center gap-1 mx-auto"
                        :class="comparedUnits.includes(unit.id)
                          ? 'bg-amber-500 text-slate-950 border-amber-400'
                          : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'"
                      >
                        <UIcon :name="comparedUnits.includes(unit.id) ? 'i-lucide-check' : 'i-lucide-scale'" class="w-3 h-3" />
                        <span>{{ comparedUnits.includes(unit.id) ? 'In Compare' : 'Compare' }}</span>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Empty Search State -->
          <div v-if="filteredUnits.length === 0" class="p-12 text-center bg-slate-900/40 rounded-2xl border border-slate-800">
            <UIcon name="i-lucide-search-x" class="w-10 h-10 text-slate-500 mx-auto mb-2" />
            <h3 class="text-base font-bold text-white">No units found</h3>
            <p class="text-xs text-slate-400 mt-1">Try adjusting your search query or clear active filters.</p>
            <button
              type="button"
              @click="resetFilters"
              class="mt-3 px-4 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all"
            >
              Reset All Filters
            </button>
          </div>
        </div>

        <!-- TAB 2: COMPARE using app/components/UnitCompare.vue -->
        <div v-show="currentTab === 'compare'">
          <UnitCompare
            :all-units="units"
            :compared-unit-ids="comparedUnits"
            @select-unit="selectedUnit = $event"
            @clear-compare="comparedUnits = []"
          />
        </div>

        <!-- TAB 3: GEARS using app/components/GearsTab.vue -->
        <div v-show="currentTab === 'gears'">
          <GearsTab :gears="gears" />
        </div>

        <!-- TAB 4: TRAITS using app/components/TraitsTab.vue -->
        <div v-show="currentTab === 'traits'">
          <TraitsTab :traits="traits" />
        </div>

        <!-- TAB 5: RANKINGS using app/components/RankingsTab.vue -->
        <div v-show="currentTab === 'rankings'">
          <RankingsTab :units="units" @select-unit="selectedUnit = $event" />
        </div>
      </div>
    </main>

    <!-- Floating Compare Tray / Dock -->
    <div
      v-if="comparedUnits.length > 0 && currentTab !== 'compare'"
      class="fixed bottom-4 right-4 z-40 bg-slate-900/95 border border-amber-500/40 shadow-2xl p-3 rounded-2xl backdrop-blur-md flex items-center gap-3 animate-fade-in"
    >
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-scale" class="w-5 h-5 text-amber-400" />
        <div>
          <span class="text-xs font-bold text-white block">
            Comparing ({{ comparedUnits.length }}/2)
          </span>
          <span class="text-[10px] text-slate-400">
            {{ getComparedNames }}
          </span>
        </div>
      </div>

      <div class="flex items-center gap-1.5">
        <button
          type="button"
          @click="currentTab = 'compare'"
          class="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs shadow-md transition-transform hover:scale-102 flex items-center gap-1"
        >
          <UIcon name="i-lucide-arrow-right" class="w-3.5 h-3.5" />
          <span>Open Compare</span>
        </button>
        <button
          type="button"
          @click="comparedUnits = []"
          class="w-7 h-7 rounded-xl bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center text-xs"
        >
          <UIcon name="i-lucide-x" class="w-3.5 h-3.5" />
        </button>
      </div>
    </div>

    <!-- Unit Detail Modal using app/components/UnitDetailModal.vue -->
    <UnitDetailModal
      v-if="selectedUnit"
      :unit="selectedUnit"
      :is-compared="comparedUnits.includes(selectedUnit.id)"
      @close="selectedUnit = null"
      @toggle-compare="toggleCompare($event)"
    />

    <!-- Database Import & Calculation Modal -->
    <DatabaseImportModal
      v-if="isImportModalOpen"
      :current-units="units"
      :skills-data="dbData?.skills || {}"
      @units-updated="handleUnitsUpdated"
      @close="isImportModalOpen = false"
    />

    <!-- Footer -->
    <footer class="mt-auto border-t border-slate-800/80 bg-slate-950/80 py-6 text-center text-xs text-slate-500">
      <div class="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div class="flex items-center gap-2">
          <span class="font-bold text-slate-400">AM WIKI & DATABASE</span>
          <span>•</span>
          <span>eFootbase Football Database Style</span>
        </div>
        <div class="flex items-center gap-4 text-[11px]">
          <span>Powered by Nuxt 4 & Nuxt UI</span>
          <span>•</span>
          <span>Database: <code class="text-cyan-400">public/database.json</code></span>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
// Explicit Component Imports from app/components/
import Navbar from '~/components/Navbar.vue'
import UnitCard from '~/components/UnitCard.vue'
import UnitDetailModal from '~/components/UnitDetailModal.vue'
import UnitCompare from '~/components/UnitCompare.vue'
import GearsTab from '~/components/GearsTab.vue'
import TraitsTab from '~/components/TraitsTab.vue'
import RankingsTab from '~/components/RankingsTab.vue'
import DatabaseImportModal from '~/components/DatabaseImportModal.vue'

import { getRarityConfig, getElementConfig, getSeriesName, formatNumber } from '~/utils/formatters'

interface DatabaseSchema {
  meta: any
  units: any[]
  gears: any[]
  traits: any[]
  skills?: Record<string, any>
}

// Fetch database via server API (fast in-memory SSR resolution)
const { data: dbData, pending, error, refresh } = await useFetch<DatabaseSchema>('/api/database')

const units = computed(() => dbData.value?.units || [])
const gears = computed(() => dbData.value?.gears || [])
const traits = computed(() => dbData.value?.traits || [])

// UI state
const currentTab = ref('units')
const selectedUnit = ref<any>(null)
const comparedUnits = ref<string[]>([])
const isImportModalOpen = ref(false)
const statsMode = ref<'max' | 'base'>('max')
const viewMode = ref<'grid' | 'table'>('grid')
const sortBy = ref('atk-desc')

function handleUnitsUpdated(newUnits: any[]) {
  if (dbData.value) {
    dbData.value.units = newUnits
    if (dbData.value.meta) {
      dbData.value.meta.totalUnits = newUnits.length
    }
  }
}

// Filter state
const searchQuery = ref('')
const selectedRarity = ref('all')
const selectedSeries = ref('all')
const selectedElement = ref('all')

// Extract distinct available options
const availableRarities = computed(() => {
  const set = new Set<string>()
  for (const u of units.value) {
    if (u.rarity) set.add(u.rarity)
  }
  return Array.from(set).sort()
})

const availableSeries = computed(() => {
  const set = new Set<string>()
  for (const u of units.value) {
    if (u.series) set.add(u.series)
  }
  return Array.from(set).sort()
})

const availableElements = computed(() => {
  const set = new Set<string>()
  for (const u of units.value) {
    if (u.element && u.element !== 'None') set.add(u.element)
  }
  return Array.from(set).sort()
})

const hasActiveFilters = computed(() => {
  return searchQuery.value !== '' ||
    selectedRarity.value !== 'all' ||
    selectedSeries.value !== 'all' ||
    selectedElement.value !== 'all'
})

function resetFilters() {
  searchQuery.value = ''
  selectedRarity.value = 'all'
  selectedSeries.value = 'all'
  selectedElement.value = 'all'
  sortBy.value = 'atk-desc'
}

function getUnitDisplayStats(unit: any) {
  return statsMode.value === 'max' ? unit.statsAtMax : unit.statsAtBase
}

// Filtered and sorted units
const filteredUnits = computed(() => {
  let list = units.value.filter(u => {
    // Search query match
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase().trim()
      const matchName = u.name?.toLowerCase().includes(q)
      const matchDisplay = u.displayName?.toLowerCase().includes(q)
      const matchSeries = u.series?.toLowerCase().includes(q) || getSeriesName(u.series).toLowerCase().includes(q)
      const matchElement = u.element?.toLowerCase().includes(q)
      const matchSkill = u.skill?.PassiveHeader?.toLowerCase().includes(q)
      if (!matchName && !matchDisplay && !matchSeries && !matchElement && !matchSkill) {
        return false
      }
    }

    // Rarity filter
    if (selectedRarity.value !== 'all' && u.rarity !== selectedRarity.value) {
      return false
    }

    // Series filter
    if (selectedSeries.value !== 'all' && u.series !== selectedSeries.value) {
      return false
    }

    // Element filter
    if (selectedElement.value !== 'all' && u.element !== selectedElement.value) {
      return false
    }

    return true
  })

  // Sorting
  const isMax = statsMode.value === 'max'
  list = [...list].sort((a, b) => {
    const sA = isMax ? a.statsAtMax : a.statsAtBase
    const sB = isMax ? b.statsAtMax : b.statsAtBase

    switch (sortBy.value) {
      case 'atk-desc':
        return (sB.attack || 0) - (sA.attack || 0)
      case 'dps-desc':
        return (sB.dps || 0) - (sA.dps || 0)
      case 'spa-asc':
        return (sA.attackSpeed || 99) - (sB.attackSpeed || 99)
      case 'range-desc':
        return (sB.range || 0) - (sA.range || 0)
      case 'hp-desc':
        return (sB.health || 0) - (sA.health || 0)
      case 'cost-asc':
        return (sA.cost || 0) - (sB.cost || 0)
      case 'name-asc':
        return (a.name || '').localeCompare(b.name || '')
      default:
        return 0
    }
  })

  return list
})

function toggleCompare(unit: any) {
  const idx = comparedUnits.value.indexOf(unit.id)
  if (idx > -1) {
    comparedUnits.value.splice(idx, 1)
  } else {
    if (comparedUnits.value.length >= 2) {
      comparedUnits.value = [comparedUnits.value[1], unit.id]
    } else {
      comparedUnits.value.push(unit.id)
    }
  }
}

const getComparedNames = computed(() => {
  return comparedUnits.value
    .map(id => units.value.find(u => u.id === id)?.name || id)
    .join(' vs ')
})
</script>