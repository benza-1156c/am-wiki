<template>
  <UCard v-if="unit">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <div class="flex items-center gap-2">
          <h2 class="text-xl font-bold">
            {{ unit.displayName || unit.name }}
          </h2>
          <UBadge color="primary" variant="subtle" size="xs">{{ unit.rarity }}</UBadge>
          <UBadge color="neutral" variant="subtle" size="xs">{{ unit.element }}</UBadge>
        </div>
        <p class="text-xs text-muted mt-1">
          Series: <span class="font-semibold">{{ unit.series }}</span> •
          Skill Mode: <span class="font-semibold">{{ unit.skillMode }}</span> •
          Max Upgrade: <span class="font-semibold">Lv. {{ maxUpgrade }}</span>
        </p>
      </div>

      <div class="text-right">
        <span class="text-[10px] text-muted block uppercase tracking-wider font-bold">Deploy Cost</span>
        <span class="text-lg font-bold font-mono">¥{{ cost }}</span>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { NormalizedUnit } from '~/types/unit'

defineProps<{
  unit: NormalizedUnit
  cost: number
  maxUpgrade: number
}>()
</script>

