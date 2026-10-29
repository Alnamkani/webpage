import { DurableObject } from "cloudflare:workers";

/**
 * One Gym = one Durable Object.
 *
 *  - Addressed by name: env.GYM.getByName("jeddah") always reaches the same instance.
 *  - Who's here (climbers, cursors) lives in memory + WebSocket attachments.
 *  - The wall (holds, routes) lives in this object's own SQLite database.
 *  - Single-threaded: two people can't grab the same spot at once.
 *  - Hibernatable WebSockets: the gym sleeps when idle, sockets stay open.
 *  - An alarm resets the wall on a schedule, like a real route-setting day.
 */

export const HOLD_TYPES = ["jug", "crimp", "sloper", "pinch", "pocket"] as const;
export const ROUTE_COLORS = ["teal", "gold", "coral", "green", "violet", "ink"] as const;
const GRADES = ["VB", "V0", "V1", "V2", "V3", "V4", "V5", "V6", "V7", "V8", "V9", "V10"];

const WALL = { w: 1000, h: 600, top: 50, bottom: 525 };
const MAX_HOLDS = 260;
const MIN_GAP = 20; // two holds can't share a T-nut
const HUES = [188, 44, 6, 128, 268, 330, 214, 24, 160, 292];

type HoldType = (typeof HOLD_TYPES)[number];
type RouteColor = (typeof ROUTE_COLORS)[number];

interface Hold { id: number; type: HoldType; color: RouteColor; x: number; y: number; r: number; by: string; at: number }
interface Route { color: RouteColor; name: string; grade: string; setter: string }
interface Climber { id: string; name: string; hue: number; joined: number }

export interface Env {
  GYM: DurableObjectNamespace<Gym>;
  RESET_HOURS?: string;
}

const clampNum = (v: unknown, lo: number, hi: number) =>
  typeof v === "number" && Number.isFinite(v) ? Math.min(hi, Math.max(lo, v)) : null;
const cleanText = (v: unknown, max: number) =>
  typeof v === "string" ? v.replace(/[\u0000-\u001f<>]/g, "").trim().slice(0, max) : "";

