// getFish 화면: 낚시(던지기 → 입질 → 타이밍 싸움 → 결과) + 가방·상점·도감·꾸미기
import * as G from './game.js';
import { STAGES, FISH, FISH_BY_ID, ITEMS, ITEM_BY_ID, BAITS, BAIT_BY_ID, SETS, GRADES, TIERS, ANIMALS, SLOTS, BAG_MAX } from './data.js';
import { drawFish, drawScene, drawAngler, drawAvatarFront, fishSprite } from './draw.js';
import { createSound } from './sound.js';

const $ = id => document.getElementById(id);
const cv = $('view'), ctx = cv.getContext('2d');
const snd = createSound();
let save = load(); let ST = G.stats(save);
let W = 0, H = 0, DPR = 1;
function resize() { DPR = Math.min(2, devicePixelRatio || 1); W = innerWidth; H = innerHeight; cv.width = W * DPR; cv.height = H * DPR; cv.style.width = W + 'px'; cv.style.height = H + 'px'; ctx.setTransform(DPR, 0, 0, DPR, 0, 0); }
addEventListener('resize', resize); resize();

function load() { try { return G.fixSave(JSON.parse(localStorage.getItem(G.SAVE_KEY))); } catch (e) { return G.newSave(); } }
function persist() { try { localStorage.setItem(G.SAVE_KEY, JSON.stringify(save)); } catch (e) { } ST = G.stats(save); hud(); }
const stage = () => STAGES[save.stage - 1];

// ---------------------------------------------------------------- 상태
// idle → cast → wait → bite → fight → (result) → idle
const S = { mode: 'idle', t: 0, modeT: 0, bobX: 0.5, bobY: 0.62, biteAt: 0, fish: null, roll: null, battle: null, fx: [], shake: 0, msgT: 0, bait: null, boss: false };
function setMode(m) { S.mode = m; S.modeT = 0; actButton(); }
function say(text, cls = '', ms = 1400) { const m = $('msg'); m.textContent = text; m.className = cls; m.hidden = false; clearTimeout(say.t); say.t = setTimeout(() => m.hidden = true, ms); }

function act() {
  snd.init();
  if (!$('result').hidden) { closeResult(); return; }
  if (!$('sheet').hidden || !$('intro').hidden) return;
  if (S.mode === 'idle') cast(false);
  else if (S.mode === 'wait') { say('아직이에요… 찌가 쑥 들어갈 때!', 'warn'); }
  else if (S.mode === 'bite') hookFish();
  else if (S.mode === 'fight') strike();
}
function cast(boss) {
  if (boss) { if (!G.owned(save, 'bait4')) { say('황금 미끼가 없어요 (상점·드랍·도감 세트)', 'warn', 2000); return; } save.items.bait4--; if (!save.items.bait4) delete save.items.bait4; S.bait = 'bait4'; }
  else S.bait = G.useBait(save);
  S.boss = boss; save.stats.casts++; persist();
  S.bobX = 0.64 + (Math.random() - 0.5) * 0.1; S.bobY = 0.5 + Math.random() * 0.05;   // 캐릭터에 가리지 않게 오른쪽 앞
  S.biteAt = 1.2 + Math.random() * (boss ? 1.5 : 3.2) * (1 - ST.luck);
  snd.cast(); setMode('cast');
}
function hookFish() {
  S.fish = G.rollFish(save.stage, S.bait, ST.luck); S.roll = G.rollSize(S.fish, ST.luck);
  S.battle = G.newBattle(S.fish, S.roll, ST); snd.hook(); S.shake = 0.4;
  if (S.fish.tier === 'boss') say(`👑 ${S.fish.name} 등장!`, 'boss', 1800); else if (['r', 'e'].includes(S.fish.tier)) say('묵직해요! 큰 녀석이에요', 'good', 1300);
  setMode('fight');
}
function strike() {
  const b = S.battle, r = G.hit(b);
  if (r.kind === 'miss') { snd.miss(); fx('miss', b.x); S.shake = 0.25; }
  else { snd.hit(r.kind, r.gold); fx(r.kind, r.at, r); S.shake = r.gold ? 0.3 : 0.12; }
  if (b.done) endFight();
}
function endFight() {
  const b = S.battle;
  if (b.done === 'caught') {
    const res = G.onCatch(save, S.fish, S.roll, ST); persist(); snd.catch(); setTimeout(() => showResult(res), 450); setMode('landed');
  } else { save.stats.escaped++; persist(); snd.snap(); say(b.why === 'line' ? '줄이 끊어졌어요… 😢' : '시간이 다 돼서 도망갔어요', 'warn', 1800); setMode('idle'); }
}

