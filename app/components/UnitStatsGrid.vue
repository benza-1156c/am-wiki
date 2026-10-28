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

    <div class="space-y-1.5">
      <!-- 1. Attack (Damage) -->
      <div class="flex items-center justify-between p-2 rounded border border-default text-xs">
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-sword" class="text-primary w-4 h-4" />
          <span class="font-medium">Damage (ATK)</span>
          <span class="text-[10px] text-muted hidden sm:inline">(Base: {{ stats.baseAttack }})</span>
        </div>
        <div class="flex items-center gap-2 font-mono">
          <UBadge color="success" variant="subtle" size="xs">+{{ stats.atkGainPercent }}%</UBadge>
          <span class="font-bold text-sm">{{ stats.attack.toLocaleString() }}</span>
        </div>
      </div>

      <!-- 2. DPS -->
      <div class="flex items-center justify-between p-2 rounded border border-default text-xs">
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-flame" class="text-warning w-4 h-4" />
          <span class="font-medium">DPS</span>
          <span class="text-[10px] text-muted hidden sm:inline">(ATK / SPA)</span>
        </div>
        <div class="flex items-center gap-2 font-mono">
          <span class="text-[10px] text-muted">{{ stats.attackSpeed }}s SPA</span>
          <span class="font-bold text-sm text-warning">{{ stats.dps.toLocaleString() }}</span>
        </div>
      </div>

      <!-- 3. Health (HP) -->
      <div class="flex items-center justify-between p-2 rounded border border-default text-xs">
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-heart" class="text-success w-4 h-4" />
          <span class="font-medium">Health (HP)</span>
          <span class="text-[10px] text-muted hidden sm:inline">(Base: {{ stats.baseHealth }})</span>
        </div>
        <div class="flex items-center gap-2 font-mono">
          <UBadge color="success" variant="subtle" size="xs">+{{ stats.hpGainPercent }}%</UBadge>
          <span class="font-bold text-sm text-success">{{ stats.health.toLocaleString() }}</span>
        </div>
      </div>

      <!-- 4. Range -->
      <div class="flex items-center justify-between p-2 rounded border border-default text-xs">
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-target" class="text-primary w-4 h-4" />
          <span class="font-medium">Attack Range</span>
          <span class="text-[10px] text-muted hidden sm:inline">(ระยะตีปกติ)</span>
        </div>
        <div class="flex items-center gap-2 font-mono">
          <UBadge color="neutral" variant="subtle" size="xs">Skill Range: {{ stats.skillRange }}</UBadge>
          <span class="font-bold text-sm">{{ stats.range }}</span>
        </div>
      </div>

      <!-- 5. Speed -->
      <div class="flex items-center justify-between p-2 rounded border border-default text-xs">
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-zap" class="text-warning w-4 h-4" />
          <span class="font-medium">Walk Speed</span>
          <span class="text-[10px] text-muted hidden sm:inline">(Attack Speed: {{ stats.attackSpeed }}s)</span>
        </div>
        <div class="flex items-center gap-2 font-mono">
          <span class="font-bold text-sm">{{ stats.speed }}</span>
        </div>
      </div>

      <!-- 6. Skill Damage -->
      <div class="flex items-center justify-between p-2 rounded border border-default text-xs">
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-sparkles" class="text-primary w-4 h-4" />
          <span class="font-medium">Skill Damage</span>
          <span class="text-[10px] text-muted hidden sm:inline">(Cooldown: {{ stats.skillCooldown }}s)</span>
        </div>
        <div class="flex items-center gap-2 font-mono">
          <span class="font-bold text-sm text-primary">{{ stats.skillDamage.toLocaleString() }}</span>
        </div>
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
