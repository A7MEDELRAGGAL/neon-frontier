# Neon Frontier — no-install project scope

## Why this stack

The requested experience was a serious independent FPS, while the machine does not currently expose a Unity or Unreal editor and the requirement was to avoid large downloads or installing new programs. The first usable vertical slice therefore targets the browser's built-in WebGL API.

This is a real interactive 3D project, not a Unity/Unreal project file. It has no package manager, build tool, runtime installer, external URL, or downloaded asset dependency. It runs by opening `index.html` in a current desktop browser.

## Current vertical slice

- first-person camera with pointer lock
- keyboard locomotion, sprint, crouch, jump, and collision against procedural cover
- three original weapons with separate fire/reload/range/spread/pellet behavior
- loadout selection and attachment modifiers
- procedural arena map and tactical minimap
- bots with pursuit, cover checks, line-of-sight attacks, elite variants, and wave progression
- lobby, pause, resume, return-to-lobby, HUD, damage feedback, hit markers
- local save for sensitivity, loadout, attachments, and high score

## Deliberate non-goals for this slice

- no multiplayer server or third-party networking SDK
- no commercial-game assets or reverse-engineered code
- no Unity/Unreal editor files until the user explicitly provides or approves an installed engine

## Next expansion path without changing the no-install rule

The next browser-only increments can add authored procedural rooms, weapon pickups, bot archetypes, objective modes, replayable seed selection, and a local profile screen. A true Unity/Unreal deliverable requires the corresponding editor/runtime to be available; installing one is intentionally not part of this scope.
