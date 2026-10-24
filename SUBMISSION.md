# Buildathon submission checklist

## Required fields

- Account: `A7MEDELRAGGAL`
- Track: `Developer Tools & Open Source`
- Repository: https://github.com/A7MEDELRAGGAL/neon-frontier
- Live URL: https://a7medelraggal.github.io/neon-frontier/
- Demo video: **to be filled after recording/upload**

## OmniRush sessions

- `ses_ea8d0ff8affeEo0AzAOBCSj8U0`
- `ses_ea86ff4c7ffeVvqfM5X3rvjVA5`

## Verification evidence

- `npm test` is the single offline test command.
- `.nvmrc` pins Node.js `22.14.0`.
- `package-lock.json` is committed.
- `Dockerfile` runs the static server.
- `.env.example` contains the only configurable setting and no secret.
- Installed game binaries and absolute machine paths are excluded from the repository.

## Demo recording script

1. Show the lobby and personal-best value.
2. Open **Configure Loadout**, inspect all six weapons, toggle attachments, and change sensitivity.
3. Close and reopen the loadout panel to show persistence.
4. Start a mission and demonstrate pointer lock, movement, sprint, crouch, jump, firing, reload, and weapon switching.
5. Eliminate bots, show score and wave progression, then pause and resume.
6. Return to the lobby and reload the page to show the saved high score.
