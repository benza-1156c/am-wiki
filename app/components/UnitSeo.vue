<template>
  <!-- Headless SEO Component for SSR Meta & OG Image Generation -->
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { NormalizedUnit, CalculatedStats, UnitTrait } from '~/types/unit'
import { getRobloxImageUrl } from '~/utils/formatters'

const props = withDefaults(
  defineProps<{
    unit: NormalizedUnit | null
    stats: CalculatedStats | null
    stars?: number
    level?: number
    upgrade?: number
    traits?: UnitTrait[]
    gearsSummary?: string
  }>(),
  {
    stars: 6,
    level: 80,
    upgrade: 0,
    traits: () => [],
    gearsSummary: 'None equipped'
  }
)

const unitName = computed(() => props.unit?.displayName || props.unit?.name || 'Unit')
const unitSeries = computed(() => props.unit?.series || 'Other')
const unitRarity = computed(() => props.unit?.rarity || 'Secret')
const unitElement = computed(() => props.unit?.element || 'None')

const rawIcon = computed(() => {
  if (!props.unit) return ''
  if (props.unit.icon) return props.unit.icon
  if (props.unit.id) return `/images/units/${props.unit.id}.png`
  return ''
})

const iconUrl = computed(() => {
  const icon = rawIcon.value
  if (!icon) return ''
  return getRobloxImageUrl(icon) || icon
})

const traitNames = computed(() => {
  const list = props.traits?.map(t => t.TraitDisplayName).filter(Boolean) || []
  return list.length > 0 ? list.join(', ') : 'None'
})

const atk = computed(() => (props.stats?.attack ?? 0).toLocaleString())
const hp = computed(() => (props.stats?.health ?? 0).toLocaleString())
const dps = computed(() => (props.stats?.dps ?? 0).toLocaleString())
const range = computed(() => String(props.stats?.range ?? 0))
const spa = computed(() => String(props.stats?.attackSpeed ?? 0))
const cost = computed(() => props.stats?.cost ?? 0)

// SSR Head Meta Tags
useSeoMeta({
  title: () => `${unitName.value} (${props.stars}★ Lv.${props.level}) - Anime Mysterious Calculator`,
  description: () =>
    `Calculate Anime Mysterious combat stats for ${unitName.value}: ${atk.value} DMG, ${hp.value} HP, ${dps.value} DPS, ${range.value} Range, ${spa.value}s SPA.`,
  ogTitle: () => `${unitName.value} (${props.stars}★ Lv.${props.level}) - Anime Mysterious`,
  ogDescription: () =>
    `DMG: ${atk.value} | HP: ${hp.value} | DPS: ${dps.value} | Range: ${range.value} | SPA: ${spa.value}s | Cost: ¥${cost.value}`,
  ogType: 'website',
  twitterCard: 'summary_large_image'
})

// Schema.org Structured Data
useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: computed(() =>
        JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'ItemPage',
          name: `${unitName.value} - Anime Mysterious Wiki`,
          description: `Combat calculator and stats for ${unitName.value} in Anime Mysterious.`,
          image: iconUrl.value ? `https://am-wiki.vercel.app${iconUrl.value.startsWith('/') ? '' : '/'}${iconUrl.value}` : undefined
        })
      )
    }
  ]
})

// Dynamic OpenGraph Image Generation (Takumi Engine)
// Nuxt OG Image v7 uses defineOgImage('ComponentName', props)
defineOgImage('UnitOgImage', {
  unitName: unitName.value,
  unitSeries: unitSeries.value,
  unitRarity: unitRarity.value,
  unitElement: unitElement.value,
  unitIcon: iconUrl.value,
  stars: props.stars,
  level: props.level,
  upgrade: props.upgrade,
  traitName: traitNames.value,
  cost: cost.value,
  damage: atk.value,
  health: hp.value,
  dps: dps.value,
  range: range.value,
  spa: spa.value,
  gearsSummary: props.gearsSummary
})
</script>
