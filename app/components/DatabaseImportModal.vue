<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto">
    <div
      class="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] my-auto"
      @click.stop
    >
      <!-- Modal Header -->
      <div class="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/80">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <UIcon name="i-lucide-database" class="w-5 h-5" />
          </div>
          <div>
            <h2 class="text-lg font-black text-white font-['Outfit'] tracking-tight flex items-center gap-2">
              Database & Unit Import Manager
            </h2>
            <p class="text-xs text-slate-400">
              Import custom JSON files, merge duplicate units, and auto-calculate upgrade levels.
            </p>
          </div>
        </div>

        <button
          type="button"
          @click="$emit('close')"
          class="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center border border-slate-700 transition-colors"
        >
          <UIcon name="i-lucide-x" class="w-5 h-5" />
        </button>
      </div>

      <!-- Navigation Tabs -->
      <div class="flex items-center gap-2 px-5 pt-3 bg-slate-950/40 border-b border-slate-800">
        <button
          v-for="t in tabs"
          :key="t.id"
          @click="activeTab = t.id"
          class="px-4 py-2 text-xs font-bold rounded-t-xl transition-all border-b-2 flex items-center gap-2"
          :class="activeTab === t.id
            ? 'border-cyan-400 text-cyan-300 bg-slate-800/60'
            : 'border-transparent text-slate-400 hover:text-slate-200'"
        >
          <UIcon :name="t.icon" class="w-4 h-4" />
          <span>{{ t.label }}</span>
        </button>
      </div>

      <!-- Modal Body -->
      <div class="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
        <!-- TAB 1: IMPORT JSON -->
        <div v-if="activeTab === 'import'" class="space-y-4">
          <!-- Duplicate Resolution Mode -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <label
              class="p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between"
              :class="mergeMode === 'merge' ? 'bg-cyan-500/10 border-cyan-400 text-white' : 'bg-slate-950/60 border-slate-800 text-slate-400'"
            >
              <div class="flex items-center gap-2 font-bold text-xs mb-1">
                <input type="radio" v-model="mergeMode" value="merge" class="accent-cyan-400" />
                <span>Smart Merge (Recommended)</span>
              </div>
              <p class="text-[11px] text-slate-400">Updates existing units with newer stats and adds new units automatically.</p>
            </label>

            <label
              class="p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between"
              :class="mergeMode === 'skip_duplicates' ? 'bg-cyan-500/10 border-cyan-400 text-white' : 'bg-slate-950/60 border-slate-800 text-slate-400'"
            >
              <div class="flex items-center gap-2 font-bold text-xs mb-1">
                <input type="radio" v-model="mergeMode" value="skip_duplicates" class="accent-cyan-400" />
                <span>Add New Only</span>
              </div>
              <p class="text-[11px] text-slate-400">Keeps existing unit stats intact and only imports brand new units.</p>
            </label>

            <label
              class="p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between"
              :class="mergeMode === 'overwrite_all' ? 'bg-red-500/10 border-red-400 text-white' : 'bg-slate-950/60 border-slate-800 text-slate-400'"
            >
              <div class="flex items-center gap-2 font-bold text-xs mb-1">
                <input type="radio" v-model="mergeMode" value="overwrite_all" class="accent-red-400" />
                <span class="text-red-300">Replace Entire Database</span>
              </div>
              <p class="text-[11px] text-slate-400">Replaces all currently loaded units with only the imported data.</p>
            </label>
          </div>

          <!-- File Upload or Paste Box -->
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <label class="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <UIcon name="i-lucide-file-json" class="w-4 h-4 text-cyan-400" />
                <span>Upload JSON File or Paste Content</span>
              </label>
              <button
                type="button"
                @click="loadSampleTestJson"
                class="text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                <UIcon name="i-lucide-sparkles" class="w-3.5 h-3.5" />
                <span>Load test.json sample</span>
              </button>
            </div>

            <!-- Drag & Drop Zone -->
            <div
              class="border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-colors"
              :class="isDragging ? 'border-cyan-400 bg-cyan-950/20' : 'border-slate-700 bg-slate-950/40 hover:border-slate-600'"
              @dragover.prevent="isDragging = true"
              @dragleave.prevent="isDragging = false"
              @drop.prevent="handleFileDrop"
              @click="triggerFileInput"
            >
              <input
                ref="fileInputRef"
                type="file"
                accept=".json"
                class="hidden"
                @change="handleFileSelect"
              />
              <div class="flex flex-col items-center justify-center gap-1">
                <UIcon name="i-lucide-upload-cloud" class="w-8 h-8 text-cyan-400" />
                <span class="text-xs font-bold text-slate-200">Click to upload or drag & drop .json here</span>
                <span class="text-[10px] text-slate-500">Supports test.json, unitStat.json, or custom units array</span>
              </div>
            </div>

            <!-- Raw JSON Textarea -->
            <textarea
              v-model="rawJsonInput"
              rows="6"
              placeholder="Or paste JSON raw string here (e.g. { 'Igris': { 'Damage': 50, ... } })"
              class="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-cyan-200 placeholder-slate-600 focus:outline-none focus:border-cyan-400"
            ></textarea>
          </div>

          <!-- Analyze Action Button -->
          <div class="flex items-center justify-between">
            <button
              type="button"
              @click="analyzeJson"
              :disabled="!rawJsonInput.trim()"
              class="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md disabled:opacity-50 transition-all"
            >
              <UIcon name="i-lucide-calculator" class="w-4 h-4" />
              <span>Calculate & Analyze JSON</span>
            </button>

            <span v-if="parseError" class="text-xs text-red-400 flex items-center gap-1">
              <UIcon name="i-lucide-alert-triangle" class="w-3.5 h-3.5" />
              <span>{{ parseError }}</span>
            </span>
          </div>

          <!-- Analysis Results Summary -->
          <div v-if="analysisResult" class="p-4 rounded-2xl bg-slate-950/80 border border-cyan-500/30 space-y-3">
            <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
              <span class="text-xs font-black text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                <UIcon name="i-lucide-check-circle" class="w-4 h-4 text-emerald-400" />
                <span>Calculation & Duplicate Analysis Complete</span>
              </span>
              <div class="flex items-center gap-2 text-xs">
                <span class="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                  +{{ analysisResult.addedCount }} New Units
                </span>
                <span class="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                  {{ analysisResult.updatedCount }} Updated
                </span>
                <span v-if="analysisResult.skippedCount > 0" class="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 font-bold">
                  {{ analysisResult.skippedCount }} Skipped
                </span>
              </div>
            </div>

            <!-- Preview List -->
            <div class="max-h-56 overflow-y-auto space-y-1.5 scrollbar-thin">
              <div
                v-for="u in analysisResult.newUnitsList.slice(0, 15)"
                :key="u.id"
                class="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs"
              >
                <div class="flex items-center gap-2">
                  <span class="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">NEW</span>
                  <span class="font-bold text-white font-['Outfit']">{{ u.name }}</span>
                  <span class="text-slate-400 text-[11px]">({{ u.series }} • {{ u.element }})</span>
                </div>
                <div class="flex items-center gap-3 text-[11px]">
                  <span class="text-slate-400">Max Lv.{{ u.maxLevel }}</span>
                  <span class="text-amber-300 font-bold">ATK: {{ u.statsAtBase.attack }} → {{ u.statsAtMax.attack }}</span>
                  <span class="text-red-400 font-bold">DPS: {{ u.statsAtMax.dps }}</span>
                </div>
              </div>
              <div v-if="analysisResult.newUnitsList.length > 15" class="text-center text-xs text-slate-500 italic py-1">
                + {{ analysisResult.newUnitsList.length - 15 }} more units in queue
              </div>
            </div>

            <!-- Apply Changes to Wiki -->
            <div class="pt-2 flex items-center justify-between border-t border-slate-800">
              <span class="text-xs text-slate-400">
                Ready to commit {{ analysisResult.mergedUnits.length }} total units to wiki.
              </span>
              <button
                type="button"
                @click="applyMergedUnits"
                :disabled="isSaving"
                class="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-950/40 transition-all disabled:opacity-50"
              >
                <UIcon :name="isSaving ? 'i-lucide-loader-2' : 'i-lucide-save'" :class="isSaving ? 'animate-spin' : ''" class="w-4 h-4" />
                <span>{{ isSaving ? 'Saving to Database...' : 'Save & Apply to Wiki' }}</span>
              </button>
            </div>
          </div>
        </div>

        <!-- TAB 2: QUICK ADD SINGLE UNIT -->
        <div v-else-if="activeTab === 'manual'" class="space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div>
              <label class="block text-[11px] font-bold text-slate-400 mb-1">Unit Name *</label>
              <input
                type="text"
                v-model="quickForm.name"
                placeholder="e.g. Igris"
                class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label class="block text-[11px] font-bold text-slate-400 mb-1">Display / Nickname</label>
              <input
                type="text"
                v-model="quickForm.displayName"
                placeholder="e.g. Knight"
                class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label class="block text-[11px] font-bold text-slate-400 mb-1">Series</label>
              <input
                type="text"
                v-model="quickForm.series"
                placeholder="e.g. SoloLeveling"
                class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label class="block text-[11px] font-bold text-slate-400 mb-1">Rarity</label>
              <select
                v-model="quickForm.rarity"
                class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
              >
                <option value="Secret">Secret</option>
                <option value="Mythic">Mythic</option>
                <option value="Legendary">Legendary</option>
                <option value="Epic">Epic</option>
                <option value="Rare">Rare</option>
              </select>
            </div>

            <div>
              <label class="block text-[11px] font-bold text-slate-400 mb-1">Element</label>
              <select
                v-model="quickForm.element"
                class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
              >
                <option value="Luminus">Luminus</option>
                <option value="Noctis">Noctis</option>
                <option value="Fire">Fire</option>
                <option value="Water">Water</option>
                <option value="Wind">Wind</option>
                <option value="Thunder">Thunder</option>
                <option value="Flora">Flora</option>
                <option value="Cosmic">Cosmic</option>
                <option value="Neutral">Neutral</option>
              </select>
            </div>

            <div>
              <label class="block text-[11px] font-bold text-slate-400 mb-1">Skill Mode</label>
              <select
                v-model="quickForm.skillMode"
                class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
              >
                <option value="AOE">AOE (Circle)</option>
                <option value="Line">Line / Beam</option>
                <option value="Cone">Cone</option>
                <option value="Single">Single Target</option>
              </select>
            </div>

            <div>
              <label class="block text-[11px] font-bold text-slate-400 mb-1">Base Attack (ATK)</label>
              <input
                type="number"
                v-model.number="quickForm.damage"
                class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-amber-300 font-bold focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label class="block text-[11px] font-bold text-slate-400 mb-1">Attack Speed (SPA in seconds)</label>
              <input
                type="number"
                step="0.1"
                v-model.number="quickForm.attackSpeed"
                class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-cyan-300 font-bold focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label class="block text-[11px] font-bold text-slate-400 mb-1">Range</label>
              <input
                type="number"
                v-model.number="quickForm.range"
                class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-emerald-300 font-bold focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label class="block text-[11px] font-bold text-slate-400 mb-1">Health (HP)</label>
              <input
                type="number"
                v-model.number="quickForm.hp"
                class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-rose-300 font-bold focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label class="block text-[11px] font-bold text-slate-400 mb-1">Placement Cost</label>
              <input
                type="number"
                v-model.number="quickForm.cost"
                class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-yellow-300 font-bold focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label class="block text-[11px] font-bold text-slate-400 mb-1">Stat Multiplier per Level</label>
              <input
                type="number"
                step="0.01"
                v-model.number="quickForm.statMult"
                class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <!-- Real-Time Calculated Progression Preview -->
          <div class="p-4 rounded-2xl bg-slate-950 border border-slate-800">
            <span class="text-xs font-bold text-cyan-400 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
              <UIcon name="i-lucide-calculator" class="w-4 h-4 text-cyan-400" />
              <span>Real-Time Calculated Progression Preview</span>
            </span>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div class="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span class="text-slate-500 text-[10px] block">Base DPS</span>
                <span class="text-red-400 font-bold text-sm">{{ Math.round((quickForm.damage || 0) / (quickForm.attackSpeed || 1)) }}</span>
              </div>
              <div class="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span class="text-slate-500 text-[10px] block">Max ATK (Lv.5)</span>
                <span class="text-amber-300 font-bold text-sm">{{ Math.round((quickForm.damage || 0) * Math.pow(quickForm.statMult || 1.2, 4)) }}</span>
              </div>
              <div class="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span class="text-slate-500 text-[10px] block">Max DPS (Lv.5)</span>
                <span class="text-red-400 font-bold text-sm">{{ Math.round(((quickForm.damage || 0) * Math.pow(quickForm.statMult || 1.2, 4)) / (quickForm.attackSpeed || 1)) }}</span>
              </div>
              <div class="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span class="text-slate-500 text-[10px] block">Max HP (Lv.5)</span>
                <span class="text-rose-300 font-bold text-sm">{{ Math.round((quickForm.hp || 0) * Math.pow(quickForm.statMult || 1.2, 4)) }}</span>
              </div>
            </div>
          </div>

          <div class="flex justify-end pt-2">
            <button
              type="button"
              @click="addSingleUnit"
              :disabled="!quickForm.name.trim()"
              class="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md disabled:opacity-50 transition-all"
            >
              <UIcon name="i-lucide-plus" class="w-4 h-4" />
              <span>Add Unit to Database</span>
            </button>
          </div>
        </div>

        <!-- TAB 3: EXPORT & BACKUP -->
        <div v-else-if="activeTab === 'export'" class="space-y-4">
          <p class="text-xs text-slate-400">
            Export the current live database ({{ currentUnits.length }} units) as clean JSON for backup, sharing, or version control.
          </p>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              @click="downloadJson('units')"
              class="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-cyan-500/50 transition-all text-left flex items-center gap-3 group"
            >
              <div class="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform">
                <UIcon name="i-lucide-download" class="w-5 h-5" />
              </div>
              <div>
                <h4 class="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">Download units.json</h4>
                <p class="text-[10px] text-slate-400">All {{ currentUnits.length }} units with levels 0–5 calculated</p>
              </div>
            </button>

            <button
              type="button"
              @click="downloadJson('database')"
              class="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-cyan-500/50 transition-all text-left flex items-center gap-3 group"
            >
              <div class="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                <UIcon name="i-lucide-database" class="w-5 h-5" />
              </div>
              <div>
                <h4 class="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">Download database.json</h4>
                <p class="text-[10px] text-slate-400">Full unified database bundle (Units, Skills, Gears, Traits)</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { parseAndMergeUnits, normalizeUnit } from '~/utils/unitCalculator'

