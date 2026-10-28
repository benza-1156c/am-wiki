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
      <!-- Top Formula & Unit Switcher Card -->
      <UCard>
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <UButton icon="i-lucide-calculator" variant="subtle" color="primary" square size="lg" />
            <div>
              <div class="flex items-center gap-2">
                <h1 class="text-lg font-bold">Unit Stat & Awakening Calculator</h1>
                <UBadge variant="subtle" color="primary" size="xs">Level 1–80</UBadge>
              </div>
              <p class="text-xs text-muted">Canonical formulas with Awakening, 5 Status Potentials & Traits</p>
            </div>
          </div>

          <!-- Unit Selector Trigger Button -->
          <div class="flex flex-wrap items-center gap-2">
            <UButton
              icon="i-lucide-user"
              :label="(store.currentUnit?.displayName || store.currentUnit?.name || 'Select Unit') + ' ▾'"
              variant="outline"
              color="primary"
              size="md"
              @click="store.isSelectorOpen = true"
            />
          </div>
        </div>
      </UCard>

      <!-- Main Layout: 2 Columns -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <!-- Left Column: Controls (Stars, Level, Upgrade, Trait, Gears) -->
        <div class="lg:col-span-5 space-y-5">
          <UnitAwakeningStars />
          <UnitLevelSlider />
          <UnitUpgradeSelector />
          <UnitTraitSelector />
          <UnitGearSelector />
        </div>

        <!-- Right Column: Stats Display, Profile, and Skills -->
        <div class="lg:col-span-7 space-y-5">
          <UnitProfileCard />
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
</script>
