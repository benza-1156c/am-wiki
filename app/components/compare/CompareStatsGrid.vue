<template>
  <div class="space-y-5">
    <!-- Group 1: Status Potentials Comparison -->
    <div class="space-y-2">
      <div class="text-[11px] font-bold text-muted uppercase tracking-wider flex items-center gap-1.5">
        <UIcon name="i-lucide-activity" class="w-3.5 h-3.5 text-primary" />
        <span>Status Potentials</span>
      </div>

      <div class="space-y-1.5">
        <div
          v-for="stat in potentialStats"
          :key="stat.key"
          class="p-2.5 rounded-lg border border-default bg-neutral-900/40 hover:bg-neutral-900/60 transition-colors flex items-center justify-between gap-3 text-xs"
        >
          <!-- Left Unit Value & Potential Rank -->
          <div class="flex-1 flex items-center gap-2">
            <div
              class="px-2.5 py-1 rounded-md font-mono transition-all flex items-center gap-1.5"
              :class="isWinner(stat.getRaw(stats1), stat.getRaw(stats2), stat.isCooldown) === '1'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-black'
                : 'text-neutral-300 font-semibold'"
            >
              <UIcon
                v-if="isWinner(stat.getRaw(stats1), stat.getRaw(stats2), stat.isCooldown) === '1'"
                name="i-lucide-crown"
                class="w-3.5 h-3.5 text-emerald-400 shrink-0"
              />
              <span class="text-sm sm:text-base">{{ stat.getValue(stats1) }}</span>
            </div>

            <UBadge
              v-if="potentials1[stat.key]"
              color="neutral"
              variant="outline"
              size="xs"
              class="font-mono text-[11px] font-bold hidden sm:inline-flex"
            >
              {{ getRankLabel(potentials1[stat.key]) }}
            </UBadge>
          </div>

          <!-- Center Label & Icon -->
          <div class="flex items-center gap-2 px-3 py-1 rounded-md bg-neutral-900/80 border border-default font-bold text-neutral-300 shrink-0">
            <UIcon :name="stat.icon" class="w-4 h-4 text-primary" />
            <span class="text-xs sm:text-sm">{{ stat.label }}</span>
          </div>

          <!-- Right Unit Value & Potential Rank -->
          <div class="flex-1 flex items-center justify-end gap-2 text-right">
            <UBadge
              v-if="potentials2[stat.key]"
              color="neutral"
              variant="outline"
              size="xs"
              class="font-mono text-[11px] font-bold hidden sm:inline-flex"
            >
              {{ getRankLabel(potentials2[stat.key]) }}
            </UBadge>

            <div
              class="px-2.5 py-1 rounded-md font-mono transition-all flex items-center gap-1.5"
              :class="isWinner(stat.getRaw(stats1), stat.getRaw(stats2), stat.isCooldown) === '2'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-black'
                : 'text-neutral-300 font-semibold'"
            >
              <span class="text-sm sm:text-base">{{ stat.getValue(stats2) }}</span>
              <UIcon
                v-if="isWinner(stat.getRaw(stats1), stat.getRaw(stats2), stat.isCooldown) === '2'"
                name="i-lucide-crown"
                class="w-3.5 h-3.5 text-emerald-400 shrink-0"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Group 2: Skill & Combat Metrics (Same Row-by-Row Layout) -->
    <div class="space-y-2 pt-3 border-t border-default">
      <div class="text-[11px] font-bold text-muted uppercase tracking-wider flex items-center gap-1.5">
        <UIcon name="i-lucide-swords" class="w-3.5 h-3.5 text-amber-400" />
        <span>Skill & Combat Metrics</span>
      </div>

      <div class="space-y-1.5">
        <div
          v-for="stat in combatMetricStats"
          :key="stat.key"
          class="p-2.5 rounded-lg border border-default bg-neutral-900/40 hover:bg-neutral-900/60 transition-colors flex items-center justify-between gap-3 text-xs"
        >
          <!-- Left Unit Value -->
          <div class="flex-1 flex items-center gap-2">
            <div
              class="px-2.5 py-1 rounded-md font-mono transition-all flex items-center gap-1.5"
              :class="isWinner(stat.getRaw(stats1), stat.getRaw(stats2), stat.lowerIsBetter) === '1'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-black'
                : 'text-neutral-300 font-semibold'"
            >
              <UIcon
                v-if="isWinner(stat.getRaw(stats1), stat.getRaw(stats2), stat.lowerIsBetter) === '1'"
                name="i-lucide-crown"
                class="w-3.5 h-3.5 text-emerald-400 shrink-0"
              />
              <span class="text-sm sm:text-base">{{ stat.getValue(stats1) }}</span>
            </div>
          </div>

          <!-- Center Label & Icon -->
          <div class="flex items-center gap-2 px-3 py-1 rounded-md bg-neutral-900/80 border border-default font-bold text-neutral-300 shrink-0">
            <UIcon :name="stat.icon" class="w-4 h-4 text-amber-400" />
            <span class="text-xs sm:text-sm">{{ stat.label }}</span>
          </div>

          <!-- Right Unit Value -->
          <div class="flex-1 flex items-center justify-end gap-2 text-right">
            <div
              class="px-2.5 py-1 rounded-md font-mono transition-all flex items-center gap-1.5"
              :class="isWinner(stat.getRaw(stats1), stat.getRaw(stats2), stat.lowerIsBetter) === '2'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-black'
                : 'text-neutral-300 font-semibold'"
            >
              <span class="text-sm sm:text-base">{{ stat.getValue(stats2) }}</span>
              <UIcon
                v-if="isWinner(stat.getRaw(stats1), stat.getRaw(stats2), stat.lowerIsBetter) === '2'"
                name="i-lucide-crown"
                class="w-3.5 h-3.5 text-emerald-400 shrink-0"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CalculatedStats, StatPotentials, PotentialRank } from '~/types/unit'
