import assert from "node:assert/strict";
import { WebSocket } from "ws";
import { MULTIPLAYER_CONFIG, MULTIPLAYER_PATH, createMultiplayerServer } from "../server.mjs";

const app = createMultiplayerServer({ port: 0, host: "127.0.0.1", matchDurationMs: 5_000 });
const address = await app.start();
const url = `ws://127.0.0.1:${address.port}${MULTIPLAYER_PATH}`;

function openClient() {
  return new Promise((resolve, reject) => {
    const socket = new WebSocket(url);
    const messages = [];
    socket.on("message", (data) => messages.push(JSON.parse(data.toString())));
    socket.once("open", () => resolve({ socket, messages }));
    socket.once("error", reject);
  });
}

function waitFor(client, type, predicate = () => true) {
  return new Promise((resolve, reject) => {
    const existing = client.messages.find((message) => message.type === type && predicate(message));
    if (existing) return resolve(existing);
    const timeout = setTimeout(() => reject(new Error(`timed out waiting for ${type}`)), 2_000);
    const onMessage = (data) => {
      const message = JSON.parse(data.toString());
      client.messages.push(message);
      if (message.type === type && predicate(message)) {
        clearTimeout(timeout);
        client.socket.off("message", onMessage);
        resolve(message);
      }
    };
    client.socket.on("message", onMessage);
  });
}

try {
  assert.equal(MULTIPLAYER_PATH, "/ws");
  assert.equal(MULTIPLAYER_CONFIG.path, MULTIPLAYER_PATH);
  assert.equal(app.config.path, MULTIPLAYER_PATH);

  const host = await openClient();
  const guest = await openClient();
  const hostWelcome = await waitFor(host, "welcome");
  await waitFor(host, "lobby");
  await waitFor(guest, "welcome");
  await waitFor(guest, "lobby");
  assert.match(hostWelcome.playerId, /^player-/);

  host.socket.send(JSON.stringify({ type: "room.create", roomId: "test-room", playerName: "Host" }));
  const created = await waitFor(host, "room.created");
  assert.equal(created.room.id, "test-room");
  assert.equal(created.room.phase, "lobby");

  guest.socket.send(JSON.stringify({ type: "room.join", roomId: "test-room", playerName: "Guest" }));
  const joined = await waitFor(guest, "room.joined");
  assert.equal(joined.room.playerCount, 2);

  host.socket.send(JSON.stringify({ type: "match.start" }));
  await waitFor(host, "match.start");
  guest.socket.send(JSON.stringify({ type: "input", seq: 7, move: { x: 1, z: 0 }, sprint: true }));
  const state = await waitFor(guest, "state", (message) =>
    message.phase === "running" && message.players.some((player) => player.name === "Guest" && player.inputSeq === 7));
  assert.equal(state.phase, "running");
  assert.equal(state.players.length, 2);
  assert.equal(state.players.find((player) => player.name === "Guest").inputSeq, 7);

  host.socket.send(JSON.stringify({ type: "match.end", reason: "test" }));
  const ended = await waitFor(host, "match.end");
  assert.equal(ended.reason, "test");
  host.socket.close();
  guest.socket.close();
  console.log("Multiplayer server smoke test passed.");
} finally {
  await app.close();
}
