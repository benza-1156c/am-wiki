<template>
  <UApp>
    <div class="min-h-screen flex flex-col">
      <header class="border-b border-default sticky top-0 z-40 bg-background/80 backdrop-blur">
        <UContainer class="h-16 flex items-center justify-between">
          <NuxtLink to="/" class="flex items-center gap-2.5">
            <UButton icon="i-lucide-calculator" variant="subtle" color="primary" square size="md" />
            <div>
              <div class="flex items-center gap-2">
                <span class="font-bold text-base">AM Calculator</span>
                <UBadge variant="subtle" color="primary" size="xs">Game Math</UBadge>
              </div>
              <p class="text-xs text-muted">Level 1–80 & Awakening (★) Engine</p>
            </div>
          </NuxtLink>

          <NuxtLink to="/admin" title="Admin Control">
            <UButton icon="i-lucide-shield" variant="ghost" color="neutral" size="sm" />
          </NuxtLink>
        </UContainer>
      </header>

      <main class="flex-1 py-6">
        <UContainer>
          <NuxtPage />
        </UContainer>
      </main>

      <footer class="border-t border-default py-4 text-xs text-muted">
        <UContainer class="flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Anime Movement Stat Calculator</span>
          <span>Exact Game Formulas from CalculateUnitsStats</span>
        </UContainer>
      </footer>
    </div>
  </UApp>
</template>

<script setup lang="ts">
</script>
