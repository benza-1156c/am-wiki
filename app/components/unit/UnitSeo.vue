<template>
  <!-- Headless SEO Component for SSR Meta & OG Image Generation -->
</template>

<script setup lang="ts">
const store = useCombatCalculatorStore()
useUnitSeo(store)
</script>
