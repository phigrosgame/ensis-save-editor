# Ensis Save Format Reference

The v0.6.8f export is Base64-encoded UTF-8 JSON. Decode with strict Base64 validation, parse JSON, edit fields, then compact-encode JSON and Base64-encode it again.

| Purpose | Field | Notes |
|---|---|---|
| Materials | `materials.wood`, `stone`, `metal`, `crystal` | Set to `storageCapacityCache[key] × multiplier`; values are strings. |
| Capacity | `storageCapacityCache.*` | Game-computed warehouse capacity. |
| Timestamp | `lastActiveTime` | Unix milliseconds; subtract `86400000` for yesterday. |
| Relics | `collectibles` | Object keyed by collectible ID; known full list is in `scripts/modify_save.py`. |
| Maps | `explorationNodes` | Add missing known nodes; non-`keep` nodes use `status: "explored"`. |
| Exploration count | `stats.explorationsByNode` | Set each known node to the requested count. |
| Rune balance | `runes` | Store as a string. |

The full map list comes from the production bundle's area enum: `keep`, `forest`, `cliffs`, `mud_cavern`, `river`, `lake`, `mountain_path`, `ruins`, `battleground`, `plateau`, `snowdrift`, `boreal`, `icemine`, `marsh`, `shore`, `valley`, `portal`.

The full collectible list contains 28 IDs in the bundled script. Do not invent IDs from translations or display labels; use the stable IDs.

Always preserve a backup and reject truncated inputs. The web implementation mirrors this logic entirely in the browser and does not transmit saves.
