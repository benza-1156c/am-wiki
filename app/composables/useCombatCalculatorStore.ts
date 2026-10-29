import { ref, computed, watch, reactive } from "vue";
import type {
  PotentialRank,
  StatPotentials,
  UnitTrait,
  CalculatedStats,
  NormalizedUnit,
  GearSlot,
  GearItem,
  EquippedGears,
  GearStatsAggregated,
} from "~/types/unit";
import {
  calculateCombatStats,
  getLevelMultiplier,
  getMaxUnitLevel,
  resolveGearStatsForUnit,
} from "~/utils/unitCalculator";
import { toUnitSlug, findUnitByParam } from "~/utils/unitSlug";

const selectedUnitId = ref<string>("Alucard_001_evo");
const unitLevel = ref<number>(80);
const selectedStars = ref<number>(6);
const upgradeLevel = ref<number>(7);
const potentials = ref<StatPotentials>({
  damage: "GOD",
  health: "GOD",
  range: "GOD",
  speed: "GOD",
  cooldown: "GOD",
});
const selectedTraitIds = ref<[string | null, string | null]>([null, null]);
const isSelectorOpen = ref<boolean>(false);
const equippedGears = ref<EquippedGears>({
  Head: null,
  Body: null,
  Arm: null,
  Legs: null,
});

