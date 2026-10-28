<template>
  <div class="space-y-6">
    <!-- Header & Filter Bar -->
    <div class="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 shadow-xl">
      <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h2 class="text-xl font-black text-white font-['Outfit'] flex items-center gap-2">
            <UIcon name="i-lucide-swords" class="w-5 h-5 text-cyan-400" />
            <span>Gears & Equipment Database</span>
          </h2>
          <p class="text-xs text-slate-400">Browse {{ gears.length }} items across Arm, Head, Body, and Legs slots.</p>
        </div>

        <div class="relative w-full sm:w-64">
          <UIcon name="i-lucide-search" class="w-4 h-4 text-slate-500 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Search gear name or stats..."
            class="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
          <button v-if="searchQuery" @click="searchQuery = ''" class="absolute right-2.5 top-2 text-slate-400 hover:text-white text-xs">
            <UIcon name="i-lucide-x" class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <!-- Slot Filter Pills -->
      <div class="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-800/80">
        <span class="text-xs font-bold text-slate-400 mr-2 flex items-center gap-1">
          <UIcon name="i-lucide-filter" class="w-3.5 h-3.5 text-cyan-400" /> Slot:
        </span>
        <button
          v-for="slot in ['All', 'Arm', 'Head', 'Body', 'Legs']"
          :key="slot"
          @click="selectedSlot = slot"
          class="px-3 py-1 rounded-lg text-xs font-semibold transition-all border flex items-center gap-1.5"
          :class="selectedSlot === slot
            ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold shadow-md'
            : 'bg-slate-950 text-slate-400 hover:text-white border-slate-800'"
        >
          <UIcon :name="getSlotUiIcon(slot)" class="w-3.5 h-3.5" />
          <span>{{ slot === 'All' ? 'All Slots' : slot }}</span>
        </button>
      </div>
    </div>

    <!-- Gears Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <div
        v-for="gear in filteredGears"
        :key="gear.id"
        class="bg-slate-900/70 p-4 rounded-2xl border border-slate-800 hover:border-cyan-500/40 hover:-translate-y-0.5 transition-all duration-300 shadow-md flex flex-col justify-between"
      >
        <div>
          <!-- Card Header -->
          <div class="flex items-center justify-between gap-2 mb-2.5">
            <span
              class="text-[10px] font-black uppercase px-2 py-0.5 rounded-full border"
              :class="gear.rarity?.toLowerCase() === 'mythic' ? 'bg-red-500/20 text-red-300 border-red-500/40' : 'bg-amber-500/20 text-amber-300 border-amber-500/40'"
            >
              {{ gear.rarity || 'GEAR' }}
            </span>
            <span class="text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700 flex items-center gap-1">
              <UIcon :name="getSlotUiIcon(gear.slot)" class="w-3.5 h-3.5" />
              <span>{{ gear.slot }}</span>
            </span>
          </div>

          <!-- Title and Gear Icon -->
          <div class="flex items-center gap-3 mt-1 mb-2">
            <div class="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center p-1 relative overflow-hidden flex-shrink-0 shadow-inner">
              <UIcon :name="getSlotUiIcon(gear.slot)" class="w-6 h-6 text-cyan-400" />
            </div>
            <div class="min-w-0">
              <h3 class="text-sm font-black text-white font-['Outfit'] tracking-tight truncate">{{ gear.name }}</h3>
              <span class="text-[11px] text-slate-400 flex items-center gap-1">
                <UIcon :name="getSlotUiIcon(gear.slot)" class="w-3 h-3 text-cyan-400" />
                <span>{{ gear.slot }} Slot</span>
              </span>
            </div>
          </div>

          <!-- Formatted Description -->
          <div class="mt-2 text-xs text-slate-300 space-y-1 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/60 font-mono">
            <div v-for="(line, idx) in formatDesc(gear.description)" :key="idx" class="flex items-center gap-1.5">
              <UIcon name="i-lucide-check" class="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span>{{ line }}</span>
            </div>
            <div v-if="!gear.description || gear.description === ' -- '" class="text-slate-500 italic">
              No extra description recorded
            </div>
          </div>
        </div>

        <!-- Stats Raw Badges -->
        <div class="mt-3 pt-2.5 border-t border-slate-800/80 flex flex-wrap gap-1">
          <span
            v-for="(val, statKey) in gear.stats"
            :key="statKey"
            class="px-2 py-0.5 rounded-md bg-slate-800/80 text-[11px] font-semibold text-slate-300 border border-slate-700/60"
          >
            <span class="text-slate-400">{{ statKey }}:</span>
            <span class="text-amber-300 font-bold ml-1">{{ formatStatValue(val) }}</span>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface GearItem {
  id: string
  name: string
  type: string
  slot: string
  description: string
  stats: Record<string, number>
  rarity: string
  icon: string
}

const props = defineProps<{
  gears: GearItem[]
}>()

const searchQuery = ref('')
const selectedSlot = ref('All')

const filteredGears = computed(() => {
  return props.gears.filter(g => {
    if (selectedSlot.value !== 'All' && g.slot !== selectedSlot.value) return false
    if (!searchQuery.value) return true
    const q = searchQuery.value.toLowerCase()
    const matchName = g.name.toLowerCase().includes(q)
    const matchDesc = g.description.toLowerCase().includes(q)
    const matchStat = Object.keys(g.stats || {}).some(k => k.toLowerCase().includes(q))
    return matchName || matchDesc || matchStat
  })
})

function getSlotUiIcon(slot: string): string {
  switch (slot?.toLowerCase()) {
    case 'arm': return 'i-lucide-shield'
    case 'head': return 'i-lucide-crown'
    case 'body': return 'i-lucide-shirt'
    case 'legs': return 'i-lucide-footprints'
    default: return 'i-lucide-swords'
  }
}

function formatDesc(desc: string | undefined): string[] {
  if (!desc) return []
  return desc.split('\n').map(s => s.trim()).filter(s => s && s !== '--')
}

function formatStatValue(val: number): string {
  if (Math.abs(val) < 1 && val !== 0) {
    return `${(val * 100).toFixed(1)}%`
  }
  return val.toString()
}
</script>
