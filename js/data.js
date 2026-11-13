// getFish 데이터: 스테이지 · 물고기 · 장비 · 아바타 · 미끼 · 도감 세트
// 숫자를 바꾸면 tests/data.test.mjs 가 모양을 검사해요. 새 물고기·장비는 목록 끝에 더하면 돼요(저장은 id로 해서 순서가 바뀌어도 괜찮아요).

// ---------------------------------------------------------------- 스테이지
export const STAGES = [
  { id: 1, name: '햇살 선착장', desc: '잔잔한 아침 바다. 처음 낚시를 배우기 좋은 곳.', sky: ['#9FD8F5', '#E8F6FF'], sea: ['#3FB6D9', '#1E7FB0'], hill: '#7CB86A', boss: 'p13', hp: 1.0, bossHp: 1.0, spd: 1.0 },
  { id: 2, name: '산호초 바다', desc: '알록달록 산호 사이로 빠른 물고기들이 숨어 있어요.', sky: ['#7FD3F0', '#FFF4DA'], sea: ['#2CCFC8', '#138FA8'], hill: '#E8C98A', boss: 'r13', hp: 2.5, bossHp: 2.2, spd: 1.08 },
  { id: 3, name: '안개 협만', desc: '차가운 안개가 깔린 북쪽 바다. 힘센 물고기가 많아요.', sky: ['#B7C7D6', '#E9EFF4'], sea: ['#4E87A8', '#24506E'], hill: '#8A9AA6', boss: 'f13', hp: 5.5, bossHp: 4.0, spd: 1.16 },
  { id: 4, name: '심해 해구', desc: '빛이 닿지 않는 깊은 바다. 스스로 빛나는 물고기들의 집.', sky: ['#1B2450', '#3B3F7A'], sea: ['#1C2E66', '#0A1130'], hill: '#2A2F55', boss: 'd13', hp: 10, bossHp: 5.5, spd: 1.25 },
];

// 등급별 기본값 (스테이지 배율을 곱함)
export const TIERS = {
  c: { name: '흔함', hp: 60, spd: 1.0, price: 20, w: 60 },
  u: { name: '보통', hp: 90, spd: 1.15, price: 45, w: 27 },
  r: { name: '드묾', hp: 140, spd: 1.3, price: 110, w: 10 },
  e: { name: '아주 드묾', hp: 220, spd: 1.48, price: 300, w: 3 },
  boss: { name: '보스', hp: 650, spd: 1.6, price: 1500, w: 0 },
};

// 크기 등급 (같은 물고기 안에서 몇 % 크기인지)
export const GRADES = [
  { g: 'C', min: 0, hp: 1.0, spd: 1.0, price: 1.0, color: '#9AA4AE' },
  { g: 'B', min: 0.5, hp: 1.1, spd: 1.03, price: 1.4, color: '#6BBF59' },
  { g: 'A', min: 0.75, hp: 1.25, spd: 1.07, price: 2.0, color: '#4C9BE8' },
  { g: 'S', min: 0.9, hp: 1.45, spd: 1.12, price: 3.2, color: '#B265E0' },
  { g: 'SS', min: 0.97, hp: 1.8, spd: 1.2, price: 6.0, color: '#F2A42A' },
];

