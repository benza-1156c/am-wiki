<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between">
        <span class="text-sm font-bold flex items-center gap-1.5">
          <UIcon name="i-lucide-award" class="text-amber-400" />
          <span>Unit Traits</span>
        </span>
        <div class="flex items-center gap-2">
          <UBadge
            :color="activeTraitCount > 0 ? 'warning' : 'neutral'"
            :variant="activeTraitCount > 0 ? 'subtle' : 'outline'"
            size="xs"
          >
            {{ activeTraitCount }} / 2 Traits
          </UBadge>
          <UButton
            icon="i-lucide-book-open"
            label="Browse All"
            variant="subtle"
            color="primary"
            size="xs"
            @click="isModalOpen = true"
          />
          <UButton
            v-if="activeTraitCount > 0"
            label="Clear"
            variant="ghost"
            color="neutral"
            size="xs"
            @click="clearTraits"
          />
        </div>
      </div>
    </template>

    <!-- 2 Trait Slots -->
    <div class="space-y-4">
      <div
        v-for="slotIdx in [0, 1]"
        :key="slotIdx"
        class="p-3 rounded-lg border border-default bg-neutral-900/40 space-y-2.5"
      >
        <!-- Slot Header -->
        <div class="flex items-center justify-between">
          <span
            class="text-xs font-bold flex items-center gap-1.5 text-neutral-200"
          >
            <UIcon
              name="i-lucide-sparkles"
              class="w-3.5 h-3.5 text-amber-400"
            />
            <span>Trait Slot {{ slotIdx + 1 }}</span>
          </span>
          <div class="flex items-center gap-1.5">
            <UBadge
              v-if="getTraitForSlot(slotIdx)"
              :color="getRarityBadgeColor(getTraitForSlot(slotIdx)?.RarityName)"
              variant="subtle"
              size="xs"
            >
              {{ getTraitForSlot(slotIdx)?.RarityName }}
            </UBadge>
            <span v-else class="text-[10px] text-muted">Empty</span>
            <UButton
              v-if="getTraitForSlot(slotIdx)"
              icon="i-lucide-x"
              variant="ghost"
              color="neutral"
              size="xs"
              class="h-5 w-5 p-0"
              @click="handleTraitSelect(slotIdx, null)"
            />
          </div>
        </div>

        <!-- Searchable Select Menu for this slot -->
        <USelectMenu
          :model-value="traitIds[slotIdx] || 'none'"
          :items="traitOptions"
          value-key="value"
          label-key="label"
          size="sm"
          class="w-full font-mono font-medium"
          placeholder="Search trait..."
          :search-input="{ placeholder: 'Search trait name or stat effect...' }"
          @update:model-value="(val) => handleTraitSelect(slotIdx, val)"
        >
          <template #leading>
            <img
              v-if="
                getTraitForSlot(slotIdx)?.TraitIcon &&
                getRobloxImageUrl(getTraitForSlot(slotIdx)?.TraitIcon)
              "
              :src="getRobloxImageUrl(getTraitForSlot(slotIdx)?.TraitIcon)!"
              class="w-4 h-4 rounded object-contain bg-black/40 shrink-0"
              alt=""
            />
          </template>
          <template #item-leading="{ item }">
            <img
              v-if="(item as any).icon && getRobloxImageUrl((item as any).icon)"
              :src="getRobloxImageUrl((item as any).icon)!"
              class="w-5 h-5 rounded object-contain bg-black/60 border border-default shrink-0"
              alt=""
              loading="lazy"
            />
            <UIcon
              v-else-if="item.value === 'none'"
              name="i-lucide-ban"
              class="w-4 h-4 text-neutral-500 shrink-0"
            />
          </template>
        </USelectMenu>

        <!-- Active Trait Details Card -->
        <div
          v-if="getTraitForSlot(slotIdx)"
          class="p-2.5 rounded-lg border bg-black/40 space-y-2 transition-all"
          :class="getRarityBorderClass(getTraitForSlot(slotIdx)?.RarityName)"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-1.5 min-w-0">
              <img
                v-if="
                  getTraitForSlot(slotIdx)?.TraitIcon &&
                  getRobloxImageUrl(getTraitForSlot(slotIdx)?.TraitIcon)
                "
                :src="getRobloxImageUrl(getTraitForSlot(slotIdx)?.TraitIcon)!"
                class="w-5 h-5 rounded object-contain bg-black/60 border border-default shrink-0"
                alt="Trait"
                loading="lazy"
              />
              <span
                class="font-bold text-xs truncate"
                :class="
                  getRarityTextClass(getTraitForSlot(slotIdx)?.RarityName)
                "
              >
                {{ getTraitForSlot(slotIdx)?.TraitDisplayName }}
              </span>
            </div>
            <span class="text-[10px] text-muted font-mono shrink-0">
              {{ getTraitForSlot(slotIdx)?.RarityName }}
            </span>
          </div>

          <!-- Full Trait Status Description -->
          <p
            class="text-[11px] text-neutral-300 font-mono leading-relaxed bg-neutral-900/60 p-2 rounded border border-neutral-800"
          >
            {{ getTraitForSlot(slotIdx)?.TraitStatus || "No status effect" }}
          </p>

          <!-- Stat Badges -->
          <div class="flex flex-wrap gap-1">
            <UBadge
              v-if="getTraitForSlot(slotIdx)?.Stats.DamageBoost"
              color="error"
              variant="subtle"
              size="xs"
            >
              ATK +{{
                Math.round(getTraitForSlot(slotIdx)!.Stats.DamageBoost! * 100)
              }}%
            </UBadge>
            <UBadge
              v-if="getTraitForSlot(slotIdx)?.Stats.HealthBoost"
              color="success"
              variant="subtle"
              size="xs"
            >
              HP {{ getTraitForSlot(slotIdx)!.Stats.HealthBoost! > 0 ? "+" : ""
              }}{{
                Math.round(getTraitForSlot(slotIdx)!.Stats.HealthBoost! * 100)
              }}%
            </UBadge>
            <UBadge
              v-if="getTraitForSlot(slotIdx)?.Stats.AttackSpeedBoost"
              color="info"
              variant="subtle"
              size="xs"
            >
              SPA
              {{
                getTraitForSlot(slotIdx)!.Stats.AttackSpeedBoost! > 0
                  ? "-"
                  : "+"
              }}{{
                Math.round(
                  Math.abs(
                    getTraitForSlot(slotIdx)!.Stats.AttackSpeedBoost! * 100,
                  ),
                )
              }}%
            </UBadge>
            <UBadge
              v-if="getTraitForSlot(slotIdx)?.Stats.RangeBoost"
              color="warning"
              variant="subtle"
              size="xs"
            >
              Range +{{
                Math.round(getTraitForSlot(slotIdx)!.Stats.RangeBoost! * 100)
              }}%
            </UBadge>
            <UBadge
              v-if="getTraitForSlot(slotIdx)?.Stats.SpeedBoost"
              color="primary"
              variant="subtle"
              size="xs"
            >
              Speed +{{
                Math.round(getTraitForSlot(slotIdx)!.Stats.SpeedBoost! * 100)
              }}%
            </UBadge>
            <UBadge
              v-if="getTraitForSlot(slotIdx)?.Stats.SkillDamageBoost"
              color="secondary"
              variant="subtle"
              size="xs"
            >
              Skill DMG +{{
                Math.round(
                  getTraitForSlot(slotIdx)!.Stats.SkillDamageBoost! * 100,
                )
              }}%
            </UBadge>
            <UBadge
              v-if="getTraitForSlot(slotIdx)?.Stats.SkillCooldownReduction"
              color="neutral"
              variant="subtle"
              size="xs"
            >
              Skill CD -{{
                Math.round(
                  getTraitForSlot(slotIdx)!.Stats.SkillCooldownReduction! * 100,
                )
              }}%
            </UBadge>
            <UBadge
              v-if="getTraitForSlot(slotIdx)?.Stats.CritDamageBoost"
              color="error"
              variant="subtle"
              size="xs"
            >
              Crit DMG +{{
                Math.round(
                  getTraitForSlot(slotIdx)!.Stats.CritDamageBoost! * 100,
                )
              }}%
            </UBadge>
            <UBadge
              v-if="getTraitForSlot(slotIdx)?.Stats.CritChanceBoost"
              color="warning"
              variant="subtle"
              size="xs"
            >
              Crit +{{
                Math.round(
                  getTraitForSlot(slotIdx)!.Stats.CritChanceBoost! * 100,
                )
              }}%
            </UBadge>
          </div>
        </div>
      </div>
    </div>

    <!-- Browse All Traits Modal -->
    <UModal
      v-model:open="isModalOpen"
      title="Browse All Traits"
      :description="`Explore ${allTraits?.length || 0} traits from the database`"
    >
      <template #body>
        <div class="space-y-3">
          <UInput
            v-model="modalSearch"
            placeholder="Search trait by name or status..."
            icon="i-lucide-search"
            size="md"
            autofocus
          />

          <div
            class="max-h-[60vh] overflow-y-auto space-y-2 pr-1 border border-default rounded-md p-2"
          >
            <div
              v-for="t in filteredModalTraits"
              :key="t.id"
              class="p-2.5 rounded-lg border bg-neutral-900/40 hover:bg-neutral-900/70 cursor-pointer transition-all flex items-start justify-between gap-3"
              :class="getRarityBorderClass(t.RarityName)"
              @click="assignFromModal(t.id)"
            >
              <div class="space-y-1 min-w-0">
                <div class="flex items-center gap-2">
                  <img
                    v-if="t.TraitIcon && getRobloxImageUrl(t.TraitIcon)"
                    :src="getRobloxImageUrl(t.TraitIcon)!"
                    class="w-6 h-6 rounded object-contain bg-black/40 border border-default shrink-0"
                    alt=""
                  />
                  <span
                    class="font-bold text-xs"
                    :class="getRarityTextClass(t.RarityName)"
                  >
                    {{ t.TraitDisplayName }}
                  </span>
                  <UBadge
                    :color="getRarityBadgeColor(t.RarityName)"
                    variant="subtle"
                    size="xs"
                  >
                    {{ t.RarityName }}
                  </UBadge>
                </div>
                <p class="text-[11px] text-muted font-mono">
                  {{ t.TraitStatus }}
                </p>
              </div>

              <UButton
                label="Equip"
                size="xs"
                variant="subtle"
                color="primary"
                class="shrink-0"
              />
            </div>
          </div>
        </div>
      </template>
    </UModal>
  </UCard>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import type { UnitTrait } from "~/types/unit";
