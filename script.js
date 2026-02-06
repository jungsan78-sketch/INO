/**
 * Vercel 배포용:
 * - /api/status 서버리스 함수가 LIVE/프로필/썸네일/시청자수(가능하면)를 반환합니다.
 * - SOOP 페이지 구조가 바뀌면, api/status.js의 파싱 로직만 조정하면 됩니다.
 */

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

const memberGrid = document.getElementById("memberGrid");
const modal = document.getElementById("modal");
const modalBody = document.getElementById("modalBody");

const preview = document.getElementById("preview");
const previewImg = document.getElementById("previewImg");
const previewTitle = document.getElementById("previewTitle");
const previewViewers = document.getElementById("previewViewers");

let activeFilter = "all";
let statusById = {}; // {id: {live, profileImage, thumb, viewers, title}}

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

function render(){
  memberGrid.innerHTML = "";
  const list = MEMBERS
    .filter(m => activeFilter === "all" ? true : m.role === activeFilter)
    .sort((a,b) => sortKey(a).localeCompare(sortKey(b), "ko"));
  memberGrid.insertAdjacentHTML("beforeend", list.map(cardTemplate).join(""));
  attachCardEvents();
  hydrateVisible();
}

function attachCardEvents(){
  [...document.querySelectorAll(".card")].forEach(card => {
    const id = card.getAttribute("data-id");

    card.addEventListener("click", () => openModal(id));
    card.addEventListener("keydown", (e) => {
      if(e.key === "Enter" || e.key === " "){
        e.preventDefault();
        openModal(id);
      }
    });

    // Hover preview only when LIVE
    card.addEventListener("mousemove", (e) => onHoverMove(e, id));
    card.addEventListener("mouseenter", (e) => onHoverEnter(e, id));
    card.addEventListener("mouseleave", onHoverLeave);
  });
}

function openModal(soopId){
  const m = MEMBERS.find(x => x.soopId === soopId);
  if(!m) return;

  const st = statusById[soopId] || {};
  const imgSrc = st.profileImage || document.getElementById(`img_${soopId}`)?.getAttribute("src") || "assets/logo.jpg";
  const liveOn = !!st.live;
  const viewersTxt = st.viewers != null ? `${formatNumber(st.viewers)}명 시청` : "시청자 정보 없음";

  modalBody.innerHTML = `
    <div class="modal-hero">
      <div class="modal-avatar"><img src="${imgSrc}" alt="${m.name} 프로필"></div>
      <div>
        <h3 class="modal-title">${m.name} ${liveOn ? '<span style="margin-left:8px; color:#ff6b6b; font-weight:900;">● LIVE</span>' : ''}</h3>
        <p class="modal-sub">${m.rank} · ${m.tierLabel}</p>
        ${liveOn ? `<p class="modal-sub" style="margin-top:6px;">${viewersTxt}</p>` : ""}
        <div class="modal-actions">
          <a class="action-btn action-primary" href="${playUrl(m.soopId)}" target="_blank" rel="noopener">LIVE 보기</a>
          <a class="action-btn" href="${stationUrl(m.soopId)}" target="_blank" rel="noopener">방송국 바로가기</a>
        </div>
      </div>
    </div>
  `;

  modal.classList.add("show");
  modal.setAttribute("aria-hidden", "false");
}

function closeModal(){
  modal.classList.remove("show");
  modal.setAttribute("aria-hidden", "true");
}

modal.addEventListener("click", (e) => {
  if(e.target?.dataset?.close === "1") closeModal();
});
document.addEventListener("keydown", (e) => {
  if(e.key === "Escape") closeModal();
});
document.querySelectorAll("[data-close='1']").forEach(el => el.addEventListener("click", closeModal));

/** Tabs */
document.querySelectorAll(".nav-link").forEach(btn => {
  btn.addEventListener("click", () => {
    const tab = btn.getAttribute("data-tab");
    document.querySelectorAll(".nav-link").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    document.querySelectorAll(".tab").forEach(s => s.classList.remove("tab-active"));
    document.getElementById(`tab-${tab}`).classList.add("tab-active");
    if(tab === "members") {
      hydrateVisible();
    }
  });
});
document.querySelectorAll("[data-tab='home']").forEach(el => {
  el.addEventListener("click", (e) => {
    e.preventDefault();
    document.querySelector('.nav-link[data-tab="home"]').click();
  });
});

/** Filter chips */
document.querySelectorAll(".chip").forEach(chip => {
  chip.addEventListener("click", () => {
    document.querySelectorAll(".chip").forEach(c => c.classList.remove("chip-active"));
    chip.classList.add("chip-active");
    activeFilter = chip.getAttribute("data-filter");
    render();
  });
});

/** Hover Preview */
function onHoverEnter(e, id){
  const st = statusById[id];
  if(!st || !st.live || !st.thumb) return;
  preview.classList.add("show");
  preview.setAttribute("aria-hidden", "false");
  previewImg.src = st.thumb;
  previewTitle.textContent = st.title || "방송중";
  previewViewers.textContent = st.viewers != null ? `${formatNumber(st.viewers)}명 시청` : "시청자 정보 없음";
  onHoverMove(e, id);
}

function onHoverMove(e, id){
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

/** Hydration */
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
      if(imgEl && item.profileImage){
        imgEl.src = item.profileImage;
      }
    });
  }catch(_){}
}

// refresh every 60s when on members tab
setInterval(() => {
  const membersTabActive = document.getElementById("tab-members").classList.contains("tab-active");
  if(membersTabActive) hydrateVisible();
}, 60_000);

function formatNumber(n){
  try{
    return Number(n).toLocaleString("ko-KR");
  }catch(_){
    return String(n);
  }
}

/** Boot */
render();