// ---------------------------------------------------------------- 물고기
// look: 모양(shape) · 색(c1 등, c2 배, c3 무늬·지느러미) · 무늬(pat) · 기타
// shape: fish 보통 / tall 납작하고 높음 / long 장어 / round 복어 / flat 가오리 / sword 청새치 / shark 상어 / angler 아귀 / cat 메기 / squid 오징어 / jelly 해파리 / horse 해마 / crab 게
const F = (id, name, tier, size, look, desc) => ({ id, name, tier, size, look, desc });
const RAW = {
  1: [
    F('p01', '은빛 피라미', 'c', [8, 16], { shape: 'fish', c1: '#9FB3C2', c2: '#EEF3F6', c3: '#E86A5A', pat: 'line' }, '선착장 아래를 떼 지어 다니는 작은 물고기. 비늘이 햇빛에 반짝여요.'),
    F('p02', '통통 붕어', 'c', [12, 28], { shape: 'tall', c1: '#A88B4E', c2: '#E9DDB4', c3: '#8A6C36', pat: 'none' }, '배가 볼록한 붕어. 미끼를 천천히 오물오물 먹어요.'),
    F('p03', '줄무늬 꺽지', 'c', [10, 22], { shape: 'fish', c1: '#6F8A5A', c2: '#D9E3C4', c3: '#3F5534', pat: 'bars' }, '세로 줄무늬가 멋진 물고기. 바위틈을 좋아해요.'),
    F('p04', '모래 망둥이', 'c', [6, 14], { shape: 'long', c1: '#C9B58E', c2: '#F1E8D2', c3: '#8E7A55', pat: 'spots', stub: true }, '모래 위를 통통 뛰어다니는 망둥이. 눈이 머리 위에 붙어 있어요.'),
    F('p05', '초록 잉어', 'u', [30, 60], { shape: 'fish', c1: '#5E9A62', c2: '#DCEBC8', c3: '#C79A3A', pat: 'scale', whisker: true }, '수염이 두 가닥 있는 잉어. 힘이 세서 줄을 당겨요.'),
    F('p06', '빨간 쏨뱅이', 'u', [15, 30], { shape: 'tall', c1: '#D9533F', c2: '#F6C3A8', c3: '#9E2E22', pat: 'spots', spiky: true }, '가시 지느러미를 세우는 빨간 물고기. 잡을 때 조심!'),
    F('p07', '수염 동자개', 'u', [18, 35], { shape: 'cat', c1: '#B88A3E', c2: '#F0DDB0', c3: '#5E4520', pat: 'blotch' }, '“빠각빠각” 소리를 내는 메기 친구.'),
    F('p08', '무지개 송어', 'r', [30, 65], { shape: 'fish', c1: '#7E9A8A', c2: '#F2EEE6', c3: '#E9708A', pat: 'rainbow' }, '옆구리에 분홍빛 무지개 띠가 있어요.'),
    F('p09', '물방울 복어', 'r', [12, 25], { shape: 'round', c1: '#E6D27A', c2: '#FFF6D6', c3: '#8E7A2E', pat: 'spots' }, '놀라면 동그랗게 부풀어요. 그래도 귀여워요.'),
    F('p10', '은갈치', 'r', [60, 120], { shape: 'long', c1: '#C9D3DC', c2: '#F4F7FA', c3: '#9FB0BE', pat: 'none', blade: true }, '칼처럼 길고 반짝이는 물고기. 서서 헤엄쳐요.'),
    F('p11', '황금 잉어', 'e', [45, 90], { shape: 'fish', c1: '#F2B632', c2: '#FFE9A6', c3: '#E07A1E', pat: 'scale', whisker: true }, '행운을 부른다는 황금빛 잉어.'),
    F('p12', '달빛 뱀장어', 'e', [70, 140], { shape: 'long', c1: '#5D6B8C', c2: '#C9D2EA', c3: '#E9F0FF', pat: 'glow' }, '달 밝은 밤에만 선착장 기둥을 감고 올라와요.'),
    F('p13', '수염 영감', 'boss', [160, 240], { shape: 'cat', c1: '#6B5A44', c2: '#D8C8A6', c3: '#3A2E20', pat: 'blotch', big: true }, '선착장의 주인. 기다란 수염으로 바닥의 모든 것을 알아요.'),
  ],
  2: [
    F('r01', '노랑 줄돔', 'c', [15, 30], { shape: 'tall', c1: '#F2CF3A', c2: '#FFF3B8', c3: '#2E3A4A', pat: 'bars' }, '노랑과 검정 줄무늬. 산호초의 교통정리 담당.'),
    F('r02', '파랑 쥐치', 'c', [12, 25], { shape: 'tall', c1: '#4C8FD6', c2: '#BFE0FA', c3: '#F2C13A', pat: 'dots' }, '입이 뾰족한 파란 물고기. 산호를 콕콕 쪼아요.'),
    F('r03', '꼬마 흰동가리', 'c', [6, 11], { shape: 'fish', c1: '#F27A2A', c2: '#FFC79A', c3: '#FFFFFF', pat: 'bands' }, '말미잘 집에 사는 주황 꼬마.'),
    F('r04', '분홍 놀래기', 'c', [10, 22], { shape: 'fish', c1: '#F08CB4', c2: '#FFE0EC', c3: '#7DD3E0', pat: 'line' }, '깜짝 잘 놀라는 분홍 물고기.'),
    F('r05', '나비 고기', 'u', [12, 22], { shape: 'tall', c1: '#FFE26A', c2: '#FFFFFF', c3: '#2E2E3A', pat: 'eyespot' }, '꼬리 쪽 가짜 눈으로 적을 속여요.'),
    F('r06', '점박이 쏠배감펭', 'u', [20, 38], { shape: 'tall', c1: '#C7563E', c2: '#FBE3D2', c3: '#FFFFFF', pat: 'bars', spiky: true, frill: true }, '부채 같은 지느러미가 화려해요. 가시는 조심.'),
    F('r07', '초록 앵무고기', 'u', [30, 60], { shape: 'fish', c1: '#3FBF9A', c2: '#C4F2E2', c3: '#F29AC0', pat: 'scale', beak: true }, '앵무새 부리 같은 이빨로 산호를 갉아요.'),
    F('r08', '보라 해파리', 'r', [15, 40], { shape: 'jelly', c1: '#B28AE8', c2: '#EDE0FF', c3: '#7E5AC2', pat: 'none' }, '둥실둥실 떠다녀요. 낚싯줄에 걸리는 건 흔치 않아요.'),
    F('r09', '꽃 해마', 'r', [8, 18], { shape: 'horse', c1: '#F2A24A', c2: '#FFE2B8', c3: '#E0603A', pat: 'dots' }, '꼬리로 산호를 꼭 붙잡고 있어요.'),
    F('r10', '무늬 오징어', 'r', [20, 45], { shape: 'squid', c1: '#E89A7A', c2: '#FFE2D4', c3: '#B85A3E', pat: 'dots' }, '몸 색을 순식간에 바꾸는 오징어.'),
    F('r11', '별빛 가오리', 'e', [60, 130], { shape: 'flat', c1: '#3E5A8A', c2: '#D6E2F2', c3: '#FFFFFF', pat: 'stars' }, '등에 별자리 같은 흰 점이 박힌 가오리.'),
    F('r12', '청새치', 'e', [150, 300], { shape: 'sword', c1: '#2E5E9A', c2: '#DDEAF6', c3: '#6FB0E8', pat: 'bars' }, '바다에서 가장 빠른 물고기 중 하나. 긴 창이 무기예요.'),
    F('r13', '파도 날개', 'boss', [250, 400], { shape: 'flat', c1: '#2A6A7A', c2: '#CFEFF2', c3: '#F2E8A0', pat: 'rings', big: true }, '산호초 위를 날듯이 헤엄치는 거대한 왕가오리.'),
  ],
  3: [
    F('f01', '은빛 청어', 'c', [20, 35], { shape: 'fish', c1: '#7A93A8', c2: '#EAF0F4', c3: '#4E6A82', pat: 'line' }, '추운 바다를 떼 지어 다니는 은색 물고기.'),
    F('f02', '북쪽 대구', 'c', [40, 80], { shape: 'fish', c1: '#9A8E6E', c2: '#EEE8D6', c3: '#6E6248', pat: 'spots', whisker: true, chin: true }, '턱 밑에 수염 하나. 입이 커서 뭐든 잘 먹어요.'),
    F('f03', '얼룩 가자미', 'c', [20, 40], { shape: 'flat', c1: '#8A7A5E', c2: '#E2D6BE', c3: '#5A4E3A', pat: 'blotch', flounder: true }, '두 눈이 한쪽에 몰린 납작한 물고기.'),
    F('f04', '털게', 'c', [8, 15], { shape: 'crab', c1: '#B8673E', c2: '#F2C8A8', c3: '#7A3E22', pat: 'none' }, '털이 보송보송한 게. 집게가 꽤 아파요.'),
    F('f05', '바위 볼락', 'u', [18, 35], { shape: 'tall', c1: '#5E6670', c2: '#D2D6DA', c3: '#3A4048', pat: 'blotch', spiky: true }, '바위와 똑같은 색으로 숨어 있어요.'),
    F('f06', '은연어', 'u', [50, 90], { shape: 'fish', c1: '#6E8AA0', c2: '#F2F4F6', c3: '#E07A6A', pat: 'spots' }, '태어난 강으로 돌아가는 길에 들른 연어.'),
    F('f07', '빙어', 'u', [10, 17], { shape: 'fish', c1: '#BFD6E2', c2: '#F6FAFC', c3: '#8EB2C6', pat: 'clear' }, '속이 비칠 만큼 투명한 작은 물고기.'),
    F('f08', '서리 곰치', 'r', [80, 160], { shape: 'long', c1: '#A8B8C8', c2: '#E6EEF4', c3: '#5A6E82', pat: 'spots', teeth: true }, '얼음 동굴에 사는 곰치. 입을 쩍 벌려 겁을 줘요.'),
    F('f09', '유령 오징어', 'r', [30, 60], { shape: 'squid', c1: '#D8E2EE', c2: '#F6FAFF', c3: '#9AB0CA', pat: 'clear' }, '안개처럼 하얗고 반투명한 오징어.'),
    F('f10', '빙하 복어', 'r', [20, 35], { shape: 'round', c1: '#9FD2EA', c2: '#F0FAFF', c3: '#4E90B8', pat: 'stars', spiky: true }, '얼음 결정 같은 가시가 돋은 복어.'),
    F('f11', '오로라 연어', 'e', [70, 120], { shape: 'fish', c1: '#5AB89A', c2: '#EAF6F2', c3: '#B88AE8', pat: 'rainbow' }, '하늘의 오로라가 비늘에 비친다는 전설의 연어.'),
    F('f12', '얼음 상어', 'e', [180, 320], { shape: 'shark', c1: '#8EA6BC', c2: '#EEF3F8', c3: '#5E7690', pat: 'none' }, '아주 천천히 움직이지만 한 번 물면 놓지 않아요.'),
    F('f13', '서리왕', 'boss', [400, 600], { shape: 'shark', c1: '#6E90B0', c2: '#E8F2FA', c3: '#CFE8FF', pat: 'frost', big: true, teeth: true }, '얼음 송곳니를 가진 협만의 왕. 안개 속에서 나타나요.'),
  ],
  4: [
    F('d01', '등불 샛비늘치', 'c', [5, 12], { shape: 'fish', c1: '#3A4A7A', c2: '#8E9AC8', c3: '#8CF2FF', pat: 'glowdots' }, '몸 아래쪽 점들이 파랗게 빛나요.'),
    F('d02', '검은 은줄멸', 'c', [6, 14], { shape: 'fish', c1: '#2A2E44', c2: '#6E7494', c3: '#C8D2FF', pat: 'line' }, '깜깜한 바다에서 은색 줄만 반짝.'),
    F('d03', '심해 해파리', 'c', [10, 30], { shape: 'jelly', c1: '#E86AAE', c2: '#FFD2EA', c3: '#FF9AD2', pat: 'glow' }, '분홍 불빛을 깜빡이며 떠다녀요.'),
    F('d04', '도끼 고기', 'c', [4, 10], { shape: 'tall', c1: '#9AA6C2', c2: '#E2E8F6', c3: '#7AF2E0', pat: 'glowdots', hatchet: true }, '도끼처럼 생긴 은빛 꼬마.'),
    F('d05', '송곳니 고기', 'u', [12, 18], { shape: 'fish', c1: '#3E3048', c2: '#8E7A9A', c3: '#FFFFFF', pat: 'none', teeth: true }, '몸에 비해 이빨이 엄청나게 커요.'),
    F('d06', '유리 오징어', 'u', [10, 25], { shape: 'squid', c1: '#C8E6F2', c2: '#F4FCFF', c3: '#7ACCE8', pat: 'clear' }, '유리처럼 투명해서 속이 다 보여요.'),
    F('d07', '심해 장어', 'u', [60, 130], { shape: 'long', c1: '#2E3A5A', c2: '#6E7EA6', c3: '#8CF2FF', pat: 'glowline' }, '몸을 따라 빛나는 줄이 있어요.'),
    F('d08', '초롱 아귀', 'r', [20, 45], { shape: 'angler', c1: '#4A3A5E', c2: '#9A86B2', c3: '#FFE680', pat: 'none', teeth: true }, '머리 위 초롱불로 먹이를 꾀어요.'),
    F('d09', '은하 해마', 'r', [10, 22], { shape: 'horse', c1: '#4A5AA8', c2: '#B8C2F2', c3: '#FFFFFF', pat: 'stars' }, '몸에 작은 별이 반짝이는 해마.'),
    F('d10', '심해 거미게', 'r', [30, 70], { shape: 'crab', c1: '#C84E4E', c2: '#F2B8A8', c3: '#7A2E2E', pat: 'none', leggy: true }, '다리가 아주 긴 게. 천천히, 하지만 끈질겨요.'),
    F('d11', '유령 상어', 'e', [100, 200], { shape: 'shark', c1: '#B8B2D2', c2: '#EEEAF8', c3: '#8E86B8', pat: 'clear' }, '반투명한 몸으로 소리 없이 다가와요.'),
    F('d12', '별똥 가오리', 'e', [80, 160], { shape: 'flat', c1: '#2A2E5A', c2: '#8E92C8', c3: '#FFE680', pat: 'glowdots' }, '헤엄칠 때 별똥별처럼 빛 꼬리가 생겨요.'),
    F('d13', '심연의 등불왕', 'boss', [300, 450], { shape: 'angler', c1: '#2E2444', c2: '#7A6A9A', c3: '#9AF2FF', pat: 'glowdots', big: true, teeth: true }, '해구 가장 깊은 곳의 왕. 등불 하나로 바다를 밝혀요.'),
  ],
};
export const FISH = [];
for (const [st, list] of Object.entries(RAW)) for (const f of list) {
  const S = STAGES[st - 1], T = TIERS[f.tier];
  const m = f.tier === 'boss' ? S.bossHp : S.hp;   // 보스는 따로 (좋은 장비로 잡을 수 있게)
  FISH.push({ ...f, stage: +st, hp: Math.round(T.hp * m), spd: +(T.spd * S.spd).toFixed(3), price: Math.round(T.price * m) });
}
export const FISH_BY_ID = Object.fromEntries(FISH.map(f => [f.id, f]));

