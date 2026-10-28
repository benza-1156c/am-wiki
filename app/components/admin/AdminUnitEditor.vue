<template>
  <div class="space-y-6">
    <!-- Top Selector Bar -->
    <UCard>
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div class="flex-1 max-w-md">
          <label class="block text-xs font-bold text-neutral-300 mb-1.5">Select Unit to Edit</label>
          <USelectMenu
            v-model="selectedUnitId"
            :items="unitOptions"
            value-key="value"
            label-key="label"
            placeholder="Search unit by name, series, rarity..."
            size="sm"
            class="w-full font-mono font-medium"
            :search-input="{ placeholder: 'Search unit...' }"
          />
        </div>

        <div class="flex items-center gap-2 self-start sm:self-end">
          <UButton
            icon="i-lucide-plus"
            label="New Unit"
            variant="outline"
            color="primary"
            size="sm"
            @click="createNewUnit"
          />
          <UButton
            v-if="editingUnit"
            icon="i-lucide-save"
            label="Save Unit"
            color="primary"
            variant="solid"
            size="sm"
            :loading="isSaving"
            @click="saveUnit"
          />
          <UButton
            v-if="editingUnit && !isNewUnit"
            icon="i-lucide-trash-2"
            label="Delete"
            color="error"
            variant="ghost"
            size="sm"
            :loading="isDeleting"
            @click="deleteUnit"
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

    <!-- Editor Form (when a unit is active) -->
    <div v-if="editingUnit" class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <!-- Left Column: Identity & General Config -->
      <div class="lg:col-span-7 space-y-5">
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <span class="text-sm font-bold flex items-center gap-1.5">
                <UIcon name="i-lucide-user" class="text-primary" />
                <span>Unit Identity & Meta</span>
              </span>
              <UBadge v-if="isNewUnit" color="warning" variant="subtle" size="xs">Creating New</UBadge>
              <UBadge v-else color="neutral" variant="subtle" size="xs">ID: {{ editingUnit.id }}</UBadge>
            </div>
          </template>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-medium text-neutral-300 mb-1">Unit ID</label>
              <UInput v-model="editingUnit.id" placeholder="e.g. Saber_001" size="sm" class="font-mono" />
            </div>

            <div>
              <label class="block text-xs font-medium text-neutral-300 mb-1">Code Name</label>
              <UInput v-model="editingUnit.name" placeholder="e.g. Saber" size="sm" />
            </div>

            <div>
              <label class="block text-xs font-medium text-neutral-300 mb-1">Display Name</label>
              <UInput v-model="editingUnit.displayName" placeholder="e.g. Siri" size="sm" />
            </div>

            <div>
              <label class="block text-xs font-medium text-neutral-300 mb-1">Series</label>
              <UInput v-model="editingUnit.series" placeholder="e.g. Fate" size="sm" />
            </div>

            <div>
              <label class="block text-xs font-medium text-neutral-300 mb-1">Rarity</label>
              <USelect
                v-model="editingUnit.rarity"
                :items="['Secret', 'Mythic', 'Legendary', 'Epic', 'Rare', 'Celestial', 'Exclusive', 'Common']"
                size="sm"
              />
            </div>

            <div>
              <label class="block text-xs font-medium text-neutral-300 mb-1">Element</label>
              <USelect
                v-model="editingUnit.element"
                :items="['Luminus', 'Flora', 'Fire', 'Water', 'Wind', 'Abyss', 'Noctis', 'Riddle', 'Cosmic', 'Reality', 'Thunder', 'Neutral']"
                size="sm"
              />
            </div>

            <div>
              <label class="block text-xs font-medium text-neutral-300 mb-1">Skill Mode (Targeting)</label>
              <USelect
                v-model="editingUnit.skillMode"
                :items="['AOE', 'Line', 'Single']"
                size="sm"
              />
            </div>

            <div>
              <label class="block text-xs font-medium text-neutral-300 mb-1">Unit Placement Cap</label>
              <UInput v-model.number="editingUnit.unitCap" type="number" min="1" max="10" size="sm" class="font-mono" />
            </div>
          </div>
        </UCard>

        <!-- Combat Constants -->
        <UCard>
          <template #header>
            <span class="text-sm font-bold flex items-center gap-1.5">
              <UIcon name="i-lucide-activity" class="text-primary" />
              <span>Combat Multipliers & Spawning</span>
            </span>
          </template>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label class="block text-xs font-medium text-neutral-300 mb-1">Base Damage</label>
              <UInput v-model.number="editingUnit.baseDamage" type="number" step="0.1" size="sm" class="font-mono" />
            </div>

            <div>
              <label class="block text-xs font-medium text-neutral-300 mb-1">Spawn Cooldown (sec)</label>
              <UInput v-model.number="editingUnit.spawnCooldown" type="number" step="0.1" size="sm" class="font-mono" />
            </div>

            <div>
              <label class="block text-xs font-medium text-neutral-300 mb-1">Max Level In-Game</label>
              <UInput v-model.number="editingUnit.maxLevel" type="number" min="1" max="10" size="sm" class="font-mono" />
            </div>

            <div>
              <label class="block text-xs font-medium text-neutral-300 mb-1">Upgrade Stat Multiplier</label>
              <UInput v-model.number="editingUnit.upgradeStatMultiplier" type="number" step="0.05" size="sm" class="font-mono" />
            </div>

            <div>
              <label class="block text-xs font-medium text-neutral-300 mb-1">Base Cost</label>
              <UInput v-model.number="editingUnit.cost" type="number" step="25" size="sm" class="font-mono" />
            </div>
          </div>
        </UCard>
      </div>

      <!-- Right Column: Stats at Base (Lv.1) & Stats at Max (Lv.80 6★) -->
      <div class="lg:col-span-5 space-y-5">
        <!-- Base Stats Lv.1 -->
        <UCard>
          <template #header>
            <span class="text-xs font-bold uppercase tracking-wider text-neutral-300">
              Stats At Level 1 (Base)
            </span>
          </template>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-[11px] text-muted mb-1">Attack (ATK)</label>
              <UInput v-model.number="editingUnit.statsAtBase.attack" type="number" size="sm" class="font-mono" />
            </div>
            <div>
              <label class="block text-[11px] text-muted mb-1">Health (HP)</label>
              <UInput v-model.number="editingUnit.statsAtBase.health" type="number" size="sm" class="font-mono" />
            </div>
            <div>
              <label class="block text-[11px] text-muted mb-1">Range</label>
              <UInput v-model.number="editingUnit.statsAtBase.range" type="number" size="sm" class="font-mono" />
            </div>
            <div>
              <label class="block text-[11px] text-muted mb-1">Attack Speed (SPA sec)</label>
              <UInput v-model.number="editingUnit.statsAtBase.attackSpeed" type="number" step="0.05" size="sm" class="font-mono" />
            </div>
          </div>
        </UCard>

        <!-- Max Stats Lv.80 6★ -->
        <UCard>
          <template #header>
            <span class="text-xs font-bold uppercase tracking-wider text-amber-400">
              Stats At Level 80 (6-Star Max)
            </span>
          </template>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-[11px] text-muted mb-1">Max Attack</label>
              <UInput v-model.number="editingUnit.statsAtMax.attack" type="number" size="sm" class="font-mono" />
            </div>
            <div>
              <label class="block text-[11px] text-muted mb-1">Max Health</label>
              <UInput v-model.number="editingUnit.statsAtMax.health" type="number" size="sm" class="font-mono" />
            </div>
            <div>
              <label class="block text-[11px] text-muted mb-1">Max Range</label>
              <UInput v-model.number="editingUnit.statsAtMax.range" type="number" size="sm" class="font-mono" />
            </div>
            <div>
              <label class="block text-[11px] text-muted mb-1">SPA (sec)</label>
              <UInput v-model.number="editingUnit.statsAtMax.attackSpeed" type="number" step="0.05" size="sm" class="font-mono" />
            </div>
          </div>
        </UCard>

        <!-- Action Bar in Card -->
        <div class="flex items-center gap-2 pt-2">
          <UButton
            icon="i-lucide-save"
            label="Save Changes"
            color="primary"
            variant="solid"
            block
            size="md"
            :loading="isSaving"
            @click="saveUnit"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  adminKey: string
}>()

