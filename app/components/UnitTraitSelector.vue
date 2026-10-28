<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between">
        <span class="text-sm font-bold flex items-center gap-1.5">
          <UIcon name="i-lucide-award" class="text-amber-400" />
          <span>Unit Traits</span>
        </span>
        <div class="flex items-center gap-2">
          <UBadge
            :color="activeTraitCount > 0 ? 'warning' : 'neutral'"
            :variant="activeTraitCount > 0 ? 'subtle' : 'outline'"
            size="xs"
          >
            {{ activeTraitCount }} / 2 Traits
          </UBadge>
          <UButton
            icon="i-lucide-book-open"
            label="Browse All"
            variant="subtle"
            color="primary"
            size="xs"
            @click="isModalOpen = true"
          />
          <UButton
            v-if="activeTraitCount > 0"
            label="Clear"
            variant="ghost"
            color="neutral"
            size="xs"
            @click="store.clearTraits()"
          />
        </div>
      </div>
    </template>

    <!-- 2 Trait Slots -->
    <div class="space-y-4">
      <div
        v-for="slotIdx in [0, 1]"
        :key="slotIdx"
        class="p-3 rounded-lg border border-default bg-neutral-900/40 space-y-2.5"
      >
        <!-- Slot Header -->
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold flex items-center gap-1.5 text-neutral-200">
            <UIcon name="i-lucide-sparkles" class="w-3.5 h-3.5 text-amber-400" />
            <span>Trait Slot {{ slotIdx + 1 }}</span>
          </span>
          <div class="flex items-center gap-1.5">
            <UBadge
              v-if="getTraitForSlot(slotIdx)"
              :color="getRarityBadgeColor(getTraitForSlot(slotIdx)?.RarityName)"
              variant="subtle"
              size="xs"
            >
              {{ getTraitForSlot(slotIdx)?.RarityName }}
            </UBadge>
            <span v-else class="text-[10px] text-muted">Empty</span>
            <UButton
              v-if="getTraitForSlot(slotIdx)"
              icon="i-lucide-x"
              variant="ghost"
              color="neutral"
              size="xs"
              class="h-5 w-5 p-0"
              @click="store.setTrait(null, slotIdx)"
            />
          </div>
        </div>

        <!-- Searchable Select Menu for this slot -->
        <USelectMenu
          :model-value="store.selectedTraitIds[slotIdx] || 'none'"
          :items="traitOptions"
          value-key="value"
          label-key="label"
          size="sm"
          class="w-full font-mono font-medium"
          placeholder="Search trait..."
          :search-input="{ placeholder: 'Search trait name or stat effect...' }"
          @update:model-value="(val) => handleTraitSelect(slotIdx, val)"
        />

        <!-- Active Trait Details Card -->
        <div
          v-if="getTraitForSlot(slotIdx)"
          class="p-2.5 rounded-lg border bg-black/40 space-y-2 transition-all"
          :class="getRarityBorderClass(getTraitForSlot(slotIdx)?.RarityName)"
        >
          <div class="flex items-center justify-between">
            <span class="font-bold text-xs" :class="getRarityTextClass(getTraitForSlot(slotIdx)?.RarityName)">
              {{ getTraitForSlot(slotIdx)?.TraitDisplayName }}
            </span>
            <span class="text-[10px] text-muted font-mono">
              {{ getTraitForSlot(slotIdx)?.RarityName }}
            </span>
          </div>

          <!-- Full Trait Status Description -->
          <p class="text-[11px] text-neutral-300 font-mono leading-relaxed bg-neutral-900/60 p-2 rounded border border-neutral-800">
            {{ getTraitForSlot(slotIdx)?.TraitStatus || 'No status effect' }}
          </p>

          <!-- Stat Badges -->
          <div class="flex flex-wrap gap-1">
            <UBadge
              v-if="getTraitForSlot(slotIdx)?.Stats.DamageBoost"
              color="error"
              variant="subtle"
              size="xs"
            >
              ATK +{{ Math.round(getTraitForSlot(slotIdx)!.Stats.DamageBoost! * 100) }}%
            </UBadge>
            <UBadge
              v-if="getTraitForSlot(slotIdx)?.Stats.HealthBoost"
              color="success"
              variant="subtle"
              size="xs"
            >
              HP {{ getTraitForSlot(slotIdx)!.Stats.HealthBoost! > 0 ? '+' : '' }}{{ Math.round(getTraitForSlot(slotIdx)!.Stats.HealthBoost! * 100) }}%
            </UBadge>
            <UBadge
              v-if="getTraitForSlot(slotIdx)?.Stats.AttackSpeedBoost"
              color="info"
              variant="subtle"
              size="xs"
            >
              SPA {{ getTraitForSlot(slotIdx)!.Stats.AttackSpeedBoost! > 0 ? '-' : '+' }}{{ Math.round(Math.abs(getTraitForSlot(slotIdx)!.Stats.AttackSpeedBoost! * 100)) }}%
            </UBadge>
            <UBadge
              v-if="getTraitForSlot(slotIdx)?.Stats.RangeBoost"
              color="warning"
              variant="subtle"
              size="xs"
            >
              Range +{{ Math.round(getTraitForSlot(slotIdx)!.Stats.RangeBoost! * 100) }}%
            </UBadge>
            <UBadge
              v-if="getTraitForSlot(slotIdx)?.Stats.SpeedBoost"
              color="primary"
              variant="subtle"
              size="xs"
            >
              Speed +{{ Math.round(getTraitForSlot(slotIdx)!.Stats.SpeedBoost! * 100) }}%
            </UBadge>
            <UBadge
              v-if="getTraitForSlot(slotIdx)?.Stats.SkillDamageBoost"
              color="primary"
              variant="subtle"
              size="xs"
            >
              Skill DMG +{{ Math.round(getTraitForSlot(slotIdx)!.Stats.SkillDamageBoost! * 100) }}%
            </UBadge>
            <UBadge
              v-if="getTraitForSlot(slotIdx)?.Stats.SkillCooldownReduction"
              color="secondary"
              variant="subtle"
              size="xs"
            >
              Skill CD -{{ Math.round(getTraitForSlot(slotIdx)!.Stats.SkillCooldownReduction! * 100) }}%
            </UBadge>
            <UBadge
              v-if="getTraitForSlot(slotIdx)?.Stats.CritDamageBoost"
              color="error"
              variant="subtle"
              size="xs"
            >
              Crit DMG +{{ Math.round(getTraitForSlot(slotIdx)!.Stats.CritDamageBoost! * 100) }}%
            </UBadge>
            <UBadge
              v-if="getTraitForSlot(slotIdx)?.Stats.CritChanceBoost"
              color="warning"
              variant="subtle"
              size="xs"
            >
              Crit +{{ Math.round(getTraitForSlot(slotIdx)!.Stats.CritChanceBoost! * 100) }}%
            </UBadge>
            <UBadge
              v-if="getTraitForSlot(slotIdx)?.Stats.CostReduction"
              color="neutral"
              variant="subtle"
              size="xs"
            >
              Cost {{ getTraitForSlot(slotIdx)!.Stats.CostReduction! > 0 ? '-' : '+' }}{{ Math.round(Math.abs(getTraitForSlot(slotIdx)!.Stats.CostReduction! * 100)) }}%
            </UBadge>
            <UBadge
              v-if="getTraitForSlot(slotIdx)?.Stats.EvadeBoost"
              color="info"
              variant="subtle"
              size="xs"
            >
              Evade +{{ Math.round(getTraitForSlot(slotIdx)!.Stats.EvadeBoost! * 100) }}%
            </UBadge>
            <UBadge
              v-if="getTraitForSlot(slotIdx)?.Stats.UnitCap"
              color="neutral"
              variant="subtle"
              size="xs"
            >
              Cap {{ getTraitForSlot(slotIdx)!.Stats.UnitCap }}
            </UBadge>
          </div>
        </div>
      </div>
    </div>

    <!-- Browse All Traits Modal -->
    <UModal
      v-model:open="isModalOpen"
      title="All Unit Traits"
      :description="`Browse all ${store.traitsList.length} traits in full detail and equip to Slot 1 or Slot 2`"
    >
      <template #body>
        <div class="space-y-4">
          <!-- Search input -->
          <UInput
            v-model="modalSearch"
            placeholder="Search by trait name, rarity, or stat effect (e.g. Crit, Attack, Speed)..."
            icon="i-lucide-search"
            size="md"
            autofocus
          />

          <!-- Full Traits Cards List -->
          <div class="max-h-[65vh] overflow-y-auto space-y-2.5 pr-1">
            <div
              v-for="t in filteredModalTraits"
              :key="t.id"
              class="p-3 rounded-lg border bg-neutral-900/60 space-y-2 transition-all hover:bg-neutral-900/90"
              :class="getRarityBorderClass(t.RarityName)"
            >
              <!-- Card Header -->
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <UBadge
                    :color="getRarityBadgeColor(t.RarityName)"
                    variant="subtle"
                    size="xs"
                  >
                    {{ t.RarityName }}
                  </UBadge>
                  <span class="font-bold text-sm" :class="getRarityTextClass(t.RarityName)">
                    {{ t.TraitDisplayName }}
                  </span>
                </div>

                <!-- Equip Action Buttons -->
                <div class="flex items-center gap-1.5">
                  <UButton
                    :label="store.selectedTraitIds[0] === t.id ? 'In Slot 1 ✓' : 'Slot 1'"
                    :color="store.selectedTraitIds[0] === t.id ? 'warning' : 'neutral'"
                    :variant="store.selectedTraitIds[0] === t.id ? 'solid' : 'outline'"
                    size="xs"
                    @click="toggleSlot(0, t.id)"
                  />
                  <UButton
                    :label="store.selectedTraitIds[1] === t.id ? 'In Slot 2 ✓' : 'Slot 2'"
                    :color="store.selectedTraitIds[1] === t.id ? 'warning' : 'neutral'"
                    :variant="store.selectedTraitIds[1] === t.id ? 'solid' : 'outline'"
                    size="xs"
                    @click="toggleSlot(1, t.id)"
                  />
                </div>
              </div>

              <!-- Full Status Description -->
              <p class="text-xs text-neutral-300 font-mono leading-relaxed bg-black/40 p-2 rounded border border-neutral-800">
                {{ t.TraitStatus || 'No status effect' }}
              </p>

              <!-- Stat Pills -->
              <div class="flex flex-wrap gap-1">
                <UBadge
                  v-if="t.Stats.DamageBoost"
                  color="error"
                  variant="subtle"
                  size="xs"
                >
                  ATK +{{ Math.round(t.Stats.DamageBoost * 100) }}%
                </UBadge>
                <UBadge
                  v-if="t.Stats.HealthBoost"
                  color="success"
                  variant="subtle"
                  size="xs"
                >
                  HP {{ t.Stats.HealthBoost > 0 ? '+' : '' }}{{ Math.round(t.Stats.HealthBoost * 100) }}%
                </UBadge>
                <UBadge
                  v-if="t.Stats.AttackSpeedBoost"
                  color="info"
                  variant="subtle"
                  size="xs"
                >
                  SPA {{ t.Stats.AttackSpeedBoost > 0 ? '-' : '+' }}{{ Math.round(Math.abs(t.Stats.AttackSpeedBoost * 100)) }}%
                </UBadge>
                <UBadge
                  v-if="t.Stats.RangeBoost"
                  color="warning"
                  variant="subtle"
                  size="xs"
                >
                  Range +{{ Math.round(t.Stats.RangeBoost * 100) }}%
                </UBadge>
                <UBadge
                  v-if="t.Stats.SpeedBoost"
                  color="primary"
                  variant="subtle"
                  size="xs"
                >
                  Speed +{{ Math.round(t.Stats.SpeedBoost * 100) }}%
                </UBadge>
                <UBadge
                  v-if="t.Stats.SkillDamageBoost"
                  color="primary"
                  variant="subtle"
                  size="xs"
                >
                  Skill DMG +{{ Math.round(t.Stats.SkillDamageBoost * 100) }}%
                </UBadge>
                <UBadge
                  v-if="t.Stats.SkillCooldownReduction"
                  color="secondary"
                  variant="subtle"
                  size="xs"
                >
                  Skill CD -{{ Math.round(t.Stats.SkillCooldownReduction * 100) }}%
                </UBadge>
                <UBadge
                  v-if="t.Stats.CritDamageBoost"
                  color="error"
                  variant="subtle"
                  size="xs"
                >
                  Crit DMG +{{ Math.round(t.Stats.CritDamageBoost * 100) }}%
                </UBadge>
                <UBadge
                  v-if="t.Stats.CritChanceBoost"
                  color="warning"
                  variant="subtle"
                  size="xs"
                >
                  Crit +{{ Math.round(t.Stats.CritChanceBoost * 100) }}%
                </UBadge>
                <UBadge
                  v-if="t.Stats.CostReduction"
                  color="neutral"
                  variant="subtle"
                  size="xs"
                >
                  Cost {{ t.Stats.CostReduction > 0 ? '-' : '+' }}{{ Math.round(Math.abs(t.Stats.CostReduction * 100)) }}%
                </UBadge>
                <UBadge
                  v-if="t.Stats.EvadeBoost"
                  color="info"
                  variant="subtle"
                  size="xs"
                >
                  Evade +{{ Math.round(t.Stats.EvadeBoost * 100) }}%
                </UBadge>
                <UBadge
                  v-if="t.Stats.UnitCap"
                  color="neutral"
                  variant="subtle"
                  size="xs"
                >
                  Cap {{ t.Stats.UnitCap }}
                </UBadge>
              </div>
            </div>
          </div>
        </div>
      </template>
    </UModal>
  </UCard>
