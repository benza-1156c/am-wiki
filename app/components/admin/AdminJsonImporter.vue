<template>
  <div class="space-y-6">
    <UCard>
      <template #header>
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-clipboard-paste" class="text-primary" />
            <span class="text-sm font-bold">Paste or Drop Game Dump JSON</span>
          </div>

          <!-- Quick Action Buttons -->
          <div class="flex items-center gap-2">
            <input
              ref="fileInputRef"
              type="file"
              accept=".json"
              class="hidden"
              @change="handleFileSelected"
            >
            <UButton
              label="Choose JSON File"
              icon="i-lucide-file-up"
              variant="outline"
              color="neutral"
              size="xs"
              @click="triggerFileInput"
            />
            <UButton
              label="Paste from Clipboard"
              icon="i-lucide-clipboard"
              variant="outline"
              color="primary"
              size="xs"
              @click="pasteFromClipboard"
            />
            <UButton
              v-if="rawJsonInput"
              label="Clear"
              variant="ghost"
              color="neutral"
              size="xs"
              @click="clearInput"
            />
          </div>
        </div>
      </template>

      <div class="space-y-4">
        <UTextarea
          v-model="rawJsonInput"
          placeholder="Paste complete game dump JSON here (e.g. from lua/dump_all.luau or any units list)..."
          :rows="10"
          class="font-mono text-xs w-full"
          @input="reanalyze"
        />

        <!-- Detected Payload Summary Badges -->
        <div class="flex flex-wrap items-center justify-between gap-2 text-xs border-t border-default pt-3">
          <div class="flex flex-wrap items-center gap-2">
            <UBadge
              :color="detectedCounts.units > 0 ? 'primary' : 'neutral'"
              variant="subtle"
              size="xs"
            >
              Units: {{ detectedCounts.units }}
            </UBadge>
            <UBadge
              :color="detectedCounts.skills > 0 ? 'warning' : 'neutral'"
              variant="subtle"
              size="xs"
            >
              Skills: {{ detectedCounts.skills }}
            </UBadge>
            <UBadge
              :color="detectedCounts.gears > 0 ? 'success' : 'neutral'"
              variant="subtle"
              size="xs"
            >
              Gears: {{ detectedCounts.gears }}
            </UBadge>
            <UBadge
              :color="detectedCounts.traits > 0 ? 'info' : 'neutral'"
              variant="subtle"
              size="xs"
            >
              Traits: {{ detectedCounts.traits }}
            </UBadge>
          </div>

          <span class="text-muted">
            {{ rawJsonInput ? `${rawJsonInput.length.toLocaleString()} characters` : 'Ready for input' }}
          </span>
        </div>
      </div>
    </UCard>

    <!-- Feedback Alerts -->
    <UAlert
      v-if="successMessage"
      color="success"
      variant="subtle"
      icon="i-lucide-check-circle-2"
      :title="successMessage"
      close
      @update:open="successMessage = ''"
    />

    <UAlert
      v-if="errorMessage"
      color="error"
      variant="subtle"
      icon="i-lucide-alert-triangle"
      :title="errorMessage"
      close
      @update:open="errorMessage = ''"
    />

    <!-- Analysis Result & Save Action -->
    <UCard v-if="analysisResult">
      <template #header>
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 class="font-bold text-sm flex items-center gap-2">
              <UIcon name="i-lucide-check-circle" class="text-primary" />
              <span>Ready to Apply to database.json</span>
            </h2>
            <p class="text-xs text-muted">
              Total: {{ analysisResult.mergedUnits.length }} units | Added: +{{ analysisResult.addedCount }} | Updated: {{ analysisResult.updatedCount }}
            </p>
          </div>

          <UButton
            label="Save to database.json"
            icon="i-lucide-save"
            color="primary"
            variant="solid"
            :loading="isSaving"
            @click="saveToDatabase"
          />
        </div>
      </template>

      <!-- Preview List -->
      <div class="max-h-80 overflow-y-auto space-y-1">
        <div
          v-for="u in analysisResult.mergedUnits.slice(0, 50)"
          :key="u.id"
          class="flex items-center justify-between p-2 rounded text-xs border border-default"
        >
          <div class="flex items-center gap-2">
            <span class="font-bold">{{ u.displayName || u.name }}</span>
            <UBadge color="neutral" variant="subtle" size="xs">{{ u.rarity }}</UBadge>
            <UBadge color="primary" variant="subtle" size="xs">{{ u.element }}</UBadge>
            <UBadge v-if="u.skill" color="warning" variant="subtle" size="xs">Passive Bound</UBadge>
          </div>
          <div class="flex items-center gap-4 text-muted font-mono">
            <span>Base ATK: {{ u.statsAtBase?.attack }}</span>
            <span>Max ATK: {{ u.statsAtMax?.attack }}</span>
          </div>
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { parseAndMergeUnits } from '~/utils/unitCalculator'
import type { MergeResult } from '~/types/unit'

