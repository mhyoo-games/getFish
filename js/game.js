// 겟피쉬 규칙 (화면과 상관없는 순수 계산) — tests/logic.test.mjs 에서 그대로 불러 검사해요.
import { STAGES, TIERS, GRADES, FISH, FISH_BY_ID, ITEMS, ITEM_BY_ID, BAITS, BAIT_BY_ID, DROPS, SETS, START, BAG_MAX, LEVEL, TITLES } from './data.js';

export const SAVE_KEY = 'getfish_save_v1';
export const EQ_SLOTS = ['rod', 'line', 'float', 'hat', 'outfit', 'acc'];

// ---------------------------------------------------------------- 저장
export function newSave() {
  return { v: 2, coins: START.coins, items: { ...START.items }, eq: { ...START.eq }, gender: null, stage: 1, unlocked: 1,
    dex: {}, sets: {}, bag: [], stats: { casts: 0, caught: 0, escaped: 0, bosses: 0, coinsEarned: 0, nice: 0, perfect: 0 }, seen: {}, lv: 1, exp: 0, titles: { t_new: 1 }, title: 't_new', calm: 0 };
}
export function fixSave(s) {
  const d = newSave(); if (!s || typeof s !== 'object') return d;
  const o = { ...d, ...s, items: { ...d.items, ...(s.items || {}) }, eq: { ...d.eq, ...(s.eq || {}) }, stats: { ...d.stats, ...(s.stats || {}) } };
  for (const k of EQ_SLOTS) if (!ITEM_BY_ID[o.eq[k]] || !o.items[o.eq[k]]) o.eq[k] = d.eq[k];   // 없어진 장비는 기본으로
  if (!BAIT_BY_ID[o.eq.bait]) o.eq.bait = 'bait0';
  o.titles = { t_new: 1, ...(s.titles || {}) }; if (!TITLE_BY_ID[o.title] || !o.titles[o.title]) o.title = 't_new'; o.lv = Math.max(1, Math.min(LEVEL.max, o.lv | 0)); o.exp = Math.max(0, +o.exp || 0);
  if (o.gender !== 'm' && o.gender !== 'f') o.gender = null;   // 예전(동물) 저장은 처음에 남자·여자를 다시 골라요
  delete o.animal; o.calm = Math.max(0, +o.calm || 0); o.v = 2;
  o.bag = (o.bag || []).filter(b => FISH_BY_ID[b.id]); o.unlocked = Math.max(1, Math.min(STAGES.length, o.unlocked | 0)); o.stage = Math.max(1, Math.min(o.unlocked, o.stage | 0));
  return o;
}

// ---------------------------------------------------------------- 능력치
export function stats(save) {
  const t = { pow: 0, crit: 0, heart: 0, time: 0, slow: 0, zone: 0, luck: 0, coin: 0, far: 0 };
  for (const k of EQ_SLOTS) { const it = ITEM_BY_ID[save.eq[k]]; if (!it) continue; for (const [s, v] of Object.entries(it.stats)) t[s] += v; }
  const tt = TITLE_BY_ID[save.title]; if (tt) for (const [s, v] of Object.entries(tt.stats)) t[s] += v;   // 단 칭호
  t.pow += Math.floor((save.lv || 1) / 2); t.heart += Math.floor((save.lv || 1) / 15);                  // 레벨: 2레벨마다 힘 +1, 15레벨마다 하트 +1
  t.slow = Math.min(0.5, t.slow); t.zone = Math.min(0.6, t.zone); t.crit = Math.min(0.6, t.crit); t.luck = Math.min(0.5, t.luck); t.far = Math.min(0.5, t.far);
  return t;
}
export const STAT_NAMES = { far: '멀리 던지기', pow: '힘', crit: '금빛 과녁', heart: '줄 버팀', time: '시간', slow: '느리게', zone: '과녁 넓게', luck: '행운', coin: '동전' };
export function fmtStat(k, v) { return ['crit', 'slow', 'zone', 'luck', 'coin', 'far'].includes(k) ? `${v >= 0 ? '+' : ''}${Math.round(v * 100)}%` : k === 'time' ? `${v >= 0 ? '+' : ''}${v}초` : `${v >= 0 ? '+' : ''}${v}`; }

