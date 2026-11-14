// 토이피쉬 화면: 낚시(던지기 → 입질 → 타이밍 싸움 → 결과) + 가방·상점·도감·꾸미기
import * as G from './game.js';
import { MAP_STAGES, LETTERS, LETTER_BY_ID, STAGES, STAGE_ICON, FISH, FISH_BY_ID, ITEMS, ITEM_BY_ID, BAITS, BAIT_BY_ID, SETS, GRADES, TIERS, ANIMALS, CHARACTERS, SLOTS, BAG_MAX, LEVEL, TITLES } from './data.js';
import { drawFish, drawScene, drawAngler, drawAvatarFront, fishSprite, setToy, lightningNear } from './draw.js';
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
// 3D 그림(사람 낚시꾼 · 장난감 물고기). 못 불러오면 예전 2D 그림으로 그려요.
let toy = null;
const toyReady = import('./toy3d.js').then(m => m.createToy()).then(t => { toy = t; setToy(t); thumbCache.clear(); introChars(); if (sheetKind) drawSheet(); return t; })
  .catch(e => { console.warn('3D 그림 없이 그려요', e); introChars(); return null; });

// ---------------------------------------------------------------- 상태
// idle → cast → wait → bite → fight → (result) → idle
const S = { parts: [], freeze: 0, land: null, mode: 'idle', t: 0, dt: 0, modeT: 0, bobX: 0.5, bobY: 0.62, biteAt: 0, fish: null, roll: null, battle: null, fx: [], shake: 0, msgT: 0, bait: null, boss: false, castFx: null, roarT: 9, flash: 0 };
// ---------------------------------------------------------------- 진동 (타격감)
// 안드로이드: navigator.vibrate 패턴. 아이폰(Safari 18 이상): 진동 API가 없어서, 숨겨 둔 '스위치' 체크박스를 눌러 시스템 햅틱을 한 번씩 울려요.
const HAP = { ui: [8], aim: [14], throw: [28], nice: [22, 35, 55], hook: [55, 30, 35], good: [38], perfect: [60], gold: [45, 30, 85], miss: [120], bite: [70, 50, 70], catch: [60, 50, 160], level: [30, 40, 30, 40, 90], cancel: [18, 30, 18], boss: [90, 60, 90, 60, 220], roar: [160, 40, 160] };
let hapOn = true; try { hapOn = localStorage.getItem('getfish_haptic') !== 'off'; } catch (e) { }
const iosSw = (() => { if (navigator.vibrate) return null; const l = document.createElement('label'), i = document.createElement('input'); i.type = 'checkbox'; i.setAttribute('switch', ''); l.append(i); l.style.cssText = 'position:fixed;left:-99px;top:0;width:1px;height:1px;opacity:0;pointer-events:none'; l.setAttribute('aria-hidden', 'true'); document.body.append(l); return l; })();
function haptic(kind) {
  if (!hapOn) return; const p = HAP[kind] || HAP.ui;
  try {
    if (navigator.vibrate) { navigator.vibrate(p); return; }
    if (iosSw) {   // 아이폰은 '사용자가 막 누른 순간'에만 햅틱이 울려서, 아직 그 순간이 아니면 손을 뗄 때 울려요
      const ua = navigator.userActivation;
      if (!ua || ua.isActive) iosTick(p); else { hapPending = { p, t: performance.now() }; }
    }
  } catch (e) { }
}
let hapPending = null;
function iosTick(p) { iosSw.click(); for (let k = 2; k < p.length; k += 2) setTimeout(() => iosSw.click(), p.slice(0, k).reduce((a, b) => a + b, 0)); }
for (const ev of ['pointerup', 'touchend']) addEventListener(ev, () => { if (hapPending && iosSw && performance.now() - hapPending.t < 400) { const p = hapPending.p; hapPending = null; iosTick(p); } }, true);
const buzz = p => haptic(typeof p === 'string' ? p : 'good');
function pressAnim() { const b = $('btnAct'); b.classList.remove('press'); void b.offsetWidth; b.classList.add('press'); }
function setMode(m) { S.mode = m; S.modeT = 0; actButton(); }
function say(text, cls = '', ms = 1400) { const m = $('msg'); m.textContent = text; m.className = cls; m.hidden = false; clearTimeout(say.t); say.t = setTimeout(() => m.hidden = true, ms); }

function act() {
  snd.init();
  if (!$('result').hidden) { closeResult(); return; }
  if (!$('sheet').hidden || !$('intro').hidden) return;
  pressAnim();
  if (S.mode === 'landed') { if (S.land && !S.land.shown) { S.land.shown = true; S.land.bottle ? showBottle(S.land.res) : showResult(S.land.res); } return; }
  if (S.mode === 'bossIntro') { if (S.modeT > 1.4) startFight(); return; }
  if (S.mode === 'idle') aim();
  else if (S.mode === 'aim') cast(G.castGauge(S.modeT, save.stage));
  else if (S.mode === 'wait') { haptic('ui'); say('아직이에요… 찌가 쑥 들어갈 때!', 'warn'); }
  else if (S.mode === 'bite') hookFish();
  else if (S.mode === 'fight') strike();
}
function aim() {   // 던지기 막대 시작 (별이 왔다 갔다)
  snd.click(); haptic('aim'); setMode('aim');
}
function cast(pos = 0.5) {
  S.bait = G.useBait(save); save.stats.casts++;
  const c = S.castRes = G.castResult(pos, ST);
  save.run.perfect = c.perfect ? (save.run.perfect || 0) + 1 : 0; S.castBolt = save.stage === 6 && lightningNear(S.t);   // 숨은 물고기 조건용
  if (c.nice) save.stats.nice = (save.stats.nice || 0) + 1; if (c.perfect) save.stats.perfect = (save.stats.perfect || 0) + 1;
  const nt = c.nice ? G.checkTitles(save) : []; persist(); nt.forEach(t => setTimeout(() => say(`🏅 칭호 「${t.name}」`, 'good', 2200), 1200));
  S.bobX = 0.56 + c.power * 0.13 + (Math.random() - 0.5) * 0.05; S.bobY = 0.6 - c.power * 0.14 + Math.random() * 0.02;   // 잘 던질수록 수평선 쪽
  S.biteAt = 1.2 + Math.random() * 3.2 * (1 - ST.luck) * (1 - ST.far);
  S.castFx = { t: 0, c };
  const label = { perfect: '✨ PERFECT!', great: 'GREAT!', good: 'GOOD', bad: '아쉬워요…' }[c.grade];
  say(`${label} ${c.dist}m`, c.nice ? 'good' : c.grade === 'bad' ? 'warn' : '', 1100);
  haptic(c.perfect ? 'gold' : c.nice ? 'nice' : 'throw');
  if (c.nice) burst(W * S.bobX, H * S.bobY, c.perfect ? 22 : 12, '#FFE680', 160, 'star');
  snd.cast(); setMode('cast');
}
/** 던졌다가 거두기: 물고기가 아직 먹지 않았으면 미끼를 돌려받아요 */
function cancelCast() {
  if (S.mode === 'aim') { setMode('idle'); haptic('cancel'); say('던지기를 그만뒀어요', '', 900); return; }
  if (!['cast', 'wait', 'bite'].includes(S.mode)) return;
  G.refundBait(save, S.bait); save.stats.casts = Math.max(0, save.stats.casts - 1); save.run.cancel = (save.run.cancel || 0) + 1; persist();
  snd.reel(); haptic('cancel'); say('↩ 낚싯대를 거뒀어요 (미끼는 그대로)', '', 1100);
  S.reel = { t: 0, from: [W * S.bobX, H * S.bobY] }; setMode('idle');
}
function hookFish() {
  const c = S.castRes || G.castResult(0.5, ST);
  // 가끔 물고기 대신 유리병 (편지 · 지도 조각)
  const bottle = G.rollBottle(save, save.stage);
  if (bottle) { save.run.cancel = 0; G.refundBait(save, S.bait); const res = G.openBottle(save, bottle); persist(); snd.hook(); haptic('hook');
    S.land = { bottle: true, res, t: 0, shown: false, from: [W * S.bobX, H * S.bobY] }; setMode('landed'); burst(W * S.bobX, H * S.bobY, 18, '#FFFFFF', 380, 'drop'); return; }
  const ctxS = { eq: save.eq, cast: c, perfectRun: save.run.perfect, cancels: save.run.cancel, hour: new Date().getHours(), lightning: !!S.castBolt };
  save.run.cancel = 0;
  S.fish = G.rollFish(save.stage, S.bait, ST.luck, Math.random, c.bonus, G.bossChance(S.bait, ST, c, save.calm), ctxS); S.roll = G.rollSize(S.fish, ST.luck + c.luck);
  if (S.fish.hidden) { say('🔍 …처음 느껴 보는 손맛이에요!', 'boss', 1600); haptic('gold'); }
  S.battle = G.newBattle(S.fish, S.roll, ST, Math.random, c.timeBonus); snd.hook(); haptic('hook'); S.shake = 0.4;
  if (S.fish.tier === 'boss') { S.boss = true; setMode('bossIntro'); snd.bossIntro(); snd.boss(true); haptic('boss'); S.shake = 1.2; return; }
  S.boss = false; save.calm = (save.calm || 0) + 1; persist();
  if (['r', 'e'].includes(S.fish.tier)) say('묵직해요! 큰 녀석이에요', 'good', 1300);
  setMode('fight');
}
function startFight() { if (S.mode !== 'bossIntro') return; S.shake = 0.6; haptic('roar'); snd.roar(); setMode('fight'); }
function strike() {
  const b = S.battle, r = G.hit(b);
  if (r.kind === 'miss') { snd.miss(); fx('miss', b.x); S.shake = 0.25; haptic('miss'); S.laneFlash = { t: 0, col: '255,90,70' }; }
  else {
    snd.hit(r.kind, r.gold); fx(r.kind, r.at, r); fx('ring', r.at, r); S.shake = r.gold ? 0.3 : 0.12;
    haptic(r.gold ? 'gold' : r.kind === 'perfect' ? 'perfect' : 'good');
    if (r.kind === 'perfect' || r.gold) S.freeze = r.gold ? 0.09 : 0.06;   // 잠깐 멈춤 (맞았다는 손맛)
    S.laneFlash = { t: 0, col: r.gold ? '255,214,80' : r.kind === 'perfect' ? '160,240,255' : '255,255,255' };
    burst(laneRect().x + r.at * laneRect().w, laneRect().y + laneRect().h / 2, r.gold ? 16 : 8, r.gold ? '#FFD650' : '#FFFFFF', 160);
  }
  if (b.done) endFight();
}
function endFight() {
  const b = S.battle;
  if (b.done === 'caught') {
    const res = G.onCatch(save, S.fish, S.roll, ST); persist(); snd.catch(); haptic(res.levelUps.length ? 'level' : 'catch');
    S.land = { res, t: 0, shown: false, from: [W * S.bobX, H * S.bobY] }; setMode('landed'); if (S.boss) snd.boss(false);
    burst(W * S.bobX, H * S.bobY, 26, '#FFFFFF', 420, 'drop');   // 물보라

  } else { save.stats.escaped++; persist(); snd.snap(); if (S.boss) { snd.boss(false); save.calm = Math.floor((save.calm || 0) / 2); persist(); } say(b.why === 'line' ? '줄이 끊어졌어요… 😢' : '시간이 다 돼서 도망갔어요', 'warn', 1800); setMode('idle'); }
}