import { getRobloxImageUrl } from "~/utils/formatters";

const props = defineProps<{
  traitIds: [string | null, string | null];
  allTraits: UnitTrait[];
}>();

const emit = defineEmits<{
  (e: "update:trait", slotIdx: number, traitId: string | null): void;
  (e: "clear"): void;
}>();

const isModalOpen = ref(false);
const modalSearch = ref("");

const activeTraitCount = computed(() => {
  return props.traitIds.filter(Boolean).length;
});

function getTraitForSlot(slotIdx: number): UnitTrait | null {
  const id = props.traitIds[slotIdx];
  if (!id || id === "none") return null;
  return (props.allTraits || []).find((t: any) => t.id === id) || null;
}

function formatTraitStatBadge(key: string, val: number): string {
  if (key === "DamageBoost") return `ATK +${Math.round(val * 100)}%`;
  if (key === "HealthBoost")
    return `HP ${val > 0 ? "+" : ""}${Math.round(val * 100)}%`;
  if (key === "RangeBoost") return `Range +${Math.round(val * 100)}%`;
  if (key === "SpeedBoost") return `Speed +${Math.round(val * 100)}%`;
  if (key === "AttackSpeedBoost") return `SPA -${Math.round(val * 100)}%`;
  if (key === "SkillDamageBoost") return `Skill DMG +${Math.round(val * 100)}%`;
  if (key === "SkillCooldownReduction")
    return `Skill CD -${Math.round(val * 100)}%`;
  if (key === "CostReduction") return `Cost -${Math.round(val * 100)}%`;
  if (key === "CritDamageBoost") return `Crit DMG +${Math.round(val * 100)}%`;
  if (key === "CritChanceBoost") return `Crit +${Math.round(val * 100)}%`;
  if (key === "SpawnCooldownReduction")
    return `Spawn CD -${Math.round(val * 100)}%`;
  if (key === "EvadeBoost") return `Evade +${Math.round(val * 100)}%`;
  return `${key} +${val}`;
}

