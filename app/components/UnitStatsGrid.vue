<template>
  <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
    <!-- 1. Attack (Damage) -->
    <UCard>
      <div class="text-xs text-muted flex items-center justify-between mb-1">
        <span class="font-bold flex items-center gap-1">
          <UIcon name="i-lucide-sword" />
          <span>Damage (ATK)</span>
        </span>
        <span>Lv. {{ unitLevel }}</span>
      </div>
      <div class="text-2xl font-bold font-mono">
        {{ stats.attack.toLocaleString() }}
      </div>
      <div class="text-xs text-muted mt-1 flex items-center justify-between">
        <span>Base: {{ stats.baseAttack }}</span>
        <UBadge color="success" variant="subtle" size="xs">+{{ stats.atkGainPercent }}%</UBadge>
      </div>
    </UCard>

    <!-- 2. DPS -->
    <UCard>
      <div class="text-xs text-muted flex items-center justify-between mb-1">
        <span class="font-bold flex items-center gap-1">
          <UIcon name="i-lucide-flame" />
          <span>DPS</span>
        </span>
        <span>ATK / SPA</span>
      </div>
      <div class="text-2xl font-bold font-mono text-warning">
        {{ stats.dps.toLocaleString() }}
      </div>
      <div class="text-xs text-muted mt-1">
        SPA: <span class="font-bold">{{ stats.attackSpeed }}s</span>
      </div>
    </UCard>

    <!-- 3. Health -->
    <UCard>
      <div class="text-xs text-muted flex items-center justify-between mb-1">
        <span class="font-bold flex items-center gap-1">
          <UIcon name="i-lucide-heart" />
          <span>Health (HP)</span>
        </span>
        <span>Lv. {{ unitLevel }}</span>
      </div>
      <div class="text-2xl font-bold font-mono text-success">
        {{ stats.health.toLocaleString() }}
      </div>
      <div class="text-xs text-muted mt-1 flex items-center justify-between">
        <span>Base: {{ stats.baseHealth }}</span>
        <UBadge color="success" variant="subtle" size="xs">+{{ stats.hpGainPercent }}%</UBadge>
      </div>
    </UCard>

    <!-- 4. Range -->
    <UCard>
      <div class="text-xs text-muted flex items-center justify-between mb-1">
        <span class="font-bold flex items-center gap-1">
          <UIcon name="i-lucide-target" />
          <span>Range</span>
        </span>
      </div>
      <div class="text-xl font-bold font-mono">
        {{ stats.range }}
      </div>
      <div class="text-xs text-muted mt-1">
        Skill Range: <span class="font-bold">{{ stats.skillRange }}</span>
      </div>
    </UCard>

    <!-- 5. Speed -->
    <UCard>
      <div class="text-xs text-muted flex items-center justify-between mb-1">
        <span class="font-bold flex items-center gap-1">
          <UIcon name="i-lucide-zap" />
          <span>Walk Speed</span>
        </span>
      </div>
      <div class="text-xl font-bold font-mono">
        {{ stats.speed }}
      </div>
      <div class="text-xs text-muted mt-1">
        Attack Speed: <span class="font-bold">{{ stats.attackSpeed }}s</span>
      </div>
    </UCard>

    <!-- 6. Skill Damage -->
    <UCard>
      <div class="text-xs text-muted flex items-center justify-between mb-1">
        <span class="font-bold flex items-center gap-1">
          <UIcon name="i-lucide-sparkles" />
          <span>Skill Damage</span>
        </span>
      </div>
      <div class="text-xl font-bold font-mono text-primary">
        {{ stats.skillDamage.toLocaleString() }}
      </div>
      <div class="text-xs text-muted mt-1">
        Cooldown: <span class="font-bold">{{ stats.skillCooldown }}s</span>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import type { CalculatedStats } from '~/types/unit'

defineProps<{
  stats: CalculatedStats
  unitLevel: number
}>()
</script>