</template>

<script setup lang="ts">
import type { UnitTrait } from '~/types/unit'

const store = useCombatCalculatorStore()

const isModalOpen = ref(false)
const modalSearch = ref('')

const activeTraitCount = computed(() => {
  return store.selectedTraitIds.filter(Boolean).length
})

function getTraitForSlot(slotIndex: number): UnitTrait | null {
  const id = store.selectedTraitIds[slotIndex]
  if (!id || id === 'none') return null
  return store.traitsList.find((t: UnitTrait) => t.id === id) || null
}

const traitOptions = computed(() => {
  const options = [{ label: 'None', value: 'none', description: '' }]
  const list = store.traitsList.map((t: UnitTrait) => ({
    label: `${t.RarityName} - ${t.TraitDisplayName}`,
    value: t.id,
    description: t.TraitStatus || ''
  }))
  return [...options, ...list]
})

function handleTraitSelect(slotIndex: number, val: any) {
  const traitId = typeof val === 'object' && val !== null ? val.value : val
  store.setTrait(traitId && traitId !== 'none' ? String(traitId) : null, slotIndex)
}

function toggleSlot(slotIndex: number, traitId: string) {
  if (store.selectedTraitIds[slotIndex] === traitId) {
    store.setTrait(null, slotIndex)
  } else {
    store.setTrait(traitId, slotIndex)
  }
}

