export default {
  async fetch(request, env) {
    const url = new URL(request.url);

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
      const cacheKey = new Request(url.origin + "/api/stocks-cache-v2");
      if (!url.searchParams.has("debug")) {
        const hit = await cache.match(cacheKey);
        if (hit) return hit;
      }
      const rows = [];
      if (env.FINNHUB_KEY) {
        const quotes = await Promise.all(["AAPL", "NVDA", "SPY"].map(async sym => {
          try {
            const q = await (await fetch(
              `https://finnhub.io/api/v1/quote?symbol=${sym}&token=${env.FINNHUB_KEY}`
            )).json();
            if (!q?.c || !q?.pc) return null;
            return { name: sym, price: q.c, change: (q.c / q.pc - 1) * 100 };
          } catch {
            return null;
          }
        }));
        rows.push(...quotes.filter(Boolean));
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
      if (url.searchParams.has("debug")) return Response.json({ rows, debug });
      const res = Response.json(rows, {
        headers: { "cache-control": rows.length ? "public, max-age=300" : "no-store" }
      });
      if (rows.length) await cache.put(cacheKey, res.clone());
      return res;
    }

    return env.ASSETS.fetch(request);
  }
};
