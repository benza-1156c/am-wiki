<template>
  <UModal
    v-model:open="isOpen"
    title="Select Unit"
    :description="`Choose from ${units.length} units in the database`"
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
            :class="modelValue === u.id ? 'bg-primary/10 font-bold text-primary' : 'hover:bg-muted/50'"
            @click="selectUnit(u.id)"
          >
            <div class="flex items-center gap-2.5 truncate">
              <span class="text-sm font-semibold">{{ u.displayName || u.name }}</span>
              <span class="text-[11px] text-muted">({{ u.series }})</span>
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
import type { NormalizedUnit } from '~/types/unit'

const props = defineProps<{
  units: NormalizedUnit[]
  modelValue: string
  open: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: string): void
  (e: 'update:open', val: boolean): void
}>()

const isOpen = computed({
  get: () => props.open,
  set: (val) => emit('update:open', val)
})

const searchQuery = ref('')

const filteredUnits = computed(() => {
  if (!searchQuery.value.trim()) return props.units
  const q = searchQuery.value.toLowerCase()
  return props.units.filter(u =>
    (u.name && u.name.toLowerCase().includes(q)) ||
    (u.displayName && u.displayName.toLowerCase().includes(q)) ||
    (u.series && u.series.toLowerCase().includes(q)) ||
    (u.rarity && u.rarity.toLowerCase().includes(q)) ||
    (u.element && u.element.toLowerCase().includes(q))
  )
})

function selectUnit(id: string) {
  emit('update:modelValue', id)
  isOpen.value = false
}
</script>