const filteredModalTraits = computed(() => {
  const q = modalSearch.value.toLowerCase().trim()
  if (!q) return store.traitsList
  return store.traitsList.filter((t: UnitTrait) =>
    t.TraitDisplayName.toLowerCase().includes(q) ||
    t.RarityName.toLowerCase().includes(q) ||
    (t.TraitStatus || '').toLowerCase().includes(q)
  )
})

function getRarityBadgeColor(rarity?: string): any {
  switch (rarity) {
    case 'Mythic': return 'error'
    case 'Legendary': return 'warning'
    case 'Epic': return 'secondary'
    case 'Rare': return 'info'
    default: return 'neutral'
  }
}

function getRarityBorderClass(rarity?: string): string {
  switch (rarity) {
    case 'Mythic': return 'border-rose-500/60 shadow-sm shadow-rose-500/10'
    case 'Legendary': return 'border-amber-500/60 shadow-sm shadow-amber-500/10'
    case 'Epic': return 'border-purple-500/60 shadow-sm shadow-purple-500/10'
    case 'Rare': return 'border-blue-500/60 shadow-sm shadow-blue-500/10'
    default: return 'border-default'
  }
}

function getRarityTextClass(rarity?: string): string {
  switch (rarity) {
    case 'Mythic': return 'text-rose-400'
    case 'Legendary': return 'text-amber-400'
    case 'Epic': return 'text-purple-400'
    case 'Rare': return 'text-blue-400'
    default: return 'text-neutral-300'
  }
}
</script>