const { dbData, units, refresh } = useDatabase()

const selectedUnitId = ref<string>('')
const editingUnit = ref<any>(null)
const isNewUnit = ref(false)
const isSaving = ref(false)
const isDeleting = ref(false)
const statusMsg = ref('')
const statusType = ref<'success' | 'error'>('success')

const unitOptions = computed(() => {
  return (units.value || []).map((u: any) => ({
    label: `${u.displayName || u.name} (${u.rarity} • ${u.series})`,
    value: u.id || u.name
  }))
})

watch(selectedUnitId, (newId) => {
  if (!newId) return
  const found = (units.value || []).find((u: any) => u.id === newId || u.name === newId)
  if (found) {
    editingUnit.value = JSON.parse(JSON.stringify(found))
    // Ensure base objects exist
    if (!editingUnit.value.statsAtBase) {
      editingUnit.value.statsAtBase = { attack: 0, health: 0, range: 0, attackSpeed: 0 }
    } else {
      if (editingUnit.value.statsAtBase.attack === undefined && editingUnit.value.statsAtBase.damage !== undefined) {
        editingUnit.value.statsAtBase.attack = editingUnit.value.statsAtBase.damage
      }
      if (editingUnit.value.statsAtBase.health === undefined && editingUnit.value.statsAtBase.hp !== undefined) {
        editingUnit.value.statsAtBase.health = editingUnit.value.statsAtBase.hp
      }
      if (editingUnit.value.statsAtBase.attackSpeed === undefined && editingUnit.value.statsAtBase.spa !== undefined) {
        editingUnit.value.statsAtBase.attackSpeed = editingUnit.value.statsAtBase.spa
      }
    }
    if (!editingUnit.value.statsAtMax) {
      editingUnit.value.statsAtMax = { attack: 0, health: 0, range: 0, attackSpeed: 0 }
    } else {
      if (editingUnit.value.statsAtMax.attack === undefined && editingUnit.value.statsAtMax.damage !== undefined) {
        editingUnit.value.statsAtMax.attack = editingUnit.value.statsAtMax.damage
      }
      if (editingUnit.value.statsAtMax.health === undefined && editingUnit.value.statsAtMax.hp !== undefined) {
        editingUnit.value.statsAtMax.health = editingUnit.value.statsAtMax.hp
      }
      if (editingUnit.value.statsAtMax.attackSpeed === undefined && editingUnit.value.statsAtMax.spa !== undefined) {
        editingUnit.value.statsAtMax.attackSpeed = editingUnit.value.statsAtMax.spa
      }
    }
    isNewUnit.value = false
    statusMsg.value = ''
  }
})

