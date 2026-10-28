<template>
  <UCard v-if="skillData">
    <template #header>
      <div class="flex items-center justify-between gap-2">
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-shield-alert" class="w-4 h-4 text-primary" />
          <h3 class="font-bold text-sm">Passive & Ultimate Abilities</h3>
        </div>

        <!-- Language Switcher: Google Translate Runtime vs Authentic English -->
        <div class="flex items-center gap-1.5">
          <div class="flex items-center bg-white/5 rounded-lg p-0.5 border border-white/10 text-xs">
            <button
              type="button"
              class="px-2 py-0.5 rounded transition-all flex items-center gap-1"
              :class="currentLang === 'th' ? 'bg-primary/20 text-primary font-semibold shadow-sm' : 'text-neutral-400 hover:text-white'"
              @click="currentLang = 'th'"
              title="แปลไทยด้วย Google Translate (Runtime)"
            >
              <span>🇹🇭 แปลไทย</span>
              <UIcon v-if="isTranslating" name="i-lucide-loader-2" class="w-3 h-3 animate-spin text-primary" />
            </button>
            <button
              type="button"
              class="px-2 py-0.5 rounded transition-all"
              :class="currentLang === 'en' ? 'bg-primary/20 text-primary font-semibold shadow-sm' : 'text-neutral-400 hover:text-white'"
              @click="currentLang = 'en'"
              title="แสดงข้อความภาษาอังกฤษแท้จาก Database"
            >
              <span>🇺🇸 Original EN</span>
            </button>
          </div>
        </div>
      </div>
    </template>

    <div class="space-y-4">
      <!-- Passive Ability -->
      <div v-if="skillData.PassiveDescription || displayPassiveDescription" class="space-y-1.5">
        <div class="flex items-center justify-between gap-2">
          <div class="flex items-center gap-2 min-w-0">
            <UBadge color="warning" variant="subtle" size="xs">Passive</UBadge>
            <span
              class="text-xs font-bold truncate"
              v-html="formatSkillHtml(displayPassiveHeader) || 'Inherent Passive'"
            ></span>
          </div>

          <span v-if="currentLang === 'th'" class="text-[10px] text-muted font-mono flex items-center gap-1 shrink-0">
            <UIcon name="i-lucide-sparkles" class="w-3 h-3 text-amber-400" />
            <span>Google แปลภาษา</span>
          </span>
        </div>

        <div
          class="text-xs leading-relaxed p-3 rounded-lg border border-default bg-neutral-900/40"
          v-html="formatSkillHtml(displayPassiveDescription)"
        ></div>
      </div>

      <!-- Ultimate Ability -->
      <div
        v-if="skillData.UltimateHeader || skillData.UltimateDescription || displayUltimateDescription || ultName"
        class="space-y-1.5 pt-2 border-t border-default"
      >
        <div class="flex items-center justify-between gap-2">
          <div class="flex items-center gap-2 min-w-0">
            <UBadge color="primary" variant="subtle" size="xs">Ultimate</UBadge>
            <span
              class="text-xs font-bold truncate"
              v-html="formatSkillHtml(displayUltimateHeader) || ultName || 'Ultimate Skill'"
            ></span>
          </div>

          <UBadge v-if="ultCooldown" color="neutral" variant="outline" size="xs" class="shrink-0">
            Cooldown: {{ ultCooldown }}s
          </UBadge>
        </div>

        <div
          v-if="displayUltimateDescription"
          class="text-xs leading-relaxed p-3 rounded-lg border border-default bg-neutral-900/40"
          v-html="formatSkillHtml(displayUltimateDescription)"
        ></div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
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

// Language Mode: 'th' for runtime Google Translate, 'en' for authentic database original
const currentLang = ref<'th' | 'en'>('th')
const isTranslating = ref<boolean>(false)

const translatedTexts = ref<{
  passiveHeader?: string
  passiveDescription?: string
  ultimateHeader?: string
  ultimateDescription?: string
}>({})

// Client-side cache to make switching back and forth 0ms instant
const clientCache = new Map<string, string>()

async function translateIfNeeded() {
  if (!skillData.value || currentLang.value !== 'th') return

  const textsToTranslate: { key: string; text: string }[] = []

  const pHeader = skillData.value.PassiveHeader
  const pDesc = skillData.value.PassiveDescription
  const uHeader = skillData.value.UltimateHeader || ultName.value
  const uDesc = skillData.value.UltimateDescription

  if (pHeader) {
    if (clientCache.has(pHeader)) {
      translatedTexts.value.passiveHeader = clientCache.get(pHeader)
    } else {
      textsToTranslate.push({ key: 'passiveHeader', text: pHeader })
    }
  }

  if (pDesc) {
    if (clientCache.has(pDesc)) {
      translatedTexts.value.passiveDescription = clientCache.get(pDesc)
    } else {
      textsToTranslate.push({ key: 'passiveDescription', text: pDesc })
    }
  }

  if (uHeader) {
    if (clientCache.has(uHeader)) {
      translatedTexts.value.ultimateHeader = clientCache.get(uHeader)
    } else {
      textsToTranslate.push({ key: 'ultimateHeader', text: uHeader })
    }
  }

  if (uDesc) {
    if (clientCache.has(uDesc)) {
      translatedTexts.value.ultimateDescription = clientCache.get(uDesc)
    } else {
      textsToTranslate.push({ key: 'ultimateDescription', text: uDesc })
    }
  }

  if (textsToTranslate.length === 0) return

  isTranslating.value = true
  try {
    const res = await $fetch<{ translations: string[] }>('/api/translate', {
      method: 'POST',
      body: {
        texts: textsToTranslate.map(item => item.text),
        from: 'en',
        to: 'th'
      }
    })

    if (res && res.translations) {
      textsToTranslate.forEach((item, idx) => {
        const translated = res.translations[idx] || item.text
        clientCache.set(item.text, translated)
        ;(translatedTexts.value as any)[item.key] = translated
      })
    }
  } catch (err) {
    console.warn('Runtime translation failed, showing original English text:', err)
  } finally {
    isTranslating.value = false
  }
}

watch(
  [() => skillData.value, currentLang],
  () => {
    translateIfNeeded()
  },
  { immediate: true, deep: true }
)

const displayPassiveHeader = computed(() => {
  if (currentLang.value === 'th' && translatedTexts.value.passiveHeader) {
    return translatedTexts.value.passiveHeader
  }
  return skillData.value?.PassiveHeader || ''
})

const displayPassiveDescription = computed(() => {
  if (currentLang.value === 'th' && translatedTexts.value.passiveDescription) {
    return translatedTexts.value.passiveDescription
  }
  return skillData.value?.PassiveDescription || ''
})

const displayUltimateHeader = computed(() => {
  if (currentLang.value === 'th' && translatedTexts.value.ultimateHeader) {
    return translatedTexts.value.ultimateHeader
  }
  return skillData.value?.UltimateHeader || ultName.value || ''
})

const displayUltimateDescription = computed(() => {
  if (currentLang.value === 'th' && translatedTexts.value.ultimateDescription) {
    return translatedTexts.value.ultimateDescription
  }
  return skillData.value?.UltimateDescription || ''
})
</script>