// ---------------------------------------------------------------- 큰 버튼 · 위아래 줄
function actButton() {
  const T = { idle: ['🎣', '던지기'], cast: ['🎣', '…'], wait: ['⏳', '기다려요'], bite: ['❗', '챔질!'], fight: ['💥', 'HIT!'], landed: ['🐟', '잡았다!'] }[S.mode] || ['🎣', '던지기'];
  $('actIcon').textContent = T[0]; $('actText').textContent = T[1]; $('hintText').textContent = T[1];
  $('btnAct').className = S.mode; $('btnBait').disabled = $('btnBoss').disabled = S.mode !== 'idle';
}
function hud() {
  $('coins').textContent = '🪙 ' + save.coins.toLocaleString();
  $('btnStage').textContent = `🌊 ${stage().name} ▾`;
  const [a, n] = G.dexCount(save); $('dexCount').textContent = `📖 ${a}/${n}`;
  const b = BAIT_BY_ID[save.eq.bait]; $('btnBait').textContent = `${baitIcon(b.id)} ${b.name}${b.price ? ' ×' + (save.items[b.id] || 0) : ''}`;
  $('btnBoss').textContent = `👑 보스 도전 ×${save.items.bait4 || 0}`;
  $('btnSound').textContent = snd.on ? '🔊' : '🔇';
}
const baitIcon = id => ({ bait0: '🪝', bait1: '🪱', bait2: '🦐', bait3: '✨', bait4: '🌟' })[id];

// ---------------------------------------------------------------- 효과 (글자·물보라)
function fx(kind, at, r) { S.fx.push({ kind, at, t: 0, r }); }
function laneRect() { const w = Math.min(W * 0.78, 760), x = (W - w) / 2, y = Math.max(96, H * 0.24); return { x, y, w, h: 26 }; }