// ---------------------------------------------------------------- 장비 · 아바타 · 미끼
// stats: far 멀리 던지기(힘 게이지의 좋은 구간이 넓어지고, 멀리 던질수록 드문 물고기가 더 와요)
//        pow 한 번 맞힐 때 힘 · crit 금빛 과녁이 나올 확률 · heart 줄 버팀(하트) · time 싸움 시간(초)
//        slow 물고기 움직임 느리게(비율) · zone 과녁 넓게(비율) · luck 큰 물고기·드랍 운 · coin 동전 더 받기(비율)
// shop: 상점 가격 (없으면 상점에 없음) · drop: 드랍으로만 얻음 (어디서 나오는지는 DROPS)
const I = (id, slot, name, stats, o = {}) => ({ id, slot, name, stats, ...o });
export const ITEMS = [
  // 낚싯대
  I('rod1', 'rod', '대나무 낚싯대', { pow: 10, crit: 0.05 }, { start: true, desc: '할아버지가 주신 낡은 대나무 낚싯대.', color: '#C8A25A' }),
  I('rod2', 'rod', '유리섬유 낚싯대', { pow: 16, crit: 0.06, far: 0.05 }, { shop: 600, desc: '가볍고 잘 휘는 초보자용 낚싯대.', color: '#6FB0E8' }),
  I('rod3', 'rod', '카본 낚싯대', { pow: 24, crit: 0.08, far: 0.08 }, { shop: 2400, desc: '단단하고 가벼운 검은 낚싯대.', color: '#3A3E48' }),
  I('rod4', 'rod', '산호 가지 낚싯대', { pow: 30, crit: 0.12, far: 0.1 }, { drop: true, desc: '산호초에서 건진 분홍 가지로 만든 낚싯대.', color: '#F08CA0' }),
  I('rod5', 'rod', '티타늄 낚싯대', { pow: 38, crit: 0.1, far: 0.1 }, { shop: 9000, desc: '아무리 큰 물고기도 버티는 금속 낚싯대.', color: '#A8B2BE' }),
  I('rod6', 'rod', '수염 영감의 지팡이', { pow: 22, crit: 0.15, luck: 0.05, far: 0.1 }, { drop: true, desc: '수염 영감이 아끼던 나무 지팡이. 운이 따라요.', color: '#8A6A44' }),
  I('rod7', 'rod', '서리 송곳니 낚싯대', { pow: 48, crit: 0.14, far: 0.12 }, { drop: true, desc: '서리왕의 송곳니로 끝을 단 차가운 낚싯대.', color: '#9FD2F2' }),
  I('rod8', 'rod', '심연 등불대', { pow: 60, crit: 0.18, luck: 0.08, far: 0.15 }, { drop: true, desc: '끝에 작은 등불이 달린 낚싯대. 어둠 속 물고기를 불러요.', color: '#6A5A9A' }),
  I('rod9', 'rod', '황금 낚싯대', { pow: 45, crit: 0.1, coin: 0.2, far: 0.1 }, { shop: 30000, desc: '번쩍이는 황금 낚싯대. 동전이 더 들어와요.', color: '#F2C23A' }),
  // 줄
  I('line1', 'line', '무명실', { heart: 3, time: 20 }, { start: true, desc: '집에 있던 실. 금방 끊어질 것 같아요.', color: '#E8E2D2' }),
  I('line2', 'line', '나일론 줄', { heart: 4, time: 22 }, { shop: 500, desc: '흔히 쓰는 투명한 낚싯줄.', color: '#CFE6F2' }),
  I('line3', 'line', '합사 줄', { heart: 5, time: 24, far: 0.05 }, { shop: 2000, desc: '여러 가닥을 꼬아 만든 튼튼한 줄.', color: '#7AC27A' }),
  I('line4', 'line', '강철 와이어', { heart: 6, time: 26, pow: 3, far: 0.05 }, { shop: 8000, desc: '이빨 센 물고기도 못 끊는 금속 줄.', color: '#9AA6B2' }),
  I('line5', 'line', '인어 머리카락 줄', { heart: 7, time: 30, slow: 0.05, far: 0.08 }, { drop: true, desc: '물속에서 반짝이는 신비한 줄. 물고기가 순해져요.', color: '#B88AE8' }),
  // 찌
  I('float1', 'float', '나무 찌', { slow: 0, zone: 0 }, { start: true, desc: '나무를 깎아 만든 찌.', color: '#C8865A' }),
  I('float2', 'float', '깃털 찌', { slow: 0.08, zone: 0.05, far: 0.05 }, { shop: 400, desc: '작은 입질도 잘 보이는 가벼운 찌.', color: '#F2E2C2' }),
  I('float3', 'float', '형광 찌', { slow: 0.12, zone: 0.1, far: 0.08 }, { shop: 1800, desc: '물 위에서 밝게 빛나 타이밍을 잡기 쉬워요.', color: '#C8F25A' }),
  I('float4', 'float', '오뚝이 찌', { slow: 0.18, zone: 0.12, far: 0.06 }, { shop: 7000, desc: '물고기가 당겨도 금방 바로 서는 찌.', color: '#F26A5A' }),
  I('float5', 'float', '달빛 찌', { slow: 0.25, zone: 0.18, luck: 0.05, far: 0.12 }, { drop: true, desc: '심해에서 건진 은은한 달빛 찌.', color: '#E8EEFF' }),
  // 모자
  I('hat1', 'hat', '밀짚모자', {}, { start: true, desc: '햇빛을 가려 주는 밀짚모자.', color: '#E8C870' }),
  I('hat2', 'hat', '선장 모자', { coin: 0.1, far: 0.03 }, { shop: 1500, desc: '배 위의 주인공은 나. 동전이 더 들어와요.', color: '#2E3A5A' }),
  I('hat3', 'hat', '방울 털모자', { time: 3 }, { shop: 3000, desc: '따뜻해서 오래 버틸 수 있어요.', color: '#E85A5A' }),
  I('hat4', 'hat', '해적 두건', { crit: 0.05 }, { drop: true, desc: '산호초 난파선에서 나온 두건.', color: '#2E2E34' }),
  I('hat5', 'hat', '별 고깔모자', { luck: 0.06 }, { set: true, desc: '도감 세트 보상. 별이 운을 불러요.', color: '#7A6AE0' }),
  I('hat6', 'hat', '바다 왕관', { pow: 5, luck: 0.05 }, { set: true, desc: '네 바다의 보스를 모두 잡은 낚시꾼의 왕관.', color: '#F2C23A' }),
  // 옷
  I('outfit1', 'outfit', '줄무늬 티셔츠', {}, { start: true, desc: '편한 줄무늬 티셔츠.', color: '#5A9AE0' }),
  I('outfit2', 'outfit', '구명조끼', { heart: 1 }, { shop: 1200, desc: '안전 제일! 한 번 더 버텨요.', color: '#F28A2A' }),
  I('outfit3', 'outfit', '어부 작업복', { pow: 3 }, { shop: 3500, desc: '팔을 쓰기 편한 튼튼한 작업복.', color: '#4E7A5A' }),
  I('outfit4', 'outfit', '잠수 슈트', { time: 3, zone: 0.04 }, { drop: true, desc: '협만의 차가운 물에서도 끄떡없는 슈트.', color: '#2E4E7A' }),
  I('outfit5', 'outfit', '별무늬 망토', { slow: 0.06 }, { set: true, desc: '도감 세트 보상. 물고기가 넋을 놓아요.', color: '#3A3A7A' }),
  // 장신구
  I('acc0', 'acc', '없음', {}, { start: true, desc: '', color: '#00000000' }),
  I('acc1', 'acc', '동그란 선글라스', { zone: 0.03 }, { shop: 800, desc: '눈부심 없이 과녁이 잘 보여요.', color: '#2E2E34' }),
  I('acc2', 'acc', '조개 목걸이', { coin: 0.08 }, { drop: true, desc: '산호초 바다에서 건진 조개 목걸이.', color: '#F2D2C2' }),
  I('acc3', 'acc', '네잎 배지', { luck: 0.05 }, { shop: 5000, desc: '행운의 네잎클로버 배지.', color: '#5AC25A' }),
  I('acc4', 'acc', '등불 펜던트', { crit: 0.06 }, { drop: true, desc: '심해 등불 조각으로 만든 펜던트.', color: '#9AF2FF' }),
  I('acc5', 'acc', '물고기 인형', { heart: 1 }, { set: true, desc: '도감 세트 보상. 등에 메는 물고기 인형.', color: '#7AC2F2' }),
];
export const ITEM_BY_ID = Object.fromEntries(ITEMS.map(i => [i.id, i]));
export const SLOTS = { rod: '낚싯대', line: '줄', float: '찌', hat: '모자', outfit: '옷', acc: '장신구' };

