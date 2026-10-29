<template>
  <UModal
    v-model:open="store.isSelectorOpen"
    title="Select Unit"
    :description="`Choose from ${unitList.length} units in the database`"
  >
    <template #body>
      <div class="space-y-4">
        <UInput
          v-model="searchQuery"
          placeholder="Search unit by name, series, rarity, or element..."
          icon="i-lucide-search"
          size="md"
          autofocus
        />

        <div class="max-h-[60vh] overflow-y-auto space-y-1 pr-1 border border-default rounded-md p-1.5">
          <div
            v-for="u in filteredUnits"
            :key="u.id"
            class="cursor-pointer p-2.5 rounded text-xs flex items-center justify-between transition-colors"
            :class="store.selectedUnitId === u.id ? 'bg-primary/10 font-bold text-primary' : 'hover:bg-muted/50'"
            @click="selectUnit(u.id)"
          >
            <div class="flex items-center gap-2.5 truncate">
              <NuxtImg
                v-if="u.icon && getRobloxImageUrl(u.icon)"
                :src="getRobloxImageUrl(u.icon)!"
                class="w-6 h-6 rounded object-cover bg-black/40 border border-white/10 shrink-0"
                alt="Unit"
                loading="lazy"
                width="24"
                height="24"
                :unoptimized="getRobloxImageUrl(u.icon)?.startsWith('/api')"
              />
              <span class="text-sm font-semibold">{{ u.displayName || u.name }}</span>
              <span class="text-[11px] text-muted">{{ u.series }}</span>
            </div>
            <div class="flex items-center gap-1.5">
              <UBadge
                v-if="u.rarity"
                :color="getRarityColor(u.rarity)"
                variant="subtle"
                size="xs"
              >
                {{ u.rarity }}
              </UBadge>
              <UBadge
                v-if="u.element"
                :color="getElementColor(u.element)"
                variant="subtle"
                size="xs"
              >
                {{ u.element }}
              </UBadge>
            </div>
          </div>
        </div>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { toUnitSlug } from '~/utils/unitSlug'

const store = useCombatCalculatorStore()
const router = useRouter()
const route = useRoute()

const searchQuery = ref('')
const unitList = computed(() => store.units || [])

const filteredUnits = computed(() => {
  const q = searchQuery.value.toLowerCase().trim()
  if (!q) return unitList.value
  return unitList.value.filter((u: any) =>
    (u.name || '').toLowerCase().includes(q) ||
    (u.displayName || '').toLowerCase().includes(q) ||
    (u.series || '').toLowerCase().includes(q) ||
    (u.rarity || '').toLowerCase().includes(q) ||
    (u.element || '').toLowerCase().includes(q)
  )
})

function selectUnit(id: string) {
  store.setUnit(id)
  store.isSelectorOpen = false

  const target = unitList.value.find((u: any) => u.id === id)
  if (target) {
    const slug = toUnitSlug(target)
    router.push({ path: `/units/${slug}` })
  }
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

function getElementColor(element?: string): any {
  if (!element) return 'neutral'
  const e = element.toLowerCase()
  if (e.includes('fire')) return 'error'
  if (e.includes('water')) return 'info'
  if (e.includes('flora') || e.includes('nature') || e.includes('wind')) return 'success'
  if (e.includes('lumin') || e.includes('thunder')) return 'warning'
  if (e.includes('abyss') || e.includes('noctis') || e.includes('moon') || e.includes('dimen') || e.includes('riddle')) return 'secondary'
  if (e.includes('flux') || e.includes('vox') || e.includes('cosmic') || e.includes('reality')) return 'primary'
  return 'neutral'
}
</script>