// ---------------------------------------------------------------- 큰 버튼 · 위아래 줄
function actButton() {
  const T = { idle: ['🎣', '던지기'], aim: ['⭐', '멈춰!'], cast: ['🎣', '…'], wait: ['⏳', '기다려요'], bite: ['❗', '챔질!'], fight: ['💥', 'HIT!'], landed: ['🐟', '잡았다!'], bossIntro: ['👑', '보스!'] }[S.mode] || ['🎣', '던지기'];
  $('actIcon').textContent = T[0]; $('actText').textContent = T[1]; $('hintText').textContent = T[1];
  $('btnAct').className = S.mode; $('btnBait').disabled = S.mode !== 'idle';
  $('btnCancel').hidden = !['aim', 'cast', 'wait', 'bite'].includes(S.mode);
}
function hud() {
  $('coins').textContent = '🪙 ' + save.coins.toLocaleString();
  const need = LEVEL.need(save.lv), tt = G.TITLE_BY_ID[save.title];
  $('lvPill').innerHTML = `<b>Lv.${save.lv}</b> <span>${tt ? tt.name : ''}</span><i style="width:${save.lv >= LEVEL.max ? 100 : Math.min(100, save.exp / need * 100)}%"></i>`;
  $('btnStage').textContent = `🌊 ${stage().name} ▾`;
  const [a, n] = G.dexCount(save), [h] = G.secretCount(save); $('dexCount').textContent = `📖 ${a}/${n}` + (h ? ` · 🔍${h}` : '');
  const b = BAIT_BY_ID[save.eq.bait]; $('btnBait').innerHTML = `${baitIcon(b.id)} ${b.name}${b.id !== 'bait0' ? ' ×' + (save.items[b.id] || 0) : ''} <small class="bossP">👑 ${pct(G.bossChance(b.id, ST, null, save.calm))}</small>`;
  $('btnSound').textContent = snd.on ? '🔊' : '🔇'; $('btnHap').textContent = hapOn ? '📳' : '📴';
}
const baitIcon = id => ({ bait0: '🪝', bait1: '🪱', bait2: '🦐', bait3: '✨', bait4: '🌟', bait5: '🍙', bait6: '🦑', bait7: '💡', bait8: '🔥', bait9: '🔮' })[id] || '🪱';
const pct = v => (v * 100 < 10 ? (v * 100).toFixed(1) : Math.round(v * 100)) + '%';

// ---------------------------------------------------------------- 효과 (글자·물보라)
function fx(kind, at, r) { S.fx.push({ kind, at, t: 0, r }); }
function laneRect() { const w = Math.min(W * 0.78, 760), x = (W - w) / 2, y = Math.max(96, H * 0.24), bw = S.battle ? S.battle.w : 0.055; return { x, y, w, h: Math.max(26, Math.round(bw * w * 2 + 12)) }; }

