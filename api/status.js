/**
 * Vercel Serverless Function
 * GET /api/status?ids=a,b,c
 *
 * live 판별: broad_no 존재 시에만 true (오판 방지)
 */

function pickTwitter(html){
  const re = new RegExp(`<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']`, "i");
  const m = html.match(re);
  return m ? m[1] : null;
}

function normalizeUrl(u){
  if(!u) return null;
  let url = String(u).trim();
  if(!url) return null;
  if(url.startsWith("//")) url = "https:" + url;
  // Some station pages return relative paths
  if(url.startsWith("/")) url = "https://www.sooplive.co.kr" + url;
  return url;
}

async function fetchStationProfileImage(id){
  const url = `https://www.sooplive.co.kr/station/${encodeURIComponent(id)}`;
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0",
      "Accept": "text/html,application/xhtml+xml",
    }
  });
  const html = await res.text();

  // 1) Most stable: og:image / twitter:image
  let img = normalizeUrl(pickOg(html, "og:image") || pickTwitter(html));

  // 2) Some stations return a placeholder image in og:image when offline
  const isPlaceholder = (v) => !!v && /blind_background\.svg/i.test(v);
  if(isPlaceholder(img)) img = null;

  // 3) Fallback: try to locate a profile image field inside inline JSON/script
  if(!img){
    const patterns = [
      /"profile_image"\s*:\s*"([^"]+)"/i,
      /"profileImage"\s*:\s*"([^"]+)"/i,
      /profile_image\s*=\s*"([^"]+)"/i,
      /profileImage\s*=\s*"([^"]+)"/i,
      /"station_profile_image"\s*:\s*"([^"]+)"/i,
    ];
    for(const p of patterns){
      const m = html.match(p);
      if(m){
        const cand = normalizeUrl(m[1]);
        if(cand && !isPlaceholder(cand)){
          img = cand;
          break;
        }
      }
    }
  }

  return img;
}

function pickOg(html, prop){
  const re = new RegExp(`<meta[^>]+property=["']${prop}["'][^>]+content=["']([^"']+)["']`, "i");
  const m = html.match(re);
  return m ? m[1] : null;
}
function isLiveFromPlay(html){
  return /broad_no\s*[:=]\s*\d+/i.test(html);
}
function extractViewers(html){
  const patterns = [
    /view[_-]?cnt\W*[:=]\W*(\d{1,9})/i,
    /viewer\W*[:=]\W*(\d{1,9})/i,
    /watch\w*\W*[:=]\W*(\d{1,9})/i,
    /nViewCnt\W*[:=]\W*(\d{1,9})/i,
    /"viewCnt"\s*:\s*(\d{1,9})/i,
    /"viewerCnt"\s*:\s*(\d{1,9})/i
  ];
  for(const p of patterns){
    const m = html.match(p);
    if(m) return Number(m[1]);
  }
  return null;
}
function extractTitle(html){
  const ogt = pickOg(html, "og:title");
  if(ogt) return ogt;
  const m = html.match(/<title>([^<]+)<\/title>/i);
  return m ? m[1].trim() : null;
}

export default async function handler(req, res) {
  const ids = String(req.query.ids || "")
    .split(",")
    .map(v => v.trim())
    .filter(Boolean)
    .slice(0, 60);

  if (!ids.length) return res.status(200).json({ items: [] });

  const headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
  };

  const items = await Promise.all(ids.map(async (id) => {
    const playUrl = `https://play.sooplive.co.kr/${id}`;
    const stationUrl = `https://www.sooplive.co.kr/station/${id}`;

    let live = false, profileImage = null, thumb = null, viewers = null, title = null;

    try {
      const [playRes, stationRes] = await Promise.all([
        fetch(playUrl, { headers }),
        fetch(stationUrl, { headers })
      ]);
      const [playHtml, stationHtml] = await Promise.all([
        playRes.text(),
        stationRes.text()
      ]);

      live = isLiveFromPlay(playHtml);

      // Always use station profile image for the circle avatar
      profileImage = await fetchStationProfileImage(id);

      // Title/viewers/thumb are only meaningful when LIVE
      title = extractTitle(playHtml) || extractTitle(stationHtml);
      if (live) {
        thumb = normalizeUrl(pickOg(playHtml, "og:image") || pickOg(stationHtml, "og:image"));
        viewers = extractViewers(playHtml);
      }
    } catch (_) {}

    return { id, live, profileImage, thumb, viewers, title };
  }));

  res.setHeader("Cache-Control", "s-maxage=30, stale-while-revalidate=60");
  return res.status(200).json({ items });
}
