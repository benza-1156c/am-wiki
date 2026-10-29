<template>
  <NuxtLink
    :to="'/units/' + toUnitSlug(unit)"
    class="group p-3 rounded-xl border border-white/10 bg-[#0f172a]/70 hover:bg-[#0f172a] hover:border-primary/50 transition-all duration-200 flex flex-col gap-2.5 shadow-lg hover:shadow-primary/10 relative overflow-hidden"
  >
    <!-- Top subtle glow on hover -->
    <div class="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

    <!-- 3D Avatar Image Frame -->
    <div class="w-full aspect-square rounded-lg bg-neutral-900 border border-white/10 overflow-hidden relative shrink-0">
      <NuxtImg
        v-if="unit.icon && getRobloxImageUrl(unit.icon)"
        :src="getRobloxImageUrl(unit.icon)!"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        alt="Unit portrait"
        loading="lazy"
        :unoptimized="getRobloxImageUrl(unit.icon)?.startsWith('/api')"
      />
      <div v-else class="w-full h-full flex items-center justify-center">
        <UIcon name="i-lucide-user" class="w-8 h-8 text-neutral-500" />
      </div>

      <!-- Floating Rarity Badge -->
      <UBadge
        v-if="unit.rarity"
        :color="getRarityColor(unit.rarity)"
        variant="subtle"
        size="xs"
        class="absolute top-1.5 left-1.5"
      >
        {{ unit.rarity }}
      </UBadge>

      <!-- Floating Element Pill -->
      <div
        v-if="unit.element && unit.element !== 'None'"
        class="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded text-[10px] font-bold border flex items-center gap-1 shadow-sm"
        :class="[getElementConfig(unit.element).bg, getElementConfig(unit.element).color, getElementConfig(unit.element).border]"
      >
        <UIcon :name="getElementConfig(unit.element).uiIcon" class="w-3 h-3" />
        <span>{{ unit.element }}</span>
      </div>
    </div>

    <!-- Identity & Series -->
    <div class="min-w-0">
      <div class="font-bold text-xs sm:text-sm text-white truncate group-hover:text-primary transition-colors">
        {{ unit.displayName || unit.name }}
      </div>
      <div class="text-[11px] text-neutral-400 truncate font-mono">
        {{ getSeriesName(unit.series) }}
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import { toUnitSlug } from '~/utils/unitSlug'
import {
  getRobloxImageUrl,
  getRarityColor,
  getElementConfig,
  getSeriesName
} from '~/utils/formatters'

defineProps<{
  unit: any
}>()
</script>
