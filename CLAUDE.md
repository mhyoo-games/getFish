# 이 저장소에서 작업할 때 지킬 것

겟피쉬(getFish, 한국어 이름은 '겟피쉬') — 타이밍 맞춰 눌러서 물고기를 낚는 2D 웹 낚시 게임. 조직 mhyoo-games, 주소 `https://mhyoo-games.github.io/getFish/`. 사용자는 한국어로 대화합니다.

- 빌드 없는 정적 페이지: `index.html` + `js/` (ES 모듈) + `css/`. 바다·화면은 canvas 2D(`js/draw.js`). 낚시꾼(남·여)과 물고기는 `js/toy3d.js`가 three.js(CDN, importmap)로 3D를 그려 2D에 붙임 — 낚시꾼은 Kenney Mini Characters(`assets/chars`, CC0), 물고기·모자·소품은 코드로 만든 장난감 블록. 3D가 안 되면 예전 2D 그림으로. 그림 파일은 Kenney 것(`assets/input`, `assets/chars`)만.
- 데이터는 `js/data.js` 하나: 스테이지 8개, 물고기(크기·등급·생김새 look, 미끼 전용이면 `bait`), 장비(낚싯대·줄·찌·모자·옷·장신구, stats), 미끼(보스 확률 `boss` — 보스는 미끼별 확률로 우연히 나옴), 드랍(DROPS), 도감 세트(SETS). 물고기·장비를 더하면 `tests/data.test.mjs`가 모양을 검사한다(드랍 전용은 DROPS에, 세트 보상은 SETS에 꼭 있어야 함).
- 규칙은 `js/game.js` (화면과 상관없는 순수 계산). 숫자를 바꾸면 `tests/logic.test.mjs`(자동 낚시꾼으로 승률 확인)를 맞춘다. 장비별 승률 표: `TABLE=1 node tests/logic.test.mjs`.
- 저장은 브라우저 localStorage `getfish_save_v1`. 저장 모양을 바꾸면 `fixSave`로 예전 저장을 고친다.
- CI(`.github/workflows/pages.yml`): 테스트 → index.html의 `__V__`를 커밋 번호로 바꿈(캐시 방지) → Pages 배포.
- 화면·README에 실명을 넣지 않는다. 만든 사람은 "심심풀이". 다른 회사·게임 이름을 넣지 않는다(모티브가 된 옛 게임 이름도). 소스·저장소 링크를 이력서·게임 모음에 넣지 않는다.
- 게임을 바꾸면 이력서(minhyuk94.github.io `src/data/resume.json`의 `games`)와 게임 모음(mhyoo-games.github.io `games.json`)도 같은 뜻으로 맞춘다.
