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
          :rows="8"
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
      :description="isJsonSyntaxError ? 'ข้อความ JSON ที่วางอาจตกหล่นหรือขาดช่วง (เช่น คัดลอกมาไม่ครบ หรือขาดเครื่องหมายปีกกาเปิด { ด้านหน้า) แนะนำให้ใช้ปุ่ม Choose JSON File ด้านบนเพื่อเลือกไฟล์ตรงๆ จะไม่ตกหล่นครับ' : undefined"
      close
      @update:open="errorMessage = ''"
    />

    <!-- Analysis Result & Diff Inspector -->
    <UCard v-if="analysisResult" class="space-y-4">
      <template #header>
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div class="space-y-1">
            <h2 class="font-bold text-sm flex items-center gap-2">
              <UIcon name="i-lucide-git-compare" class="text-primary text-base" />
              <span>Diff & Database Comparison</span>
            </h2>
            <div class="flex flex-wrap items-center gap-2 text-xs">
              <UBadge color="neutral" variant="subtle" size="xs">
                Total: {{ analysisResult.mergedUnits.length }}
              </UBadge>
              <UBadge
                :color="analysisResult.updatedCount > 0 ? 'warning' : 'neutral'"
                variant="subtle"
                size="xs"
              >
                ✏️ Modified: {{ analysisResult.updatedCount }}
              </UBadge>
              <UBadge
                :color="analysisResult.addedCount > 0 ? 'success' : 'neutral'"
                variant="subtle"
                size="xs"
              >
                ➕ New: {{ analysisResult.addedCount }}
              </UBadge>
              <UBadge color="neutral" variant="subtle" size="xs">
                ⚪ Unchanged: {{ analysisResult.unchangedCount }}
              </UBadge>
            </div>
          </div>

          <UButton
            :label="`Save to database.json (${analysisResult.updatedCount} modified, ${analysisResult.addedCount} new)`"
            icon="i-lucide-save"
            color="primary"
            variant="solid"
            :loading="isSaving"
            @click="saveToDatabase"
          />
        </div>
      </template>

      <!-- Filter Tabs & Search -->
      <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-3 border-b border-default">
        <div class="flex flex-wrap items-center gap-1.5">
          <UButton
            :variant="activeTab === 'all' ? 'solid' : 'ghost'"
            :color="activeTab === 'all' ? 'primary' : 'neutral'"
            size="xs"
            @click="activeTab = 'all'"
          >
            All ({{ analysisResult.diffItems.length }})
          </UButton>
          <UButton
            :variant="activeTab === 'modified' ? 'solid' : 'ghost'"
            :color="activeTab === 'modified' ? 'warning' : 'neutral'"
            size="xs"
            @click="activeTab = 'modified'"
          >
            ✏️ Modified ({{ analysisResult.updatedCount }})
          </UButton>
          <UButton
            :variant="activeTab === 'new' ? 'solid' : 'ghost'"
            :color="activeTab === 'new' ? 'success' : 'neutral'"
            size="xs"
            @click="activeTab = 'new'"
          >
            ➕ New ({{ analysisResult.addedCount }})
          </UButton>
          <UButton
            :variant="activeTab === 'unchanged' ? 'solid' : 'ghost'"
            :color="activeTab === 'unchanged' ? 'neutral' : 'neutral'"
            size="xs"
            @click="activeTab = 'unchanged'"
          >
            ⚪ Unchanged ({{ analysisResult.unchangedCount }})
          </UButton>
        </div>

        <div class="w-full sm:w-64">
          <UInput
            v-model="searchQuery"
            placeholder="Filter by unit name..."
            icon="i-lucide-search"
            size="xs"
          />
        </div>
      </div>

      <!-- Diff Items List -->
      <div class="max-h-96 overflow-y-auto space-y-2 pr-1">
        <div
          v-if="filteredDiffItems.length === 0"
          class="py-8 text-center text-xs text-muted"
        >
          No units match the selected filter.
        </div>

        <div
          v-for="item in filteredDiffItems"
          :key="item.id"
          class="p-3 rounded-lg border border-default bg-card/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-primary/40 transition-colors"
        >
          <!-- Left: Unit Info -->
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-md overflow-hidden bg-neutral-900 border border-default flex items-center justify-center shrink-0">
              <img
                v-if="item.unit.icon && getRobloxImageUrl(item.unit.icon)"
                :src="getRobloxImageUrl(item.unit.icon)!"
                class="w-full h-full object-cover"
                loading="lazy"
                alt=""
              />
              <UIcon
                v-else
                name="i-lucide-user"
                class="w-5 h-5 text-muted"
              />
            </div>

            <div class="space-y-1">
              <div class="flex flex-wrap items-center gap-2">
                <span class="font-bold text-xs">{{ item.displayName || item.name }}</span>
                <UBadge
                  v-if="item.status === 'modified'"
                  color="warning"
                  variant="subtle"
                  size="xs"
                >
                  <UIcon name="i-lucide-edit-3" class="w-3 h-3 mr-1" />
                  Modified ({{ item.diffs.length }})
                </UBadge>
                <UBadge
                  v-else-if="item.status === 'new'"
                  color="success"
                  variant="subtle"
                  size="xs"
                >
                  <UIcon name="i-lucide-plus" class="w-3 h-3 mr-1" />
                  New Unit
                </UBadge>
                <UBadge
                  v-else
                  color="neutral"
                  variant="subtle"
                  size="xs"
                >
                  <UIcon name="i-lucide-check" class="w-3 h-3 mr-1" />
                  Unchanged
                </UBadge>

                <UBadge color="neutral" variant="outline" size="xs">{{ item.unit.rarity }}</UBadge>
                <UBadge color="primary" variant="outline" size="xs">{{ item.unit.element }}</UBadge>
              </div>

              <!-- Diffs Chips -->
              <div v-if="item.status === 'modified' && item.diffs.length > 0" class="flex flex-wrap items-center gap-1.5 pt-0.5">
                <UBadge
                  v-for="(diff, dIdx) in item.diffs"
                  :key="dIdx"
                  color="warning"
                  variant="outline"
                  size="xs"
                  class="font-mono text-[10px]"
                >
                  <span class="font-semibold">{{ diff.label }}:</span>
                  <template v-if="diff.field === 'icon'">
                    <span v-if="!diff.oldValue" class="text-emerald-400 font-semibold ml-1">Icon Added</span>
                    <span v-else class="text-amber-400 ml-1">Icon Replaced</span>
                  </template>
                  <template v-else>
                    <span class="line-through opacity-70 mx-1">{{ diff.oldValue ?? 'null' }}</span>
                    <UIcon name="i-lucide-arrow-right" class="w-3 h-3 inline text-warning" />
                    <span class="text-primary font-bold ml-1">{{ diff.newValue }}</span>
                  </template>
                </UBadge>
              </div>

              <div v-else-if="item.status === 'new'" class="text-[11px] text-muted">
                Base ATK: {{ item.unit.statsAtBase?.attack }} | Cost: {{ item.unit.statsAtBase?.cost }} | SPD: {{ item.unit.statsAtBase?.attackSpeed }}s
              </div>

              <div v-else class="text-[11px] text-muted italic">
                Matches database.json identically (No changes)
              </div>
            </div>
          </div>

          <!-- Right: Quick Stat Glance -->
          <div class="flex items-center gap-3 text-xs text-muted shrink-0 pl-12 sm:pl-0 font-mono">
            <span>ATK: {{ item.unit.statsAtBase?.attack }}</span>
            <span>CD: {{ item.unit.spawnCooldown }}s</span>
          </div>
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { parseAndMergeUnits } from '~/utils/unitImporter'
import { getRobloxImageUrl } from '~/utils/formatters'
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
const activeTab = ref<'all' | 'modified' | 'new' | 'unchanged'>('modified')
const searchQuery = ref('')

const isJsonSyntaxError = computed(() => {
  const msg = errorMessage.value.toLowerCase()
  return msg.includes('json') || msg.includes('token') || msg.includes('position') || msg.includes('syntax')
})

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

const filteredDiffItems = computed(() => {
  if (!analysisResult.value?.diffItems) return []
  let items = analysisResult.value.diffItems

  if (activeTab.value !== 'all') {
    items = items.filter(item => item.status === activeTab.value)
  }

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim()
    items = items.filter(item =>
      item.name.toLowerCase().includes(q) ||
      item.displayName.toLowerCase().includes(q) ||
      item.id.toLowerCase().includes(q)
    )
  }

  return items
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

    // Automatically select the most relevant tab
    if (result.updatedCount > 0) {
      activeTab.value = 'modified'
    } else if (result.addedCount > 0) {
      activeTab.value = 'new'
    } else {
      activeTab.value = 'all'
    }
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
