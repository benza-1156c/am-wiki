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
              <span class="text-sm font-semibold">{{ u.displayName || u.name }}</span>
              <span class="text-[11px] text-muted">{{ u.series }}</span>
            </div>
            <div class="flex items-center gap-1.5">
              <UBadge color="neutral" variant="subtle" size="xs">{{ u.rarity }}</UBadge>
              <UBadge color="primary" variant="subtle" size="xs">{{ u.element }}</UBadge>
            </div>
          </div>
        </div>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
const store = useCombatCalculatorStore()

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
}
</script>
