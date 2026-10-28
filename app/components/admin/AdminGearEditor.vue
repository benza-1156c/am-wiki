<template>
  <div class="space-y-6">
    <!-- Top Selector Bar -->
    <UCard>
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div class="flex-1 max-w-md">
          <label class="block text-xs font-bold text-neutral-300 mb-1.5">Select Gear to Edit</label>
          <USelectMenu
            v-model="selectedGearIndex"
            :items="gearOptions"
            value-key="value"
            label-key="label"
            placeholder="Search gear by name, slot, rarity..."
            size="sm"
            class="w-full font-mono font-medium"
            :search-input="{ placeholder: 'Search gear...' }"
          />
        </div>

        <div class="flex items-center gap-2 self-start sm:self-end">
          <UButton
            icon="i-lucide-plus"
            label="New Gear"
            variant="outline"
            color="primary"
            size="sm"
            @click="createNewGear"
          />
          <UButton
            v-if="editingGear"
            icon="i-lucide-save"
            label="Save Gear"
            color="primary"
            variant="solid"
            size="sm"
            :loading="isSaving"
            @click="saveGear"
          />
          <UButton
            v-if="editingGear && !isNewGear"
            icon="i-lucide-trash-2"
            label="Delete"
            color="error"
            variant="ghost"
            size="sm"
            :loading="isDeleting"
            @click="deleteGear"
          />
        </div>
      </div>
    </UCard>

    <!-- Feedback Message -->
    <UAlert
      v-if="statusMsg"
      :color="statusType === 'success' ? 'success' : 'error'"
      variant="subtle"
      :icon="statusType === 'success' ? 'i-lucide-check-circle-2' : 'i-lucide-alert-triangle'"
      :title="statusMsg"
      close
      @update:open="statusMsg = ''"
    />

    <!-- Editor Form -->
    <div v-if="editingGear" class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <!-- Left Column: Basic Information -->
      <div class="lg:col-span-6 space-y-5">
        <UCard>
          <template #header>
            <span class="text-sm font-bold flex items-center gap-1.5">
              <UIcon name="i-lucide-shield" class="text-primary" />
              <span>Gear Identity & Slot</span>
            </span>
          </template>

          <div class="space-y-4">
            <div>
              <label class="block text-xs font-medium text-neutral-300 mb-1">Gear Name</label>
              <UInput v-model="editingGear.Name" placeholder="e.g. Dagger Fang" size="sm" />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-medium text-neutral-300 mb-1">Slot</label>
                <USelect
                  v-model="editingGear.Slot"
                  :items="['Head', 'Body', 'Arm', 'Legs']"
                  size="sm"
                />
              </div>

              <div>
                <label class="block text-xs font-medium text-neutral-300 mb-1">Rarity</label>
                <USelect
                  v-model="editingGear.Rarity"
                  :items="['Secret', 'Mythic', 'Legendary', 'Epic', 'Rare', 'Exclusive']"
                  size="sm"
                />
              </div>
            </div>

            <div>
              <label class="block text-xs font-medium text-neutral-300 mb-1">Icon Asset ID</label>
              <UInput v-model="editingGear.Icon" placeholder="e.g. rbxassetid://106082101923697" size="sm" class="font-mono text-xs" />
            </div>

            <div>
              <label class="block text-xs font-medium text-neutral-300 mb-1">In-Game Description</label>
              <UTextarea
                v-model="editingGear.Description"
                placeholder="+17% ArmorPen&#10;+4% LifeSteal&#10;-3.5% SPA"
                :rows="4"
                size="sm"
                class="font-mono text-xs"
              />
            </div>
          </div>
        </UCard>
      </div>

      <!-- Right Column: Stats & Exclusive Unit Bonus -->
      <div class="lg:col-span-6 space-y-5">
        <!-- Base Numerical Stats -->
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <span class="text-sm font-bold flex items-center gap-1.5">
                <UIcon name="i-lucide-sparkles" class="text-amber-400" />
                <span>Base Stat Multipliers</span>
              </span>
              <span class="text-[11px] text-muted">0.1 = +10%</span>
            </div>
          </template>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-[11px] text-neutral-300 mb-1">Armor Penetration</label>
              <UInput v-model.number="baseStats.ArmorPen" type="number" step="0.01" size="sm" class="font-mono" placeholder="0.15" />
            </div>

            <div>
              <label class="block text-[11px] text-neutral-300 mb-1">Life Steal</label>
              <UInput v-model.number="baseStats.LifeSteal" type="number" step="0.01" size="sm" class="font-mono" placeholder="0.04" />
            </div>

            <div>
              <label class="block text-[11px] text-neutral-300 mb-1">Attack Boost (ATK)</label>
              <UInput v-model.number="baseStats.DamageBoost" type="number" step="0.01" size="sm" class="font-mono" placeholder="0.10" />
            </div>

            <div>
              <label class="block text-[11px] text-neutral-300 mb-1">SPA Reduction</label>
              <UInput v-model.number="baseStats.AttackSpeedBoost" type="number" step="0.005" size="sm" class="font-mono" placeholder="0.035" />
            </div>

            <div>
              <label class="block text-[11px] text-neutral-300 mb-1">Range Boost</label>
              <UInput v-model.number="baseStats.RangeBoost" type="number" step="0.01" size="sm" class="font-mono" placeholder="0.10" />
            </div>

            <div>
              <label class="block text-[11px] text-neutral-300 mb-1">Health Boost (HP)</label>
              <UInput v-model.number="baseStats.HealthBoost" type="number" step="0.01" size="sm" class="font-mono" placeholder="0.10" />
            </div>

            <div>
              <label class="block text-[11px] text-neutral-300 mb-1">Crit Damage Boost</label>
              <UInput v-model.number="baseStats.CritDamageBoost" type="number" step="0.01" size="sm" class="font-mono" placeholder="0.25" />
            </div>

            <div>
              <label class="block text-[11px] text-neutral-300 mb-1">Crit Chance Boost</label>
              <UInput v-model.number="baseStats.CritChanceBoost" type="number" step="0.01" size="sm" class="font-mono" placeholder="0.10" />
            </div>
          </div>
        </UCard>

        <!-- Exclusive Unit Bonus -->
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <span class="text-sm font-bold flex items-center gap-1.5 text-amber-300">
                <UIcon name="i-lucide-award" class="text-amber-400" />
                <span>Exclusive Unit Signature Bonus</span>
              </span>
              <UBadge v-if="exclusiveUnitName" color="warning" variant="subtle" size="xs">Bound to {{ exclusiveUnitName }}</UBadge>
            </div>
          </template>

          <div class="space-y-3">
            <div>
              <label class="block text-xs font-medium text-neutral-300 mb-1">Target Unit Key (Name or Code)</label>
              <UInput v-model="exclusiveUnitName" placeholder="e.g. Yuta, Goku, Gojo (leave empty if none)" size="sm" />
            </div>

            <div v-if="exclusiveUnitName" class="grid grid-cols-2 gap-3 pt-1 border-t border-default">
              <div>
                <label class="block text-[11px] text-muted mb-1">Exclusive ATK Boost</label>
                <UInput v-model.number="exclusiveStats.DamageBoost" type="number" step="0.01" size="sm" class="font-mono" placeholder="0.20" />
              </div>
              <div>
                <label class="block text-[11px] text-muted mb-1">Exclusive SPA Boost</label>
                <UInput v-model.number="exclusiveStats.AttackSpeedBoost" type="number" step="0.005" size="sm" class="font-mono" placeholder="0.05" />
              </div>
              <div>
                <label class="block text-[11px] text-muted mb-1">Exclusive Range Boost</label>
                <UInput v-model.number="exclusiveStats.RangeBoost" type="number" step="0.01" size="sm" class="font-mono" placeholder="0.15" />
              </div>
              <div>
                <label class="block text-[11px] text-muted mb-1">Exclusive ArmorPen</label>
                <UInput v-model.number="exclusiveStats.ArmorPen" type="number" step="0.01" size="sm" class="font-mono" placeholder="0.10" />
              </div>
            </div>
          </div>
        </UCard>

        <!-- Save Button -->
        <UButton
          icon="i-lucide-save"
          label="Save Gear"
          color="primary"
          variant="solid"
          block
          size="md"
          :loading="isSaving"
          @click="saveGear"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  adminKey: string
}>()