// ---------------------------------------------------------------- 그리기
let last = performance.now();
function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min(0.05, (now - last) / 1000); last = now; S.t += dt; S.modeT += dt; S.dt = dt;
  try { update(dt); render(); } catch (e) { console.error(e); }
}
function update(dt) {
  if (S.mode === 'cast' && S.modeT > 0.7) setMode('wait');
  if (S.mode === 'wait' && S.modeT > S.biteAt) { setMode('bite'); snd.bite(); haptic('bite'); }
  if (S.mode === 'bite' && S.modeT > 1.0 * (1 + ST.slow * 2)) { say('놓쳤어요! 찌가 들어가면 바로 눌러요', 'warn', 1600); setMode('idle'); }
  if (S.mode === 'bossIntro' && S.modeT > 3.2) startFight();
  if (S.mode === 'fight') { if (S.freeze > 0) S.freeze -= dt; else { G.stepBattle(S.battle, dt); const ev = S.battle.events; if (ev && ev.length) { ev.length = 0; roar(); } if (S.battle.done) endFight(); } }
  if (S.castFx) { S.castFx.t += dt; if (S.castFx.t > 1.2) S.castFx = null; }
  if (S.reel) { S.reel.t += dt; if (S.reel.t > 0.5) S.reel = null; }
  S.roarT += dt; S.flash = Math.max(0, S.flash - dt * 2.5);
  if (S.mode === 'landed' && S.land) { S.land.t += dt; const L = S.land;
    if (L.t > 0.95 && !L.pop) { if (!L.bottle && L.res.fish.hidden) confetti(); L.pop = true; snd.coin(); burst(W / 2, H * 0.42, 40, '#FFE680', 520, 'star'); if (L.bottle ? L.res.kind === 'map' : L.res.newDex || ['r', 'e', 'boss'].includes(L.res.fish.tier) || ['S', 'SS'].includes(L.res.roll.grade.g)) confetti(); }
    if (L.t > 2.3 && !L.shown) { L.shown = true; L.bottle ? showBottle(L.res) : showResult(L.res); } }
  if (S.laneFlash) { S.laneFlash.t += dt; if (S.laneFlash.t > 0.25) S.laneFlash = null; }
  for (const p of S.parts) { p.t += dt; p.vy += (p.g ?? 600) * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.rot = (p.rot || 0) + (p.vr || 0) * dt; }
  S.parts = S.parts.filter(p => p.t < p.life);
  S.fx = S.fx.filter(f => (f.t += dt) < 0.9); S.shake = Math.max(0, S.shake - dt);
}
function render() {
  const st = stage(), boss = S.boss && ['bossIntro', 'fight'].includes(S.mode); ctx.save();
  if (S.shake) ctx.translate((Math.random() - 0.5) * 8 * S.shake, (Math.random() - 0.5) * 6 * S.shake);
  drawScene(ctx, W, H, st, S.t, { shadows: S.mode === 'wait' || S.mode === 'idle', storm: boss });
  if (boss) bossBackdrop();
  const pose = S.mode === 'aim' ? 'aim' : S.mode === 'cast' && S.modeT < 0.45 ? 'cast' : S.mode === 'fight' || S.mode === 'bossIntro' ? 'pull' : S.mode === 'landed' ? 'cheer' : S.mode === 'wait' || S.mode === 'bite' ? 'wait' : 'idle';
  const tip = player(pose);
  if (S.mode === 'aim') gaugeView();
  if (S.castFx) castFxView();
  if (['cast', 'wait', 'bite', 'fight', 'bossIntro'].includes(S.mode)) {
    let bx = W * S.bobX, by = H * S.bobY;
    if (S.mode === 'cast') { const u = Math.min(1, S.modeT / 0.6); bx = tip.x + (bx - tip.x) * u; by = tip.y + (by - tip.y) * u - Math.sin(u * Math.PI) * H * (0.1 + 0.15 * (S.castRes ? S.castRes.power : 0.5)); }
    if (S.mode === 'fight') { bx += Math.sin(S.t * 7) * W * 0.02 * (S.battle.x - 0.5) * 4; by += Math.sin(S.t * 13) * 3; }
    if (S.mode === 'bossIntro') { bx += Math.sin(S.t * 23) * 6; by += Math.sin(S.t * 31) * 4; }
    const dip = S.mode === 'bite' ? 6 + Math.sin(S.modeT * 30) * 4 : S.mode === 'wait' ? Math.sin(S.t * 3) * 1.5 : 0;
    ctx.strokeStyle = 'rgba(255,255,255,.8)'; ctx.lineWidth = 1.3; ctx.beginPath(); ctx.moveTo(tip.x, tip.y); ctx.quadraticCurveTo((tip.x + bx) / 2, Math.max(tip.y, by) - (S.mode === 'fight' || S.mode === 'bossIntro' ? -20 : 30), bx, by + dip); ctx.stroke();
    const fl = ITEM_BY_ID[save.eq.float];
    if (S.mode !== 'fight' && S.mode !== 'bossIntro') { ctx.fillStyle = fl.color; ctx.strokeStyle = 'rgba(40,30,40,.6)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(bx, by + dip, 6, 9, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#E8545A'; ctx.beginPath(); ctx.ellipse(bx, by + dip - 5, 6, 4, 0, Math.PI, 0); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,.5)'; for (let k = 0; k < 2; k++) { const r = ((S.t * 0.8 + k * 0.5) % 1); ctx.globalAlpha = 1 - r; ctx.beginPath(); ctx.ellipse(bx, by + 8, 10 + r * 26, 3 + r * 6, 0, 0, Math.PI * 2); ctx.stroke(); } ctx.globalAlpha = 1; }
    if (S.mode === 'bite') { ctx.fillStyle = '#fff'; ctx.font = 'bold 44px Galmuri11, sans-serif'; ctx.textAlign = 'center'; ctx.fillText('!', bx, by - 26 - Math.abs(Math.sin(S.modeT * 12)) * 8); splash(bx, by + 6, S.modeT); }
    if (S.mode === 'fight') fightView(bx, by);
    if (S.mode === 'bossIntro') bossIntroView(bx, by);
  }
  if (S.reel) { const u = Math.min(1, S.reel.t / 0.45), x = S.reel.from[0] + (tip.x - S.reel.from[0]) * u, y = S.reel.from[1] + (tip.y - S.reel.from[1]) * u - Math.sin(u * Math.PI) * 40;   // 거두는 찌
    ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(tip.x, tip.y); ctx.lineTo(x, y); ctx.stroke(); ctx.fillStyle = ITEM_BY_ID[save.eq.float].color; ctx.beginPath(); ctx.arc(x, y, 6, 0, Math.PI * 2); ctx.fill(); }
  if (S.mode === 'landed' && S.land) landedView(tip);
  drawParts();
  if (S.flash > 0) { ctx.fillStyle = `rgba(255,255,255,${S.flash * 0.6})`; ctx.fillRect(-20, -20, W + 40, H + 40); }
  ctx.restore();
}
// ---------------------------------------------------------------- 낚시꾼 (3D 뒷모습)
function player(pose) {
  const av = { g: save.gender || 'm', hat: save.eq.hat, outfit: save.eq.outfit, acc: save.eq.acc, rod: save.eq.rod };
  if (!toy) {   // 3D가 없을 때: 예전 2D 그림
    const s = Math.min(H * 0.36, W * 0.26); return drawAngler(ctx, W * 0.44, H * 0.97, s, { ...av, animal: ANIMALS[0] }, pose === 'wait' ? 'idle' : pose, S.t, ITEM_BY_ID);
  }
  const port = H > W * 1.1, ch = port ? Math.min(H * 0.5, W * 0.95) : Math.min(H * 0.62, W * 0.6), cw = ch * 1.5, left = W * (port ? 0.4 : 0.36) - cw * 0.72, top = H - ch * 0.97 - (port ? H * 0.06 : 0);
  const rh = Math.min(560, Math.round(ch * Math.min(DPR, 1.5))), rw = Math.round(rh * 1.5);
  const r = toy.angler(av, ITEM_BY_ID, pose, S.t, S.dt || 0.016, rw, rh);
  ctx.drawImage(r.canvas, 0, 0, rw, rh, left, top, cw, ch);
  return r.tip ? { x: left + r.tip.x * cw, y: top + r.tip.y * ch } : { x: W * 0.6, y: H * 0.5 };
}
// ---------------------------------------------------------------- 던지기 막대 (가운데에서 멈추기)
function gaugeView() {
  const v = G.castGauge(S.modeT, save.stage), z = G.castZones(ST);
  const w = Math.min(520, W * 0.78), h = 30, x = (W - w) / 2, y = Math.max(118, H * 0.22), cx = x + w / 2;
  ctx.fillStyle = 'rgba(20,30,40,.55)'; rr(x - 14, y - 40, w + 28, h + 70, 20); ctx.fill();
  ctx.save(); rr(x, y, w, h, 15); ctx.clip();
  ctx.fillStyle = 'rgba(255,255,255,.18)'; ctx.fillRect(x, y, w, h);
  const band = (k, col) => { ctx.fillStyle = col; ctx.fillRect(cx - w / 2 * k, y, w * k, h); };
  band(z.good, 'rgba(122,208,106,.55)'); band(z.great, 'rgba(90,180,242,.75)'); band(z.perfect, `rgba(255,214,80,${0.8 + 0.2 * Math.sin(S.t * 12)})`);
  for (let i = 1; i < 20; i++) { ctx.fillStyle = 'rgba(255,255,255,.18)'; ctx.fillRect(x + w * i / 20, y + h - 6, 1, 6); }
  ctx.restore();
  ctx.strokeStyle = '#FFE680'; ctx.lineWidth = 2; ctx.strokeRect(cx - w / 2 * z.perfect, y - 3, w * z.perfect, h + 6);
  // 별 (왔다 갔다)
  const sx = x + w * v; ctx.save(); ctx.translate(sx, y + h / 2); ctx.rotate(S.t * 5); ctx.fillStyle = '#FFF6C8'; ctx.strokeStyle = '#B8860B'; ctx.lineWidth = 2;
  ctx.beginPath(); for (let k = 0; k < 10; k++) { const r = k % 2 ? 7 : 17; ctx.lineTo(Math.cos(k * Math.PI / 5 - Math.PI / 2) * r, Math.sin(k * Math.PI / 5 - Math.PI / 2) * r); } ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
  ctx.font = '14px Galmuri11, sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = '#FFE680'; ctx.fillText('PERFECT', cx, y - 12);
  ctx.fillStyle = '#fff'; ctx.fillText(W < 640 ? '별이 가운데 올 때 누르기!' : '별이 가운데 왔을 때 눌러서 던지기 · 가운데일수록 멀리, 드문 물고기와 보스가 더 와요', W / 2, y + h + 22);
}
function castFxView() {   // 던진 결과 글자
  const { t, c } = S.castFx, k = Math.min(1, t / 0.2), a = t > 0.8 ? 1 - (t - 0.8) / 0.4 : 1;
  const y = Math.max(118, H * 0.22) + 14, txt = { perfect: 'PERFECT!', great: 'GREAT!', good: 'GOOD', bad: 'BAD' }[c.grade], col = { perfect: '#FFD650', great: '#7FD0FF', good: '#9AE07A', bad: '#C8C8D0' }[c.grade];
  ctx.save(); ctx.globalAlpha = Math.max(0, a); ctx.translate(W / 2, y - t * 30); ctx.scale(0.6 + k * 0.5, 0.6 + k * 0.5); ctx.textAlign = 'center'; ctx.font = `bold ${c.perfect ? 54 : 42}px Galmuri11, sans-serif`;
  ctx.lineWidth = 8; ctx.strokeStyle = 'rgba(30,20,40,.75)'; ctx.strokeText(txt, 0, 0); ctx.fillStyle = col; ctx.fillText(txt, 0, 0); ctx.restore();
}
// ---------------------------------------------------------------- 보스 연출
function roar() {   // 체력 60%·30%: 포효 → 화면 흔들림, 번쩍, 더 빨라짐
  S.roarT = 0; S.shake = 0.9; S.flash = 0.5; snd.roar(); haptic('roar');
  say(S.battle.phase >= 2 ? `🔥 ${S.fish.name}이(가) 미쳐 날뛰어요!` : `💢 ${S.fish.name}의 포효! 더 빨라졌어요`, 'boss', 1500);
}
function bossBackdrop() {   // 어두워진 하늘 · 붉은 가장자리 · 물 밑의 거대한 그림자
  const intro = S.mode === 'bossIntro', k = intro ? Math.min(1, S.modeT / 0.8) : 1, pulse = 0.5 + 0.5 * Math.sin(S.t * 3);
  ctx.fillStyle = `rgba(20,8,30,${0.38 * k})`; ctx.fillRect(0, 0, W, H);
  const g = ctx.createRadialGradient(W / 2, H * 0.5, Math.min(W, H) * 0.3, W / 2, H * 0.5, Math.max(W, H) * 0.75);
  g.addColorStop(0, 'rgba(200,30,40,0)'); g.addColorStop(1, `rgba(200,30,40,${(0.25 + 0.2 * pulse) * k + (S.roarT < 0.6 ? 0.3 * (1 - S.roarT / 0.6) : 0)})`); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  if (S.mode === 'fight' && S.battle) {   // 수면 아래를 맴도는 커다란 몸
    const b = S.battle, len = Math.min(W * 0.75, H * 1.1), x = W * (0.2 + b.x * 0.6), y = H * 0.56 + Math.sin(S.t * 0.9) * 10;
    ctx.save(); ctx.globalAlpha = 0.28; ctx.filter = 'brightness(0.15) blur(2px)'; drawFish(ctx, S.fish, x, y, len, { t: S.t, flip: b.dir < 0 }); ctx.restore(); ctx.filter = 'none';
  }
}
function bossIntroView(bx, by) {   // 등장: 물이 솟구치고 거대한 보스가 떠오른 뒤 이름판
  const t = S.modeT, f = S.fish, big = Math.min(W * 0.8, H * 1.05);
  if (t < 2.9) { const u = Math.min(1, t / 1.3), rise = 1 - Math.pow(1 - u, 3), y = H * 0.75 - rise * H * 0.3;
    ctx.save(); ctx.globalAlpha = Math.min(1, t / 0.4) * (t > 2.4 ? 1 - (t - 2.4) / 0.5 : 1);
    // 뒤에서 솟는 빛
    ctx.translate(W / 2, y); ctx.rotate(t * 0.3); for (let i = 0; i < 16; i++) { ctx.rotate(Math.PI / 8); ctx.fillStyle = i % 2 ? 'rgba(255,214,120,.25)' : 'rgba(255,120,80,.18)'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-big * 0.08, big); ctx.lineTo(big * 0.08, big); ctx.fill(); }
    ctx.restore(); ctx.save(); ctx.globalAlpha = Math.min(1, t / 0.5) * (t > 2.4 ? 1 - (t - 2.4) / 0.5 : 1);
    drawFish(ctx, f, W / 2, y, big * (0.75 + 0.25 * rise), { t: S.t * 0.6, rot: Math.sin(t * 2) * 0.05 }); ctx.restore();
    if (t < 1.6) for (let i = 0; i < 3; i++) burst(W / 2 + (Math.random() - 0.5) * big * 0.7, H * 0.6, 2, '#FFFFFF', 520, 'drop');
  }
  if (t > 0.9) {   // 경고 띠 + 이름판
    const k = Math.min(1, (t - 0.9) / 0.35), y = H * 0.3, bh = Math.min(120, H * 0.18);
    ctx.save(); ctx.globalAlpha = k * (t > 2.9 ? Math.max(0, 1 - (t - 2.9) / 0.3) : 1);
    ctx.fillStyle = 'rgba(20,6,10,.78)'; ctx.fillRect(0, y - bh / 2, W, bh);
    ctx.fillStyle = '#E8303A'; ctx.fillRect(0, y - bh / 2, W, 5); ctx.fillRect(0, y + bh / 2 - 5, W, 5);
    ctx.font = `bold ${Math.round(bh * 0.15)}px Galmuri11, sans-serif`; ctx.textAlign = 'center'; ctx.fillStyle = '#FF8A7A';
    const off = (S.t * 120) % 200; for (let x = -200 + off; x < W + 200; x += 200) ctx.fillText('⚠ WARNING ⚠', x, y - bh * 0.3);
    const sc = 1 + Math.max(0, 0.4 - (t - 0.9)) * 1.5; ctx.translate(W / 2, y + bh * 0.12); ctx.scale(sc, sc);
    ctx.font = `bold ${Math.round(bh * 0.36)}px Galmuri11, sans-serif`; ctx.lineWidth = 8; ctx.strokeStyle = '#3A1010'; ctx.strokeText(`👑 ${f.name}`, 0, 0); ctx.fillStyle = '#FFE27A'; ctx.fillText(`👑 ${f.name}`, 0, 0);
    ctx.font = `${Math.round(bh * 0.13)}px Galmuri11, sans-serif`; ctx.fillStyle = '#F2E6D8'; ctx.fillText(`${stage().name}의 주인이 나타났다!`, 0, bh * 0.3);
    ctx.restore();
  }
}
// ---------------------------------------------------------------- 잡았을 때 연출
function burst(x, y, n, col, sp, kind = 'dot') {
  for (let i = 0; i < n; i++) { const a = kind === 'drop' ? -Math.PI / 2 + (Math.random() - 0.5) * 1.6 : Math.random() * Math.PI * 2, v = sp * (0.4 + Math.random() * 0.6);
    S.parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, t: 0, life: kind === 'star' ? 0.9 : 0.6 + Math.random() * 0.4, col, r: kind === 'drop' ? 3 + Math.random() * 4 : 2 + Math.random() * 3, kind, g: kind === 'star' ? 120 : kind === 'dot' ? 200 : 900 }); }
}
function confetti() {
  const cols = ['#F2545A', '#FFD650', '#5AC2F2', '#7AD06A', '#B88AE8', '#FF9A5A'];
  for (let i = 0; i < 90; i++) S.parts.push({ x: Math.random() * W, y: -20 - Math.random() * H * 0.3, vx: (Math.random() - 0.5) * 80, vy: 60 + Math.random() * 120, t: 0, life: 2.6, col: cols[i % cols.length], r: 4 + Math.random() * 4, kind: 'paper', g: 60, vr: (Math.random() - 0.5) * 12 });
}
function drawParts() {
  for (const p of S.parts) {
    const a = 1 - p.t / p.life; ctx.globalAlpha = Math.max(0, a); ctx.fillStyle = p.col;
    if (p.kind === 'paper') { ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.fillRect(-p.r, -p.r * 0.5, p.r * 2, p.r); ctx.restore(); }
    else if (p.kind === 'star') { ctx.save(); ctx.translate(p.x, p.y); ctx.beginPath(); for (let k = 0; k < 8; k++) { const r = k % 2 ? p.r * 0.4 : p.r * 1.6; ctx.lineTo(Math.cos(k * Math.PI / 4) * r, Math.sin(k * Math.PI / 4) * r); } ctx.fill(); ctx.restore(); }
    else { ctx.beginPath(); ctx.arc(p.x, p.y, p.r * (p.kind === 'drop' ? a : 1), 0, Math.PI * 2); ctx.fill(); }
  }
  ctx.globalAlpha = 1;
}
const ease = u => 1 - Math.pow(1 - Math.min(1, Math.max(0, u)), 3);
function bottleArt(c, x, y, s, rot = 0, kind = 'letter') {   // 유리병 (2D)
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s / 100, s / 100);
  c.fillStyle = 'rgba(170,230,220,.55)'; c.strokeStyle = 'rgba(255,255,255,.9)'; c.lineWidth = 3;
  c.beginPath(); c.roundRect ? c.roundRect(-46, -26, 76, 52, 18) : c.rect(-46, -26, 76, 52); c.fill(); c.stroke();
  c.fillRect(28, -12, 18, 24); c.strokeRect(28, -12, 18, 24); c.fillStyle = '#A8764A'; c.fillRect(44, -10, 12, 20);
  c.fillStyle = kind === 'map' ? '#E8D2A0' : '#FFF6E0'; c.save(); c.rotate(-0.15); c.fillRect(-32, -12, 50, 22); c.strokeStyle = kind === 'map' ? '#A8502A' : '#C8B89A'; c.lineWidth = 2; c.beginPath();
  if (kind === 'map') { c.moveTo(-26, 4); c.lineTo(-12, -4); c.lineTo(0, 2); c.lineTo(12, -6); } else { c.moveTo(-26, -4); c.lineTo(10, -4); c.moveTo(-26, 3); c.lineTo(6, 3); } c.stroke(); c.restore();
  c.fillStyle = 'rgba(255,255,255,.7)'; c.fillRect(-38, -20, 30, 6); c.restore();
}
function landedView(tip) {
  const L = S.land, t = L.t, u = ease(t / 0.9);
  if (L.bottle) {
    const x = L.from[0] + (W / 2 - L.from[0]) * u, y = L.from[1] + (H * 0.42 - L.from[1]) * u - Math.sin(Math.min(1, t / 0.9) * Math.PI) * H * 0.16, big = Math.min(W * 0.35, H * 0.4);
    ctx.strokeStyle = 'rgba(255,255,255,.8)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(tip.x, tip.y); ctx.lineTo(x, y); ctx.stroke();
    bottleArt(ctx, x, y, big * (0.4 + 0.6 * u), (1 - u) * -1.5 + Math.sin(t * 3) * 0.08, L.res.kind);
    if (t > 0.95) { const k = ease((t - 0.95) / 0.35); ctx.save(); ctx.translate(W / 2, H * 0.42 - big * 0.55); ctx.scale(0.6 + 0.4 * k, 0.6 + 0.4 * k); ctx.textAlign = 'center'; ctx.font = `bold ${Math.round(Math.min(56, W * 0.07))}px Galmuri11, sans-serif`;
      const txt = L.res.kind === 'map' ? '지도 조각을 건졌다!' : '유리병을 건졌다!'; ctx.lineWidth = 8; ctx.strokeStyle = '#2A4A5A'; ctx.strokeText(txt, 0, 0); ctx.fillStyle = '#E8FAFF'; ctx.fillText(txt, 0, 0); ctx.restore(); }
    return;
  }
  const f = L.res.fish, g = L.res.roll.grade;
  // 줄이 물고기를 끌어 올림
  const big = Math.min(W * 0.5, H * 0.55) * (['flat', 'round', 'horse', 'jelly', 'crab'].includes(f.look.shape) ? 0.7 : 1) * (f.tier === 'boss' ? 1.2 : 1);
  const x = L.from[0] + (W / 2 - L.from[0]) * u, y = L.from[1] + (H * 0.42 - L.from[1]) * u - Math.sin(Math.min(1, t / 0.9) * Math.PI) * H * 0.18;
  const len = big * (0.35 + 0.65 * u), rot = (1 - u) * -2.4 + Math.sin(t * 3) * 0.06;
  ctx.strokeStyle = 'rgba(255,255,255,.8)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(tip.x, tip.y); ctx.lineTo(x, y - len * 0.1); ctx.stroke();
  if (t > 0.85) {   // 뒤에서 퍼지는 빛
    const k = Math.min(1, (t - 0.85) / 0.4); ctx.save(); ctx.translate(W / 2, H * 0.42); ctx.rotate(t * 0.4); ctx.globalAlpha = 0.35 * k;
    for (let i = 0; i < 12; i++) { ctx.rotate(Math.PI / 6); ctx.fillStyle = i % 2 ? '#FFF6D0' : '#FFE08A'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-big * 0.12, big * 0.9); ctx.lineTo(big * 0.12, big * 0.9); ctx.fill(); }
    ctx.restore(); ctx.globalAlpha = 1;
  }
  drawFish(ctx, f, x, y, len, { t: t * 2, rot, shadow: false });
  if (t > 0.9 && t < 1.15) { ctx.fillStyle = `rgba(255,255,255,${0.7 * (1 - (t - 0.9) / 0.25)})`; ctx.fillRect(0, 0, W, H); }   // 번쩍
  if (t > 0.95) {   // "낚았다!" + 등급 도장
    const k = ease((t - 0.95) / 0.35), sc = 0.6 + 0.4 * k + Math.sin(Math.min(1, (t - 0.95) / 0.35) * Math.PI) * 0.15;
    ctx.save(); ctx.translate(W / 2, H * 0.42 - big * 0.5); ctx.scale(sc, sc); ctx.textAlign = 'center'; ctx.font = `bold ${Math.round(Math.min(64, W * 0.08))}px Galmuri11, sans-serif`;
    ctx.lineWidth = 8; ctx.strokeStyle = '#5A3420'; const tt = f.hidden ? '숨은 물고기 발견!' : f.tier === 'boss' ? '보스를 낚았다!' : '낚았다!'; ctx.strokeText(tt, 0, 0); ctx.fillStyle = f.hidden ? '#E8D2FF' : '#FFF4D6'; ctx.fillText(tt, 0, 0); ctx.restore();
  }
  if (t > 1.25) {
    const k = ease((t - 1.25) / 0.3), r = Math.min(52, W * 0.06); ctx.save(); ctx.translate(W / 2 + big * 0.45, H * 0.42 + big * 0.18); ctx.rotate(-0.25 + (1 - k) * 1.5); ctx.scale(2 - k, 2 - k); ctx.globalAlpha = k;
    ctx.fillStyle = g.color; ctx.strokeStyle = '#fff'; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.font = `bold ${Math.round(r * (g.g === 'SS' ? 0.9 : 1.1))}px Galmuri11, sans-serif`; ctx.fillText(g.g, 0, r * 0.38); ctx.restore();
    ctx.save(); ctx.textAlign = 'center'; ctx.font = '20px Galmuri11, sans-serif'; ctx.fillStyle = '#fff'; ctx.strokeStyle = 'rgba(40,20,10,.7)'; ctx.lineWidth = 5; const txt = `${f.name} · ${L.res.roll.size}cm`; ctx.globalAlpha = k; ctx.strokeText(txt, W / 2, H * 0.42 + big * 0.3); ctx.fillText(txt, W / 2, H * 0.42 + big * 0.3); ctx.restore();
  }
}
function splash(x, y, t) { ctx.fillStyle = 'rgba(255,255,255,.8)'; for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI - Math.PI, r = 10 + (t * 40 % 20); ctx.beginPath(); ctx.arc(x + Math.cos(a) * r, y + Math.sin(a) * r * 0.6, 2.5, 0, Math.PI * 2); ctx.fill(); } }
function fightView(bx, by) {
  const b = S.battle, f = b.fish, L = laneRect();
  // 물 위로 뛰어오르는 물고기 (가끔)
  const jump = Math.max(0, Math.sin(S.t * (f.tier === 'boss' ? 1.1 : 1.7))) ** 6;
  if (jump > 0.05) { const len = f.tier === 'boss' ? Math.min(W * 0.45, H * 0.6) : Math.min(220, 60 + f.size[1] * 0.4); ctx.save(); ctx.globalAlpha = Math.min(1, jump * 2); drawFish(ctx, f, bx + (b.x - 0.5) * 120, by - jump * H * 0.12, len * (0.5 + 0.5 * S.roll.p), { t: S.t, flip: b.dir < 0, rot: (b.dir < 0 ? 1 : -1) * 0.3 * Math.cos(S.t * 1.7) }); ctx.restore(); splash(bx + (b.x - 0.5) * 120, by + 6, S.t); }
  // 위쪽: 체력·시간
  const isB = f.tier === 'boss', hw = Math.min(W * 0.62, 620), hx = (W - hw) / 2, hy = Math.max(60, H * 0.1) + (isB ? 10 : 0), bh = isB ? 24 : 18;
  const pct = b.hp / b.maxHp, g = ctx.createLinearGradient(hx, 0, hx + hw, 0);
  if (isB) {   // 보스 체력: 금테 · 이름판 · 포효 눈금
    ctx.fillStyle = 'rgba(30,10,14,.8)'; rr(hx - 8, hy - 8, hw + 16, bh + 16, 14); ctx.fill(); ctx.strokeStyle = '#F2C23A'; ctx.lineWidth = 3; rr(hx - 8, hy - 8, hw + 16, bh + 16, 14); ctx.stroke();
    g.addColorStop(0, '#C8203A'); g.addColorStop(0.5, '#F25A3A'); g.addColorStop(1, '#F2A23A');
    ctx.fillStyle = g; rr(hx, hy, Math.max(0.01, hw * pct), bh, 8); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.25)'; rr(hx, hy, Math.max(0.01, hw * pct), bh * 0.4, 6); ctx.fill();
    for (const m of [0.6, 0.3]) { ctx.fillStyle = pct < m ? 'rgba(255,255,255,.25)' : '#FFE27A'; ctx.fillRect(hx + hw * m - 1.5, hy - 4, 3, bh + 8); }
    ctx.font = 'bold 15px Galmuri11, sans-serif'; ctx.textAlign = 'center'; const nm = `👑 ${f.name}`, nw = ctx.measureText(nm).width + 30;
    ctx.fillStyle = '#F2C23A'; rr(W / 2 - nw / 2, hy - 30, nw, 24, 12); ctx.fill(); ctx.fillStyle = '#3A1E0A'; ctx.fillText(nm, W / 2, hy - 12);
    ctx.fillStyle = '#fff'; ctx.font = '13px Galmuri11, sans-serif'; ctx.textAlign = 'left'; ctx.fillText(`${b.hp}/${b.maxHp}`, hx + 10, hy + bh - 6);
    ctx.textAlign = 'right'; ctx.fillText(`${S.roll.size}cm  ${S.roll.grade.g}`, hx + hw - 10, hy + bh - 6);
  } else {
    ctx.fillStyle = 'rgba(20,30,40,.55)'; rr(hx - 4, hy - 4, hw + 8, 26, 13); ctx.fill();
    g.addColorStop(0, pct < 0.3 ? '#F25A4A' : '#6BD04A'); g.addColorStop(1, pct < 0.3 ? '#F2A04A' : '#B8F25A');
    ctx.fillStyle = g; rr(hx, hy, hw * pct, 18, 9); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = '13px Galmuri11, sans-serif'; ctx.textAlign = 'left'; ctx.fillText(`${f.name}  ${b.hp}/${b.maxHp}`, hx + 10, hy + 14);
    ctx.textAlign = 'right'; ctx.fillText(`${S.roll.size}cm  ${S.roll.grade.g}`, hx + hw - 10, hy + 14);
  }
  // 시간 원
  const tx = hx + hw + 40, ty = hy + bh / 2; ctx.fillStyle = 'rgba(20,30,40,.55)'; ctx.beginPath(); ctx.arc(tx, ty, 26, 0, 7); ctx.fill();
  ctx.strokeStyle = b.time < 5 ? '#F25A4A' : '#9FE0FF'; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(tx, ty, 22, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * b.time / b.maxTime); ctx.stroke();
  ctx.fillStyle = '#fff'; ctx.font = 'bold 20px Galmuri11, sans-serif'; ctx.textAlign = 'center'; ctx.fillText(Math.ceil(b.time), tx, ty + 7);
  // 하트 (줄 버팀)
  for (let i = 0; i < b.maxHearts; i++) heart(hx + 12 + i * 30, hy + bh + 26, 11, i < b.hearts);
  // 레인
  ctx.fillStyle = 'rgba(10,40,60,.35)'; rr(L.x - 14, L.y - 18, L.w + 28, L.h + 36, 22); ctx.fill();
  if (S.laneFlash) { ctx.fillStyle = `rgba(${S.laneFlash.col},${0.45 * (1 - S.laneFlash.t / 0.25)})`; rr(L.x - 14, L.y - 18, L.w + 28, L.h + 36, 22); ctx.fill(); }
  for (const t of b.targets) {
    if (t.wait > 0) continue;
    const cx = L.x + t.x * L.w, wpx = b.w * L.w;
    ctx.fillStyle = t.gold ? 'rgba(255,214,80,.95)' : 'rgba(255,255,255,.85)'; ctx.strokeStyle = t.gold ? '#B8860B' : 'rgba(80,140,180,.8)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(cx, L.y + L.h / 2, wpx, 0, Math.PI * 2); ctx.fill(); ctx.stroke();   // 동그란 과녁
    ctx.strokeStyle = t.gold ? '#fff' : 'rgba(80,140,180,.6)'; ctx.beginPath(); ctx.arc(cx, L.y + L.h / 2, wpx * G.LANE.perfect, 0, Math.PI * 2); ctx.stroke();
  }
  // 물고기 표시
  const mx = L.x + b.x * L.w; drawFish(ctx, f, mx, L.y - 6, 84, { t: S.t, flip: b.dir < 0 });
  ctx.fillStyle = 'rgba(255,255,255,.9)'; ctx.beginPath(); ctx.moveTo(mx, L.y + L.h + 2); ctx.lineTo(mx - 6, L.y + L.h + 12); ctx.lineTo(mx + 6, L.y + L.h + 12); ctx.fill();
  // 글자 효과
  for (const e of S.fx) {
    const x = L.x + e.at * L.w, y = L.y - 30 - e.t * 50; ctx.globalAlpha = 1 - e.t / 0.9; ctx.textAlign = 'center';
    if (e.kind === 'ring') { ctx.globalAlpha = 1; const k = e.t / 0.9, cx = L.x + e.at * L.w; ctx.strokeStyle = e.r.gold ? `rgba(255,214,80,${1 - k})` : `rgba(255,255,255,${1 - k})`; ctx.lineWidth = 4 * (1 - k) + 1; ctx.beginPath(); ctx.arc(cx, L.y + L.h / 2, 12 + k * 46, 0, Math.PI * 2); ctx.stroke(); continue; }
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
  $('resTop').innerHTML = `${res.newDex ? '<span class="new">NEW 도감!</span>' : ''}${res.newBest ? '<span class="new best">최고 기록!</span>' : ''}${f.tier === 'boss' ? '<span class="new boss">👑 보스</span>' : ''}${f.hidden ? '<span class="new secret">🔍 숨은 물고기</span>' : ''}`;
  const c = $('resFish'), x = c.getContext('2d'); x.clearRect(0, 0, c.width, c.height);
  drawFish(x, f, c.width / 2, c.height / 2, ['flat', 'round', 'horse', 'jelly', 'crab'].includes(f.look.shape) ? 210 : 380, { t: 0.2, shadow: true });
  $('resInfo').innerHTML = `<h2>${f.name} <span class="grade g${g.g}">${g.g}</span></h2><p class="size">${res.roll.size}cm <small>(${f.size[0]}~${f.size[1]}cm)</small> · ${TIERS[f.tier].name}</p><p class="desc">${f.desc}</p>
    <p class="coin">🪙 ${res.coins.toLocaleString()} ${res.autoSold ? '<small>(가방이 꽉 차서 바로 팔았어요)</small>' : '<small>가방에 넣었어요</small>'}</p>`;
  let ex = `<div class="expLine">⭐ +${res.exp} EXP${res.levelUps.length ? ` · <b>레벨 업! Lv.${res.levelUps[res.levelUps.length - 1]}</b> (🪙 +${res.levelUps.reduce((a, l) => a + l * 100, 0).toLocaleString()})` : ''}</div>`;
  if (res.drops.length) ex += `<div class="drops">🎁 ${res.drops.map(d => `<b>${nameOf(d.item)}</b>${d.n > 1 ? ' ×' + d.n : ''}`).join(', ')} 을(를) 건졌어요!</div>`;
  for (const s of res.sets) ex += `<div class="setDone">📖 도감 세트 「${s.name}」 완성! 보상: 🪙${(s.reward.coins || 0).toLocaleString()}${Object.entries(s.reward.items || {}).map(([k, n]) => ' · ' + nameOf(k) + (n > 1 ? ' ×' + n : '')).join('')}</div>`;
  for (const t of res.titles) ex += `<div class="setDone">🏅 새 칭호 「${t.name}」! <small>${t.desc} · ${statLine(t.stats)}</small></div>`;
  if (res.unlocked) ex += `<div class="setDone">🌊 새 바다 「${STAGES[res.unlocked - 1].name}」 가 열렸어요!</div>`;
  $('resExtra').innerHTML = ex; $('result').hidden = false;
  if (res.sets.length || res.unlocked || f.tier === 'boss' || f.hidden || res.levelUps.length || res.titles.length) snd.fanfare();
}
/** 유리병을 열었을 때 */
function showBottle(res) {
  const c = $('resFish'), x = c.getContext('2d'); x.clearRect(0, 0, c.width, c.height); bottleArt(x, c.width / 2, c.height / 2, 190, -0.12, res.kind);
  let top = '<span class="new secret">📜 유리병</span>', info = '', ex = '';
  if (res.kind === 'letter') { const l = LETTER_BY_ID[res.id]; top += l.kind === 'hint' ? '<span class="new best">🔍 힌트</span>' : '';
    info = `<h2>${l.title}</h2><p class="letter">${l.text}</p>`; ex = `<div class="setDone">📜 모험 수첩에 적어 뒀어요 (편지 ${Object.keys(save.letters).length}/${LETTERS.length}) · N 키</div>`; }
  else if (res.kind === 'map') { info = `<h2>🗺️ 지도 조각 ${res.pieces}/${MAP_STAGES.length}</h2><p class="letter">${stage().name}의 주인을 이긴 낚시꾼에게 떠내려온 지도 조각이에요. ${res.pieces < MAP_STAGES.length ? `나머지 조각은 ${MAP_STAGES.filter(s => !save.map[s]).map(s => STAGES[s - 1].name).join(', ')}에 있을 것 같아요.` : '조각을 맞추자 어딘가로 가는 길이 보여요…'}</p>`;
    if (res.opened) ex = `<div class="setDone">🧸 숨은 바다 「${STAGES[res.opened - 1].name}」가 열렸어요! 바다 고르기에서 가 보세요.</div>`; }
  else info = `<h2>빈 유리병</h2><p class="letter">편지는 없고 반짝이는 동전이 들어 있었어요.</p>`, ex = `<div class="drops">🪙 +${res.n.toLocaleString()}</div>`;
  for (const t of res.titles || []) ex += `<div class="setDone">🏅 새 칭호 「${t.name}」! <small>${t.desc}</small></div>`;
  $('resTop').innerHTML = top; $('resInfo').innerHTML = info + '<p class="small">미끼는 그대로예요.</p>'; $('resExtra').innerHTML = ex; $('result').hidden = false;
  if (res.kind === 'map') snd.fanfare(); else snd.coin();
}
function closeResult() { $('result').hidden = true; setMode('idle'); snd.click(); }
$('resOk').onclick = closeResult;
const nameOf = id => (ITEM_BY_ID[id] || BAIT_BY_ID[id] || {}).name || id;

