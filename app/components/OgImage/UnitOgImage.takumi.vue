<template>
  <div class="w-full h-full flex items-center justify-center p-8 bg-[#060810] text-white font-['Outfit']">
    <!-- Main Card Container -->
    <div class="w-full h-full rounded-[28px] bg-gradient-to-br from-[#0d1322] via-[#090d16] to-[#070913] border border-white/10 p-10 flex items-center justify-between gap-12 relative overflow-hidden">
      <!-- Left Column: Character 3D Portrait Frame -->
      <div class="w-[440px] h-[440px] rounded-2xl bg-[#111726] border border-white/15 overflow-hidden relative flex items-center justify-center shrink-0 shadow-2xl">
        <img
          v-if="unitIcon"
          :src="unitIcon"
          class="w-full h-full object-cover"
          alt="Unit Portrait"
        />
        <!-- Floating Glass Badges on Portrait -->
        <div class="absolute top-4 left-4 px-3.5 py-1.5 rounded-full bg-black/70 border border-white/15 flex items-center">
          <span class="text-amber-400 font-black text-sm">{{ stars }}★</span>
        </div>

        <div v-if="unitRarity" class="absolute top-4 right-4 px-4 py-1.5 rounded-full bg-rose-500/25 border border-rose-500/40 text-rose-300 font-extrabold text-xs tracking-wider uppercase">
          {{ unitRarity }}
        </div>

        <div v-if="unitElement && unitElement !== 'None'" class="absolute bottom-4 left-4 px-3.5 py-1.5 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-bold text-xs tracking-wide">
          {{ unitElement }}
        </div>
      </div>

      <!-- Right Column: Clean Character Identity & Community Branding -->
      <div class="flex-1 h-[440px] flex flex-col justify-between py-4">
        <!-- Top: Branding & Title -->
        <div class="flex flex-col">
          <!-- Discreet Brand Line -->
          <div class="flex items-center gap-2 mb-4">
            <span class="text-xs font-mono font-bold tracking-[0.25em] text-cyan-400 uppercase">
              Anime Mysterious
            </span>
            <span class="text-xs text-neutral-500">•</span>
            <span class="text-xs font-mono text-neutral-400 uppercase tracking-widest">
              Wiki & Calculator
            </span>
          </div>

          <!-- Unit Name: Hero Title + Subtitle -->
          <h1 class="text-6xl font-black text-white tracking-tight leading-none mb-2">
            {{ parsedTitle.main }}
          </h1>

          <div v-if="parsedTitle.sub" class="text-3xl font-bold text-cyan-400 tracking-tight mb-6">
            {{ parsedTitle.sub }}
          </div>
        </div>

        <div class="flex items-center justify-between text-xs text-neutral-500 font-mono pt-4 border-t border-white/5">
          <span>Community Wiki</span>
          <span class="text-neutral-400 font-medium">am-wiki.vercel.app</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
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

const parsedTitle = computed(() => {
  const full = props.unitName || 'Unit'
  if (full.includes('(') && full.includes(')')) {
    const parts = full.split('(')
    return {
      main: (parts[0] || '').trim(),
      sub: (parts[1] || '').replace(')', '').trim()
    }
  }
  return {
    main: full,
    sub: ''
  }
})
</script>