const props = defineProps<{
  adminKey: string
}>()

const { units: currentUnits, handleUnitsUpdated, refresh } = useDatabase()

const fileInputRef = ref<HTMLInputElement | null>(null)
const rawJsonInput = ref('')
const isSaving = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const analysisResult = ref<MergeResult | null>(null)
const parsedPayload = ref<any>(null)

const detectedCounts = computed(() => {
  const p = parsedPayload.value
  if (!p || typeof p !== 'object') {
    return { units: 0, skills: 0, gears: 0, traits: 0 }
  }
  const unitsCount = analysisResult.value?.mergedUnits?.length || 0
  const skillsCount = p.skills && typeof p.skills === 'object' ? Object.keys(p.skills).length : 0
  const gearsCount = p.gears && typeof p.gears === 'object' ? (Array.isArray(p.gears) ? p.gears.length : Object.keys(p.gears).length) : 0
  const traitsCount = p.traits && typeof p.traits === 'object' ? (Array.isArray(p.traits) ? p.traits.length : Object.keys(p.traits).length) : 0

  return {
    units: unitsCount,
    skills: skillsCount,
    gears: gearsCount,
    traits: traitsCount
  }
})

function clearInput() {
  rawJsonInput.value = ''
  parsedPayload.value = null
  analysisResult.value = null
  errorMessage.value = ''
  successMessage.value = ''
}

function triggerFileInput() {
  fileInputRef.value?.click()
}

function handleFileSelected(e: Event) {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (event) => {
    rawJsonInput.value = (event.target?.result as string) || ''
    reanalyze()
    successMessage.value = `Loaded "${file.name}" successfully!`
  }
  reader.onerror = () => {
    errorMessage.value = `Failed to read "${file.name}"`
  }
  reader.readAsText(file)
  target.value = ''
}

async function pasteFromClipboard() {
  try {
    const text = await navigator.clipboard.readText()
    if (text) {
      rawJsonInput.value = text
      reanalyze()
      successMessage.value = 'Pasted JSON from clipboard!'
    }
  } catch (err: any) {
    errorMessage.value = 'Could not access clipboard automatically. Please press Ctrl + V in the box.'
  }
}

function reanalyze() {
  errorMessage.value = ''
  analysisResult.value = null
  parsedPayload.value = null
  if (!rawJsonInput.value.trim()) return

  try {
    const parsed = JSON.parse(rawJsonInput.value)
    parsedPayload.value = parsed

    const result = parseAndMergeUnits(
      parsed,
      currentUnits.value || [],
      {},
      'merge'
    )
    analysisResult.value = result
  } catch (err: any) {
    errorMessage.value = 'Invalid JSON: ' + err.message
  }
}

async function saveToDatabase() {
  if (!analysisResult.value?.mergedUnits) return
  isSaving.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const body: Record<string, any> = {
      units: analysisResult.value.mergedUnits
    }

    if (parsedPayload.value && typeof parsedPayload.value === 'object') {
      if (parsedPayload.value.skills) body.skills = parsedPayload.value.skills
      if (parsedPayload.value.gears) body.gears = parsedPayload.value.gears
      if (parsedPayload.value.traits) body.traits = parsedPayload.value.traits
    }

    const res = await $fetch<{ success: boolean; totalUnits: number; message: string }>('/api/units', {
      method: 'POST',
      headers: {
        'x-admin-key': props.adminKey
      },
      body
    })

    handleUnitsUpdated(analysisResult.value.mergedUnits)
    await refresh()
    successMessage.value = res.message || `Successfully saved ${analysisResult.value.mergedUnits.length} units to database.json!`
  } catch (err: any) {
    errorMessage.value = 'Failed to persist to database.json: ' + (err.statusMessage || err.message)
  } finally {
    isSaving.value = false
  }
}
</script>

