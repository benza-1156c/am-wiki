<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between">
        <span class="text-sm font-bold flex items-center gap-1.5">
          <UIcon name="i-lucide-star" />
          <span>Awakening Stars</span>
        </span>
        <UBadge color="warning" variant="subtle" size="xs">{{ currentStars }} / 6 Stars</UBadge>
      </div>
    </template>

    <div class="space-y-4">
      <!-- Star Buttons -->
      <div class="grid grid-cols-7 gap-1">
        <UButton
          v-for="s in [0, 1, 2, 3, 4, 5, 6]"
          :key="s"
          :label="s + '★'"
          :variant="currentStars === s ? 'solid' : 'outline'"
          :color="currentStars === s ? 'warning' : 'neutral'"
          size="sm"
          block
          @click="selectStar(s)"
        />
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
const store = useCombatCalculatorStore()

const props = defineProps<{
  modelValue?: number
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: number): void
}>()

const currentStars = computed(() => {
  return props.modelValue !== undefined ? props.modelValue : store.selectedStars
})

function selectStar(s: number) {
  store.setStars(s)
  emit('update:modelValue', s)
}
</script>
