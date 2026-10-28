<template>
  <div class="space-y-6">
    <!-- Loading State -->
    <div v-if="store.pending" class="flex flex-col items-center justify-center min-h-[40vh] space-y-3">
      <UIcon name="i-lucide-loader-2" class="w-8 h-8 animate-spin text-primary" />
      <p class="text-xs text-muted font-medium">Loading Units Data...</p>
    </div>

    <!-- Error State -->
    <UAlert
      v-else-if="store.error"
      color="error"
      variant="subtle"
      icon="i-lucide-alert-triangle"
      :title="'Failed to load database: ' + store.error.message"
    >
      <template #description>
        <UButton
          label="Retry Loading"
          color="error"
          variant="solid"
          size="xs"
          class="mt-2"
          @click="store.refresh()"
        />
      </template>
    </UAlert>

    <!-- Main Calculator View -->
    <div v-else class="space-y-6">
      <!-- Top Active Unit Bar & Switcher -->
      <div class="p-4 rounded-xl border border-white/5 bg-[#0f172a]/60 backdrop-blur-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div class="flex items-center gap-3.5">
          <!-- Unit Avatar -->
          <div class="w-11 h-11 rounded-lg bg-neutral-900 border border-white/10 flex items-center justify-center text-primary shrink-0">
            <UIcon name="i-lucide-user" class="w-5 h-5 text-neutral-300" />
          </div>

          <!-- Unit Identity & Meta -->
          <div>
            <div class="flex flex-wrap items-center gap-2">
              <h1 class="text-base sm:text-lg font-bold text-white tracking-tight">
                {{ store.currentUnit?.displayName || store.currentUnit?.name || 'Select Unit' }}
              </h1>
              <UBadge
                v-if="store.currentUnit?.rarity"
                :color="getRarityColor(store.currentUnit.rarity)"
                variant="subtle"
                size="xs"
              >
                {{ store.currentUnit.rarity }}
              </UBadge>
              <UBadge
                v-if="store.currentUnit?.element"
                color="neutral"
                variant="outline"
                size="xs"
              >
                {{ store.currentUnit.element }}
              </UBadge>
            </div>

            <div class="flex items-center gap-2 text-xs text-muted mt-0.5">
              <span v-if="store.currentUnit?.series" class="font-medium text-neutral-300">
                {{ store.currentUnit.series }}
              </span>
              <span v-if="store.currentUnit?.series && store.currentUnit?.skillMode">•</span>
              <span v-if="store.currentUnit?.skillMode">
                {{ store.currentUnit.skillMode }}
              </span>
              <span>•</span>
              <span class="font-mono text-neutral-300">Cost: ¥{{ store.calculatedStats.cost }}</span>
            </div>
          </div>
        </div>

        <!-- Switch Unit Action -->
        <div class="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <UButton
            icon="i-lucide-arrow-left-right"
            label="Switch Unit"
            variant="outline"
            color="primary"
            size="sm"
            @click="store.isSelectorOpen = true"
          />
        </div>
      </div>

      <!-- Main Layout: 2 Columns -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <!-- Left Column: Controls (Stars, Level & Upgrade, Trait) -->
        <div class="lg:col-span-5 space-y-5">
          <UnitAwakeningStars />
          <UnitLevelSlider />
          <UnitTraitSelector />
        </div>

        <!-- Right Column: Gears, Stats Display, and Skills -->
        <div class="lg:col-span-7 space-y-5">
          <UnitGearSelector />
          <UnitStatsGrid />
          <UnitSkillCard />
        </div>
      </div>

      <!-- Unit Selector Modal -->
      <UnitSelector />
    </div>
  </div>
</template>

<script setup lang="ts">
// Central store manages all state and calculations across components (No manual emits needed)
const store = useCombatCalculatorStore()

function getRarityColor(rarity?: string): any {
  switch (rarity) {
    case 'Secret': return 'error'
    case 'Mythic': return 'error'
    case 'Legendary': return 'warning'
    case 'Epic': return 'secondary'
    case 'Rare': return 'info'
    default: return 'neutral'
  }
}
</script>