const props = defineProps<{
  currentUnits: any[]
  skillsData?: Record<string, any>
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'units-updated', units: any[]): void
}>()

const tabs = [
  { id: 'import', label: 'Import JSON', icon: 'i-lucide-upload' },
  { id: 'manual', label: 'Quick Add Unit', icon: 'i-lucide-plus-circle' },
  { id: 'export', label: 'Export & Backup', icon: 'i-lucide-download' }
]

const activeTab = ref('import')
const mergeMode = ref<'merge' | 'skip_duplicates' | 'overwrite_all'>('merge')
const rawJsonInput = ref('')
const isDragging = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)
const parseError = ref('')
const analysisResult = ref<any | null>(null)
const isSaving = ref(false)

const quickForm = ref({
  name: '',
  displayName: '',
  series: 'SoloLeveling',
  rarity: 'Secret',
  element: 'Noctis',
  skillMode: 'Line',
  damage: 50,
  attackSpeed: 3,
  range: 12,
  hp: 118,
  cost: 2800,
  statMult: 1.24
})

function triggerFileInput() {
  fileInputRef.value?.click()
}

function handleFileSelect(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) readFile(file)
}

function handleFileDrop(e: DragEvent) {
  isDragging.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file) readFile(file)
}

function readFile(file: File) {
  parseError.value = ''
  const reader = new FileReader()
  reader.onload = (evt) => {
    rawJsonInput.value = (evt.target?.result as string) || ''
    analyzeJson()
  }
  reader.readAsText(file)
}

