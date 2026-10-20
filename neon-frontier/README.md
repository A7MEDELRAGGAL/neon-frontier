# Neon Frontier

Neon Frontier is a no-install, original browser FPS sandbox made with plain HTML, CSS, JavaScript, and the browser WebGL API. It uses procedural geometry and color only: there are no downloaded packages, external URLs, image files, or third-party assets.

## Run

Open `index.html` directly in a current desktop browser. A local static server is optional, but no install or build step is required. The first click on **Start Mission** requests pointer lock; click the canvas again if the browser asks for permission.

## Features

- First-person WebGL rendering with pointer-lock mouse look, a procedural cover-filled map, lighting, minimap, crosshair, and HUD.
- WASD movement, sprint (Shift), crouch (Ctrl/C), jump (Space), mouse fire, reload (R), weapon switching (1/2/3 or mouse wheel), and pause/resume.
- Three weapons with distinct damage, fire rate, magazine, reserve, reload, spread, range, and pellet behavior.
- Reflex, Capacitor, and Stabilizer attachment toggles alter weapon behavior and persist with loadout settings.
- Sentry bots chase around cover, check line of sight, attack at range, and use elite variants in escalating waves.
- Wave progression, score, health, reload feedback, damage feedback, and a local high-score record.
- `localStorage` save/load for sensitivity, selected weapon, attachment choices, and high score.

## Controls

| Input | Action |
| --- | --- |
| WASD | Move |
| Shift | Sprint |
| Ctrl / C | Crouch |
| Space | Jump |
| Mouse | Look |
| Left mouse | Fire (raycast) |
| R | Reload |
| 1 / 2 / 3 or wheel | Switch weapon |
| Esc | Pause and release pointer lock |

## Manual smoke test

1. Open `index.html`; confirm the Neon Frontier lobby renders and the displayed high score is `000000` on a fresh profile.
2. Open **Configure Loadout**, select each weapon, toggle each attachment, change sensitivity, close the panel, reopen it, and confirm selections persist.
3. Start a mission. Confirm pointer lock, mouse look, WASD movement, sprint/crouch/jump, minimap, wave HUD, and weapon readout.
4. Fire until a magazine empties, press `R`, switch weapons with `1/2/3`, and verify ammo/reload feedback changes.
5. Shoot bots and confirm hit markers, score changes, bot removal, wave clear, and the next wave.
6. Let a bot attack, confirm the damage flash and health bar, then press `Esc` and use Resume. Return to lobby and reopen the page to confirm the high score is saved.

## Verification

```text
node --check game.js
```

This checks JavaScript syntax without adding a dependency. The manual smoke test above covers browser-only WebGL and pointer-lock behavior.
