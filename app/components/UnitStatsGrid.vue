<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between">
        <span class="text-sm font-bold flex items-center gap-1.5">
          <UIcon name="i-lucide-activity" />
          <span>Combat Statistics</span>
        </span>
        <UBadge color="primary" variant="subtle" size="xs">
          Lv. {{ unitLevel }}
        </UBadge>
      </div>
    </template>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
      <!-- 1. Damage -->
      <div class="flex items-center justify-between p-2 rounded border border-default text-xs">
        <span class="font-medium flex items-center gap-1.5">
          <UIcon name="i-lucide-sword" class="text-primary w-4 h-4" />
          <span>Damage</span>
        </span>
        <span class="font-bold font-mono text-sm">{{ stats.attack.toLocaleString() }}</span>
      </div>

      <!-- 2. DPS -->
      <div class="flex items-center justify-between p-2 rounded border border-default text-xs">
        <span class="font-medium flex items-center gap-1.5">
          <UIcon name="i-lucide-flame" class="text-warning w-4 h-4" />
          <span>DPS</span>
        </span>
        <span class="font-bold font-mono text-sm text-warning">{{ stats.dps.toLocaleString() }}</span>
      </div>

      <!-- 3. Health -->
      <div class="flex items-center justify-between p-2 rounded border border-default text-xs">
        <span class="font-medium flex items-center gap-1.5">
          <UIcon name="i-lucide-heart" class="text-success w-4 h-4" />
          <span>Health</span>
        </span>
        <span class="font-bold font-mono text-sm text-success">{{ stats.health.toLocaleString() }}</span>
      </div>

      <!-- 4. Skill Damage -->
      <div class="flex items-center justify-between p-2 rounded border border-default text-xs">
        <span class="font-medium flex items-center gap-1.5">
          <UIcon name="i-lucide-sparkles" class="text-primary w-4 h-4" />
          <span>Skill Damage</span>
        </span>
        <span class="font-bold font-mono text-sm text-primary">{{ stats.skillDamage.toLocaleString() }}</span>
      </div>

      <!-- 5. Attack Range -->
      <div class="flex items-center justify-between p-2 rounded border border-default text-xs">
        <span class="font-medium flex items-center gap-1.5">
          <UIcon name="i-lucide-target" class="text-primary w-4 h-4" />
          <span>Attack Range</span>
        </span>
        <span class="font-bold font-mono text-sm">{{ stats.range }}</span>
      </div>

      <!-- 6. Skill Range -->
      <div class="flex items-center justify-between p-2 rounded border border-default text-xs">
        <span class="font-medium flex items-center gap-1.5">
          <UIcon name="i-lucide-crosshair" class="text-primary w-4 h-4" />
          <span>Skill Range</span>
        </span>
        <span class="font-bold font-mono text-sm">{{ stats.skillRange }}</span>
      </div>

      <!-- 7. Attack Speed -->
      <div class="flex items-center justify-between p-2 rounded border border-default text-xs">
        <span class="font-medium flex items-center gap-1.5">
          <UIcon name="i-lucide-clock" class="text-warning w-4 h-4" />
          <span>Attack Speed</span>
        </span>
        <span class="font-bold font-mono text-sm">{{ stats.attackSpeed }}s</span>
      </div>

      <!-- 8. Walk Speed -->
      <div class="flex items-center justify-between p-2 rounded border border-default text-xs">
        <span class="font-medium flex items-center gap-1.5">
          <UIcon name="i-lucide-zap" class="text-warning w-4 h-4" />
          <span>Walk Speed</span>
        </span>
        <span class="font-bold font-mono text-sm">{{ stats.speed }}</span>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { CalculatedStats } from '~/types/unit'

defineProps<{
  stats: CalculatedStats
  unitLevel: number
}>()
</script>
