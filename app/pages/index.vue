<template>
  <div class="space-y-6">
    <div class="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#0f172a] via-[#090d16] to-[#1e1b4b] p-6 sm:p-8 md:p-10 shadow-2xl">
      <div class="absolute -top-24 -right-24 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none"></div>
      <div class="absolute -bottom-24 -left-24 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div class="relative z-10 space-y-4 max-w-2xl">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-wider uppercase">
          <UIcon name="i-lucide-book-open" class="w-3.5 h-3.5" />
          <span>Anime Mysterious Wiki</span>
        </div>

        <h1 class="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
          Units Encyclopedia <span class="text-primary">& Calculator</span>
        </h1>

        <div class="pt-2 flex flex-wrap items-center gap-3">
          <UButton
            icon="i-lucide-search"
            label="Select Unit / เลือกตัวละคร"
            variant="solid"
            color="primary"
            size="md"
            @click="store.isSelectorOpen = true"
          />

          <NuxtLink to="/units/dracula-vampire-progenitor">
            <UButton
              icon="i-lucide-calculator"
              label="Go to Calculator"
              variant="outline"
              color="neutral"
              size="md"
            />
          </NuxtLink>
        </div>
      </div>
    </div>

    <UnitSelector />
  </div>
</template>

<script setup lang="ts">
const store = useCombatCalculatorStore()

useSeoMeta({
  title: 'Anime Mysterious Wiki - Units Encyclopedia & Calculator',
  description: 'Anime Mysterious wiki: explore all units, stats, and calculate builds with gears and traits.',
  ogTitle: 'Anime Mysterious Wiki - Units Encyclopedia & Calculator',
  ogDescription: 'Explore units, their max stats, and calculate builds in Anime Mysterious.',
  ogType: 'website'
})
</script>
