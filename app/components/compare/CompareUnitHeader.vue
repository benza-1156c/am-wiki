<template>
  <UCard>
    <div class="flex items-start justify-between gap-3">
      <div class="flex items-center gap-3 min-w-0">
        <!-- 3D Avatar -->
        <div class="w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-neutral-900 border border-default shrink-0 overflow-hidden relative">
          <NuxtImg
            v-if="unit?.icon && getRobloxImageUrl(unit.icon)"
            :src="getRobloxImageUrl(unit.icon)!"
            class="w-full h-full object-cover"
            alt="Unit portrait"
            loading="lazy"
            :unoptimized="getRobloxImageUrl(unit.icon)?.startsWith('/api')"
          />
          <div v-else class="w-full h-full flex items-center justify-center text-muted">
            <UIcon name="i-lucide-user" class="w-6 h-6" />
          </div>
        </div>

        <!-- Meta -->
        <div class="min-w-0">
          <div class="flex items-center gap-1.5 flex-wrap">
            <UBadge
              v-if="unit?.rarity"
              :color="getRarityColor(unit.rarity)"
              variant="subtle"
              size="xs"
            >
              {{ unit.rarity }}
            </UBadge>

            <div
              v-if="unit?.element && unit.element !== 'None'"
              class="px-1.5 py-0.5 rounded text-[10px] font-bold border flex items-center gap-1"
              :class="[getElementConfig(unit.element).bg, getElementConfig(unit.element).color, getElementConfig(unit.element).border]"
            >
              <UIcon :name="getElementConfig(unit.element).uiIcon" class="w-3 h-3" />
              <span>{{ unit.element }}</span>
            </div>
          </div>

          <h2 class="text-sm sm:text-base font-bold text-white truncate mt-1">
            {{ unit?.displayName || unit?.name || 'Select Unit' }}
          </h2>

          <div class="text-xs text-muted truncate">
            {{ unit?.series || 'Other' }}
            <span v-if="unit?.skillMode">• {{ unit.skillMode }}</span>
          </div>
        </div>
      </div>

      <!-- Change Unit Button -->
      <UButton
        icon="i-lucide-arrow-left-right"
        label="Change"
        size="xs"
        variant="outline"
        color="primary"
        class="shrink-0"
        @click="$emit('open-picker')"
      />
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { getRobloxImageUrl, getElementConfig } from '~/utils/formatters'

defineProps<{
  unit: any
}>()

defineEmits<{
  (e: 'open-picker'): void
}>()

function getRarityColor(rarity?: string): any {
  if (!rarity) return 'neutral'
  const r = rarity.toLowerCase()
  if (r.includes('secret') || r.includes('mythic')) return 'error'
  if (r.includes('celestial') || r.includes('mysterious') || r.includes('exclusive')) return 'primary'
  if (r.includes('legendary')) return 'warning'
  if (r.includes('epic')) return 'secondary'
  if (r.includes('rare')) return 'info'
  return 'neutral'
}
</script>

