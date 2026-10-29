<template>
  <div class="p-3.5 sm:p-4 rounded-xl border border-white/5 bg-[#0f172a]/50 hover:bg-[#0f172a]/80 transition-colors flex flex-col gap-2.5">
    <!-- Row Header: Metric Label & Delta Tag -->
    <div class="flex items-center justify-between text-xs">
      <div class="flex items-center gap-2 font-medium text-slate-300">
        <UIcon :name="icon" class="w-4 h-4 text-primary" />
        <span>{{ label }}</span>
      </div>

      <!-- Delta / Winner Badge -->
      <div
        v-if="diff !== 0"
        class="px-2 py-0.5 rounded-full text-[11px] font-bold font-mono border flex items-center gap-1"
        :class="winner === 'left' ? 'bg-cyan-500/15 border-cyan-500/30 text-cyan-300' : 'bg-purple-500/15 border-purple-500/30 text-purple-300'"
      >
        <span>{{ winner === 'left' ? '← Left' : 'Right →' }}</span>
        <span>+{{ formatDelta(diff) }}</span>
        <span v-if="percent !== undefined" class="text-[10px] opacity-80">({{ percent }}%)</span>
      </div>
      <div v-else class="text-[11px] text-neutral-500 font-mono">
        Equal (Tied)
      </div>
    </div>

    <!-- Comparative Numbers & Progress Bar -->
    <div class="grid grid-cols-12 items-center gap-3">
      <!-- Left Value -->
      <div class="col-span-3 sm:col-span-2 text-left">
        <div
          class="text-sm sm:text-base font-extrabold font-mono transition-colors"
          :class="winner === 'left' ? 'text-emerald-400 font-black' : 'text-slate-300'"
        >
          {{ formattedVal1 }}
        </div>
      </div>

      <!-- Comparison Progress Bars (Dual Bar meeting in center or opposing) -->
      <div class="col-span-6 sm:col-span-8 flex items-center gap-1.5 h-2.5 bg-neutral-900/80 rounded-full p-0.5 border border-white/5 overflow-hidden">
        <!-- Left Bar -->
        <div class="flex-1 flex justify-end">
          <div
            class="h-full rounded-full transition-all duration-300"
            :class="winner === 'left' ? 'bg-gradient-to-l from-cyan-400 to-blue-500 shadow-sm shadow-cyan-500/50' : 'bg-neutral-600/70'"
            :style="{ width: `${leftPercent}%` }"
          ></div>
        </div>

        <div class="w-1 h-3 bg-white/20 rounded-full shrink-0"></div>

        <!-- Right Bar -->
        <div class="flex-1 flex justify-start">
          <div
            class="h-full rounded-full transition-all duration-300"
            :class="winner === 'right' ? 'bg-gradient-to-r from-purple-400 to-pink-500 shadow-sm shadow-purple-500/50' : 'bg-neutral-600/70'"
            :style="{ width: `${rightPercent}%` }"
          ></div>
        </div>
      </div>

      <!-- Right Value -->
      <div class="col-span-3 sm:col-span-2 text-right">
        <div
          class="text-sm sm:text-base font-extrabold font-mono transition-colors"
          :class="winner === 'right' ? 'text-emerald-400 font-black' : 'text-slate-300'"
        >
          {{ formattedVal2 }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { formatNumber } from '~/utils/formatters'

const props = withDefaults(
  defineProps<{
    label: string
    icon: string
    val1: number
    val2: number
    unit?: string
    lowerIsBetter?: boolean
    decimals?: number
  }>(),
  {
    unit: '',
    lowerIsBetter: false,
    decimals: 1,
  }
)

const formattedVal1 = computed(() => {
  return `${props.unit}${formatNumber(props.val1, props.decimals)}`
})

const formattedVal2 = computed(() => {
  return `${props.unit}${formatNumber(props.val2, props.decimals)}`
})

const diff = computed(() => {
  return Math.abs(props.val1 - props.val2)
})

const percent = computed(() => {
  const max = Math.max(props.val1, props.val2)
  if (max === 0) return 0
  return Math.round((diff.value / max) * 100)
})

const winner = computed<'left' | 'right' | 'tie'>(() => {
  if (props.val1 === props.val2) return 'tie'
  if (props.lowerIsBetter) {
    return props.val1 < props.val2 ? 'left' : 'right'
  }
  return props.val1 > props.val2 ? 'left' : 'right'
})

const leftPercent = computed(() => {
  const max = Math.max(props.val1, props.val2, 0.0001)
  return Math.min(100, Math.max(10, Math.round((props.val1 / max) * 100)))
})

const rightPercent = computed(() => {
  const max = Math.max(props.val1, props.val2, 0.0001)
  return Math.min(100, Math.max(10, Math.round((props.val2 / max) * 100)))
})

function formatDelta(num: number): string {
  return `${props.unit}${formatNumber(num, props.decimals)}`
}
</script>
