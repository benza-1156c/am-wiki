<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between">
        <span class="text-sm font-bold flex items-center gap-1.5">
          <UIcon name="i-lucide-activity" class="text-primary w-4 h-4" />
          <span>Status Potentials</span>
        </span>
        <UBadge color="neutral" variant="outline" size="xs">
          Rank Configuration
        </UBadge>
      </div>
    </template>

    <div class="space-y-2">
      <div
        v-for="stat in potentialFields"
        :key="stat.key"
        class="flex items-center justify-between p-2.5 rounded-lg border border-default bg-neutral-900/40 text-xs"
      >
        <span class="font-bold flex items-center gap-2" :class="stat.textColor">
          <UIcon :name="stat.icon" class="w-4 h-4" />
          <span>{{ stat.label }}</span>
        </span>

        <USelect
          :model-value="potentials[stat.key] || 'D'"
          :items="stat.key === 'cooldown' ? cooldownRankItems : rankItems"
          size="sm"
          variant="outline"
          color="neutral"
          class="w-32 font-mono font-semibold"
          :class="getRankSelectStyle(potentials[stat.key])"
          @update:model-value="(val) => emit('update:potential', stat.key, val as PotentialRank)"
        />
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { PotentialRank, StatPotentials } from '~/types/unit'
import {
  POTENTIAL_CONFIGS,
  POTENTIAL_RANK_ORDER,
  getRankSelectStyle
} from '~/utils/unitCalculator'

const props = defineProps<{
  potentials: StatPotentials
}>()

const emit = defineEmits<{
  (e: 'update:potential', key: keyof StatPotentials, rank: PotentialRank): void
}>()

const potentialFields = [
  { key: 'damage' as const, label: 'Damage', icon: 'i-lucide-zap', textColor: 'text-rose-400' },
  { key: 'health' as const, label: 'Health', icon: 'i-lucide-heart', textColor: 'text-emerald-400' },
  { key: 'range' as const, label: 'Range', icon: 'i-lucide-target', textColor: 'text-amber-400' },
  { key: 'speed' as const, label: 'Speed', icon: 'i-lucide-footprints', textColor: 'text-cyan-400' },
  { key: 'cooldown' as const, label: 'Attack Cooldown', icon: 'i-lucide-hourglass', textColor: 'text-teal-400' }
]

const rankItems = computed(() => {
  return POTENTIAL_RANK_ORDER.map(key => {
    const cfg = POTENTIAL_CONFIGS[key]
    const pct = Math.round(cfg.percent * 100)
    return {
      value: key,
      label: key === 'NONE' ? '-' : `${cfg.label} +${pct}%`
    }
  })
})

const cooldownRankItems = computed(() => {
  return POTENTIAL_RANK_ORDER.map(key => {
    const cfg = POTENTIAL_CONFIGS[key]
    const pct = Math.round(cfg.percent * 100)
    return {
      value: key,
      label: key === 'NONE' ? '-' : `${cfg.label} -${pct}%`
    }
  })
})
</script>