// Auto-select first unit on mount if none selected
onMounted(() => {
  if (units.value && units.value.length > 0 && !selectedUnitId.value) {
    selectedUnitId.value = units.value[0].id || units.value[0].name
  }
})

function createNewUnit() {
  selectedUnitId.value = ''
  isNewUnit.value = true
  editingUnit.value = {
    id: `Unit_${Date.now()}`,
    name: 'NewUnit',
    displayName: 'New Unit',
    series: 'Custom',
    rarity: 'Mythic',
    element: 'Flora',
    skillMode: 'AOE',
    baseDamage: 25,
    maxLevel: 5,
    unitCap: 3,
    spawnCooldown: 15,
    upgradeStatMultiplier: 1.1,
    cost: 500,
    statsAtBase: { attack: 100, health: 500, range: 25, attackSpeed: 5.5 },
    statsAtMax: { attack: 5000, health: 25000, range: 35, attackSpeed: 5.5 }
  }
  statusMsg.value = 'Initialized new unit template. Edit fields and click "Save Unit".'
  statusType.value = 'success'
}

async function saveUnit() {
  if (!editingUnit.value) return
  isSaving.value = true
  statusMsg.value = ''

  try {
    const res = await $fetch<{ success: boolean; message: string }>('/api/units', {
      method: 'POST',
      headers: {
        'x-admin-key': props.adminKey
      },
      body: {
        unit: editingUnit.value
      }
    })

    statusMsg.value = res.message || 'Unit saved successfully!'
    statusType.value = 'success'
    isNewUnit.value = false
    selectedUnitId.value = editingUnit.value.id || editingUnit.value.name
    await refresh()
  } catch (err: any) {
    statusMsg.value = err.data?.statusMessage || err.statusMessage || err.message || 'Failed to save unit'
    statusType.value = 'error'
  } finally {
    isSaving.value = false
  }
}

async function deleteUnit() {
  if (!editingUnit.value || !confirm(`Are you sure you want to delete "${editingUnit.value.displayName || editingUnit.value.name}"?`)) {
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
        deleteUnitId: editingUnit.value.id || editingUnit.value.name
      }
    })

    statusMsg.value = res.message || 'Unit deleted successfully'
    statusType.value = 'success'
    editingUnit.value = null
    selectedUnitId.value = ''
    await refresh()
    if (units.value && units.value.length > 0) {
      selectedUnitId.value = units.value[0].id || units.value[0].name
    }
  } catch (err: any) {
    statusMsg.value = err.data?.statusMessage || err.statusMessage || err.message || 'Failed to delete unit'
    statusType.value = 'error'
  } finally {
    isDeleting.value = false
  }
}
</script>