// ---------------------------------------------------------------- 던지기 (가운데 맞히기)
// 별이 막대 위를 왔다 갔다 해요. 가운데에서 멈출수록 멀리·정확하게 던져져요 (PERFECT · GREAT · GOOD · 아쉬워요).
// 잘 던질수록 드문 물고기와 보스가 더 오고, 장비의 '멀리 던지기'가 가운데 구간을 넓혀요. 깊은 바다일수록 별이 빨라요.
export const CAST = { speed: 1.25, perStage: 0.05, perfect: 0.07, great: 0.22, good: 0.5 };
export const castSpeed = stage => CAST.speed + (stage - 1) * CAST.perStage;
export function castGauge(t, stage = 1) { const u = (t * castSpeed(stage)) % 2; return u < 1 ? u : 2 - u; }   // 0 → 1 → 0 …
export function castZones(st) { return { perfect: CAST.perfect + st.far * 0.12, great: CAST.great + st.far * 0.22, good: CAST.good + st.far * 0.2 }; }
export function castResult(pos, st) {
  const z = castZones(st), d = Math.min(1, Math.abs(pos - 0.5) * 2);    // 0 = 한가운데, 1 = 끝
  const grade = d <= z.perfect ? 'perfect' : d <= z.great ? 'great' : d <= z.good ? 'good' : 'bad';
  const q = 1 - d, K = { perfect: [1.6, 3, 0.08, 1.6], great: [1.0, 1, 0.04, 1.25], good: [0.45, 0, 0.01, 1], bad: [0.1, 0, 0, 0.7] }[grade];
  const bonus = K[0] * (1 + st.far * 1.5);                              // 드문 물고기 배율에 쓰임
  const dist = Math.round(8 + q * 30 * (1 + st.far) + (grade === 'perfect' ? 8 : 0));
  return { pos, d, grade, nice: grade === 'perfect' || grade === 'great', perfect: grade === 'perfect', bonus: +bonus.toFixed(3), dist, power: q, timeBonus: K[1], luck: K[2], bossK: K[3] };
}

/** 보스가 나타날 확률: 미끼마다 다르고, 잘 던지면·행운이 높으면·오래 못 만났으면 조금씩 올라요 */
export function bossChance(baitId, st, cast = null, calm = 0) {
  const b = BAIT_BY_ID[baitId] || BAITS[0];
  return Math.min(0.6, b.boss * (cast ? cast.bossK : 1) * (1 + st.luck) + Math.min(0.06, calm * 0.0008));
}

// ---------------------------------------------------------------- 물고기 뽑기
/** 이 바다에서 어떤 물고기가 물지. rnd: 0~1 난수 함수 */
export function rollFish(stage, baitId, luck, rnd = Math.random, cast = 0, boss = 0) {
  const bait = BAIT_BY_ID[baitId] || BAITS[0];
  if (boss > 0 && rnd() < boss) return FISH_BY_ID[STAGES[stage - 1].boss];
  // 정해진 미끼로만 낚이는 물고기는 그 미끼일 때만
  const pool = FISH.filter(f => f.stage === stage && f.tier !== 'boss' && (!f.bait || f.bait.includes(bait.id)));
  const castK = { c: 0, u: 0.5, r: 1, e: 1.5 };   // 멀리 던질수록 드문 물고기 쪽으로
  const ws = pool.map(f => TIERS[f.tier].w * (bait.w[f.tier] ?? 1) * (f.tier === 'c' ? 1 : 1 + luck * 2) * (1 + cast * castK[f.tier]));
  let r = rnd() * ws.reduce((a, b) => a + b, 0);
  for (let i = 0; i < pool.length; i++) { r -= ws[i]; if (r <= 0) return pool[i]; }
  return pool[pool.length - 1];
}
/** 크기와 등급: 행운이 높으면 큰 쪽으로 기울어요 */
export function rollSize(fish, luck, rnd = Math.random) {
  const p = Math.pow(rnd(), 1 / (1 + luck * 2.5));
  const size = +(fish.size[0] + (fish.size[1] - fish.size[0]) * p).toFixed(1);
  return { size, p, grade: gradeOf(p) };
}
export function gradeOf(p) { let g = GRADES[0]; for (const x of GRADES) if (p >= x.min) g = x; return g; }
export const GRADE_BY = Object.fromEntries(GRADES.map(g => [g.g, g]));

