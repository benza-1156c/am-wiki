<template>
  <UCard v-if="store.currentUnit">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <div class="flex flex-wrap items-center gap-2">
          <h2 class="text-xl font-bold">
            {{ store.currentUnit.displayName || store.currentUnit.name }}
          </h2>
          <UBadge color="primary" variant="subtle" size="xs">{{ store.currentUnit.rarity }}</UBadge>
          <UBadge color="neutral" variant="subtle" size="xs">{{ store.currentUnit.element }}</UBadge>

          <UButton
            icon="i-lucide-arrow-left-right"
            label="Switch Unit"
            variant="outline"
            color="primary"
            size="xs"
            class="ml-1"
            @click="store.isSelectorOpen = true"
          />
        </div>
        <p class="text-xs text-muted mt-1">
          Series: <span class="font-semibold">{{ store.currentUnit.series }}</span> •
          Skill Mode: <span class="font-semibold">{{ store.currentUnit.skillMode }}</span> •
          Max Upgrade: <span class="font-semibold">Lv. {{ store.maxUpgradeLevel }}</span>
        </p>
      </div>

      <div class="text-right">
        <span class="text-[10px] text-muted block uppercase tracking-wider font-bold">Deploy Cost</span>
        <span class="text-lg font-bold font-mono">¥{{ store.calculatedStats.cost }}</span>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
const store = useCombatCalculatorStore()
</script>
