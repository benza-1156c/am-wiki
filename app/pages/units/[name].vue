<template>
  <div class="space-y-6">
    <!-- Loading State -->
    <div v-if="store.pending" class="flex flex-col items-center justify-center min-h-[40vh] space-y-3">
      <UIcon name="i-lucide-loader-2" class="w-8 h-8 animate-spin text-primary" />
      <p class="text-xs text-muted font-medium">Loading Unit Data...</p>
    </div>

    <!-- Error State -->
    <UAlert
      v-else-if="store.error"
      color="error"
      variant="subtle"
      icon="i-lucide-alert-triangle"
      :title="'Failed to load database: ' + store.error.message"
    >
      <template #description>
        <UButton
          label="Retry Loading"
          color="error"
          variant="solid"
          size="xs"
          class="mt-2"
          @click="store.refresh()"
        />
      </template>
    </UAlert>

    <!-- Unit Not Found State -->
    <div
      v-else-if="!targetUnit"
      class="flex flex-col items-center justify-center min-h-[40vh] p-8 rounded-xl border border-white/5 bg-[#0f172a]/60 backdrop-blur-sm text-center space-y-4 max-w-lg mx-auto"
    >
      <div class="w-12 h-12 rounded-xl bg-error/10 border border-error/20 flex items-center justify-center text-error">
        <UIcon name="i-lucide-search-x" class="w-6 h-6" />
      </div>
      <div>
        <h2 class="text-lg font-bold text-white">Unit Not Found</h2>
        <p class="text-xs text-muted mt-1">
          Could not find any unit matching "{{ route.params.name }}". Check the name or select from the database list.
        </p>
      </div>
      <div class="flex items-center gap-2">
        <UButton
          icon="i-lucide-arrow-left-right"
          label="Select Another Unit"
          variant="solid"
          color="primary"
          size="sm"
          @click="store.isSelectorOpen = true"
        />
        <NuxtLink to="/">
          <UButton
            icon="i-lucide-arrow-left"
            label="All Units Wiki"
            variant="ghost"
            color="neutral"
            size="sm"
          />
        </NuxtLink>
      </div>
    </div>

    <!-- Main Unit Calculator View -->
    <div v-else class="space-y-6">
      <!-- Top Active Unit Bar & Switcher -->
      <div class="p-4 rounded-xl border border-white/5 bg-[#0f172a]/60 backdrop-blur-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div class="flex items-center gap-3.5">
          <!-- Unit Avatar -->
          <div class="w-11 h-11 rounded-lg bg-neutral-900 border border-white/10 flex items-center justify-center text-primary shrink-0 overflow-hidden">
            <NuxtImg
              v-if="store.currentUnit?.icon && getRobloxImageUrl(store.currentUnit.icon)"
              :src="getRobloxImageUrl(store.currentUnit.icon)!"
              class="w-full h-full object-cover"
              alt="Unit Avatar"
              loading="lazy"
              :unoptimized="getRobloxImageUrl(store.currentUnit.icon)?.startsWith('/api')"
            />
            <UIcon v-else name="i-lucide-user" class="w-5 h-5 text-neutral-300" />
          </div>

          <!-- Unit Identity & Meta -->
          <div>
            <div class="flex flex-wrap items-center gap-2">
              <h1 class="text-base sm:text-lg font-bold text-white tracking-tight">
                {{ store.currentUnit?.displayName || store.currentUnit?.name || 'Unit' }}
              </h1>
              <UBadge
                v-if="store.currentUnit?.rarity"
                :color="getRarityColor(store.currentUnit.rarity)"
                variant="subtle"
                size="xs"
              >
                {{ store.currentUnit.rarity }}
              </UBadge>
              <UBadge
                v-if="store.currentUnit?.element"
                color="neutral"
                variant="outline"
                size="xs"
              >
                {{ store.currentUnit.element }}
              </UBadge>
            </div>

            <div class="flex items-center gap-2 text-xs text-muted mt-0.5">
              <span v-if="store.currentUnit?.series" class="font-medium text-neutral-300">
                {{ store.currentUnit.series }}
              </span>
              <span v-if="store.currentUnit?.series && store.currentUnit?.skillMode">•</span>
              <span v-if="store.currentUnit?.skillMode">
                {{ store.currentUnit.skillMode }}
              </span>
              <span>•</span>
              <span class="font-mono text-neutral-300">Cost: ¥{{ store.calculatedStats.cost }}</span>
            </div>
          </div>
        </div>

        <!-- Switch Unit Action & Share Button -->
        <div class="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <NuxtLink to="/">
            <UButton
              icon="i-lucide-grid"
              label="All Units"
              variant="ghost"
              color="neutral"
              size="sm"
            />
          </NuxtLink>
          <UButton
            icon="i-lucide-share-2"
            label="Share Build"
            variant="soft"
            color="primary"
            size="sm"
            @click="handleShare"
          />
          <UButton
            icon="i-lucide-arrow-left-right"
            label="Switch Unit"
            variant="outline"
            color="primary"
            size="sm"
            @click="store.isSelectorOpen = true"
          />
        </div>
      </div>

      <!-- Main Layout: 3 Columns on XL/wide screens, 2 Columns on LG, 1 Column on Mobile -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <!-- Left Column: Controls (Stars, Level & Upgrade, Trait) -->
        <div class="lg:col-span-5 xl:col-span-3 space-y-4">
          <UnitAwakeningStars />
          <UnitLevelSlider />
          <UnitTraitSelector />
        </div>

        <!-- Center Column: Equipped Gears (Spacious 4 Slots) -->
        <div class="lg:col-span-7 xl:col-span-5 space-y-4">
          <UnitGearSelector />
        </div>

        <!-- Right Column: Combat Statistics & Passive / Ultimate Abilities (Sticky on XL) -->
        <div class="lg:col-span-12 xl:col-span-4 space-y-4 xl:sticky xl:top-20">
          <UnitStatsGrid />
          <UnitSkillCard />
        </div>
      </div>

      <UnitSelector />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { findUnitByParam } from '~/utils/unitSlug'