// 미끼: 던질 때마다 하나씩 써요(맨 바늘은 공짜). w: 등급별 확률 배율 · boss: 보스 미끼
export const BAITS = [
  { id: 'bait0', name: '맨 바늘', w: { c: 1.3, u: 0.7, r: 0.4, e: 0.2 }, price: 0, desc: '미끼 없이. 작은 물고기만 와요.' },
  { id: 'bait1', name: '지렁이', w: { c: 1, u: 1, r: 1, e: 1 }, price: 5, pack: 10, desc: '어떤 물고기든 좋아하는 기본 미끼.' },
  { id: 'bait2', name: '새우 미끼', w: { c: 0.8, u: 1.3, r: 1.6, e: 1.3 }, price: 20, pack: 10, desc: '드문 물고기가 더 잘 와요.' },
  { id: 'bait3', name: '반짝 루어', w: { c: 0.5, u: 1.2, r: 2.2, e: 2.6 }, price: 60, pack: 5, desc: '반짝반짝, 아주 드문 물고기를 불러요.' },
  { id: 'bait4', name: '황금 미끼', w: {}, boss: true, price: 1500, pack: 1, desc: '그 바다의 보스를 불러내요. 보스 도전에 써요.' },
];
export const BAIT_BY_ID = Object.fromEntries(BAITS.map(b => [b.id, b]));

