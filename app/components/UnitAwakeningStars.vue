<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between">
        <span class="text-sm font-bold flex items-center gap-1.5">
          <UIcon name="i-lucide-star" />
          <span>Awakening Stars</span>
        </span>
        <UBadge color="warning" variant="subtle" size="xs">{{ store.selectedStars }} / 6 Stars</UBadge>
      </div>
    </template>

    <div class="space-y-4">
      <!-- Star Buttons -->
      <div class="grid grid-cols-7 gap-1">
        <UButton
          v-for="s in [0, 1, 2, 3, 4, 5, 6]"
          :key="s"
          :label="s + '★'"
          :variant="store.selectedStars === s ? 'solid' : 'outline'"
          :color="store.selectedStars === s ? 'warning' : 'neutral'"
          size="sm"
          block
          @click="store.setStars(s)"
        />
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
const store = useCombatCalculatorStore()
</script>