const { dbData, refresh } = useDatabase()

const selectedGearIndex = ref<number>(-1)
const editingGear = ref<any>(null)
const isNewGear = ref(false)
const isSaving = ref(false)
const isDeleting = ref(false)
const statusMsg = ref('')
const statusType = ref<'success' | 'error'>('success')

// Reactive stat maps
const baseStats = ref<Record<string, number>>({})
const exclusiveUnitName = ref<string>('')
const exclusiveStats = ref<Record<string, number>>({})

const gearList = computed(() => {
  const g = dbData.value?.gears
  return Array.isArray(g) ? g : (g ? Object.values(g) : [])
})

const gearOptions = computed(() => {
  return gearList.value.map((g: any, idx: number) => ({
    label: `${g.Name || 'Unnamed'} (${g.Slot} • ${g.Rarity})`,
    value: idx
  }))
})

watch(selectedGearIndex, (newIdx) => {
  if (newIdx < 0 || newIdx >= gearList.value.length) return
  const found = gearList.value[newIdx]
  if (found) {
    editingGear.value = JSON.parse(JSON.stringify(found))
    isNewGear.value = false
    statusMsg.value = ''

    // Parse baseStats vs exclusiveStats
    baseStats.value = {}
    exclusiveUnitName.value = ''
    exclusiveStats.value = {}

    if (editingGear.value.Stats && typeof editingGear.value.Stats === 'object') {
      for (const [k, v] of Object.entries(editingGear.value.Stats)) {
        if (typeof v === 'number') {
          baseStats.value[k] = v
        } else if (typeof v === 'object' && v !== null) {
          exclusiveUnitName.value = k
          exclusiveStats.value = { ...(v as Record<string, number>) }
        }
      }
    }
  }
})

