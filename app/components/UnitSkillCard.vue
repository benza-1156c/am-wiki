<template>
  <UCard v-if="skill">
    <template #header>
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-shield-alert" />
        <h3 class="font-bold text-sm">Passive & Ultimate Abilities</h3>
      </div>
    </template>

    <div class="space-y-4">
      <!-- Passive -->
      <div v-if="skill.PassiveDescription" class="space-y-1.5">
        <div class="flex items-center gap-2">
          <UBadge color="warning" variant="subtle" size="xs">Passive</UBadge>
          <span class="text-xs font-bold" v-html="formatSkillHtml(skill.PassiveHeader) || 'Inherent Passive'"></span>
        </div>
        <div
          class="text-xs leading-relaxed p-3 rounded border border-default bg-muted/20"
          v-html="formatSkillHtml(skill.PassiveDescription)"
        ></div>
      </div>

      <!-- Ultimate -->
      <div v-if="skill.UltimateHeader || skill.UltimateDescription || ultimateName" class="space-y-1.5 pt-2 border-t border-default">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <UBadge color="primary" variant="subtle" size="xs">Ultimate</UBadge>
            <span class="text-xs font-bold" v-html="formatSkillHtml(skill.UltimateHeader) || ultimateName || 'Ultimate Skill'"></span>
          </div>
          <UBadge v-if="ultimateCooldown" color="neutral" variant="outline" size="xs">
            Cooldown: {{ ultimateCooldown }}s
          </UBadge>
        </div>
        <div
          v-if="skill.UltimateDescription"
          class="text-xs leading-relaxed p-3 rounded border border-default bg-muted/20"
          v-html="formatSkillHtml(skill.UltimateDescription)"
        ></div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { SkillData } from '~/types/unit'
import { formatSkillHtml } from '~/utils/formatters'

defineProps<{
  skill: SkillData | any
  ultimateName?: string
  ultimateCooldown?: number
}>()
</script>