const route = useRoute()
const router = useRouter()
const toast = useToast()

const { data: dbData } = await useFetch<any>('/api/database', {
  key: 'am-db-data',
  default: () => null
})

const store = useCombatCalculatorStore()

if (dbData.value?.units) {
  const initialFound = findUnitByParam(dbData.value.units, route.params.name as string)
  if (initialFound) {
    store.setUnit(initialFound.id)
    if (route.query && Object.keys(route.query).length > 0) {
      store.initFromQuery(route.query)
    }
  }
}

useUnitSeo(store)

const targetUnit = computed(() => {
  return findUnitByParam(store.units, route.params.name)
})

watch(
  [() => store.units, () => route.params.name],
  ([unitsList, paramName]) => {
    if (!unitsList || unitsList.length === 0 || !paramName) return
    const found = findUnitByParam(unitsList, paramName as string)
    if (found) {
      if (store.selectedUnitId !== found.id) {
        store.setUnit(found.id)
      }
      if (route.query && Object.keys(route.query).length > 0) {
        store.initFromQuery(route.query)
      }
    }
  },
  { immediate: true }
)

let syncTimer: any = null
watch(
  () => store.buildQueryParams,
  (newQuery) => {
    if (import.meta.server) return
    clearTimeout(syncTimer)
    syncTimer = setTimeout(() => {
      const cleanQuery = { ...newQuery }
      delete cleanQuery.unit

      const currentQuery = route.query
      const isDifferent =
        Object.keys(cleanQuery).some(k => cleanQuery[k] !== currentQuery[k]) ||
        Object.keys(currentQuery).some(k => currentQuery[k] !== cleanQuery[k] && k !== 'unit')

      if (isDifferent) {
        router.replace({ path: route.path, query: cleanQuery })
      }
    }, 200)
  },
  { deep: true }
)

async function handleShare() {
  const url = import.meta.client ? window.location.href : ''
  const unitTitle = `${store.currentUnit?.displayName || store.currentUnit?.name || 'Unit'} (${store.selectedStars}★ Lv.${store.unitLevel})`

  if (import.meta.client && navigator.share) {
    try {
      await navigator.share({
        title: `${unitTitle} Build - Anime Mysterious`,
        text: `Check out this ${unitTitle} build on Anime Mysterious Calculator!`,
        url
      })
      return
    } catch {
    }
  }

  if (import.meta.client && navigator.clipboard) {
    await navigator.clipboard.writeText(url)
    toast.add({
      title: 'Link Copied!',
      description: 'Build link copied to clipboard. Share it with your friends!',
      color: 'success',
      icon: 'i-lucide-check-circle'
    })
  }
}

function getRarityColor(rarity?: string): any {
  switch (rarity) {
    case 'Secret': return 'error'
    case 'Mythic': return 'error'
    case 'Legendary': return 'warning'
    case 'Epic': return 'secondary'
    case 'Rare': return 'info'
    default: return 'neutral'
  }
}
</script>

