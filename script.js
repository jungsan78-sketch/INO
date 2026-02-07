
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

/** ===== SOOP MEMBERS ===== */
const MEMBERS = [
  { name: "김인호", role: "운영진", rank: "이사장", tierLabel: "3티어", tierSort: 3, soopId: "pookygamja" },
  { name: "김성대", role: "운영진", rank: "총장",   tierLabel: "갓티어", tierSort: 0, soopId: "tjdeosks" },
  { name: "임진묵", role: "운영진", rank: "부총장", tierLabel: "잭티어", tierSort: 2, soopId: "organ333" },

  { name: "변현제", role: "교수", rank: "교수", tierLabel: "갓티어", tierSort: 0, soopId: "bye1013" },
  { name: "이예훈", role: "교수", rank: "교수", tierLabel: "킹티어", tierSort: 1, soopId: "gnsl418" },
  { name: "윤수철", role: "교수", rank: "교수", tierLabel: "킹티어", tierSort: 1, soopId: "snfjdro369" },
  { name: "구성훈", role: "교수", rank: "교수", tierLabel: "킹티어", tierSort: 1, soopId: "rladuddo99" },
  { name: "어윤수", role: "교수", rank: "교수", tierLabel: "잭티어", tierSort: 2, soopId: "djdbstn" },
  { name: "김범수", role: "교수", rank: "교수", tierLabel: "잭티어", tierSort: 2, soopId: "bumsoo552" },

  { name: "다나짱", role: "학생", rank: "학생", tierLabel: "2티어", tierSort: 4, soopId: "cyj982002" },
  { name: "박듀듀", role: "학생", rank: "학생", tierLabel: "3티어", tierSort: 5, soopId: "parkle1006" },
  { name: "이유란", role: "학생", rank: "학생", tierLabel: "3티어", tierSort: 5, soopId: "forweourus" },
  { name: "라운이", role: "학생", rank: "학생", tierLabel: "5티어", tierSort: 7, soopId: "dmsthfdldia" },
  { name: "비타밍", role: "학생", rank: "학생", tierLabel: "6티어", tierSort: 8, soopId: "seemin88" },
  { name: "김설", role: "학생", rank: "학생", tierLabel: "6티어", tierSort: 8, soopId: "rnfma14" },
  { name: "수니양", role: "학생", rank: "학생", tierLabel: "6티어", tierSort: 8, soopId: "nasd06" },
  { name: "다뉴", role: "학생", rank: "학생", tierLabel: "7티어", tierSort: 9, soopId: "danu619" },
  { name: "아리송이", role: "학생", rank: "학생", tierLabel: "7티어", tierSort: 9, soopId: "vldpfm2" },
  { name: "김말랑", role: "학생", rank: "학생", tierLabel: "7티어", tierSort: 9, soopId: "5eulgii" },
  { name: "연또", role: "학생", rank: "학생", tierLabel: "8티어", tierSort: 10, soopId: "kjy3443" },
  { name: "밤하밍", role: "학생", rank: "학생", tierLabel: "유스", tierSort: 11, soopId: "haeun5513" }
];

function stationUrl(id){ return `https://www.sooplive.co.kr/station/${id}`; }
function playUrl(id){ return `https://play.sooplive.co.kr/${id}`; }

/** ===== UI refs (members) ===== */
const modal = document.getElementById("modal");
const modalBody = document.getElementById("modalBody");

const preview = document.getElementById("preview");
const previewImg = document.getElementById("previewImg");
const previewTitle = document.getElementById("previewTitle");
const previewViewers = document.getElementById("previewViewers");
const previewLive = document.getElementById("previewLive");

const OFFLINE_PREVIEW_SVG = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='640' height='360' viewBox='0 0 640 360'>
    <defs>
      <linearGradient id='g' x1='0' x2='1' y1='0' y2='1'>
        <stop offset='0' stop-color='#121418'/>
        <stop offset='1' stop-color='#242832'/>
      </linearGradient>
    </defs>
    <rect width='640' height='360' fill='url(#g)'/>
    <circle cx='320' cy='155' r='44' fill='rgba(216,177,78,0.15)' stroke='rgba(216,177,78,0.55)' stroke-width='4'/>
    <path d='M312 136 L312 174 L344 155 Z' fill='rgba(216,177,78,0.85)'/>
    <text x='320' y='260' text-anchor='middle' font-family='Arial, sans-serif' font-size='22' fill='rgba(255,255,255,0.9)'>방송 준비중</text>
    <text x='320' y='290' text-anchor='middle' font-family='Arial, sans-serif' font-size='14' fill='rgba(255,255,255,0.55)'>HOVER 미리보기</text>
  </svg>`
)}`;

