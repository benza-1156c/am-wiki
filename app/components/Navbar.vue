<template>
  <header class="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/85 backdrop-blur-md">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <!-- Brand Logo & Title -->
        <div class="flex items-center gap-3 cursor-pointer" @click="$emit('change-tab', 'units')">
          <div class="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-teal-500 to-emerald-400 p-0.5 shadow-lg shadow-cyan-500/20">
            <div class="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <span class="text-xl font-black bg-gradient-to-r from-cyan-400 to-emerald-300 bg-clip-text text-transparent">AM</span>
            </div>
            <span class="absolute -bottom-1 -right-1 flex h-3 w-3">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
            </span>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="text-lg font-black tracking-tight text-white font-['Outfit']">AM-WIKI</span>
              <span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">eFOOTBASE STYLE</span>
            </div>
            <p class="text-xs text-slate-400 hidden sm:block">Anime Movement Unit & Gear Database</p>
          </div>
        </div>

        <!-- Navigation Tabs -->
        <nav class="hidden md:flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="$emit('change-tab', tab.id)"
            class="px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-2"
            :class="currentTab === tab.id
              ? 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-md shadow-cyan-900/30 font-bold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'"
          >
            <UIcon :name="tab.icon" class="w-4 h-4" />
            <span>{{ tab.label }}</span>
            <span
              v-if="tab.badge"
              class="px-1.5 py-0.2 rounded-full text-[10px]"
              :class="currentTab === tab.id ? 'bg-black/30 text-white' : 'bg-slate-800 text-slate-300'"
            >
              {{ tab.badge }}
            </span>
          </button>
        </nav>

        <!-- Right Side: Compare Status & DB Pill -->
        <div class="flex items-center gap-2">
          <button
            @click="$emit('change-tab', 'compare')"
            class="relative px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all"
            :class="compareCount > 0
              ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 hover:bg-amber-500/25'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'"
          >
            <UIcon name="i-lucide-scale" class="w-4 h-4" />
            <span class="hidden sm:inline">Compare</span>
            <span
              v-if="compareCount > 0"
              class="w-4 h-4 rounded-full bg-amber-500 text-slate-950 font-bold text-[10px] flex items-center justify-center ml-0.5"
            >
              {{ compareCount }}
            </span>
          </button>

          <button
            type="button"
            @click="$emit('open-import')"
            class="flex items-center text-xs font-semibold text-cyan-300 bg-cyan-950/40 hover:bg-cyan-900/50 px-2.5 py-1.5 rounded-lg border border-cyan-500/40 gap-1.5 transition-all shadow-sm"
            title="Import JSON or Manage Database"
          >
            <UIcon name="i-lucide-database" class="w-4 h-4 text-cyan-400" />
            <span class="hidden sm:inline">Import / DB</span>
          </button>
        </div>
      </div>

      <!-- Mobile Nav Row -->
      <div class="flex md:hidden overflow-x-auto py-2 gap-1 scrollbar-none border-t border-slate-800/60">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="$emit('change-tab', tab.id)"
          class="flex-shrink-0 px-3 py-1 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5"
          :class="currentTab === tab.id
            ? 'bg-cyan-600 text-white font-bold'
            : 'text-slate-400 bg-slate-900/60'"
        >
          <UIcon :name="tab.icon" class="w-3.5 h-3.5" />
          <span>{{ tab.label }}</span>
          <span v-if="tab.badge" class="text-[10px] opacity-80">({{ tab.badge }})</span>
        </button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
interface TabItem {
  id: string
  label: string
  icon: string
  badge?: number | string
}

defineProps<{
  currentTab: string
  compareCount: number
  unitsCount: number
  gearsCount: number
  traitsCount: number
}>()

defineEmits<{
  (e: 'change-tab', tab: string): void
  (e: 'open-import'): void
}>()

const tabs = computed<TabItem[]>(() => [
  { id: 'units', label: 'Units', icon: 'i-lucide-users' },
  { id: 'compare', label: 'Compare', icon: 'i-lucide-scale' },
  { id: 'gears', label: 'Gears', icon: 'i-lucide-swords' },
  { id: 'traits', label: 'Traits', icon: 'i-lucide-sparkles' },
  { id: 'rankings', label: 'Rankings', icon: 'i-lucide-trophy' }
])
</script>