// 드랍: 물고기를 잡으면 굴려요 (luck이 높을수록 잘 나와요). stage: 그 바다의 아무 물고기 / boss: 보스를 잡으면
export const DROPS = [
  { stage: 1, item: 'bait2', n: 2, chance: 0.06 },
  { stage: 1, item: 'bait4', n: 1, chance: 0.01 },
  { stage: 1, boss: true, item: 'rod6', n: 1, chance: 0.25 },
  { stage: 1, boss: true, item: 'bait3', n: 3, chance: 1.0 },
  { stage: 2, item: 'bait3', n: 1, chance: 0.05 },
  { stage: 2, item: 'acc2', n: 1, chance: 0.008 },
  { stage: 2, item: 'hat4', n: 1, chance: 0.006 },
  { stage: 2, item: 'rod4', n: 1, chance: 0.004 },
  { stage: 2, item: 'bait4', n: 1, chance: 0.012 },
  { stage: 2, boss: true, item: 'line5', n: 1, chance: 0.2 },
  { stage: 2, boss: true, item: 'rod4', n: 1, chance: 0.2 },
  { stage: 3, item: 'outfit4', n: 1, chance: 0.006 },
  { stage: 3, item: 'bait3', n: 1, chance: 0.06 },
  { stage: 3, item: 'bait4', n: 1, chance: 0.014 },
  { stage: 3, boss: true, item: 'rod7', n: 1, chance: 0.15 },
  { stage: 3, boss: true, item: 'line5', n: 1, chance: 0.1 },
  { stage: 4, item: 'acc4', n: 1, chance: 0.006 },
  { stage: 4, item: 'float5', n: 1, chance: 0.004 },
  { stage: 4, item: 'bait4', n: 1, chance: 0.016 },
  { stage: 4, boss: true, item: 'rod8', n: 1, chance: 0.1 },
  { stage: 4, boss: true, item: 'float5', n: 1, chance: 0.15 },
];

