<template>
  <div class="space-y-6">
    <!-- Compare Header & Selection -->
    <div class="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 shadow-xl">
      <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h2 class="text-xl font-black text-white font-['Outfit'] flex items-center gap-2">
            <UIcon name="i-lucide-scale" class="w-5 h-5 text-cyan-400" />
            <span>efootbase Unit Comparison Engine</span>
          </h2>
          <p class="text-xs text-slate-400">Compare stats, damage per second, attack ranges, and passives side by side.</p>
        </div>

        <div class="flex items-center gap-2">
          <button
            v-if="unitA && unitB"
            type="button"
            @click="swapUnits"
            class="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 border border-slate-700 flex items-center gap-1.5 transition-all"
          >
            <UIcon name="i-lucide-arrow-left-right" class="w-3.5 h-3.5" />
            <span>Swap</span>
          </button>
          <button
            v-if="unitA || unitB"
            type="button"
            @click="$emit('clear-compare')"
            class="px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-xs font-bold text-red-400 border border-red-500/30 flex items-center gap-1.5 transition-all"
          >
            <UIcon name="i-lucide-trash-2" class="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      <!-- Unit Selectors Row -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Unit A Selector -->
        <div class="bg-slate-950/80 p-3.5 rounded-xl border border-cyan-500/30">
          <label class="block text-xs font-bold text-cyan-400 uppercase tracking-wider mb-1.5">
            Unit 1 (Primary)
          </label>
          <select
            v-model="selectedIdA"
            class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm font-semibold text-white focus:outline-none focus:border-cyan-400"
          >
            <option value="">-- Choose Unit 1 --</option>
            <option v-for="u in allUnits" :key="u.id" :value="u.id">
              {{ u.name }} ({{ u.rarity }} - {{ u.element }})
            </option>
          </select>
        </div>

        <!-- Unit B Selector -->
        <div class="bg-slate-950/80 p-3.5 rounded-xl border border-amber-500/30">
          <label class="block text-xs font-bold text-amber-400 uppercase tracking-wider mb-1.5">
            Unit 2 (Compare Against)
          </label>
          <select
            v-model="selectedIdB"
            class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm font-semibold text-white focus:outline-none focus:border-amber-400"
          >
            <option value="">-- Choose Unit 2 --</option>
            <option v-for="u in allUnits" :key="u.id" :value="u.id">
              {{ u.name }} ({{ u.rarity }} - {{ u.element }})
            </option>
          </select>
        </div>
      </div>

      <!-- Master Level Slider -->
      <div v-if="unitA && unitB" class="mt-5 pt-4 border-t border-slate-800">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <UIcon name="i-lucide-sliders" class="w-4 h-4 text-cyan-400" />
            <span>Synchronized Level Comparison:</span>
            <strong class="text-cyan-400 font-extrabold text-sm font-['Outfit']">Level {{ compareLevel }}</strong>
          </span>
          <div class="flex items-center gap-1">
            <button
              v-for="lvl in [0, 1, 2, 3, 4, 5]"
              :key="lvl"
              @click="compareLevel = lvl"
              class="px-2.5 py-1 rounded-md text-xs font-bold transition-all border"
              :class="compareLevel === lvl
                ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-black'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'"
            >
              Lv.{{ lvl }}
            </button>
          </div>
        </div>

        <input
          type="range"
          min="0"
          max="5"
          step="1"
          v-model.number="compareLevel"
          class="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
        />
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="!unitA || !unitB" class="p-12 text-center bg-slate-900/40 rounded-2xl border border-slate-800 border-dashed">
      <UIcon name="i-lucide-scale" class="w-12 h-12 text-slate-600 mx-auto mb-3" />
      <h3 class="text-base font-bold text-white">Select two units to compare</h3>
      <p class="text-xs text-slate-400 mt-1 max-w-md mx-auto">
        Pick two units from the dropdowns above or click "Compare" on any unit card in the Units tab.
      </p>
    </div>

    <!-- Active Side-by-Side Comparison Grid -->
    <div v-else class="space-y-6">
      <!-- Unit Cards Side by Side Header -->
      <div class="grid grid-cols-2 gap-4">
        <!-- Unit A Header Card -->
        <div
          class="p-4 rounded-2xl border bg-slate-950 relative overflow-hidden"
          :class="[rarityA.border, 'bg-gradient-to-b ' + rarityA.bg]"
        >
          <div class="flex items-center justify-between gap-2 mb-2">
            <span class="text-[10px] font-black px-2 py-0.5 rounded-full border" :class="rarityA.badge">
              {{ rarityA.label }}
            </span>
            <span class="text-xs font-bold flex items-center gap-1" :class="elementA.color">
              <UIcon :name="elementA.uiIcon" class="w-3.5 h-3.5" />
              <span>{{ elementA.label }}</span>
            </span>
          </div>
          <h3 class="text-xl font-black text-white font-['Outfit'] truncate">{{ unitA.name }}</h3>
          <p class="text-xs text-slate-400 truncate">{{ seriesA }}</p>
          <button
            type="button"
            @click="$emit('select-unit', unitA)"
            class="mt-3 w-full py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-xs font-bold text-cyan-300 border border-slate-700/80 transition-colors"
          >
            Inspect Unit 1 Details
          </button>
        </div>

        <!-- Unit B Header Card -->
        <div
          class="p-4 rounded-2xl border bg-slate-950 relative overflow-hidden"
          :class="[rarityB.border, 'bg-gradient-to-b ' + rarityB.bg]"
        >
          <div class="flex items-center justify-between gap-2 mb-2">
            <span class="text-[10px] font-black px-2 py-0.5 rounded-full border" :class="rarityB.badge">
              {{ rarityB.label }}
            </span>
            <span class="text-xs font-bold flex items-center gap-1" :class="elementB.color">
              <UIcon :name="elementB.uiIcon" class="w-3.5 h-3.5" />
              <span>{{ elementB.label }}</span>
            </span>
          </div>
          <h3 class="text-xl font-black text-white font-['Outfit'] truncate">{{ unitB.name }}</h3>
          <p class="text-xs text-slate-400 truncate">{{ seriesB }}</p>
          <button
            type="button"
            @click="$emit('select-unit', unitB)"
            class="mt-3 w-full py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-xs font-bold text-amber-300 border border-slate-700/80 transition-colors"
          >
            Inspect Unit 2 Details
          </button>
        </div>
      </div>

      <!-- Core Stats Comparison Table (efootbase Style) -->
      <div class="bg-slate-900/80 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div class="p-4 border-b border-slate-800 bg-slate-950/60">
          <h3 class="text-sm font-extrabold text-white font-['Outfit'] uppercase tracking-wider flex items-center gap-2">
            <UIcon name="i-lucide-bar-chart-2" class="w-4 h-4 text-cyan-400" />
            <span>Attributes & Performance Metrics (Level {{ compareLevel }})</span>
          </h3>
        </div>

        <div class="divide-y divide-slate-800/80 text-xs">
          <!-- ATK Comparison -->
          <div class="grid grid-cols-12 items-center p-3 sm:p-4 hover:bg-slate-800/30 transition-colors">
            <div class="col-span-5 text-right flex items-center justify-end gap-2">
              <span v-if="diffAtk > 0" class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                +{{ formatNumber(diffAtk) }} (+{{ pct(diffAtk, statsB.Attack) }}%)
              </span>
              <span class="text-base sm:text-lg font-black font-['Outfit']" :class="statsA.Attack >= statsB.Attack ? 'text-amber-300' : 'text-slate-400'">
                {{ formatNumber(statsA.Attack) }}
              </span>
            </div>

            <div class="col-span-2 text-center text-slate-400 font-bold uppercase text-[10px] tracking-wider flex items-center justify-center gap-1">
              <UIcon name="i-lucide-swords" class="w-3 h-3 text-amber-400" />
              <span>ATK</span>
            </div>

            <div class="col-span-5 text-left flex items-center justify-start gap-2">
              <span class="text-base sm:text-lg font-black font-['Outfit']" :class="statsB.Attack >= statsA.Attack ? 'text-amber-300' : 'text-slate-400'">
                {{ formatNumber(statsB.Attack) }}
              </span>
              <span v-if="diffAtk < 0" class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                +{{ formatNumber(-diffAtk) }} (+{{ pct(-diffAtk, statsA.Attack) }}%)
              </span>
            </div>
          </div>

          <!-- DPS Comparison -->
          <div class="grid grid-cols-12 items-center p-3 sm:p-4 hover:bg-slate-800/30 transition-colors bg-slate-950/40">
            <div class="col-span-5 text-right flex items-center justify-end gap-2">
              <span v-if="diffDps > 0" class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                +{{ formatNumber(diffDps) }}
              </span>
              <span class="text-base sm:text-lg font-black font-['Outfit']" :class="dpsA >= dpsB ? 'text-red-400' : 'text-slate-400'">
                {{ formatNumber(dpsA) }}
              </span>
            </div>

            <div class="col-span-2 text-center text-slate-400 font-bold uppercase text-[10px] tracking-wider flex items-center justify-center gap-1">
              <UIcon name="i-lucide-flame" class="w-3 h-3 text-red-400" />
              <span>DPS</span>
            </div>

            <div class="col-span-5 text-left flex items-center justify-start gap-2">
              <span class="text-base sm:text-lg font-black font-['Outfit']" :class="dpsB >= dpsA ? 'text-red-400' : 'text-slate-400'">
                {{ formatNumber(dpsB) }}
              </span>
              <span v-if="diffDps < 0" class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                +{{ formatNumber(-diffDps) }}
              </span>
            </div>
          </div>

          <!-- SPA Comparison (Lower is faster/better) -->
          <div class="grid grid-cols-12 items-center p-3 sm:p-4 hover:bg-slate-800/30 transition-colors">
            <div class="col-span-5 text-right flex items-center justify-end gap-2">
              <span v-if="statsA.AttackSpeed < statsB.AttackSpeed" class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                Faster
              </span>
              <span class="text-base sm:text-lg font-black font-['Outfit']" :class="statsA.AttackSpeed <= statsB.AttackSpeed ? 'text-cyan-300' : 'text-slate-400'">
                {{ statsA.AttackSpeed }}s
              </span>
            </div>

            <div class="col-span-2 text-center text-slate-400 font-bold uppercase text-[10px] tracking-wider flex items-center justify-center gap-1">
              <UIcon name="i-lucide-zap" class="w-3 h-3 text-cyan-400" />
              <span>SPA</span>
            </div>

            <div class="col-span-5 text-left flex items-center justify-start gap-2">
              <span class="text-base sm:text-lg font-black font-['Outfit']" :class="statsB.AttackSpeed <= statsA.AttackSpeed ? 'text-cyan-300' : 'text-slate-400'">
                {{ statsB.AttackSpeed }}s
              </span>
              <span v-if="statsB.AttackSpeed < statsA.AttackSpeed" class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                Faster
              </span>
            </div>
          </div>

          <!-- Range Comparison -->
          <div class="grid grid-cols-12 items-center p-3 sm:p-4 hover:bg-slate-800/30 transition-colors bg-slate-950/40">
            <div class="col-span-5 text-right flex items-center justify-end gap-2">
              <span v-if="diffRange > 0" class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                +{{ diffRange }}
              </span>
              <span class="text-base sm:text-lg font-black font-['Outfit']" :class="statsA.Range >= statsB.Range ? 'text-emerald-300' : 'text-slate-400'">
                {{ statsA.Range }}
              </span>
            </div>

            <div class="col-span-2 text-center text-slate-400 font-bold uppercase text-[10px] tracking-wider flex items-center justify-center gap-1">
              <UIcon name="i-lucide-crosshair" class="w-3 h-3 text-emerald-400" />
              <span>Range</span>
            </div>

            <div class="col-span-5 text-left flex items-center justify-start gap-2">
              <span class="text-base sm:text-lg font-black font-['Outfit']" :class="statsB.Range >= statsA.Range ? 'text-emerald-300' : 'text-slate-400'">
                {{ statsB.Range }}
              </span>
              <span v-if="diffRange < 0" class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                +{{ -diffRange }}
              </span>
            </div>
          </div>

          <!-- HP Comparison -->
          <div class="grid grid-cols-12 items-center p-3 sm:p-4 hover:bg-slate-800/30 transition-colors">
            <div class="col-span-5 text-right flex items-center justify-end gap-2">
              <span v-if="diffHp > 0" class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                +{{ formatNumber(diffHp) }}
              </span>
              <span class="text-base sm:text-lg font-black font-['Outfit']" :class="statsA.Health >= statsB.Health ? 'text-rose-300' : 'text-slate-400'">
                {{ formatNumber(statsA.Health) }}
              </span>
            </div>

            <div class="col-span-2 text-center text-slate-400 font-bold uppercase text-[10px] tracking-wider flex items-center justify-center gap-1">
              <UIcon name="i-lucide-heart" class="w-3 h-3 text-rose-400" />
              <span>HP</span>
            </div>

            <div class="col-span-5 text-left flex items-center justify-start gap-2">
              <span class="text-base sm:text-lg font-black font-['Outfit']" :class="statsB.Health >= statsA.Health ? 'text-rose-300' : 'text-slate-400'">
                {{ formatNumber(statsB.Health) }}
              </span>
              <span v-if="diffHp < 0" class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                +{{ formatNumber(-diffHp) }}
              </span>
            </div>
          </div>

          <!-- Skill Damage Comparison -->
          <div class="grid grid-cols-12 items-center p-3 sm:p-4 hover:bg-slate-800/30 transition-colors bg-slate-950/40">
            <div class="col-span-5 text-right flex items-center justify-end gap-2">
              <span class="text-base sm:text-lg font-black font-['Outfit']" :class="statsA.SkillDamage >= statsB.SkillDamage ? 'text-purple-300' : 'text-slate-400'">
                {{ formatNumber(statsA.SkillDamage) }}
              </span>
            </div>

            <div class="col-span-2 text-center text-slate-400 font-bold uppercase text-[10px] tracking-wider flex items-center justify-center gap-1">
              <UIcon name="i-lucide-sparkles" class="w-3 h-3 text-purple-400" />
              <span>Skill DMG</span>
            </div>

            <div class="col-span-5 text-left flex items-center justify-start gap-2">
              <span class="text-base sm:text-lg font-black font-['Outfit']" :class="statsB.SkillDamage >= statsA.SkillDamage ? 'text-purple-300' : 'text-slate-400'">
                {{ formatNumber(statsB.SkillDamage) }}
              </span>
            </div>
          </div>

          <!-- Cumulative Coins Cost Comparison (Lower is cheaper) -->
          <div class="grid grid-cols-12 items-center p-3 sm:p-4 hover:bg-slate-800/30 transition-colors">
            <div class="col-span-5 text-right flex items-center justify-end gap-2">
              <span v-if="costA < costB" class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                Cheaper
              </span>
              <span class="text-base sm:text-lg font-black font-['Outfit'] text-yellow-300 flex items-center justify-end gap-1">
                <UIcon name="i-lucide-coins" class="w-3.5 h-3.5 text-yellow-400" />
                {{ formatNumber(costA) }}
              </span>
            </div>

            <div class="col-span-2 text-center text-slate-400 font-bold uppercase text-[10px] tracking-wider flex items-center justify-center gap-1">
              <UIcon name="i-lucide-coins" class="w-3 h-3 text-amber-400" />
              <span>Total Cost</span>
            </div>

            <div class="col-span-5 text-left flex items-center justify-start gap-2">
              <span class="text-base sm:text-lg font-black font-['Outfit'] text-yellow-300 flex items-center justify-start gap-1">
                <UIcon name="i-lucide-coins" class="w-3.5 h-3.5 text-yellow-400" />
                {{ formatNumber(costB) }}
              </span>
              <span v-if="costB < costA" class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                Cheaper
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Skills Comparison Side by Side -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Unit A Skill Box -->
        <div class="bg-slate-900/80 p-4 rounded-2xl border border-cyan-500/30">
          <span class="text-[10px] font-black px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 uppercase">
            {{ unitA.name }}'s Passive
          </span>
          <h4 class="text-base font-extrabold text-amber-300 mt-2">
            {{ cleanHeader(unitA.skill?.PassiveHeader) || 'No Passive' }}
          </h4>
          <div
            v-if="unitA.skill?.PassiveDescription"
            class="text-xs text-slate-300 leading-relaxed mt-2"
            v-html="formatSkillHtml(unitA.skill.PassiveDescription)"
          ></div>
        </div>

        <!-- Unit B Skill Box -->
        <div class="bg-slate-900/80 p-4 rounded-2xl border border-amber-500/30">
          <span class="text-[10px] font-black px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 uppercase">
            {{ unitB.name }}'s Passive
          </span>
          <h4 class="text-base font-extrabold text-amber-300 mt-2">
            {{ cleanHeader(unitB.skill?.PassiveHeader) || 'No Passive' }}
          </h4>
          <div
            v-if="unitB.skill?.PassiveDescription"
            class="text-xs text-slate-300 leading-relaxed mt-2"
            v-html="formatSkillHtml(unitB.skill.PassiveDescription)"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getRarityConfig, getElementConfig, getSeriesName, formatNumber, formatSkillHtml, cleanHtml as cleanHeader } from '~/utils/formatters'

