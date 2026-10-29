<template>
  <div class="w-full h-full flex flex-col justify-between p-12 bg-[#090d16] text-white font-['Outfit'] border-4 border-[#1e293b]">
    <!-- Top Bar: Branding & Series -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-bold text-lg">
          AM
        </div>
        <div>
          <div class="text-xl font-black tracking-tight text-white flex items-center gap-2">
            <span>Anime</span>
            <span class="text-cyan-400">Mysterious</span>
          </div>
          <div class="text-xs text-neutral-400 uppercase tracking-widest font-semibold">Combat Calculator</div>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <div v-if="unitSeries" class="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-neutral-300">
          {{ unitSeries }}
        </div>
        <div v-if="unitRarity" class="px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-xs font-bold text-rose-300">
          {{ unitRarity }}
        </div>
      </div>
    </div>

    <!-- Main Content: Unit Identity & Primary Stats -->
    <div class="flex items-center justify-between my-auto gap-8">
      <!-- Left: Unit Info -->
      <div class="flex-1">
        <div class="flex items-center gap-2 mb-2">
          <span class="text-amber-400 font-bold text-lg">
            {{ stars }}★
          </span>
          <span class="text-neutral-400 text-sm font-semibold">
            Lv. {{ level }} • Upgrade {{ upgrade }}
          </span>
        </div>

        <h1 class="text-4xl font-extrabold text-white tracking-tight mb-3">
          {{ unitName }}
        </h1>

        <div class="flex items-center gap-3 text-sm text-neutral-300 font-mono">
          <span v-if="traitName" class="px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-300 font-bold">
            Trait: {{ traitName }}
          </span>
          <span v-if="cost" class="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-neutral-300">
            Cost: ¥{{ cost }}
          </span>
        </div>
      </div>

      <!-- Right: Big Combat Metrics Grid -->
      <div class="grid grid-cols-2 gap-3 w-96">
        <div class="p-3.5 rounded-xl bg-white/5 border border-rose-500/30 flex flex-col">
          <span class="text-xs font-bold text-rose-400 uppercase tracking-wider mb-1">Damage</span>
          <span class="text-2xl font-black font-mono text-white">{{ damage }}</span>
        </div>

        <div class="p-3.5 rounded-xl bg-white/5 border border-emerald-500/30 flex flex-col">
          <span class="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">Health</span>
          <span class="text-2xl font-black font-mono text-white">{{ health }}</span>
        </div>

        <div class="p-3.5 rounded-xl bg-white/5 border border-amber-500/30 flex flex-col">
          <span class="text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">DPS</span>
          <span class="text-2xl font-black font-mono text-amber-300">{{ dps }}</span>
        </div>

        <div class="p-3.5 rounded-xl bg-white/5 border border-cyan-500/30 flex flex-col">
          <span class="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-1">Range / SPA</span>
          <span class="text-2xl font-black font-mono text-cyan-300">{{ range }} / {{ spa }}s</span>
        </div>
      </div>
    </div>

    <!-- Bottom Bar: Equipped Gears Summary & Link -->
    <div class="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-neutral-400 font-mono">
      <div class="flex items-center gap-2">
        <span class="font-bold text-neutral-300">Gears:</span>
        <span>{{ gearsSummary || 'None equipped' }}</span>
      </div>

      <div class="text-neutral-500">
        am-wiki.vercel.app
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  unitName?: string
  unitSeries?: string
  unitRarity?: string
  stars?: number | string
  level?: number | string
  upgrade?: number | string
  traitName?: string
  cost?: number | string
  damage?: string
  health?: string
  dps?: string
  range?: string
  spa?: string
  gearsSummary?: string
}>()
</script>
