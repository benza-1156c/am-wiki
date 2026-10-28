<template>
  <div class="space-y-6">
    <!-- Top Selector Bar -->
    <UCard>
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div class="flex-1 max-w-md">
          <label class="block text-xs font-bold text-neutral-300 mb-1.5">Select Trait to Edit</label>
          <USelectMenu
            v-model="selectedTraitIndex"
            :items="traitOptions"
            value-key="value"
            label-key="label"
            placeholder="Search trait by name, rarity, status..."
            size="sm"
            class="w-full font-mono font-medium"
            :search-input="{ placeholder: 'Search trait...' }"
          />
        </div>

        <div class="flex items-center gap-2 self-start sm:self-end">
          <UButton
            icon="i-lucide-plus"
            label="New Trait"
            variant="outline"
            color="primary"
            size="sm"
            @click="createNewTrait"
          />
          <UButton
            v-if="editingTrait"
            icon="i-lucide-save"
            label="Save Trait"
            color="primary"
            variant="solid"
            size="sm"
            :loading="isSaving"
            @click="saveTrait"
          />
          <UButton
            v-if="editingTrait && !isNewTrait"
            icon="i-lucide-trash-2"
            label="Delete"
            color="error"
            variant="ghost"
            size="sm"
            :loading="isDeleting"
            @click="deleteTrait"
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
    <div v-if="editingTrait" class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <!-- Left Column: Identity & Status Description -->
      <div class="lg:col-span-6 space-y-5">
        <UCard>
          <template #header>
            <span class="text-sm font-bold flex items-center gap-1.5">
              <UIcon name="i-lucide-award" class="text-amber-400" />
              <span>Trait Identity & Roll Weight</span>
            </span>
          </template>

          <div class="space-y-4">
            <div>
              <label class="block text-xs font-medium text-neutral-300 mb-1">Trait Display Name</label>
              <UInput v-model="editingTrait.TraitDisplayName" placeholder="e.g. Aura Burst" size="sm" />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-medium text-neutral-300 mb-1">Rarity</label>
                <USelect
                  v-model="editingTrait.RarityName"
                  :items="['Mythic', 'Legendary', 'Epic', 'Rare']"
                  size="sm"
                />
              </div>

              <div>
                <label class="block text-xs font-medium text-neutral-300 mb-1">Reroll Weight</label>
                <UInput v-model.number="editingTrait.Weight" type="number" size="sm" class="font-mono" placeholder="200" />
              </div>
            </div>

            <div>
              <label class="block text-xs font-medium text-neutral-300 mb-1">Trait Icon Asset</label>
              <UInput v-model="editingTrait.TraitIcon" placeholder="e.g. rbxassetid://105540300848135" size="sm" class="font-mono text-xs" />
            </div>

            <div>
              <label class="block text-xs font-medium text-neutral-300 mb-1">Status Description Text</label>
              <UTextarea
                v-model="editingTrait.TraitStatus"
                placeholder="SkillDamage +30%, SkillCooldown -25%, Range +15%, Cost -5%"
                :rows="3"
                size="sm"
                class="font-mono text-xs"
              />
            </div>
          </div>
        </UCard>
      </div>

      <!-- Right Column: Trait Stats Multipliers -->
      <div class="lg:col-span-6 space-y-5">
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <span class="text-sm font-bold flex items-center gap-1.5">
                <UIcon name="i-lucide-activity" class="text-primary" />
                <span>Stat Effects (Math Values)</span>
              </span>
              <span class="text-[11px] text-muted">0.3 = +30% | -0.25 = -25%</span>
            </div>
          </template>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-[11px] text-neutral-300 mb-1">ATK Boost (DamageBoost)</label>
              <UInput v-model.number="traitStats.DamageBoost" type="number" step="0.05" size="sm" class="font-mono" placeholder="0.20" />
            </div>

            <div>
              <label class="block text-[11px] text-neutral-300 mb-1">SPA Boost (AttackSpeedBoost)</label>
              <UInput v-model.number="traitStats.AttackSpeedBoost" type="number" step="0.05" size="sm" class="font-mono" placeholder="0.20" />
            </div>

            <div>
              <label class="block text-[11px] text-neutral-300 mb-1">Skill DMG Boost</label>
              <UInput v-model.number="traitStats.SkillDamageBoost" type="number" step="0.05" size="sm" class="font-mono" placeholder="0.30" />
            </div>

            <div>
              <label class="block text-[11px] text-neutral-300 mb-1">Skill CD Reduction</label>
              <UInput v-model.number="traitStats.SkillCooldownReduction" type="number" step="0.05" size="sm" class="font-mono" placeholder="0.25" />
            </div>

            <div>
              <label class="block text-[11px] text-neutral-300 mb-1">Range Boost</label>
              <UInput v-model.number="traitStats.RangeBoost" type="number" step="0.05" size="sm" class="font-mono" placeholder="0.15" />
            </div>

            <div>
              <label class="block text-[11px] text-neutral-300 mb-1">Cost Reduction (positive = discount)</label>
              <UInput v-model.number="traitStats.CostReduction" type="number" step="0.05" size="sm" class="font-mono" placeholder="0.05" />
            </div>

            <div>
              <label class="block text-[11px] text-neutral-300 mb-1">Crit Damage Boost</label>
              <UInput v-model.number="traitStats.CritDamageBoost" type="number" step="0.05" size="sm" class="font-mono" placeholder="0.30" />
            </div>

            <div>
              <label class="block text-[11px] text-neutral-300 mb-1">Crit Chance Boost</label>
              <UInput v-model.number="traitStats.CritChanceBoost" type="number" step="0.05" size="sm" class="font-mono" placeholder="0.15" />
            </div>

            <div>
              <label class="block text-[11px] text-neutral-300 mb-1">Health Boost (HP)</label>
              <UInput v-model.number="traitStats.HealthBoost" type="number" step="0.05" size="sm" class="font-mono" placeholder="0.15" />
            </div>

            <div>
              <label class="block text-[11px] text-neutral-300 mb-1">Unit Cap Modifier</label>
              <UInput v-model.number="traitStats.UnitCap" type="number" step="1" size="sm" class="font-mono" placeholder="1" />
            </div>
          </div>
        </UCard>

        <UButton
          icon="i-lucide-save"
          label="Save Trait"
          color="primary"
          variant="solid"
          block
          size="md"
          :loading="isSaving"
          @click="saveTrait"
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