export class Gym extends DurableObject<Env> {
  /** When this instance was constructed: after first visit, eviction, or hibernation. */
  private wokeAt = Date.now();
  private announcedWake = false;
  private lastCursor = new Map<WebSocket, number>();
  private sql: SqlStorage;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    this.sql = ctx.storage.sql;
    ctx.blockConcurrencyWhile(async () => {
      this.sql.exec(`
        CREATE TABLE IF NOT EXISTS holds (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          type TEXT NOT NULL, color TEXT NOT NULL,
          x REAL NOT NULL, y REAL NOT NULL, r REAL NOT NULL DEFAULT 0,
          by TEXT NOT NULL, at INTEGER NOT NULL
        );
        CREATE TABLE IF NOT EXISTS routes (
          color TEXT PRIMARY KEY, name TEXT NOT NULL, grade TEXT NOT NULL, setter TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS resets (
          at INTEGER NOT NULL, holds INTEGER NOT NULL
        );
        CREATE TABLE IF NOT EXISTS meta (k TEXT PRIMARY KEY, v TEXT NOT NULL);
      `);
      if ((await ctx.storage.getAlarm()) == null) {
        await ctx.storage.setAlarm(Date.now() + this.resetMs());
      }
    });
  }

  private resetMs() {
    const h = Number(this.env.RESET_HOURS ?? 168);
    return (Number.isFinite(h) && h > 0 ? h : 168) * 3_600_000;
  }

  // ---------- HTTP: WebSocket upgrade + a small JSON peek ----------

  async fetch(req: Request): Promise<Response> {
    const url = new URL(req.url);
    const gymName = url.searchParams.get("gym") ?? "gym";
    this.sql.exec("INSERT OR IGNORE INTO meta (k, v) VALUES ('name', ?)", gymName);

    if (req.headers.get("Upgrade") !== "websocket") {
      return Response.json(await this.info());
    }

    const sockets = this.ctx.getWebSockets();
    const coldStart = !this.announcedWake && sockets.length === 0;
    this.announcedWake = true;

    const used = new Set(sockets.map(ws => (ws.deserializeAttachment() as Climber)?.hue));
    const hue = HUES.find(h => !used.has(h)) ?? HUES[sockets.length % HUES.length];
    const me: Climber = {
      id: crypto.randomUUID().slice(0, 8),
      name: cleanText(url.searchParams.get("name"), 20) || "Climber",
      hue,
      joined: Date.now(),
    };

    const [client, server] = Object.values(new WebSocketPair());
    this.ctx.acceptWebSocket(server);
    server.serializeAttachment(me);

    server.send(JSON.stringify({
      t: "welcome",
      you: me,
      gym: {
        name: gymName,
        id: this.ctx.id.toString(),
        wokeAt: this.wokeAt,
        coldStart,
        nextReset: await this.ctx.storage.getAlarm(),
        resetEveryMs: this.resetMs(),
        resets: this.sql.exec("SELECT COUNT(*) AS n FROM resets").one().n,
        maxHolds: MAX_HOLDS,
      },
      holds: this.holds(),
      routes: this.routes(),
      climbers: [...sockets.map(ws => ws.deserializeAttachment() as Climber), me],
    }));
    this.broadcast({ t: "join", climber: me }, server);

    return new Response(null, { status: 101, webSocket: client });
  }

  async info() {
    return {
      id: this.ctx.id.toString(),
      climbers: this.ctx.getWebSockets().length,
      holds: this.sql.exec("SELECT COUNT(*) AS n FROM holds").one().n,
      wokeAt: this.wokeAt,
      nextReset: await this.ctx.storage.getAlarm(),
    };
  }

  // ---------- WebSocket handlers (these wake a hibernating gym) ----------

  async webSocketMessage(ws: WebSocket, raw: string | ArrayBuffer) {
    if (typeof raw !== "string" || raw.length > 600) return;
    const me = ws.deserializeAttachment() as Climber;
    if (!me) return;

    // The constructor ran again while sockets were still open: we just woke from hibernation.
    if (!this.announcedWake) {
      this.announcedWake = true;
      this.broadcast({ t: "woke", wokeAt: this.wokeAt });
    }

    let m: any;
    try { m = JSON.parse(raw); } catch { return; }

    switch (m.t) {
      case "cursor": {
        const now = Date.now();
        if (now - (this.lastCursor.get(ws) ?? 0) < 25) return;
        this.lastCursor.set(ws, now);
        const x = clampNum(m.x, 0, WALL.w), y = clampNum(m.y, 0, WALL.h);
        if (x == null || y == null) return;
        this.broadcast({ t: "cursor", id: me.id, x: Math.round(x), y: Math.round(y) }, ws);
        return;
      }

      case "place": {
        const type = HOLD_TYPES.includes(m.type) ? (m.type as HoldType) : null;
        const color = ROUTE_COLORS.includes(m.color) ? (m.color as RouteColor) : null;
        const x = clampNum(m.x, 20, WALL.w - 20), y = clampNum(m.y, WALL.top, WALL.bottom - 8);
        const r = clampNum(m.r, -180, 180) ?? 0;
        if (!type || !color || x == null || y == null) return this.reject(ws, m.ref, "bad hold");

        const count = this.sql.exec("SELECT COUNT(*) AS n FROM holds").one().n as number;
        if (count >= MAX_HOLDS) return this.reject(ws, m.ref, "The wall is full. Wait for reset day.");
        if (this.taken(x, y)) return this.reject(ws, m.ref, "Someone beat you to that spot.");

        const at = Date.now();
        const sql = "INSERT INTO holds (type, color, x, y, r, by, at) VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING id";
        const id = this.sql.exec(sql, type, color, x, y, r, me.name, at).one().id as number;
        const hold: Hold = { id, type, color, x, y, r, by: me.name, at };
        this.broadcast({ t: "placed", hold, ref: m.ref, from: me.id, sql: sql.replace(" RETURNING id", ""), fanout: this.fanout() });
        return;
      }

      case "move": {
        const id = clampNum(m.id, 0, Number.MAX_SAFE_INTEGER);
        const x = clampNum(m.x, 20, WALL.w - 20), y = clampNum(m.y, WALL.top, WALL.bottom - 8);
        if (id == null || x == null || y == null) return;
        if (this.taken(x, y, id)) {
          const back = this.sql.exec("SELECT x, y FROM holds WHERE id = ?", id).toArray()[0];
          ws.send(JSON.stringify({ t: "moved", id, x: back?.x, y: back?.y, from: "server" }));
          return this.reject(ws, m.ref, "That spot is taken.");
        }
        const sql = "UPDATE holds SET x = ?, y = ? WHERE id = ?";
        if (this.sql.exec(sql, x, y, id).rowsWritten === 0) return;
        this.broadcast({ t: "moved", id, x, y, from: me.id, sql, fanout: this.fanout() });
        return;
      }

      case "rotate": {
        const id = clampNum(m.id, 0, Number.MAX_SAFE_INTEGER), r = clampNum(m.r, -360, 360);
        if (id == null || r == null) return;
        const sql = "UPDATE holds SET r = ? WHERE id = ?";
        if (this.sql.exec(sql, r, id).rowsWritten === 0) return;
        this.broadcast({ t: "rotated", id, r, from: me.id, sql, fanout: this.fanout() }, ws);
        return;
      }

      case "remove": {
        const id = clampNum(m.id, 0, Number.MAX_SAFE_INTEGER);
        if (id == null) return;
        const sql = "DELETE FROM holds WHERE id = ?";
        if (this.sql.exec(sql, id).rowsWritten === 0) return;
        this.broadcast({ t: "removed", id, from: me.id, sql, fanout: this.fanout() });
        return;
      }

      case "route": {
        const color = ROUTE_COLORS.includes(m.color) ? (m.color as RouteColor) : null;
        const grade = GRADES.includes(m.grade) ? m.grade : "V0";
        const name = cleanText(m.name, 28);
        if (!color || !name) return;
        const sql = "INSERT OR REPLACE INTO routes (color, name, grade, setter) VALUES (?, ?, ?, ?)";
        this.sql.exec(sql, color, name, grade, me.name);
        this.broadcast({ t: "route", route: { color, name, grade, setter: me.name }, from: me.id, sql, fanout: this.fanout() });
        return;
      }

      case "rename": {
        const name = cleanText(m.name, 20);
        if (!name) return;
        me.name = name;
        ws.serializeAttachment(me);
        this.broadcast({ t: "renamed", id: me.id, name });
        return;
      }
    }
  }

  async webSocketClose(ws: WebSocket, code: number) {
    this.leave(ws);
    try { ws.close(code === 1005 ? 1000 : code, "bye"); } catch {}
  }

  async webSocketError(ws: WebSocket) {
    this.leave(ws);
  }

  // ---------- Reset day ----------

  async alarm() {
    const n = this.sql.exec("SELECT COUNT(*) AS n FROM holds").one().n as number;
    this.sql.exec("INSERT INTO resets (at, holds) VALUES (?, ?)", Date.now(), n);
    this.sql.exec("DELETE FROM holds");
    this.sql.exec("DELETE FROM routes");
    const next = Date.now() + this.resetMs();
    await this.ctx.storage.setAlarm(next);
    this.broadcast({ t: "reset", stripped: n, nextReset: next });
  }

  // ---------- helpers ----------

  private holds(): Hold[] {
    return this.sql.exec("SELECT id, type, color, x, y, r, by, at FROM holds ORDER BY id").toArray() as unknown as Hold[];
  }
  private routes(): Route[] {
    return this.sql.exec("SELECT color, name, grade, setter FROM routes").toArray() as unknown as Route[];
  }
  private taken(x: number, y: number, except = -1) {
    const g = MIN_GAP;
    return this.sql.exec(
      "SELECT 1 FROM holds WHERE id != ? AND (x - ?) * (x - ?) + (y - ?) * (y - ?) < ? LIMIT 1",
      except, x, x, y, y, g * g,
    ).toArray().length > 0;
  }
  private fanout() {
    return this.ctx.getWebSockets().length;
  }
  private reject(ws: WebSocket, ref: unknown, reason: string) {
    ws.send(JSON.stringify({ t: "reject", ref, reason }));
  }
  private leave(ws: WebSocket) {
    const me = ws.deserializeAttachment() as Climber | null;
    this.lastCursor.delete(ws);
    if (me) this.broadcast({ t: "leave", id: me.id }, ws);
  }
  private broadcast(msg: unknown, except?: WebSocket) {
    const s = JSON.stringify(msg);
    for (const ws of this.ctx.getWebSockets()) {
      if (ws === except) continue;
      try { ws.send(s); } catch {}
    }
  }
}