const gridChairman = document.getElementById("grid-chairman");
const gridExec = document.getElementById("grid-exec");
const gridProf = document.getElementById("grid-prof");
const gridStudent = document.getElementById("grid-student");

let activeFilter = "all"; // (unused in pyramid layout)
let statusById = {};

/** ===== Tabs ===== */
document.querySelectorAll(".nav-link").forEach(btn => {
  btn.addEventListener("click", () => {
    const tab = btn.getAttribute("data-tab");
    document.querySelectorAll(".nav-link").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    document.querySelectorAll(".tab").forEach(s => s.classList.remove("tab-active"));
    document.getElementById(`tab-${tab}`).classList.add("tab-active");
    if(tab === "members") hydrateVisible();
    if(tab === "community") loadBoardPosts();
  });
});

/** ===== Filters (members) ===== */

function sortKey(m){
  const roleOrder = m.role === "운영진" ? 0 : (m.role === "교수" ? 1 : 2);
  return `${roleOrder}-${String(m.tierSort).padStart(2,"0")}-${m.name}`;
}

function cardTemplate(m){
  return `
    <div class="card" data-id="${m.soopId}" tabindex="0" role="button" aria-label="${m.name} 상세 보기">
      <span class="badge-live" id="live_${m.soopId}">LIVE</span>
      <div class="avatar" aria-hidden="true">
        <img id="img_${m.soopId}" alt="${m.name} 프로필" src="assets/logo.jpg" />
        <span class="live-dot" id="dot_${m.soopId}"></span>
      </div>
      <div class="name">${m.name}</div>
      <div class="meta">${m.rank}</div>
      <div class="pills">
        <span class="pill2 pill-tier">${m.tierLabel}</span>
      </div>
      <div class="actions" onclick="event.stopPropagation()">
        <a class="action-btn action-primary" href="${playUrl(m.soopId)}" target="_blank" rel="noopener">LIVE 보기</a>
        <a class="action-btn" href="${stationUrl(m.soopId)}" target="_blank" rel="noopener">방송국</a>
      </div>
    </div>
  `;
}

function renderMembers(){
  if(!gridChairman) return;

  const chairman = MEMBERS.filter(m => m.rank === "이사장");
  const exec = MEMBERS.filter(m => m.rank === "총장" || m.rank === "부총장");
  const prof = MEMBERS.filter(m => m.rank === "교수");
  const student = MEMBERS.filter(m => m.rank === "학생");

  // Keep tier-based ordering inside each group
  exec.sort((a,b) => a.tierSort - b.tierSort);
  prof.sort((a,b) => a.tierSort - b.tierSort);
  student.sort((a,b) => a.tierSort - b.tierSort);

  gridChairman.innerHTML = chairman.map(cardTemplate).join("");
  gridExec.innerHTML = exec.map(cardTemplate).join("");
  gridProf.innerHTML = prof.map(cardTemplate).join("");
  gridStudent.innerHTML = student.map(cardTemplate).join("");

  attachMemberEvents();
  hydrateVisible();
}

function attachMemberEvents(){
  [...document.querySelectorAll(".card")].forEach(card => {
    const id = card.getAttribute("data-id");
    card.addEventListener("click", () => openMemberModal(id));
    card.addEventListener("keydown", (e) => {
      if(e.key === "Enter" || e.key === " "){
        e.preventDefault();
        openMemberModal(id);
      }
    });
    card.addEventListener("mousemove", (e) => onHoverMove(e));
    card.addEventListener("mouseenter", (e) => onHoverEnter(e, id));
    card.addEventListener("mouseleave", onHoverLeave);
  });
}

