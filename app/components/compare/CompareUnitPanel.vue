<template>
  <div class="space-y-4">
    <!-- 1. Unit Identity Header Card -->
    <CompareUnitHeader
      :unit="unit"
      @open-picker="$emit('open-picker')"
    />

    <!-- 2. Core Controls: Stars, Level & In-Game Upgrade -->
    <CompareUnitControls
      :unit="unit"
      :stars="state.stars"
      :level="state.level"
      :upgrade-level="state.upgradeLevel"
      @update:stars="(s) => state.stars = s"
      @update:level="(l) => state.level = l"
      @update:upgrade-level="(u) => state.upgradeLevel = u"
    />

    <!-- 3. Equipment & Modifiers (Tabs: Gears / Traits / Potentials / Skills) -->
    <div class="space-y-3">
      <div class="grid grid-cols-4 gap-1.5">
        <button
          v-for="tab in (['gears', 'traits', 'potentials', 'skills'] as const)"
          :key="tab"
          type="button"
          class="h-8 rounded-lg text-xs font-bold capitalize transition-all border flex items-center justify-center cursor-pointer"
          :class="activeTab === tab
            ? 'bg-primary border-cyan-400 text-slate-950 font-black shadow-sm'
            : 'bg-slate-900/80 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:text-white'"
          @click="activeTab = tab"
        >
          {{ tab }}
        </button>
      </div>

      <!-- Tab 1: Equipped Gears Component -->
      <CompareUnitGearSelector
        v-show="activeTab === 'gears'"
        :unit="unit"
        :gears="state.gears"
        :all-gears="allGears"
        @update:gear="(slot, val) => state.gears[slot] = val"
      />

      <!-- Tab 2: Unit Traits Component -->
      <CompareUnitTraitSelector
        v-show="activeTab === 'traits'"
        :trait-ids="state.traitIds"
        :all-traits="allTraits"
        @update:trait="(slotIdx, val) => state.traitIds[slotIdx] = val"
      />

      <!-- Tab 3: Status Potentials Component -->
      <CompareUnitPotentials
        v-show="activeTab === 'potentials'"
        :potentials="state.potentials"
        @update:potential="(key, val) => state.potentials[key] = val"
      />

      <!-- Tab 4: Unit Skills (Passive & Ultimate) Component -->
      <CompareUnitSkillCard
        v-show="activeTab === 'skills'"
        :unit="unit"
        :skill="unit?.skill"
        :ultimate-name="unit?.ultimateName"
        :ultimate-cooldown="unit?.ultimateCooldown"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { StatPotentials, GearSlot } from '~/types/unit'
import CompareUnitHeader from '~/components/compare/CompareUnitHeader.vue'
import CompareUnitControls from '~/components/compare/CompareUnitControls.vue'
import CompareUnitGearSelector from '~/components/compare/CompareUnitGearSelector.vue'
import CompareUnitTraitSelector from '~/components/compare/CompareUnitTraitSelector.vue'
import CompareUnitPotentials from '~/components/compare/CompareUnitPotentials.vue'
import CompareUnitSkillCard from '~/components/compare/CompareUnitSkillCard.vue'

export interface CompareUnitPanelState {
  stars: number
  level: number
  upgradeLevel: number
  potentials: StatPotentials
  traitIds: [string | null, string | null]
  gears: Record<GearSlot, string | null>
}

defineProps<{
  unit: any
  state: CompareUnitPanelState
  allTraits: any[]
  allGears: any[]
}>()

defineEmits<{
  (e: 'open-picker'): void
  (e: 'update:activeTab', tab: 'gears' | 'traits' | 'potentials' | 'skills'): void
}>()

const activeTab = ref<'gears' | 'traits' | 'potentials' | 'skills'>('gears')
</script>
