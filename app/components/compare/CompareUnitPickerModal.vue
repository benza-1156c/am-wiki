<template>
  <UModal v-model:open="isOpen">
    <template #content>
      <div class="p-4 sm:p-5 flex flex-col max-h-[85vh] bg-[#0c1220] rounded-xl border border-white/10 text-slate-100">
        <!-- Header -->
        <div class="flex items-center justify-between pb-3 border-b border-white/10">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <UIcon name="i-lucide-swords" class="w-4 h-4" />
            </div>
            <div>
              <h3 class="font-bold text-sm text-white">{{ title || 'Select Unit to Compare' }}</h3>
              <p class="text-[11px] text-neutral-400">Choose any character from the database</p>
            </div>
          </div>
          <UButton
            icon="i-lucide-x"
            variant="ghost"
            color="neutral"
            size="xs"
            @click="isOpen = false"
          />
        </div>

        <!-- Search Bar -->
        <div class="py-3">
          <UInput
            v-model="searchQuery"
            icon="i-lucide-search"
            placeholder="Search by character name or series..."
            class="w-full"
            size="sm"
            autofocus
          />
        </div>

        <!-- Filter Chips (Rarities) -->
        <div class="flex flex-wrap gap-1.5 pb-3 border-b border-white/5">
          <button
            v-for="r in rarities"
            :key="r"
            class="px-2 py-0.5 rounded text-[11px] font-medium transition-colors"
            :class="selectedRarity === r ? 'bg-primary text-black font-semibold' : 'bg-white/5 text-neutral-400 hover:bg-white/10 hover:text-white'"
            @click="selectedRarity = r"
          >
            {{ r }}
          </button>
        </div>

        <!-- Unit List (Scrollable Grid) -->
        <div class="flex-1 overflow-y-auto pt-3 pr-1 space-y-1.5 min-h-[300px]">
          <div
            v-if="filteredUnits.length === 0"
            class="text-center py-10 text-neutral-500 text-xs flex flex-col items-center gap-2"
          >
            <UIcon name="i-lucide-search-x" class="w-8 h-8 text-neutral-600" />
            <span>No units found matching "{{ searchQuery }}"</span>
          </div>

          <div
            v-for="u in filteredUnits"
            :key="u.id"
            class="flex items-center justify-between p-2 rounded-lg border border-white/5 bg-[#0f172a]/60 hover:bg-primary/10 hover:border-primary/40 cursor-pointer transition-all duration-150 group"
            @click="selectUnit(u)"
          >
            <div class="flex items-center gap-2.5 min-w-0">
              <!-- Avatar -->
              <div class="w-10 h-10 rounded-lg bg-neutral-900 border border-white/10 shrink-0 overflow-hidden relative">
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
                <div class="flex items-center gap-1.5 text-[10px] text-neutral-400">
                  <span class="truncate">{{ u.series || 'Other' }}</span>
                  <span v-if="u.element" class="text-neutral-500">•</span>
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

const filteredUnits = computed(() => {
  const q = searchQuery.value.toLowerCase().trim()
  const r = selectedRarity.value

  return (props.units || []).filter((u: any) => {
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