function openMemberModal(soopId){
  const m = MEMBERS.find(x => x.soopId === soopId);
  if(!m) return;
  const st = statusById[soopId] || {};
  const imgSrc = st.profileImage || document.getElementById(`img_${soopId}`)?.getAttribute("src") || "assets/logo.jpg";
  const liveOn = !!st.live;
  const viewersTxt = st.viewers != null ? `${formatNumber(st.viewers)}명 시청` : "시청자 정보 없음";

  modalBody.innerHTML = `
    <div class="post-detail">
      <h3>${m.name} ${liveOn ? '<span style="margin-left:8px; color:#ff6b6b; font-weight:900;">● LIVE</span>' : ''}</h3>
      <div class="pd-meta">${m.rank} · ${m.tierLabel}</div>
      <div style="display:flex; gap:14px; align-items:center; flex-wrap:wrap;">
        <div style="width:110px; height:110px; border-radius:999px; overflow:hidden; border:3px solid rgba(216,177,78,0.55); box-shadow:0 18px 45px rgba(0,0,0,0.55);">
          <img src="${imgSrc}" alt="${m.name} 프로필" style="width:100%; height:100%; object-fit:cover;">
        </div>
        <div style="display:flex; gap:10px; flex-wrap:wrap;">
          <a class="action-btn action-primary" href="${playUrl(m.soopId)}" target="_blank" rel="noopener">LIVE 보기</a>
          <a class="action-btn" href="${stationUrl(m.soopId)}" target="_blank" rel="noopener">방송국</a>
        </div>
      </div>
      ${liveOn ? `<div class="pd-meta" style="margin-top:10px;">${viewersTxt}</div>` : ""}
    </div>
  `;
  openModal();
}

/** Hover preview */
function onHoverEnter(e, id){
  const st = statusById[id];
  if(!st) return;
  preview.classList.add("show");
  preview.setAttribute("aria-hidden", "false");
  const isLive = !!st.live;
  if(previewLive){
    previewLive.textContent = isLive ? "LIVE" : "OFF";
    previewLive.classList.toggle("off", !isLive);
  }
  previewImg.src = (isLive && st.thumb) ? st.thumb : OFFLINE_PREVIEW_SVG;
  previewTitle.textContent = isLive ? (st.title || "방송중") : "방송 준비중";
  previewViewers.textContent = isLive
    ? (st.viewers != null ? `${formatNumber(st.viewers)}명 시청` : "시청자 정보 없음")
    : "—";
  onHoverMove(e);
}
function onHoverMove(e){
  if(!preview.classList.contains("show")) return;
  const pad = 16;
  const x = Math.min(window.innerWidth - 340, e.clientX + pad);
  const y = Math.min(window.innerHeight - 260, e.clientY + pad);
  preview.style.transform = `translate(${x}px, ${y}px)`;
}
function onHoverLeave(){
  preview.classList.remove("show");
  preview.setAttribute("aria-hidden", "true");
}

async function hydrateVisible(){
  const visible = [...document.querySelectorAll(".card")].map(c => c.getAttribute("data-id"));
  if(!visible.length) return;
  try{
    const url = `/api/status?ids=${encodeURIComponent(visible.join(","))}`;
    const res = await fetch(url, { cache: "no-store" });
    if(!res.ok) return;
    const data = await res.json();

    (data.items || []).forEach(item => {
      statusById[item.id] = item;
      const liveEl = document.getElementById(`live_${item.id}`);
      const dotEl = document.getElementById(`dot_${item.id}`);
      if(liveEl) liveEl.classList.toggle("on", !!item.live);
      if(dotEl) dotEl.classList.toggle("on", !!item.live);
      const imgEl = document.getElementById(`img_${item.id}`);
      if(imgEl && item.profileImage) imgEl.src = item.profileImage;
    });
  }catch(_){}
}
setInterval(() => {
  if(document.getElementById("tab-members")?.classList.contains("tab-active")) hydrateVisible();
}, 60_000);

function formatNumber(n){
  try{ return Number(n).toLocaleString("ko-KR"); }catch{ return String(n); }
}

/** Modal helpers */
function openModal(){ modal.classList.add("show"); modal.setAttribute("aria-hidden", "false"); }
function closeModal(){ modal.classList.remove("show"); modal.setAttribute("aria-hidden", "true"); }
modal.addEventListener("click", (e) => { if(e.target?.dataset?.close === "1") closeModal(); });
document.addEventListener("keydown", (e) => { if(e.key === "Escape") closeModal(); });