// ---------------------------------------------------------------- 도감 세트
const ids = (st, tiers) => FISH.filter(f => f.stage === st && tiers.includes(f.tier)).map(f => f.id);
export const SETS = [
  { id: 'set_p1', name: '선착장 단골', fish: ids(1, ['c', 'u']), reward: { coins: 1000, items: { bait4: 1 } } },
  { id: 'set_p2', name: '선착장 박사', fish: ids(1, ['c', 'u', 'r', 'e', 'boss']), reward: { coins: 3000, items: { hat5: 1 } } },
  { id: 'set_r1', name: '산호초 친구들', fish: ids(2, ['c', 'u']), reward: { coins: 2500, items: { bait3: 5 } } },
  { id: 'set_r2', name: '산호초 박사', fish: ids(2, ['c', 'u', 'r', 'e', 'boss']), reward: { coins: 6000, items: { outfit5: 1 } } },
  { id: 'set_f1', name: '안개 속 친구들', fish: ids(3, ['c', 'u']), reward: { coins: 5000, items: { bait4: 2 } } },
  { id: 'set_f2', name: '협만 박사', fish: ids(3, ['c', 'u', 'r', 'e', 'boss']), reward: { coins: 12000, items: { acc5: 1 } } },
  { id: 'set_d1', name: '깊은 바다 친구들', fish: ids(4, ['c', 'u']), reward: { coins: 9000, items: { bait4: 3 } } },
  { id: 'set_d2', name: '심해 박사', fish: ids(4, ['c', 'u', 'r', 'e', 'boss']), reward: { coins: 20000, items: { bait4: 5 } } },
  { id: 'set_boss', name: '네 바다의 왕', fish: FISH.filter(f => f.tier === 'boss').map(f => f.id), reward: { coins: 15000, items: { hat6: 1 } } },
  { id: 'set_round', name: '동글동글', fish: FISH.filter(f => f.look.shape === 'round').map(f => f.id), reward: { coins: 1500, items: { bait2: 10 } } },
  { id: 'set_long', name: '길쭉길쭉', fish: FISH.filter(f => f.look.shape === 'long').map(f => f.id), reward: { coins: 4000, items: { bait3: 5 } } },
  { id: 'set_squishy', name: '말랑말랑', fish: FISH.filter(f => ['squid', 'jelly'].includes(f.look.shape)).map(f => f.id), reward: { coins: 4000, items: { bait4: 1 } } },
  { id: 'set_ss', name: 'SS 수집가', grade: 'SS', count: 3, reward: { coins: 8000, items: { bait4: 2 } } },   // 아무 물고기나 SS 등급 3종
];

