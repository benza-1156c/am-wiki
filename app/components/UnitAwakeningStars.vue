<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between">
        <span class="text-sm font-bold flex items-center gap-1.5">
          <UIcon name="i-lucide-star" />
          <span>Awakening Stars</span>
        </span>
        <UBadge color="warning" variant="subtle" size="xs">{{ modelValue }} / 6 Stars</UBadge>
      </div>
    </template>

    <div class="space-y-4">
      <!-- Star Buttons -->
      <div class="grid grid-cols-7 gap-1">
        <UButton
          v-for="s in [0, 1, 2, 3, 4, 5, 6]"
          :key="s"
          :label="s + '★'"
          :variant="modelValue === s ? 'solid' : 'outline'"
          :color="modelValue === s ? 'warning' : 'neutral'"
          size="sm"
          block
          @click="$emit('update:modelValue', s)"
        />
      </div>

      <!-- Awakening Perks Breakdown -->
      <div class="space-y-1.5 text-xs">
        <div
          v-for="perk in awakeningPerksList"
          :key="perk.star"
          class="p-2 rounded border border-default flex items-center justify-between text-xs"
        >
          <div class="flex items-center gap-2">
            <UIcon
              :name="modelValue >= perk.star ? 'i-lucide-check-circle-2' : 'i-lucide-circle'"
              :class="modelValue >= perk.star ? 'text-warning' : 'text-muted'"
            />
            <span :class="modelValue >= perk.star ? 'font-bold' : 'text-muted'">{{ perk.label }}</span>
          </div>
          <UBadge
            :color="modelValue >= perk.star ? 'warning' : 'neutral'"
            variant="subtle"
            size="xs"
          >
            {{ perk.bonus }}
          </UBadge>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: number
}>()

defineEmits<{
  (e: 'update:modelValue', val: number): void
}>()

const awakeningPerksList = [
  { star: 1, label: '1 Star (★)', bonus: '+1% Damage' },
  { star: 2, label: '2 Stars (★★)', bonus: '+2% Health' },
  { star: 3, label: '3 Stars (★★★)', bonus: '+2% Speed' },
  { star: 4, label: '4 Stars (★★★★)', bonus: '+2% Skill Damage' },
  { star: 5, label: '5 Stars (★★★★★)', bonus: '+2% Range' },
  { star: 6, label: '6 Stars (★★★★★★)', bonus: '+5% Damage (+6% Total)' }
]
</script>