interface TraitOptionItem {
  value: string
  label: string
  description: string
  icon: string | null
  rarity?: string
  weight?: number
}

const RARITY_WEIGHT: Record<string, number> = {
  Exclusive: 10,
  Secret: 9,
  Celestial: 9,
  Mysterious: 9,
  Mythic: 8,
  Legendary: 7,
  Epic: 6,
  Rare: 5,
  Uncommon: 4,
  Common: 3
}

function getRarityWeight(rarity?: string): number {
  if (!rarity) return 0
  return RARITY_WEIGHT[rarity.trim()] || 0
}

const traitOptions = computed<TraitOptionItem[]>(() => {
  const noneOption: TraitOptionItem = {
    value: "none",
    label: "None",
    description: "",
    icon: null,
    weight: 999
  };

  const list: TraitOptionItem[] = (props.allTraits || []).map((t: any) => {
    const statsSummary = Object.entries(t.Stats || {})
      .filter(([_, v]) => typeof v === "number" && v !== 0)
      .map(([k, v]) => formatTraitStatBadge(k, v as number))
      .join(", ");

    return {
      value: t.id,
      label: `${t.RarityName} - ${t.TraitDisplayName}`,
      description: t.TraitStatus || statsSummary || "",
      icon: (t.TraitIcon as string) || null,
      rarity: t.RarityName,
      weight: getRarityWeight(t.RarityName)
    };
  });

  // Sort by rarity descending, then by name
  list.sort((a, b) => {
    const wDiff = (b.weight || 0) - (a.weight || 0);
    if (wDiff !== 0) return wDiff;
    return a.label.localeCompare(b.label);
  });

  return [noneOption, ...list];
});