// ---------------------------------------------------------------- 싸움 (타이밍 맞춰 누르기)
// 줄(레인) 0~1 위에 과녁 몇 개, 물고기 표시가 왔다 갔다 해요. 표시가 과녁 위에 있을 때 누르면 체력이 깎여요.
export const LANE = { targets: 5, baseW: 0.055, baseSpeed: 0.42, perfect: 0.38, respawn: 0.55 };
export function newBattle(fish, roll, st, rnd = Math.random, extraTime = 0) {
  const g = roll.grade, hp = Math.round(fish.hp * g.hp);
  const speed = LANE.baseSpeed * fish.spd * g.spd * (1 - st.slow);
  const b = { fish, roll, hp, maxHp: hp, hearts: Math.max(1, st.heart), maxHearts: Math.max(1, st.heart), time: Math.max(8, st.time + extraTime + (fish.tier === 'boss' ? 10 : 0)), maxTime: 0,
    x: rnd(), dir: rnd() < 0.5 ? -1 : 1, speed, w: LANE.baseW * (1 + st.zone), targets: [], hits: 0, perfects: 0, misses: 0, t: 0, turnT: 1 + rnd() * 2, done: null, st };
  b.maxTime = b.time;
  for (let i = 0; i < LANE.targets; i++) b.targets.push(newTarget(b, i, rnd));
  return b;
}
function newTarget(b, i, rnd) {
  const seg = 1 / LANE.targets, x = (i + 0.2 + rnd() * 0.6) * seg;   // 레인을 고르게 나눠 겹치지 않게
  return { x, gold: rnd() < 0.12 + b.st.crit, wait: 0 };
}
/** 시간이 흐름: 물고기 표시가 움직이고, 가끔 방향을 바꾸고, 화나면 빨라져요 */
export function stepBattle(b, dt, rnd = Math.random) {
  if (b.done) return b;
  b.t += dt; b.time -= dt;
  // 보스는 체력이 60%·30% 아래로 내려가면 포효하며 더 빨라져요 (b.events에 'roar')
  const hpk = b.hp / b.maxHp;
  if (b.fish.tier === 'boss') { const ph = hpk < 0.3 ? 2 : hpk < 0.6 ? 1 : 0; if (ph > (b.phase || 0)) { b.phase = ph; (b.events || (b.events = [])).push('roar'); b.turnT = 0; } }
  const rage = b.fish.tier === 'boss' ? [1, 1.15, 1.32][b.phase || 0] : hpk < 0.3 ? 1.25 : 1;
  b.x += b.dir * b.speed * rage * dt;
  if (b.x > 1) { b.x = 2 - b.x; b.dir = -1; } else if (b.x < 0) { b.x = -b.x; b.dir = 1; }
  b.turnT -= dt;
  if (b.turnT <= 0) {   // 높은 등급일수록 자주 몸부림 (방향 바꾸기)
    const tierTurn = { c: 2.6, u: 2.0, r: 1.6, e: 1.2, boss: 0.9 }[b.fish.tier];
    b.turnT = tierTurn * (0.6 + rnd() * 0.8); if (rnd() < 0.7) b.dir *= -1;
  }
  for (let i = 0; i < b.targets.length; i++) { const t = b.targets[i]; if (t.wait > 0) { t.wait -= dt; if (t.wait <= 0) b.targets[i] = newTarget(b, i, rnd); } }
  if (b.time <= 0) { b.time = 0; b.done = 'escape'; b.why = 'time'; }
  return b;
}
/** 눌렀을 때: 맞힌 과녁·데미지 */
export function hit(b, rnd = Math.random) {
  if (b.done) return { kind: 'none' };
  let best = -1, bd = 1;
  for (let i = 0; i < b.targets.length; i++) { const t = b.targets[i]; if (t.wait > 0) continue; const d = Math.abs(t.x - b.x); if (d <= b.w && d < bd) { bd = d; best = i; } }
  if (best < 0) {
    b.hearts -= 1; b.misses++;
    if (b.hearts <= 0) { b.done = 'escape'; b.why = 'line'; }
    return { kind: 'miss' };
  }
  const t = b.targets[best], perfect = bd <= b.w * LANE.perfect;
  let dmg = b.st.pow * (perfect ? 1.5 : 1) * (t.gold ? 2 : 1) * (0.9 + rnd() * 0.2);
  dmg = Math.max(1, Math.round(dmg));
  b.hp = Math.max(0, b.hp - dmg); b.hits++; if (perfect) b.perfects++;
  t.wait = LANE.respawn;
  if (b.hp <= 0) b.done = 'caught';
  return { kind: perfect ? 'perfect' : 'good', gold: t.gold, dmg, at: t.x };
}

