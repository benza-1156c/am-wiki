<template>
  <UCard v-if="skillData">
    <template #header>
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-shield-alert" />
        <h3 class="font-bold text-sm">Passive & Ultimate Abilities</h3>
      </div>
    </template>

    <div class="space-y-4">
      <!-- Passive -->
      <div v-if="skillData.PassiveDescription" class="space-y-1.5">
        <div class="flex items-center gap-2">
          <UBadge color="warning" variant="subtle" size="xs">Passive</UBadge>
          <span class="text-xs font-bold" v-html="formatSkillHtml(skillData.PassiveHeader) || 'Inherent Passive'"></span>
        </div>
        <div
          class="text-xs leading-relaxed p-3 rounded border border-default bg-muted/20"
          v-html="formatSkillHtml(skillData.PassiveDescription)"
        ></div>
      </div>

      <!-- Ultimate -->
      <div v-if="skillData.UltimateHeader || skillData.UltimateDescription || ultName" class="space-y-1.5 pt-2 border-t border-default">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <UBadge color="primary" variant="subtle" size="xs">Ultimate</UBadge>
            <span class="text-xs font-bold" v-html="formatSkillHtml(skillData.UltimateHeader) || ultName || 'Ultimate Skill'"></span>
          </div>
          <UBadge v-if="ultCooldown" color="neutral" variant="outline" size="xs">
            Cooldown: {{ ultCooldown }}s
          </UBadge>
        </div>
        <div
          v-if="skillData.UltimateDescription"
          class="text-xs leading-relaxed p-3 rounded border border-default bg-muted/20"
          v-html="formatSkillHtml(skillData.UltimateDescription)"
        ></div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { SkillData } from '~/types/unit'
import { formatSkillHtml } from '~/utils/formatters'

const store = useCombatCalculatorStore()

const props = defineProps<{
  skill?: SkillData | any
  ultimateName?: string
  ultimateCooldown?: number
}>()

const skillData = computed(() => props.skill !== undefined ? props.skill : store.unitSkillInfo)
const ultName = computed(() => props.ultimateName !== undefined ? props.ultimateName : store.currentUnit?.ultimateName)
const ultCooldown = computed(() => props.ultimateCooldown !== undefined ? props.ultimateCooldown : store.currentUnit?.ultimateCooldown)
</script>