// ---------------------------------------------------------------- 그리기
let last = performance.now();
function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min(0.05, (now - last) / 1000); last = now; S.t += dt; S.modeT += dt;
  try { update(dt); render(); } catch (e) { console.error(e); }
}
function update(dt) {
  if (S.mode === 'cast' && S.modeT > 0.7) setMode('wait');
  if (S.mode === 'wait' && S.modeT > S.biteAt) { setMode('bite'); snd.bite(); }
  if (S.mode === 'bite' && S.modeT > 1.0 * (1 + ST.slow * 2)) { say('놓쳤어요! 찌가 들어가면 바로 눌러요', 'warn', 1600); setMode('idle'); }
  if (S.mode === 'fight') { G.stepBattle(S.battle, dt); if (S.battle.done) endFight(); }
  S.fx = S.fx.filter(f => (f.t += dt) < 0.9); S.shake = Math.max(0, S.shake - dt);
}
function render() {
  const st = stage(); ctx.save();
  if (S.shake) ctx.translate((Math.random() - 0.5) * 8 * S.shake, (Math.random() - 0.5) * 6 * S.shake);
  drawScene(ctx, W, H, st, S.t, { shadows: S.mode === 'wait' || S.mode === 'idle' });
  // 찌와 줄
  const s = Math.min(H * 0.36, W * 0.26), ax = W * 0.44, ay = H * 0.97;
  const av = { animal: ANIMALS.find(a => a.id === save.animal) || ANIMALS[0], hat: save.eq.hat, outfit: save.eq.outfit, acc: save.eq.acc, rod: save.eq.rod };
  const pose = S.mode === 'cast' && S.modeT < 0.35 ? 'cast' : S.mode === 'fight' ? 'pull' : 'idle';
  const tip = drawAngler(ctx, ax, ay, s, av, pose, S.t, ITEM_BY_ID);
  if (['cast', 'wait', 'bite', 'fight', 'landed'].includes(S.mode)) {
    let bx = W * S.bobX, by = H * S.bobY;
    if (S.mode === 'cast') { const u = Math.min(1, S.modeT / 0.6); bx = tip.x + (bx - tip.x) * u; by = tip.y + (by - tip.y) * u - Math.sin(u * Math.PI) * H * 0.15; }
    if (S.mode === 'fight') { bx += Math.sin(S.t * 7) * W * 0.02 * (S.battle.x - 0.5) * 4; by += Math.sin(S.t * 13) * 3; }
    const dip = S.mode === 'bite' ? 6 + Math.sin(S.modeT * 30) * 4 : S.mode === 'wait' ? Math.sin(S.t * 3) * 1.5 : 0;
    ctx.strokeStyle = 'rgba(255,255,255,.75)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(tip.x, tip.y); ctx.quadraticCurveTo((tip.x + bx) / 2, Math.max(tip.y, by) - (S.mode === 'fight' ? -20 : 30), bx, by + dip); ctx.stroke();
    const fl = ITEM_BY_ID[save.eq.float];
    if (S.mode !== 'fight') { ctx.fillStyle = fl.color; ctx.strokeStyle = 'rgba(40,30,40,.6)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(bx, by + dip, 6, 9, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#E8545A'; ctx.beginPath(); ctx.ellipse(bx, by + dip - 5, 6, 4, 0, Math.PI, 0); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,.5)'; for (let k = 0; k < 2; k++) { const r = ((S.t * 0.8 + k * 0.5) % 1); ctx.globalAlpha = 1 - r; ctx.beginPath(); ctx.ellipse(bx, by + 8, 10 + r * 26, 3 + r * 6, 0, 0, Math.PI * 2); ctx.stroke(); } ctx.globalAlpha = 1; }
    if (S.mode === 'bite') { ctx.fillStyle = '#fff'; ctx.font = 'bold 44px Galmuri11, sans-serif'; ctx.textAlign = 'center'; ctx.fillText('!', bx, by - 26 - Math.abs(Math.sin(S.modeT * 12)) * 8); splash(bx, by + 6, S.modeT); }
    if (S.mode === 'fight') fightView(bx, by);
  }
  ctx.restore();
}
function splash(x, y, t) { ctx.fillStyle = 'rgba(255,255,255,.8)'; for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI - Math.PI, r = 10 + (t * 40 % 20); ctx.beginPath(); ctx.arc(x + Math.cos(a) * r, y + Math.sin(a) * r * 0.6, 2.5, 0, Math.PI * 2); ctx.fill(); } }
function fightView(bx, by) {
  const b = S.battle, f = b.fish, L = laneRect();
  // 물 위로 뛰어오르는 물고기 (가끔)
  const jump = Math.max(0, Math.sin(S.t * 1.7)) ** 6;
  if (jump > 0.05) { const len = Math.min(220, 60 + f.size[1] * 0.4) * (f.tier === 'boss' ? 1.3 : 1); ctx.save(); ctx.globalAlpha = Math.min(1, jump * 2); drawFish(ctx, f, bx + (b.x - 0.5) * 120, by - jump * H * 0.12, len * (0.5 + 0.5 * S.roll.p), { t: S.t, flip: b.dir < 0, rot: (b.dir < 0 ? 1 : -1) * 0.3 * Math.cos(S.t * 1.7) }); ctx.restore(); splash(bx + (b.x - 0.5) * 120, by + 6, S.t); }
  // 위쪽: 체력·시간
  const hw = Math.min(W * 0.62, 620), hx = (W - hw) / 2, hy = Math.max(60, H * 0.1);
  ctx.fillStyle = 'rgba(20,30,40,.55)'; rr(hx - 4, hy - 4, hw + 8, 26, 13); ctx.fill();
  const pct = b.hp / b.maxHp, g = ctx.createLinearGradient(hx, 0, hx + hw, 0); g.addColorStop(0, pct < 0.3 ? '#F25A4A' : '#6BD04A'); g.addColorStop(1, pct < 0.3 ? '#F2A04A' : '#B8F25A');
  ctx.fillStyle = g; rr(hx, hy, hw * pct, 18, 9); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.font = '13px Galmuri11, sans-serif'; ctx.textAlign = 'left'; ctx.fillText(`${f.name}  ${b.hp}/${b.maxHp}`, hx + 10, hy + 14);
  ctx.textAlign = 'right'; ctx.fillText(`${S.roll.size}cm  ${S.roll.grade.g}`, hx + hw - 10, hy + 14);
  // 시간 원
  const tx = hx + hw + 40, ty = hy + 9; ctx.fillStyle = 'rgba(20,30,40,.55)'; ctx.beginPath(); ctx.arc(tx, ty, 26, 0, 7); ctx.fill();
  ctx.strokeStyle = b.time < 5 ? '#F25A4A' : '#9FE0FF'; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(tx, ty, 22, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * b.time / b.maxTime); ctx.stroke();
  ctx.fillStyle = '#fff'; ctx.font = 'bold 20px Galmuri11, sans-serif'; ctx.textAlign = 'center'; ctx.fillText(Math.ceil(b.time), tx, ty + 7);
  // 하트 (줄 버팀)
  for (let i = 0; i < b.maxHearts; i++) heart(hx + 12 + i * 30, hy + 44, 11, i < b.hearts);
  // 레인
  ctx.fillStyle = 'rgba(10,40,60,.35)'; rr(L.x - 14, L.y - 18, L.w + 28, L.h + 36, 22); ctx.fill();
  for (const t of b.targets) {
    if (t.wait > 0) continue;
    const cx = L.x + t.x * L.w, wpx = b.w * L.w;
    ctx.fillStyle = t.gold ? 'rgba(255,214,80,.95)' : 'rgba(255,255,255,.85)'; ctx.strokeStyle = t.gold ? '#B8860B' : 'rgba(80,140,180,.8)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(cx, L.y + L.h / 2, wpx, L.h * 0.42, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = t.gold ? '#fff' : 'rgba(80,140,180,.6)'; ctx.beginPath(); ctx.ellipse(cx, L.y + L.h / 2, wpx * G.LANE.perfect, L.h * 0.2, 0, 0, Math.PI * 2); ctx.stroke();
  }
  // 물고기 표시
  const mx = L.x + b.x * L.w; drawFish(ctx, f, mx, L.y - 4, 64, { t: S.t, flip: b.dir < 0 });
  ctx.fillStyle = 'rgba(255,255,255,.9)'; ctx.beginPath(); ctx.moveTo(mx, L.y + L.h + 2); ctx.lineTo(mx - 6, L.y + L.h + 12); ctx.lineTo(mx + 6, L.y + L.h + 12); ctx.fill();
  // 글자 효과
  for (const e of S.fx) {
    const x = L.x + e.at * L.w, y = L.y - 30 - e.t * 50; ctx.globalAlpha = 1 - e.t / 0.9; ctx.textAlign = 'center';
    if (e.kind === 'miss') { ctx.fillStyle = '#FF7A6A'; ctx.font = 'bold 22px Galmuri11, sans-serif'; ctx.fillText('MISS', x, y); }
    else { ctx.fillStyle = e.r.gold ? '#FFD650' : e.kind === 'perfect' ? '#9FF2FF' : '#fff'; ctx.font = `bold ${e.r.gold ? 30 : 24}px Galmuri11, sans-serif`; ctx.fillText((e.kind === 'perfect' ? 'PERFECT ' : '') + '-' + e.r.dmg, x, y); }
    ctx.globalAlpha = 1;
  }
}
function rr(x, y, w, h, r) { ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x, y, w, h, r) : ctx.rect(x, y, w, h); }
function heart(x, y, r, full) { ctx.fillStyle = full ? '#F2545A' : 'rgba(255,255,255,.25)'; ctx.strokeStyle = 'rgba(60,20,20,.5)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x, y + r * 0.9); ctx.bezierCurveTo(x - r * 1.4, y - r * 0.1, x - r * 0.6, y - r * 1.1, x, y - r * 0.35); ctx.bezierCurveTo(x + r * 0.6, y - r * 1.1, x + r * 1.4, y - r * 0.1, x, y + r * 0.9); ctx.fill(); ctx.stroke(); }

// ---------------------------------------------------------------- 결과 창
function showResult(res) {
  const f = res.fish, g = res.roll.grade;
  $('resTop').innerHTML = `${res.newDex ? '<span class="new">NEW 도감!</span>' : ''}${res.newBest ? '<span class="new best">최고 기록!</span>' : ''}${f.tier === 'boss' ? '<span class="new boss">👑 보스</span>' : ''}`;
  const c = $('resFish'), x = c.getContext('2d'); x.clearRect(0, 0, c.width, c.height);
  drawFish(x, f, c.width / 2, c.height / 2, f.look.shape === 'flat' || f.look.shape === 'round' ? 230 : 380, { t: 0.2, shadow: true });
  $('resInfo').innerHTML = `<h2>${f.name} <span class="grade g${g.g}">${g.g}</span></h2><p class="size">${res.roll.size}cm <small>(${f.size[0]}~${f.size[1]}cm)</small> · ${TIERS[f.tier].name}</p><p class="desc">${f.desc}</p>
    <p class="coin">🪙 ${res.coins.toLocaleString()} ${res.autoSold ? '<small>(가방이 꽉 차서 바로 팔았어요)</small>' : '<small>가방에 넣었어요</small>'}</p>`;
  let ex = '';
  if (res.drops.length) ex += `<div class="drops">🎁 ${res.drops.map(d => `<b>${nameOf(d.item)}</b>${d.n > 1 ? ' ×' + d.n : ''}`).join(', ')} 을(를) 건졌어요!</div>`;
  for (const s of res.sets) ex += `<div class="setDone">📖 도감 세트 「${s.name}」 완성! 보상: 🪙${(s.reward.coins || 0).toLocaleString()}${Object.entries(s.reward.items || {}).map(([k, n]) => ' · ' + nameOf(k) + (n > 1 ? ' ×' + n : '')).join('')}</div>`;
  if (res.unlocked) ex += `<div class="setDone">🌊 새 바다 「${STAGES[res.unlocked - 1].name}」 가 열렸어요!</div>`;
  $('resExtra').innerHTML = ex; $('result').hidden = false;
  if (res.sets.length || res.unlocked || f.tier === 'boss') snd.fanfare();
}
function closeResult() { $('result').hidden = true; setMode('idle'); snd.click(); }
$('resOk').onclick = closeResult;
const nameOf = id => (ITEM_BY_ID[id] || BAIT_BY_ID[id] || {}).name || id;

// ---------------------------------------------------------------- 창 (가방·상점·도감·꾸미기·바다·미끼)
let sheetKind = null, sheetTab = null;
function openSheet(kind, tab) {
  if (S.mode !== 'idle' && !['dex'].includes(kind)) { say('낚시가 끝난 뒤에 열 수 있어요', 'warn'); return; }
  sheetKind = kind; sheetTab = tab || ({ shop: 'rod', dex: '1', dress: 'avatar' }[kind] || null); $('sheet').hidden = false; snd.click(); drawSheet();
}
function closeSheet() { $('sheet').hidden = true; sheetKind = null; }
document.querySelector('#sheet .close').onclick = closeSheet;
$('sheet').addEventListener('click', e => { if (e.target.id === 'sheet') closeSheet(); });
function tabs(list) { $('sheetTabs').innerHTML = list.map(([k, n]) => `<button data-tab="${k}" class="${k === sheetTab ? 'on' : ''}">${n}</button>`).join(''); $('sheetTabs').querySelectorAll('button').forEach(b => b.onclick = () => { sheetTab = b.dataset.tab; snd.click(); drawSheet(); }); }
function statLine(stats) { return Object.entries(stats).filter(([, v]) => v).map(([k, v]) => `<span class="st">${G.STAT_NAMES[k]} ${G.fmtStat(k, v)}</span>`).join('') || '<span class="st none">효과 없음</span>'; }
function fishThumb(f, w = 120, h = 70, known = true) {
  const c = document.createElement('canvas'); c.width = w * 2; c.height = h * 2; const x = c.getContext('2d'); x.scale(2, 2);
  if (!known) { x.globalAlpha = 0.9; x.filter = 'brightness(0) opacity(.35)'; }
  drawFish(x, f, w / 2, h / 2, Math.min(w * 0.85, f.look.shape === 'flat' ? h * 1.1 : f.look.shape === 'round' ? h * 1.2 : w * 0.85), { t: 0.2 });
  return c.toDataURL();
}
const thumbCache = new Map(); const thumb = (f, known) => { const k = f.id + known; if (!thumbCache.has(k)) thumbCache.set(k, fishThumb(f, 120, 70, known)); return thumbCache.get(k); };

function drawSheet() {
  const B = $('sheetBody'); $('sheetTabs').innerHTML = '';
  if (sheetKind === 'bag') {
    $('sheetTitle').textContent = `🎒 가방 ${save.bag.length}/${BAG_MAX}`;
    const total = save.bag.reduce((a, b) => a + G.coinsFor(FISH_BY_ID[b.id], G.GRADE_BY[b.g], ST), 0);
    B.innerHTML = save.bag.length ? `<div class="row"><span>모두 팔면 🪙 ${total.toLocaleString()}</span><button class="btn" id="sellAll">모두 팔기</button></div><div class="grid bag">${save.bag.map((b, i) => { const f = FISH_BY_ID[b.id]; return `<div class="cell"><img src="${thumb(f, true)}"><b>${f.name}</b><span>${b.size}cm <i class="grade g${b.g}">${b.g}</i></span><button class="btn sm" data-sell="${i}">🪙 ${G.coinsFor(f, G.GRADE_BY[b.g], ST).toLocaleString()} 팔기</button></div>`; }).join('')}</div>` : '<p class="empty">아직 잡은 물고기가 없어요. 낚시하러 가요!</p>';
    const sa = $('sellAll'); if (sa) sa.onclick = () => { const n = G.sellBag(save, 'all', ST); persist(); snd.coin(); say(`🪙 ${n.toLocaleString()} 벌었어요`, 'good'); drawSheet(); };
    B.querySelectorAll('[data-sell]').forEach(b => b.onclick = () => { const n = G.sellBag(save, [+b.dataset.sell], ST); persist(); snd.coin(); say(`🪙 ${n.toLocaleString()}`, 'good', 900); drawSheet(); });
  }
  else if (sheetKind === 'shop') {
    $('sheetTitle').textContent = `🏪 상점 · 🪙 ${save.coins.toLocaleString()}`;
    tabs([['rod', '낚싯대'], ['line', '줄'], ['float', '찌'], ['bait', '미끼'], ['wear', '꾸미기']]);
    const list = sheetTab === 'bait' ? BAITS.filter(b => b.price) : ITEMS.filter(i => (sheetTab === 'wear' ? ['hat', 'outfit', 'acc'].includes(i.slot) : i.slot === sheetTab) && !i.start);
    B.innerHTML = `<div class="list">${list.map(it => {
      const isBait = !!BAIT_BY_ID[it.id], have = isBait ? (save.items[it.id] || 0) : G.owned(save, it.id);
      const how = isBait ? `${it.pack}개 🪙${it.price.toLocaleString()}` : it.shop ? `🪙 ${it.shop.toLocaleString()}` : it.drop ? '🎁 드랍으로만' : '📖 도감 세트 보상';
      const btn = isBait ? `<button class="btn" data-buy="${it.id}" ${save.coins < it.price ? 'disabled' : ''}>사기</button>` : have ? `<span class="tag">가지고 있음</span>` : it.shop ? `<button class="btn" data-buy="${it.id}" ${save.coins < it.shop ? 'disabled' : ''}>사기</button>` : `<span class="tag lock">🔒</span>`;
      return `<div class="item ${!isBait && !it.shop && !have ? 'locked' : ''}"><div class="ico" style="--c:${it.color || '#ddd'}">${iconFor(it)}</div><div class="txt"><b>${it.name}</b>${isBait ? '' : `<div>${statLine(it.stats)}</div>`}<small>${it.desc}</small>${isBait ? `<small>가진 개수 ${have}</small>` : ''}</div><div class="how">${how}${btn}</div></div>`;
    }).join('')}</div>`;
    B.querySelectorAll('[data-buy]').forEach(b => b.onclick = () => { const r = G.buy(save, b.dataset.buy); if (!r.ok) { say(r.why, 'warn'); return; } persist(); snd.coin(); say(`${nameOf(b.dataset.buy)} 샀어요!`, 'good'); drawSheet(); });
  }
  else if (sheetKind === 'dex') {
    const [a, n] = G.dexCount(save); $('sheetTitle').textContent = `📖 도감 ${a}/${n}`;
    tabs([...STAGES.map(s => [String(s.id), s.name]), ['sets', '세트 보상']]);
    if (sheetTab === 'sets') {
      B.innerHTML = `<div class="list">${SETS.map(s => { const [h, t] = G.setProgress(save, s), done = save.sets[s.id];
        const rw = `🪙${(s.reward.coins || 0).toLocaleString()}${Object.entries(s.reward.items || {}).map(([k, n]) => ' · ' + nameOf(k) + (n > 1 ? ' ×' + n : '')).join('')}`;
        return `<div class="item ${done ? 'done' : ''}"><div class="ico">${done ? '✅' : '📖'}</div><div class="txt"><b>${s.name}</b><small>${s.grade ? `아무 물고기나 ${s.grade} 등급으로 ${s.count}종` : s.fish.map(id => save.dex[id] ? FISH_BY_ID[id].name : '？').join(' · ')}</small><div class="bar"><i style="width:${h / t * 100}%"></i></div></div><div class="how">${h}/${t}<small>${rw}</small></div></div>`; }).join('')}</div>`;
    } else {
      const sid = +sheetTab, locked = sid > save.unlocked;
      B.innerHTML = (locked ? `<p class="empty">🔒 앞 바다의 보스를 잡으면 열려요</p>` : '') + `<div class="grid dex">${FISH.filter(f => f.stage === sid).map(f => { const d = save.dex[f.id];
        return `<div class="cell ${d ? '' : 'unk'} t-${f.tier}" data-fish="${f.id}"><img src="${thumb(f, !!d)}"><b>${d ? f.name : '？？？'}</b><span>${d ? `최대 ${d.max}cm <i class="grade g${d.best}">${d.best}</i>` : TIERS[f.tier].name}</span></div>`; }).join('')}</div><div id="dexInfo"></div>`;
      B.querySelectorAll('[data-fish]').forEach(c => c.onclick = () => { const f = FISH_BY_ID[c.dataset.fish], d = save.dex[f.id]; $('dexInfo').innerHTML = d ? `<div class="info"><img src="${thumb(f, true)}"><div><b>${f.name}</b> <small>${TIERS[f.tier].name} · ${f.size[0]}~${f.size[1]}cm</small><p>${f.desc}</p><small>잡은 수 ${d.n} · 가장 큰 것 ${d.max}cm · 최고 등급 ${d.best}</small></div></div>` : `<div class="info"><p>아직 못 잡은 물고기예요. ${TIERS[f.tier].name} 등급${f.tier === 'boss' ? ' · 황금 미끼로 보스 도전!' : ['r', 'e'].includes(f.tier) ? ' · 좋은 미끼를 써 보세요' : ''}</p></div>`; });
    }
  }
  else if (sheetKind === 'dress') {
    $('sheetTitle').textContent = '👕 꾸미기 · 장비';
    tabs([['avatar', '동물'], ['rod', '낚싯대'], ['line', '줄'], ['float', '찌'], ['hat', '모자'], ['outfit', '옷'], ['acc', '장신구']]);
    const tot = G.stats(save);
    let h = `<div class="dress"><canvas id="avPrev" width="320" height="320"></canvas><div class="tot"><b>내 능력치</b>${Object.entries(tot).map(([k, v]) => `<span class="st">${G.STAT_NAMES[k]} ${['pow', 'heart', 'time'].includes(k) ? v : Math.round(v * 100) + '%'}</span>`).join('')}</div></div>`;
    if (sheetTab === 'avatar') h += `<div class="grid animals">${ANIMALS.map(a => `<button class="cell ${save.animal === a.id ? 'on' : ''}" data-animal="${a.id}"><canvas width="160" height="160" data-av="${a.id}"></canvas><b>${a.name}</b></button>`).join('')}</div>`;
    else h += `<div class="list">${ITEMS.filter(i => i.slot === sheetTab).map(it => { const have = G.owned(save, it.id), on = save.eq[it.slot] === it.id;
      return `<div class="item ${have ? '' : 'locked'} ${on ? 'on' : ''}"><div class="ico" style="--c:${it.color}">${iconFor(it)}</div><div class="txt"><b>${it.name}</b><div>${statLine(it.stats)}</div><small>${it.desc}</small></div><div class="how">${on ? '<span class="tag">착용 중</span>' : have ? `<button class="btn" data-eq="${it.id}">쓰기</button>` : `<span class="tag lock">${it.shop ? '🏪 상점' : it.drop ? '🎁 드랍' : '📖 세트'}</span>`}</div></div>`; }).join('')}</div>`;
    B.innerHTML = h;
    const pv = $('avPrev').getContext('2d'); const av = { animal: ANIMALS.find(a => a.id === save.animal), hat: save.eq.hat, outfit: save.eq.outfit, acc: save.eq.acc };
    drawAvatarFront(pv, 160, 300, 300, av, ITEM_BY_ID, 0);
    B.querySelectorAll('[data-av]').forEach(c => drawAvatarFront(c.getContext('2d'), 80, 150, 150, { ...av, animal: ANIMALS.find(a => a.id === c.dataset.av) }, ITEM_BY_ID, 0));
    B.querySelectorAll('[data-animal]').forEach(b => b.onclick = () => { save.animal = b.dataset.animal; persist(); snd.click(); drawSheet(); });
    B.querySelectorAll('[data-eq]').forEach(b => b.onclick = () => { G.equip(save, b.dataset.eq); persist(); snd.click(); drawSheet(); });
  }
  else if (sheetKind === 'stage') {
    $('sheetTitle').textContent = '🌊 바다 고르기';
    B.innerHTML = `<div class="list">${STAGES.map(s => { const lock = s.id > save.unlocked, got = FISH.filter(f => f.stage === s.id && save.dex[f.id]).length, tot = FISH.filter(f => f.stage === s.id).length;
      return `<div class="item stage ${lock ? 'locked' : ''} ${save.stage === s.id ? 'on' : ''}" style="--a:${s.sea[0]};--b:${s.sky[0]}"><div class="ico">${['⛵', '🪸', '🌫️', '🌌'][s.id - 1]}</div><div class="txt"><b>${s.id}. ${s.name}</b><small>${s.desc}</small><small>도감 ${got}/${tot} · 보스 ${save.dex[s.boss] ? '✅ ' + FISH_BY_ID[s.boss].name : '？'}</small></div><div class="how">${lock ? '<span class="tag lock">🔒 앞 바다 보스</span>' : save.stage === s.id ? '<span class="tag">여기 있어요</span>' : `<button class="btn" data-stage="${s.id}">가기</button>`}</div></div>`; }).join('')}</div>`;
    B.querySelectorAll('[data-stage]').forEach(b => b.onclick = () => { save.stage = +b.dataset.stage; persist(); snd.stage(save.stage); closeSheet(); say(`🌊 ${stage().name}`, 'good'); });
  }
  else if (sheetKind === 'bait') {
    $('sheetTitle').textContent = '🪱 미끼 고르기';
    B.innerHTML = `<div class="list">${BAITS.filter(b => !b.boss).map(b => { const n = save.items[b.id] || 0, can = b.price === 0 || n > 0, on = save.eq.bait === b.id;
      return `<div class="item ${can ? '' : 'locked'} ${on ? 'on' : ''}"><div class="ico">${baitIcon(b.id)}</div><div class="txt"><b>${b.name}</b><small>${b.desc}</small></div><div class="how">${b.price ? '×' + n : '∞'}${on ? '<span class="tag">쓰는 중</span>' : can ? `<button class="btn" data-bait="${b.id}">쓰기</button>` : '<span class="tag lock">상점에서</span>'}</div></div>`; }).join('')}</div><p class="small">🌟 황금 미끼는 '보스 도전' 버튼으로 써요 (지금 ${save.items.bait4 || 0}개).</p>`;
    B.querySelectorAll('[data-bait]').forEach(b => b.onclick = () => { G.equip(save, b.dataset.bait); persist(); snd.click(); closeSheet(); });
  }
}
function iconFor(it) { return { rod: '🎣', line: '🧵', float: '🔴', hat: '🎩', outfit: '👕', acc: '💍' }[it.slot] || { bait1: '🪱', bait2: '🦐', bait3: '✨', bait4: '🌟' }[it.id] || '🎁'; }

// ---------------------------------------------------------------- 입력
$('btnAct').addEventListener('pointerdown', e => { e.preventDefault(); act(); });
cv.addEventListener('pointerdown', e => { e.preventDefault(); act(); });
addEventListener('keydown', e => {
  if (e.repeat) return;
  if (e.code === 'Space' || e.code === 'Enter') { e.preventDefault(); if (!$('intro').hidden) { start(); return; } act(); return; }
  if (e.code === 'Escape') { if (!$('result').hidden) closeResult(); else closeSheet(); return; }
  if (!$('intro').hidden || !$('result').hidden) return;
  const k = { KeyB: 'bag', KeyS: 'shop', KeyD: 'dex', KeyC: 'dress' }[e.code]; if (k) { if (sheetKind === k) closeSheet(); else openSheet(k); }
});
document.querySelectorAll('[data-open]').forEach(b => b.onclick = () => openSheet(b.dataset.open));
$('btnStage').onclick = () => openSheet('stage'); $('btnBait').onclick = () => openSheet('bait');
$('btnBoss').onclick = () => { snd.init(); if (S.mode === 'idle') cast(true); };
$('btnSound').onclick = () => { snd.init(); snd.toggle(); hud(); };
function start() { snd.init(); snd.stage(save.stage); $('intro').hidden = true; snd.click(); }
$('startBtn').onclick = start;
// 버튼을 누른 뒤 Space가 그 버튼을 다시 누르지 않게
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('button'); if (b) setTimeout(() => b.blur(), 0); }, true);

hud(); actButton(); requestAnimationFrame(frame);
window.__gf = { S, get save() { return save; }, G, act, openSheet, closeSheet, showResult, persist, set save(v) { save = v; persist(); } };