interface UnitItem {
  id: string
  name: string
  displayName?: string
  series?: string
  rarity?: string
  element?: string
  skillMode?: string
  maxLevel: number
  unitCap?: number
  evolution?: any
  levels: Record<string, any>
  skill?: any
  statsAtMax: any
  statsAtBase: any
}

const props = defineProps<{
  allUnits: UnitItem[]
  comparedUnitIds: string[]
}>()

const emit = defineEmits<{
  (e: 'select-unit', unit: UnitItem): void
  (e: 'clear-compare'): void
}>()

const selectedIdA = ref(props.comparedUnitIds[0] || (props.allUnits[0]?.id ?? ''))
const selectedIdB = ref(props.comparedUnitIds[1] || (props.allUnits[1]?.id ?? ''))
const compareLevel = ref(5)

watch(() => props.comparedUnitIds, (newIds) => {
  if (newIds && newIds.length > 0) {
    if (newIds[0]) selectedIdA.value = newIds[0]
    if (newIds[1]) selectedIdB.value = newIds[1]
  }
}, { immediate: true })

const unitA = computed(() => props.allUnits.find(u => u.id === selectedIdA.value) || null)
const unitB = computed(() => props.allUnits.find(u => u.id === selectedIdB.value) || null)

const rarityA = computed(() => getRarityConfig(unitA.value?.rarity))
const rarityB = computed(() => getRarityConfig(unitB.value?.rarity))
const elementA = computed(() => getElementConfig(unitA.value?.element))
const elementB = computed(() => getElementConfig(unitB.value?.element))
const seriesA = computed(() => getSeriesName(unitA.value?.series))
const seriesB = computed(() => getSeriesName(unitB.value?.series))