/** ===== Supabase Community (Board V2) ===== */
const authState = document.getElementById("authState");
const btnLogin = document.getElementById("btnLogin");
const btnLogout = document.getElementById("btnLogout");
const btnNewPost = document.getElementById("btnNewPost");
const boardTabsEl = document.getElementById("boardTabs");
const heroTitleEl = document.getElementById("heroTitle");
const heroSubEl = document.getElementById("heroSub");
const heroBgEl = document.getElementById("heroBg");
const btnHeroEdit = document.getElementById("btnHeroEdit");
const boardTitleEl = document.getElementById("boardTitle");
const postTableBody = document.getElementById("postTableBody");
const boardSearch = document.getElementById("boardSearch");
const btnSearch = document.getElementById("btnSearch");

const BOARDS = [
  { key: "all", label: "전체" },
  { key: "notice", label: "공지" },
  { key: "자유", label: "자유" },
  { key: "학사", label: "학사" },
  { key: "연구", label: "연구" },
  { key: "밈", label: "밈" },
  { key: "소식", label: "소식" },
  { key: "popular72h", label: "인기글(72h)" }
];

const supaUrl = window.SUPABASE_URL;
const supaKey = window.SUPABASE_ANON_KEY;
let supabase = null;
let sessionUser = null;
let isAdmin = false;

let activeBoard = "all";
let activeQuery = "";

function hasConfig(){
  return supaUrl && supaKey && !supaUrl.includes("YOUR_PROJECT") && !supaKey.includes("YOUR_SUPABASE");
}

async function loadHeroSettings(){
  if(!supabase){
    // fallback
    if(heroBgEl) heroBgEl.style.backgroundImage = `url(assets/logo.jpg)`;
    return;
  }
  try{
    const { data } = await supabase.from("site_settings").select("key,value").in("key", ["hero_title","hero_sub","hero_image"]);
    const map = {};
    (data||[]).forEach(r => map[r.key] = r.value);

    if(heroTitleEl && map.hero_title) heroTitleEl.textContent = map.hero_title;
    if(heroSubEl && map.hero_sub) heroSubEl.textContent = map.hero_sub;

    const img = map.hero_image || "assets/logo.jpg";
    if(heroBgEl){
      const isAsset = img.startsWith("assets/");
      heroBgEl.style.backgroundImage = `url(${isAsset ? img : img})`;
    }
  }catch(_){
    if(heroBgEl) heroBgEl.style.backgroundImage = `url(assets/logo.jpg)`;
  }
}

async function checkAdmin(){
  isAdmin = false;
  if(!supabase || !sessionUser) return false;
  try{
    const { data, error } = await supabase.from("admins").select("user_id").eq("user_id", sessionUser.id).maybeSingle();
    if(!error && data?.user_id) isAdmin = true;
  }catch(_){}
  return isAdmin;
}

async function initSupabase(){
  if(!hasConfig()){
    if(authState) authState.textContent = "Supabase 설정 필요 (config.js)";
    if(btnLogin) btnLogin.disabled = true;
    if(btnNewPost) btnNewPost.disabled = true;
    return;
  }
  supabase = createClient(supaUrl, supaKey);
  const { data: { session } } = await supabase.auth.getSession();
  sessionUser = session?.user || null;
  await checkAdmin();
  syncAuthUI();
  await loadHeroSettings();
  supabase.auth.onAuthStateChange(async (_event, newSession) => {
    sessionUser = newSession?.user || null;
    await checkAdmin();
    syncAuthUI();
    await loadHeroSettings();
    loadBoardPosts();
  });
}

function syncAuthUI(){
  if(!authState) return;

  if(sessionUser){
    authState.textContent = `로그인됨: ${sessionUser.email}`;
    btnLogin.style.display = "none";
    btnLogout.style.display = "inline-flex";
    btnNewPost.disabled = false;
  }else{
    authState.textContent = "로그인 필요 (글쓰기/댓글/추천)";
    btnLogin.style.display = "inline-flex";
    btnLogout.style.display = "none";
    btnNewPost.disabled = true;
  }

  // Hero edit is admin-only
  if(btnHeroEdit){
    btnHeroEdit.style.display = (sessionUser && isAdmin) ? "inline-flex" : "none";
  }
}

