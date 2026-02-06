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

/** ===== UI refs ===== */
const memberGrid = document.getElementById("memberGrid");
const modal = document.getElementById("modal");
const modalBody = document.getElementById("modalBody");

const preview = document.getElementById("preview");
const previewImg = document.getElementById("previewImg");
const previewTitle = document.getElementById("previewTitle");
const previewViewers = document.getElementById("previewViewers");

let activeFilter = "all";
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
    if(tab === "community") loadPosts();
  });
});
document.querySelectorAll("[data-tab='home']").forEach(el => {
  el.addEventListener("click", (e) => {
    e.preventDefault();
    document.querySelector('.nav-link[data-tab="home"]').click();
  });
});

/** ===== Filters ===== */
document.querySelectorAll(".chip").forEach(chip => {
  chip.addEventListener("click", () => {
    document.querySelectorAll(".chip").forEach(c => c.classList.remove("chip-active"));
    chip.classList.add("chip-active");
    activeFilter = chip.getAttribute("data-filter");
    renderMembers();
  });
});

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
  memberGrid.innerHTML = "";
  const list = MEMBERS
    .filter(m => activeFilter === "all" ? true : m.role === activeFilter)
    .sort((a,b) => sortKey(a).localeCompare(sortKey(b), "ko"));
  memberGrid.insertAdjacentHTML("beforeend", list.map(cardTemplate).join(""));
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
  if(!st || !st.live || !st.thumb) return;
  preview.classList.add("show");
  preview.setAttribute("aria-hidden", "false");
  previewImg.src = st.thumb;
  previewTitle.textContent = st.title || "방송중";
  previewViewers.textContent = st.viewers != null ? `${formatNumber(st.viewers)}명 시청` : "시청자 정보 없음";
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
  if(document.getElementById("tab-members").classList.contains("tab-active")) hydrateVisible();
}, 60_000);

function formatNumber(n){
  try{ return Number(n).toLocaleString("ko-KR"); }catch{ return String(n); }
}

/** Modal helpers */
function openModal(){ modal.classList.add("show"); modal.setAttribute("aria-hidden", "false"); }
function closeModal(){ modal.classList.remove("show"); modal.setAttribute("aria-hidden", "true"); }
modal.addEventListener("click", (e) => { if(e.target?.dataset?.close === "1") closeModal(); });
document.addEventListener("keydown", (e) => { if(e.key === "Escape") closeModal(); });

/** ===== Supabase Community ===== */
const postList = document.getElementById("postList");
const authState = document.getElementById("authState");
const btnLogin = document.getElementById("btnLogin");
const btnLogout = document.getElementById("btnLogout");
const btnNewPost = document.getElementById("btnNewPost");

const supaUrl = window.SUPABASE_URL;
const supaKey = window.SUPABASE_ANON_KEY;
let supabase = null;
let sessionUser = null;

function hasConfig(){
  return supaUrl && supaKey && !supaUrl.includes("YOUR_PROJECT") && !supaKey.includes("YOUR_SUPABASE");
}

async function initSupabase(){
  if(!hasConfig()){
    authState.textContent = "Supabase 설정 필요 (config.js)";
    btnLogin.disabled = true;
    btnNewPost.disabled = true;
    return;
  }
  supabase = createClient(supaUrl, supaKey);
  const { data: { session } } = await supabase.auth.getSession();
  sessionUser = session?.user || null;
  syncAuthUI();
  supabase.auth.onAuthStateChange((_event, newSession) => {
    sessionUser = newSession?.user || null;
    syncAuthUI();
    loadPosts();
  });
}

function syncAuthUI(){
  if(sessionUser){
    authState.textContent = `로그인됨: ${sessionUser.email}`;
    btnLogin.style.display = "none";
    btnLogout.style.display = "inline-flex";
  }else{
    authState.textContent = "로그인 필요 (글쓰기/댓글)";
    btnLogin.style.display = "inline-flex";
    btnLogout.style.display = "none";
  }
}

btnLogin?.addEventListener("click", () => openAuthModal());
btnLogout?.addEventListener("click", async () => { if(supabase) await supabase.auth.signOut(); });
btnNewPost?.addEventListener("click", () => openComposeModal());

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
      options: { emailRedirectTo: window.location.origin }
    });
    msg.textContent = error ? `실패: ${escapeHtml(error.message)}` : "전송 완료! 이메일에서 링크를 클릭하면 로그인됩니다.";
  });
}

async function loadPosts(){
  if(!supabase){
    postList.innerHTML = `<div style="color:rgba(255,255,255,0.6); font-weight:800;">Supabase 설정 후 글 목록이 표시됩니다.</div>`;
    return;
  }
  const { data, error } = await supabase
    .from("posts")
    .select("id,title,created_at,author_id")
    .order("created_at", { ascending: false })
    .limit(50);

  if(error){
    postList.innerHTML = `<div style="color:rgba(255,90,90,0.9); font-weight:900;">불러오기 실패: ${escapeHtml(error.message)}</div>`;
    return;
  }
  if(!data?.length){
    postList.innerHTML = `<div style="color:rgba(255,255,255,0.6); font-weight:800;">아직 글이 없습니다.</div>`;
    return;
  }
  postList.innerHTML = data.map(p => `
    <div class="post-item" data-post="${p.id}">
      <div class="post-title">${escapeHtml(p.title)}</div>
      <div class="post-meta">
        <span>${formatDate(p.created_at)}</span>
      </div>
    </div>
  `).join("");

  document.querySelectorAll(".post-item").forEach(el => {
    el.addEventListener("click", () => openPostDetail(el.getAttribute("data-post")));
  });
}

async function openPostDetail(postId){
  const { data: post, error } = await supabase
    .from("posts")
    .select("id,title,content,created_at,author_id")
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
      <h3>${escapeHtml(post.title)}</h3>
      <div class="pd-meta">${formatDate(post.created_at)}</div>
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
              <div class="comment-meta">${formatDate(c.created_at)}</div>
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
  });
}

function openComposeModal(){
  if(!supabase || !hasConfig()){
    modalBody.innerHTML = `<div class="post-detail"><h3>설정 필요</h3><div class="pd-meta">config.js에 Supabase URL/KEY를 먼저 입력해주세요.</div></div>`;
    openModal();
    return;
  }
  modalBody.innerHTML = `
    <div class="post-detail">
      <h3>글쓰기</h3>
      <div class="pd-meta">이미지는 최대 8장까지</div>

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
    if(!sessionUser){ msg.textContent = "로그인이 필요합니다."; return; }
    const title = document.getElementById("postTitle").value.trim();
    const content = document.getElementById("postContent").value.trim();
    const files = document.getElementById("postImages").files;

    if(!title){ msg.textContent = "제목을 입력해주세요."; return; }
    msg.textContent = "등록 중...";

    const { data: inserted, error } = await supabase
      .from("posts")
      .insert({ title, content, author_id: sessionUser.id })
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
    await loadPosts();
  });
}

function formatDate(iso){
  try{ return new Date(iso).toLocaleString("ko-KR"); }catch{ return iso; }
}
function escapeHtml(s){
  return String(s ?? "").replace(/[&<>"']/g, (m) => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[m]));
}

/** Boot */
renderMembers();
initSupabase();
loadPosts();
