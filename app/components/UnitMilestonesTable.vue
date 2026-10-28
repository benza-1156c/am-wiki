<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between">
        <span class="text-sm font-bold flex items-center gap-1.5">
          <UIcon name="i-lucide-table-properties" />
          <span>Power Milestones at Upgrade {{ upgradeLevel }}</span>
        </span>
        <UBadge color="neutral" variant="subtle" size="xs">3 Tiers</UBadge>
      </div>
    </template>

    <div class="overflow-x-auto">
      <table class="w-full text-xs text-left">
        <thead>
          <tr class="border-b border-default text-muted font-mono">
            <th class="py-2 px-2.5">Milestone</th>
            <th class="py-2 px-2.5">Level</th>
            <th class="py-2 px-2.5">Stars</th>
            <th class="py-2 px-2.5 text-right">Damage (ATK)</th>
            <th class="py-2 px-2.5 text-right">DPS</th>
            <th class="py-2 px-2.5 text-right">Health (HP)</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-default font-mono">
          <!-- Base -->
          <tr>
            <td class="py-2 px-2.5 font-bold text-muted font-sans">Base</td>
            <td class="py-2 px-2.5">Lv. 1</td>
            <td class="py-2 px-2.5 text-muted">0★</td>
            <td class="py-2 px-2.5 text-right font-bold">{{ base.attack.toLocaleString() }}</td>
            <td class="py-2 px-2.5 text-right font-bold text-warning">{{ base.dps.toLocaleString() }}</td>
            <td class="py-2 px-2.5 text-right text-success">{{ base.health.toLocaleString() }}</td>
          </tr>

          <!-- Lv 50 -->
          <tr>
            <td class="py-2 px-2.5 font-bold font-sans">Standard Max</td>
            <td class="py-2 px-2.5">Lv. 50</td>
            <td class="py-2.5 px-2.5 text-muted">0★</td>
            <td class="py-2 px-2.5 text-right font-bold">{{ lvl50.attack.toLocaleString() }}</td>
            <td class="py-2 px-2.5 text-right font-bold text-warning">{{ lvl50.dps.toLocaleString() }}</td>
            <td class="py-2 px-2.5 text-right text-success">{{ lvl50.health.toLocaleString() }}</td>
          </tr>

          <!-- Lv 80 Max Awakened -->
          <tr class="font-bold">
            <td class="py-2 px-2.5 font-bold font-sans flex items-center gap-1 text-warning">
              <UIcon name="i-lucide-crown" />
              <span>Max Awakened</span>
            </td>
            <td class="py-2 px-2.5 text-warning">Lv. 80</td>
            <td class="py-2 px-2.5 text-warning">6★</td>
            <td class="py-2 px-2.5 text-right font-black">{{ max80.attack.toLocaleString() }}</td>
            <td class="py-2 px-2.5 text-right font-black text-warning">{{ max80.dps.toLocaleString() }}</td>
            <td class="py-2 px-2.5 text-right font-bold text-success">{{ max80.health.toLocaleString() }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { CalculatedStats } from '~/types/unit'

defineProps<{
  upgradeLevel: number
  base: CalculatedStats
  lvl50: CalculatedStats
  max80: CalculatedStats
}>()
</script>

