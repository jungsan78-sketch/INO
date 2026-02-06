# INO LABEL STARBOO - 팬 사이트 템플릿 (PRO)

## 실행 방법

### 1) 그냥 열어보기 (정적)
- `index.html`을 더블클릭해서 열면 됩니다.
- 이 방식에서는 브라우저 CORS 때문에 **LIVE 뱃지 자동 표시 / SOOP 프로필 자동 연동**이 제한될 수 있습니다.
  - 대신 버튼( LIVE 보기 / 방송국 )은 정상 동작합니다.

### 2) LIVE 뱃지 + 프로필 자동 연동 (추천)
Node 서버를 같이 실행하면 자동 연동이 됩니다.

#### (1) Node 설치 후
터미널에서:
```bash
cd server
npm install
npm run dev
```

#### (2) 브라우저에서 열기
- http://localhost:3000

서버는 아래를 제공합니다:
- `/api/status?ids=a,b,c` : 멤버들의 `live` 여부 + `profileImage`를 반환합니다.

## 커스터마이징
- 멤버 수정: `script.js`의 `MEMBERS` 배열
- 로고 교체: `assets/logo.jpg`
- 색/효과: `style.css`의 `:root` 변수