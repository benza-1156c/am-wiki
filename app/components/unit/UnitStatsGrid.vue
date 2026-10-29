<template>
  <UCard>
    <template #header>
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <span class="text-sm font-bold flex items-center gap-1.5">
          <UIcon name="i-lucide-activity" />
          <span>Combat Statistics</span>
        </span>
        <div class="flex items-center gap-2">
          <UBadge color="primary" variant="subtle" size="xs">
            Lv. {{ store.unitLevel }}
          </UBadge>
          <UBadge
            v-for="trait in store.currentTraits"
            :key="trait.id"
            color="warning"
            variant="subtle"
            size="xs"
          >
            Trait: {{ trait.TraitDisplayName }}
          </UBadge>
          <UBadge color="neutral" variant="outline" size="xs">
            Status: D
          </UBadge>
        </div>
      </div>
    </template>

    <div class="space-y-4">
      <!-- Group 1: The 5 Rerollable Stats -->
      <div class="space-y-2">
        <div class="text-[11px] font-bold text-muted uppercase tracking-wider">
          <span>Status Potentials</span>
        </div>

        <!-- DRY Loop for the 5 stats with Nuxt UI USelect -->
        <div class="space-y-2">
          <div
            v-for="stat in potentialStats"
            :key="stat.key"
            class="flex items-center justify-between p-2.5 rounded-lg border bg-neutral-900/40 text-xs"
            :class="stat.borderColor"
          >
            <!-- Stat Label & Icon -->
            <span class="font-bold flex items-center gap-2" :class="stat.textColor">
              <UIcon :name="stat.icon" class="w-4 h-4" :class="stat.textColor" />
              <span>{{ stat.label }} :</span>
            </span>

            <!-- Stat Value Pill & Nuxt UI USelect -->
            <div class="flex items-center gap-2 font-mono">
              <div
                class="px-2.5 py-1 rounded bg-black/60 border border-neutral-800/80 font-bold text-xs flex items-center gap-1.5 transition-colors"
                :class="getRankTextColor(store.potentials[stat.key])"
              >
                <span>{{ stat.getValue(store.calculatedStats) }}{{ stat.suffix || '' }}</span>
              </div>

              <!-- Nuxt UI Select Component -->
              <USelect
                :model-value="store.potentials[stat.key] || 'D'"
                :items="stat.isCooldown ? cooldownRankItems : rankItems"
                size="xs"
                variant="outline"
                color="neutral"
                class="w-32 font-mono font-semibold"
                :class="getRankSelectStyle(store.potentials[stat.key])"
                @update:model-value="(val) => store.setPotential(stat.key, val as PotentialRank)"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Group 2: Derived Combat & Skill Metrics -->
      <div class="space-y-2 pt-2 border-t border-default">
        <div class="text-[11px] font-bold text-muted uppercase tracking-wider">
          <span>Skill & Combat Metrics</span>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-2 2xl:grid-cols-4 gap-2">
          <!-- DPS -->
          <div class="p-2 rounded border border-orange-500/60 bg-neutral-900/30 text-xs">
            <div class="flex items-center gap-1 text-orange-400 font-bold mb-1">
              <UIcon name="i-lucide-flame" class="w-3.5 h-3.5" />
              <span>DPS</span>
            </div>
            <div class="font-bold font-mono text-sm text-orange-300">
              {{ store.calculatedStats.dps.toLocaleString() }}
            </div>
          </div>

          <!-- ดาเมจสกิล (Skill DMG) -->
          <div class="p-2 rounded border border-amber-500/60 bg-neutral-900/30 text-xs">
            <div class="flex items-center gap-1 text-amber-400 font-bold mb-1">
              <UIcon name="i-lucide-sparkles" class="w-3.5 h-3.5" />
              <span>ดาเมจสกิล</span>
            </div>
            <div class="font-bold font-mono text-sm text-amber-300">
              {{ store.calculatedStats.skillDamage.toLocaleString() }}
            </div>
          </div>

          <!-- คูลดาวน์สกิล (Skill CD) -->
          <div class="p-2 rounded border border-purple-500/60 bg-neutral-900/30 text-xs">
            <div class="flex items-center gap-1 text-purple-400 font-bold mb-1">
              <UIcon name="i-lucide-timer" class="w-3.5 h-3.5" />
              <span>คูลดาวน์สกิล</span>
            </div>
            <div class="font-bold font-mono text-sm text-purple-300">
              {{ store.calculatedStats.skillCooldown }}s
            </div>
          </div>

          <!-- ระยะสกิล (Skill Range) -->
          <div class="p-2 rounded border border-default bg-neutral-900/30 text-xs">
            <div class="flex items-center gap-1 text-muted font-bold mb-1">
              <UIcon name="i-lucide-crosshair" class="w-3.5 h-3.5" />
              <span>ระยะสกิล</span>
            </div>
            <div class="font-bold font-mono text-sm">
              {{ store.calculatedStats.skillRange }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { CalculatedStats, StatPotentials, PotentialRank } from '~/types/unit'
import {
  POTENTIAL_CONFIGS,
  POTENTIAL_RANK_ORDER,
  getRankTextColor,
  getRankSelectStyle
} from '~/utils/unitCalculator'

// Global Type-Safe Central Store (No manual emits needed)
const store = useCombatCalculatorStore()

interface StatRowDef {
  key: keyof StatPotentials
  label: string
  icon: string
  borderColor: string
  textColor: string
  getValue: (s: CalculatedStats) => string | number
  suffix?: string
  isCooldown?: boolean
}

// The 5 In-game rerollable status potentials (Ordered cleanly as in screenshot)
const potentialStats: StatRowDef[] = [
  {
    key: 'damage',
    label: 'ดาเมจ',
    icon: 'i-lucide-zap',
    borderColor: 'border-rose-500/80',
    textColor: 'text-rose-400',
    getValue: (s) => s.attack.toLocaleString()
  },
  {
    key: 'health',
    label: 'พลังชีวิต',
    icon: 'i-lucide-heart',
    borderColor: 'border-emerald-500/80',
    textColor: 'text-emerald-400',
    getValue: (s) => s.health.toLocaleString()
  },
  {
    key: 'range',
    label: 'ระยะ',
    icon: 'i-lucide-target',
    borderColor: 'border-amber-500/80',
    textColor: 'text-amber-400',
    getValue: (s) => s.range
  },
  {
    key: 'speed',
    label: 'ความเร็ว',
    icon: 'i-lucide-footprints',
    borderColor: 'border-cyan-500/80',
    textColor: 'text-cyan-400',
    getValue: (s) => s.speed
  },
  {
    key: 'cooldown',
    label: 'คูลดาวน์',
    icon: 'i-lucide-hourglass',
    borderColor: 'border-teal-500/80',
    textColor: 'text-teal-400',
    getValue: (s) => s.attackSpeed,
    suffix: 's',
    isCooldown: true
  }
]

// Rank options for Nuxt UI USelect
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
