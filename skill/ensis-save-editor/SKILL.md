---
name: ensis-save-editor
description: Edit Ensis IDLE Base64-encoded JSON save files locally. Use for requests to fill materials by warehouse capacity, set the save timestamp to yesterday, add/explore all map regions, max relic counts, or set runes.
---

# Ensis Save Editor

Use the bundled `scripts/modify_save.py` for deterministic save edits. The save is a single-line Base64 string containing UTF-8 JSON; never edit the encoded text by string replacement.

## Default behavior

- Set `materials.wood`, `stone`, `metal`, and `crystal` to `storageCapacityCache[key] × 100`.
- Keep all other fields unchanged unless an option below is explicitly requested.
- If “yesterday” is requested, subtract exactly 86,400,000 ms from `lastActiveTime`.
- If all relics are requested, add every known collectible ID and set its count to 100.
- If all maps are requested, add every known exploration region, set non-`keep` nodes to `status: "explored"`, and set `stats.explorationsByNode[id]` to the requested count (normally 100).
- If a rune target is requested, write it as a string to `runes`.

## Workflow

1. Preserve the original file and validate Base64 and JSON before editing.
2. Run the bundled script with an explicit output path. Use `--materials-multiplier 100` for the current default.
3. Use `--yesterday`, `--all-relics`, `--all-maps`, `--explore-count 100`, and `--runes 1000000` only when requested.
4. Decode the generated output again and verify every requested field. Reject truncated input; do not pad or guess missing JSON.
5. Deliver the generated `.txt` file and report the exact options applied.

## Command example

```bash
python3 /home/ubuntu/skills/ensis-save-editor/scripts/modify_save.py \
  input.txt output.txt \
  --materials-multiplier 100 \
  --yesterday \
  --all-relics \
  --all-maps --explore-count 100 \
  --runes 1000000
```

## Known game IDs

The bundled script contains the 17 exploration IDs (`keep`, `forest`, `cliffs`, `mud_cavern`, `river`, `lake`, `mountain_path`, `ruins`, `battleground`, `plateau`, `snowdrift`, `boreal`, `icemine`, `marsh`, `shore`, `valley`, `portal`) and the 28 collectible IDs discovered from the v0.6.8f production bundle. Read the script rather than recreating these lists manually.

## Guardrails

- Do not upload save contents to a server; process locally whenever possible.
- Do not change derived fields unless the request specifically concerns them.
- `keep` is a camp marker, not an ordinary explored map node; preserve its label and do not force a `status` field.
- Set `stats.totalExplorationsCompleted` to at least the sum of the requested per-node counts.
- Always report when the input was invalid or incomplete instead of emitting a potentially corrupt save.

## Resources

- `scripts/modify_save.py`: deterministic CLI editor and read-back validator.
- `references/save-format.md`: concise field mapping and source-derived IDs.

Use the script directly for repeated tasks; only load the reference when field semantics need explanation.