const statsA = computed(() => {
  if (!unitA.value?.levels) return {}
  return unitA.value.levels[String(compareLevel.value)] || unitA.value.levels['0'] || {}
})

const statsB = computed(() => {
  if (!unitB.value?.levels) return {}
  return unitB.value.levels[String(compareLevel.value)] || unitB.value.levels['0'] || {}
})

const dpsA = computed(() => {
  const atk = statsA.value.Attack || 0
  const spa = statsA.value.AttackSpeed || 1
  return Math.round((atk / spa) * 10) / 10
})

const dpsB = computed(() => {
  const atk = statsB.value.Attack || 0
  const spa = statsB.value.AttackSpeed || 1
  return Math.round((atk / spa) * 10) / 10
})

const costA = computed(() => {
  if (!unitA.value?.levels) return 0
  let total = unitA.value.levels['0']?.Cost || 0
  for (let i = 0; i < compareLevel.value; i++) {
    const c = unitA.value.levels[String(i)]?.NextUpgradeCost
    if (c) total += c
  }
  return total
})

const costB = computed(() => {
  if (!unitB.value?.levels) return 0
  let total = unitB.value.levels['0']?.Cost || 0
  for (let i = 0; i < compareLevel.value; i++) {
    const c = unitB.value.levels[String(i)]?.NextUpgradeCost
    if (c) total += c
  }
  return total
})

const diffAtk = computed(() => (statsA.value.Attack || 0) - (statsB.value.Attack || 0))
const diffDps = computed(() => dpsA.value - dpsB.value)
const diffRange = computed(() => (statsA.value.Range || 0) - (statsB.value.Range || 0))
const diffHp = computed(() => (statsA.value.Health || 0) - (statsB.value.Health || 0))

function swapUnits() {
  const temp = selectedIdA.value
  selectedIdA.value = selectedIdB.value
  selectedIdB.value = temp
}

function pct(diff: number, base: number | undefined): string {
  if (!base || base === 0) return '0'
  return Math.round((diff / base) * 100).toString()
}
</script>