onMounted(() => {
  if (gearList.value.length > 0 && selectedGearIndex.value === -1) {
    selectedGearIndex.value = 0
  }
})

function createNewGear() {
  selectedGearIndex.value = -1
  isNewGear.value = true
  editingGear.value = {
    Type: 'Gear',
    Name: 'New Gear',
    Slot: 'Head',
    Rarity: 'Mythic',
    Stats: {},
    Icon: '',
    Description: ''
  }
  baseStats.value = {}
  exclusiveUnitName.value = ''
  exclusiveStats.value = {}
  statusMsg.value = 'Initialized new gear template. Configure fields and click "Save Gear".'
  statusType.value = 'success'
}

async function saveGear() {
  if (!editingGear.value) return
  isSaving.value = true
  statusMsg.value = ''

  try {
    // Reassemble Stats object
    const assembledStats: Record<string, any> = {}
    for (const [k, v] of Object.entries(baseStats.value)) {
      if (typeof v === 'number' && !isNaN(v) && v !== 0) {
        assembledStats[k] = v
      }
    }

    if (exclusiveUnitName.value.trim()) {
      const cleanSub: Record<string, number> = {}
      for (const [k, v] of Object.entries(exclusiveStats.value)) {
        if (typeof v === 'number' && !isNaN(v) && v !== 0) {
          cleanSub[k] = v
        }
      }
      if (Object.keys(cleanSub).length > 0) {
        assembledStats[exclusiveUnitName.value.trim()] = cleanSub
      }
    }

    editingGear.value.Stats = assembledStats

    const res = await $fetch<{ success: boolean; message: string }>('/api/units', {
      method: 'POST',
      headers: {
        'x-admin-key': props.adminKey
      },
      body: {
        gear: editingGear.value,
        gearIndex: isNewGear.value ? undefined : selectedGearIndex.value
      }
    })

    statusMsg.value = res.message || 'Gear saved successfully!'
    statusType.value = 'success'
    isNewGear.value = false
    await refresh()
  } catch (err: any) {
    statusMsg.value = err.data?.statusMessage || err.statusMessage || err.message || 'Failed to save gear'
    statusType.value = 'error'
  } finally {
    isSaving.value = false
  }
}

async function deleteGear() {
  if (!editingGear.value || !confirm(`Are you sure you want to delete gear "${editingGear.value.Name}"?`)) {
    return
  }

  isDeleting.value = true
  statusMsg.value = ''

  try {
    const res = await $fetch<{ success: boolean; message: string }>('/api/units', {
      method: 'POST',
      headers: {
        'x-admin-key': props.adminKey
      },
      body: {
        deleteGearIndex: selectedGearIndex.value
      }
    })

    statusMsg.value = res.message || 'Gear deleted successfully'
    statusType.value = 'success'
    editingGear.value = null
    selectedGearIndex.value = -1
    await refresh()
    if (gearList.value.length > 0) {
      selectedGearIndex.value = 0
    }
  } catch (err: any) {
    statusMsg.value = err.data?.statusMessage || err.statusMessage || err.message || 'Failed to delete gear'
    statusType.value = 'error'
  } finally {
    isDeleting.value = false
  }
}
</script>

