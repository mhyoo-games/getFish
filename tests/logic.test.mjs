// 규칙 검사: 등급 기준, 싸움(맞히기·놓치기·시간), 처음 장비로 첫 바다 물고기를 잡을 수 있는지, 보스는 좋은 장비가 있어야 하는지
import assert from 'node:assert/strict';
import * as G from '../js/game.js';
import { FISH_BY_ID, STAGES } from '../js/data.js';

let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
assert.equal(G.gradeOf(0.1).g, 'C'); assert.equal(G.gradeOf(0.6).g, 'B'); assert.equal(G.gradeOf(0.8).g, 'A'); assert.equal(G.gradeOf(0.95).g, 'S'); assert.equal(G.gradeOf(0.99).g, 'SS');

// 등급 비율: 행운 0이면 SS 약 3%
let ss = 0; for (let i = 0; i < 20000; i++) if (G.rollSize(FISH_BY_ID.p01, 0, rnd).grade.g === 'SS') ss++;
assert.ok(ss / 20000 > 0.02 && ss / 20000 < 0.04, 'SS 비율 ' + ss / 20000);

// 자동 낚시꾼: 표시가 과녁 가운데 근처(반응 오차 있음)일 때 누름
function play(save, fishId, skill = 0.9, tries = 200) {
  const st = G.stats(save); let win = 0;
  for (let k = 0; k < tries; k++) {
    const f = FISH_BY_ID[fishId], roll = G.rollSize(f, st.luck, rnd), b = G.newBattle(f, roll, st, rnd); let cd = 0;
    while (!b.done) {
      G.stepBattle(b, 1 / 60, rnd); cd -= 1 / 60;
      const near = b.targets.some(t => t.wait <= 0 && Math.abs(t.x - b.x) < b.w * skill);
      if (near && cd <= 0) { if (rnd() < 0.08) { b.x += b.w * 1.5 * (rnd() < 0.5 ? -1 : 1); } G.hit(b, rnd); cd = 0.45; }
    }
    if (b.done === 'caught') win++;
  }
  return win / tries;
}
const s = G.newSave();
assert.ok(play(s, 'p01') > 0.9, '처음 장비로 흔한 물고기는 거의 잡혀요');
const pBossStart = play(s, 'p13');
assert.ok(pBossStart < 0.6, '처음 장비로 첫 보스는 어려워요 ' + pBossStart);
const s2 = G.newSave(); Object.assign(s2.items, { rod3: 1, line3: 1, float3: 1 }); Object.assign(s2.eq, { rod: 'rod3', line: 'line3', float: 'float3' });
assert.ok(play(s2, 'p13') > 0.6, '카본 낚싯대·합사·형광찌면 첫 보스를 잡을 수 있어요');
const s4 = G.newSave(); Object.assign(s4.items, { rod8: 1, line5: 1, float5: 1 }); Object.assign(s4.eq, { rod: 'rod8', line: 'line5', float: 'float5' });
assert.ok(play(s4, 'd13') > 0.4, '심연 장비면 심해 보스를 잡을 수 있어요');
// 새 바다(5~8): 앞 바다 보스 장비로 그 바다 흔한 물고기는 잡히고, 그 바다 장비로 보스를 잡을 수 있어요
const gearSave = (eq, lv = 1) => { const sv = G.newSave(); for (const v of Object.values(eq)) sv.items[v] = 1; Object.assign(sv.eq, eq); sv.lv = lv; return sv; };
const STEP = [
  ['v', { rod: 'rod8', line: 'line5', float: 'float5' }, { rod: 'rod11', line: 'line6', float: 'float6' }, 25],
  ['s', { rod: 'rod11', line: 'line6', float: 'float6' }, { rod: 'rod13', line: 'line7', float: 'float7' }, 32],
  ['a', { rod: 'rod13', line: 'line7', float: 'float7' }, { rod: 'rod14', line: 'line7', float: 'float7' }, 38],
  ['k', { rod: 'rod14', line: 'line7', float: 'float7' }, { rod: 'rod17', line: 'line8', float: 'float8' }, 45],
];
for (const [p, before, after, lv] of STEP) {
  const c = play(gearSave(before, lv), p + '01'), bossB = play(gearSave(before, lv), p + '13'), bossA = play(gearSave(after, lv), p + '13');
  console.log(`  ${p}: 흔한 ${c.toFixed(2)} · 보스(앞 장비) ${bossB.toFixed(2)} · 보스(이 바다 장비) ${bossA.toFixed(2)}`);
  assert.ok(c > 0.85, p + ' 흔한 물고기'); assert.ok(bossA > 0.45, p + ' 보스는 그 바다 장비로'); assert.ok(bossB < bossA, p + ' 장비가 좋을수록');
}