btnLogin?.addEventListener("click", () => openAuthModal());
btnLogout?.addEventListener("click", async () => { if(supabase) await supabase.auth.signOut(); });
btnNewPost?.addEventListener("click", () => openComposeModal());
btnHeroEdit?.addEventListener("click", () => openHeroEditModal());

btnSearch?.addEventListener("click", () => {
  activeQuery = boardSearch.value.trim();
  loadBoardPosts();
});
boardSearch?.addEventListener("keydown", (e) => {
  if(e.key === "Enter"){
    activeQuery = boardSearch.value.trim();
    loadBoardPosts();
  }
});

function renderBoardTabs(){
  if(!boardTabsEl) return;
  boardTabsEl.innerHTML = BOARDS.map(b => `
    <button class="board-tab ${b.key === activeBoard ? "active":""}" data-board="${b.key}">${b.label}</button>
  `).join("");
  boardTabsEl.querySelectorAll(".board-tab").forEach(btn => {
    btn.addEventListener("click", () => {
      activeBoard = btn.getAttribute("data-board");
      boardTabsEl.querySelectorAll(".board-tab").forEach(x => x.classList.remove("active"));
      btn.classList.add("active");
      const label = BOARDS.find(x => x.key === activeBoard)?.label || "전체";
      if(boardTitleEl) boardTitleEl.textContent = label;
      loadBoardPosts();
    });
  });
}

function writerLabel(authorId){
  if(!authorId) return "익명";
  return `회원#${String(authorId).slice(0,6)}`;
}

function titleCell(p){
  const cc = p.comment_count || 0;
  const ccBadge = cc ? `<span class="cmt">(${cc})</span>` : "";
  const noticeBadge = p.is_notice ? `<span class="nt">공지</span>` : "";
  return `${noticeBadge}<span class="t">${escapeHtml(p.title)}</span>${ccBadge}`;
}

function score(p){
  return (Number(p.upvotes||0) * 5) + Number(p.views||0);
}

async function loadBoardPosts(){
  if(!postTableBody) return;
  if(!supabase){
    postTableBody.innerHTML = `<tr><td colspan="6" class="empty">Supabase 설정 후 게시글이 표시됩니다.</td></tr>`;
    return;
  }

  let q = supabase
    .from("posts")
    .select("id,title,created_at,author_id,board,views,upvotes,comment_count,is_notice")
    .order("is_notice", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(80);

  if(activeBoard === "notice"){
    q = q.eq("is_notice", true);
  }else if(activeBoard === "popular72h"){
    const since = new Date(Date.now() - 72*60*60*1000).toISOString();
    q = supabase
      .from("posts")
      .select("id,title,created_at,author_id,board,views,upvotes,comment_count,is_notice")
      .gte("created_at", since)
      .limit(120); // client sort
  }else if(activeBoard !== "all"){
    q = q.eq("board", activeBoard).eq("is_notice", false);
  }

  if(activeQuery){
    q = q.or(`title.ilike.%${activeQuery}%,content.ilike.%${activeQuery}%`);
  }

  const { data, error } = await q;

  if(error){
    postTableBody.innerHTML = `<tr><td colspan="6" class="empty err">불러오기 실패: ${escapeHtml(error.message)}</td></tr>`;
    return;
  }

  let rows = data || [];
  if(activeBoard === "popular72h"){
    rows = rows.sort((a,b) => (score(b) - score(a)) || (new Date(b.created_at) - new Date(a.created_at)));
  }

  if(!rows.length){
    postTableBody.innerHTML = `<tr><td colspan="6" class="empty">게시글이 없습니다.</td></tr>`;
    return;
  }

  postTableBody.innerHTML = rows.map((p) => `
    <tr class="post-row" data-post="${p.id}">
      <td class="col-tag"><span class="tagpill ${p.is_notice ? "notice":""}">${escapeHtml(p.is_notice ? "공지" : (p.board || "자유"))}</span></td>
      <td class="col-title">${titleCell(p)}</td>
      <td class="col-writer">${writerLabel(p.author_id)}</td>
      <td class="col-date">${formatShort(p.created_at)}</td>
      <td class="col-views">${formatNumber(p.views || 0)}</td>
      <td class="col-up">${formatNumber(p.upvotes || 0)}</td>
    </tr>
  `).join("");

  postTableBody.querySelectorAll(".post-row").forEach(tr => {
    tr.addEventListener("click", () => openPostDetail(tr.getAttribute("data-post")));
  });
}

function openAuthModal(){
  modalBody.innerHTML = `
    <div class="post-detail">
      <h3>로그인</h3>
      <div class="pd-meta">이메일로 로그인 링크(매직링크)를 보내드립니다.</div>
      <div class="field">
        <div class="label">이메일</div>
        <input class="input" id="authEmail" placeholder="example@email.com" />
      </div>
      <div class="row">
        <button class="btn btn-primary" id="authSend">로그인 링크 보내기</button>
        <button class="btn btn-ghost" data-close="1">닫기</button>
      </div>
      <div class="pd-meta" id="authMsg" style="margin-top:10px;"></div>
    </div>
  `;
  openModal();

  document.getElementById("authSend").addEventListener("click", async () => {
    const email = document.getElementById("authEmail").value.trim();
    const msg = document.getElementById("authMsg");
    if(!email){ msg.textContent = "이메일을 입력해주세요."; return; }
    msg.textContent = "링크 전송 중...";
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: "https://ino-eight.vercel.app" }
    });
    msg.textContent = error ? `실패: ${escapeHtml(error.message)}` : "전송 완료! 이메일에서 링크를 클릭하면 로그인됩니다.";
  });
}