// ---------------------------------------------------------------- 창 (가방·상점·도감·꾸미기·바다·미끼)
let sheetKind = null, sheetTab = null;
function openSheet(kind, tab) {
  if (S.mode !== 'idle' && !['dex', 'title', 'note'].includes(kind)) { say('낚시가 끝난 뒤에 열 수 있어요', 'warn'); return; }
  sheetKind = kind; sheetTab = tab || ({ shop: 'rod', dex: String(save.stage), dress: 'char', note: 'letters' }[kind] || null); $('sheet').hidden = false; snd.click(); drawSheet();
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
    const list = sheetTab === 'bait' ? BAITS.filter(b => b.price && b.shop !== false) : ITEMS.filter(i => (sheetTab === 'wear' ? ['hat', 'outfit', 'acc'].includes(i.slot) : i.slot === sheetTab) && !i.start);
    B.innerHTML = `<div class="list">${list.map(it => {
      const isBait = !!BAIT_BY_ID[it.id], have = isBait ? (save.items[it.id] || 0) : G.owned(save, it.id);
      const how = isBait ? `${it.pack}개 🪙${it.price.toLocaleString()}` : it.shop ? `🪙 ${it.shop.toLocaleString()}` : it.drop ? '🎁 드랍으로만' : '📖 도감 세트 보상';
      const btn = isBait ? `<button class="btn" data-buy="${it.id}" ${save.coins < it.price ? 'disabled' : ''}>사기</button>` : have ? `<span class="tag">가지고 있음</span>` : it.shop ? `<button class="btn" data-buy="${it.id}" ${save.coins < it.shop ? 'disabled' : ''}>사기</button>` : `<span class="tag lock">🔒</span>`;
      return `<div class="item ${!isBait && !it.shop && !have ? 'locked' : ''}"><div class="ico" style="--c:${it.color || '#ddd'}">${iconFor(it)}</div><div class="txt"><b>${it.name}</b>${isBait ? `<div><span class="st">👑 보스 ${pct(it.boss)}</span></div>` : `<div>${statLine(it.stats)}</div>`}<small>${it.desc}</small>${isBait ? `<small>가진 개수 ${have}</small>` : ''}</div><div class="how">${how}${btn}</div></div>`;
    }).join('')}</div>`;
    B.querySelectorAll('[data-buy]').forEach(b => b.onclick = () => { const r = G.buy(save, b.dataset.buy); if (!r.ok) { say(r.why, 'warn'); return; } persist(); snd.coin(); say(`${nameOf(b.dataset.buy)} 샀어요!`, 'good'); drawSheet(); });
  }
  else if (sheetKind === 'dex') {
    const [a, n] = G.dexCount(save); $('sheetTitle').textContent = `📖 도감 ${a}/${n}`;
    tabs([...STAGES.filter(s => !s.hidden || save.hiddenSea).map(s => [String(s.id), STAGE_ICON[s.id - 1] + ' ' + s.name]), ['sets', '세트 보상']]);
    if (sheetTab === 'sets') {
      B.innerHTML = `<div class="list">${SETS.map(s => { const [h, t] = G.setProgress(save, s), done = save.sets[s.id];
        const rw = `🪙${(s.reward.coins || 0).toLocaleString()}${Object.entries(s.reward.items || {}).map(([k, n]) => ' · ' + nameOf(k) + (n > 1 ? ' ×' + n : '')).join('')}`;
        return `<div class="item ${done ? 'done' : ''}"><div class="ico">${done ? '✅' : '📖'}</div><div class="txt"><b>${s.name}</b><small>${s.grade ? `아무 물고기나 ${s.grade} 등급으로 ${s.count}종` : s.fish.map(id => save.dex[id] ? FISH_BY_ID[id].name : '？').join(' · ')}</small><div class="bar"><i style="width:${h / t * 100}%"></i></div></div><div class="how">${h}/${t}<small>${rw}</small></div></div>`; }).join('')}</div>`;
    } else {
      const sid = +sheetTab, locked = !G.canGo(save, sid), hid = FISH.filter(f => f.stage === sid && f.hidden);
      const hidLine = hid.length ? `<p class="small secretLine">🔍 이 바다의 숨은 물고기: ${hid.some(f => save.dex[f.id]) ? '찾았어요!' : '어딘가에 숨어 있대요… 유리병 편지를 찾아보세요'}</p>` : '';
      B.innerHTML = (locked ? `<p class="empty">🔒 앞 바다의 보스를 잡으면 열려요</p>` : '') + hidLine + `<div class="grid dex">${FISH.filter(f => f.stage === sid && (!f.hidden || save.dex[f.id])).map(f => { const d = save.dex[f.id];
        return `<div class="cell ${d ? '' : 'unk'} t-${f.tier} ${f.hidden ? 't-secret' : ''}" data-fish="${f.id}"><img src="${thumb(f, !!d)}"><b>${d ? f.name : '？？？'}</b><span>${d ? `${f.hidden ? '🔍 ' : ''}최대 ${d.max}cm <i class="grade g${d.best}">${d.best}</i>` : TIERS[f.tier].name}${f.bait ? ' · ' + baitIcon(f.bait[0]) + ' 전용' : ''}</span></div>`; }).join('')}</div><div id="dexInfo"></div>`;
      B.querySelectorAll('[data-fish]').forEach(c => c.onclick = () => { const f = FISH_BY_ID[c.dataset.fish], d = save.dex[f.id]; $('dexInfo').innerHTML = d ? `<div class="info"><img src="${thumb(f, true)}"><div><b>${f.name}</b> <small>${TIERS[f.tier].name} · ${f.size[0]}~${f.size[1]}cm</small><p>${f.desc}</p><small>잡은 수 ${d.n} · 가장 큰 것 ${d.max}cm · 최고 등급 ${d.best}</small></div></div>` : `<div class="info"><p>아직 못 잡은 물고기예요. ${TIERS[f.tier].name} 등급${f.bait ? ` · ${f.bait.map(b => baitIcon(b) + ' ' + BAIT_BY_ID[b].name).join(', ')}(으)로만 낚여요` : f.tier === 'boss' ? ' · 낚시하다 보면 우연히 나타나요 (황금 미끼·잘 던지기면 더 자주)' : ['r', 'e'].includes(f.tier) ? ' · 좋은 미끼를 써 보세요' : ''}</p></div>`; });
    }
  }
  else if (sheetKind === 'dress') {
    $('sheetTitle').textContent = '👕 꾸미기 · 장비';
    tabs([['char', '캐릭터'], ['rod', '낚싯대'], ['line', '줄'], ['float', '찌'], ['hat', '모자'], ['outfit', '옷'], ['acc', '장신구']]);
    const tot = G.stats(save);
    let h = `<div class="dress"><canvas id="avPrev" width="320" height="320"></canvas><div class="tot"><b>내 능력치</b>${Object.entries(tot).map(([k, v]) => `<span class="st">${G.STAT_NAMES[k]} ${['pow', 'heart', 'time'].includes(k) ? v : Math.round(v * 100) + '%'}</span>`).join('')}</div></div>`;
    if (sheetTab === 'char') h += `<div class="grid chars">${CHARACTERS.map(a => `<button class="cell ${save.gender === a.id ? 'on' : ''}" data-gender="${a.id}"><canvas width="200" height="240" data-av="${a.id}"></canvas><b>${a.name}</b></button>`).join('')}</div><p class="small">옷 색·모자·장신구는 캐릭터에 그대로 입혀져요.</p>`;
    else h += `<div class="list">${ITEMS.filter(i => i.slot === sheetTab).map(it => { const have = G.owned(save, it.id), on = save.eq[it.slot] === it.id;
      return `<div class="item ${have ? '' : 'locked'} ${on ? 'on' : ''}"><div class="ico" style="--c:${it.color}">${iconFor(it)}</div><div class="txt"><b>${it.name}</b><div>${statLine(it.stats)}</div><small>${it.desc}</small></div><div class="how">${on ? '<span class="tag">착용 중</span>' : have ? `<button class="btn" data-eq="${it.id}">쓰기</button>` : `<span class="tag lock">${it.shop ? '🏪 상점' : it.drop ? '🎁 드랍' : '📖 세트'}</span>`}</div></div>`; }).join('')}</div>`;
    B.innerHTML = h;
    const av = { g: save.gender || 'm', hat: save.eq.hat, outfit: save.eq.outfit, acc: save.eq.acc };
    portraitInto($('avPrev'), av);
    B.querySelectorAll('[data-av]').forEach(c => portraitInto(c, { ...av, g: c.dataset.av }));
    B.querySelectorAll('[data-gender]').forEach(b => b.onclick = () => { save.gender = b.dataset.gender; persist(); snd.click(); drawSheet(); });
    B.querySelectorAll('[data-eq]').forEach(b => b.onclick = () => { G.equip(save, b.dataset.eq); persist(); snd.click(); drawSheet(); });
  }
  else if (sheetKind === 'stage') {
    $('sheetTitle').textContent = '🌊 바다 고르기';
    const pcs = G.mapPieces(save), teaser = !save.hiddenSea && pcs ? `<div class="item stage locked"><div class="ico">🗺️</div><div class="txt"><b>？？？</b><small>지도 조각 ${pcs}/${MAP_STAGES.length} — 조각을 다 모으면 어딘가로 가는 길이 보일 것 같아요.</small></div><div class="how"><span class="tag lock">🔍</span></div></div>` : '';
    B.innerHTML = `<div class="list">${STAGES.filter(s => !s.hidden || save.hiddenSea).map(s => { const lock = !G.canGo(save, s.id), got = FISH.filter(f => f.stage === s.id && !f.hidden && save.dex[f.id]).length, tot = FISH.filter(f => f.stage === s.id && !f.hidden).length;
      return `<div class="item stage ${lock ? 'locked' : ''} ${save.stage === s.id ? 'on' : ''}" style="--a:${s.sea[0]};--b:${s.sky[0]}"><div class="ico">${STAGE_ICON[s.id - 1]}</div><div class="txt"><b>${s.id}. ${s.name}</b><small>${s.desc}</small><small>도감 ${got}/${tot} · 보스 ${save.dex[s.boss] ? '✅ ' + FISH_BY_ID[s.boss].name : '？'}${s.hidden ? ' · 🧸 숨은 바다' : ''}</small></div><div class="how">${lock ? '<span class="tag lock">🔒 앞 바다 보스</span>' : save.stage === s.id ? '<span class="tag">여기 있어요</span>' : `<button class="btn" data-stage="${s.id}">가기</button>`}</div></div>`; }).join('')}${teaser}</div>`;
    B.querySelectorAll('[data-stage]').forEach(b => b.onclick = () => { save.stage = +b.dataset.stage; persist(); snd.stage(save.stage); closeSheet(); say(`🌊 ${stage().name}`, 'good'); });
  }
  else if (sheetKind === 'title') {
    $('sheetTitle').textContent = `🏅 Lv.${save.lv} · 칭호 ${Object.keys(save.titles).length}/${TITLES.length}`;
    const need = LEVEL.need(save.lv);
    B.innerHTML = `<div class="item"><div class="ico">⭐</div><div class="txt"><b>레벨 ${save.lv}${save.lv >= LEVEL.max ? ' (최고)' : ''}</b><div class="bar"><i style="width:${save.lv >= LEVEL.max ? 100 : save.exp / need * 100}%"></i></div><small>${save.lv >= LEVEL.max ? '최고 레벨이에요' : `다음 레벨까지 ${(need - save.exp).toLocaleString()} EXP`} · 레벨 효과: 힘 +${Math.floor(save.lv / 2)}, 하트 +${Math.floor(save.lv / 15)} · 레벨이 오를 때마다 동전</small></div></div>
      <p class="small">칭호는 하나만 달 수 있고, 단 칭호의 효과만 능력치에 들어가요.</p><div class="list">${TITLES.map(t => { const got = save.titles[t.id], on = save.title === t.id, [h, n] = G.titleValue(save, t.cond);
      return `<div class="item ${got ? '' : 'locked'} ${on ? 'on' : ''}"><div class="ico">${got ? '🏅' : '🔒'}</div><div class="txt"><b>${t.name}</b><div>${statLine(t.stats)}</div><small>${t.desc}</small>${got ? '' : `<div class="bar"><i style="width:${Math.min(100, h / n * 100)}%"></i></div>`}</div><div class="how">${got ? (on ? '<span class="tag">다는 중</span>' : `<button class="btn" data-title="${t.id}">달기</button>`) : `${Math.min(h, n)}/${n}`}</div></div>`; }).join('')}</div>`;
    B.querySelectorAll('[data-title]').forEach(b => b.onclick = () => { save.title = b.dataset.title; persist(); snd.click(); drawSheet(); });
  }
  else if (sheetKind === 'note') {   // 모험 수첩: 편지 · 지도 · 숨은 물고기
    const [hf, ht] = G.secretCount(save), pcs = G.mapPieces(save), nl = Object.keys(save.letters).length;
    $('sheetTitle').textContent = `📜 모험 수첩`; tabs([['letters', `편지 ${nl}/${LETTERS.length}`], ['map', `지도 ${pcs}/${MAP_STAGES.length}`], ['secret', `숨은 물고기 ${hf}/${ht}`]]);
    if (sheetTab === 'map') {
      B.innerHTML = `<div class="mapBox">${MAP_STAGES.map(st => `<div class="mapPiece ${save.map[st] ? 'got' : ''}">${save.map[st] ? `<b>${STAGE_ICON[st - 1]}</b><small>${STAGES[st - 1].name}</small>` : '<b>？</b>'}</div>`).join('')}</div>
        <p class="small">${save.hiddenSea ? '🧸 지도를 다 맞췄어요. 「장난감 상자 바다」로 가는 길이 열렸어요!' : '지도 조각은 유리병에 담겨 떠다녀요. 어느 바다의 주인을 이겨야 그 바다에서 조각이 떠내려온대요.'}</p>`;
    } else if (sheetTab === 'secret') {
      B.innerHTML = `<p class="small">숨은 물고기는 도감에 칸이 없어요. 특별한 조건을 채워야만 가끔 물어요. 힌트는 그 바다에서 건진 유리병 편지에.</p><div class="grid dex">${FISH.filter(f => f.hidden).map(f => { const d = save.dex[f.id], hint = LETTERS.find(l => l.fish === f.id), hr = hint && save.letters[hint.id];
        return `<div class="cell ${d ? 't-secret' : 'unk'}"><img src="${thumb(f, !!d)}"><b>${d ? f.name : '？？？'}</b><span>${STAGE_ICON[f.stage - 1]} ${STAGES[f.stage - 1].name}${d ? '' : hr ? ' · 📜 힌트 있음' : ''}</span></div>`; }).join('')}</div>`;
    } else {
      B.innerHTML = `<div class="list">${LETTERS.map(l => { const got = save.letters[l.id];
        return `<div class="item ${got ? '' : 'locked'}"><div class="ico">${got ? (l.kind === 'hint' ? '🔍' : '📜') : '✉️'}</div><div class="txt"><b>${got ? l.title : '아직 못 건진 편지'}</b><small>${got ? l.text : l.kind === 'hint' ? `${STAGES[l.stage - 1].name} 어딘가에 떠다니는 것 같아요` : '어느 바다에서든 떠내려올지도 몰라요'}</small></div></div>`; }).join('')}</div>
        <p class="small">유리병은 낚시하다 가끔 물고기 대신 올라와요. 유리병을 건져도 미끼는 그대로예요.</p>`;
    }
  }
  else if (sheetKind === 'bait') {
    $('sheetTitle').textContent = '🪱 미끼 고르기';
    const only = id => FISH.filter(f => f.bait && f.bait.includes(id));
    B.innerHTML = `<div class="list">${BAITS.map(b => { const n = save.items[b.id] || 0, can = b.id === 'bait0' || n > 0, on = save.eq.bait === b.id, sp = only(b.id);
      return `<div class="item ${can ? '' : 'locked'} ${on ? 'on' : ''}"><div class="ico">${baitIcon(b.id)}</div><div class="txt"><b>${b.name}</b><div><span class="st">👑 보스 ${pct(G.bossChance(b.id, ST, null, save.calm))}</span>${sp.length ? `<span class="st">이 미끼로만: ${sp.map(f => save.dex[f.id] ? f.name : '？？？').join(', ')}</span>` : ''}</div><small>${b.desc}</small></div><div class="how">${b.id !== 'bait0' ? '×' + n : '∞'}${on ? '<span class="tag">쓰는 중</span>' : can ? `<button class="btn" data-bait="${b.id}">쓰기</button>` : `<span class="tag lock">${b.shop === false ? '🎁 드랍' : '🏪 상점'}</span>`}</div></div>`; }).join('')}</div>
      <p class="small">👑 보스는 낚시하다가 우연히 나타나요. 미끼마다 확률이 다르고, 가운데로 잘 던질수록·행운이 높을수록·보스를 오래 못 만났을수록 조금씩 더 자주 나와요.</p>`;
    B.querySelectorAll('[data-bait]').forEach(b => b.onclick = () => { G.equip(save, b.dataset.bait); persist(); snd.click(); closeSheet(); });
  }
}
function iconFor(it) { return { rod: '🎣', line: '🧵', float: '🔴', hat: '🎩', outfit: '👕', acc: '💍' }[it.slot] || (BAIT_BY_ID[it.id] ? baitIcon(it.id) : '🎁'); }
function portraitInto(c, av, o) { const x = c.getContext('2d'); if (toy) toy.portrait(av, ITEM_BY_ID, c, o); else { x.clearRect(0, 0, c.width, c.height); drawAvatarFront(x, c.width / 2, c.height * 0.94, c.height * 0.9, { ...av, animal: ANIMALS[av.g === 'f' ? 2 : 0] }, ITEM_BY_ID, 0); } }

