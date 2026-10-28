<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between">
        <span class="text-sm font-bold flex items-center gap-1.5">
          <UIcon name="i-lucide-award" class="text-amber-400" />
          <span>Unit Trait</span>
        </span>
        <UBadge
          v-if="store.currentTrait"
          :color="getRarityBadgeColor(store.currentTrait.RarityName)"
          variant="subtle"
          size="xs"
        >
          {{ store.currentTrait.RarityName }}
        </UBadge>
        <UBadge v-else color="neutral" variant="outline" size="xs">
          No Trait
        </UBadge>
      </div>
    </template>

    <div class="space-y-3">
      <!-- Trait Selector dropdown (Nuxt UI USelect) -->
      <div>
        <label class="text-[11px] font-bold text-muted uppercase tracking-wider block mb-1.5">
          Select Trait
        </label>
        <USelect
          :model-value="store.selectedTraitId || 'none'"
          :items="traitOptions"
          size="sm"
          class="w-full font-mono font-medium"
          placeholder="Select Trait"
          @update:model-value="handleTraitSelect"
        />
      </div>

      <!-- Active Trait Details Card -->
      <div
        v-if="store.currentTrait"
        class="p-3 rounded-lg border bg-neutral-900/60 space-y-2 transition-all"
        :class="getRarityBorderClass(store.currentTrait.RarityName)"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-sparkles" class="w-4 h-4" :class="getRarityTextClass(store.currentTrait.RarityName)" />
            <span class="font-bold text-sm" :class="getRarityTextClass(store.currentTrait.RarityName)">
              {{ store.currentTrait.TraitDisplayName }}
            </span>
          </div>
          <span class="text-[10px] text-muted font-mono">
            {{ store.currentTrait.RarityName }}
          </span>
        </div>

        <p class="text-xs text-neutral-300 font-mono leading-relaxed bg-black/40 p-2 rounded border border-neutral-800">
          {{ store.currentTrait.TraitStatus || 'No Status' }}
        </p>

        <!-- Stats Boost Pills -->
        <div class="flex flex-wrap gap-1.5 pt-1">
          <UBadge
            v-if="store.currentTrait.Stats.DamageBoost"
            color="error"
            variant="subtle"
            size="xs"
          >
            ATK +{{ Math.round(store.currentTrait.Stats.DamageBoost * 100) }}%
          </UBadge>
          <UBadge
            v-if="store.currentTrait.Stats.HealthBoost"
            color="success"
            variant="subtle"
            size="xs"
          >
            HP {{ store.currentTrait.Stats.HealthBoost > 0 ? '+' : '' }}{{ Math.round(store.currentTrait.Stats.HealthBoost * 100) }}%
          </UBadge>
          <UBadge
            v-if="store.currentTrait.Stats.AttackSpeedBoost"
            color="info"
            variant="subtle"
            size="xs"
          >
            SPA {{ store.currentTrait.Stats.AttackSpeedBoost > 0 ? '-' : '+' }}{{ Math.round(Math.abs(store.currentTrait.Stats.AttackSpeedBoost * 100)) }}%
          </UBadge>
          <UBadge
            v-if="store.currentTrait.Stats.RangeBoost"
            color="warning"
            variant="subtle"
            size="xs"
          >
            Range +{{ Math.round(store.currentTrait.Stats.RangeBoost * 100) }}%
          </UBadge>
          <UBadge
            v-if="store.currentTrait.Stats.SkillDamageBoost"
            color="primary"
            variant="subtle"
            size="xs"
          >
            Skill DMG +{{ Math.round(store.currentTrait.Stats.SkillDamageBoost * 100) }}%
          </UBadge>
          <UBadge
            v-if="store.currentTrait.Stats.SkillCooldownReduction"
            color="secondary"
            variant="subtle"
            size="xs"
          >
            Skill CD -{{ Math.round(store.currentTrait.Stats.SkillCooldownReduction * 100) }}%
          </UBadge>
          <UBadge
            v-if="store.currentTrait.Stats.CritDamageBoost"
            color="error"
            variant="subtle"
            size="xs"
          >
            Crit DMG +{{ Math.round(store.currentTrait.Stats.CritDamageBoost * 100) }}%
          </UBadge>
          <UBadge
            v-if="store.currentTrait.Stats.CritChanceBoost"
            color="warning"
            variant="subtle"
            size="xs"
          >
            Crit +{{ Math.round(store.currentTrait.Stats.CritChanceBoost * 100) }}%
          </UBadge>
          <UBadge
            v-if="store.currentTrait.Stats.CostReduction"
            color="neutral"
            variant="subtle"
            size="xs"
          >
            Cost {{ store.currentTrait.Stats.CostReduction > 0 ? '-' : '+' }}{{ Math.round(Math.abs(store.currentTrait.Stats.CostReduction * 100)) }}%
          </UBadge>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
const store = useCombatCalculatorStore()

const traitOptions = computed(() => {
  const options = [
    { label: 'None', value: 'none' }
  ]
  const list = store.traitsList.map((t: any) => ({
    label: `${t.RarityName} - ${t.TraitDisplayName}`,
    value: t.id
  }))
  return [...options, ...list]
})

function handleTraitSelect(val: any) {
  store.setTrait(val && val !== 'none' ? String(val) : null)
}

function getRarityBadgeColor(rarity?: string): any {
  switch (rarity) {
    case 'Mythic': return 'error'
    case 'Legendary': return 'warning'
    case 'Epic': return 'primary'
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
