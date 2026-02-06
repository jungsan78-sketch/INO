/**
 * NOTE
 * - 정적 파일만 열면 (file://) CORS 때문에 LIVE/프로필 자동연동이 제한될 수 있어요.
 * - 자동 LIVE 뱃지 + 프로필 이미지를 쓰려면 zip 안의 /server 를 실행해서 http://localhost:3000 에서 열어주세요.
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

const API_BASE = ""; // same-origin. when using server, open http://localhost:3000

const grid = document.getElementById("memberGrid");
const modal = document.getElementById("modal");
const modalBody = document.getElementById("modalBody");

let activeFilter = "all";

function stationUrl(id){ return `https://www.sooplive.co.kr/station/${id}`; }
function playUrl(id){ return `https://play.sooplive.co.kr/${id}`; }

function sortKey(m){
  // 운영진 먼저 -> 교수 -> 학생, 티어는 갓/킹/잭/숫자/유스 순
  const roleOrder = m.role === "운영진" ? 0 : (m.role === "교수" ? 1 : 2);
  return `${roleOrder}-${String(m.tierSort).padStart(2,"0")}-${m.name}`;
}

function initials(name){
  return name?.slice(0,2) || "?";
}

function cardTemplate(m){
  return `
    <div class="card" data-id="${m.soopId}" tabindex="0" role="button" aria-label="${m.name} 상세 보기">
      <span class="badge-live" id="live_${m.soopId}">LIVE</span>
      <div class="avatar" aria-hidden="true">
        <img id="img_${m.soopId}" alt="${m.name} 프로필" src="assets/logo.jpg" />
      </div>
      <div class="name">${m.name}</div>
      <div class="meta">${m.rank} · ${m.role}</div>
      <div class="pills">
        <span class="pill2 pill-tier">${m.tierLabel}</span>
        <span class="pill2">@${m.soopId}</span>
      </div>
      <div class="actions" onclick="event.stopPropagation()">
        <a class="action-btn action-primary" href="${playUrl(m.soopId)}" target="_blank" rel="noopener">LIVE 보기</a>
        <a class="action-btn" href="${stationUrl(m.soopId)}" target="_blank" rel="noopener">방송국</a>
      </div>
    </div>
  `;
}

function render(){
  grid.innerHTML = "";
  const list = MEMBERS
    .filter(m => activeFilter === "all" ? true : m.role === activeFilter)
    .sort((a,b) => sortKey(a).localeCompare(sortKey(b), "ko"));

  grid.insertAdjacentHTML("beforeend", list.map(cardTemplate).join(""));
  attachCardEvents();
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
  });
}

function openModal(soopId){
  const m = MEMBERS.find(x => x.soopId === soopId);
  if(!m) return;

  const imgSrc = document.getElementById(`img_${soopId}`)?.getAttribute("src") || "assets/logo.jpg";
  const liveOn = document.getElementById(`live_${soopId}`)?.classList.contains("on");

  modalBody.innerHTML = `
    <div class="modal-hero">
      <div class="modal-avatar"><img src="${imgSrc}" alt="${m.name} 프로필"></div>
      <div>
        <h3 class="modal-title">${m.name} ${liveOn ? '<span style="margin-left:8px; color:#ff6b6b; font-weight:900;">● LIVE</span>' : ''}</h3>
        <p class="modal-sub">${m.rank} · ${m.role} · ${m.tierLabel} · @${m.soopId}</p>
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

/** Filter chips */
document.querySelectorAll(".chip").forEach(chip => {
  chip.addEventListener("click", () => {
    document.querySelectorAll(".chip").forEach(c => c.classList.remove("chip-active"));
    chip.classList.add("chip-active");
    activeFilter = chip.getAttribute("data-filter");
    render();
    hydrateFromServer(); // refresh live status for visible
  });
});

/** Tier blocks */
function renderTiers(){
  const tiers = [
    { label: "갓티어", key: "갓티어" },
    { label: "킹티어", key: "킹티어" },
    { label: "잭티어", key: "잭티어" },
    { label: "2티어", key: "2티어" },
    { label: "3티어", key: "3티어" },
    { label: "5티어", key: "5티어" },
    { label: "6티어", key: "6티어" },
    { label: "7티어", key: "7티어" },
    { label: "8티어", key: "8티어" },
    { label: "유스", key: "유스" },
  ];

  const byTier = {};
  MEMBERS.forEach(m => {
    byTier[m.tierLabel] = byTier[m.tierLabel] || [];
    byTier[m.tierLabel].push(m);
  });

  const blocks = tiers.map(t => {
    const list = (byTier[t.key] || []).map(m => `<span class="tier-chip">${m.name}</span>`).join("");
    return `
      <div class="tier-block">
        <h3>${t.label}</h3>
        <div class="tier-list">${list || '<span class="tier-chip" style="opacity:.6">-</span>'}</div>
      </div>
    `;
  }).join("");

  document.getElementById("tierBlocks").innerHTML = blocks;
}

/** Server hydration (live badge + profile image) */
async function hydrateFromServer(){
  // If server is not running, this will fail silently.
  const visible = [...document.querySelectorAll(".card")].map(c => c.getAttribute("data-id"));
  if(!visible.length) return;

  try{
    const url = `${API_BASE}/api/status?ids=${encodeURIComponent(visible.join(","))}`;
    const res = await fetch(url, { cache: "no-store" });
    if(!res.ok) return;
    const data = await res.json();

    (data.items || []).forEach(item => {
      const liveEl = document.getElementById(`live_${item.id}`);
      if(liveEl){
        liveEl.classList.toggle("on", !!item.live);
      }
      const imgEl = document.getElementById(`img_${item.id}`);
      if(imgEl && item.profileImage){
        imgEl.src = item.profileImage;
      }
    });
  }catch(_){}
}

/** Boot */
render();
renderTiers();
hydrateFromServer();
setInterval(hydrateFromServer, 60_000);