// 토이피쉬 데이터: 스테이지 · 물고기 · 장비 · 아바타 · 미끼 · 도감 세트
// 숫자를 바꾸면 tests/data.test.mjs 가 모양을 검사해요. 새 물고기·장비는 목록 끝에 더하면 돼요(저장은 id로 해서 순서가 바뀌어도 괜찮아요).

// ---------------------------------------------------------------- 스테이지
export const STAGES = [
  { id: 1, name: '햇살 선착장', desc: '잔잔한 아침 바다. 처음 낚시를 배우기 좋은 곳.', sky: ['#9FD8F5', '#E8F6FF'], sea: ['#3FB6D9', '#1E7FB0'], hill: '#7CB86A', boss: 'p13', hp: 1.0, bossHp: 1.0, spd: 1.0 },
  { id: 2, name: '산호초 바다', desc: '알록달록 산호 사이로 빠른 물고기들이 숨어 있어요.', sky: ['#7FD3F0', '#FFF4DA'], sea: ['#2CCFC8', '#138FA8'], hill: '#E8C98A', boss: 'r13', hp: 2.5, bossHp: 2.2, spd: 1.08 },
  { id: 3, name: '안개 협만', desc: '차가운 안개가 깔린 북쪽 바다. 힘센 물고기가 많아요.', sky: ['#B7C7D6', '#E9EFF4'], sea: ['#4E87A8', '#24506E'], hill: '#8A9AA6', boss: 'f13', hp: 5.5, bossHp: 4.0, spd: 1.16 },
  { id: 4, name: '심해 해구', desc: '빛이 닿지 않는 깊은 바다. 스스로 빛나는 물고기들의 집.', sky: ['#1B2450', '#3B3F7A'], sea: ['#1C2E66', '#0A1130'], hill: '#2A2F55', boss: 'd13', hp: 10, bossHp: 5.5, spd: 1.25, night: true },
  { id: 5, name: '노을 화산섬', desc: '바다 밑 화산이 숨 쉬는 섬. 뜨거운 물을 좋아하는 물고기들.', sky: ['#E8785A', '#FFD8A0'], sea: ['#C8644A', '#5A2238'], hill: '#3E3036', boss: 'v13', hp: 20, bossHp: 12, spd: 1.32 },
  { id: 6, name: '폭풍의 바다', desc: '번개가 치고 파도가 높은 거친 바다. 힘센 녀석들만 살아남아요.', sky: ['#3E4658', '#7A8498'], sea: ['#3A5666', '#122232'], hill: '#262C38', boss: 's13', hp: 30, bossHp: 16, spd: 1.4 },
  { id: 7, name: '가라앉은 옛 도시', desc: '물에 잠긴 기둥과 신전 사이로 신비한 물고기들이 헤엄쳐요.', sky: ['#7CCAC2', '#EEF4DA'], sea: ['#2AA8A0', '#0C4458'], hill: '#C8B48E', boss: 'a13', hp: 44, bossHp: 23, spd: 1.48 },
  { id: 8, name: '용궁 바다', desc: '전설 속 용왕이 산다는 무지갯빛 바다. 가장 깊고 가장 아름다워요.', sky: ['#A88AE0', '#FFE6F0'], sea: ['#5A62D0', '#24185E'], hill: '#C88AB8', boss: 'k13', hp: 62, bossHp: 32, spd: 1.56 },
  // 숨은 바다: 유리병 편지 속 지도 조각 4장(바다 5~8)을 모으면 열려요. 목록에는 열리기 전까지 보이지 않아요.
  { id: 9, name: '장난감 상자 바다', desc: '잃어버린 장난감들이 모여 사는 바다. 모든 이야기가 시작된 곳.', sky: ['#FFD6E8', '#FFF6D8'], sea: ['#6ACBF2', '#3A6AD8'], hill: '#F2B85A', boss: 't13', hp: 70, bossHp: 36, spd: 1.6, hidden: true },
];
export const STAGE_ICON = ['⛵', '🪸', '🌫️', '🌌', '🌋', '⛈️', '🏛️', '🐉', '🧸'];
export const MAP_STAGES = [5, 6, 7, 8];   // 지도 조각이 나오는 바다 (그 바다 보스를 잡은 뒤 유리병에서)

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
// bait: 이 미끼로만 낚이는 물고기 (미끼 id 목록)
// hidden: 숨은 물고기 — 도감에 칸이 없고, secret 조건을 채웠을 때만 가끔 물어요(조건은 유리병 편지에서 힌트).
//   secret: gear(그 장비를 다 착용) · wearAny(그중 하나 착용) · bait · perfect(PERFECT 던지기) · perfectRun(연속 PERFECT 수) · hours([시작, 끝) 실제 시각) · cancels(바로 전까지 연속 거두기 수) · lightning(번개 치는 순간)
const F = (id, name, tier, size, look, desc, o = {}) => ({ id, name, tier, size, look, desc, ...o });
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
    F('p14', '떡붕어', 'u', [20, 40], { shape: 'tall', c1: '#B89A5E', c2: '#F2E6C2', c3: '#7A6232', pat: 'none' }, '떡밥을 정말 좋아하는 붕어. 다른 미끼는 쳐다보지도 않아요.', { bait: ['bait5'] }),
    F('p15', '태엽 붕어', 'e', [20, 36], { shape: 'tall', c1: '#F2C23A', c2: '#FFF0B8', c3: '#E8545A', pat: 'scale', windup: true }, '등에 태엽 열쇠가 꽂힌 붕어. 처음 낚싯대를 잡았던 날을 기억해요.', { hidden: true, secret: { gear: { rod: 'rod1', hat: 'hat1' }, perfect: true } }),
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
    F('r14', '형광 꼬마오징어', 'r', [10, 20], { shape: 'squid', c1: '#F2A2D2', c2: '#FFE8F6', c3: '#9AF2FF', pat: 'glow' }, '빛을 따라다니는 꼬마 오징어. 야광 루어에만 모여들어요.', { bait: ['bait7'] }),
    F('r15', '무지개 흰동가리', 'e', [8, 14], { shape: 'fish', c1: '#B88AE8', c2: '#FFF0FA', c3: '#7AE2F2', pat: 'bands' }, '줄무늬가 일곱 빛깔로 바뀌는 흰동가리. 반짝이는 것을 세 번 보면 나와요.', { hidden: true, secret: { bait: 'bait3', perfectRun: 3 } }),
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
    F('f14', '눈꽃 대구', 'r', [50, 90], { shape: 'fish', c1: '#C8D8E8', c2: '#FFFFFF', c3: '#8AA8C8', pat: 'frost', whisker: true, chin: true }, '비늘에 눈꽃 무늬가 핀 대구. 오징어 살 냄새에만 올라와요.', { bait: ['bait6'] }),
    F('f15', '하얀 그림자 연어', 'e', [60, 110], { shape: 'fish', c1: '#F2F6FA', c2: '#FFFFFF', c3: '#B8D2E8', pat: 'frost' }, '한밤중 안개 속에서만 헤엄치는 새하얀 연어.', { hidden: true, secret: { hours: [0, 5] } }),
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
    F('d14', '은하 리본장어', 'e', [150, 250], { shape: 'long', c1: '#2A2E6A', c2: '#8A92D8', c3: '#FFE27A', pat: 'stars' }, '리본처럼 하늘거리는 별무늬 장어. 야광 루어를 별인 줄 알아요.', { bait: ['bait7'] }),
    F('d15', '노란 잠수함고기', 'e', [30, 60], { shape: 'round', c1: '#F2D23A', c2: '#FFF4C8', c3: '#3A4A6A', pat: 'none', periscope: true }, '잠망경을 빼꼼 내민 장난감 잠수함 같은 물고기. 아무것도 바라지 않는 낚시꾼을 좋아해요.', { hidden: true, secret: { bait: 'bait0' } }),
    F('d13', '심연의 등불왕', 'boss', [300, 450], { shape: 'angler', c1: '#2E2444', c2: '#7A6A9A', c3: '#9AF2FF', pat: 'glowdots', big: true, teeth: true }, '해구 가장 깊은 곳의 왕. 등불 하나로 바다를 밝혀요.'),
  ],
  5: [
    F('v01', '불씨 자리돔', 'c', [8, 15], { shape: 'fish', c1: '#E8603A', c2: '#FFD0A0', c3: '#3A2A2A', pat: 'line' }, '꼬리 끝이 불씨처럼 빨간 작은 물고기.'),
    F('v02', '현무암 망둥이', 'c', [8, 16], { shape: 'long', c1: '#4A4448', c2: '#A89A98', c3: '#E8603A', pat: 'spots', stub: true }, '까만 화산 바위 위를 통통 뛰어다녀요.'),
    F('v03', '노을 놀래기', 'c', [12, 24], { shape: 'fish', c1: '#F29A5A', c2: '#FFE6C8', c3: '#C84A6A', pat: 'rainbow' }, '해 질 녘 하늘 색을 닮은 놀래기.'),
    F('v04', '숯검댕 게', 'c', [8, 14], { shape: 'crab', c1: '#3A3438', c2: '#8A7E80', c3: '#E8603A' }, '숯처럼 까만 게. 집게 끝만 빨개요.'),
    F('v05', '화산 쏨뱅이', 'u', [20, 38], { shape: 'tall', c1: '#C8402A', c2: '#F2B08A', c3: '#3A1E1E', pat: 'lava', spiky: true }, '몸에 용암 같은 무늬가 흘러요. 가시가 뜨거워요!'),
    F('v06', '용암 장어', 'u', [70, 140], { shape: 'long', c1: '#2E2428', c2: '#6A4A44', c3: '#FF7A2A', pat: 'glowline' }, '몸을 따라 주황빛 줄이 일렁이는 장어.'),
    F('v07', '주홍 도미', 'u', [25, 50], { shape: 'tall', c1: '#E85A4A', c2: '#FFD6C8', c3: '#F2C23A', pat: 'scale' }, '잔치 상에 오를 것 같은 늠름한 주홍 도미.'),
    F('v08', '불꽃 복어', 'r', [15, 30], { shape: 'round', c1: '#F27A3A', c2: '#FFE0B8', c3: '#C8302A', pat: 'spots', spiky: true }, '화나면 불꽃처럼 가시를 세우고 부풀어요.'),
    F('v09', '유황 해파리', 'r', [15, 35], { shape: 'jelly', c1: '#F2D23A', c2: '#FFF6C8', c3: '#E8903A', pat: 'glow' }, '노란빛을 내며 뜨거운 물을 타고 떠올라요.'),
    F('v10', '화산재 가오리', 'r', [70, 140], { shape: 'flat', c1: '#5A5058', c2: '#C8BCC0', c3: '#FF8A3A', pat: 'glowdots' }, '화산재를 뒤집어쓴 듯한 회색 가오리. 점들이 은은하게 빛나요.'),
    F('v11', '불사조 날치', 'e', [30, 55], { shape: 'fish', c1: '#F25A3A', c2: '#FFE8A0', c3: '#FFC23A', pat: 'rainbow', frill: true }, '물 위로 날아오를 때 불사조처럼 지느러미가 타올라요.'),
    F('v12', '흑요석 상어', 'e', [180, 320], { shape: 'shark', c1: '#2A2630', c2: '#8A8090', c3: '#C84AFF', pat: 'none', teeth: true }, '흑요석처럼 반들반들 까만 상어.'),
    F('v14', '불꽃 꽃게', 'r', [15, 30], { shape: 'crab', c1: '#F2602A', c2: '#FFD0A0', c3: '#FFE27A' }, '불꽃 새우 냄새를 맡아야만 바위틈에서 나와요.', { bait: ['bait8'] }),
    F('v15', '용암 오뚝이복어', 'e', [20, 40], { shape: 'round', c1: '#E8402A', c2: '#FFD0A0', c3: '#FFB02A', pat: 'lava', spiky: true }, '넘어져도 벌떡 일어나는 복어. 망설이는 낚시꾼을 기다려 줘요.', { hidden: true, secret: { cancels: 3, perfect: true } }),
    F('v13', '마그마 군주', 'boss', [350, 520], { shape: 'tall', c1: '#A8301E', c2: '#F2A06A', c3: '#FFB02A', pat: 'lava', spiky: true, big: true }, '용암을 두르고 바다 밑 화산에서 솟아오르는 거대한 쏨뱅이.'),
  ],
  6: [
    F('s01', '파도 정어리', 'c', [12, 22], { shape: 'fish', c1: '#6A8AA8', c2: '#E8F0F6', c3: '#2E4A6A', pat: 'line' }, '큰 파도를 타고 떼 지어 몰려와요.'),
    F('s02', '회색 숭어', 'c', [30, 60], { shape: 'fish', c1: '#8A949E', c2: '#EEF0F2', c3: '#5A646E', pat: 'none' }, '파도 사이로 폴짝폴짝 뛰어오르는 숭어.'),
    F('s03', '거품 해파리', 'c', [10, 25], { shape: 'jelly', c1: '#C8D8E8', c2: '#F6FAFF', c3: '#8AA8C8', pat: 'clear' }, '파도 거품처럼 하얗고 투명해요.'),
    F('s04', '갯바위 돌돔', 'c', [20, 40], { shape: 'tall', c1: '#3A4048', c2: '#C8CCD0', c3: '#E8E8E8', pat: 'bars' }, '거센 파도에도 갯바위에 꼭 붙어 있어요.'),
    F('s05', '먹구름 오징어', 'u', [30, 60], { shape: 'squid', c1: '#4A4E5E', c2: '#A8ACB8', c3: '#2A2E3A', pat: 'blotch' }, '먹물을 먹구름처럼 뿜고 달아나요.'),
    F('s06', '번개 방어', 'u', [50, 100], { shape: 'fish', c1: '#3E6A9A', c2: '#E6EEF8', c3: '#F2E23A', pat: 'zigzag' }, '옆구리에 번개 모양 노란 줄이 있어요.'),
    F('s07', '회오리 쥐치', 'u', [20, 35], { shape: 'tall', c1: '#6A7A8A', c2: '#D8E0E8', c3: '#F2C23A', pat: 'rings' }, '빙글빙글 돌면서 헤엄쳐서 어지러워요.'),
    F('s08', '천둥 곰치', 'r', [100, 180], { shape: 'long', c1: '#5A6A4A', c2: '#C8D2B8', c3: '#F2E23A', pat: 'spots', teeth: true }, '천둥이 치면 바위 구멍에서 고개를 내밀어요.'),
    F('s09', '폭풍 가오리', 'r', [100, 200], { shape: 'flat', c1: '#3A4A5A', c2: '#D2DAE2', c3: '#F2E23A', pat: 'stars' }, '폭풍 속에서도 미끄러지듯 날아요.'),
    F('s10', '비바람 참치', 'r', [100, 200], { shape: 'fish', c1: '#2E4E7A', c2: '#E2EAF2', c3: '#F2D23A', pat: 'line' }, '비바람을 뚫고 달리는 힘센 참치.'),
    F('s11', '번개 청새치', 'e', [200, 350], { shape: 'sword', c1: '#3A5AA8', c2: '#E2EAF8', c3: '#F2E23A', pat: 'bars' }, '번개보다 빠르다는 소문의 청새치.'),
    F('s12', '폭풍 망치상어', 'e', [250, 400], { shape: 'shark', c1: '#6A7A88', c2: '#E8EEF2', c3: '#3A4A5A', pat: 'none' }, '폭풍이 오면 수면 가까이 올라오는 커다란 상어.'),
    F('s14', '폭풍 대왕오징어', 'e', [80, 150], { shape: 'squid', c1: '#8A3A4A', c2: '#E8B8C0', c3: '#4A1E2A', pat: 'spots' }, '오징어 살로만 꾀어낼 수 있다는 거대한 오징어.', { bait: ['bait6'] }),
    F('s15', '번개 먹보 고래', 'e', [300, 500], { shape: 'whale', c1: '#3A4A8A', c2: '#D8E2FA', c3: '#FFE84A', pat: 'zigzag' }, '번개를 꿀꺽 삼키며 사는 작은 고래. 번쩍이는 순간에만 입을 벌려요.', { hidden: true, secret: { lightning: true } }),
    F('s13', '뇌신 청새치', 'boss', [400, 600], { shape: 'sword', c1: '#2A3A8A', c2: '#D8E2FA', c3: '#FFE84A', pat: 'zigzag', big: true }, '번개를 부르는 긴 창. 폭풍의 바다를 다스리는 왕이에요.'),
  ],
  7: [
    F('a01', '기둥 자리돔', 'c', [8, 15], { shape: 'fish', c1: '#5AB8C8', c2: '#E8F8FA', c3: '#F2E2A0', pat: 'bands' }, '무너진 기둥 사이를 집 삼아 살아요.'),
    F('a02', '모래 볼락', 'c', [15, 30], { shape: 'tall', c1: '#C8B48A', c2: '#F2E8D2', c3: '#8A7A5A', pat: 'blotch', spiky: true }, '옛 돌길과 똑같은 색이라 찾기 어려워요.'),
    F('a03', '이끼 망둥이', 'c', [8, 16], { shape: 'long', c1: '#6A9A5A', c2: '#D8E8C8', c3: '#3A5A3A', pat: 'spots', stub: true }, '이끼 낀 계단에서 낮잠을 자요.'),
    F('a04', '석상 게', 'c', [10, 20], { shape: 'crab', c1: '#9A9A8E', c2: '#D8D8CE', c3: '#6A6A60' }, '가만히 있으면 작은 돌 조각상 같아요.'),
    F('a05', '금화 잉어', 'u', [30, 60], { shape: 'fish', c1: '#E8B83A', c2: '#FFF0B8', c3: '#C88A1A', pat: 'gold', whisker: true }, '비늘이 옛 금화처럼 반짝이는 잉어.'),
    F('a06', '비취 해마', 'u', [12, 24], { shape: 'horse', c1: '#3AB89A', c2: '#C8F2E2', c3: '#F2E27A', pat: 'dots' }, '비취 조각처럼 맑은 초록 해마.'),
    F('a07', '유적 앵무고기', 'u', [30, 60], { shape: 'fish', c1: '#8A6AD8', c2: '#E8E0FF', c3: '#F2A2C8', pat: 'scale', beak: true }, '옛 벽화의 그림을 갉아 먹어서 혼나요.'),
    F('a08', '고대 투구게', 'r', [30, 60], { shape: 'crab', c1: '#6A5A3A', c2: '#C8B89A', c3: '#3A2E1E' }, '아주 먼 옛날부터 모습이 그대로인 게.'),
    F('a09', '신전 해파리', 'r', [20, 45], { shape: 'jelly', c1: '#7AE2E8', c2: '#E8FAFF', c3: '#F2F27A', pat: 'glow' }, '신전 천장에 매달린 등불처럼 빛나요.'),
    F('a10', '상형문자 가오리', 'r', [80, 160], { shape: 'flat', c1: '#6A5A4A', c2: '#E2D6C2', c3: '#2E2420', pat: 'rings' }, '등에 옛 글자 같은 무늬가 새겨져 있어요.'),
    F('a11', '황금 용머리고기', 'e', [40, 80], { shape: 'tall', c1: '#F2C23A', c2: '#FFF2C8', c3: '#C83A2A', pat: 'gold', frill: true }, '머리가 용을 닮은 황금빛 물고기.'),
    F('a12', '수호자 곰치', 'e', [150, 260], { shape: 'long', c1: '#3A5A6A', c2: '#A8C2CA', c3: '#F2E27A', pat: 'glowline', teeth: true }, '신전 문을 지키는 커다란 곰치.'),
    F('a14', '유리 해마', 'e', [14, 28], { shape: 'horse', c1: '#C8EEF2', c2: '#FFFFFF', c3: '#9AF2FF', pat: 'clear' }, '투명해서 보이지 않아요. 야광 루어 빛에만 모습이 드러나요.', { bait: ['bait7'] }),
    F('a15', '고대 태엽 물고기', 'e', [40, 70], { shape: 'fish', c1: '#C8A23A', c2: '#F2E2B8', c3: '#5AB8A8', pat: 'gold', windup: true }, '천 년째 태엽이 돌아가는 물고기. 옛 도시의 보물을 알아봐요.', { hidden: true, secret: { wearAny: ['hat9', 'acc8'] } }),
    F('a13', '해룡 수호신', 'boss', [300, 450], { shape: 'horse', c1: '#2A8A7A', c2: '#C8F2E2', c3: '#F2C23A', pat: 'gold', big: true }, '가라앉은 도시를 천 년 동안 지켜 온 거대한 해룡.'),
  ],
  8: [
    F('k01', '무지개 송사리', 'c', [6, 12], { shape: 'fish', c1: '#F28AB8', c2: '#FFF0F6', c3: '#7AC8F2', pat: 'rainbow' }, '용궁 앞마당을 떼 지어 노니는 꼬마들.'),
    F('k02', '분홍 산호돔', 'c', [15, 30], { shape: 'tall', c1: '#F2A2C2', c2: '#FFE8F2', c3: '#C85A8A', pat: 'dots' }, '분홍 산호 정원을 가꾸는 도미.'),
    F('k03', '금빛 망둥이', 'c', [8, 16], { shape: 'long', c1: '#F2C23A', c2: '#FFF0C8', c3: '#C88A1A', pat: 'spots', stub: true }, '용궁 계단을 금빛으로 반짝이며 뛰어다녀요.'),
    F('k04', '진주 게', 'c', [10, 20], { shape: 'crab', c1: '#F2E8F2', c2: '#FFFFFF', c3: '#C8A8D8' }, '등딱지가 진주처럼 은은하게 빛나요.'),
    F('k05', '거북 복어', 'u', [20, 40], { shape: 'round', c1: '#6AA85A', c2: '#E2F2C8', c3: '#3A6A3A', pat: 'rings' }, '등 무늬가 거북 등딱지 같은 복어. 용궁 심부름꾼이래요.'),
    F('k06', '용궁 시녀고기', 'u', [25, 45], { shape: 'fish', c1: '#E85A8A', c2: '#FFE0EA', c3: '#F2C23A', pat: 'scale', frill: true }, '비단 지느러미를 나풀거리는 우아한 물고기.'),
    F('k07', '칠색 해마', 'u', [12, 24], { shape: 'horse', c1: '#B88AE8', c2: '#F2E8FF', c3: '#F2E27A', pat: 'rainbow' }, '일곱 빛깔로 몸 색이 바뀌는 해마.'),
    F('k08', '비단 잉어', 'r', [50, 90], { shape: 'fish', c1: '#F2F2F2', c2: '#FFFFFF', c3: '#E8303A', pat: 'blotch', whisker: true }, '하얀 몸에 붉은 무늬. 용왕이 아끼는 잉어예요.'),
    F('k09', '연꽃 해파리', 'r', [25, 50], { shape: 'jelly', c1: '#F2A2D2', c2: '#FFF0FA', c3: '#FFE27A', pat: 'glow' }, '연꽃처럼 피었다 오므렸다 하며 떠다녀요.'),
    F('k10', '여의주 아귀', 'r', [30, 60], { shape: 'angler', c1: '#5A3A8A', c2: '#B89AE8', c3: '#9AF2FF', pat: 'none', teeth: true }, '머리 위 구슬을 여의주라고 우기는 아귀.'),
    F('k11', '청룡 장어', 'e', [180, 300], { shape: 'long', c1: '#3AA8C8', c2: '#D2F2FA', c3: '#F2E27A', pat: 'glowline' }, '푸른 용처럼 길고 늠름한 장어.'),
    F('k12', '백호 상어', 'e', [250, 400], { shape: 'shark', c1: '#F2F2EE', c2: '#FFFFFF', c3: '#2E2E34', pat: 'bars', teeth: true }, '하얀 몸에 검은 줄무늬. 바다의 호랑이예요.'),
    F('k14', '봉황 금붕어', 'e', [30, 60], { shape: 'fish', c1: '#F2A23A', c2: '#FFF0C8', c3: '#E8303A', pat: 'gold', frill: true }, '용궁 구슬을 따라 나타난다는 전설의 금붕어.', { bait: ['bait9'] }),
    F('k15', '태엽 장난감 용', 'e', [80, 140], { shape: 'long', c1: '#E8303A', c2: '#FFE0C8', c3: '#F2C23A', pat: 'gold', whisker: true, windup: true }, '용왕이 어릴 때 갖고 놀던 태엽 용. 용궁 구슬을 보면 따라 나와요.', { hidden: true, secret: { bait: 'bait9', perfect: true } }),
    F('k13', '용왕', 'boss', [500, 800], { shape: 'long', c1: '#2A6AB8', c2: '#D8ECFA', c3: '#F2C23A', pat: 'gold', big: true, whisker: true, teeth: true }, '용궁의 주인. 수염 한 올만 움직여도 바다 전체가 출렁여요.'),
  ],
  9: [
    F('t01', '블록 피라미', 'c', [6, 12], { shape: 'fish', c1: '#E8545A', c2: '#FFE0D8', c3: '#3A8AE8', pat: 'bars' }, '빨강 파랑 블록을 이어 붙여 만든 피라미.'),
    F('t02', '고무 오리', 'c', [8, 16], { shape: 'duck', c1: '#F2D23A', c2: '#FFF4B8', c3: '#F2803A', pat: 'none' }, '물고기는 아니지만 늘 낚여 올라와요. 누르면 삑!'),
    F('t03', '구슬 해파리', 'c', [10, 22], { shape: 'jelly', c1: '#7AD2F2', c2: '#E8FAFF', c3: '#F27AB8', pat: 'glow' }, '유리구슬처럼 동글동글한 해파리.'),
    F('t04', '태엽 게', 'c', [8, 16], { shape: 'crab', c1: '#5AB86A', c2: '#D8F2D2', c3: '#F2C23A', windup: true }, '태엽을 감으면 옆으로 종종종 걸어요.'),
    F('t05', '종이배 가오리', 'u', [40, 80], { shape: 'flat', c1: '#F4F2EE', c2: '#FFFFFF', c3: '#7AB8F2', pat: 'rings' }, '접은 종이처럼 각진 가오리. 젖어도 멀쩡해요.'),
    F('t06', '오뚝이 복어', 'u', [15, 30], { shape: 'round', c1: '#E8545A', c2: '#FFF0E8', c3: '#F2C23A', pat: 'dots' }, '아무리 밀어도 다시 똑바로 서는 복어.'),
    F('t07', '크레파스 놀래기', 'u', [15, 30], { shape: 'fish', c1: '#8AD26A', c2: '#FFF6E0', c3: '#F27A5A', pat: 'rainbow' }, '크레파스로 칠한 듯 삐뚤빼뚤한 무늬.'),
    F('t08', '나무 블록 상어', 'r', [120, 220], { shape: 'shark', c1: '#C89A5A', c2: '#F2DEB8', c3: '#8A5A2A', pat: 'blotch' }, '나무 블록을 깎아 만든 상어. 나무 결이 그대로 보여요.'),
    F('t09', '팽이 해마', 'r', [12, 24], { shape: 'horse', c1: '#F27AB8', c2: '#FFE8F4', c3: '#7AD2F2', pat: 'rainbow' }, '꼬리로 팽이처럼 빙글빙글 돌아요.'),
    F('t10', '로봇 오징어', 'r', [30, 60], { shape: 'squid', c1: '#A8B2C2', c2: '#E8ECF2', c3: '#F2545A', pat: 'dots' }, '삐빅. 다리 여덟 개가 모두 태엽으로 움직여요.'),
    F('t11', '태엽 고래', 'e', [200, 350], { shape: 'whale', c1: '#5A8AE8', c2: '#E8F2FF', c3: '#F2C23A', pat: 'none', windup: true }, '등의 태엽이 멈추면 잠들어 버리는 작은 고래.'),
    F('t12', '인형 금붕어', 'e', [20, 40], { shape: 'fish', c1: '#F28A5A', c2: '#FFF0E0', c3: '#F2E2F2', pat: 'scale', frill: true }, '단추 눈이 달린 천 인형 금붕어. 누군가 오래 안고 잤대요.'),
    F('t13', '장난감 대왕 고래', 'boss', [600, 900], { shape: 'whale', c1: '#3A6AD8', c2: '#E8F2FF', c3: '#F2C23A', pat: 'gold', big: true, windup: true }, '장난감 상자 바다의 왕. 등의 커다란 태엽이 돌아가는 한 바다는 멈추지 않아요.'),
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
// stats: far 멀리 던지기(던지기 막대의 가운데 구간이 넓어지고, 잘 던질수록 드문 물고기가 더 와요)
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
  I('rod10', 'rod', '연습용 짧은 낚싯대', { pow: 12, crit: 0.06, far: 0.03 }, { shop: 150, desc: '짧아서 다루기 쉬운 연습용 낚싯대.', color: '#7AC27A' }),
  I('rod11', 'rod', '용암 낚싯대', { pow: 78, crit: 0.15, far: 0.14 }, { drop: true, desc: '마그마 군주의 비늘로 감싼 뜨거운 낚싯대.', color: '#E8502A' }),
  I('rod12', 'rod', '폭풍 작살대', { pow: 92, crit: 0.12, far: 0.12 }, { shop: 60000, desc: '폭풍 속 어부들이 쓰는 묵직한 낚싯대.', color: '#4A5A6A' }),
  I('rod13', 'rod', '번개 낚싯대', { pow: 112, crit: 0.2, far: 0.16 }, { drop: true, desc: '끝에서 찌릿찌릿 번개가 튀는 낚싯대.', color: '#F2E23A' }),
  I('rod14', 'rod', '고대 산호 지팡이', { pow: 140, crit: 0.18, luck: 0.08, far: 0.16 }, { drop: true, desc: '옛 도시의 신관이 쓰던 산호 지팡이.', color: '#F27A8A' }),
  I('rod15', 'rod', '미스릴 낚싯대', { pow: 150, crit: 0.14, far: 0.15 }, { shop: 150000, desc: '가볍고 절대 휘지 않는 은빛 금속 낚싯대.', color: '#C8E2F2' }),
  I('rod16', 'rod', '별빛 낚싯대', { pow: 125, crit: 0.16, coin: 0.1, far: 0.18 }, { set: true, desc: '도감 세트 보상. 밤하늘을 담은 낚싯대.', color: '#5A4AC8' }),
  I('rod18', 'rod', '태엽 낚싯대', { pow: 200, crit: 0.25, luck: 0.12, far: 0.22 }, { drop: true, desc: '장난감 대왕 고래의 태엽으로 만든 낚싯대. 감을수록 힘이 세져요.', color: '#F2C23A' }),
  I('rod17', 'rod', '용왕의 여의봉', { pow: 185, crit: 0.22, luck: 0.1, far: 0.2 }, { drop: true, desc: '용왕이 지니던 신비한 막대. 마음대로 늘었다 줄었다 해요.', color: '#E8303A' }),
  // 줄
  I('line1', 'line', '무명실', { heart: 3, time: 20 }, { start: true, desc: '집에 있던 실. 금방 끊어질 것 같아요.', color: '#E8E2D2' }),
  I('line2', 'line', '나일론 줄', { heart: 4, time: 22 }, { shop: 500, desc: '흔히 쓰는 투명한 낚싯줄.', color: '#CFE6F2' }),
  I('line3', 'line', '합사 줄', { heart: 5, time: 24, far: 0.05 }, { shop: 2000, desc: '여러 가닥을 꼬아 만든 튼튼한 줄.', color: '#7AC27A' }),
  I('line4', 'line', '강철 와이어', { heart: 6, time: 26, pow: 3, far: 0.05 }, { shop: 8000, desc: '이빨 센 물고기도 못 끊는 금속 줄.', color: '#9AA6B2' }),
  I('line5', 'line', '인어 머리카락 줄', { heart: 7, time: 30, slow: 0.05, far: 0.08 }, { drop: true, desc: '물속에서 반짝이는 신비한 줄. 물고기가 순해져요.', color: '#B88AE8' }),
  I('line6', 'line', '용암 강선', { heart: 8, time: 28, pow: 6, far: 0.06 }, { shop: 30000, desc: '불에 달궈 두드린 단단한 강철 줄.', color: '#E8803A' }),
  I('line7', 'line', '폭풍 와이어', { heart: 9, time: 32, slow: 0.05, far: 0.06 }, { drop: true, desc: '폭풍에도 끊어지지 않는 전설의 줄.', color: '#6A7A9A' }),
  I('line8', 'line', '용의 수염 줄', { heart: 10, time: 34, slow: 0.08, far: 0.1 }, { drop: true, desc: '용왕의 수염 한 올로 꼰 줄. 물고기가 얌전해져요.', color: '#F2C23A' }),
  // 찌
  I('float1', 'float', '나무 찌', { slow: 0, zone: 0 }, { start: true, desc: '나무를 깎아 만든 찌.', color: '#C8865A' }),
  I('float2', 'float', '깃털 찌', { slow: 0.08, zone: 0.05, far: 0.05 }, { shop: 400, desc: '작은 입질도 잘 보이는 가벼운 찌.', color: '#F2E2C2' }),
  I('float3', 'float', '형광 찌', { slow: 0.12, zone: 0.1, far: 0.08 }, { shop: 1800, desc: '물 위에서 밝게 빛나 타이밍을 잡기 쉬워요.', color: '#C8F25A' }),
  I('float4', 'float', '오뚝이 찌', { slow: 0.18, zone: 0.12, far: 0.06 }, { shop: 7000, desc: '물고기가 당겨도 금방 바로 서는 찌.', color: '#F26A5A' }),
  I('float5', 'float', '달빛 찌', { slow: 0.25, zone: 0.18, luck: 0.05, far: 0.12 }, { drop: true, desc: '심해에서 건진 은은한 달빛 찌.', color: '#E8EEFF' }),
  I('float6', 'float', '화산석 찌', { slow: 0.22, zone: 0.15, far: 0.1 }, { shop: 25000, desc: '가벼운 화산석을 깎아 만든 찌.', color: '#5A4A4A' }),
  I('float7', 'float', '번개 찌', { slow: 0.28, zone: 0.2, crit: 0.04, far: 0.1 }, { drop: true, desc: '입질이 오면 번쩍 빛나는 찌.', color: '#F2E23A' }),
  I('float8', 'float', '여의주 찌', { slow: 0.32, zone: 0.24, luck: 0.08, far: 0.14 }, { drop: true, desc: '용궁의 구슬로 만든 찌. 바다가 잠잠해져요.', color: '#9AF2FF' }),
  // 모자
  I('hat1', 'hat', '밀짚모자', {}, { start: true, desc: '햇빛을 가려 주는 밀짚모자.', color: '#E8C870' }),
  I('hat2', 'hat', '선장 모자', { coin: 0.1, far: 0.03 }, { shop: 1500, desc: '배 위의 주인공은 나. 동전이 더 들어와요.', color: '#2E3A5A' }),
  I('hat3', 'hat', '방울 털모자', { time: 3 }, { shop: 3000, desc: '따뜻해서 오래 버틸 수 있어요.', color: '#E85A5A' }),
  I('hat4', 'hat', '해적 두건', { crit: 0.05 }, { drop: true, desc: '산호초 난파선에서 나온 두건.', color: '#2E2E34' }),
  I('hat5', 'hat', '별 고깔모자', { luck: 0.06 }, { set: true, desc: '도감 세트 보상. 별이 운을 불러요.', color: '#7A6AE0' }),
  I('hat6', 'hat', '바다 왕관', { pow: 5, luck: 0.05 }, { set: true, desc: '네 바다의 보스를 모두 잡은 낚시꾼의 왕관.', color: '#F2C23A' }),
  I('hat7', 'hat', '야구 모자', { far: 0.03 }, { shop: 600, desc: '햇빛 아래서도 멀리 잘 보여요.', color: '#E8545A' }),
  I('hat8', 'hat', '뿔 투구', { pow: 8 }, { drop: true, desc: '폭풍의 바다에서 건진 옛 뱃사람의 투구.', color: '#8A7A6A' }),
  I('hat9', 'hat', '산호 왕관', { luck: 0.06, zone: 0.04 }, { drop: true, desc: '가라앉은 도시 신전에서 나온 산호 왕관.', color: '#F27A8A' }),
  I('hat11', 'hat', '장난감 왕관', { pow: 10, luck: 0.1, coin: 0.1 }, { drop: true, desc: '장난감 상자 바다에서 건진 반짝이 왕관.', color: '#F27AB8' }),
  I('hat10', 'hat', '용왕 투구', { pow: 12, luck: 0.08 }, { set: true, desc: '여덟 바다의 보스를 모두 잡은 낚시꾼의 투구.', color: '#2A6AB8' }),
  // 옷
  I('outfit1', 'outfit', '줄무늬 티셔츠', {}, { start: true, desc: '편한 줄무늬 티셔츠.', color: '#5A9AE0' }),
  I('outfit2', 'outfit', '구명조끼', { heart: 1 }, { shop: 1200, desc: '안전 제일! 한 번 더 버텨요.', color: '#F28A2A' }),
  I('outfit3', 'outfit', '어부 작업복', { pow: 3 }, { shop: 3500, desc: '팔을 쓰기 편한 튼튼한 작업복.', color: '#4E7A5A' }),
  I('outfit4', 'outfit', '잠수 슈트', { time: 3, zone: 0.04 }, { drop: true, desc: '협만의 차가운 물에서도 끄떡없는 슈트.', color: '#2E4E7A' }),
  I('outfit5', 'outfit', '별무늬 망토', { slow: 0.06 }, { set: true, desc: '도감 세트 보상. 물고기가 넋을 놓아요.', color: '#3A3A7A' }),
  I('outfit6', 'outfit', '꽃무늬 셔츠', { coin: 0.08, luck: 0.02 }, { shop: 8000, desc: '화산섬 바닷가에서 산 알록달록 셔츠.', color: '#F26A8A' }),
  I('outfit7', 'outfit', '폭풍 우비', { time: 4, heart: 1 }, { drop: true, desc: '비바람을 막아 주는 노란 우비.', color: '#F2D23A' }),
  I('outfit8', 'outfit', '용궁 비단옷', { pow: 8, slow: 0.06 }, { drop: true, desc: '용궁 시녀고기가 짜 준 비단옷.', color: '#C83A5A' }),
  // 장신구
  I('acc0', 'acc', '없음', {}, { start: true, desc: '', color: '#00000000' }),
  I('acc1', 'acc', '동그란 선글라스', { zone: 0.03 }, { shop: 800, desc: '눈부심 없이 과녁이 잘 보여요.', color: '#2E2E34' }),
  I('acc2', 'acc', '조개 목걸이', { coin: 0.08 }, { drop: true, desc: '산호초 바다에서 건진 조개 목걸이.', color: '#F2D2C2' }),
  I('acc3', 'acc', '네잎 배지', { luck: 0.05 }, { shop: 5000, desc: '행운의 네잎클로버 배지.', color: '#5AC25A' }),
  I('acc4', 'acc', '등불 펜던트', { crit: 0.06 }, { drop: true, desc: '심해 등불 조각으로 만든 펜던트.', color: '#9AF2FF' }),
  I('acc5', 'acc', '물고기 인형', { heart: 1 }, { set: true, desc: '도감 세트 보상. 등에 메는 물고기 인형.', color: '#7AC2F2' }),
  I('acc9', 'acc', '태엽 열쇠', { luck: 0.08, crit: 0.04, far: 0.04 }, { set: true, desc: '도감 세트 보상. 등에 꽂은 커다란 태엽 열쇠.', color: '#F2C23A' }),
  I('acc6', 'acc', '동그란 안경', { zone: 0.02, crit: 0.02 }, { shop: 2000, desc: '작은 입질도 또렷하게 보여요.', color: '#8A8AA8' }),
  I('acc7', 'acc', '빨간 목도리', { time: 2, heart: 1 }, { shop: 4000, desc: '폭풍 속에서도 따뜻해요.', color: '#E8545A' }),
  I('acc8', 'acc', '진주 목걸이', { luck: 0.06, coin: 0.06 }, { drop: true, desc: '옛 도시의 보물 상자에서 나온 진주 목걸이.', color: '#F2E2F2' }),
];
export const ITEM_BY_ID = Object.fromEntries(ITEMS.map(i => [i.id, i]));
export const SLOTS = { rod: '낚싯대', line: '줄', float: '찌', hat: '모자', outfit: '옷', acc: '장신구' };