// 아바타 동물
export const ANIMALS = [
  { id: 'hamster', name: '햄스터', fur: '#E8B070', belly: '#FFF1DA', ear: 'round' },
  { id: 'cat', name: '고양이', fur: '#F2A65A', belly: '#FFF0E0', ear: 'cat' },
  { id: 'rabbit', name: '토끼', fur: '#F2F0EC', belly: '#FFFFFF', ear: 'bunny' },
  { id: 'bear', name: '곰', fur: '#A8774A', belly: '#E8CBA6', ear: 'round' },
  { id: 'fox', name: '여우', fur: '#E8783A', belly: '#FFF4E8', ear: 'fox' },
];

export const START = { coins: 300, items: { rod1: 1, line1: 1, float1: 1, hat1: 1, outfit1: 1, acc0: 1, bait1: 20 }, eq: { rod: 'rod1', line: 'line1', float: 'float1', hat: 'hat1', outfit: 'outfit1', acc: 'acc0', bait: 'bait1' } };
export const BAG_MAX = 40;

// ---------------------------------------------------------------- 레벨 · 칭호
// 경험치: 물고기 등급 × 바다 × 크기 등급 (+ 새 도감 보너스). 레벨이 오르면 동전과 작은 능력치(힘·하트)가 붙어요.
export const LEVEL = { max: 50, need: lv => Math.round(80 * Math.pow(lv, 1.5)), exp: { c: 10, u: 20, r: 45, e: 100, boss: 400 }, grade: { C: 1, B: 1.2, A: 1.5, S: 2, SS: 3 }, newDex: 30 };
// 칭호: 조건을 채우면 얻고, 하나를 골라 달아요(단 칭호의 효과만 들어가요).
// cond: level 레벨 · dex 도감 수 · bosses 잡은 보스 종류 · ss SS 등급 종류 · caught 잡은 수 · nice 나이스 캐스팅 수 · stage 그 바다 도감 전부
export const TITLES = [
  { id: 't_new', name: '새내기 낚시꾼', cond: { level: 1 }, stats: {}, desc: '처음 낚싯대를 잡았어요.' },
  { id: 't_lv5', name: '바닷바람 친구', cond: { level: 5 }, stats: { time: 1 }, desc: '레벨 5' },
  { id: 't_lv10', name: '능숙한 낚시꾼', cond: { level: 10 }, stats: { pow: 2 }, desc: '레벨 10' },
  { id: 't_lv20', name: '바다의 단골', cond: { level: 20 }, stats: { crit: 0.03 }, desc: '레벨 20' },
  { id: 't_lv30', name: '물결을 읽는 자', cond: { level: 30 }, stats: { slow: 0.04 }, desc: '레벨 30' },
  { id: 't_lv40', name: '전설의 낚시꾼', cond: { level: 40 }, stats: { pow: 6, luck: 0.03 }, desc: '레벨 40' },
  { id: 't_lv50', name: '바다의 주인', cond: { level: 50 }, stats: { pow: 8, luck: 0.05, coin: 0.05 }, desc: '레벨 50' },
  { id: 't_dex10', name: '도감 수집가', cond: { dex: 10 }, stats: { coin: 0.03 }, desc: '도감 10종' },
  { id: 't_dex26', name: '물고기 박사', cond: { dex: 26 }, stats: { luck: 0.03 }, desc: '도감 26종 (절반)' },
  { id: 't_dex52', name: '살아 있는 도감', cond: { dex: 52 }, stats: { luck: 0.06, coin: 0.06 }, desc: '도감 52종 전부' },
  { id: 't_pier', name: '선착장 지킴이', cond: { stage: 1 }, stats: { heart: 1 }, desc: '햇살 선착장 도감 전부' },
  { id: 't_reef', name: '산호초 탐험가', cond: { stage: 2 }, stats: { zone: 0.04 }, desc: '산호초 바다 도감 전부' },
  { id: 't_fjord', name: '안개 속 사냥꾼', cond: { stage: 3 }, stats: { time: 2 }, desc: '안개 협만 도감 전부' },
  { id: 't_deep', name: '심해의 등불', cond: { stage: 4 }, stats: { far: 0.06 }, desc: '심해 해구 도감 전부' },
  { id: 't_boss1', name: '보스 사냥꾼', cond: { bosses: 1 }, stats: { pow: 1 }, desc: '보스 1마리' },
  { id: 't_boss4', name: '네 바다의 왕', cond: { bosses: 4 }, stats: { pow: 4, crit: 0.03 }, desc: '보스 4마리 모두' },
  { id: 't_ss1', name: '대물 사냥꾼', cond: { ss: 1 }, stats: { luck: 0.02 }, desc: 'SS 등급 1종' },
  { id: 't_ss10', name: '월척 장인', cond: { ss: 10 }, stats: { luck: 0.05 }, desc: 'SS 등급 10종' },
  { id: 't_c100', name: '부지런한 손', cond: { caught: 100 }, stats: { coin: 0.04 }, desc: '물고기 100마리' },
  { id: 't_c500', name: '쉬지 않는 낚싯대', cond: { caught: 500 }, stats: { pow: 3 }, desc: '물고기 500마리' },
  { id: 't_nice30', name: '명품 캐스터', cond: { nice: 30 }, stats: { far: 0.05 }, desc: '나이스 캐스팅 30번' },
];
