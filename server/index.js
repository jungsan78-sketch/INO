import express from "express";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static
app.use(express.static(path.join(__dirname, "..")));

// Simple in-memory cache
const cache = new Map(); // key -> {ts, data}
const TTL_MS = 60_000;

function cacheGet(key){
  const v = cache.get(key);
  if(!v) return null;
  if(Date.now() - v.ts > TTL_MS) return null;
  return v.data;
}
function cacheSet(key, data){
  cache.set(key, { ts: Date.now(), data });
}

async function fetchHtml(url){
  const r = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
    }
  });
  const text = await r.text();
  return text;
}

/**
 * LIVE 판별 (휴리스틱)
 * - 플랫폼 구조가 바뀌면 조정이 필요할 수 있어요.
 */
function isLiveFromPlayHtml(html){
  // Common hints: broad_no, "LIVE", on-air markers
  const hasBroadNo = /broad_no\W*[:=]\W*\d+/i.test(html);
  const hasLiveWord = /\bLIVE\b/i.test(html);
  const hasOnAir = /onair|on-air|방송중|생방/i.test(html);
  return hasBroadNo || (hasLiveWord && hasOnAir);
}

function getOgImage(html){
  const m = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i);
  return m?.[1] || null;
}

async function getStatusForId(id){
  const key = `status:${id}`;
  const cached = cacheGet(key);
  if(cached) return cached;

  const play = `https://play.sooplive.co.kr/${id}`;
  const station = `https://www.sooplive.co.kr/station/${id}`;

  let live = false;
  let profileImage = null;

  try{
    const [playHtml, stationHtml] = await Promise.all([fetchHtml(play), fetchHtml(station)]);
    live = isLiveFromPlayHtml(playHtml);
    profileImage = getOgImage(stationHtml) || getOgImage(playHtml);
  }catch(_){
    // ignore
  }

  const data = { id, live, profileImage };
  cacheSet(key, data);
  return data;
}

app.get("/api/status", async (req, res) => {
  const ids = String(req.query.ids || "")
    .split(",")
    .map(s => s.trim())
    .filter(Boolean)
    .slice(0, 80);

  if(!ids.length){
    return res.json({ items: [] });
  }

  try{
    const items = await Promise.all(ids.map(getStatusForId));
    res.json({ items });
  }catch(e){
    res.status(500).json({ error: "failed" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});