
const members = [
  { name: "김인호", tier: "3티어", id: "pookygamja" },
  { name: "김성대", tier: "갓티어", id: "tjdeosks" },
  { name: "임진묵", tier: "잭티어", id: "organ333" },
  { name: "변현제", tier: "갓티어", id: "bye1013" },
  { name: "이예훈", tier: "킹티어", id: "gnsl418" },
  { name: "윤수철", tier: "킹티어", id: "snfjdro369" },
  { name: "구성훈", tier: "킹티어", id: "rladuddo99" },
  { name: "어윤수", tier: "잭티어", id: "djdbstn" },
  { name: "김범수", tier: "잭티어", id: "bumsoo552" },
  { name: "다나짱", tier: "2티어", id: "cyj982002" },
  { name: "박듀듀", tier: "3티어", id: "parkle1006" },
  { name: "이유란", tier: "3티어", id: "forweourus" },
  { name: "라운이", tier: "5티어", id: "dmsthfdldia" },
  { name: "비타밍", tier: "6티어", id: "seemin88" },
  { name: "김설", tier: "6티어", id: "rnfma14" },
  { name: "수니양", tier: "6티어", id: "nasd06" },
  { name: "다뉴", tier: "7티어", id: "danu619" },
  { name: "아리송이", tier: "7티어", id: "vldpfm2" },
  { name: "김말랑", tier: "7티어", id: "5eulgii" },
  { name: "연또", tier: "8티어", id: "kjy3443" },
  { name: "밤하밍", tier: "유스", id: "haeun5513" }
];

const grid = document.getElementById("memberGrid");

members.forEach(m => {
  const card = document.createElement("div");
  card.className = "card";
  card.innerHTML = `
    <div class="name">${m.name}</div>
    <div class="tier">${m.tier}</div>
    <a href="https://play.sooplive.co.kr/${m.id}" target="_blank">LIVE 보기</a>
  `;
  grid.appendChild(card);
});
