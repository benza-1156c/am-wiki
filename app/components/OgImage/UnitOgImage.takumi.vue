<template>
  <div class="w-full h-full flex flex-col justify-between p-12 bg-[#090d16] text-white font-['Outfit'] border-4 border-[#1e293b]">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2.5">
        <div v-if="unitSeries" class="px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-neutral-300">
          {{ unitSeries }}
        </div>
        <div v-if="unitElement && unitElement !== 'None'" class="px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-bold text-cyan-300">
          {{ unitElement }}
        </div>
        <div v-if="unitRarity" class="px-3.5 py-1.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-xs font-bold text-rose-300">
          {{ unitRarity }}
        </div>
      </div>
    </div>

    <!-- Main Content: Unit Identity with 3D Portrait & Primary Stats -->
    <div class="flex items-center justify-between my-auto gap-8">
      <!-- Left: Character Portrait + Info -->
      <div class="flex items-center gap-6 flex-1">
        <!-- 3D Character Portrait -->
        <div class="w-36 h-36 rounded-2xl bg-neutral-900 border-2 border-white/15 flex items-center justify-center shrink-0 overflow-hidden shadow-2xl">
          <img
            v-if="unitIcon"
            :src="unitIcon"
            class="w-full h-full object-cover"
            alt="Unit Portrait"
          />
          <div v-else class="text-neutral-500 font-bold text-sm">
            No Image
          </div>
        </div>

        <!-- Unit Meta -->
        <div class="flex flex-col justify-center">
          <div class="flex items-center gap-2 mb-1.5">
            <span class="text-amber-400 font-black text-xl">
              {{ stars }}★
            </span>
            <span class="text-neutral-400 text-sm font-semibold">
              Lv. {{ level }} • Upgrade {{ upgrade }}
            </span>
          </div>

          <h1 class="text-3xl font-black text-white tracking-tight mb-2.5 line-clamp-1">
            {{ unitName }}
          </h1>

          <div class="flex items-center gap-2.5 text-xs text-neutral-300 font-mono">
            <span v-if="traitName && traitName !== 'None'" class="px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-300 font-bold">
              Trait: {{ traitName }}
            </span>
            <span v-if="cost" class="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-neutral-300">
              Cost: ¥{{ cost }}
            </span>
          </div>
        </div>
      </div>

      <!-- Right: Big Combat Metrics Grid -->
      <div class="grid grid-cols-2 gap-3.5 w-96">
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

      <div class="text-neutral-500 font-medium">
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
  unitElement?: string
  unitIcon?: string
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