export function useCombatCalculatorStore() {
  const {
    units,
    skills,
    traits,
    gears,
    dbPending: pending,
    dbError: error,
    refresh,
  } = useDatabase();

  // Ensure selectedUnitId resolves to Dracula (Vampire Progenitor) upon data load if not already matched
  watch(
    () => units.value,
    (newUnits) => {
      if (newUnits && newUnits.length > 0) {
        const found = newUnits.find(
          (u: any) =>
            u.id === selectedUnitId.value || u.name === selectedUnitId.value,
        );
        if (!found) {
          const dracula = newUnits.find(
            (u: any) =>
              u.id === "Alucard_001_evo" ||
              u.displayName?.includes("Dracula (Vampire Progenitor)") ||
              u.displayName?.includes("Dracula"),
          );
          selectedUnitId.value = dracula
            ? dracula.id || dracula.name
            : newUnits[0].id || newUnits[0].name;
        }
      }
    },
    { immediate: true },
  );

  const currentUnit = computed<NormalizedUnit | null>(() => {
    if (!units.value || units.value.length === 0) return null;
    if (selectedUnitId.value) {
      const found = findUnitByParam(units.value, selectedUnitId.value);
      if (found) return found;
    }
    return (
      units.value.find(
        (u: any) =>
          u.id === "Alucard_001_evo" || u.displayName?.includes("Dracula"),
      ) ||
      units.value[0] ||
      null
    );
  });

  // Normalized list of traits from database.json, sorted by Rarity Tier (Mythic > Legendary > Epic > Rare)
  const traitsList = computed<UnitTrait[]>(() => {
    const raw = traits.value || {};
    const list = Object.entries(raw).map(([key, t]: [string, any]) => ({
      id: key,
      TraitDisplayName: t.TraitDisplayName || t.name || `Trait ${key}`,
      RarityName: t.RarityName || "Rare",
      TraitStatus: t.TraitStatus || "",
      TraitIcon: t.TraitIcon || "",
      Stats: t.Stats || {},
      Weight: t.Weight || 0,
    }));

    const rarityOrder: Record<string, number> = {
      Mythic: 1,
      Legendary: 2,
      Epic: 3,
      Rare: 4,
    };

    return list.sort((a, b) => {
      const orderA = rarityOrder[a.RarityName] ?? 99;
      const orderB = rarityOrder[b.RarityName] ?? 99;
      if (orderA !== orderB) return orderA - orderB;
      return a.TraitDisplayName.localeCompare(b.TraitDisplayName);
    });
  });

  const currentTraits = computed<UnitTrait[]>(() => {
    const list: UnitTrait[] = [];
    for (const id of selectedTraitIds.value) {
      if (!id || id === "none") continue;
      const found = traitsList.value.find((t) => t.id === id);
      if (found) list.push(found);
    }
    return list;
  });

  const currentTrait = computed<UnitTrait | null>(() => {
    return currentTraits.value[0] || null;
  });

  const maxUpgradeLevel = computed<number>(() => {
    return currentUnit.value?.maxLevel || 5;
  });

  const currentMaxLevel = computed<number>(() => {
    return getMaxUnitLevel(selectedStars.value);
  });

  watch(currentMaxLevel, (newMax) => {
    if (unitLevel.value > newMax) {
      unitLevel.value = newMax;
    }
  });

  const levelMultiplier = computed<number>(() => {
    return getLevelMultiplier(unitLevel.value);
  });

  const unitSkillInfo = computed(() => {
    if (!currentUnit.value) return null;
    const name = currentUnit.value.name || currentUnit.value.displayName;
    return (
      currentUnit.value.skill ||
      skills.value[name] ||
      skills.value[currentUnit.value.displayName] ||
      null
    );
  });

  // Normalized list of gears from database.json, sorted by Rarity Tier
  const gearsList = computed<GearItem[]>(() => {
    const raw = gears.value || {};
    const list = Object.entries(raw).map(([key, g]: [string, any]) => ({
      id: key,
      Name: g.Name || `Gear ${key}`,
      Slot: (g.Slot || "Head") as GearSlot,
      Rarity: g.Rarity || "Rare",
      Stats: g.Stats || {},
      Icon: g.Icon || "",
      Description: g.Description || "",
    }));

    const rarityOrder: Record<string, number> = {
      Exclusive: 1,
      Secret: 2,
      Mythic: 3,
      Legendary: 4,
      Epic: 5,
      Rare: 6,
    };

    return list.sort((a, b) => {
      const orderA = rarityOrder[a.Rarity] ?? 99;
      const orderB = rarityOrder[b.Rarity] ?? 99;
      if (orderA !== orderB) return orderA - orderB;
      return a.Name.localeCompare(b.Name);
    });
  });

  const gearsBySlot = computed<Record<GearSlot, GearItem[]>>(() => {
    const map: Record<GearSlot, GearItem[]> = {
      Head: [],
      Body: [],
      Arm: [],
      Legs: [],
    };
    for (const g of gearsList.value) {
      if (map[g.Slot]) {
        map[g.Slot].push(g);
      }
    }
    return map;
  });

  const activeEquippedGears = computed<Record<GearSlot, GearItem | null>>(
    () => {
      return {
        Head:
          gearsList.value.find((g) => g.id === equippedGears.value.Head) ||
          null,
        Body:
          gearsList.value.find((g) => g.id === equippedGears.value.Body) ||
          null,
        Arm:
          gearsList.value.find((g) => g.id === equippedGears.value.Arm) || null,
        Legs:
          gearsList.value.find((g) => g.id === equippedGears.value.Legs) ||
          null,
      };
    },
  );

  // Aggregated Gear Stats across all 4 slots + unit exclusive bonuses
  const aggregatedGearStats = computed<GearStatsAggregated>(() => {
    const totals: GearStatsAggregated = {
      DamageBoost: 0,
      HealthBoost: 0,
      AttackSpeedBoost: 0,
      RangeBoost: 0,
      SpeedBoost: 0,
      SkillDamageBoost: 0,
      SkillCooldownReduction: 0,
      CostReduction: 0,
      CritDamageBoost: 0,
      CritChanceBoost: 0,
      SpawnCooldownReduction: 0,
      LifeSteal: 0,
      ArmorPen: 0,
      EvadeBoost: 0,
      BurnBoost: 0,
      Accuracy: 0,
      Armor: 0,
      Shield: 0,
      UnitCap: 0,
      activeExclusiveBonuses: [],
    };

    const equipped = activeEquippedGears.value;
    const slots: GearSlot[] = ["Head", "Body", "Arm", "Legs"];

    for (const s of slots) {
      const g = equipped[s];
      if (!g) continue;

      const { baseStats, exclusiveBonus } = resolveGearStatsForUnit(
        g,
        currentUnit.value,
      );

      for (const [k, v] of Object.entries(baseStats)) {
        if (typeof (totals as any)[k] === "number") {
          (totals as any)[k] += v;
        } else {
          (totals as any)[k] = v;
        }
      }

      if (exclusiveBonus) {
        totals.activeExclusiveBonuses.push({
          gearName: g.Name,
          unitKey: exclusiveBonus.unitKey,
          stats: exclusiveBonus.stats,
        });
      }
    }

    return totals;
  });

  // Canonical central stats computation with 2-Trait & Gear support
  const calculatedStats = computed<CalculatedStats>(() => {
    return calculateCombatStats(
      currentUnit.value,
      unitLevel.value,
      selectedStars.value,
      upgradeLevel.value,
      potentials.value,
      currentTraits.value,
      aggregatedGearStats.value,
    );
  });

  // Action methods
  function setUnit(id: string) {
    const found = findUnitByParam(units.value || [], id);
    selectedUnitId.value = found ? found.id : id;

    // Automatically max out Awakening Stars (6★)
    selectedStars.value = 6;

    // Automatically max out Unit Level (Lv. 80)
    unitLevel.value = getMaxUnitLevel(6);

    const target =
      found || units.value?.find((u: any) => u.id === id || u.name === id);
    upgradeLevel.value = target?.maxLevel ?? 5;

    equippedGears.value = {
      Head: null,
      Body: null,
      Arm: null,
      Legs: null,
    };
    selectedTraitIds.value = [null, null];
  }

  function setLevel(lvl: number) {
    unitLevel.value = Math.max(1, Math.min(currentMaxLevel.value, lvl));
  }

  function setStars(stars: number) {
    selectedStars.value = Math.max(0, Math.min(6, stars));
  }

  function setUpgradeLevel(lvl: number) {
    upgradeLevel.value = Math.max(0, Math.min(maxUpgradeLevel.value, lvl));
  }

  function setPotential(key: keyof StatPotentials, rank: PotentialRank) {
    potentials.value = {
      ...potentials.value,
      [key]: rank,
    };
  }

  function setTrait(traitId: string | null, slotIndex: number = 0) {
    const next: [string | null, string | null] = [...selectedTraitIds.value];
    next[slotIndex] = traitId && traitId !== "none" ? traitId : null;
    selectedTraitIds.value = next;
  }

  function clearTraits() {
    selectedTraitIds.value = [null, null];
  }

  function setGear(slot: GearSlot, gearId: string | null) {
    equippedGears.value = {
      ...equippedGears.value,
      [slot]: gearId && gearId !== "none" ? gearId : null,
    };
  }

  function clearGears() {
    equippedGears.value = {
      Head: null,
      Body: null,
      Arm: null,
      Legs: null,
    };
  }

  function resetPotentials(defaultRank: PotentialRank = "D") {
    potentials.value = {
      damage: defaultRank,
      health: defaultRank,
      range: defaultRank,
      speed: defaultRank,
      cooldown: defaultRank,
    };
  }

  // URL Query Sync Helpers
  function initFromQuery(query: Record<string, any>) {
    if (!query) return;
    if (query.unit) {
      const found = findUnitByParam(units.value || [], String(query.unit));
      selectedUnitId.value = found ? found.id : String(query.unit);
    }
    if (query.stars !== undefined && query.stars !== "") {
      const s = parseInt(String(query.stars), 10);
      if (!isNaN(s)) selectedStars.value = Math.max(0, Math.min(6, s));
    }
    if (query.level !== undefined && query.level !== "") {
      const l = parseInt(String(query.level), 10);
      if (!isNaN(l)) unitLevel.value = Math.max(1, Math.min(80, l));
    }
    if (query.upgrade !== undefined && query.upgrade !== "") {
      const u = parseInt(String(query.upgrade), 10);
      if (!isNaN(u)) upgradeLevel.value = Math.max(0, u);
    }
    if (query.trait1 !== undefined) {
      selectedTraitIds.value[0] =
        query.trait1 && query.trait1 !== "none" ? String(query.trait1) : null;
    }
    if (query.trait2 !== undefined) {
      selectedTraitIds.value[1] =
        query.trait2 && query.trait2 !== "none" ? String(query.trait2) : null;
    }
    if (query.head !== undefined) {
      equippedGears.value.Head =
        query.head && query.head !== "none" ? String(query.head) : null;
    }
    if (query.body !== undefined) {
      equippedGears.value.Body =
        query.body && query.body !== "none" ? String(query.body) : null;
    }
    if (query.arm !== undefined) {
      equippedGears.value.Arm =
        query.arm && query.arm !== "none" ? String(query.arm) : null;
    }
    if (query.legs !== undefined) {
      equippedGears.value.Legs =
        query.legs && query.legs !== "none" ? String(query.legs) : null;
    }
    if (query.pot_dmg) potentials.value.damage = String(query.pot_dmg) as any;
    if (query.pot_hp) potentials.value.health = String(query.pot_hp) as any;
    if (query.pot_range)
      potentials.value.range = String(query.pot_range) as any;
    if (query.pot_spd) potentials.value.speed = String(query.pot_spd) as any;
    if (query.pot_cd) potentials.value.cooldown = String(query.pot_cd) as any;
  }

  const buildQueryParams = computed(() => {
    const q: Record<string, string> = {};
    if (currentUnit.value) {
      q.unit = toUnitSlug(currentUnit.value);
    } else if (selectedUnitId.value) {
      q.unit = selectedUnitId.value;
    }
    if (selectedStars.value !== undefined)
      q.stars = String(selectedStars.value);
    if (unitLevel.value) q.level = String(unitLevel.value);
    if (upgradeLevel.value !== undefined)
      q.upgrade = String(upgradeLevel.value);
    if (selectedTraitIds.value[0]) q.trait1 = selectedTraitIds.value[0];
    if (selectedTraitIds.value[1]) q.trait2 = selectedTraitIds.value[1];
    if (equippedGears.value.Head) q.head = equippedGears.value.Head;
    if (equippedGears.value.Body) q.body = equippedGears.value.Body;
    if (equippedGears.value.Arm) q.arm = equippedGears.value.Arm;
    if (equippedGears.value.Legs) q.legs = equippedGears.value.Legs;
    if (potentials.value.damage) q.pot_dmg = potentials.value.damage;
    if (potentials.value.health) q.pot_hp = potentials.value.health;
    if (potentials.value.range) q.pot_range = potentials.value.range;
    if (potentials.value.speed) q.pot_spd = potentials.value.speed;
    if (potentials.value.cooldown) q.pot_cd = potentials.value.cooldown;
    return q;
  });

  // Returning reactive ensures all refs and computed values are automatically unwrapped in templates and script
  return reactive({
    // Database async state
    pending,
    error,
    refresh,
    units,

    // Central state
    selectedUnitId,
    unitLevel,
    selectedStars,
    upgradeLevel,
    potentials,
    selectedTraitIds,
    selectedTraitId: computed(() => selectedTraitIds.value[0]),
    equippedGears,
    isSelectorOpen,

    // Computeds
    currentUnit,
    currentTrait,
    currentTraits,
    traitsList,
    gearsList,
    gearsBySlot,
    activeEquippedGears,
    aggregatedGearStats,
    maxUpgradeLevel,
    currentMaxLevel,
    levelMultiplier,
    unitSkillInfo,
    calculatedStats,
    buildQueryParams,

    // Actions
    setUnit,
    setLevel,
    setStars,
    setUpgradeLevel,
    setPotential,
    setTrait,
    clearTraits,
    setGear,
    clearGears,
    resetPotentials,
    initFromQuery,
  });
}
