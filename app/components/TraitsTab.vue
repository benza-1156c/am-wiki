<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 shadow-xl">
      <div class="flex flex-wrap items-center justify-between gap-3 mb-2">
        <div>
          <h2 class="text-xl font-black text-white font-['Outfit'] flex items-center gap-2">
            <UIcon name="i-lucide-sparkles" class="w-5 h-5 text-amber-400" /> Traits & Passive Buffs Database
          </h2>
          <p class="text-xs text-slate-400">Rollable traits with probability weights and combat stat enhancements.</p>
        </div>

        <div class="relative w-full sm:w-64">
          <UIcon name="i-lucide-search" class="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Search trait or buff..."
            class="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
        </div>
      </div>
    </div>

    <!-- Traits Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="trait in filteredTraits"
        :key="trait.id"
        class="bg-slate-900/70 p-4 rounded-2xl border border-slate-800 hover:border-amber-500/40 hover:-translate-y-0.5 transition-all duration-300 shadow-md flex flex-col justify-between"
      >
        <div>
          <div class="flex items-center justify-between gap-2 mb-2.5">
            <span
              class="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border shadow-sm"
              :class="trait.rarity?.toLowerCase() === 'legendary'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-purple-500/20 text-purple-300 border-purple-500/40'"
            >
              {{ trait.rarity }}
            </span>
            <span class="text-xs text-slate-400 font-mono">Weight: {{ trait.weight }}</span>
          </div>

          <!-- Trait Icon & Name -->
          <div class="flex items-center gap-3 mb-2.5">
            <div class="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center p-1 relative overflow-hidden flex-shrink-0 shadow-inner">
              <UIcon name="i-lucide-sparkles" class="w-6 h-6 text-amber-400" />
            </div>
            <div class="min-w-0">
              <h3 class="text-base font-black text-white font-['Outfit'] tracking-tight truncate">{{ trait.name }}</h3>
              <span class="text-[11px] text-amber-400/90 font-medium flex items-center gap-1">
                <UIcon name="i-lucide-dice-5" class="w-3 h-3 text-amber-400" />
                <span>Roll Weight: {{ trait.weight }}</span>
              </span>
            </div>
          </div>

          <!-- Status / Buff Description -->
          <div class="mt-2.5 p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs font-semibold text-emerald-300">
            {{ trait.status || 'No status effect recorded' }}
          </div>
        </div>

        <!-- Raw Stats list -->
        <div class="mt-3 pt-2.5 border-t border-slate-800 flex flex-wrap gap-1.5">
          <span
            v-for="(val, key) in trait.stats"
            :key="key"
            class="px-2 py-0.5 rounded-md bg-slate-800 text-[11px] font-semibold text-slate-300 border border-slate-700"
          >
            <span class="text-slate-400">{{ key }}:</span>
            <span class="text-cyan-300 font-bold ml-1">+{{ (val * 100).toFixed(0) }}%</span>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface TraitItem {
  id: string
  name: string
  rarity: string
  status: string
  weight: number
  stats: Record<string, number>
  icon: string
}

const props = defineProps<{
  traits: TraitItem[]
}>()

const searchQuery = ref('')

const filteredTraits = computed(() => {
  if (!searchQuery.value) return props.traits
  const q = searchQuery.value.toLowerCase()
  return props.traits.filter(t => {
    return t.name.toLowerCase().includes(q) ||
      t.status.toLowerCase().includes(q) ||
      t.rarity.toLowerCase().includes(q)
  })
})
</script>
