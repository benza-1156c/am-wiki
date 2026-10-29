<template>
  <UApp>
    <div class="min-h-screen flex flex-col bg-[#0b0f19] text-slate-100">
      <!-- Navbar -->
      <header class="border-b border-white/5 sticky top-0 z-40 bg-[#0b0f19]/80 backdrop-blur-md">
        <UContainer class="max-w-[1680px] w-full h-14 flex items-center justify-between">
          <div class="flex items-center gap-6">
            <NuxtLink to="/" class="flex items-center gap-2.5 group">
              <div class="flex items-center gap-1.5 font-['Outfit']">
                <span class="font-extrabold text-base tracking-tight text-white">Anime</span>
                <span class="font-extrabold text-base tracking-tight text-primary">Mysterious</span>
              </div>
            </NuxtLink>

            <nav class="hidden sm:flex items-center gap-1 text-xs font-medium text-slate-400">
              <NuxtLink
                to="/"
                class="px-2.5 py-1.5 rounded-md hover:text-white hover:bg-white/5 transition-colors"
                active-class="text-white bg-white/5 font-semibold"
              >
                Units
              </NuxtLink>
              <NuxtLink
                to="/units/dracula-vampire-progenitor"
                class="px-2.5 py-1.5 rounded-md hover:text-white hover:bg-white/5 transition-colors"
                active-class="text-white bg-white/5 font-semibold"
              >
                Calculator
              </NuxtLink>
            </nav>
          </div>

        </UContainer>
      </header>

      <!-- Main Content -->
      <main class="flex-1 py-6">
        <UContainer class="max-w-[1680px] w-full">
          <NuxtPage />
        </UContainer>
      </main>

      <!-- Footer -->
      <footer class="border-t border-white/5 py-6 text-xs text-slate-500">
     
      </footer>
    </div>
  </UApp>
</template>

<script setup lang="ts">
</script>
