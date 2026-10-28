<template>
  <div
    v-if="unit"
    class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-md animate-fade-in"
    @click.self="$emit('close')"
  >
    <div
      class="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl border bg-slate-950 shadow-2xl overflow-hidden"
      :class="[rarityConfig.border, rarityConfig.glow]"
    >
      <!-- Top Glow Effect -->
      <div
        class="absolute -top-24 -left-24 w-72 h-72 rounded-full blur-3xl opacity-20 pointer-events-none"
        :style="{ backgroundColor: rarityConfig.accent }"
      ></div>

      <!-- Modal Header -->
      <div class="relative p-5 sm:p-6 pb-4 border-b border-slate-800/80 flex items-start justify-between gap-4 bg-slate-900/40">
        <div class="flex items-center gap-4">
          <!-- Big Shield Avatar -->
          <div
            class="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl p-1 border shadow-lg flex-shrink-0 flex flex-col items-center justify-center font-['Outfit']"
            :class="[rarityConfig.border, rarityConfig.badge]"
            :style="{ background: `linear-gradient(135deg, ${rarityConfig.accent}44 0%, #0f172a 100%)` }"
          >
            <UIcon :name="getUnitIcon(unit.name)" class="w-9 h-9 text-white drop-shadow-md mb-0.5" />
            <span class="text-[9px] font-black uppercase text-cyan-200 tracking-wider">{{ getInitials(unit.name) }}</span>
          </div>

          <div>
            <div class="flex flex-wrap items-center gap-2">
              <span class="text-xs font-black tracking-wider px-2.5 py-0.5 rounded-full border shadow-sm font-['Outfit']" :class="rarityConfig.badge">
                {{ rarityConfig.label }}
              </span>
              <span class="text-xs font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 shadow-sm" :class="[elementConfig.bg, elementConfig.border, elementConfig.color]">
                <UIcon :name="elementConfig.uiIcon" class="w-3.5 h-3.5" />
                <span>{{ elementConfig.label }}</span>
              </span>
              <span class="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                Mode: {{ unit.skillMode }}
              </span>
              <span v-if="unit.evolution" class="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                <UIcon name="i-lucide-zap" class="w-3.5 h-3.5 text-amber-400" />
                <span>Evolution Ready</span>
              </span>
            </div>

            <h2 class="text-2xl sm:text-3xl font-black text-white mt-1 font-['Outfit'] tracking-tight">
              {{ unit.name }}
            </h2>

            <p class="text-xs sm:text-sm text-slate-400 flex items-center gap-2 mt-0.5">
              <span v-if="unit.displayName && unit.displayName !== unit.name">
                Also known as <strong class="text-slate-200">"{{ unit.displayName }}"</strong>
              </span>
              <span>•</span>
              <span class="text-cyan-400 font-medium">{{ seriesLabel }}</span>
              <span>•</span>
              <span class="text-slate-400">Cap: {{ unit.unitCap }}</span>
            </p>
          </div>
        </div>

        <!-- Close & Compare Top Buttons -->
        <div class="flex items-center gap-2">
          <button
            type="button"
            @click="$emit('toggle-compare', unit)"
            class="px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5"
            :class="isCompared
              ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'"
          >
            <UIcon name="i-lucide-scale" class="w-4 h-4" />
            <span class="hidden sm:inline">{{ isCompared ? 'In Compare' : 'Add to Compare' }}</span>
          </button>

          <button
            type="button"
            @click="$emit('close')"
            class="w-9 h-9 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center border border-slate-700 transition-colors"
          >
            <UIcon name="i-lucide-x" class="w-5 h-5" />
          </button>
        </div>
      </div>

      <!-- Modal Body (Scrollable) -->
      <div class="p-5 sm:p-6 overflow-y-auto space-y-6">
        <!-- THE eFHUB / efootbase INTERACTIVE UPGRADE SLIDER -->
        <div class="bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 p-4 sm:p-5 rounded-2xl border border-cyan-500/30 shadow-lg relative overflow-hidden">
          <div class="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div>
              <span class="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                <UIcon name="i-lucide-sliders" class="w-4 h-4 text-cyan-400" /> efootbase Interactive Upgrade Level
              </span>
              <h3 class="text-lg font-black text-white font-['Outfit']">
                Level {{ currentLevel }}
                <span v-if="currentLevel === maxAvailableLevel" class="text-emerald-400 text-sm font-bold ml-1">(MAX UPGRADE)</span>
                <span v-else-if="currentLevel === 0" class="text-slate-400 text-sm font-normal ml-1">(Base Placement)</span>
              </h3>
            </div>

            <!-- Cost Summary for this level -->
            <div class="flex items-center gap-3 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800">
              <div class="text-right">
                <div class="text-[10px] text-slate-400 uppercase font-bold flex items-center justify-end gap-1">
                  <UIcon name="i-lucide-coins" class="w-3 h-3 text-amber-400" /> Total Spent
                </div>
                <div class="text-xs font-extrabold text-amber-300">{{ formatNumber(cumulativeCost) }}</div>
              </div>
              <div v-if="levelData.NextUpgradeCost && currentLevel < maxAvailableLevel" class="border-l border-slate-800 pl-3 text-right">
                <div class="text-[10px] text-slate-400 uppercase font-bold flex items-center justify-end gap-1">
                  <UIcon name="i-lucide-arrow-up-circle" class="w-3 h-3 text-cyan-400" /> Next Lvl Cost
                </div>
                <div class="text-xs font-extrabold text-cyan-400">{{ formatNumber(levelData.NextUpgradeCost) }}</div>
              </div>
            </div>
          </div>

          <!-- Slider Controls -->
          <div class="space-y-3">
            <input
              type="range"
              min="0"
              :max="maxAvailableLevel"
              step="1"
              v-model.number="currentLevel"
              class="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 transition-all hover:bg-slate-700"
            />

            <!-- Level Step Quick Buttons -->
            <div class="grid grid-cols-6 gap-1.5 sm:gap-2">
              <button
                v-for="lvl in availableLevels"
                :key="lvl"
                @click="currentLevel = lvl"
                class="py-1.5 rounded-lg text-xs font-bold transition-all border flex flex-col items-center justify-center"
                :class="currentLevel === lvl
                  ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 border-cyan-400 shadow-md font-extrabold scale-102'
                  : 'bg-slate-900/90 text-slate-400 hover:text-white border-slate-800 hover:bg-slate-800'"
              >
                <span>Lv.{{ lvl }}</span>
                <span v-if="lvl === maxAvailableLevel" class="text-[9px] uppercase font-black tracking-wider text-emerald-300">MAX</span>
                <span v-else-if="lvl === 0" class="text-[9px] uppercase font-semibold text-slate-500">Base</span>
                <span v-else class="text-[9px] text-slate-500 font-normal">+{{ lvl }}</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Real-Time Core Stats 6-Box Grid -->
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          <!-- ATK -->
          <div class="bg-slate-900/80 p-3 rounded-xl border border-slate-800 flex flex-col">
            <span class="text-xs font-bold text-slate-400 flex items-center gap-1.5">
              <UIcon name="i-lucide-swords" class="w-3.5 h-3.5 text-amber-400" /> ATK
            </span>
            <span class="text-xl font-black text-amber-300 mt-1 font-['Outfit']">{{ formatNumber(levelData.Attack) }}</span>
            <div class="w-full bg-slate-800 h-1 rounded-full mt-2 overflow-hidden">
              <div
                class="bg-amber-400 h-full rounded-full transition-all duration-300"
                :style="{ width: `${Math.min(100, ((levelData.Attack || 0) / (unit.statsAtMax.attack || 1)) * 100)}%` }"
              ></div>
            </div>
            <span class="text-[10px] text-slate-500 mt-1">Max: {{ formatNumber(unit.statsAtMax.attack) }}</span>
          </div>

          <!-- DPS -->
          <div class="bg-slate-900/80 p-3 rounded-xl border border-slate-800 flex flex-col">
            <span class="text-xs font-bold text-slate-400 flex items-center gap-1.5">
              <UIcon name="i-lucide-flame" class="w-3.5 h-3.5 text-red-400" /> DPS
            </span>
            <span class="text-xl font-black text-red-400 mt-1 font-['Outfit']">{{ formatNumber(currentDps) }}</span>
            <div class="w-full bg-slate-800 h-1 rounded-full mt-2 overflow-hidden">
              <div
                class="bg-red-500 h-full rounded-full transition-all duration-300"
                :style="{ width: `${Math.min(100, (currentDps / (unit.statsAtMax.dps || 1)) * 100)}%` }"
              ></div>
            </div>
            <span class="text-[10px] text-slate-500 mt-1">Max: {{ formatNumber(unit.statsAtMax.dps) }}</span>
          </div>

          <!-- SPA -->
          <div class="bg-slate-900/80 p-3 rounded-xl border border-slate-800 flex flex-col">
            <span class="text-xs font-bold text-slate-400 flex items-center gap-1.5">
              <UIcon name="i-lucide-zap" class="w-3.5 h-3.5 text-cyan-400" /> SPA
            </span>
            <span class="text-xl font-black text-cyan-300 mt-1 font-['Outfit']">{{ levelData.AttackSpeed }}s</span>
            <div class="w-full bg-slate-800 h-1 rounded-full mt-2 overflow-hidden">
              <div class="bg-cyan-400 h-full rounded-full w-full"></div>
            </div>
            <span class="text-[10px] text-slate-500 mt-1">Attack Cooldown</span>
          </div>

          <!-- Range -->
          <div class="bg-slate-900/80 p-3 rounded-xl border border-slate-800 flex flex-col">
            <span class="text-xs font-bold text-slate-400 flex items-center gap-1.5">
              <UIcon name="i-lucide-crosshair" class="w-3.5 h-3.5 text-emerald-400" /> Range
            </span>
            <span class="text-xl font-black text-emerald-300 mt-1 font-['Outfit']">{{ levelData.Range }}</span>
            <div class="w-full bg-slate-800 h-1 rounded-full mt-2 overflow-hidden">
              <div
                class="bg-emerald-400 h-full rounded-full transition-all duration-300"
                :style="{ width: `${Math.min(100, ((levelData.Range || 0) / (unit.statsAtMax.range || 1)) * 100)}%` }"
              ></div>
            </div>
            <span class="text-[10px] text-slate-500 mt-1">Max: {{ unit.statsAtMax.range }}</span>
          </div>

          <!-- HP -->
          <div class="bg-slate-900/80 p-3 rounded-xl border border-slate-800 flex flex-col">
            <span class="text-xs font-bold text-slate-400 flex items-center gap-1.5">
              <UIcon name="i-lucide-heart" class="w-3.5 h-3.5 text-rose-400" /> HP
            </span>
            <span class="text-xl font-black text-rose-300 mt-1 font-['Outfit']">{{ formatNumber(levelData.Health) }}</span>
            <div class="w-full bg-slate-800 h-1 rounded-full mt-2 overflow-hidden">
              <div
                class="bg-rose-400 h-full rounded-full transition-all duration-300"
                :style="{ width: `${Math.min(100, ((levelData.Health || 0) / (unit.statsAtMax.health || 1)) * 100)}%` }"
              ></div>
            </div>
            <span class="text-[10px] text-slate-500 mt-1">Max: {{ formatNumber(unit.statsAtMax.health) }}</span>
          </div>

          <!-- Skill Damage -->
          <div class="bg-slate-900/80 p-3 rounded-xl border border-slate-800 flex flex-col">
            <span class="text-xs font-bold text-slate-400 flex items-center gap-1.5">
              <UIcon name="i-lucide-sparkles" class="w-3.5 h-3.5 text-purple-400" /> Skill DMG
            </span>
            <span class="text-xl font-black text-purple-300 mt-1 font-['Outfit']">{{ formatNumber(levelData.SkillDamage) }}</span>
            <div class="w-full bg-slate-800 h-1 rounded-full mt-2 overflow-hidden">
              <div
                class="bg-purple-400 h-full rounded-full transition-all duration-300"
                :style="{ width: `${Math.min(100, ((levelData.SkillDamage || 0) / (unit.statsAtMax.skillDamage || 1)) * 100)}%` }"
              ></div>
            </div>
            <span class="text-[10px] text-slate-500 mt-1">CD: {{ levelData.SkillCooldown }}s</span>
          </div>
        </div>

        <!-- Secondary & Combat Stats Grid -->
        <div class="bg-slate-900/40 p-4 rounded-2xl border border-slate-800">
          <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Tactical & Combat Attributes</h4>
          <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 text-xs">
            <div class="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
              <span class="text-slate-500 block text-[10px] font-bold">Skill Radius / Range</span>
              <span class="text-white font-bold">{{ levelData.SkillRadius || 0 }} / {{ levelData.SkillRange || 0 }}</span>
            </div>
            <div class="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
              <span class="text-slate-500 block text-[10px] font-bold">Critical Chance / DMG</span>
              <span class="text-white font-bold">{{ ((levelData.CritChance || 0) * 100).toFixed(0) }}% / {{ ((levelData.CritDamage || 1) * 100).toFixed(0) }}%</span>
            </div>
            <div class="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
              <span class="text-slate-500 block text-[10px] font-bold">Armor / Penetration</span>
              <span class="text-white font-bold">{{ levelData.Armor || 0 }} / {{ levelData.ArmorPen || 0 }}</span>
            </div>
            <div class="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
              <span class="text-slate-500 block text-[10px] font-bold">Life Steal / Evade</span>
              <span class="text-white font-bold">{{ levelData.LifeSteal || 0 }}% / {{ levelData.Evade || 0 }}%</span>
            </div>
            <div class="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
              <span class="text-slate-500 block text-[10px] font-bold">Spawn Cooldown / Cap</span>
              <span class="text-white font-bold">{{ levelData.SpawnCooldown || 0 }}s / Cap: {{ levelData.spawnCap || 1 }}</span>
            </div>
            <div class="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
              <span class="text-slate-500 block text-[10px] font-bold">Walk Speed / Sell Cost</span>
              <span class="text-white font-bold flex items-center gap-1">
                <span>{{ levelData.Speed || 8 }} / </span>
                <UIcon name="i-lucide-coins" class="w-3.5 h-3.5 text-amber-400" />
                <span>{{ Math.round(levelData.SellCost || 0) }}</span>
              </span>
            </div>
          </div>
        </div>

        <!-- Passive & Ultimate Skills Section -->
        <div class="space-y-4">
          <h4 class="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
            <UIcon name="i-lucide-sparkles" class="w-4 h-4 text-cyan-400" />
            <span>Passive & Special Abilities</span>
          </h4>

          <div v-if="unit.skill" class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Passive Skill Card -->
            <div class="bg-slate-900/80 p-4 rounded-2xl border border-amber-500/30 flex flex-col justify-between">
              <div>
                <div class="flex items-center justify-between mb-2">
                  <span class="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    PASSIVE SKILL
                  </span>
                </div>
                <h5 class="text-base font-extrabold text-amber-200" v-html="cleanHeader(unit.skill.PassiveHeader)"></h5>
                <div
                  class="text-xs text-slate-300 leading-relaxed mt-2.5 space-y-1.5"
                  v-html="formatSkillHtml(unit.skill.PassiveDescription)"
                ></div>
              </div>
            </div>

            <!-- Ultimate Skill Card -->
            <div
              class="bg-slate-900/80 p-4 rounded-2xl border flex flex-col justify-between"
              :class="unit.skill.UltimateHeader || unit.skill.UltimateDescription
                ? 'border-fuchsia-500/30'
                : 'border-slate-800 opacity-60'"
            >
              <div>
                <div class="flex items-center justify-between mb-2">
                  <span
                    class="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border"
                    :class="unit.skill.UltimateHeader || unit.skill.UltimateDescription
                      ? 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30'
                      : 'bg-slate-800 text-slate-500 border-slate-700'"
                  >
                    ULTIMATE ABILITY
                  </span>
                  <span v-if="unit.skill.isUltimate" class="text-[10px] font-bold text-fuchsia-400 flex items-center gap-1">
                    <UIcon name="i-lucide-zap" class="w-3.5 h-3.5 text-fuchsia-400" />
                    <span>Ultimate Active</span>
                  </span>
                </div>

                <div v-if="unit.skill.UltimateHeader || unit.skill.UltimateDescription">
                  <h5 class="text-base font-extrabold text-fuchsia-200" v-html="cleanHeader(unit.skill.UltimateHeader)"></h5>
                  <div
                    class="text-xs text-slate-300 leading-relaxed mt-2.5 space-y-1.5"
                    v-html="formatSkillHtml(unit.skill.UltimateDescription)"
                  ></div>
                </div>
                <div v-else class="text-xs text-slate-500 italic mt-3">
                  This unit does not have a separate ultimate ability.
                </div>
              </div>
            </div>
          </div>
          <div v-else class="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-500 italic">
            No specific passive skill entry recorded for this unit.
          </div>
        </div>

        <!-- Evolution Path Section (if available) -->
        <div v-if="unit.evolution" class="bg-gradient-to-r from-amber-950/30 via-slate-900/60 to-yellow-950/30 p-4 sm:p-5 rounded-2xl border border-amber-500/40">
          <div class="flex items-center gap-2 mb-3">
            <UIcon name="i-lucide-zap" class="w-5 h-5 text-amber-400 flex-shrink-0" />
            <div>
              <h4 class="text-sm font-extrabold text-amber-300 font-['Outfit']">Unit Evolution Requirements</h4>
              <p class="text-xs text-slate-400">Target Evolution Unit: <strong class="text-white">{{ unit.evolution.TargetUnitId }}</strong></p>
            </div>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div class="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
              <span class="text-slate-500 block text-[10px] font-bold">Required Player Level</span>
              <span class="text-white font-extrabold text-sm">Level {{ unit.evolution.RequiredLevel || 1 }}</span>
            </div>
            <div class="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
              <span class="text-slate-500 block text-[10px] font-bold">Evolution Coin Cost</span>
              <span class="text-amber-300 font-extrabold text-sm flex items-center gap-1">
                <UIcon name="i-lucide-coins" class="w-3.5 h-3.5 text-amber-400" />
                {{ formatNumber(unit.evolution.Cost) }}
              </span>
            </div>
            <div class="col-span-2 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
              <span class="text-slate-500 block text-[10px] font-bold mb-1">Required Shards & Materials</span>
              <div class="flex flex-wrap gap-1.5">
                <span
                  v-for="(amount, item) in unit.evolution.RequiredItems"
                  :key="item"
                  class="px-2 py-0.5 rounded-md bg-slate-900 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1"
                >
                  <span class="text-cyan-400">{{ item }}</span>
                  <span class="text-amber-300 font-bold">x{{ amount }}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Full Level 0-5 Detailed Upgrade Table -->
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <UIcon name="i-lucide-table" class="w-4 h-4 text-cyan-400" />
              <span>Full Level 0 - {{ maxAvailableLevel }} Upgrade Progression Sheet</span>
            </h4>
            <span class="text-[11px] text-cyan-400">Click any row to jump slider</span>
          </div>

          <div class="overflow-x-auto rounded-xl border border-slate-800">
            <table class="w-full text-left text-xs">
              <thead class="bg-slate-900/90 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                <tr>
                  <th class="py-2.5 px-3">Level</th>
                  <th class="py-2.5 px-3">ATK</th>
                  <th class="py-2.5 px-3">DPS</th>
                  <th class="py-2.5 px-3">SPA</th>
                  <th class="py-2.5 px-3">Range</th>
                  <th class="py-2.5 px-3">HP</th>
                  <th class="py-2.5 px-3">Skill DMG</th>
                  <th class="py-2.5 px-3 text-right">Upgrade Cost</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800/60 bg-slate-950/50">
                <tr
                  v-for="lvl in availableLevels"
                  :key="lvl"
                  @click="currentLevel = lvl"
                  class="cursor-pointer transition-colors"
                  :class="currentLevel === lvl ? 'bg-cyan-950/40 text-cyan-200 font-bold' : 'hover:bg-slate-900/50 text-slate-300'"
                >
                  <td class="py-2 px-3 flex items-center gap-1.5">
                    <span
                      class="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold"
                      :class="currentLevel === lvl ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400'"
                    >
                      {{ lvl }}
                    </span>
                    <span v-if="lvl === maxAvailableLevel" class="text-[9px] text-emerald-400 font-bold">MAX</span>
                    <span v-else-if="lvl === 0" class="text-[9px] text-slate-500">BASE</span>
                  </td>
                  <td class="py-2 px-3 font-semibold text-amber-300">{{ formatNumber(unit.levels[lvl]?.Attack) }}</td>
                  <td class="py-2 px-3 font-semibold text-red-400">{{ formatNumber((unit.levels[lvl]?.Attack || 0) / (unit.levels[lvl]?.AttackSpeed || 1)) }}</td>
                  <td class="py-2 px-3 text-cyan-300">{{ unit.levels[lvl]?.AttackSpeed }}s</td>
                  <td class="py-2 px-3 text-emerald-300">{{ unit.levels[lvl]?.Range }}</td>
                  <td class="py-2 px-3 text-rose-300">{{ formatNumber(unit.levels[lvl]?.Health) }}</td>
                  <td class="py-2 px-3 text-purple-300">{{ formatNumber(unit.levels[lvl]?.SkillDamage) }}</td>
                  <td class="py-2 px-3 text-right text-slate-400 font-mono">
                    <span v-if="lvl === maxAvailableLevel">—</span>
                    <span v-else class="flex items-center justify-end gap-1 text-amber-300 font-semibold">
                      <UIcon name="i-lucide-coins" class="w-3 h-3 text-amber-400" />
                      {{ formatNumber(unit.levels[lvl]?.NextUpgradeCost) }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="p-4 border-t border-slate-800 bg-slate-900/80 flex flex-wrap items-center justify-between gap-3">
        <div class="text-xs text-slate-400 flex items-center gap-2">
          <span>Unit ID: <code class="text-slate-300 bg-slate-950 px-1.5 py-0.5 rounded">{{ unit.id }}</code></span>
        </div>

        <div class="flex items-center gap-2">
          <button
            type="button"
            @click="$emit('toggle-compare', unit)"
            class="px-4 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5"
            :class="isCompared
              ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'"
          >
            <UIcon name="i-lucide-scale" class="w-4 h-4" />
            <span>{{ isCompared ? 'Remove from Compare' : 'Compare this Unit' }}</span>
          </button>

          <button
            type="button"
            @click="$emit('close')"
            class="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-md shadow-cyan-900/30 transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getRarityConfig, getElementConfig, getSeriesName, formatNumber, formatSkillHtml, cleanHtml as cleanHeader, getUnitIcon } from '~/utils/formatters'

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
  unit: UnitItem | null
  isCompared: boolean
}>()

