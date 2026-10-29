<template>
  <UModal
    v-model:open="isOpen"
    :title="title || 'Select Unit to Compare'"
    :description="`Choose from ${units?.length || 0} characters in the database`"
  >
    <template #body>
      <div class="space-y-3">
        <!-- Search Bar -->
        <UInput
          v-model="searchQuery"
          icon="i-lucide-search"
          placeholder="Search by character name or series..."
          class="w-full"
          size="md"
          autofocus
        />

        <!-- Filter Chips (Rarities) -->
        <div class="flex flex-wrap gap-1">
          <UButton
            v-for="r in rarities"
            :key="r"
            :label="r"
            :variant="selectedRarity === r ? 'solid' : 'ghost'"
            :color="selectedRarity === r ? 'primary' : 'neutral'"
            size="xs"
            @click="selectedRarity = r"
          />
        </div>

        <!-- Unit List -->
        <div class="max-h-[55vh] overflow-y-auto space-y-1 pr-1 border border-default rounded-md p-1.5">
          <div
            v-if="filteredUnits.length === 0"
            class="text-center py-10 text-muted text-xs flex flex-col items-center gap-2"
          >
            <UIcon name="i-lucide-search-x" class="w-8 h-8 text-neutral-600" />
            <span>No units found matching "{{ searchQuery }}"</span>
          </div>

          <div
            v-for="u in filteredUnits"
            :key="u.id"
            class="cursor-pointer p-2 rounded text-xs flex items-center justify-between transition-colors hover:bg-muted/50 group"
            @click="selectUnit(u)"
          >
            <div class="flex items-center gap-2.5 min-w-0">
              <!-- Avatar -->
              <div class="w-9 h-9 rounded bg-neutral-900 border border-default shrink-0 overflow-hidden relative">
                <NuxtImg
                  v-if="u.icon && getRobloxImageUrl(u.icon)"
                  :src="getRobloxImageUrl(u.icon)!"
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  alt="Unit icon"
                  loading="lazy"
                  :unoptimized="getRobloxImageUrl(u.icon)?.startsWith('/api')"
                />
                <UIcon v-else name="i-lucide-user" class="w-5 h-5 text-neutral-600 m-auto" />
              </div>

              <!-- Info -->
              <div class="min-w-0">
                <div class="font-bold text-xs sm:text-sm text-white truncate group-hover:text-primary transition-colors">
                  {{ u.displayName || u.name }}
                </div>
                <div class="flex items-center gap-1.5 text-[10px] text-muted">
                  <span class="truncate">{{ u.series || 'Other' }}</span>
                  <span v-if="u.element">•</span>
                  <span v-if="u.element" :class="getElementColorClass(u.element)">{{ u.element }}</span>
                </div>
              </div>
            </div>

            <!-- Rarity Badge -->
            <UBadge
              v-if="u.rarity"
              :color="getRarityColor(u.rarity)"
              variant="subtle"
              size="xs"
              class="shrink-0"
            >
              {{ u.rarity }}
            </UBadge>
          </div>
        </div>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { getRobloxImageUrl } from '~/utils/formatters'

const props = defineProps<{
  units: any[]
  title?: string
}>()

const emit = defineEmits<{
  (e: 'select', unit: any): void
}>()

const isOpen = defineModel<boolean>('open', { default: false })
const searchQuery = ref('')
const selectedRarity = ref('All')

const rarities = ['All', 'Secret', 'Celestial', 'Mythic', 'Legendary', 'Epic']

const RARITY_WEIGHT: Record<string, number> = {
  Exclusive: 10,
  Secret: 9,
  Celestial: 9,
  Mysterious: 9,
  Mythic: 8,
  Legendary: 7,
  Epic: 6,
  Rare: 5,
  Uncommon: 4,
  Common: 3
}

function getRarityWeight(rarity?: string): number {
  if (!rarity) return 0
  return RARITY_WEIGHT[rarity.trim()] || 0
}

const filteredUnits = computed(() => {
  const q = searchQuery.value.toLowerCase().trim()
  const r = selectedRarity.value

  const matched = (props.units || []).filter((u: any) => {
    const matchesSearch =
      !q ||
      (u.name || '').toLowerCase().includes(q) ||
      (u.displayName || '').toLowerCase().includes(q) ||
      (u.series || '').toLowerCase().includes(q)

    const matchesRarity =
      r === 'All' ||
      (u.rarity || '').toLowerCase() === r.toLowerCase()

    return matchesSearch && matchesRarity
  })

  return [...matched].sort((a: any, b: any) => {
    const wDiff = getRarityWeight(b.rarity) - getRarityWeight(a.rarity)
    if (wDiff !== 0) return wDiff
    return (a.displayName || a.name || '').localeCompare(b.displayName || b.name || '')
  })
})

function selectUnit(unit: any) {
  emit('select', unit)
  isOpen.value = false
  searchQuery.value = ''
}

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

function getElementColorClass(element?: string): string {
  if (!element) return 'text-neutral-400'
  const e = element.toLowerCase()
  if (e.includes('fire')) return 'text-orange-400'
  if (e.includes('water')) return 'text-cyan-400'
  if (e.includes('flora') || e.includes('nature') || e.includes('wind')) return 'text-emerald-400'
  if (e.includes('lumin') || e.includes('thunder')) return 'text-amber-400'
  if (e.includes('noctis') || e.includes('abyss') || e.includes('dark')) return 'text-indigo-400'
  if (e.includes('cosmic')) return 'text-violet-400'
  return 'text-neutral-400'
}
</script>