// 놓치기: 빈 곳 누르면 하트가 줄고, 다 줄면 놓침
{ const st = G.stats(s), b = G.newBattle(FISH_BY_ID.p01, { grade: G.GRADE_BY.C, size: 10 }, st, rnd); b.targets.forEach(t => t.x = 5); for (let i = 0; i < st.heart; i++) G.hit(b, rnd); assert.equal(b.done, 'escape'); }
// 시간 초과
{ const st = G.stats(s), b = G.newBattle(FISH_BY_ID.p01, { grade: G.GRADE_BY.C, size: 10 }, st, rnd); for (let i = 0; i < 60 * 40; i++) G.stepBattle(b, 1 / 60, rnd); assert.equal(b.done, 'escape'); }

// 잡은 뒤: 도감·가방·보스로 다음 바다 열기·세트 보상
{ const sv = G.newSave(); const st = G.stats(sv);
  const r = G.onCatch(sv, FISH_BY_ID.p13, { size: 200, grade: G.GRADE_BY.A }, st, rnd);
  assert.ok(r.newDex && sv.unlocked === 2 && sv.bag.length === 1, '보스를 잡으면 다음 바다');
  for (const f of G.FISH.filter(f => f.stage === 1 && ['c', 'u'].includes(f.tier))) G.onCatch(sv, f, { size: f.size[0], grade: G.GRADE_BY.C }, st, rnd);
  assert.ok(sv.sets.set_p1, '선착장 단골 세트'); assert.ok(sv.items.bait4 >= 1, '세트 보상 받음');
  const before = sv.coins; const got = G.sellBag(sv, 'all', st); assert.ok(got > 0 && sv.coins === before + got && sv.bag.length === 0, '가방 팔기'); }
// 상점
{ const sv = G.newSave(); sv.coins = 1000; assert.ok(G.buy(sv, 'rod2').ok); assert.ok(!G.buy(sv, 'rod2').ok, '같은 장비 두 번'); assert.ok(!G.buy(sv, 'rod4').ok, '드랍 전용'); assert.ok(G.equip(sv, 'rod2') && G.stats(sv).pow === 16); assert.ok(!G.equip(sv, 'bait4'), '없는 미끼');
  sv.coins = 99999; assert.ok(!G.buy(sv, 'bait9').ok, '용궁 구슬은 드랍으로만'); assert.ok(G.buy(sv, 'bait4').ok && G.equip(sv, 'bait4'), '황금 미끼도 그냥 끼워요'); }