async function openPostDetail(postId){
  try{ await supabase.rpc("increment_post_views", { p_post_id: postId }); }catch(_){}

  const { data: post, error } = await supabase
    .from("posts")
    .select("id,title,content,created_at,author_id,board,views,upvotes,comment_count,is_notice")
    .eq("id", postId)
    .single();

  if(error){
    modalBody.innerHTML = `<div class="post-detail"><h3>오류</h3><div class="pd-meta">${escapeHtml(error.message)}</div></div>`;
    openModal();
    return;
  }

  const { data: imgs } = await supabase
    .from("post_images")
    .select("id,url,created_at")
    .eq("post_id", postId)
    .order("created_at", { ascending: true });

  const { data: comments } = await supabase
    .from("comments")
    .select("id,content,created_at,author_id")
    .eq("post_id", postId)
    .order("created_at", { ascending: true });

  modalBody.innerHTML = `
    <div class="post-detail">
      <div class="post-topline">
        <div class="post-badges">
          ${post.is_notice ? `<span class="nt">공지</span>` : ""}
          <span class="bd">${escapeHtml(post.board || "자유")}</span>
        </div>
        <div class="post-actions">
          <button class="btn btn-ghost" id="btnUpvote">추천</button>
        </div>
      </div>

      <h3>${escapeHtml(post.title)}</h3>
      <div class="pd-meta">
        ${writerLabel(post.author_id)} · ${formatDate(post.created_at)} · 조회 ${formatNumber(post.views||0)} · 추천 <span id="upvoteCount">${formatNumber(post.upvotes||0)}</span>
      </div>

      <div class="pd-content">${escapeHtml(post.content || "")}</div>

      ${imgs?.length ? `
        <div class="pd-images">
          ${imgs.map(i => `<img src="${i.url}" alt="이미지" loading="lazy">`).join("")}
        </div>
      ` : ""}

      <div class="comments">
        <div class="pd-meta" style="margin:0 0 8px;">댓글</div>
        <div id="commentList">
          ${(comments || []).map(c => `
            <div class="comment">
              <div class="comment-meta">${writerLabel(c.author_id)} · ${formatDate(c.created_at)}</div>
              <div class="comment-body">${escapeHtml(c.content)}</div>
            </div>
          `).join("") || `<div style="color:rgba(255,255,255,0.6); font-weight:800;">댓글이 없습니다.</div>`}
        </div>

        <div style="margin-top:12px;">
          <div class="field">
            <div class="label">댓글 작성</div>
            <textarea class="textarea" id="newComment" placeholder="댓글을 입력하세요" style="min-height:90px;"></textarea>
          </div>
          <div class="row">
            <button class="btn btn-primary" id="btnAddComment">댓글 등록</button>
            <button class="btn btn-ghost" data-close="1">닫기</button>
          </div>
          <div class="pd-meta" id="commentMsg" style="margin-top:10px;"></div>
        </div>
      </div>
    </div>
  `;
  openModal();

  document.getElementById("btnUpvote").addEventListener("click", async () => {
    if(!sessionUser){
      alert("로그인이 필요합니다.");
      return;
    }
    try{
      const { data, error: e2 } = await supabase.rpc("toggle_post_upvote", { p_post_id: postId });
      if(e2) throw e2;
      document.getElementById("upvoteCount").textContent = formatNumber(data);
      loadBoardPosts();
    }catch(err){
      alert(err?.message || "추천 처리 실패");
    }
  });

  document.getElementById("btnAddComment").addEventListener("click", async () => {
    const msg = document.getElementById("commentMsg");
    if(!sessionUser){ msg.textContent = "로그인이 필요합니다."; return; }
    const content = document.getElementById("newComment").value.trim();
    if(!content){ msg.textContent = "댓글을 입력해주세요."; return; }
    msg.textContent = "등록 중...";
    const { error: e2 } = await supabase.from("comments").insert({
      post_id: postId, content, author_id: sessionUser.id
    });
    if(e2){ msg.textContent = `실패: ${escapeHtml(e2.message)}`; return; }
    msg.textContent = "등록 완료!";
    await openPostDetail(postId);
    loadBoardPosts();
  });
}