// ---------------------------------------------------------------- 잡은 뒤
export function coinsFor(fish, grade, st) { return Math.round(fish.price * grade.price * (1 + st.coin)); }
/** 잡은 물고기 기록 + 드랍. 바뀐 save와 결과를 돌려줘요 */
export function onCatch(save, fish, roll, st, rnd = Math.random) {
  const res = { fish, roll, newDex: false, newBest: false, drops: [], sets: [], unlocked: null, coins: coinsFor(fish, roll.grade, st) };
  const d = save.dex[fish.id] || (res.newDex = true, { n: 0, max: 0, best: 'C' });
  d.n++; if (roll.size > d.max) { d.max = roll.size; res.newBest = d.n > 1; }
  const gi = g => GRADES.findIndex(x => x.g === g); if (gi(roll.grade.g) > gi(d.best)) d.best = roll.grade.g;
  save.dex[fish.id] = d; save.stats.caught++;
  if (fish.tier === 'boss') save.calm = 0;
  if (fish.tier === 'boss') { save.stats.bosses++; if (fish.stage === save.unlocked && save.unlocked < STAGES.length) { save.unlocked++; res.unlocked = save.unlocked; } }
  // 가방에 넣기 (꽉 차면 바로 팔아요)
  if (save.bag.length < BAG_MAX) save.bag.push({ id: fish.id, size: roll.size, g: roll.grade.g, t: Date.now() });
  else { save.coins += res.coins; save.stats.coinsEarned += res.coins; res.autoSold = true; }
  // 드랍
  for (const dr of DROPS) {
    if (dr.stage !== fish.stage || !!dr.boss !== (fish.tier === 'boss')) continue;
    const ch = dr.boss ? dr.chance * (1 + st.luck) : dr.chance * (1 + st.luck * 3) * (1 + { c: 0, u: 0.3, r: 0.8, e: 1.5 }[fish.tier]);
    if (rnd() < ch) { give(save, dr.item, dr.n); res.drops.push({ item: dr.item, n: dr.n }); }
  }
  res.sets = checkSets(save);
  res.exp = expFor(fish, roll.grade, res.newDex); res.levelUps = addExp(save, res.exp);
  res.titles = checkTitles(save);
  return res;
}
export function give(save, id, n = 1) { save.items[id] = (save.items[id] || 0) + n; }
export function owned(save, id) { return (save.items[id] || 0) > 0; }

/** 새로 채운 도감 세트 → 보상을 주고 목록을 돌려줘요 */
export function checkSets(save) {
  const out = [];
  for (const s of SETS) {
    if (save.sets[s.id]) continue;
    const ok = s.grade ? Object.values(save.dex).filter(d => GRADES.findIndex(x => x.g === d.best) >= GRADES.findIndex(x => x.g === s.grade)).length >= s.count
      : s.fish.every(id => save.dex[id]);
    if (!ok) continue;
    save.sets[s.id] = Date.now(); save.coins += s.reward.coins || 0;
    for (const [id, n] of Object.entries(s.reward.items || {})) give(save, id, n);
    out.push(s);
  }
  return out;
}
export function setProgress(save, s) {
  if (s.grade) return [Math.min(s.count, Object.values(save.dex).filter(d => GRADES.findIndex(x => x.g === d.best) >= GRADES.findIndex(x => x.g === s.grade)).length), s.count];
  return [s.fish.filter(id => save.dex[id]).length, s.fish.length];
}