// 미끼: 던질 때마다 하나씩 써요(맨 바늘은 공짜). w: 등급별 확률 배율 · boss: 보스가 나타날 확률
// shop: false면 상점에 없음(드랍으로만). 어떤 물고기는 정해진 미끼로만 낚여요(물고기의 bait).
export const BAITS = [
  { id: 'bait0', name: '맨 바늘', w: { c: 1.3, u: 0.7, r: 0.4, e: 0.2 }, boss: 0.004, price: 0, desc: '미끼 없이. 작은 물고기만 와요.' },
  { id: 'bait1', name: '지렁이', w: { c: 1, u: 1, r: 1, e: 1 }, boss: 0.012, price: 5, pack: 10, desc: '어떤 물고기든 좋아하는 기본 미끼.' },
  { id: 'bait5', name: '떡밥', w: { c: 1.4, u: 1.1, r: 0.6, e: 0.4 }, boss: 0.008, price: 8, pack: 10, desc: '고소한 떡밥. 떡밥만 먹는 물고기가 있대요.' },
  { id: 'bait2', name: '새우 미끼', w: { c: 0.8, u: 1.3, r: 1.6, e: 1.3 }, boss: 0.02, price: 20, pack: 10, desc: '드문 물고기가 더 잘 와요.' },
  { id: 'bait6', name: '오징어 살', w: { c: 0.7, u: 1.3, r: 1.4, e: 1.6 }, boss: 0.028, price: 45, pack: 10, desc: '냄새가 진해서 큰 물고기가 좋아해요.' },
  { id: 'bait3', name: '반짝 루어', w: { c: 0.5, u: 1.2, r: 2.2, e: 2.6 }, boss: 0.035, price: 60, pack: 5, desc: '반짝반짝, 아주 드문 물고기를 불러요.' },
  { id: 'bait7', name: '야광 루어', w: { c: 0.5, u: 1.0, r: 2.0, e: 2.6 }, boss: 0.04, price: 120, pack: 5, desc: '어둠 속에서 빛나요. 빛을 좋아하는 물고기가 따라와요.' },
  { id: 'bait8', name: '불꽃 새우', w: { c: 0.6, u: 1.4, r: 2.0, e: 2.2 }, boss: 0.05, price: 0, shop: false, desc: '화산섬에서만 잡히는 매콤한 새우. 드랍으로 얻어요.' },
  { id: 'bait4', name: '황금 미끼', w: { c: 0.6, u: 1.0, r: 1.5, e: 2.0 }, boss: 0.22, price: 1500, pack: 1, desc: '보스가 아주 잘 나타나는 반짝이는 황금 미끼.' },
  { id: 'bait9', name: '용궁 구슬', w: { c: 0.4, u: 1.0, r: 2.4, e: 3.2 }, boss: 0.12, price: 0, shop: false, desc: '용궁 바다의 신비한 구슬. 전설의 물고기를 불러요. 드랍으로 얻어요.' },
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
  { stage: 5, item: 'bait8', n: 3, chance: 0.07 },
  { stage: 5, item: 'bait4', n: 1, chance: 0.016 },
  { stage: 5, item: 'rod11', n: 1, chance: 0.002 },
  { stage: 5, boss: true, item: 'rod11', n: 1, chance: 0.15 },
  { stage: 5, boss: true, item: 'bait8', n: 5, chance: 1.0 },
  { stage: 6, item: 'hat8', n: 1, chance: 0.005 },
  { stage: 6, item: 'outfit7', n: 1, chance: 0.006 },
  { stage: 6, item: 'line7', n: 1, chance: 0.003 },
  { stage: 6, item: 'bait4', n: 1, chance: 0.016 },
  { stage: 6, boss: true, item: 'rod13', n: 1, chance: 0.12 },
  { stage: 6, boss: true, item: 'float7', n: 1, chance: 0.15 },
  { stage: 6, boss: true, item: 'line7', n: 1, chance: 0.1 },
  { stage: 7, item: 'acc8', n: 1, chance: 0.006 },
  { stage: 7, item: 'hat9', n: 1, chance: 0.005 },
  { stage: 7, item: 'bait9', n: 1, chance: 0.02 },
  { stage: 7, item: 'bait4', n: 1, chance: 0.018 },
  { stage: 7, boss: true, item: 'rod14', n: 1, chance: 0.12 },
  { stage: 7, boss: true, item: 'bait9', n: 3, chance: 1.0 },
  { stage: 8, item: 'outfit8', n: 1, chance: 0.005 },
  { stage: 8, item: 'bait9', n: 1, chance: 0.04 },
  { stage: 8, item: 'bait4', n: 1, chance: 0.02 },
  { stage: 8, boss: true, item: 'rod17', n: 1, chance: 0.08 },
  { stage: 8, boss: true, item: 'line8', n: 1, chance: 0.12 },
  { stage: 8, boss: true, item: 'float8', n: 1, chance: 0.12 },
  { stage: 9, item: 'hat11', n: 1, chance: 0.004 },
  { stage: 9, item: 'bait9', n: 1, chance: 0.05 },
  { stage: 9, boss: true, item: 'rod18', n: 1, chance: 0.12 },
  { stage: 9, boss: true, item: 'hat11', n: 1, chance: 0.1 },
];

