import http from "node:http";
import { createReadStream, statSync } from "node:fs";
import { extname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";
import { WebSocket, WebSocketServer } from "ws";

export const MULTIPLAYER_PATH = "/ws";
export const MULTIPLAYER_CONFIG = Object.freeze({
  path: MULTIPLAYER_PATH,
  tickRate: 20,
  stateRateLimit: 10,
  inputRateLimit: 30,
  maxPlayersPerRoom: 16,
  matchDurationMs: 10 * 60 * 1000,
  maxPayload: 16 * 1024,
});

const root = fileURLToPath(new URL("./neon-frontier/", import.meta.url));
const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
};

function resolvePath(urlPath) {
  const requested = decodeURIComponent((urlPath || "/").split("?")[0]);
  const relative = requested === "/" ? "index.html" : requested.replace(/^\/+/, "");
  const candidate = normalize(join(root, relative));
  return candidate === root || candidate.startsWith(`${root}`) ? candidate : null;
}

function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value));
}

function finiteNumber(value, fallback = 0) {
  return Number.isFinite(value) ? value : fallback;
}

function safeName(value) {
  const name = typeof value === "string" ? value.trim().slice(0, 24) : "";
  return name || "Ranger";
}

function validRoomId(value) {
  return typeof value === "string" && /^[a-zA-Z0-9_-]{2,32}$/.test(value.trim())
    ? value.trim()
    : null;
}

function makeId(prefix) {
  return `${prefix}-${randomUUID().slice(0, 8)}`;
}

class RateLimiter {
  constructor(limit, now) {
    this.limit = limit;
    this.now = now;
    this.windowStartedAt = now();
    this.count = 0;
  }

  allow() {
    const current = this.now();
    if (current - this.windowStartedAt >= 1000) {
      this.windowStartedAt = current;
      this.count = 0;
    }
    if (this.count >= this.limit) return false;
    this.count += 1;
    return true;
  }
}

class RoomManager {
  constructor(options) {
    this.options = options;
    this.rooms = new Map();
    this.connections = new Set();
  }

  createRoom(roomId = undefined, maxPlayers = this.options.maxPlayersPerRoom) {
    const id = validRoomId(roomId) || makeId("room");
    if (this.rooms.has(id)) throw new Error("ROOM_EXISTS");
    const room = {
      id,
      hostId: null,
      maxPlayers: clamp(Math.trunc(maxPlayers) || this.options.maxPlayersPerRoom, 2, 64),
      phase: "lobby",
      tick: 0,
      createdAt: this.options.now(),
      startedAt: null,
      endedAt: null,
      lastStateAt: 0,
      players: new Map(),
    };
    this.rooms.set(id, room);
    return room;
  }

  roomSummary(room) {
    return {
      id: room.id,
      phase: room.phase,
      playerCount: room.players.size,
      maxPlayers: room.maxPlayers,
      hostId: room.hostId,
    };
  }

  lobbyState() {
    return [...this.rooms.values()].map((room) => this.roomSummary(room));
  }

  roomState(room) {
    return {
      type: "state",
      roomId: room.id,
      hostId: room.hostId,
      tick: room.tick,
      phase: room.phase,
      match: {
        startedAt: room.startedAt,
        endedAt: room.endedAt,
      },
      players: [...room.players.values()].map((player) => ({
        id: player.id,
        name: player.name,
        x: Number(player.x.toFixed(3)),
        y: Number(player.y.toFixed(3)),
        z: Number(player.z.toFixed(3)),
        yaw: Number(player.yaw.toFixed(4)),
        pitch: Number(player.pitch.toFixed(4)),
        ready: player.ready,
        connected: player.connected,
        inputSeq: player.inputSeq,
      })),
    };
  }

  addConnection(connection) {
    this.connections.add(connection);
  }

  removeConnection(connection) {
    this.connections.delete(connection);
    if (connection.roomId) this.removePlayer(connection);
  }

