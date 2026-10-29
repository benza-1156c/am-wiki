<template>
  <div class="p-4 rounded-xl border border-white/10 bg-[#0d1322]/80 backdrop-blur-md space-y-3.5">
    <!-- Top Toolbar Row: Search, Series Filter, Sort Selector -->
    <div class="grid grid-cols-1 sm:grid-cols-12 gap-3">
      <!-- Search Input -->
      <div class="sm:col-span-5 md:col-span-6">
        <UInput
          :model-value="searchQuery"
          icon="i-lucide-search"
          placeholder="Search by name, display name, ID, or anime series..."
          size="sm"
          class="w-full font-mono text-xs"
          @update:model-value="$emit('update:searchQuery', $event)"
        >
          <template v-if="searchQuery" #trailing>
            <UButton
              icon="i-lucide-x"
              color="neutral"
              variant="ghost"
              size="xs"
              class="p-0.5 text-neutral-400 hover:text-white"
              @click="$emit('update:searchQuery', '')"
            />
          </template>
        </UInput>
      </div>

      <!-- Series Selector -->
      <div class="sm:col-span-4 md:col-span-3">
        <USelectMenu
          :model-value="selectedSeries"
          :items="seriesOptions"
          value-key="value"
          label-key="label"
          size="sm"
          class="w-full font-mono text-xs"
          placeholder="Filter by Series"
          @update:model-value="$emit('update:selectedSeries', $event)"
        />
      </div>

      <!-- Sort Selector -->
      <div class="sm:col-span-3 md:col-span-3">
        <USelectMenu
          :model-value="sortBy"
          :items="sortOptions"
          value-key="value"
          label-key="label"
          size="sm"
          class="w-full font-mono text-xs"
          @update:model-value="$emit('update:sortBy', $event)"
        />
      </div>
    </div>

    <!-- Filter Pills: Rarity and Elements -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-white/5">
      <!-- Rarity Filter Pills -->
      <div class="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
        <span class="text-[11px] font-bold text-neutral-400 uppercase tracking-wider shrink-0 mr-1">Rarity:</span>
        <button
          v-for="r in rarityPills"
          :key="r"
          type="button"
          class="px-2.5 py-1 rounded-md text-xs font-medium transition-all shrink-0 cursor-pointer"
          :class="selectedRarity === r ? 'bg-primary text-black font-bold shadow-sm' : 'bg-black/40 text-neutral-300 hover:bg-neutral-800 border border-white/10'"
          @click="$emit('update:selectedRarity', r)"
        >
          {{ r }}
        </button>
      </div>

      <!-- Element Selector Pills -->
      <div class="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
        <span class="text-[11px] font-bold text-neutral-400 uppercase tracking-wider shrink-0 mr-1">Element:</span>
        <button
          v-for="el in elementPills"
          :key="el"
          type="button"
          class="px-2.5 py-1 rounded-md text-xs font-medium transition-all shrink-0 cursor-pointer"
          :class="selectedElement === el ? 'bg-cyan-500 text-black font-bold shadow-sm' : 'bg-black/40 text-neutral-300 hover:bg-neutral-800 border border-white/10'"
          @click="$emit('update:selectedElement', el)"
        >
          {{ el }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  searchQuery: string
  selectedRarity: string
  selectedElement: string
  selectedSeries: string
  sortBy: string
  seriesOptions: Array<{ label: string; value: string }>
  sortOptions: Array<{ label: string; value: string }>
  rarityPills: string[]
  elementPills: string[]
}>()

defineEmits<{
  (e: 'update:searchQuery', val: string): void
  (e: 'update:selectedRarity', val: string): void
  (e: 'update:selectedElement', val: string): void
  (e: 'update:selectedSeries', val: string): void
  (e: 'update:sortBy', val: string): void
}>()
</script>
