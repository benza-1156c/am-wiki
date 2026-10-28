<template>
  <UCard>
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <UButton icon="i-lucide-calculator" variant="subtle" color="primary" square size="lg" />
        <div>
          <h1 class="text-lg font-bold">
            Unit Stat & Awakening Calculator
          </h1>
          <p class="text-xs text-muted">
            Canonical formulas from CalculateUnitsStats & UnitLevelData
          </p>
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <UBadge variant="subtle" color="primary" size="md">
          Level Scaling: 1 + (Level - 1) × 10%
        </UBadge>
        <UBadge variant="subtle" color="warning" size="md">
          Max Level: 50 + (Stars × 5) [Max 80]
        </UBadge>
      </div>
    </div>
  </UCard>
</template>

