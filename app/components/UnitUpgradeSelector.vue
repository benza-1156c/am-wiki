<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between">
        <span class="text-sm font-bold flex items-center gap-1.5">
          <UIcon name="i-lucide-arrow-up-circle" />
          <span>In-Game Upgrade Level</span>
        </span>
        <UBadge color="primary" variant="subtle" size="xs">
          Upgrade {{ store.upgradeLevel }} / {{ store.maxUpgradeLevel }}
        </UBadge>
      </div>
    </template>

    <div class="flex flex-wrap items-center gap-1.5">
      <UButton
        v-for="u in store.maxUpgradeLevel + 1"
        :key="u - 1"
        :label="String(u - 1)"
        :variant="store.upgradeLevel === (u - 1) ? 'solid' : 'outline'"
        :color="store.upgradeLevel === (u - 1) ? 'primary' : 'neutral'"
        size="sm"
        @click="store.setUpgradeLevel(u - 1)"
      />
    </div>
  </UCard>
</template>

<script setup lang="ts">
const store = useCombatCalculatorStore()
</script>
