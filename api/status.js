/**
 * Vercel Serverless Function
 * GET /api/status?ids=a,b,c
 *
 * 반환:
 *  - live: boolean (휴리스틱)
 *  - profileImage: og:image (방송국 페이지 우선)
 *  - thumb: 라이브 미리보기 썸네일 (가능하면)
 *  - viewers: 시청자수 (가능하면)
 *  - title: 방송 제목 (가능하면)
 *
 * NOTE: SOOP 페이지 구조가 바뀌면 정규식만 조정하면 됩니다.
 */

function pickOg(html, prop){
  const re = new RegExp(`<meta[^>]+property=["']${prop}["'][^>]+content=["']([^"']+)["']`, "i");
  const m = html.match(re);
  return m ? m[1] : null;
}

function isLiveFromPlay(html){
  // 여러 힌트를 조합 (안정성)
  const hasBroadNo = /broad_no\W*[:=]\W*\d+/i.test(html);
  const hasLive = /\bLIVE\b|방송중|생방|onair|on-air/i.test(html);
  // 플레이 페이지에 특정 스트림/플레이어 힌트
  const hasPlayer = /player|hls|m3u8|vod|stream/i.test(html);
  return (hasBroadNo && hasPlayer) || (hasLive && hasPlayer);
}

function extractViewers(html){
  // 다양한 필드명 시도
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
  // og:title 우선
  const ogt = pickOg(html, "og:title");
  if(ogt) return ogt;
  // title tag
  const m = html.match(/<title>([^<]+)<\/title>/i);
  return m ? m[1].trim() : null;
}

export default async function handler(req, res) {
  const ids = String(req.query.ids || "")
    .split(",")
    .map(v => v.trim())
    .filter(Boolean)
    .slice(0, 60);

  if (!ids.length) {
    return res.status(200).json({ items: [] });
  }

  const headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
  };

  const items = await Promise.all(ids.map(async (id) => {
    const playUrl = `https://play.sooplive.co.kr/${id}`;
    const stationUrl = `https://www.sooplive.co.kr/station/${id}`;

    let live = false;
    let profileImage = null;
    let thumb = null;
    let viewers = null;
    let title = null;

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

      // profile: station og:image 우선
      profileImage = pickOg(stationHtml, "og:image") || pickOg(playHtml, "og:image");

      // title
      title = extractTitle(playHtml) || extractTitle(stationHtml);

      // thumb: og:image가 방송 썸네일일 때가 많음. 라이브일 때 우선 제공
      if (live) {
        thumb = pickOg(playHtml, "og:image") || pickOg(stationHtml, "og:image");
      }

      // viewers: best-effort
      if (live) {
        viewers = extractViewers(playHtml);
      }
    } catch (e) {
      // ignore, return defaults
    }

    return { id, live, profileImage, thumb, viewers, title };
  }));

  // Cache for 30 seconds at the edge (Vercel)
  res.setHeader("Cache-Control", "s-maxage=30, stale-while-revalidate=60");
  return res.status(200).json({ items });
}