  addPlayer(connection, room, name) {
    if (room.phase !== "lobby") throw new Error("MATCH_IN_PROGRESS");
    if (room.players.size >= room.maxPlayers) throw new Error("ROOM_FULL");
    const player = {
      id: connection.id,
      name: safeName(name),
      x: 0,
      y: 0,
      z: 0,
      yaw: 0,
      pitch: 0,
      ready: false,
      connected: true,
      input: { x: 0, z: 0, sprint: false },
      inputSeq: 0,
    };
    room.players.set(player.id, player);
    room.hostId ||= player.id;
    connection.roomId = room.id;
    connection.player = player;
    return player;
  }

  removePlayer(connection) {
    const room = this.rooms.get(connection.roomId);
    if (!room) return;
    room.players.delete(connection.id);
    connection.roomId = null;
    connection.player = null;
    if (room.hostId === connection.id) {
      room.hostId = room.players.keys().next().value || null;
      if (room.hostId) this.broadcastRoom(room, { type: "room.host", hostId: room.hostId });
    }
    this.broadcastRoom(room, { type: "player.leave", playerId: connection.id });
    if (room.players.size === 0) this.rooms.delete(room.id);
  }

  broadcastRoom(room, message) {
    for (const connection of this.connections) {
      if (connection.roomId === room.id) send(connection.socket, message);
    }
  }

  broadcastLobby() {
    const message = { type: "lobby", rooms: this.lobbyState() };
    for (const connection of this.connections) {
      if (!connection.roomId) send(connection.socket, message);
    }
  }

  startMatch(room) {
    room.phase = "running";
    room.startedAt = this.options.now();
    room.endedAt = null;
    room.tick = 0;
    this.broadcastRoom(room, {
      type: "match.start",
      roomId: room.id,
      startedAt: room.startedAt,
      durationMs: this.options.matchDurationMs,
    });
    this.broadcastRoom(room, this.roomState(room));
  }

  endMatch(room, reason = "complete") {
    if (room.phase !== "running") return;
    room.phase = "ended";
    room.endedAt = this.options.now();
    this.broadcastRoom(room, {
      type: "match.end",
      roomId: room.id,
      endedAt: room.endedAt,
      reason,
    });
    this.broadcastRoom(room, this.roomState(room));
  }

  tick() {
    const now = this.options.now();
    const dt = 1 / this.options.tickRate;
    const stateInterval = 1000 / this.options.stateRateLimit;
    for (const room of this.rooms.values()) {
      if (room.phase === "running") {
        room.tick += 1;
        for (const player of room.players.values()) {
          const speed = player.input.sprint ? 7 : 4;
          player.x = clamp(player.x + player.input.x * speed * dt, -1000, 1000);
          player.z = clamp(player.z + player.input.z * speed * dt, -1000, 1000);
        }
        if (now - room.startedAt >= this.options.matchDurationMs) this.endMatch(room, "time");
      }
      if (now - room.lastStateAt >= stateInterval) {
        room.lastStateAt = now;
        room.tick += room.phase === "running" ? 0 : 1;
        this.broadcastRoom(room, this.roomState(room));
      }
    }
  }
}

function send(socket, message) {
  if (socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify(message));
}

function protocolError(connection, code, message = code) {
  send(connection.socket, { type: "error", code, message });
}

function parseMessage(data) {
  try {
    const value = JSON.parse(data.toString());
    return value && typeof value === "object" && !Array.isArray(value) ? value : null;
  } catch {
    return null;
  }
}

function applyInput(connection, message) {
  const player = connection.player;
  if (!player) return protocolError(connection, "NOT_IN_ROOM");
  if (!connection.inputLimiter.allow()) return protocolError(connection, "RATE_LIMITED", "input rate exceeded");
  const input = message.input && typeof message.input === "object" ? message.input : message;
  const move = input.move && typeof input.move === "object" ? input.move : input;
  player.input.x = clamp(finiteNumber(move.x ?? move.moveX), -1, 1);
  player.input.z = clamp(finiteNumber(move.z ?? move.moveZ), -1, 1);
  player.input.sprint = Boolean(input.sprint);
  if (Number.isFinite(input.yaw)) player.yaw = clamp(input.yaw, -Math.PI * 8, Math.PI * 8);
  if (Number.isFinite(input.pitch)) player.pitch = clamp(input.pitch, -Math.PI / 2, Math.PI / 2);
  if (Number.isInteger(input.seq)) player.inputSeq = input.seq;
}

