<template>
  <div class="space-y-6 max-w-6xl mx-auto">
    <!-- 1. Password Gate (if not authenticated) -->
    <div v-if="!isAuthenticated" class="max-w-md mx-auto pt-10">
      <UCard>
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-shield-alert" class="w-5 h-5 text-primary" />
            <h2 class="font-bold text-base">Admin Verification</h2>
          </div>
        </template>

        <form @submit.prevent="verifyKey" class="space-y-4">
          <p class="text-xs text-muted">
            This area manages game data, units, gears, traits, and database.json. Please enter your administrator password.
          </p>

          <UInput
            v-model="inputKey"
            type="password"
            placeholder="Enter Admin Password"
            icon="i-lucide-key"
            size="lg"
            autofocus
          />

          <UAlert
            v-if="loginError"
            color="error"
            variant="subtle"
            icon="i-lucide-alert-circle"
            :title="loginError"
          />

          <UButton
            type="submit"
            label="Access Admin Panel"
            icon="i-lucide-unlock"
            color="primary"
            block
            size="lg"
            :loading="isVerifying"
          />
        </form>
      </UCard>
    </div>

    <!-- 2. Authenticated Admin Dashboard -->
    <div v-else class="space-y-6">
      <!-- Admin Header -->
      <UCard>
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
              <UIcon name="i-lucide-database" class="w-5 h-5" />
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h1 class="font-bold text-lg">Database & Content Manager</h1>
                <UBadge color="success" variant="subtle" size="xs">Admin Active</UBadge>
              </div>
              <p class="text-xs text-muted">
                Edit units, gears, and traits individually, or import complete game dump JSON.
              </p>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <UButton
              label="Lock Session"
              icon="i-lucide-lock"
              color="neutral"
              variant="outline"
              size="sm"
              @click="lockSession"
            />
          </div>
        </div>
      </UCard>

      <!-- Navigation Tabs -->
      <div class="flex flex-wrap items-center gap-2 border-b border-default pb-3">
        <UButton
          v-for="tab in tabs"
          :key="tab.id"
          :icon="tab.icon"
          :label="tab.label"
          :variant="activeTab === tab.id ? 'solid' : 'ghost'"
          :color="activeTab === tab.id ? 'primary' : 'neutral'"
          size="sm"
          @click="activeTab = tab.id"
        />
      </div>

      <!-- Tab 1: Units Editor -->
      <AdminUnitEditor
        v-if="activeTab === 'units'"
        :admin-key="verifiedKey"
      />

      <!-- Tab 2: Gears Editor -->
      <AdminGearEditor
        v-else-if="activeTab === 'gears'"
        :admin-key="verifiedKey"
      />

      <!-- Tab 3: Traits Editor -->
      <AdminTraitEditor
        v-else-if="activeTab === 'traits'"
        :admin-key="verifiedKey"
      />

      <!-- Tab 4: JSON Dump Importer -->
      <AdminJsonImporter
        v-else-if="activeTab === 'json'"
        :admin-key="verifiedKey"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import AdminUnitEditor from '~/components/admin/AdminUnitEditor.vue'
import AdminGearEditor from '~/components/admin/AdminGearEditor.vue'
import AdminTraitEditor from '~/components/admin/AdminTraitEditor.vue'
import AdminJsonImporter from '~/components/admin/AdminJsonImporter.vue'

const isAuthenticated = ref(false)
const inputKey = ref('')
const verifiedKey = ref('')
const loginError = ref('')
const isVerifying = ref(false)

const activeTab = ref<'units' | 'gears' | 'traits' | 'json'>('units')

const { dbData } = useDatabase()

const tabs = computed(() => [
  { id: 'units' as const, label: `Units (${dbData.value?.units?.length || 0})`, icon: 'i-lucide-user' },
  { id: 'gears' as const, label: `Gears (${Array.isArray(dbData.value?.gears) ? dbData.value.gears.length : 0})`, icon: 'i-lucide-shield' },
  { id: 'traits' as const, label: `Traits (${Array.isArray(dbData.value?.traits) ? dbData.value.traits.length : 0})`, icon: 'i-lucide-award' },
  { id: 'json' as const, label: 'JSON Dump / Import', icon: 'i-lucide-file-code' }
])

async function verifyKey() {
  loginError.value = ''
  if (!inputKey.value) {
    loginError.value = 'Please enter administrator password.'
    return
  }

  isVerifying.value = true
  try {
    const res = await $fetch<{ success: boolean }>('/api/admin/verify', {
      method: 'POST',
      body: { password: inputKey.value }
    })

    if (res.success) {
      isAuthenticated.value = true
      verifiedKey.value = inputKey.value
      inputKey.value = ''
    }
  } catch (err: any) {
    loginError.value = err.data?.statusMessage || err.statusMessage || 'Invalid administrator password. Please try again.'
  } finally {
    isVerifying.value = false
  }
}

function lockSession() {
  isAuthenticated.value = false
  verifiedKey.value = ''
  loginError.value = ''
}
</script>