defineEmits<{
  (e: 'close'): void
  (e: 'toggle-compare', unit: UnitItem): void
}>()

const currentLevel = ref(0)

// Reset to max level when unit opens
watch(() => props.unit, (newUnit) => {
  if (newUnit) {
    currentLevel.value = newUnit.maxLevel || 5
  }
}, { immediate: true })

const rarityConfig = computed(() => getRarityConfig(props.unit?.rarity))
const elementConfig = computed(() => getElementConfig(props.unit?.element))
const seriesLabel = computed(() => getSeriesName(props.unit?.series))

const maxAvailableLevel = computed(() => {
  if (!props.unit?.levels) return 5
  const keys = Object.keys(props.unit.levels).map(Number).filter(n => !isNaN(n))
  return keys.length ? Math.max(...keys) : 5
})

const availableLevels = computed(() => {
  if (!props.unit?.levels) return [0, 1, 2, 3, 4, 5]
  return Object.keys(props.unit.levels).map(Number).sort((a, b) => a - b)
})

const levelData = computed(() => {
  if (!props.unit?.levels) return {}
  return props.unit.levels[String(currentLevel.value)] || props.unit.levels['0'] || {}
})

const currentDps = computed(() => {
  const atk = levelData.value.Attack || 0
  const spa = levelData.value.AttackSpeed || 1
  return Math.round((atk / spa) * 10) / 10
})

const cumulativeCost = computed(() => {
  if (!props.unit?.levels) return 0
  let total = props.unit.levels['0']?.Cost || 0
  for (let i = 0; i < currentLevel.value; i++) {
    const lvlCost = props.unit.levels[String(i)]?.NextUpgradeCost
    if (lvlCost) total += lvlCost
  }
  return total
})

function getInitials(name: string | undefined): string {
  if (!name) return 'AM'
  const parts = name.split('_').filter(Boolean)
  const first = parts[0]
  const second = parts[1]
  if (parts.length >= 2 && first && second && first[0] && second[0]) {
    return (first[0] + second[0]).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}
</script>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.98); }
  to { opacity: 1; transform: scale(1); }
}
.animate-fade-in {
  animation: fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}
</style>
