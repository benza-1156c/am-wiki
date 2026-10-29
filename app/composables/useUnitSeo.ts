import { computed } from 'vue'
import { getRobloxImageUrl } from '~/utils/formatters'
import type { useCombatCalculatorStore } from '~/composables/useCombatCalculatorStore'

export function useUnitSeo(store: ReturnType<typeof useCombatCalculatorStore>) {
  const route = useRoute()

  const unitName = computed(() => store.currentUnit?.displayName || store.currentUnit?.name || 'Unit')
  const unitSeries = computed(() => store.currentUnit?.series || 'Other')
  const unitRarity = computed(() => store.currentUnit?.rarity || 'Secret')
  const unitElement = computed(() => store.currentUnit?.element || 'None')
  const unitIcon = computed(() => {
    const icon = store.currentUnit?.icon || (store.currentUnit?.id ? `/images/units/${store.currentUnit.id}.png` : '')
    return getRobloxImageUrl(icon) || icon
  })

  const traitNames = computed(() => {
    const list = store.currentTraits?.map((t) => t.TraitDisplayName).filter(Boolean) || []
    return list.length > 0 ? list.join(', ') : 'None'
  })

  const atk = computed(() => (store.calculatedStats?.attack ?? 0).toLocaleString())
  const hp = computed(() => (store.calculatedStats?.health ?? 0).toLocaleString())
  const dps = computed(() => (store.calculatedStats?.dps ?? 0).toLocaleString())
  const range = computed(() => String(store.calculatedStats?.range ?? 0))
  const spa = computed(() => String(store.calculatedStats?.attackSpeed ?? 0))
  const cost = computed(() => store.calculatedStats?.cost ?? 0)

  const gearsSummary = computed(() => {
    const active = Object.values(store.activeEquippedGears || {}).filter(Boolean) as any[]
    return active.map((g) => g.Name).join(', ') || 'None equipped'
  })

  const canonicalUrl = computed(() => `https://am-wiki.vercel.app${route.path}`)

  // Comprehensive SEO Meta Tags
  useSeoMeta({
    title: () => `${unitName.value} (${store.selectedStars}★ Lv.${store.unitLevel}) - Anime Mysterious Calculator`,
    description: () =>
      `Calculate Anime Mysterious combat stats for ${unitName.value}: ${atk.value} DMG, ${hp.value} HP, ${dps.value} DPS, ${range.value} Range, ${spa.value}s SPA.`,
    ogTitle: () => `${unitName.value} (${store.selectedStars}★ Lv.${store.unitLevel}) - Anime Mysterious`,
    ogDescription: () =>
      `DMG: ${atk.value} | HP: ${hp.value} | DPS: ${dps.value} | Range: ${range.value} | SPA: ${spa.value}s | Cost: ¥${cost.value}`,
    ogType: 'website',
    ogUrl: () => canonicalUrl.value,
    twitterCard: 'summary_large_image',
    twitterTitle: () => `${unitName.value} (${store.selectedStars}★ Lv.${store.unitLevel}) - Anime Mysterious`,
    twitterDescription: () =>
      `DMG: ${atk.value} | HP: ${hp.value} | DPS: ${dps.value} | Range: ${range.value} | SPA: ${spa.value}s | Cost: ¥${cost.value}`
  })

  // Schema.org Structured Data & Canonical Link
  useHead({
    link: [
      {
        rel: 'canonical',
        href: canonicalUrl
      }
    ],
    script: [
      {
        type: 'application/ld+json',
        innerHTML: computed(() =>
          JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ItemPage',
            name: `${unitName.value} - Anime Mysterious Wiki`,
            description: `Combat calculator and stats for ${unitName.value} in Anime Mysterious.`,
            image: unitIcon.value ? `https://am-wiki.vercel.app${unitIcon.value.startsWith('/') ? '' : '/'}${unitIcon.value}` : undefined
          })
        )
      }
    ]
  })

  // Dynamic OpenGraph Image Generation (Takumi Engine)
  defineOgImage('UnitOgImage', {
    unitName: () => unitName.value,
    unitSeries: () => unitSeries.value,
    unitRarity: () => unitRarity.value,
    unitElement: () => unitElement.value,
    unitIcon: () => unitIcon.value,
    stars: () => store.selectedStars,
    level: () => store.unitLevel,
    upgrade: () => store.upgradeLevel,
    traitName: () => traitNames.value,
    cost: () => cost.value,
    damage: () => atk.value,
    health: () => hp.value,
    dps: () => dps.value,
    range: () => range.value,
    spa: () => spa.value,
    gearsSummary: () => gearsSummary.value
  })
}