// ---------------------------------------------------------------- 입력
$('btnAct').addEventListener('pointerdown', e => { e.preventDefault(); act(); });
cv.addEventListener('pointerdown', e => { e.preventDefault(); act(); });
addEventListener('keydown', e => {
  if (e.repeat) return;
  if (e.code === 'Space' || e.code === 'Enter') { e.preventDefault(); if (!$('intro').hidden) { start(); return; } act(); return; }
  if (!$('intro').hidden && (e.code === 'ArrowLeft' || e.code === 'ArrowRight')) { save.gender = e.code === 'ArrowLeft' ? 'm' : 'f'; persist(); introChars(); return; }
  if (e.code === 'Escape') { if (!$('result').hidden) closeResult(); else if (!$('sheet').hidden) closeSheet(); else cancelCast(); return; }
  if (e.code === 'KeyX' && $('sheet').hidden && $('intro').hidden) { cancelCast(); return; }
  if (!$('intro').hidden || !$('result').hidden) return;
  const k = { KeyB: 'bag', KeyS: 'shop', KeyD: 'dex', KeyC: 'dress', KeyT: 'title', KeyN: 'note' }[e.code]; if (k) { if (sheetKind === k) closeSheet(); else openSheet(k); }
});
document.querySelectorAll('[data-open]').forEach(b => b.onclick = () => openSheet(b.dataset.open));
$('btnStage').onclick = () => openSheet('stage'); $('lvPill').onclick = () => openSheet('title'); $('btnBait').onclick = () => openSheet('bait');
$('btnCancel').addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); snd.init(); cancelCast(); });
$('btnSound').onclick = () => { snd.init(); snd.toggle(); hud(); };
$('btnHap').onclick = () => { hapOn = !hapOn; try { localStorage.setItem('getfish_haptic', hapOn ? 'on' : 'off'); } catch (e) { } hud(); if (hapOn) haptic('perfect'); say(hapOn ? '📳 진동 켬' : '진동 끔', 'good', 900); };
function start() { if (!save.gender) { say('먼저 낚시꾼을 골라 주세요', 'warn', 1200); return; } snd.init(); snd.stage(save.stage); $('intro').hidden = true; snd.click(); }
$('startBtn').onclick = start;
// 처음 화면: 남자·여자 낚시꾼 고르기
function introChars() {
  const box = $('pickChar'); if (!box) return;
  box.innerHTML = CHARACTERS.map(c => `<button class="pick ${save.gender === c.id ? 'on' : ''}" data-g="${c.id}"><canvas width="220" height="260"></canvas><b>${c.name}</b></button>`).join('');
  box.querySelectorAll('[data-g]').forEach(b => { portraitInto(b.querySelector('canvas'), { g: b.dataset.g, hat: save.eq.hat, outfit: save.eq.outfit, acc: save.eq.acc }, { turn: b.dataset.g === 'm' ? 0.35 : -0.35 });
    b.onclick = () => { save.gender = b.dataset.g; persist(); snd.init(); snd.click(); haptic('nice'); introChars(); }; });
  $('startBtn').disabled = !save.gender; $('pickHint').textContent = save.gender ? '' : '함께 낚시할 장난감 낚시꾼을 골라 주세요';
}
introChars();
// 버튼을 누른 뒤 Space가 그 버튼을 다시 누르지 않게
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('button'); if (b) { setTimeout(() => b.blur(), 0); if (b.id !== 'btnAct') haptic('ui'); } }, true);

hud(); actButton(); requestAnimationFrame(frame);
window.__gf = { S, get save() { return save; }, G, act, openSheet, closeSheet, showResult, persist, set save(v) { save = v; persist(); } };
