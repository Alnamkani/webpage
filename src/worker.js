import { Gym } from "./gym.ts";

export { Gym };

const GYM_ROUTE = /^\/api\/gym\/([^/]+)(\/ws)?$/;
const GYM_NAME = "boulder-gym"; // there is exactly one gym

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Boulder Gym: one gym, one Durable Object.
    const gym = url.pathname.match(GYM_ROUTE);
    if (gym) {
      const name = decodeURIComponent(gym[1]).toLowerCase();
      if (name !== GYM_NAME) return new Response("No such gym", { status: 404 });
      const isWs = Boolean(gym[2]);
      if (isWs && request.headers.get("Upgrade") !== "websocket") {
        return new Response("Expected WebSocket", { status: 426 });
      }
      const inner = new URL(request.url);
      inner.searchParams.set("gym", name);
      const stub = env.GYM.getByName(name);
      return stub.fetch(isWs ? new Request(inner, request) : new Request(inner));
    }

    if (url.pathname === "/api/geo") {
      const cf = request.cf || {};
      return Response.json(
        { city: cf.city || null, lat: cf.latitude || null, lon: cf.longitude || null },
        { headers: { "cache-control": "no-store" } }
      );
    }

    if (url.pathname === "/api/drawings") {
      if (request.method === "GET") {
        const list = await env.DRAWINGS.list({ prefix: "d:", limit: 48 });
        const items = await Promise.all(list.keys.map(k => env.DRAWINGS.get(k.name)));
        return Response.json(items.filter(Boolean).map(v => {
          if (v.startsWith("data:")) return { img: v, city: null, country: null, ts: null };
          try { return JSON.parse(v); } catch { return null; }
        }).filter(Boolean));
      }
      if (request.method === "POST") {
        const ip = request.headers.get("cf-connecting-ip") || "unknown";
        if (await env.DRAWINGS.get("ip:" + ip)) {
          return new Response("one drawing per minute — take your time", { status: 429 });
        }
        const body = await request.text();
        if (body.length > 60000 || !/^data:image\/png;base64,[A-Za-z0-9+/=]+$/.test(body)) {
          return new Response("bad drawing", { status: 400 });
        }
        const key = "d:" + String(1e13 - Date.now()) + ":" + Math.random().toString(36).slice(2, 8);
        await env.DRAWINGS.put(key, JSON.stringify({
          img: body,
          city: request.cf?.city || null,
          country: request.cf?.country || null,
          ts: Date.now()
        }));
        await env.DRAWINGS.put("ip:" + ip, "1", { expirationTtl: 60 });
        return Response.json({ ok: true });
      }
      return new Response("method not allowed", { status: 405 });
    }

    if (url.pathname === "/api/stocks") {
      const cache = caches.default;
      const cacheKey = new Request(url.origin + "/api/stocks-cache-v3");
      if (!url.searchParams.has("debug")) {
        const hit = await cache.match(cacheKey);
        if (hit) return hit;
      }
      const rows = [];
      const fhDebug = { hasKey: Boolean(env.FINNHUB_KEY) };
      if (env.FINNHUB_KEY) {
        for (const [sym, name] of [
          ["AAPL", "AAPL"], ["NVDA", "NVDA"], ["SPY", "S&P 500"], ["QQQ", "Nasdaq"]
        ]) {
          try {
            const r = await fetch(
              `https://finnhub.io/api/v1/quote?symbol=${sym}&token=${env.FINNHUB_KEY}`
            );
            const text = await r.text();
            fhDebug[sym] = { status: r.status, head: text.slice(0, 160) };
            const q = JSON.parse(text);
            if (q?.c && q?.pc) rows.push({ name, price: q.c, change: (q.c / q.pc - 1) * 100 });
          } catch (e) {
            fhDebug[sym] = { ...fhDebug[sym], error: String(e) };
          }
          await new Promise(ok => setTimeout(ok, 150));
        }
      }
      let debug = null;
      for (const [pair, name] of [["BTC-USD", "BTC"], ["ETH-USD", "ETH"]]) {
        try {
          const r = await fetch(`https://api.exchange.coinbase.com/products/${pair}/stats`, {
            headers: { "user-agent": "alnamkani.com" }
          });
          const text = await r.text();
          debug = { status: r.status, body: text.slice(0, 160) };
          const s = JSON.parse(text);
          const last = parseFloat(s.last), open = parseFloat(s.open);
          if (isFinite(last) && isFinite(open)) {
            rows.push({ name, price: last, change: (last / open - 1) * 100 });
          }
        } catch (e) {
          debug = { error: String(e), ...debug };
        }
      }
      if (url.searchParams.has("debug")) return Response.json({ rows, debug, fhDebug });
      const expected = (env.FINNHUB_KEY ? 4 : 0) + 2;
      const complete = rows.length === expected;
      const res = Response.json(rows, {
        headers: {
          "cache-control": rows.length ? `public, max-age=${complete ? 300 : 60}` : "no-store"
        }
      });
      if (complete) await cache.put(cacheKey, res.clone());
      return res;
    }

    return env.ASSETS.fetch(request);
  }
};