// ---------------------------------------------------------------- 도감 세트
const ids = (st, tiers) => FISH.filter(f => f.stage === st && !f.hidden && tiers.includes(f.tier)).map(f => f.id);
export const SETS = [
  { id: 'set_p1', name: '선착장 단골', fish: ids(1, ['c', 'u']), reward: { coins: 1000, items: { bait4: 1 } } },
  { id: 'set_p2', name: '선착장 박사', fish: ids(1, ['c', 'u', 'r', 'e', 'boss']), reward: { coins: 3000, items: { hat5: 1 } } },
  { id: 'set_r1', name: '산호초 친구들', fish: ids(2, ['c', 'u']), reward: { coins: 2500, items: { bait3: 5 } } },
  { id: 'set_r2', name: '산호초 박사', fish: ids(2, ['c', 'u', 'r', 'e', 'boss']), reward: { coins: 6000, items: { outfit5: 1 } } },
  { id: 'set_f1', name: '안개 속 친구들', fish: ids(3, ['c', 'u']), reward: { coins: 5000, items: { bait4: 2 } } },
  { id: 'set_f2', name: '협만 박사', fish: ids(3, ['c', 'u', 'r', 'e', 'boss']), reward: { coins: 12000, items: { acc5: 1 } } },
  { id: 'set_d1', name: '깊은 바다 친구들', fish: ids(4, ['c', 'u']), reward: { coins: 9000, items: { bait4: 3 } } },
  { id: 'set_d2', name: '심해 박사', fish: ids(4, ['c', 'u', 'r', 'e', 'boss']), reward: { coins: 20000, items: { bait4: 5 } } },
  { id: 'set_v1', name: '화산섬 친구들', fish: ids(5, ['c', 'u']), reward: { coins: 14000, items: { bait4: 3 } } },
  { id: 'set_v2', name: '화산섬 박사', fish: ids(5, ['c', 'u', 'r', 'e', 'boss']), reward: { coins: 30000, items: { bait8: 10 } } },
  { id: 'set_s1', name: '폭풍 속 친구들', fish: ids(6, ['c', 'u']), reward: { coins: 20000, items: { bait6: 20 } } },
  { id: 'set_s2', name: '폭풍 박사', fish: ids(6, ['c', 'u', 'r', 'e', 'boss']), reward: { coins: 45000, items: { bait4: 5 } } },
  { id: 'set_a1', name: '옛 도시 친구들', fish: ids(7, ['c', 'u']), reward: { coins: 28000, items: { bait7: 10 } } },
  { id: 'set_a2', name: '옛 도시 박사', fish: ids(7, ['c', 'u', 'r', 'e', 'boss']), reward: { coins: 60000, items: { bait9: 3 } } },
  { id: 'set_k1', name: '용궁 친구들', fish: ids(8, ['c', 'u']), reward: { coins: 40000, items: { bait9: 3 } } },
  { id: 'set_k2', name: '용궁 박사', fish: ids(8, ['c', 'u', 'r', 'e', 'boss']), reward: { coins: 90000, items: { bait4: 10 } } },
  { id: 'set_boss', name: '네 바다의 왕', fish: FISH.filter(f => f.tier === 'boss' && f.stage <= 4).map(f => f.id), reward: { coins: 15000, items: { hat6: 1 } } },
  { id: 'set_t1', name: '장난감 친구들', fish: ids(9, ['c', 'u']), reward: { coins: 60000, items: { bait9: 5 } } },
  { id: 'set_t2', name: '장난감 상자 박사', fish: ids(9, ['c', 'u', 'r', 'e', 'boss']), reward: { coins: 150000, items: { bait4: 20 } } },
  { id: 'set_hidden', name: '숨은 물고기 탐험가', fish: FISH.filter(f => f.hidden).map(f => f.id), reward: { coins: 120000, items: { acc9: 1 } } },
  { id: 'set_boss8', name: '여덟 바다의 왕', fish: FISH.filter(f => f.tier === 'boss' && f.stage <= 8).map(f => f.id), reward: { coins: 100000, items: { hat10: 1 } } },
  { id: 'set_bait', name: '미끼 장인', fish: FISH.filter(f => f.bait).map(f => f.id), reward: { coins: 50000, items: { rod16: 1 } } },
  { id: 'set_round', name: '동글동글', fish: FISH.filter(f => f.look.shape === 'round').map(f => f.id), reward: { coins: 1500, items: { bait2: 10 } } },
  { id: 'set_long', name: '길쭉길쭉', fish: FISH.filter(f => f.look.shape === 'long').map(f => f.id), reward: { coins: 4000, items: { bait3: 5 } } },
  { id: 'set_squishy', name: '말랑말랑', fish: FISH.filter(f => ['squid', 'jelly'].includes(f.look.shape)).map(f => f.id), reward: { coins: 4000, items: { bait4: 1 } } },
  { id: 'set_ss', name: 'SS 수집가', grade: 'SS', count: 3, reward: { coins: 8000, items: { bait4: 2 } } },   // 아무 물고기나 SS 등급 3종
];

