<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between">
        <span class="text-sm font-bold flex items-center gap-2">
          <UIcon name="i-lucide-sliders" class="text-primary w-4 h-4" />
          <span>Level & Awakening</span>
        </span>
        <div class="flex items-center gap-1.5">
          <UBadge color="warning" variant="subtle" size="xs">
            {{ stars }}★
          </UBadge>
          <UBadge color="primary" variant="subtle" size="xs">
            Lv. {{ level }} / {{ maxLevelForStars }}
          </UBadge>
          <UBadge color="success" variant="subtle" size="xs">
            Upg. {{ upgradeLevel }}
          </UBadge>
        </div>
      </div>
    </template>

    <div class="space-y-4">
      <!-- Awakening Stars (Matching UnitAwakeningStars.vue) -->
      <div class="space-y-1.5">
        <div class="flex items-center justify-between text-xs">
          <span class="text-muted font-medium flex items-center gap-1">
            <UIcon name="i-lucide-star" class="text-amber-400" />
            <span>Awakening Stars</span>
          </span>
          <UBadge color="warning" variant="subtle" size="xs">{{ stars }} / 6 Stars</UBadge>
        </div>
        <div class="grid grid-cols-7 gap-1">
          <UButton
            v-for="s in [0, 1, 2, 3, 4, 5, 6]"
            :key="s"
            :label="s + '★'"
            :variant="stars === s ? 'solid' : 'outline'"
            :color="stars === s ? 'warning' : 'neutral'"
            size="sm"
            block
            @click="onUpdateStars(s)"
          />
        </div>
      </div>

      <!-- Unit Level Slider (Matching UnitLevelSlider.vue) -->
      <div class="space-y-2 pt-3 border-t border-default">
        <div class="flex items-center justify-between text-xs">
          <span class="text-muted font-medium flex items-center gap-1">
            <UIcon name="i-lucide-gauge" class="text-primary" />
            <span>Unit Level</span>
          </span>
          <UBadge color="primary" variant="subtle" size="xs">Lv. {{ level }} / {{ maxLevelForStars }}</UBadge>
        </div>

        <USlider
          :model-value="level"
          :min="1"
          :max="maxLevelForStars"
          size="lg"
          @update:model-value="emit('update:level', Number($event))"
        />

        <div class="flex items-center justify-between text-xs text-muted">
          <span>Lv. 1</span>
          <div class="flex items-center gap-1">
            <UButton label="Min" size="xs" variant="ghost" color="neutral" @click="emit('update:level', 1)" />
            <UButton label="Lv.50" size="xs" variant="ghost" color="neutral" @click="emit('update:level', 50)" />
            <UButton :label="'Max ' + maxLevelForStars" size="xs" variant="ghost" color="primary" @click="emit('update:level', maxLevelForStars)" />
          </div>
        </div>
      </div>

      <!-- In-Game Upgrade (Matching UnitLevelSlider.vue) -->
      <div class="space-y-2 pt-3 border-t border-default">
        <div class="flex items-center justify-between text-xs">
          <span class="text-muted font-medium flex items-center gap-1">
            <UIcon name="i-lucide-chevrons-up" class="text-emerald-400" />
            <span>In-Game Upgrade</span>
          </span>
          <UBadge color="success" variant="subtle" size="xs">Upg. {{ upgradeLevel }} / {{ unit?.maxLevel || 5 }}</UBadge>
        </div>

        <div class="flex flex-wrap items-center gap-1.5">
          <UButton
            v-for="u in (unit?.maxLevel !== undefined ? unit.maxLevel + 1 : 6)"
            :key="u - 1"
            :label="String(u - 1)"
            :variant="upgradeLevel === (u - 1) ? 'solid' : 'outline'"
            :color="upgradeLevel === (u - 1) ? 'success' : 'neutral'"
            size="sm"
            class="min-w-[32px] justify-center"
            @click="emit('update:upgradeLevel', u - 1)"
          />
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { getMaxUnitLevel } from '~/utils/unitCalculator'

const props = defineProps<{
  unit: any
  stars: number
  level: number
  upgradeLevel: number
}>()

const emit = defineEmits<{
  (e: 'update:stars', stars: number): void
  (e: 'update:level', level: number): void
  (e: 'update:upgradeLevel', upg: number): void
}>()

const maxLevelForStars = computed(() => {
  return getMaxUnitLevel(props.stars)
})

function onUpdateStars(s: number) {
  emit('update:stars', s)
  const maxLvl = getMaxUnitLevel(s)
  if (props.level > maxLvl) {
    emit('update:level', maxLvl)
  }
}
</script>