// ---------------------------------------------------------------- 레벨 · 칭호
export const TITLE_BY_ID = Object.fromEntries(TITLES.map(t => [t.id, t]));
export function expFor(fish, grade, newDex) { return Math.round(LEVEL.exp[fish.tier] * (1 + (fish.stage - 1) * 0.8) * LEVEL.grade[grade.g] + (newDex ? LEVEL.newDex : 0)); }
/** 경험치를 더하고 오른 레벨 목록을 돌려줘요. 레벨이 오르면 동전(레벨 × 100) */
export function addExp(save, n) {
  const ups = []; save.exp += n;
  while (save.lv < LEVEL.max && save.exp >= LEVEL.need(save.lv)) { save.exp -= LEVEL.need(save.lv); save.lv++; save.coins += save.lv * 100; ups.push(save.lv); }
  if (save.lv >= LEVEL.max) save.exp = Math.min(save.exp, LEVEL.need(LEVEL.max));
  return ups;
}
export function titleValue(save, c) {
  const k = Object.keys(c)[0], v = c[k], dexN = Object.keys(save.dex).length;
  const have = k === 'level' ? save.lv : k === 'dex' ? dexN : k === 'bosses' ? FISH.filter(f => f.tier === 'boss' && save.dex[f.id]).length
    : k === 'ss' ? Object.values(save.dex).filter(d => d.best === 'SS').length : k === 'caught' ? save.stats.caught : k === 'nice' ? (save.stats.nice || 0) : k === 'perfect' ? (save.stats.perfect || 0)
    : k === 'special' ? FISH.filter(f => f.bait && save.dex[f.id]).length
    : k === 'stage' ? (FISH.filter(f => f.stage === v).every(f => save.dex[f.id]) ? 1 : 0) : 0;
  return [have, k === 'stage' ? 1 : v];
}
/** 새로 얻은 칭호 목록 */
export function checkTitles(save) {
  const out = [];
  for (const t of TITLES) { if (save.titles[t.id]) continue; const [h, n] = titleValue(save, t.cond); if (h >= n) { save.titles[t.id] = Date.now(); out.push(t); } }
  return out;
}

// ---------------------------------------------------------------- 상점 · 가방
export function buy(save, id) {
  const it = ITEM_BY_ID[id], bait = BAIT_BY_ID[id];
  const price = it ? it.shop : bait && bait.shop !== false ? bait.price : 0;
  if (!price) return { ok: false, why: '팔지 않는 물건이에요' };
  if (it && owned(save, id)) return { ok: false, why: '이미 가지고 있어요' };
  if (save.coins < price) return { ok: false, why: '동전이 모자라요' };
  save.coins -= price; give(save, id, bait ? bait.pack : 1);
  return { ok: true, price };
}
export function sellBag(save, idxs, st) {
  let sum = 0; const keep = [];
  save.bag.forEach((b, i) => { if (idxs === 'all' || idxs.includes(i)) sum += coinsFor(FISH_BY_ID[b.id], GRADE_BY[b.g], st); else keep.push(b); });
  save.bag = keep; save.coins += sum; save.stats.coinsEarned += sum; return sum;
}
export function equip(save, id) {
  const it = ITEM_BY_ID[id]; if (it && owned(save, id)) { save.eq[it.slot] = id; return true; }
  const b = BAIT_BY_ID[id]; if (b && (b.id === 'bait0' || owned(save, id))) { save.eq.bait = id; return true; }
  return false;
}
/** 던질 때 미끼 쓰기. 다 떨어지면 맨 바늘로 */
export function useBait(save) {
  const id = save.eq.bait; if (id === 'bait0') return 'bait0';
  if (!owned(save, id)) { save.eq.bait = 'bait0'; return 'bait0'; }
  save.items[id]--; if (save.items[id] <= 0) { delete save.items[id]; save.eq.bait = 'bait0'; }
  return id;
}
/** 던졌다가 거둘 때: 물고기가 먹지 않은 미끼는 돌려받아요 */
export function refundBait(save, id) { if (!id || id === 'bait0') return; give(save, id, 1); if (save.eq.bait === 'bait0') save.eq.bait = id; }
export function dexCount(save) { return [FISH.filter(f => save.dex[f.id]).length, FISH.length]; }
export { LEVEL, TITLES };
export { STAGES, FISH, FISH_BY_ID, ITEMS, ITEM_BY_ID, BAITS, BAIT_BY_ID, SETS, GRADES, TIERS };