// 낚시꾼: 남자·여자 중 하나를 골라요 (Kenney Mini Characters)
export const CHARACTERS = [{ id: 'm', name: '남자 낚시꾼' }, { id: 'f', name: '여자 낚시꾼' }];
// (예전 동물 아바타 — 3D를 못 쓰는 브라우저에서만 그림 대신 씀)
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
// cond: level 레벨 · dex 도감 수 · bosses 잡은 보스 종류 · ss SS 등급 종류 · caught 잡은 수 · nice GREAT 이상 던지기 수 · perfect PERFECT 던지기 수 · special 미끼 전용 물고기 종류 · stage 그 바다 도감 전부
export const TITLES = [
  { id: 't_new', name: '새내기 낚시꾼', cond: { level: 1 }, stats: {}, desc: '처음 낚싯대를 잡았어요.' },
  { id: 't_lv5', name: '바닷바람 친구', cond: { level: 5 }, stats: { time: 1 }, desc: '레벨 5' },
  { id: 't_lv10', name: '능숙한 낚시꾼', cond: { level: 10 }, stats: { pow: 2 }, desc: '레벨 10' },
  { id: 't_lv20', name: '바다의 단골', cond: { level: 20 }, stats: { crit: 0.03 }, desc: '레벨 20' },
  { id: 't_lv30', name: '물결을 읽는 자', cond: { level: 30 }, stats: { slow: 0.04 }, desc: '레벨 30' },
  { id: 't_lv40', name: '전설의 낚시꾼', cond: { level: 40 }, stats: { pow: 6, luck: 0.03 }, desc: '레벨 40' },
  { id: 't_lv50', name: '바다의 주인', cond: { level: 50 }, stats: { pow: 8, luck: 0.05, coin: 0.05 }, desc: '레벨 50' },
  { id: 't_dex10', name: '도감 수집가', cond: { dex: 10 }, stats: { coin: 0.03 }, desc: '도감 10종' },
  { id: 't_dex26', name: '물고기 박사', cond: { dex: 56 }, stats: { luck: 0.03 }, desc: '도감 56종 (절반)' },
  { id: 't_dex52', name: '살아 있는 도감', cond: { dex: 125 }, stats: { luck: 0.06, coin: 0.06 }, desc: '도감 125종 전부 (숨은 바다 포함, 숨은 물고기 빼고)' },
  { id: 't_pier', name: '선착장 지킴이', cond: { stage: 1 }, stats: { heart: 1 }, desc: '햇살 선착장 도감 전부' },
  { id: 't_reef', name: '산호초 탐험가', cond: { stage: 2 }, stats: { zone: 0.04 }, desc: '산호초 바다 도감 전부' },
  { id: 't_fjord', name: '안개 속 사냥꾼', cond: { stage: 3 }, stats: { time: 2 }, desc: '안개 협만 도감 전부' },
  { id: 't_deep', name: '심해의 등불', cond: { stage: 4 }, stats: { far: 0.06 }, desc: '심해 해구 도감 전부' },
  { id: 't_volc', name: '불꽃 낚시꾼', cond: { stage: 5 }, stats: { pow: 4 }, desc: '노을 화산섬 도감 전부' },
  { id: 't_storm', name: '폭풍을 견딘 자', cond: { stage: 6 }, stats: { heart: 1, time: 2 }, desc: '폭풍의 바다 도감 전부' },
  { id: 't_ruins', name: '옛 도시 탐험가', cond: { stage: 7 }, stats: { luck: 0.04 }, desc: '가라앉은 옛 도시 도감 전부' },
  { id: 't_palace', name: '용궁의 손님', cond: { stage: 8 }, stats: { slow: 0.05, zone: 0.04 }, desc: '용궁 바다 도감 전부' },
  { id: 't_boss1', name: '보스 사냥꾼', cond: { bosses: 1 }, stats: { pow: 1 }, desc: '보스 1마리' },
  { id: 't_boss4', name: '네 바다의 왕', cond: { bosses: 4 }, stats: { pow: 4, crit: 0.03 }, desc: '보스 4종' },
  { id: 't_boss8', name: '여덟 바다의 왕', cond: { bosses: 8 }, stats: { pow: 10, crit: 0.05 }, desc: '보스 8종 모두' },
  { id: 't_bait', name: '미끼 박사', cond: { special: 4 }, stats: { luck: 0.04 }, desc: '정해진 미끼로만 낚이는 물고기 4종' },
  { id: 't_secret1', name: '호기심 많은 낚시꾼', cond: { secret: 1 }, stats: { luck: 0.02 }, desc: '숨은 물고기 1종' },
  { id: 't_secret8', name: '바다의 비밀을 아는 자', cond: { secret: 8 }, stats: { luck: 0.06, far: 0.05 }, desc: '숨은 물고기 8종 모두' },
  { id: 't_letters', name: '편지 수집가', cond: { letters: 12 }, stats: { coin: 0.05 }, desc: '유리병 편지 12통' },
  { id: 't_toybox', name: '장난감 상자의 주인', cond: { stage: 9 }, stats: { pow: 12, luck: 0.05 }, desc: '장난감 상자 바다 도감 전부' },
  { id: 't_perfect', name: '한가운데 장인', cond: { perfect: 50 }, stats: { far: 0.06, crit: 0.02 }, desc: '던지기 PERFECT 50번' },
  { id: 't_ss1', name: '대물 사냥꾼', cond: { ss: 1 }, stats: { luck: 0.02 }, desc: 'SS 등급 1종' },
  { id: 't_ss10', name: '월척 장인', cond: { ss: 10 }, stats: { luck: 0.05 }, desc: 'SS 등급 10종' },
  { id: 't_c100', name: '부지런한 손', cond: { caught: 100 }, stats: { coin: 0.04 }, desc: '물고기 100마리' },
  { id: 't_c500', name: '쉬지 않는 낚싯대', cond: { caught: 500 }, stats: { pow: 3 }, desc: '물고기 500마리' },
  { id: 't_nice30', name: '명품 캐스터', cond: { nice: 30 }, stats: { far: 0.05 }, desc: '던지기 GREAT 이상 30번' },
];

