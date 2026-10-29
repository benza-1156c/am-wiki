export default defineNuxtConfig({
  modules: ['@nuxt/image', '@nuxt/ui', 'nuxt-og-image'],
  site: {
    url: process.env.NUXT_PUBLIC_SITE_URL || 'https://am-wiki.vercel.app',
    name: 'Anime Mysterious'
  },
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    adminPassword: process.env.ADMIN_PASSWORD
  },
  app: {
    head: {
      title: 'Anime Mysterious',
      meta: [
        { name: 'description', content: 'Anime Mysterious Wiki - Comprehensive unit database, level upgrade stats calculator, compare tool, gears and traits.' }
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600;700&display=swap' }
      ]
    }
  },
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true }
})
