# INO LABEL STARBOO 팬 사이트 (Vercel 배포용)

## 배포 방법
1) 이 폴더를 GitHub에 올리기
2) Vercel에서 Import
3) 배포 완료

## 주요 기능
- 조직도: LIVE 보기 / 방송국 버튼
- LIVE 중이면: 카드에 LIVE 표시 + 프로필 아바타에 빨간 점 표시
- LIVE 중이면: 마우스 올릴 때 썸네일 미리보기 + 시청자수(가능하면) 표시
- 프로필 사진: 방송국 페이지의 og:image를 자동 연동 (가능하면)

## 참고
- /api/status는 SOOP 페이지 HTML을 "휴리스틱"으로 파싱합니다.
  플랫폼 구조가 바뀌면 /api/status.js의 정규식을 조정하면 됩니다.
- 커뮤니티(글/댓글/이미지 업로드)는 2단계로 구현 가능:
  - 추천: Vercel + Supabase (DB + Storage + Auth)