import { formatNumber } from '~/utils/formatters'
import { POTENTIAL_CONFIGS } from '~/utils/unitCalculator'

const props = defineProps<{
  stats1: CalculatedStats
  stats2: CalculatedStats
  potentials1: StatPotentials
  potentials2: StatPotentials
}>()

function getRankLabel(rank?: PotentialRank): string {
  if (!rank || rank === 'NONE') return '-'
  return POTENTIAL_CONFIGS[rank]?.label || rank
}

const potentialStats = [
  {
    key: 'damage' as const,
    label: 'Damage',
    icon: 'i-lucide-zap',
    getValue: (s: CalculatedStats) => formatNumber(s.attack, 0),
    getRaw: (s: CalculatedStats) => s.attack
  },
  {
    key: 'health' as const,
    label: 'Health',
    icon: 'i-lucide-heart',
    getValue: (s: CalculatedStats) => formatNumber(s.health, 0),
    getRaw: (s: CalculatedStats) => s.health
  },
  {
    key: 'range' as const,
    label: 'Range',
    icon: 'i-lucide-target',
    getValue: (s: CalculatedStats) => formatNumber(s.range, 1),
    getRaw: (s: CalculatedStats) => s.range
  },
  {
    key: 'speed' as const,
    label: 'Speed',
    icon: 'i-lucide-footprints',
    getValue: (s: CalculatedStats) => formatNumber(s.speed, 1),
    getRaw: (s: CalculatedStats) => s.speed
  },
  {
    key: 'cooldown' as const,
    label: 'Attack Cooldown',
    icon: 'i-lucide-hourglass',
    getValue: (s: CalculatedStats) => `${formatNumber(s.attackSpeed, 2)}s`,
    getRaw: (s: CalculatedStats) => s.attackSpeed,
    isCooldown: true
  }
]

const combatMetricStats = [
  {
    key: 'dps' as const,
    label: 'DPS',
    icon: 'i-lucide-flame',
    getValue: (s: CalculatedStats) => formatNumber(s.dps),
    getRaw: (s: CalculatedStats) => s.dps,
    lowerIsBetter: false
  },
  {
    key: 'skillDamage' as const,
    label: 'Skill Damage',
    icon: 'i-lucide-sparkles',
    getValue: (s: CalculatedStats) => formatNumber(s.skillDamage, 0),
    getRaw: (s: CalculatedStats) => s.skillDamage,
    lowerIsBetter: false
  },
  {
    key: 'skillCooldown' as const,
    label: 'Skill Cooldown',
    icon: 'i-lucide-clock',
    getValue: (s: CalculatedStats) => `${formatNumber(s.skillCooldown)}s`,
    getRaw: (s: CalculatedStats) => s.skillCooldown,
    lowerIsBetter: true
  },
  {
    key: 'skillRange' as const,
    label: 'Skill Range',
    icon: 'i-lucide-crosshair',
    getValue: (s: CalculatedStats) => formatNumber(s.skillRange),
    getRaw: (s: CalculatedStats) => s.skillRange,
    lowerIsBetter: false
  },
  {
    key: 'cost' as const,
    label: 'Deployment Cost',
    icon: 'i-lucide-coins',
    getValue: (s: CalculatedStats) => `¥${formatNumber(s.cost, 0)}`,
    getRaw: (s: CalculatedStats) => s.cost,
    lowerIsBetter: true
  },
  {
    key: 'critChance' as const,
    label: 'Critical Chance',
    icon: 'i-lucide-percent',
    getValue: (s: CalculatedStats) => `${Math.round((s.critChance || 0) * 100)}%`,
    getRaw: (s: CalculatedStats) => s.critChance || 0,
    lowerIsBetter: false
  },
  {
    key: 'critDamage' as const,
    label: 'Critical Damage',
    icon: 'i-lucide-zap',
    getValue: (s: CalculatedStats) => `${formatNumber(s.critDamage || 1.5, 2)}x`,
    getRaw: (s: CalculatedStats) => s.critDamage || 0,
    lowerIsBetter: false
  }
]

function isWinner(val1?: number, val2?: number, lowerIsBetter = false): '1' | '2' | 'tie' {
  const v1 = Number(val1) || 0
  const v2 = Number(val2) || 0
  if (Math.abs(v1 - v2) < 0.001) return 'tie'
  if (lowerIsBetter) {
    return v1 < v2 ? '1' : '2'
  }
  return v1 > v2 ? '1' : '2'
}
</script>