// 미끼 뽑기: 루어가 지렁이보다 드문 물고기를 더 잘 불러요
{ const cnt = b => { let n = 0; for (let i = 0; i < 5000; i++) if (['r', 'e'].includes(G.rollFish(2, b, 0, rnd).tier)) n++; return n; }; assert.ok(cnt('bait3') > cnt('bait1') * 1.5);
  // 보스는 미끼마다 다른 확률로 우연히 나타나요
  const st0 = G.stats(G.newSave()), bc = b => { let n = 0; for (let i = 0; i < 20000; i++) if (G.rollFish(3, b, 0, rnd, 0, G.bossChance(b, st0)).tier === 'boss') n++; return n / 20000; };
  const b1 = bc('bait1'), b3 = bc('bait3'), b4 = bc('bait4'); console.log(`  보스 확률: 지렁이 ${b1.toFixed(3)} · 반짝 루어 ${b3.toFixed(3)} · 황금 미끼 ${b4.toFixed(3)}`);
  assert.ok(b1 > 0.005 && b1 < 0.03 && b3 > b1 * 2 && b4 > 0.15, '미끼마다 보스 확률');
  assert.ok(G.bossChance('bait1', st0, G.castResult(0.5, st0)) > G.bossChance('bait1', st0, G.castResult(0.02, st0)), '잘 던지면 보스가 더 와요');
  assert.ok(G.bossChance('bait1', st0, null, 50) > G.bossChance('bait1', st0, null, 0), '오래 못 만나면 조금씩 올라요');
  // 정해진 미끼로만 낚이는 물고기
  const got = b => { const seen = new Set(); for (let i = 0; i < 20000; i++) seen.add(G.rollFish(1, b, 0, rnd).id); return seen; };
  assert.ok(!got('bait1').has('p14') && got('bait5').has('p14'), '떡붕어는 떡밥으로만');
  for (const f of G.FISH.filter(f => f.bait)) assert.ok(f.bait.every(b => G.BAIT_BY_ID[b]), f.name); }
// 던졌다 거두기: 미끼를 돌려받아요
{ const sv = G.newSave(); const n0 = sv.items.bait1, id = G.useBait(sv); assert.equal(sv.items.bait1, n0 - 1); G.refundBait(sv, id); assert.equal(sv.items.bait1, n0); assert.equal(sv.eq.bait, 'bait1');
  const sv2 = G.newSave(); sv2.items.bait1 = 1; const id2 = G.useBait(sv2); assert.equal(sv2.eq.bait, 'bait0'); G.refundBait(sv2, id2); assert.equal(sv2.eq.bait, 'bait1', '마지막 하나도 돌려받으면 다시 끼워요'); }
// 보스는 체력이 줄면 포효하며 빨라져요
{ const st = G.stats(s4), b = G.newBattle(FISH_BY_ID.d13, { grade: G.GRADE_BY.C, size: 300 }, st, rnd); b.hp = b.maxHp * 0.5; G.stepBattle(b, 0.01, rnd); assert.ok(b.events && b.events.includes('roar') && b.phase === 1); }
// 예전 저장 고치기
{ const f = G.fixSave({ coins: 5, eq: { rod: 'nope' }, bag: [{ id: 'zzz' }], animal: 'cat' }); assert.equal(f.eq.rod, 'rod1'); assert.equal(f.bag.length, 0); assert.equal(f.gender, null, '예전 동물 저장은 다시 고르기'); assert.equal(f.animal, undefined);
  assert.equal(G.fixSave({ gender: 'f' }).gender, 'f'); }
