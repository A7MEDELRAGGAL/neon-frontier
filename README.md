# Neon Frontier

Neon Frontier is an original, dependency-free browser FPS vertical slice built for the Buildathon. It is a clean-room project: it uses procedural geometry, authored code, and browser APIs only. It does not ship Combat Master code, maps, sounds, models, or bundles.

## Buildathon submission

- **Account:** `A7MEDELRAGGAL`
- **Track:** Developer Tools & Open Source
- **Project:** Neon Frontier
- **Sessions:**
  - `ses_ea8d0ff8affeEo0AzAOBCSj8U0` — original FPS reconstruction and vertical slice
  - `ses_ea86ff4c7ffeVvqfM5X3rvjVA5` — current Combat Master workspace and submission packaging
- **Live URL:** enabled through GitHub Pages after the public repository is created; the final URL is recorded in `SUBMISSION.md`.
- **Demo video:** follow `DEMO_SCRIPT.md`; a recording must be attached before submission because the desktop agent cannot publish a video without a user-provided destination/account.

## Features

- WebGL first-person camera with pointer lock and mouse look.
- WASD movement, sprint, crouch, jump, collisions, crosshair, and minimap.
- Three original weapons with separate damage, rate, magazine, reload, spread, range, and pellet behavior.
- Reflex, Capacitor, and Stabilizer attachment modifiers.
- Sentry bots with pursuit, cover checks, line-of-sight attacks, elite variants, and escalating waves.
- Lobby, pause/resume, HUD, hit markers, damage feedback, score, and high-score persistence.
- Local `localStorage` save for sensitivity, selected weapon, attachments, and high score.

## Requirements

- Node.js `22.14.0`, pinned in `.nvmrc` and `package.json`.
- A current desktop browser with WebGL and pointer-lock support.

## Setup and run

```bash
npm ci
cp .env.example .env
npm start
```

Open <http://127.0.0.1:4173/>. `PORT` can be changed in `.env` or in the shell.

For a no-install local check, opening `neon-frontier/index.html` directly also works, though a local server gives the most predictable browser behavior.

## Test

```bash
npm test
```

The test is offline and checks JavaScript syntax, required submission files, and core game markers.

## Docker

```bash
docker run --rm -p 4173:4173 neon-frontier
```

Then open <http://127.0.0.1:4173/>.

## Deploy

The repository includes `.github/workflows/pages.yml`, which publishes `neon-frontier/` as a static GitHub Pages site after Pages is enabled for the repository. See `SUBMISSION.md` for the generated repository and live URL fields.

## Controls

| Input | Action |
| --- | --- |
| WASD | Move |
| Shift | Sprint |
| Ctrl / C | Crouch |
| Space | Jump |
| Mouse | Look |
| Left mouse | Fire |
| R | Reload |
| 1 / 2 / 3 or mouse wheel | Switch weapon |
| Esc | Pause and release pointer lock |

## Clean-room scope

The game is inspired by broad FPS mechanics only. It does not reproduce proprietary code or content. The installed Combat Master files remain local analysis inputs and are excluded from version control by `.gitignore`.
