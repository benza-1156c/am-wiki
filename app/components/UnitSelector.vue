<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between">
        <span class="text-sm font-bold flex items-center gap-1.5">
          <UIcon name="i-lucide-user" />
          <span>Select Unit</span>
        </span>
        <UBadge color="neutral" variant="subtle" size="xs">{{ units.length }} units</UBadge>
      </div>
    </template>

    <div class="space-y-3">
      <UInput
        v-model="searchQuery"
        placeholder="Search unit by name or series..."
        icon="i-lucide-search"
        size="sm"
      />

      <div class="max-h-52 overflow-y-auto space-y-1 pr-1 border border-default rounded-md p-1">
        <div
          v-for="u in filteredUnits"
          :key="u.id"
          class="cursor-pointer p-2 rounded text-xs flex items-center justify-between transition-colors"
          :class="modelValue === u.id ? 'bg-primary/10 font-bold text-primary' : 'hover:bg-muted/50'"
          @click="selectUnit(u.id)"
        >
          <div class="flex items-center gap-2 truncate">
            <span>{{ u.displayName || u.name }}</span>
            <span class="text-[10px] text-muted">({{ u.name }})</span>
          </div>
          <UBadge color="neutral" variant="subtle" size="xs">{{ u.rarity }}</UBadge>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { NormalizedUnit } from '~/types/unit'

const props = defineProps<{
  units: NormalizedUnit[]
  modelValue: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: string): void
}>()

const searchQuery = ref('')

const filteredUnits = computed(() => {
  if (!searchQuery.value.trim()) return props.units.slice(0, 30)
  const q = searchQuery.value.toLowerCase()
  return props.units.filter(u =>
    (u.name && u.name.toLowerCase().includes(q)) ||
    (u.displayName && u.displayName.toLowerCase().includes(q)) ||
    (u.series && u.series.toLowerCase().includes(q))
  ).slice(0, 30)
})

function selectUnit(id: string) {
  emit('update:modelValue', id)
}
</script>