console.log('logic ok · 첫 보스(처음 장비) 승률', pBossStart.toFixed(2));
// 참고용 표: 장비별 승률
if (process.env.TABLE) {
  const gear = { 처음: {}, 유리섬유: { rod: 'rod2', line: 'line2', float: 'float2' }, 카본: { rod: 'rod3', line: 'line3', float: 'float3' }, 티타늄: { rod: 'rod5', line: 'line4', float: 'float4' }, 서리: { rod: 'rod7', line: 'line5', float: 'float4' }, 심연: { rod: 'rod8', line: 'line5', float: 'float5' }, 용암: { rod: 'rod11', line: 'line6', float: 'float6' }, 번개: { rod: 'rod13', line: 'line7', float: 'float7' }, 산호: { rod: 'rod14', line: 'line7', float: 'float7' }, 용왕: { rod: 'rod17', line: 'line8', float: 'float8' } };
  for (const [n, eq] of Object.entries(gear)) { const sv = G.newSave(); for (const v of Object.values(eq)) sv.items[v] = 1; Object.assign(sv.eq, eq);
    console.log(n.padEnd(5), ['p13', 'r13', 'f13', 'd01', 'd11', 'd13', 'v01', 'v12', 'v13', 's01', 's12', 's13', 'a01', 'a12', 'a13', 'k01', 'k12', 'k13'].map(id => id + ':' + play(sv, id, 0.8, 60).toFixed(2)).join(' ')); }
}
// 던지기: 가운데에서 멈출수록 좋은 결과. '멀리 던지기' 장비가 가운데 구간을 넓혀요
{ const st0 = G.stats(G.newSave()), mid = G.castResult(0.5, st0), edge = G.castResult(0.02, st0);
  assert.ok(mid.perfect && mid.nice && edge.grade === 'bad' && mid.bonus > edge.bonus && mid.dist > edge.dist && mid.timeBonus > 0);
  assert.equal(G.castResult(0.5 + 0.15 / 2, st0).grade, 'great'); assert.equal(G.castResult(0.5 + 0.4 / 2, st0).grade, 'good');
  const cnt = c => { let n = 0; for (let i = 0; i < 6000; i++) if (['r', 'e'].includes(G.rollFish(1, 'bait1', 0, rnd, c).tier)) n++; return n; };
  assert.ok(cnt(mid.bonus) > cnt(edge.bonus) * 1.3, '가운데로 던지면 드문 물고기가 더 와요');
  const sv = G.newSave(); Object.assign(sv.items, { rod8: 1, float5: 1 }); Object.assign(sv.eq, { rod: 'rod8', float: 'float5' });
  const stF = G.stats(sv), at = 0.5 + 0.09 / 2; assert.ok(G.castResult(at, stF).perfect && !G.castResult(at, st0).perfect, '좋은 장비는 가운데 구간이 넓어요');
  assert.ok(G.castGauge(0) === 0 && Math.abs(G.castGauge(1 / G.castSpeed(1)) - 1) < 1e-9 && G.castSpeed(8) > G.castSpeed(1), '깊은 바다일수록 빨라요');
  // 사람처럼 누르기(반응 오차 ±0.12)면 PERFECT는 가끔, GREAT 이상은 꽤 자주
  let per = 0, gr = 0; for (let i = 0; i < 4000; i++) { const r = G.castResult(0.5 + (rnd() - 0.5) * 0.24, st0); if (r.perfect) per++; if (r.nice) gr++; }
  console.log(`  던지기(보통 솜씨): PERFECT ${(per / 40).toFixed(0)}% · GREAT 이상 ${(gr / 40).toFixed(0)}%`); assert.ok(per / 4000 > 0.1 && per / 4000 < 0.5 && gr / 4000 > 0.5); }
console.log('cast ok');
// 레벨 · 칭호
{ const sv = G.newSave(); const st = G.stats(sv); assert.equal(sv.lv, 1);
  const r = G.onCatch(sv, G.FISH_BY_ID.p13, { size: 200, grade: G.GRADE_BY.S }, st, rnd);
  assert.ok(r.exp > 400 && r.levelUps.length >= 2, '보스 S 등급이면 레벨이 여러 번 올라요 ' + r.exp);
  assert.ok(sv.titles.t_boss1 && r.titles.some(t => t.id === 't_boss1'), '보스 칭호');
  const powBefore = G.stats(sv).pow; sv.title = 't_boss1'; assert.equal(G.stats(sv).pow, powBefore + 1, '단 칭호 효과');
  assert.ok(G.TITLES.some(t => t.cond.dex === G.FISH.length), '도감 전부 칭호는 물고기 수와 같아요');
  let total = 0; for (let l = 1; l < G.LEVEL.max; l++) total += G.LEVEL.need(l); assert.ok(total > 100000, '만렙까지 충분히 길어요 ' + total);
  for (const t of G.TITLES) assert.ok(Object.keys(t.cond).length === 1, t.name);
  assert.equal(G.fixSave({ title: 'nope' }).title, 't_new'); }
console.log('level ok');