// ---------------------------------------------------------------- 유리병 편지
// 낚시하다 가끔 물고기 대신 유리병이 올라와요. 이야기 편지(story) · 숨은 물고기 힌트(hint: 그 바다에서) · 지도 조각(MAP_STAGES 바다, 그 바다 보스를 잡은 뒤).
export const BOTTLE = { chance: 0.045, mapChance: 0.14 };
export const LETTERS = [
  { id: 'l1', kind: 'story', title: '첫 번째 편지', text: '이 편지를 건진 낚시꾼에게. 이 바다의 물고기들이 왜 하나같이 장난감처럼 생겼는지 궁금하지 않나요? 저도 그랬어요. 그래서 편지를 띄워요.' },
  { id: 'l2', kind: 'story', title: '두 번째 편지', text: '옛날에 바닷가 마을에 장난감을 아주 아끼는 아이가 살았대요. 아이에게는 커다란 나무 장난감 상자가 있었어요.' },
  { id: 'l3', kind: 'story', title: '세 번째 편지', text: '어느 폭풍 치던 밤, 이삿짐 배에서 그 장난감 상자가 바다로 떨어졌대요. 상자는 깊이깊이 가라앉았고요.' },
  { id: 'l4', kind: 'story', title: '네 번째 편지', text: '그런데 이상하죠. 상자 속 장난감들이 하나둘 헤엄치기 시작했대요. 블록은 피라미가 되고, 태엽 인형은 고래가 되고요.' },
  { id: 'l5', kind: 'story', title: '다섯 번째 편지', text: '장난감들은 아이를 다시 만나고 싶어서 바다 곳곳으로 퍼져 나갔대요. 그래서 어느 바다에 가도 장난감 물고기가 사는 거예요.' },
  { id: 'l6', kind: 'story', title: '여섯 번째 편지', text: '가장 큰 태엽 고래만은 상자를 지키느라 떠나지 않았대요. 지금도 상자가 있는 바다에서 태엽을 돌리고 있을 거예요.' },
  { id: 'l7', kind: 'story', title: '일곱 번째 편지', text: '상자가 있는 바다로 가는 길은 지도 네 조각에 나뉘어 있어요. 화산섬, 폭풍의 바다, 옛 도시, 용궁 — 그 바다의 주인을 이긴 낚시꾼에게 조각이 떠내려간대요.' },
  { id: 'l8', kind: 'story', title: '마지막 편지', text: '혹시 그 바다에 가게 되면, 태엽 고래에게 전해 주세요. 아이는 어른이 되었지만, 한 번도 장난감들을 잊은 적이 없다고.' },
  { id: 'h1', kind: 'hint', stage: 1, fish: 'p15', title: '선착장에서 건진 쪽지', text: '처음 낚싯대를 잡았던 그 모습 그대로 — 밀짚모자에 대나무 낚싯대 — 한가운데로 던지면, 어디선가 태엽 감는 소리가 들린대요.' },
  { id: 'h2', kind: 'hint', stage: 2, fish: 'r15', title: '산호초에서 건진 쪽지', text: '반짝 루어를 끼우고 세 번 연달아 한가운데(PERFECT)로 던지면, 산호 사이에서 무지개가 움직인대요.' },
  { id: 'h3', kind: 'hint', stage: 3, fish: 'f15', title: '협만에서 건진 쪽지', text: '한밤중(밤 12시부터 새벽 5시 사이) 안개 협만에는 새하얀 그림자가 헤엄친대요. 진짜 시계로요.' },
  { id: 'h4', kind: 'hint', stage: 4, fish: 'd15', title: '해구에서 건진 쪽지', text: '심해에서는 미끼 없이, 맨 바늘로 던져 보래요. 아무것도 바라지 않는 낚시꾼에게만 다가오는 녀석이 있대요.' },
  { id: 'h5', kind: 'hint', stage: 5, fish: 'v15', title: '화산섬에서 건진 쪽지', text: '세 번 망설이고(던졌다가 거두기 세 번), 네 번째에 한가운데로 던지면 넘어지지 않는 녀석이 문대요.' },
  { id: 'h6', kind: 'hint', stage: 6, fish: 's15', title: '폭풍 속에서 건진 쪽지', text: '번개가 번쩍이는 바로 그 순간에 던져 보세요. 번개를 먹고 사는 녀석이 입을 벌린대요.' },
  { id: 'h7', kind: 'hint', stage: 7, fish: 'a15', title: '옛 도시에서 건진 쪽지', text: '옛 도시의 보물(산호 왕관이나 진주 목걸이)을 걸치고 낚시하면, 천 년 된 태엽 물고기가 주인인 줄 알고 다가온대요.' },
  { id: 'h8', kind: 'hint', stage: 8, fish: 'k15', title: '용궁에서 건진 쪽지', text: '용궁 구슬을 끼우고 한가운데로 던지면, 용왕이 어릴 때 갖고 놀던 장난감이 따라 나온대요.' },
];
export const LETTER_BY_ID = Object.fromEntries(LETTERS.map(l => [l.id, l]));
