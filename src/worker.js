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
        return Response.json(items.filter(Boolean));
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
        await env.DRAWINGS.put(key, body);
        await env.DRAWINGS.put("ip:" + ip, "1", { expirationTtl: 60 });
        return Response.json({ ok: true });
      }
      return new Response("method not allowed", { status: 405 });
    }

    if (url.pathname === "/api/stocks") {
      const cache = caches.default;
      const cacheKey = new Request(url.origin + "/api/stocks");
      const hit = await cache.match(cacheKey);
      if (hit) return hit;
      const SYMBOLS = [
        ["AAPL", "AAPL"],
        ["NVDA", "NVDA"],
        ["^GSPC", "S&P 500"],
        ["BTC-USD", "BTC"]
      ];
      const rows = (await Promise.all(SYMBOLS.map(async ([sym, name]) => {
        try {
          const r = await fetch(
            `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(sym)}?interval=1d&range=2d`,
            { headers: { "user-agent": "Mozilla/5.0" } }
          );
          const meta = (await r.json())?.chart?.result?.[0]?.meta;
          if (!meta?.regularMarketPrice || !meta?.chartPreviousClose) return null;
          return {
            name,
            price: meta.regularMarketPrice,
            change: (meta.regularMarketPrice / meta.chartPreviousClose - 1) * 100
          };
        } catch {
          return null;
        }
      }))).filter(Boolean);
      const res = Response.json(rows, { headers: { "cache-control": "public, max-age=300" } });
      if (rows.length) await cache.put(cacheKey, res.clone());
      return res;
    }

    return env.ASSETS.fetch(request);
  }
};
