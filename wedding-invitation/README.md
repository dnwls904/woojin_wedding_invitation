# 모바일 청첩장 1차 버전

## 파일 구조
- index.html : 전체 페이지
- style.css : 디자인/반응형 스타일
- script.js : 스크롤 애니메이션, 갤러리 확대, 계좌번호 복사
- images/ : 사진 폴더

## 먼저 수정할 곳
1. `index.html`에서 신랑/신부 이름
2. 날짜/시간
3. 예식장/주소
4. 전화번호
5. 계좌번호
6. 네이버지도/카카오맵 링크
7. `images/` 폴더의 사진

## 사진
아래 파일명으로 사진을 넣으면 바로 적용됩니다.
- main.jpg
- photo01.jpg ~ photo06.jpg
- ending.jpg

사진이 아직 없으면 회색 자리표시자가 보일 수 있습니다.

## 로컬 실행
폴더에서 간단한 서버를 실행하면 됩니다.

Python:
`python -m http.server 8000`

그리고 브라우저에서:
`http://localhost:8000`

## 배포
GitHub Pages, Cloudflare Pages 등 정적 사이트 호스팅에 폴더를 그대로 올리면 됩니다.
