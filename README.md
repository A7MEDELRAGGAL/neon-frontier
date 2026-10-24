# Neon Frontier

Neon Frontier is an original, dependency-light browser FPS vertical slice built for the Buildathon. It is a clean-room project: it uses procedural geometry, authored code, browser APIs, and the small `ws` server dependency for multiplayer transport. It does not ship Combat Master code, maps, sounds, models, or bundles.

## Buildathon submission

- **Account:** `A7MEDELRAGGAL`
- **Track:** Developer Tools & Open Source
- **Project:** Neon Frontier
- **Sessions:**
  - `ses_ea8d0ff8affeEo0AzAOBCSj8U0` — original FPS reconstruction and vertical slice
  - `ses_ea86ff4c7ffeVvqfM5X3rvjVA5` — current Combat Master workspace and submission packaging
- **Live URL:** https://a7medelraggal.github.io/neon-frontier/
- **Demo video:** follow `DEMO_SCRIPT.md`; a recording must be attached before submission because the desktop agent cannot publish a video without a user-provided destination/account.

## Features

- WebGL first-person camera with pointer lock and mouse look.
- WASD movement, sprint, crouch, jump, collisions, crosshair, and minimap.
- Six original weapons with separate damage, rate, magazine, reload, spread, range, pellet behavior, and procedural first-person weapon silhouettes.
- Reflex, Capacitor, and Stabilizer attachment modifiers.
- Sentry bots with pursuit, cover checks, line-of-sight attacks, elite variants, and escalating waves.
- Lobby, pause/resume, HUD, hit markers, damage feedback, score, and high-score persistence.
- Local `localStorage` save for sensitivity, selected weapon, attachments, and high score.
- Battle Royale loop: 15 rivals across nine archetype variants, loot pickups, Aegis shields, medkits, a shrinking ring, eliminations, victory/elimination result screens, and original cosmetic skins.
- Multiplayer foundation: a Node server keeps authoritative rooms and player movement over WebSocket; connected remote players are rendered as neon fireteam avatars.
- Online lobby controls: connect, create/join a room, ready up, and let the room host start the synchronized match.

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

The GitHub Pages URL is a static solo Battle Royale build. For the WebSocket fireteam controls, use the Node server locally or deploy `server.mjs` to a WebSocket-capable host; GitHub Pages cannot run a Node process.

### Multiplayer server protocol

The same server exposes a WebSocket endpoint at `/ws` (for example,
`ws://127.0.0.1:4173/ws`). A new connection receives `welcome` and `lobby`
messages. Clients can create or join rooms with `room.create` and `room.join`,
send bounded movement updates with `input`, and use `player.ready`,
`match.start`, and `match.end` for a small lobby-to-match lifecycle; only the
room host can start or end a match. The server
publishes authoritative `state` snapshots, sends `match.start` / `match.end`
events, handles ping/pong, and rate-limits input and client state messages.
Client-authored `state` messages are rejected so future browser clients cannot
replace authoritative room state.

For a no-install local check, opening `neon-frontier/index.html` directly also works, though a local server gives the most predictable browser behavior.

## Test

```bash
npm test
```

The test is offline and checks JavaScript syntax, required submission files, and core game markers.

## Docker

```bash
docker build -t neon-frontier .
docker run --rm -p 4173:4173 neon-frontier
```

Then open <http://127.0.0.1:4173/>.

## Deploy

The repository includes `.github/workflows/pages.yml`, which publishes `neon-frontier/` as a static GitHub Pages site after Pages is enabled for the repository. See `SUBMISSION.md` for the generated repository and live URL fields.

## Controls

| Input | Action |
| --- | --- |
| WASD / Arrow keys | Move |
| Shift | Sprint |
| Ctrl / C | Crouch |
| Space | Jump |
| Mouse | Look |
| Left mouse | Fire |
| R | Reload |
| 1–6 or mouse wheel | Switch weapon |
| Esc | Pause and release pointer lock |

## Clean-room scope

The game is inspired by broad FPS mechanics only. It does not reproduce proprietary code or content. The installed Combat Master files remain local analysis inputs and are excluded from version control by `.gitignore`.
