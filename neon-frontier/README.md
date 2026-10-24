# Frontier Operations

Frontier Operations is a no-install, original browser Battle Royale sandbox made with plain HTML, CSS, JavaScript, and the browser WebGL API. It uses procedural geometry and color only: there are no downloaded packages, external URLs, image files, or third-party assets.

## Run

Open `index.html` directly in a current desktop browser. A local static server is optional, but no install or build step is required. The first click on **Start Mission** requests pointer lock; click the canvas again if the browser asks for permission.

## Features

- First-person WebGL rendering with grounded tactical materials, low-saturation lighting, pointer-lock mouse look, a procedural cover-filled map, minimap, crosshair, and HUD.
- WASD/arrow movement, sprint (Shift), crouch (Ctrl/C), jump (Space), mouse fire, reload (R), weapon switching (1–6 or mouse wheel), reliable focus-loss cleanup, and pause/resume.
- Six weapons with distinct damage, fire rate, magazine, reserve, reload, spread, range, pellet behavior, and procedural first-person silhouettes.
- Reflex, Capacitor, and Stabilizer attachment toggles alter weapon behavior and persist with loadout settings.
- Nine readable procedural enemy variants spawn in rotating Battle Royale compositions: Strikers, Skirmishers, Bulwarks, Recon, Medic, Juggernaut, Warden, Assault, and Specter profiles with different colors, proportions, equipment silhouettes, movement, range, damage, and cooldown tuning.
- Enemy radio cues, layered footsteps/voice/attack/death sounds, readable archetype movement/combat animations, short-lived recoil/trail/impact particles, attack beams, death bursts, wave composition toasts, and minimap colors are synthesized at runtime with WebAudio and canvas/WebGL primitives.
- A shrinking safe ring, 15 autonomous rivals, loot pickups, shields, medkits, eliminations, victory/elimination results, and a local high-score record.
- Four original cosmetic skins and persistent `localStorage` save/load for sensitivity, selected weapon, attachment choices, selected skin, last result, and high score.
- The loadout screen includes a nine-variant Character Lab roster with role, movement signature, health, speed, and damage readouts so the player can learn each silhouette before dropping.
- The live HUD includes a nearest-contact scanner that identifies the closest enemy archetype, role, distance, remaining health, and threat intensity as rivals close in.
- A compact Tactical Feed keeps the latest drop, reload, loot, damage, and elimination events visible without relying on the transient toast alone.
- An optional local WebSocket fireteam panel when the app is run through `npm start`.

## Controls

| Input | Action |
| --- | --- |
| WASD / Arrow keys | Move |
| Shift | Sprint |
| Ctrl / C | Crouch |
| Space | Jump |
| Mouse | Look |
| Left mouse | Fire (raycast) |
| R | Reload |
| 1–6 or wheel | Switch weapon |
| Esc | Pause and release pointer lock |

## Manual smoke test

1. Open `index.html`; confirm the Frontier Operations lobby renders and the displayed high score is `000000` on a fresh profile.
2. Open **Configure Loadout**, select each weapon, toggle each attachment, change sensitivity, review the nine-card Character Lab roster, close the panel, reopen it, and confirm selections persist.
3. Start a mission. Confirm pointer lock, mouse look, WASD/arrow movement, sprint/crouch/jump, minimap, wave HUD, weapon readout, nearest-contact scanner changing between clear/warning/critical ranges, and the Tactical Feed recording mission events.
4. Fire until a magazine empties, press `R`, switch weapons with `1–6`, and verify ammo/reload feedback changes.
5. Shoot each enemy silhouette and confirm hit markers, score changes, archetype-specific equipment silhouettes, weapon-ready/recoil, agile fin/trail, heavy stomp/armor-pulse feedback, layered radio/audio cues, short-lived impact/death bursts, bot removal, and the live-player count.
6. Let a bot attack, confirm the damage flash and health bar, then press `Esc`, move focus away and back, and use Resume. Confirm that stuck movement/fire keys are cleared and mouse lock can be recaptured. Return to lobby and reopen the page to confirm the high score is saved.

## Verification

```text
node --check game.js
```

This checks JavaScript syntax without adding a dependency. The manual smoke test above covers browser-only WebGL and pointer-lock behavior.