const selectedTraitIndex = ref<number>(-1)
const editingTrait = ref<any>(null)
const isNewTrait = ref(false)
const isSaving = ref(false)
const isDeleting = ref(false)
const statusMsg = ref('')
const statusType = ref<'success' | 'error'>('success')

const traitStats = ref<Record<string, number>>({})

const traitList = computed(() => {
  const t = dbData.value?.traits
  return Array.isArray(t) ? t : (t ? Object.values(t) : [])
})

const traitOptions = computed(() => {
  return traitList.value.map((t: any, idx: number) => ({
    label: `${t.TraitDisplayName || 'Unnamed'} (${t.RarityName || 'Rare'})`,
    value: idx
  }))
})

watch(selectedTraitIndex, (newIdx) => {
  if (newIdx < 0 || newIdx >= traitList.value.length) return
  const found = traitList.value[newIdx]
  if (found) {
    editingTrait.value = JSON.parse(JSON.stringify(found))
    isNewTrait.value = false
    statusMsg.value = ''

    traitStats.value = {}
    if (editingTrait.value.Stats && typeof editingTrait.value.Stats === 'object') {
      traitStats.value = { ...editingTrait.value.Stats }
    }
  }
})

onMounted(() => {
  if (traitList.value.length > 0 && selectedTraitIndex.value === -1) {
    selectedTraitIndex.value = 0
  }
})

function createNewTrait() {
  selectedTraitIndex.value = -1
  isNewTrait.value = true
  editingTrait.value = {
    TraitDisplayName: 'New Trait',
    RarityName: 'Mythic',
    TraitStatus: '+15% Damage',
    Weight: 100,
    TraitIcon: '',
    Stats: {}
  }
  traitStats.value = { DamageBoost: 0.15 }
  statusMsg.value = 'Initialized new trait template. Configure fields and click "Save Trait".'
  statusType.value = 'success'
}

async function saveTrait() {
  if (!editingTrait.value) return
  isSaving.value = true
  statusMsg.value = ''

  try {
    const cleanStats: Record<string, number> = {}
    for (const [k, v] of Object.entries(traitStats.value)) {
      if (typeof v === 'number' && !isNaN(v) && v !== 0) {
        cleanStats[k] = v
      }
    }

    editingTrait.value.Stats = cleanStats

    const res = await $fetch<{ success: boolean; message: string }>('/api/units', {
      method: 'POST',
      headers: {
        'x-admin-key': props.adminKey
      },
      body: {
        trait: editingTrait.value,
        traitIndex: isNewTrait.value ? undefined : selectedTraitIndex.value
      }
    })

    statusMsg.value = res.message || 'Trait saved successfully!'
    statusType.value = 'success'
    isNewTrait.value = false
    await refresh()
  } catch (err: any) {
    statusMsg.value = err.data?.statusMessage || err.statusMessage || err.message || 'Failed to save trait'
    statusType.value = 'error'
  } finally {
    isSaving.value = false
  }
}

async function deleteTrait() {
  if (!editingTrait.value || !confirm(`Are you sure you want to delete trait "${editingTrait.value.TraitDisplayName}"?`)) {
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
        deleteTraitIndex: selectedTraitIndex.value
      }
    })

    statusMsg.value = res.message || 'Trait deleted successfully'
    statusType.value = 'success'
    editingTrait.value = null
    selectedTraitIndex.value = -1
    await refresh()
    if (traitList.value.length > 0) {
      selectedTraitIndex.value = 0
    }
  } catch (err: any) {
    statusMsg.value = err.data?.statusMessage || err.statusMessage || err.message || 'Failed to delete trait'
    statusType.value = 'error'
  } finally {
    isDeleting.value = false
  }
}
</script>