function openComposeModal(){
  if(!supabase || !hasConfig()){
    modalBody.innerHTML = `<div class="post-detail"><h3>설정 필요</h3><div class="pd-meta">config.js에 Supabase URL/KEY를 먼저 입력해주세요.</div></div>`;
    openModal();
    return;
  }
  if(!sessionUser){
    modalBody.innerHTML = `<div class="post-detail"><h3>로그인 필요</h3><div class="pd-meta">글쓰기는 로그인 후 가능합니다.</div></div>`;
    openModal();
    return;
  }

  const boardOptions = BOARDS
    .filter(b => !["all","notice","popular72h"].includes(b.key))
    .map(b => `<option value="${b.key}">${b.label}</option>`).join("");

  modalBody.innerHTML = `
    <div class="post-detail">
      <h3>글쓰기</h3>
      <div class="pd-meta">이노대 전용 게시판</div>

      <div class="field">
        <div class="label">게시판</div>
        <select class="input" id="postBoard">${boardOptions}</select>
      </div>

      <div class="field">
        <div class="label">제목</div>
        <input class="input" id="postTitle" placeholder="제목" maxlength="80" />
      </div>

      <div class="field">
        <div class="label">내용</div>
        <textarea class="textarea" id="postContent" placeholder="내용"></textarea>
      </div>

      <div class="field">
        <div class="label">이미지 첨부</div>
        <input class="input" id="postImages" type="file" accept="image/*" multiple />
        <div class="pd-meta" style="margin-top:6px;">이미지는 최대 8장까지</div>
      </div>

      <div class="row">
        <button class="btn btn-primary" id="btnSubmitPost">등록</button>
        <button class="btn btn-ghost" data-close="1">취소</button>
      </div>

      <div class="pd-meta" id="postMsg" style="margin-top:10px;"></div>
    </div>
  `;
  openModal();

  document.getElementById("btnSubmitPost").addEventListener("click", async () => {
    const msg = document.getElementById("postMsg");
    const title = document.getElementById("postTitle").value.trim();
    const content = document.getElementById("postContent").value.trim();
    const board = document.getElementById("postBoard").value;
    const files = document.getElementById("postImages").files;

    if(!title){ msg.textContent = "제목을 입력해주세요."; return; }
    msg.textContent = "등록 중...";

    const { data: inserted, error } = await supabase
      .from("posts")
      .insert({ title, content, board, author_id: sessionUser.id })
      .select("id")
      .single();

    if(error){ msg.textContent = `실패: ${escapeHtml(error.message)}`; return; }
    const postId = inserted.id;

    const uploadedUrls = [];
    const max = Math.min(files?.length || 0, 8);
    for(let i=0;i<max;i++){
      const f = files[i];
      const ext = (f.name.split(".").pop() || "jpg").toLowerCase();
      const path = `${sessionUser.id}/${postId}/${Date.now()}_${i}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from("community-images")
        .upload(path, f, { upsert: false });

      if(upErr){ msg.textContent = `이미지 업로드 일부 실패: ${escapeHtml(upErr.message)}`; continue; }

      const { data: pub } = supabase.storage.from("community-images").getPublicUrl(path);
      if(pub?.publicUrl) uploadedUrls.push(pub.publicUrl);
    }

    if(uploadedUrls.length){
      const rows = uploadedUrls.map(url => ({ post_id: postId, url }));
      const { error: imgErr } = await supabase.from("post_images").insert(rows);
      if(imgErr){ msg.textContent = `이미지 등록 실패: ${escapeHtml(imgErr.message)}`; return; }
    }

    closeModal();
    await loadBoardPosts();
  });
}

function formatDate(iso){
  try{ return new Date(iso).toLocaleString("ko-KR"); }catch{ return iso; }
}
function formatShort(iso){
  try{
    const d = new Date(iso);
    const now = Date.now();
    const diff = now - d.getTime();
    const h = Math.floor(diff/3600000);
    if(h < 24) return `${h <= 0 ? 1 : h}시간 전`;
    const dd = Math.floor(diff/86400000);
    if(dd < 7) return `${dd}일 전`;
    return d.toLocaleDateString("ko-KR");
  }catch{ return ""; }
}
function escapeHtml(s){
  return String(s ?? "").replace(/[&<>"']/g, (m) => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[m]));
}

/** Boot */
renderMembers();
renderBoardTabs();
initSupabase();
loadBoardPosts();


function openHeroEditModal(){
  if(!supabase || !sessionUser || !isAdmin){
    alert("관리자만 수정할 수 있습니다.");
    return;
  }
  modalBody.innerHTML = `
    <div class="post-detail">
      <h3>대문 수정</h3>
      <div class="pd-meta">대문 이미지/문구를 바꾸면 전체 유저에게 즉시 반영됩니다.</div>

      <div class="field">
        <div class="label">대문 제목</div>
        <input class="input" id="heroEditTitle" placeholder="대문 제목" />
      </div>

      <div class="field">
        <div class="label">대문 설명</div>
        <input class="input" id="heroEditSub" placeholder="대문 설명" />
      </div>

      <div class="field">
        <div class="label">대문 이미지 URL</div>
        <input class="input" id="heroEditImg" placeholder="https://... 또는 assets/logo.jpg" />
        <div class="pd-meta" style="margin-top:6px;">권장: 이미지 주소(URL). assets/ 경로도 가능</div>
      </div>

      <div class="row">
        <button class="btn btn-primary" id="btnHeroSave">저장</button>
        <button class="btn btn-ghost" data-close="1">취소</button>
      </div>

      <div class="pd-meta" id="heroEditMsg" style="margin-top:10px;"></div>
    </div>
  `;
  openModal();

  // Prefill from current
  document.getElementById("heroEditTitle").value = heroTitleEl?.textContent || "";
  document.getElementById("heroEditSub").value = heroSubEl?.textContent || "";

  document.getElementById("btnHeroSave").addEventListener("click", async () => {
    const msg = document.getElementById("heroEditMsg");
    const title = document.getElementById("heroEditTitle").value.trim();
    const sub = document.getElementById("heroEditSub").value.trim();
    const img = document.getElementById("heroEditImg").value.trim();

    msg.textContent = "저장 중...";

    try{
      const rows = [
        { key: "hero_title", value: title || "이노레이블 스타부 - 이노대", updated_by: sessionUser.id },
        { key: "hero_sub", value: sub || "팬 커뮤니티 · 공지 · 소식 · 밈", updated_by: sessionUser.id },
      ];
      if(img) rows.push({ key: "hero_image", value: img, updated_by: sessionUser.id });

      // Upsert one by one to keep compatibility
      for(const r of rows){
        const { error } = await supabase.from("site_settings").upsert(r, { onConflict: "key" });
        if(error) throw error;
      }

      msg.textContent = "저장 완료!";
      await loadHeroSettings();
      setTimeout(() => closeModal(), 400);
    }catch(err){
      msg.textContent = `실패: ${escapeHtml(err?.message || "unknown")}`;
    }
  });
}