function createHttpServer(staticRoot) {
  return http.createServer((request, response) => {
    let filePath;
    try {
      filePath = resolvePath(request.url);
    } catch {
      filePath = null;
    }
    if (request.url?.split("?")[0] === MULTIPLAYER_PATH) {
      response.writeHead(426, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Upgrade to WebSocket required");
      return;
    }
    if (!filePath || !filePath.startsWith(staticRoot)) {
      response.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Bad request");
      return;
    }
    try {
      if (!statSync(filePath).isFile()) throw new Error("not a file");
      response.writeHead(200, {
        "Content-Type": contentTypes[extname(filePath)] || "application/octet-stream",
        "Cache-Control": "no-cache",
      });
      createReadStream(filePath).pipe(response);
    } catch {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Not found");
    }
  });
}

export function createMultiplayerServer(options = {}) {
  const config = { ...MULTIPLAYER_CONFIG, ...options };
  const now = options.now || Date.now;
  config.now = now;
  const manager = new RoomManager(config);
  const httpServer = createHttpServer(root);
  const wss = new WebSocketServer({ noServer: true, maxPayload: config.maxPayload });
  const connections = new Map();
  let tickTimer = null;
  let heartbeatTimer = null;

  const connectionFor = (socket) => connections.get(socket);

  const onMessage = (socket, data) => {
    const connection = connectionFor(socket);
    if (!connection) return;
    const message = parseMessage(data);
    if (!message || typeof message.type !== "string") return protocolError(connection, "INVALID_MESSAGE");
    switch (message.type) {
      case "ping":
        send(socket, { type: "pong", ts: message.ts ?? now() });
        break;
      case "room.create": {
        if (connection.roomId) return protocolError(connection, "ALREADY_IN_ROOM");
        try {
          const room = manager.createRoom(message.roomId, message.maxPlayers);
          manager.addPlayer(connection, room, message.playerName ?? message.name);
          send(socket, { type: "room.created", room: manager.roomSummary(room), playerId: connection.id });
          manager.broadcastRoom(room, { type: "player.join", player: { id: connection.id, name: connection.player.name } });
          manager.broadcastRoom(room, manager.roomState(room));
          manager.broadcastLobby();
        } catch (error) {
          protocolError(connection, error.message === "ROOM_EXISTS" ? "ROOM_EXISTS" : "ROOM_CREATE_FAILED");
        }
        break;
      }
      case "room.join": {
        if (connection.roomId) return protocolError(connection, "ALREADY_IN_ROOM");
        const roomId = validRoomId(message.roomId);
        const room = roomId && manager.rooms.get(roomId);
        if (!room) return protocolError(connection, "ROOM_NOT_FOUND");
        try {
          manager.addPlayer(connection, room, message.playerName ?? message.name);
          send(socket, { type: "room.joined", room: manager.roomSummary(room), playerId: connection.id });
          manager.broadcastRoom(room, { type: "player.join", player: { id: connection.id, name: connection.player.name } });
          manager.broadcastRoom(room, manager.roomState(room));
          manager.broadcastLobby();
        } catch (error) {
          protocolError(connection, error.message === "ROOM_FULL" ? "ROOM_FULL" : "MATCH_IN_PROGRESS");
        }
        break;
      }
      case "input":
        applyInput(connection, message);
        break;
      case "state":
        if (!connection.stateLimiter.allow()) return protocolError(connection, "RATE_LIMITED", "state rate exceeded");
        protocolError(connection, "STATE_AUTHORITATIVE", "state is published by the server");
        break;
      case "player.ready":
        if (!connection.player) return protocolError(connection, "NOT_IN_ROOM");
        connection.player.ready = Boolean(message.ready);
        manager.broadcastRoom(manager.rooms.get(connection.roomId), {
          type: "player.ready",
          playerId: connection.id,
          ready: connection.player.ready,
        });
        break;
      case "match.start": {
        const room = manager.rooms.get(connection.roomId);
        if (!room) return protocolError(connection, "NOT_IN_ROOM");
        if (room.hostId !== connection.id) return protocolError(connection, "NOT_HOST");
        if (room.phase !== "lobby") return protocolError(connection, "MATCH_ALREADY_STARTED");
        manager.startMatch(room);
        break;
      }
      case "match.end": {
        const room = manager.rooms.get(connection.roomId);
        if (!room) return protocolError(connection, "NOT_IN_ROOM");
        if (room.hostId !== connection.id) return protocolError(connection, "NOT_HOST");
        manager.endMatch(room, typeof message.reason === "string" ? message.reason.slice(0, 32) : "complete");
        break;
      }
      default:
        protocolError(connection, "UNKNOWN_MESSAGE");
    }
  };

  wss.on("connection", (socket, request) => {
    const connection = {
      socket,
      id: makeId("player"),
      roomId: null,
      player: null,
      inputLimiter: new RateLimiter(config.inputRateLimit, now),
      stateLimiter: new RateLimiter(config.stateRateLimit, now),
    };
    connections.set(socket, connection);
    manager.addConnection(connection);
    socket.isAlive = true;
    socket.on("pong", () => {
      socket.isAlive = true;
    });
    socket.on("message", (data) => onMessage(socket, data));
    socket.on("close", () => {
      manager.removeConnection(connection);
      connections.delete(socket);
      manager.broadcastLobby();
    });
    socket.on("error", () => socket.close());
    send(socket, {
      type: "welcome",
      playerId: connection.id,
      protocol: 1,
      multiplayerPath: config.path,
      config: {
        tickRate: config.tickRate,
        stateRateLimit: config.stateRateLimit,
        inputRateLimit: config.inputRateLimit,
      },
    });
    send(socket, { type: "lobby", rooms: manager.lobbyState() });
  });

  httpServer.on("upgrade", (request, socket, head) => {
    let pathname;
    try {
      pathname = new URL(request.url, "http://localhost").pathname;
    } catch {
      socket.destroy();
      return;
    }
    if (pathname !== config.path) {
      socket.destroy();
      return;
    }
    wss.handleUpgrade(request, socket, head, (client) => wss.emit("connection", client, request));
  });

  const start = () => new Promise((resolveStart, rejectStart) => {
    if (httpServer.listening) return resolveStart(httpServer.address());
    tickTimer = setInterval(() => manager.tick(), 1000 / config.tickRate);
    heartbeatTimer = setInterval(() => {
      for (const socket of wss.clients) {
        if (socket.isAlive === false) {
          socket.terminate();
          continue;
        }
        socket.isAlive = false;
        socket.ping();
      }
    }, 30_000);
    tickTimer.unref?.();
    heartbeatTimer.unref?.();
    httpServer.once("error", rejectStart);
    httpServer.listen(config.port ?? Number(process.env.PORT || 4190), config.host || "0.0.0.0", () => {
      httpServer.removeListener("error", rejectStart);
      resolveStart(httpServer.address());
    });
  });

  const close = () => new Promise((resolveClose, rejectClose) => {
    clearInterval(tickTimer);
    clearInterval(heartbeatTimer);
    for (const socket of wss.clients) socket.terminate();
    wss.close(() => {
      if (!httpServer.listening) return resolveClose();
      httpServer.close((error) => (error ? rejectClose(error) : resolveClose()));
    });
  });

  return {
    config: Object.freeze({ ...config, path: config.path || MULTIPLAYER_PATH }),
    httpServer,
    wss,
    rooms: manager.rooms,
    start,
    close,
  };
}

export const createServer = createMultiplayerServer;

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const app = createMultiplayerServer({ port: Number(process.env.PORT || 4190) });
  app.start().then((address) => {
    const displayPort = typeof address === "object" && address ? address.port : process.env.PORT || 4190;
    console.log(`Neon Frontier listening on http://127.0.0.1:${displayPort}/`);
    console.log(`Multiplayer WebSocket ready at ${MULTIPLAYER_PATH}`);
  }).catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
