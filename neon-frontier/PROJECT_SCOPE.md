# Neon Frontier — no-install project scope

## Why this stack

The requested experience was a serious independent FPS, while the machine does not currently expose a Unity or Unreal editor and the requirement was to avoid large downloads or installing new programs. The first usable vertical slice therefore targets the browser's built-in WebGL API.

This is a real interactive 3D project, not a Unity/Unreal project file. It has no package manager, build tool, runtime installer, external URL, or downloaded asset dependency. It runs by opening `index.html` in a current desktop browser.

## Current vertical slice

- first-person camera with resilient pointer lock, focus-loss cleanup, and keyboard fallback controls
- keyboard locomotion, sprint, crouch, jump, and collision against procedural cover
- six original weapons with separate fire/reload/range/spread/pellet behavior and procedural first-person weapon silhouettes
- loadout selection and attachment modifiers
- procedural arena map and tactical minimap
- Battle Royale match with nine procedural bot variants, 15 rivals, loot, shields, medkits, eliminations, victory flow, and a closing safe ring
- procedural WebAudio footsteps/voice/attack/death layers, per-bot movement/attack animation state, bounded recoil/trail/impact/death particles, attack beams, composition toasts, and archetype minimap markers
- lobby, pause, resume, return-to-lobby, HUD, damage feedback, hit markers, loot, shields, medkits, and match results
- local save for sensitivity, loadout, attachments, selected skin, last result, and high score
- Character Lab roster in the loadout screen with role, motion signature, and combat stat readouts for all nine enemy variants
- nearest-contact HUD scanner with archetype, role, distance, health, and clear/warning/critical threat states
- optional WebSocket fireteam connection to the Node server with room state and remote avatar rendering

## Deliberate non-goals for this slice

- no hosted multiplayer service; local/server deployment is required for WebSocket sessions
- no commercial-game assets or reverse-engineered code
- no Unity/Unreal editor files until the user explicitly provides or approves an installed engine

## Next expansion path without changing the no-install rule

The next browser-only increments can add authored procedural rooms, weapon pickups, objective modes, replayable seed selection, and a local profile screen. A true Unity/Unreal deliverable requires the corresponding editor/runtime to be available; installing one is intentionally not part of this scope.
