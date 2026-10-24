import { access, readFile } from "node:fs/promises";

const required = [
  "neon-frontier/index.html",
  "neon-frontier/styles.css",
  "neon-frontier/game.js",
  "README.md",
  ".env.example",
  ".nvmrc",
  "package-lock.json",
  "Dockerfile",
];

for (const file of required) await access(file);
const html = await readFile("neon-frontier/index.html", "utf8");
const script = await readFile("neon-frontier/game.js", "utf8");
if (!html.includes('id="glCanvas"') || !html.includes('src="game.js"')) {
  throw new Error("game shell is missing the WebGL canvas or script entry point");
}
for (const marker of ["requestPointerLock", "installReliableControls", "isFormTarget", "localStorage", "spawnBattleRoyale", "CONFIGURE LOADOUT", "weaponModel", "characterRoster", "threatReadout", "updateThreatHud", "ArrowUp", "Digit6", "RECON"]) {
  if (!html.includes(marker) && !script.includes(marker)) {
    throw new Error(`expected game feature marker is missing: ${marker}`);
  }
}
console.log(`Validated ${required.length} required submission files and core game markers.`);
