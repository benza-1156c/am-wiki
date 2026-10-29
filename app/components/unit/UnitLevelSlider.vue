<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between">
        <span class="text-sm font-bold flex items-center gap-1.5">
          <UIcon name="i-lucide-sliders" />
          <span>Level</span>
        </span>
        <div class="flex items-center gap-1.5">
          <UBadge color="primary" variant="subtle" size="xs">
            Lv. {{ store.unitLevel }} / {{ store.currentMaxLevel }}
          </UBadge>
        </div>
      </div>
    </template>

    <div class="space-y-4">
      <!-- Section 1: Unit Level Slider & Multiplier -->
      <div class="space-y-2.5">
        <div class="flex items-center gap-1 text-xs">
            <UIcon name="i-lucide-gauge" class="w-3.5 h-3.5 text-primary" />
          <span class="font-bold text-muted tracking-wider text-[11px]">Unit Level</span>
        </div>

        <USlider
          :model-value="store.unitLevel"
          :min="1"
          :max="store.currentMaxLevel"
          size="lg"
          @update:model-value="store.setLevel(Number($event))"
        />

        <div class="flex items-center justify-between text-xs text-muted">
          <span>Lv. 1</span>
          <div class="flex items-center gap-1">
            <UButton label="Min" size="xs" variant="ghost" color="neutral" @click="store.setLevel(1)" />
            <UButton label="Lv.50" size="xs" variant="ghost" color="neutral" @click="store.setLevel(50)" />
            <UButton :label="'Max ' + store.currentMaxLevel" size="xs" variant="ghost" color="primary" @click="store.setLevel(store.currentMaxLevel)" />
          </div>
        </div>
      </div>

      <!-- Section 2: In-Game Upgrade Level -->
      <div class="pt-3 border-t border-default space-y-2">
        <div class="flex items-center gap-1 text-xs">
            <UIcon name="i-lucide-chevrons-up" class="w-3.5 h-3.5 text-emerald-400" />
          <span class="font-bold text-muted tracking-wider text-[11px]">In-Game Upgrade</span>
        </div>

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
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
const store = useCombatCalculatorStore()
</script>