const filteredModalTraits = computed(() => {
  const q = modalSearch.value.toLowerCase().trim();
  const source = props.allTraits || [];
  const filtered = source.filter((t: any) => {
    if (!q) return true;
    return (
      (t.TraitDisplayName || "").toLowerCase().includes(q) ||
      (t.TraitStatus || "").toLowerCase().includes(q) ||
      (t.RarityName || "").toLowerCase().includes(q)
    );
  });

  // Sort by rarity descending, then by name
  return [...filtered].sort((a: any, b: any) => {
    const wDiff = getRarityWeight(b.RarityName) - getRarityWeight(a.RarityName);
    if (wDiff !== 0) return wDiff;
    return (a.TraitDisplayName || "").localeCompare(b.TraitDisplayName || "");
  });
});

function handleTraitSelect(slotIdx: number, val: any) {
  const id = typeof val === "object" && val !== null ? val.value : val;
  const finalId = id && id !== "none" ? String(id) : null;
  props.traitIds[slotIdx] = finalId;
  emit("update:trait", slotIdx, finalId);
}

function assignFromModal(traitId: string) {
  // If slot 0 is empty, assign to 0; else assign to slot 1
  if (!props.traitIds[0]) {
    handleTraitSelect(0, traitId);
  } else {
    handleTraitSelect(1, traitId);
  }
  isModalOpen.value = false;
}

function clearTraits() {
  props.traitIds[0] = null;
  props.traitIds[1] = null;
  emit("update:trait", 0, null);
  emit("update:trait", 1, null);
  emit("clear");
}

function getRarityBadgeColor(rarity?: string): any {
  switch (rarity) {
    case "Exclusive":
      return "primary";
    case "Secret":
      return "error";
    case "Mythic":
      return "error";
    case "Legendary":
      return "warning";
    case "Epic":
      return "secondary";
    case "Rare":
      return "info";
    default:
      return "neutral";
  }
}

function getRarityBorderClass(rarity?: string): string {
  switch (rarity) {
    case "Exclusive":
      return "border-cyan-500/50";
    case "Secret":
      return "border-red-500/50";
    case "Mythic":
      return "border-rose-500/50";
    case "Legendary":
      return "border-amber-500/50";
    case "Epic":
      return "border-purple-500/50";
    case "Rare":
      return "border-blue-500/50";
    default:
      return "border-default";
  }
}

function getRarityTextClass(rarity?: string): string {
  switch (rarity) {
    case "Exclusive":
      return "text-cyan-400";
    case "Secret":
      return "text-red-400";
    case "Mythic":
      return "text-rose-400";
    case "Legendary":
      return "text-amber-400";
    case "Epic":
      return "text-purple-400";
    case "Rare":
      return "text-blue-400";
    default:
      return "text-white";
  }
}
</script>
