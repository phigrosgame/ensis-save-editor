#!/usr/bin/env python3
import argparse
import base64
import json
from decimal import Decimal
from pathlib import Path

MATERIAL_KEYS = ("wood", "stone", "metal", "crystal")
ALL_MAP_IDS = (
    "keep", "forest", "cliffs", "mud_cavern", "river", "lake",
    "mountain_path", "ruins", "battleground", "plateau", "snowdrift",
    "boreal", "icemine", "marsh", "shore", "valley", "portal",
)
ALL_RELIC_IDS = (
    "gnarly_bone", "odd_skull", "sharpened_splinter", "gilded_collarbone",
    "ashen_leaf", "crystalized_berry", "petrified_twig", "shiny_rock",
    "golden_ink_bottle", "ancient_lamp", "delicate_chisel", "ornate_mold",
    "carpenters_square", "perfect_pebble", "rusty_ring", "fancy_feather",
    "quill_of_the_scribe", "strange_tome", "brass_scales", "old_axe",
    "broken_shovel", "splintered_pickaxe", "crystal_shard", "spiral_root",
    "glowing_mushroom", "forgotten_necklace", "triskelion_key", "pearl",
)
DAY_MS = 86_400_000


def load_save(path: Path):
    raw = path.read_text(encoding="utf-8").strip()
    try:
        decoded = base64.b64decode(raw, validate=True).decode("utf-8")
        return json.loads(decoded)
    except Exception as exc:
        raise ValueError(f"invalid Base64/JSON save: {path}") from exc


def encode_save(data, path: Path):
    encoded = base64.b64encode(
        json.dumps(data, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
    ).decode("ascii")
    path.write_text(encoded + "\n", encoding="utf-8")


def multiply_decimal(value, multiplier):
    result = Decimal(str(value)) * Decimal(str(multiplier))
    return format(result, "f").rstrip("0").rstrip(".") or "0"


def modify(data, args):
    capacity = data.get("storageCapacityCache") or {}
    materials = data.setdefault("materials", {})
    for key in MATERIAL_KEYS:
        if key not in capacity:
            raise ValueError(f"missing storage capacity for {key}")
        materials[key] = multiply_decimal(capacity[key], args.materials_multiplier)

    if args.yesterday:
        timestamp = int(data.get("lastActiveTime") or 0)
        if timestamp <= 0:
            raise ValueError("missing or invalid lastActiveTime")
        data["lastActiveTime"] = timestamp - DAY_MS

    if args.runes is not None:
        data["runes"] = str(args.runes)

    if args.all_relics:
        collectibles = data.setdefault("collectibles", {})
        for relic_id in ALL_RELIC_IDS:
            collectibles[relic_id] = 100

    if args.all_maps:
        nodes = data.setdefault("explorationNodes", {})
        for node_id in ALL_MAP_IDS:
            node = nodes.setdefault(node_id, {})
            if node_id != "keep":
                node["status"] = "explored"
                node["discoveryCount"] = max(1, int(node.get("discoveryCount") or 0))
        stats = data.setdefault("stats", {})
        counts = dict(stats.get("explorationsByNode") or {})
        for node_id in ALL_MAP_IDS:
            counts[node_id] = args.explore_count
        stats["explorationsByNode"] = counts
        stats["totalExplorationsCompleted"] = max(
            int(stats.get("totalExplorationsCompleted") or 0), sum(counts.values())
        )
        data["explorationCurrentNodeId"] = data.get("explorationCurrentNodeId") or "keep"

    return data


def validate(data, args):
    capacity = data["storageCapacityCache"]
    assert all(data["materials"][key] == multiply_decimal(capacity[key], args.materials_multiplier) for key in MATERIAL_KEYS)
    if args.yesterday:
        assert isinstance(data["lastActiveTime"], int)
    if args.runes is not None:
        assert data["runes"] == str(args.runes)
    if args.all_relics:
        assert all(data["collectibles"][key] == 100 for key in ALL_RELIC_IDS)
    if args.all_maps:
        assert all(data["explorationNodes"][key].get("status") == "explored" for key in ALL_MAP_IDS if key != "keep")
        assert all(data["stats"]["explorationsByNode"][key] == args.explore_count for key in ALL_MAP_IDS)


def main():
    parser = argparse.ArgumentParser(description="Modify an Ensis IDLE Base64 JSON save")
    parser.add_argument("input", type=Path)
    parser.add_argument("output", type=Path)
    parser.add_argument("--materials-multiplier", type=Decimal, default=Decimal("100"))
    parser.add_argument("--yesterday", action="store_true")
    parser.add_argument("--all-relics", action="store_true")
    parser.add_argument("--all-maps", action="store_true")
    parser.add_argument("--explore-count", type=int, default=100)
    parser.add_argument("--runes")
    args = parser.parse_args()
    if args.explore_count < 0:
        parser.error("--explore-count must be non-negative")
    data = modify(load_save(args.input), args)
    encode_save(data, args.output)
    check = load_save(args.output)
    validate(check, args)
    print(json.dumps({
        "output": str(args.output),
        "materials": {key: check["materials"][key] for key in MATERIAL_KEYS},
        "yesterday": args.yesterday,
        "relic_count": len(check.get("collectibles", {})),
        "map_count": len(check.get("explorationNodes", {})),
        "runes": check.get("runes"),
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
