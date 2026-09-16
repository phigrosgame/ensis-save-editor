export const MATERIAL_KEYS = ["wood", "stone", "metal", "crystal"] as const;
export type MaterialKey = (typeof MATERIAL_KEYS)[number];

export const MAP_IDS = [
  "keep", "forest", "cliffs", "mud_cavern", "river", "lake",
  "mountain_path", "ruins", "battleground", "plateau", "snowdrift",
  "boreal", "icemine", "marsh", "shore", "valley", "portal",
] as const;

export const RELIC_IDS = [
  "gnarly_bone", "odd_skull", "sharpened_splinter", "gilded_collarbone",
  "ashen_leaf", "crystalized_berry", "petrified_twig", "shiny_rock",
  "golden_ink_bottle", "ancient_lamp", "delicate_chisel", "ornate_mold",
  "carpenters_square", "perfect_pebble", "rusty_ring", "fancy_feather",
  "quill_of_the_scribe", "strange_tome", "brass_scales", "old_axe",
  "broken_shovel", "splintered_pickaxe", "crystal_shard", "spiral_root",
  "glowing_mushroom", "forgotten_necklace", "triskelion_key", "pearl",
] as const;

export type SaveData = Record<string, any>;

function bytesToBase64(bytes: Uint8Array) {
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...Array.from(bytes.subarray(i, i + chunk)));
  }
  return btoa(binary);
}

function base64ToBytes(value: string) {
  const binary = atob(value.replace(/\s+/g, ""));
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

export function decodeSave(raw: string): SaveData {
  const compact = raw.trim();
  if (!compact) throw new Error("文件为空");
  let decoded: string;
  try {
    decoded = new TextDecoder().decode(base64ToBytes(compact));
  } catch {
    throw new Error("不是有效的 Base64 存档");
  }
  try {
    return JSON.parse(decoded) as SaveData;
  } catch {
    throw new Error("Base64 解码成功，但里面的 JSON 不完整或已损坏");
  }
}

export function encodeSave(data: SaveData) {
  const json = JSON.stringify(data);
  return bytesToBase64(new TextEncoder().encode(json));
}

function multiplyAsSaveString(value: unknown, multiplier: number) {
  const result = Number(value) * multiplier;
  if (!Number.isFinite(result)) throw new Error("仓库容量字段不是有效数字");
  return String(result);
}

export type EditOptions = {
  materialsMultiplier: number;
  yesterday: boolean;
  allRelics: boolean;
  allMaps: boolean;
  exploreCount: number;
  runes: string;
};

export type EditSummary = {
  materials: Record<MaterialKey, string>;
  capacities: Record<MaterialKey, string>;
  relicCount: number;
  mapCount: number;
  exploreCount: number | null;
  runes: string | null;
  timestamp: string | null;
};

export function editSave(source: SaveData, options: EditOptions) {
  const data: SaveData = structuredClone(source);
  const capacity = data.storageCapacityCache ?? {};
  const materials = (data.materials ??= {});
  const capacities = {} as Record<MaterialKey, string>;
  const outputMaterials = {} as Record<MaterialKey, string>;

  for (const key of MATERIAL_KEYS) {
    if (capacity[key] === undefined) throw new Error(`缺少 ${key} 的仓库容量字段`);
    capacities[key] = String(capacity[key]);
    materials[key] = multiplyAsSaveString(capacity[key], options.materialsMultiplier);
    outputMaterials[key] = materials[key];
  }

  if (options.yesterday) {
    const current = Number(data.lastActiveTime);
    if (!Number.isFinite(current) || current <= 0) throw new Error("缺少有效的 lastActiveTime");
    data.lastActiveTime = Math.trunc(current - 86_400_000);
  }

  if (options.runes.trim()) data.runes = options.runes.trim();

  if (options.allRelics) {
    const collectibles = (data.collectibles ??= {});
    for (const relic of RELIC_IDS) collectibles[relic] = 100;
  }

  if (options.allMaps) {
    const nodes = (data.explorationNodes ??= {});
    for (const id of MAP_IDS) {
      const node = (nodes[id] ??= {});
      if (id !== "keep") {
        node.status = "explored";
        node.discoveryCount = Math.max(1, Number(node.discoveryCount) || 0);
      }
    }
    const stats = (data.stats ??= {});
    const counts = { ...(stats.explorationsByNode ?? {}) };
    for (const id of MAP_IDS) counts[id] = options.exploreCount;
    stats.explorationsByNode = counts;
    stats.totalExplorationsCompleted = Math.max(
      Number(stats.totalExplorationsCompleted) || 0,
      MAP_IDS.length * options.exploreCount,
    );
    data.explorationCurrentNodeId ??= "keep";
  }

  const summary: EditSummary = {
    materials: outputMaterials,
    capacities,
    relicCount: options.allRelics ? RELIC_IDS.length : Object.keys(data.collectibles ?? {}).length,
    mapCount: options.allMaps ? MAP_IDS.length : Object.keys(data.explorationNodes ?? {}).length,
    exploreCount: options.allMaps ? options.exploreCount : null,
    runes: options.runes.trim() ? String(data.runes) : data.runes ? String(data.runes) : null,
    timestamp: data.lastActiveTime ? new Date(Number(data.lastActiveTime)).toISOString() : null,
  };

  return { data, encoded: `${encodeSave(data)}\n`, summary };
}

export function formatCount(value: unknown) {
  const number = Number(value);
  if (!Number.isFinite(number)) return String(value ?? "—");
  return new Intl.NumberFormat("zh-CN", { maximumFractionDigits: 6 }).format(number);
}
