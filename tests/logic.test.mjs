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
assert.ok(play(s4, 'd13') > 0.4, '최고 장비면 마지막 보스도 잡을 수 있어요');

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
{ const sv = G.newSave(); sv.coins = 1000; assert.ok(G.buy(sv, 'rod2').ok); assert.ok(!G.buy(sv, 'rod2').ok, '같은 장비 두 번'); assert.ok(!G.buy(sv, 'rod4').ok, '드랍 전용'); assert.ok(G.equip(sv, 'rod2') && G.stats(sv).pow === 16); assert.ok(!G.equip(sv, 'bait4')); }
// 미끼 뽑기: 루어가 지렁이보다 드문 물고기를 더 잘 불러요
{ const cnt = b => { let n = 0; for (let i = 0; i < 5000; i++) if (['r', 'e'].includes(G.rollFish(2, b, 0, rnd).tier)) n++; return n; }; assert.ok(cnt('bait3') > cnt('bait1') * 1.5); assert.equal(G.rollFish(3, 'bait4', 0, rnd).id, STAGES[2].boss); }
// 예전 저장 고치기
{ const f = G.fixSave({ coins: 5, eq: { rod: 'nope' }, bag: [{ id: 'zzz' }] }); assert.equal(f.eq.rod, 'rod1'); assert.equal(f.bag.length, 0); }
console.log('logic ok · 첫 보스(처음 장비) 승률', pBossStart.toFixed(2));
// 참고용 표: 장비별 승률
if (process.env.TABLE) {
  const gear = { 처음: {}, 유리섬유: { rod: 'rod2', line: 'line2', float: 'float2' }, 카본: { rod: 'rod3', line: 'line3', float: 'float3' }, 티타늄: { rod: 'rod5', line: 'line4', float: 'float4' }, 서리: { rod: 'rod7', line: 'line5', float: 'float4' }, 심연: { rod: 'rod8', line: 'line5', float: 'float5' } };
  for (const [n, eq] of Object.entries(gear)) { const sv = G.newSave(); for (const v of Object.values(eq)) sv.items[v] = 1; Object.assign(sv.eq, eq);
    console.log(n.padEnd(5), ['p01', 'p11', 'p13', 'r01', 'r12', 'r13', 'f01', 'f12', 'f13', 'd01', 'd11', 'd13'].map(id => id + ':' + play(sv, id, 0.8, 60).toFixed(2)).join(' ')); }
}