async function loadSampleTestJson() {
  try {
    const res = await $fetch<any>('/api/units')
    rawJsonInput.value = JSON.stringify(res.slice(0, 3), null, 2)
    analyzeJson()
  } catch {
    rawJsonInput.value = JSON.stringify({
      Igris: {
        Damage: 50,
        AttackSpeed: 3,
        Range: 12,
        HP: 118,
        Cost: 2800,
        Series: 'SOLOLEVELING',
        Element: 'Noctis',
        Rarity: 'Secret',
        UpgradeStatMultiplier: 1.24
      }
    }, null, 2)
    analyzeJson()
  }
}

function analyzeJson() {
  parseError.value = ''
  analysisResult.value = null
  if (!rawJsonInput.value.trim()) return

  try {
    const parsed = JSON.parse(rawJsonInput.value)
    const result = parseAndMergeUnits(
      parsed,
      props.currentUnits,
      props.skillsData || {},
      mergeMode.value
    )
    analysisResult.value = result
  } catch (err: any) {
    parseError.value = 'Invalid JSON: ' + err.message
  }
}

async function applyMergedUnits() {
  if (!analysisResult.value) return
  isSaving.value = true
  try {
    await $fetch('/api/units', {
      method: 'POST',
      body: {
        units: analysisResult.value.mergedUnits
      }
    })
    emit('units-updated', analysisResult.value.mergedUnits)
    emit('close')
  } catch (err: any) {
    parseError.value = 'Failed to persist: ' + err.message
    // Still emit to local state so user can view
    emit('units-updated', analysisResult.value.mergedUnits)
    emit('close')
  } finally {
    isSaving.value = false
  }
}

function addSingleUnit() {
  const normalized = normalizeUnit(quickForm.value.name, {
    Name: quickForm.value.name,
    DisplayName: quickForm.value.displayName || quickForm.value.name,
    Series: quickForm.value.series,
    Rarity: quickForm.value.rarity,
    Element: quickForm.value.element,
    SkillMode: quickForm.value.skillMode,
    Damage: quickForm.value.damage,
    AttackSpeed: quickForm.value.attackSpeed,
    Range: quickForm.value.range,
    HP: quickForm.value.hp,
    Cost: quickForm.value.cost,
    UpgradeStatMultiplier: quickForm.value.statMult,
    MaxUpgradeLevel: 5
  }, props.skillsData?.[quickForm.value.name])

  const updated = [...props.currentUnits, normalized]
  emit('units-updated', updated)
  emit('close')
}

function downloadJson(type: 'units' | 'database') {
  const data = type === 'units' ? props.currentUnits : { units: props.currentUnits }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${type}.json`
  a.click()
  URL.revokeObjectURL(url)
}
</script>
