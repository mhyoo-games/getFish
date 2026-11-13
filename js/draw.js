// getFish 그림: 모두 canvas로 직접 그려요 (그림 파일 없음).
// drawFish: 물고기 52종 (모양·색·무늬를 data.js의 look으로) · drawScene: 바다와 배 · drawAngler: 뒷모습 낚시꾼 + 아바타

const TAU = Math.PI * 2;
function rng(seed) { let h = 2166136261; for (const c of String(seed)) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return () => ((h = Math.imul(h ^ (h >>> 15), 2246822507) ^ Math.imul(h ^ (h >>> 13), 3266489909)) >>> 0) / 4294967296; }
function shade(hex, k) {   // k>0 밝게, k<0 어둡게
  const n = parseInt(hex.slice(1, 7), 16); let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  if (k > 0) { r += (255 - r) * k; g += (255 - g) * k; b += (255 - b) * k; } else { r *= 1 + k; g *= 1 + k; b *= 1 + k; }
  return `rgb(${r | 0},${g | 0},${b | 0})`;
}
const OUT = 'rgba(66,36,30,.62)';   // 갈색 먹선 (수채화 그림책 느낌)

// ---------------------------------------------------------------- 물고기
/** 물고기 그리기: (x,y) 가운데, 길이 L, 오른쪽을 봄 (flip이면 왼쪽). t: 헤엄 흔들림.
 *  한 번 수채화로 칠한 그림(스프라이트)을 저장해 두고 붙여 넣어요. */
export function drawFish(ctx, f, x, y, L, o = {}) {
  const sp = fishSprite(f, L);
  ctx.save(); ctx.translate(x, y); if (o.flip) ctx.scale(-1, 1); if (o.rot) ctx.rotate(o.rot);
  const t = o.t || 0, sw = 1 + Math.sin(t * 6) * 0.025;
  if (o.shadow) { ctx.save(); ctx.globalAlpha = 0.18; ctx.fillStyle = '#000'; ctx.beginPath(); ctx.ellipse(0, L * 0.32, L * 0.42, L * 0.06, 0, 0, TAU); ctx.fill(); ctx.restore(); }
  const k = L / sp.L; ctx.scale(k * sw, k / sw); ctx.rotate(Math.sin(t * 6) * 0.03);
  ctx.drawImage(sp.c, -sp.c.width / 2 / sp.q, -sp.c.height / 2 / sp.q, sp.c.width / sp.q, sp.c.height / sp.q);
  ctx.restore();
}
const SPR = new Map();
let GRAIN = null;
function grain() {   // 종이 결 (한 번만 만듦)
  if (GRAIN) return GRAIN; const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d'), d = x.createImageData(256, 256), R = rng('paper');
  for (let i = 0; i < d.data.length; i += 4) { const v = 200 + R() * 55 - (R() < 0.04 ? 60 : 0); d.data[i] = v; d.data[i + 1] = v * 0.97; d.data[i + 2] = v * 0.92; d.data[i + 3] = 255; }
  x.putImageData(d, 0, 0); return (GRAIN = c);
}
/** 수채화 스프라이트: 벡터로 그린 뒤 → 빛과 그늘 → 붓 자국 → 종이 결 → 가장자리 물감 고임 → 위쪽 테두리 빛 */
export function fishSprite(f, L0) {
  const L = L0 <= 90 ? 96 : L0 <= 180 ? 192 : 384, key = f.id + ':' + L;
  if (SPR.has(key)) return SPR.get(key);
  const q = 2, Wc = Math.ceil(L * 1.6 * q), Hc = Math.ceil(L * 1.5 * q);   // 높은 지느러미·해파리 다리까지 들어가게
  const mk = () => { const c = document.createElement('canvas'); c.width = Wc; c.height = Hc; return c; };
  const base = mk(), b = base.getContext('2d'); b.translate(Wc / 2, Hc / 2); b.scale(q, q); rawFish(b, f, L, {});
  const lk = f.look; const paint = paintify(base, [lk.c1, lk.c2, lk.c3 || lk.c1], L * q, f.id);
  const out = { c: paint, L, q }; SPR.set(key, out); return out;
}
/** 수채화 그림책 칠하기 (물고기·캐릭터 공통). base: 벡터로 그린 캔버스, cols: 주요 색, U: 크기 기준(px)
 *  따뜻한 햇빛(왼쪽 위) · 차가운 반사광(아래) · 물감 번짐 · 붓 자국 · 종이 결 · 가장자리 물감 고임 · 테두리 빛 */
export function paintify(base, cols, U, seed) {
  const Wc = base.width, Hc = base.height, R = rng(seed + 'paint');
  const mk = () => { const c = document.createElement('canvas'); c.width = Wc; c.height = Hc; return c; };
  const paint = mk(), p = paint.getContext('2d'); p.drawImage(base, 0, 0);
  p.globalCompositeOperation = 'source-atop';
  // 물감 번짐: 같은 계열 색이 군데군데 진하게·옅게
  for (let i = 0; i < 14; i++) { const c = cols[i % cols.length], x = R() * Wc, y = R() * Hc, r = U * (0.08 + R() * 0.18), g = p.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, i % 2 ? shade(c, 0.35) : shade(c, -0.18)); g.addColorStop(1, 'rgba(0,0,0,0)'); p.globalAlpha = 0.22; p.fillStyle = g; p.fillRect(x - r, y - r, r * 2, r * 2); }
  p.globalAlpha = 1;
  // 따뜻한 햇빛과 보랏빛 그늘
  let g = p.createRadialGradient(Wc * 0.4, Hc * 0.28, 0, Wc * 0.4, Hc * 0.28, Math.max(Wc, Hc) * 0.55); g.addColorStop(0, 'rgba(255,240,205,.5)'); g.addColorStop(0.55, 'rgba(255,240,205,0)'); p.fillStyle = g; p.fillRect(0, 0, Wc, Hc);
  g = p.createLinearGradient(0, Hc * 0.35, 0, Hc); g.addColorStop(0, 'rgba(60,25,90,0)'); g.addColorStop(0.6, 'rgba(70,30,100,.1)'); g.addColorStop(1, 'rgba(60,25,95,.34)'); p.fillStyle = g; p.fillRect(0, 0, Wc, Hc);
  // 붓 자국
  const bc = cols.map(c => [shade(c, 0.4), shade(c, -0.3)]).flat();
  for (let i = 0; i < 190; i++) {
    const x0 = R() * Wc, y0 = R() * Hc, len = (0.04 + R() * 0.1) * U, ang = (R() - 0.5) * 0.7;
    p.strokeStyle = bc[i % bc.length]; p.globalAlpha = 0.05 + R() * 0.11; p.lineWidth = (0.006 + R() * 0.02) * U; p.lineCap = 'round';
    p.beginPath(); p.moveTo(x0, y0); p.quadraticCurveTo(x0 + Math.cos(ang) * len * 0.5, y0 + Math.sin(ang) * len * 0.5 - len * 0.12, x0 + Math.cos(ang) * len, y0 + Math.sin(ang) * len); p.stroke();
  }
  p.globalAlpha = 1;
  p.globalCompositeOperation = 'multiply'; p.globalAlpha = 0.24; p.fillStyle = p.createPattern(grain(), 'repeat'); p.fillRect(0, 0, Wc, Hc); p.globalAlpha = 1;
  p.globalCompositeOperation = 'destination-in'; p.drawImage(base, 0, 0);
  const ring = (dx, dy, blur, color, alpha) => {   // 몸 - (밀거나 흐린) 몸 = 가장자리 띠
    const c = mk(), e = c.getContext('2d'); e.drawImage(base, 0, 0); e.globalCompositeOperation = 'destination-out'; if (blur) e.filter = `blur(${blur}px)`; e.drawImage(base, dx, dy); e.filter = 'none';
    e.globalCompositeOperation = 'source-in'; e.fillStyle = color; e.fillRect(0, 0, Wc, Hc); p.globalCompositeOperation = 'source-over'; p.globalAlpha = alpha; p.drawImage(c, 0, 0); p.globalAlpha = 1; };
  ring(0, 0, Math.max(2, U * 0.012), shade(cols[0], -0.5), 0.42);   // 가장자리 물감 고임
  ring(0, U * 0.016, 0, '#FFE9B8', 0.55);                            // 위쪽: 따뜻한 햇빛 테두리
  ring(0, -U * 0.014, 0, '#9ED6FF', 0.4);                            // 아래쪽: 바다에서 오는 차가운 반사광
  return paint;
}
/** 벡터 원본 (스프라이트를 만들 때만 씀) */
function rawFish(ctx, f, L, o = {}) {
  const lk = f.look, R = rng(f.id), t = o.t || 0;
  ctx.save();
  ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.lineWidth = Math.max(1, L * 0.016); ctx.strokeStyle = OUT;
  if (lk.pat === 'clear') ctx.globalAlpha = 0.82;
  const S = SHAPES[lk.shape] || SHAPES.fish; S(ctx, lk, L, R, t);
  ctx.restore();
}

// 몸통 윤곽(옆모습 물고기): h=몸 높이 비율
function bodyPath(ctx, L, h, nose = 0.5, tail = -0.34, belly = 1) {
  const H = L * h / 2; ctx.beginPath();
  ctx.moveTo(L * nose, 0);
  ctx.bezierCurveTo(L * nose * 0.9, -H * 0.95, L * 0.05, -H * 1.08, L * tail, -H * 0.22);
  ctx.lineTo(L * tail, H * 0.22);
  ctx.bezierCurveTo(L * 0.05, H * 1.08 * belly, L * nose * 0.9, H * 0.9 * belly, L * nose, 0);
  ctx.closePath();
}
function grad(ctx, lk, L, h) {
  const g = ctx.createLinearGradient(0, -L * h / 2, 0, L * h / 2);
  g.addColorStop(0, shade(lk.c1, -0.12)); g.addColorStop(0.45, lk.c1); g.addColorStop(0.62, lk.c2); g.addColorStop(1, shade(lk.c2, 0.2));
  return g;
}
function tailFin(ctx, lk, L, h, t, kind = 'fork', x0 = -0.32) {
  const H = L * h, w = Math.sin(t * 9) * 0.06;
  ctx.fillStyle = shade(lk.c3 || lk.c1, 0); ctx.beginPath();
  if (kind === 'round') { ctx.moveTo(L * x0, 0); ctx.quadraticCurveTo(L * (x0 - 0.2), -H * 0.55 + w * L, L * (x0 - 0.24), w * L); ctx.quadraticCurveTo(L * (x0 - 0.2), H * 0.55 + w * L, L * x0, 0); }
  else if (kind === 'moon') { ctx.moveTo(L * x0, 0); ctx.lineTo(L * (x0 - 0.2), -H * 0.75 + w * L); ctx.quadraticCurveTo(L * (x0 - 0.1), w * L, L * (x0 - 0.2), H * 0.75 + w * L); ctx.closePath(); }
  else { ctx.moveTo(L * x0, 0); ctx.lineTo(L * (x0 - 0.2), -H * 0.55 + w * L); ctx.lineTo(L * (x0 - 0.13), w * L); ctx.lineTo(L * (x0 - 0.2), H * 0.55 + w * L); ctx.closePath(); }
  ctx.save(); ctx.globalAlpha *= 0.85; ctx.fill(); ctx.restore(); ctx.stroke();
  ctx.save(); ctx.clip(); ctx.strokeStyle = shade(lk.c3 || lk.c1, -0.35); ctx.globalAlpha *= 0.45; ctx.lineWidth = L * 0.006;   // 지느러미 살
  for (let i = -4; i <= 4; i++) { ctx.beginPath(); ctx.moveTo(L * x0, 0); ctx.lineTo(L * (x0 - 0.24), H * 0.16 * i + w * L); ctx.stroke(); } ctx.restore();
}
function rays(ctx, lk, L, x1, y1, x2, y2, x3, y3) { ctx.save(); ctx.clip(); ctx.strokeStyle = shade(lk.c3 || lk.c1, -0.35); ctx.globalAlpha *= 0.4; ctx.lineWidth = L * 0.005; for (let i = 0; i <= 6; i++) { const u = i / 6; ctx.beginPath(); ctx.moveTo(x1 + (x3 - x1) * u, y1 + (y3 - y1) * u); ctx.lineTo(x2 + (x3 - x2) * u * 0.6, y2 + (y3 - y2) * u * 0.3); ctx.stroke(); } ctx.restore(); }
function fins(ctx, lk, L, h, o = {}) {
  const H = L * h / 2; ctx.fillStyle = shade(lk.c3 || lk.c1, 0.1);
  // 등지느러미
  ctx.beginPath(); ctx.moveTo(L * 0.18, -H * 0.88); ctx.quadraticCurveTo(L * 0.0, -H * (o.tallDorsal ? 2.2 : 1.55), L * -0.2, -H * 0.62); ctx.closePath(); ctx.save(); ctx.globalAlpha *= 0.85; ctx.fill(); ctx.restore(); ctx.stroke();
  rays(ctx, lk, L, L * 0.18, -H * 0.88, L * 0.0, -H * (o.tallDorsal ? 2.0 : 1.45), L * -0.2, -H * 0.62);
  if (o.spiky) { ctx.strokeStyle = shade(lk.c3, -0.3); for (let i = 0; i < 6; i++) { const xx = L * (0.16 - i * 0.06); ctx.beginPath(); ctx.moveTo(xx, -H * 0.9); ctx.lineTo(xx - L * 0.02, -H * 1.75); ctx.stroke(); } ctx.strokeStyle = OUT; }
  // 배지느러미
  ctx.beginPath(); ctx.moveTo(L * 0.02, H * 0.85); ctx.quadraticCurveTo(L * -0.08, H * 1.45, L * -0.16, H * 0.7); ctx.closePath(); ctx.fill(); ctx.stroke();
  if (o.frill) { ctx.globalAlpha *= 0.8; for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.moveTo(L * 0.18, H * 0.2); ctx.quadraticCurveTo(L * (0.05 - i * 0.05), H * (1.3 + i * 0.25), L * (-0.05 - i * 0.07), H * (1.0 + i * 0.2)); ctx.lineWidth = L * 0.03; ctx.strokeStyle = i % 2 ? lk.c3 : lk.c1; ctx.stroke(); } ctx.lineWidth = Math.max(1, L * 0.018); ctx.strokeStyle = OUT; ctx.globalAlpha /= 0.8; }
  // 가슴지느러미
  ctx.fillStyle = shade(lk.c3 || lk.c1, 0.3); ctx.beginPath(); ctx.moveTo(L * 0.24, H * 0.2); ctx.quadraticCurveTo(L * 0.1, H * 0.75, L * 0.06, H * 0.25); ctx.closePath(); ctx.fill(); ctx.stroke();
}
function eye(ctx, x, y, r, glow) {
  ctx.fillStyle = '#FFF8E8'; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); ctx.stroke();
  const ig = ctx.createRadialGradient(x + r * 0.1, y, r * 0.1, x + r * 0.1, y, r * 0.78); ig.addColorStop(0, glow ? '#7AE8FF' : '#F2C25A'); ig.addColorStop(1, glow ? '#2A4A9A' : '#A8642A');
  ctx.fillStyle = ig; ctx.beginPath(); ctx.arc(x + r * 0.1, y, r * 0.76, 0, TAU); ctx.fill();
  ctx.fillStyle = '#1A1218'; ctx.beginPath(); ctx.arc(x + r * 0.15, y, r * 0.44, 0, TAU); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x + r * 0.35, y - r * 0.3, r * 0.26, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.arc(x - r * 0.2, y + r * 0.3, r * 0.12, 0, TAU); ctx.fill();
  ctx.save(); ctx.strokeStyle = OUT; ctx.lineWidth = r * 0.28; ctx.beginPath(); ctx.arc(x, y, r * 1.02, -2.7, -0.5); ctx.stroke(); ctx.restore();   // 위 눈꺼풀 선
}
/** 몸통 안쪽 무늬 (몸 윤곽으로 잘라서) */
function pattern(ctx, lk, L, h, R) {
  const H = L * h / 2, p = lk.pat, c3 = lk.c3;
  ctx.save(); ctx.clip();
  if (p === 'bars') { ctx.fillStyle = c3; ctx.globalAlpha *= 0.75; for (let i = 0; i < 4; i++) { const xx = L * (0.28 - i * 0.16); ctx.beginPath(); ctx.ellipse(xx, 0, L * 0.035, H * 1.2, 0.1, 0, TAU); ctx.fill(); } }
  else if (p === 'bands') { for (let i = 0; i < 3; i++) { const xx = L * (0.28 - i * 0.22); ctx.fillStyle = c3; ctx.beginPath(); ctx.ellipse(xx, 0, L * 0.05, H * 1.2, 0, 0, TAU); ctx.fill(); ctx.strokeStyle = '#2A2A30'; ctx.lineWidth = L * 0.012; ctx.stroke(); } }
  else if (p === 'line' || p === 'glowline') { ctx.strokeStyle = p === 'glowline' ? c3 : shade(c3, 0); ctx.lineWidth = H * 0.18; if (p === 'glowline') { ctx.shadowColor = c3; ctx.shadowBlur = L * 0.06; } ctx.beginPath(); ctx.moveTo(L * 0.45, -H * 0.05); ctx.quadraticCurveTo(0, -H * 0.15, -L * 0.4, 0); ctx.stroke(); }
  else if (p === 'rainbow') { ctx.strokeStyle = c3; ctx.globalAlpha *= 0.8; ctx.lineWidth = H * 0.35; ctx.beginPath(); ctx.moveTo(L * 0.4, 0); ctx.lineTo(-L * 0.4, H * 0.05); ctx.stroke(); ctx.fillStyle = shade(lk.c1, -0.3); for (let i = 0; i < 22; i++) { ctx.beginPath(); ctx.arc((R() - 0.4) * L * 0.8, -H * (0.2 + R() * 0.7), L * 0.008, 0, TAU); ctx.fill(); } }
  else if (p === 'spots' || p === 'dots' || p === 'glowdots') {
    const n = p === 'dots' ? 10 : 16; ctx.fillStyle = c3; if (p === 'glowdots') { ctx.shadowColor = c3; ctx.shadowBlur = L * 0.05; }
    for (let i = 0; i < n; i++) { const xx = (R() - 0.45) * L * 0.85, yy = (R() - (p === 'glowdots' ? 0.1 : 0.6)) * H * 1.4, r = L * (p === 'dots' ? 0.025 : 0.015) * (0.7 + R() * 0.6); ctx.beginPath(); ctx.arc(xx, yy, r, 0, TAU); ctx.fill(); }
  }
  else if (p === 'scale') { ctx.strokeStyle = shade(lk.c1, -0.25); ctx.lineWidth = L * 0.008; for (let j = -2; j <= 2; j++) for (let i = 0; i < 9; i++) { const xx = L * (0.3 - i * 0.075) + (j % 2) * L * 0.035, yy = j * H * 0.32; ctx.beginPath(); ctx.arc(xx, yy, L * 0.04, -1.2, 1.2); ctx.stroke(); } }
  else if (p === 'blotch') { ctx.fillStyle = c3; ctx.globalAlpha *= 0.55; for (let i = 0; i < 7; i++) { ctx.beginPath(); ctx.ellipse((R() - 0.45) * L * 0.8, (R() - 0.6) * H * 1.2, L * (0.04 + R() * 0.05), H * (0.15 + R() * 0.2), R() * 3, 0, TAU); ctx.fill(); } }
  else if (p === 'eyespot') { ctx.fillStyle = c3; ctx.beginPath(); ctx.arc(-L * 0.2, -H * 0.25, H * 0.22, 0, TAU); ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = L * 0.015; ctx.stroke(); ctx.fillStyle = c3; ctx.globalAlpha *= 0.8; ctx.beginPath(); ctx.ellipse(L * 0.33, 0, L * 0.03, H, 0, 0, TAU); ctx.fill(); }
  else if (p === 'stars' || p === 'frost') { ctx.fillStyle = c3; for (let i = 0; i < (p === 'frost' ? 10 : 14); i++) star(ctx, (R() - 0.45) * L * 0.85, (R() - 0.6) * H * 1.3, L * (0.015 + R() * 0.02), p === 'frost' ? 6 : 4); }
  else if (p === 'rings') { ctx.strokeStyle = c3; ctx.lineWidth = L * 0.012; for (let i = 0; i < 9; i++) { ctx.beginPath(); ctx.arc((R() - 0.5) * L * 0.8, (R() - 0.5) * H * 1.4, L * (0.02 + R() * 0.03), 0, TAU); ctx.stroke(); } }
  else if (p === 'glow') { ctx.fillStyle = c3; ctx.globalAlpha *= 0.5; ctx.shadowColor = c3; ctx.shadowBlur = L * 0.08; ctx.beginPath(); ctx.ellipse(0, -H * 0.1, L * 0.3, H * 0.25, 0, 0, TAU); ctx.fill(); }
  else if (p === 'clear') { ctx.strokeStyle = shade(lk.c3, -0.1); ctx.globalAlpha *= 0.6; ctx.lineWidth = L * 0.01; ctx.beginPath(); ctx.moveTo(L * 0.3, 0); ctx.lineTo(-L * 0.32, 0); ctx.stroke(); for (let i = 0; i < 9; i++) { const xx = L * (0.22 - i * 0.06); ctx.beginPath(); ctx.moveTo(xx, -H * 0.6); ctx.lineTo(xx - L * 0.03, 0); ctx.lineTo(xx, H * 0.6); ctx.stroke(); } }
  // 등 쪽 빛
  ctx.globalAlpha = 0.22; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(L * 0.1, -H * 0.45, L * 0.25, H * 0.18, -0.05, 0, TAU); ctx.fill();
  ctx.restore();
}
function star(ctx, x, y, r, n) { ctx.beginPath(); for (let i = 0; i < n * 2; i++) { const a = i * Math.PI / n, rr = i % 2 ? r * 0.4 : r; ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } ctx.closePath(); ctx.fill(); }
function mouthBits(ctx, lk, L, h, nose = 0.5) {
  const H = L * h / 2;
  if (lk.whisker) { ctx.strokeStyle = shade(lk.c1, -0.4); ctx.lineWidth = L * 0.012; for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(L * (nose - 0.03), H * 0.15); ctx.quadraticCurveTo(L * (nose + 0.08), H * (0.5 + s * 0.2), L * (nose + 0.02), H * (0.9 + s * 0.15)); ctx.stroke(); } ctx.strokeStyle = OUT; ctx.lineWidth = Math.max(1, L * 0.018); }
  if (lk.chin) { ctx.strokeStyle = shade(lk.c1, -0.4); ctx.beginPath(); ctx.moveTo(L * (nose - 0.06), H * 0.4); ctx.lineTo(L * (nose - 0.08), H * 0.75); ctx.stroke(); ctx.strokeStyle = OUT; }
  if (lk.teeth) { ctx.fillStyle = '#fff'; for (let i = 0; i < 4; i++) { const xx = L * (nose - 0.02 - i * 0.035); ctx.beginPath(); ctx.moveTo(xx, H * 0.02); ctx.lineTo(xx - L * 0.012, H * 0.25); ctx.lineTo(xx - L * 0.024, H * 0.02); ctx.fill(); } }
  if (lk.beak) { ctx.fillStyle = '#F2F0E8'; ctx.beginPath(); ctx.moveTo(L * nose, 0); ctx.lineTo(L * (nose - 0.06), -H * 0.2); ctx.lineTo(L * (nose - 0.06), H * 0.2); ctx.closePath(); ctx.fill(); ctx.stroke(); }
  ctx.strokeStyle = shade(lk.c1, -0.45); ctx.beginPath(); ctx.moveTo(L * (nose - 0.005), H * 0.05); ctx.quadraticCurveTo(L * (nose - 0.04), H * 0.12, L * (nose - 0.07), H * 0.06); ctx.stroke(); ctx.strokeStyle = OUT;
}
function stdFish(ctx, lk, L, R, t, h, o = {}) {
  tailFin(ctx, lk, L, h, t, o.tail || 'fork');
  fins(ctx, lk, L, h, { spiky: lk.spiky, frill: lk.frill, tallDorsal: o.tallDorsal });
  bodyPath(ctx, L, h, o.nose ?? 0.5); ctx.fillStyle = grad(ctx, lk, L, h); ctx.fill(); ctx.stroke();
  bodyPath(ctx, L, h, o.nose ?? 0.5); pattern(ctx, lk, L, h, R);
  // 아가미 선
  const H = L * h / 2; ctx.strokeStyle = shade(lk.c1, -0.3); ctx.beginPath(); ctx.arc(L * 0.26, 0, H * 0.7, -1.0, 1.0); ctx.stroke(); ctx.strokeStyle = OUT;
  mouthBits(ctx, lk, L, h, o.nose ?? 0.5);
  eye(ctx, L * 0.35, -H * 0.18, Math.max(2, L * (lk.big ? 0.05 : 0.065)), /glow/.test(lk.pat));
  // 볼 터치 (귀여움)
  ctx.fillStyle = 'rgba(242,120,130,.28)'; ctx.beginPath(); ctx.ellipse(L * 0.33, H * 0.32, L * 0.045, H * 0.14, 0, 0, TAU); ctx.fill();
}

const SHAPES = {
  fish(ctx, lk, L, R, t) { stdFish(ctx, lk, L, R, t, lk.stub ? 0.26 : 0.42, { tail: lk.stub ? 'round' : 'fork' }); },
  tall(ctx, lk, L, R, t) { stdFish(ctx, lk, L, R, t, lk.hatchet ? 0.7 : 0.6, { tail: 'round', tallDorsal: true, nose: 0.46 }); },
  round(ctx, lk, L, R, t) {
    const r = L * 0.36; tailFin(ctx, lk, L, 0.35, t, 'round', -0.3);
    ctx.fillStyle = shade(lk.c3, 0.2); ctx.beginPath(); ctx.moveTo(0, -r * 0.95); ctx.quadraticCurveTo(-L * 0.08, -r * 1.35, -L * 0.18, -r * 0.8); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(0, 0, r * 1.05, r, 0, 0, TAU); const g = ctx.createRadialGradient(-r * 0.3, -r * 0.4, r * 0.1, 0, 0, r * 1.1); g.addColorStop(0, shade(lk.c1, 0.35)); g.addColorStop(0.6, lk.c1); g.addColorStop(1, shade(lk.c2, -0.05)); ctx.fillStyle = g; ctx.fill(); ctx.stroke();
    if (lk.spiky) { ctx.fillStyle = '#fff'; for (let i = 0; i < 16; i++) { const a = i / 16 * TAU; ctx.beginPath(); ctx.moveTo(Math.cos(a) * r * 0.95, Math.sin(a) * r * 0.9); ctx.lineTo(Math.cos(a) * r * 1.22, Math.sin(a) * r * 1.15); ctx.lineTo(Math.cos(a + 0.12) * r * 0.95, Math.sin(a + 0.12) * r * 0.9); ctx.fill(); } }
    ctx.beginPath(); ctx.ellipse(0, 0, r * 1.05, r, 0, 0, TAU); pattern(ctx, lk, L, 0.72, R);
    ctx.fillStyle = lk.c2; ctx.beginPath(); ctx.ellipse(r * 0.1, r * 0.45, r * 0.7, r * 0.4, 0, 0, Math.PI); ctx.fill();
    eye(ctx, r * 0.55, -r * 0.25, L * 0.06); ctx.strokeStyle = shade(lk.c1, -0.4); ctx.beginPath(); ctx.arc(r * 0.98, r * 0.12, L * 0.03, 0.5, 2.5); ctx.stroke();
  },
  long(ctx, lk, L, R, t) {
    const n = 16, pts = [], w = L * (lk.stub ? 0.13 : lk.blade ? 0.09 : 0.11);
    for (let i = 0; i <= n; i++) { const u = i / n, xx = L * (0.5 - u), yy = Math.sin(u * 5 + t * 6) * L * 0.035 * u * (lk.blade ? 0.4 : 1); pts.push([xx, yy, w * (u < 0.15 ? 0.6 + u * 2.6 : 1 - (u - 0.15) * (lk.blade ? 1.1 : 0.85))]); }
    ctx.beginPath(); pts.forEach(([x, y, ww], i) => i ? ctx.lineTo(x, y - ww) : ctx.moveTo(x, y - ww)); for (let i = n; i >= 0; i--) ctx.lineTo(pts[i][0], pts[i][1] + pts[i][2]); ctx.closePath();
    const g = ctx.createLinearGradient(0, -w, 0, w); g.addColorStop(0, shade(lk.c1, -0.1)); g.addColorStop(0.55, lk.c1); g.addColorStop(1, lk.c2); ctx.fillStyle = g; ctx.fill(); ctx.stroke();
    // 등지느러미 띠
    ctx.strokeStyle = shade(lk.c3, 0); ctx.lineWidth = w * 0.45; ctx.globalAlpha *= 0.8; ctx.beginPath(); pts.slice(3).forEach(([x, y, ww], i) => i ? ctx.lineTo(x, y - ww * 1.05) : ctx.moveTo(x, y - ww * 1.05)); ctx.stroke(); ctx.globalAlpha /= 0.8; ctx.lineWidth = Math.max(1, L * 0.012); ctx.strokeStyle = OUT;
    ctx.beginPath(); pts.forEach(([x, y, ww], i) => i ? ctx.lineTo(x, y - ww) : ctx.moveTo(x, y - ww)); for (let i = n; i >= 0; i--) ctx.lineTo(pts[i][0], pts[i][1] + pts[i][2]); ctx.closePath(); pattern(ctx, lk, L, 0.17, R);
    if (lk.teeth) { ctx.fillStyle = '#fff'; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(L * (0.47 - i * 0.025), w * 0.1); ctx.lineTo(L * (0.465 - i * 0.025), w * 0.6); ctx.lineTo(L * (0.455 - i * 0.025), w * 0.1); ctx.fill(); } }
    eye(ctx, L * 0.43, -w * 0.3, Math.max(2, w * 0.5), /glow/.test(lk.pat));
  },
  cat(ctx, lk, L, R, t) {
    tailFin(ctx, lk, L, 0.3, t, 'round', -0.38);
    const H = L * 0.15; ctx.fillStyle = shade(lk.c3, 0.15);
    ctx.beginPath(); ctx.moveTo(L * 0.1, -H * 0.9); ctx.quadraticCurveTo(L * 0.02, -H * 1.9, -L * 0.06, -H * 0.85); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(L * 0.5, H * 0.1); ctx.bezierCurveTo(L * 0.5, -H * 1.1, L * 0.2, -H * 1.1, 0, -H * 0.9); ctx.bezierCurveTo(-L * 0.2, -H * 0.7, -L * 0.36, -H * 0.4, -L * 0.4, 0); ctx.bezierCurveTo(-L * 0.36, H * 0.5, -L * 0.1, H * 1.0, L * 0.15, H * 1.0); ctx.bezierCurveTo(L * 0.4, H * 1.0, L * 0.5, H * 0.8, L * 0.5, H * 0.1); ctx.closePath();
    const g = ctx.createLinearGradient(0, -H, 0, H); g.addColorStop(0, shade(lk.c1, -0.1)); g.addColorStop(0.6, lk.c1); g.addColorStop(1, lk.c2); ctx.fillStyle = g; ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(L * 0.5, H * 0.1); ctx.bezierCurveTo(L * 0.5, -H * 1.1, L * 0.2, -H * 1.1, 0, -H * 0.9); ctx.bezierCurveTo(-L * 0.2, -H * 0.7, -L * 0.36, -H * 0.4, -L * 0.4, 0); ctx.bezierCurveTo(-L * 0.36, H * 0.5, -L * 0.1, H * 1.0, L * 0.15, H * 1.0); ctx.closePath(); pattern(ctx, lk, L, 0.3, R);
    ctx.strokeStyle = shade(lk.c1, -0.5); ctx.lineWidth = L * 0.012;
    for (const [a, b, l] of [[-0.3, -1.4, 0.32], [0.2, 0.9, 0.28], [0.05, 1.5, 0.2], [-0.1, -0.6, 0.22]]) { ctx.beginPath(); ctx.moveTo(L * 0.47, H * a); ctx.quadraticCurveTo(L * (0.5 + l * 0.6), H * (a + b * 0.5), L * (0.5 + l * 0.35 * Math.cos(t * 2 + a)), H * (a + b * 1.3)); ctx.stroke(); }
    ctx.lineWidth = Math.max(1, L * 0.018); ctx.strokeStyle = shade(lk.c1, -0.5); ctx.beginPath(); ctx.moveTo(L * 0.48, H * 0.35); ctx.quadraticCurveTo(L * 0.36, H * 0.55, L * 0.26, H * 0.4); ctx.stroke(); ctx.strokeStyle = OUT;
    eye(ctx, L * 0.36, -H * 0.4, Math.max(2, L * 0.032));
  },
  flat(ctx, lk, L, R, t) {
    if (lk.flounder) {   // 가자미: 납작한 타원, 눈 두 개가 위에
      tailFin(ctx, lk, L, 0.3, t, 'round', -0.36);
      ctx.beginPath(); ctx.ellipse(0, 0, L * 0.38, L * 0.2, 0, 0, TAU); const g = ctx.createLinearGradient(0, -L * 0.2, 0, L * 0.2); g.addColorStop(0, shade(lk.c1, -0.05)); g.addColorStop(1, lk.c2); ctx.fillStyle = g; ctx.fill(); ctx.stroke();
      ctx.strokeStyle = shade(lk.c1, 0.2); ctx.setLineDash([L * 0.01, L * 0.012]); ctx.beginPath(); ctx.ellipse(0, 0, L * 0.36, L * 0.185, 0, 0, TAU); ctx.stroke(); ctx.setLineDash([]); ctx.strokeStyle = OUT;
      ctx.beginPath(); ctx.ellipse(0, 0, L * 0.38, L * 0.2, 0, 0, TAU); pattern(ctx, lk, L, 0.4, R);
      eye(ctx, L * 0.26, -L * 0.08, L * 0.03); eye(ctx, L * 0.3, -L * 0.015, L * 0.028); return;
    }
    // 가오리: 마름모 날개 + 긴 꼬리 (위에서 본 모습)
    const wv = Math.sin(t * 4) * 0.08;
    ctx.strokeStyle = shade(lk.c1, -0.3); ctx.lineWidth = L * 0.02; ctx.beginPath(); ctx.moveTo(-L * 0.15, 0); ctx.quadraticCurveTo(-L * 0.4, L * 0.04 * Math.sin(t * 5), -L * 0.6, L * 0.02); ctx.stroke(); ctx.lineWidth = Math.max(1, L * 0.018); ctx.strokeStyle = OUT;
    ctx.beginPath(); ctx.moveTo(L * 0.4, 0); ctx.quadraticCurveTo(L * 0.2, -L * 0.18, L * 0.02, -L * (0.32 + wv)); ctx.quadraticCurveTo(-L * 0.08, -L * 0.18, -L * 0.2, 0); ctx.quadraticCurveTo(-L * 0.08, L * 0.18, L * 0.02, L * (0.32 + wv)); ctx.quadraticCurveTo(L * 0.2, L * 0.18, L * 0.4, 0); ctx.closePath();
    const g = ctx.createRadialGradient(L * 0.08, 0, L * 0.02, L * 0.05, 0, L * 0.45); g.addColorStop(0, shade(lk.c1, 0.2)); g.addColorStop(1, shade(lk.c1, -0.2)); ctx.fillStyle = g; ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(L * 0.4, 0); ctx.quadraticCurveTo(L * 0.2, -L * 0.18, L * 0.02, -L * (0.32 + wv)); ctx.quadraticCurveTo(-L * 0.08, -L * 0.18, -L * 0.2, 0); ctx.quadraticCurveTo(-L * 0.08, L * 0.18, L * 0.02, L * (0.32 + wv)); ctx.quadraticCurveTo(L * 0.2, L * 0.18, L * 0.4, 0); ctx.closePath(); pattern(ctx, lk, L * 1.0, 0.9, R);
    eye(ctx, L * 0.26, -L * 0.06, L * 0.025); eye(ctx, L * 0.26, L * 0.06, L * 0.025);
  },
  sword(ctx, lk, L, R, t) {
    ctx.save(); ctx.translate(-L * 0.08, 0); const l = L * 0.85;
    tailFin(ctx, lk, l, 0.5, t, 'moon', -0.4);
    ctx.fillStyle = shade(lk.c3, 0); ctx.beginPath(); ctx.moveTo(l * 0.3, -l * 0.08); ctx.quadraticCurveTo(l * 0.05, -l * 0.42, -l * 0.25, -l * 0.06); ctx.closePath(); ctx.fill(); ctx.stroke();
    bodyPath(ctx, l, 0.22, 0.48, -0.42); ctx.fillStyle = grad(ctx, lk, l, 0.22); ctx.fill(); ctx.stroke(); bodyPath(ctx, l, 0.22, 0.48, -0.42); pattern(ctx, lk, l, 0.22, R);
    ctx.fillStyle = shade(lk.c1, -0.2); ctx.beginPath(); ctx.moveTo(l * 0.46, -l * 0.015); ctx.lineTo(l * 0.88, 0); ctx.lineTo(l * 0.46, l * 0.02); ctx.fill(); ctx.stroke();
    eye(ctx, l * 0.38, -l * 0.03, l * 0.025); ctx.restore();
  },
  shark(ctx, lk, L, R, t) {
    tailFin(ctx, lk, L, 0.42, t, 'moon', -0.36);
    ctx.fillStyle = shade(lk.c1, -0.1);
    ctx.beginPath(); ctx.moveTo(L * 0.1, -L * 0.09); ctx.lineTo(-L * 0.02, -L * 0.3); ctx.lineTo(-L * 0.1, -L * 0.08); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(L * 0.14, L * 0.07); ctx.lineTo(L * 0.0, L * 0.24); ctx.lineTo(-L * 0.02, L * 0.06); ctx.closePath(); ctx.fill(); ctx.stroke();
    bodyPath(ctx, L, 0.26, 0.52, -0.36, 0.9); ctx.fillStyle = grad(ctx, lk, L, 0.26); ctx.fill(); ctx.stroke(); bodyPath(ctx, L, 0.26, 0.52, -0.36, 0.9); pattern(ctx, lk, L, 0.26, R);
    ctx.strokeStyle = shade(lk.c1, -0.35); for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(L * (0.25 - i * 0.03), -L * 0.04); ctx.lineTo(L * (0.24 - i * 0.03), L * 0.04); ctx.stroke(); }
    ctx.strokeStyle = OUT; if (lk.teeth) { ctx.fillStyle = '#fff'; for (let i = 0; i < 5; i++) { const xx = L * (0.46 - i * 0.025); ctx.beginPath(); ctx.moveTo(xx, L * 0.035); ctx.lineTo(xx - L * 0.01, L * 0.06); ctx.lineTo(xx - L * 0.02, L * 0.035); ctx.fill(); } }
    ctx.strokeStyle = shade(lk.c1, -0.5); ctx.beginPath(); ctx.moveTo(L * 0.49, L * 0.025); ctx.quadraticCurveTo(L * 0.42, L * 0.06, L * 0.36, L * 0.035); ctx.stroke(); ctx.strokeStyle = OUT;
    eye(ctx, L * 0.4, -L * 0.035, Math.max(2, L * 0.028));
  },
  angler(ctx, lk, L, R, t) {
    tailFin(ctx, lk, L, 0.35, t, 'round', -0.3);
    ctx.fillStyle = shade(lk.c1, 0.1); ctx.beginPath(); ctx.moveTo(-L * 0.05, -L * 0.25); ctx.quadraticCurveTo(-L * 0.2, -L * 0.33, -L * 0.25, -L * 0.1); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(L * 0.02, 0, L * 0.34, L * 0.28, 0, 0, TAU); const g = ctx.createRadialGradient(0, -L * 0.1, L * 0.05, 0, 0, L * 0.36); g.addColorStop(0, shade(lk.c1, 0.2)); g.addColorStop(1, shade(lk.c1, -0.25)); ctx.fillStyle = g; ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(L * 0.02, 0, L * 0.34, L * 0.28, 0, 0, TAU); pattern(ctx, lk, L, 0.56, R);
    // 큰 입 + 이빨
    ctx.fillStyle = '#1A1020'; ctx.beginPath(); ctx.moveTo(L * 0.36, -L * 0.02); ctx.quadraticCurveTo(L * 0.2, L * 0.2, L * 0.06, L * 0.12); ctx.quadraticCurveTo(L * 0.25, L * 0.05, L * 0.36, -L * 0.02); ctx.fill();
    ctx.fillStyle = '#fff'; for (let i = 0; i < 6; i++) { const u = i / 5, xx = L * (0.34 - u * 0.25), yy = L * (0.0 + u * 0.1); ctx.beginPath(); ctx.moveTo(xx, yy); ctx.lineTo(xx - L * 0.012, yy + L * 0.05); ctx.lineTo(xx - L * 0.025, yy + L * 0.005); ctx.fill(); }
    // 초롱
    ctx.strokeStyle = shade(lk.c1, -0.3); ctx.lineWidth = L * 0.015; const bx = L * (0.42 + Math.sin(t * 2) * 0.02), by = -L * 0.42;
    ctx.beginPath(); ctx.moveTo(L * 0.12, -L * 0.26); ctx.quadraticCurveTo(L * 0.3, -L * 0.55, bx, by); ctx.stroke(); ctx.lineWidth = Math.max(1, L * 0.018); ctx.strokeStyle = OUT;
    ctx.save(); ctx.shadowColor = lk.c3; ctx.shadowBlur = L * 0.15; ctx.fillStyle = lk.c3; ctx.beginPath(); ctx.arc(bx, by, L * 0.045, 0, TAU); ctx.fill(); ctx.restore();
    eye(ctx, L * 0.2, -L * 0.12, L * 0.04, true);
  },
  squid(ctx, lk, L, R, t) {
    // 왼쪽으로 다리, 오른쪽으로 몸통(뾰족한 지느러미)
    ctx.strokeStyle = lk.c1; ctx.lineWidth = L * 0.03;
    for (let i = 0; i < 8; i++) { const yy = (i - 3.5) * L * 0.025; ctx.beginPath(); ctx.moveTo(-L * 0.12, yy); ctx.quadraticCurveTo(-L * 0.3, yy + Math.sin(t * 5 + i) * L * 0.05, -L * (0.42 + (i === 0 || i === 7 ? 0.1 : 0)), yy * 1.6 + Math.sin(t * 4 + i) * L * 0.04); ctx.stroke(); }
    ctx.lineWidth = Math.max(1, L * 0.018); ctx.strokeStyle = OUT;
    ctx.fillStyle = shade(lk.c1, 0.1); ctx.beginPath(); ctx.moveTo(L * 0.46, 0); ctx.lineTo(L * 0.3, -L * 0.16); ctx.lineTo(L * 0.26, 0); ctx.lineTo(L * 0.3, L * 0.16); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(L * 0.46, 0); ctx.quadraticCurveTo(L * 0.3, -L * 0.13, -L * 0.1, -L * 0.09); ctx.quadraticCurveTo(-L * 0.18, 0, -L * 0.1, L * 0.09); ctx.quadraticCurveTo(L * 0.3, L * 0.13, L * 0.46, 0); ctx.closePath();
    const g = ctx.createLinearGradient(0, -L * 0.1, 0, L * 0.1); g.addColorStop(0, shade(lk.c1, -0.1)); g.addColorStop(1, lk.c2); ctx.fillStyle = g; ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(L * 0.46, 0); ctx.quadraticCurveTo(L * 0.3, -L * 0.13, -L * 0.1, -L * 0.09); ctx.quadraticCurveTo(-L * 0.18, 0, -L * 0.1, L * 0.09); ctx.quadraticCurveTo(L * 0.3, L * 0.13, L * 0.46, 0); pattern(ctx, lk, L, 0.2, R);
    eye(ctx, -L * 0.08, -L * 0.03, L * 0.035);
  },
  jelly(ctx, lk, L, R, t) {
    ctx.save();   // 위로 둥실 (다리는 아래로)
    ctx.strokeStyle = lk.c3; ctx.lineWidth = L * 0.018; ctx.globalAlpha *= 0.8;
    for (let i = 0; i < 6; i++) { const xx = (i - 2.5) * L * 0.07; ctx.beginPath(); ctx.moveTo(xx, L * 0.05); for (let k = 1; k <= 6; k++) ctx.lineTo(xx + Math.sin(t * 3 + k + i) * L * 0.03, L * 0.05 + k * L * 0.07); ctx.stroke(); }
    ctx.globalAlpha /= 0.8; ctx.lineWidth = Math.max(1, L * 0.018); ctx.strokeStyle = OUT;
    const s = 1 + Math.sin(t * 3) * 0.05; ctx.beginPath(); ctx.moveTo(-L * 0.25 * s, L * 0.06); ctx.bezierCurveTo(-L * 0.3 * s, -L * 0.3, L * 0.3 * s, -L * 0.3, L * 0.25 * s, L * 0.06); ctx.quadraticCurveTo(0, L * 0.12, -L * 0.25 * s, L * 0.06);
    const g = ctx.createRadialGradient(0, -L * 0.1, L * 0.02, 0, -L * 0.05, L * 0.3); g.addColorStop(0, shade(lk.c2, 0.3)); g.addColorStop(1, lk.c1); ctx.fillStyle = g; ctx.globalAlpha *= 0.88; ctx.fill(); ctx.stroke();
    if (/glow/.test(lk.pat)) { ctx.shadowColor = lk.c3; ctx.shadowBlur = L * 0.1; ctx.fillStyle = lk.c3; ctx.beginPath(); ctx.arc(0, -L * 0.08, L * 0.05, 0, TAU); ctx.fill(); }
    ctx.fillStyle = '#2A1E38'; ctx.beginPath(); ctx.arc(-L * 0.07, -L * 0.04, L * 0.022, 0, TAU); ctx.arc(L * 0.07, -L * 0.04, L * 0.022, 0, TAU); ctx.fill();
    ctx.restore();
  },
  horse(ctx, lk, L, R, t) {
    ctx.save();
    // 몸: S자 (머리 위, 꼬리 말림 아래)
    ctx.beginPath(); ctx.moveTo(L * 0.02, -L * 0.3); ctx.bezierCurveTo(L * 0.18, -L * 0.25, L * 0.16, -L * 0.05, L * 0.08, L * 0.08); ctx.bezierCurveTo(L * 0.02, L * 0.2, L * 0.12, L * 0.3, L * 0.02, L * 0.38); ctx.bezierCurveTo(-L * 0.06, L * 0.42, -L * 0.1, L * 0.32, -L * 0.02, L * 0.3);
    ctx.bezierCurveTo(-L * 0.04, L * 0.2, -L * 0.1, L * 0.1, -L * 0.08, -L * 0.02); ctx.bezierCurveTo(-L * 0.06, -L * 0.15, -L * 0.08, -L * 0.25, L * 0.02, -L * 0.3); ctx.closePath();
    const g = ctx.createLinearGradient(-L * 0.1, 0, L * 0.15, 0); g.addColorStop(0, lk.c1); g.addColorStop(1, lk.c2); ctx.fillStyle = g; ctx.fill(); ctx.stroke();
    ctx.save(); ctx.clip(); pattern(ctx, lk, L, 0.6, R); ctx.restore();
    ctx.strokeStyle = shade(lk.c1, -0.25); for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo(-L * 0.06, -L * 0.15 + i * L * 0.06); ctx.lineTo(L * 0.1, -L * 0.13 + i * L * 0.06); ctx.stroke(); } ctx.strokeStyle = OUT;
    ctx.fillStyle = lk.c1; ctx.beginPath(); ctx.moveTo(L * 0.1, -L * 0.28); ctx.lineTo(L * 0.28, -L * 0.24); ctx.lineTo(L * 0.28, -L * 0.2); ctx.lineTo(L * 0.1, -L * 0.2); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = lk.c3; ctx.beginPath(); ctx.moveTo(-L * 0.07, -L * 0.05); ctx.quadraticCurveTo(-L * 0.18 + Math.sin(t * 8) * L * 0.02, 0, -L * 0.07, L * 0.06); ctx.fill(); ctx.stroke();
    eye(ctx, L * 0.06, -L * 0.25, L * 0.03);
    ctx.restore();
  },
  crab(ctx, lk, L, R, t) {
    const leg = lk.leggy ? 1.6 : 1; ctx.strokeStyle = shade(lk.c1, -0.15); ctx.lineWidth = L * 0.035;
    for (const s of [-1, 1]) for (let i = 0; i < 3; i++) { const bx = s * L * (0.1 + i * 0.06), wob = Math.sin(t * 6 + i + s) * L * 0.02; ctx.beginPath(); ctx.moveTo(bx, L * 0.05); ctx.lineTo(bx + s * L * 0.12 * leg, L * (0.08 + 0.06 * leg) + wob); ctx.lineTo(bx + s * L * 0.16 * leg, L * (0.18 + 0.1 * leg) + wob); ctx.stroke(); }
    ctx.lineWidth = Math.max(1, L * 0.018); ctx.strokeStyle = OUT; ctx.fillStyle = lk.c1;
    for (const s of [-1, 1]) { const cx = s * L * 0.32, cy = -L * 0.12 + Math.sin(t * 4 + s) * L * 0.02; ctx.beginPath(); ctx.moveTo(s * L * 0.15, -L * 0.02); ctx.lineTo(cx, cy + L * 0.04); ctx.lineWidth = L * 0.04; ctx.strokeStyle = lk.c1; ctx.stroke(); ctx.lineWidth = Math.max(1, L * 0.018); ctx.strokeStyle = OUT;
      ctx.beginPath(); ctx.ellipse(cx, cy, L * 0.08, L * 0.06, s * 0.5, 0, TAU); ctx.fill(); ctx.stroke(); ctx.fillStyle = shade(lk.c1, 0.2); ctx.beginPath(); ctx.moveTo(cx + s * L * 0.02, cy - L * 0.02); ctx.lineTo(cx + s * L * 0.11, cy - L * 0.08); ctx.lineTo(cx + s * L * 0.07, cy); ctx.fill(); ctx.stroke(); ctx.fillStyle = lk.c1; }
    ctx.beginPath(); ctx.ellipse(0, 0, L * 0.22, L * 0.15, 0, 0, TAU); const g = ctx.createRadialGradient(-L * 0.05, -L * 0.06, L * 0.02, 0, 0, L * 0.22); g.addColorStop(0, shade(lk.c1, 0.3)); g.addColorStop(1, shade(lk.c1, -0.2)); ctx.fillStyle = g; ctx.fill(); ctx.stroke();
    if (lk.shape === 'crab' && !lk.leggy) { ctx.strokeStyle = shade(lk.c1, 0.4); ctx.lineWidth = L * 0.006; for (let i = 0; i < 26; i++) { const a = R() * TAU, r = R() * L * 0.2; ctx.beginPath(); ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r * 0.7); ctx.lineTo(Math.cos(a) * r + L * 0.01, Math.sin(a) * r * 0.7 - L * 0.012); ctx.stroke(); } ctx.strokeStyle = OUT; ctx.lineWidth = Math.max(1, L * 0.018); }
    for (const s of [-1, 1]) { ctx.strokeStyle = OUT; ctx.beginPath(); ctx.moveTo(s * L * 0.05, -L * 0.13); ctx.lineTo(s * L * 0.06, -L * 0.2); ctx.stroke(); eye(ctx, s * L * 0.06, -L * 0.21, L * 0.025); }
    ctx.strokeStyle = shade(lk.c1, -0.45); ctx.beginPath(); ctx.arc(0, -L * 0.02, L * 0.04, 0.3, 2.8); ctx.stroke(); ctx.strokeStyle = OUT;
  },
};

// ---------------------------------------------------------------- 바다 · 배
let BG = null;
export function drawScene(ctx, W, H, st, t, o = {}) {
  const key = st.id + ':' + W + 'x' + H;
  if (!BG || BG.key !== key) BG = { key, c: paintBackground(st, W, H) };
  ctx.drawImage(BG.c, 0, 0, W, H);
  liveScene(ctx, W, H, st, t, o);
}
/** 움직이지 않는 배경을 수채화로 한 번 칠해 둠 (하늘 번짐·구름·섬·바다 붓질·종이 결) */
function paintBackground(st, W, H) {
  const q = Math.min(2, devicePixelRatio || 1), c = document.createElement('canvas'); c.width = W * q; c.height = H * q;
  const ctx = c.getContext('2d'); ctx.scale(q, q); const R = rng('bg' + st.id), hz = H * 0.42, night = st.id === 4;
  let g = ctx.createLinearGradient(0, 0, 0, hz); g.addColorStop(0, st.sky[0]); g.addColorStop(1, st.sky[1]); ctx.fillStyle = g; ctx.fillRect(0, 0, W, hz);
  // 하늘 물감 번짐
  for (let i = 0; i < 40; i++) { ctx.fillStyle = i % 2 ? shade(st.sky[0], 0.2) : shade(st.sky[1], night ? 0.1 : -0.06); ctx.globalAlpha = 0.08; ctx.beginPath(); ctx.ellipse(R() * W, R() * hz, W * (0.05 + R() * 0.15), H * (0.02 + R() * 0.05), R() * 0.4, 0, TAU); ctx.fill(); }
  ctx.globalAlpha = 1;
  if (!night) { ctx.save(); ctx.fillStyle = 'rgba(255,250,225,.95)'; ctx.shadowColor = '#FFF2C0'; ctx.shadowBlur = H * 0.1; ctx.beginPath(); ctx.arc(W * 0.8, H * 0.12, H * 0.055, 0, TAU); ctx.fill(); ctx.restore(); }
  else { ctx.save(); ctx.fillStyle = '#F6F2DA'; ctx.shadowColor = '#E8E6FF'; ctx.shadowBlur = H * 0.06; ctx.beginPath(); ctx.arc(W * 0.78, H * 0.13, H * 0.05, 0, TAU); ctx.fill(); ctx.restore(); ctx.fillStyle = 'rgba(200,200,230,.35)'; ctx.beginPath(); ctx.arc(W * 0.79, H * 0.12, H * 0.012, 0, TAU); ctx.arc(W * 0.77, H * 0.145, H * 0.008, 0, TAU); ctx.fill(); }
  // 뭉게구름 (부드러운 붓)
  for (let i = 0; i < 6; i++) { const cx = R() * W, cy = H * (0.05 + R() * 0.2), sc = 0.6 + R() * 0.8; ctx.save(); ctx.filter = `blur(${H * 0.006}px)`;
    for (let k = 0; k < 6; k++) { ctx.fillStyle = night ? 'rgba(130,140,200,.18)' : k < 3 ? 'rgba(255,255,255,.85)' : 'rgba(225,235,250,.7)'; ctx.beginPath(); ctx.ellipse(cx + (k - 2.5) * H * 0.045 * sc, cy + (k >= 3 ? H * 0.012 : -Math.sin(k + 1) * H * 0.012) * sc, H * 0.05 * sc, H * 0.03 * sc, 0, 0, TAU); ctx.fill(); }
    ctx.restore(); }
  // 먼 섬 (붓 자국)
  const isle = (x0, x1, top, col) => { ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(x0, hz); ctx.bezierCurveTo(x0 + (x1 - x0) * 0.25, hz - top, x0 + (x1 - x0) * 0.6, hz - top * 1.15, x1, hz); ctx.fill();
    ctx.save(); ctx.clip(); for (let i = 0; i < 30; i++) { ctx.strokeStyle = i % 2 ? shade(col, 0.15) : shade(col, -0.15); ctx.globalAlpha = 0.25; ctx.lineWidth = 3 + R() * 5; const xx = x0 + R() * (x1 - x0), yy = hz - R() * top; ctx.beginPath(); ctx.moveTo(xx, yy); ctx.lineTo(xx + 10 + R() * 20, yy + 4); ctx.stroke(); } ctx.restore(); ctx.globalAlpha = 1; };
  isle(W * 0.03, W * 0.48, H * 0.13, st.hill); isle(W * 0.58, W * 0.99, H * 0.07, shade(st.hill, -0.12));
  if (st.id === 1) { ctx.fillStyle = '#F2EEE6'; ctx.fillRect(W * 0.7, hz - H * 0.035, W * 0.016, H * 0.035); ctx.fillStyle = '#E86A5A'; ctx.fillRect(W * 0.698, hz - H * 0.046, W * 0.02, H * 0.012); }
  if (st.id === 2) for (let i = 0; i < 4; i++) { ctx.strokeStyle = '#6A5A3A'; ctx.lineWidth = 2; const px = W * (0.14 + i * 0.05); ctx.beginPath(); ctx.moveTo(px, hz - H * 0.03); ctx.quadraticCurveTo(px + 3, hz - H * 0.07, px + 6, hz - H * 0.1); ctx.stroke(); ctx.fillStyle = '#4E9A5A'; for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.ellipse(px + 6, hz - H * 0.1, W * 0.016, H * 0.007, k * 0.8, 0, TAU); ctx.fill(); } }
  if (st.id === 3) for (let i = 0; i < 9; i++) { const px = W * (0.6 + i * 0.04), ph = H * (0.03 + R() * 0.03); ctx.fillStyle = shade(st.hill, -0.3); ctx.beginPath(); ctx.moveTo(px - 8, hz); ctx.lineTo(px, hz - ph); ctx.lineTo(px + 8, hz); ctx.fill(); }
  // 바다: 바탕 + 가로 붓질
  g = ctx.createLinearGradient(0, hz, 0, H); g.addColorStop(0, shade(st.sea[0], 0.2)); g.addColorStop(0.45, st.sea[0]); g.addColorStop(1, st.sea[1]); ctx.fillStyle = g; ctx.fillRect(0, hz, W, H - hz);
  for (let i = 0; i < 260; i++) { const yy = hz + Math.pow(R(), 1.4) * (H - hz), d = (yy - hz) / (H - hz), len = 20 + d * 90 * R();
    ctx.strokeStyle = R() < 0.5 ? shade(st.sea[0], 0.25) : shade(st.sea[1], -0.15); ctx.globalAlpha = 0.12 + R() * 0.12; ctx.lineWidth = 1.5 + d * 6 * R(); ctx.lineCap = 'round';
    const xx = R() * W; ctx.beginPath(); ctx.moveTo(xx, yy); ctx.quadraticCurveTo(xx + len / 2, yy - 2 - d * 3, xx + len, yy); ctx.stroke(); }
  ctx.globalAlpha = 1;
  // 종이 결
  ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = 0.28; ctx.fillStyle = ctx.createPattern(grain(), 'repeat'); ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  // 가장자리 어둡게 (그림책 느낌)
  g = ctx.createRadialGradient(W / 2, H * 0.45, Math.min(W, H) * 0.35, W / 2, H * 0.5, Math.max(W, H) * 0.75); g.addColorStop(0, 'rgba(40,20,30,0)'); g.addColorStop(1, 'rgba(40,20,30,.28)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  return c;
}
/** 매 장면 움직이는 것들: 물결 빛·별 반짝임·안개·배 */
function liveScene(ctx, W, H, st, t, o) {
  const hz = H * 0.42, night = st.id === 4, fog = st.id === 3;
  if (night) { const R = rng('stars'); ctx.fillStyle = '#fff'; for (let i = 0; i < 90; i++) { ctx.globalAlpha = 0.3 + 0.7 * Math.abs(Math.sin(t * 0.8 + i)); ctx.fillRect(R() * W, R() * hz * 0.95, 1.6, 1.6); } ctx.globalAlpha = 1; }
  let g;
  // 물결 반짝임 (짧은 붓 터치가 천천히 흘러감)
  { const R = rng('wave' + st.id); ctx.lineCap = 'round';
    for (let i = 0; i < 70; i++) { const d = Math.pow(R(), 1.3), y = hz + 4 + d * (H - hz) * 0.85, sp = 6 + d * 30, x = ((R() * W + t * sp) % (W + 60)) - 30, len = 8 + d * 40;
      ctx.globalAlpha = (0.25 + 0.35 * Math.abs(Math.sin(t * (0.8 + R()) + i))) * (night ? 0.5 : 1); ctx.strokeStyle = night ? '#A8C8FF' : '#FFFFFF'; ctx.lineWidth = 1 + d * 2.5;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + len / 2, y - 1.5 - d * 2, x + len, y); ctx.stroke(); }
    ctx.globalAlpha = 1; }
  if (night) { ctx.fillStyle = 'rgba(140,240,255,.5)'; const R = rng('glow'); for (let i = 0; i < 18; i++) { const x = R() * W, y = hz + R() * (H - hz) * 0.8; ctx.globalAlpha = 0.3 + 0.5 * Math.abs(Math.sin(t + i)); ctx.beginPath(); ctx.arc(x, y, 2, 0, TAU); ctx.fill(); } ctx.globalAlpha = 1; }
  if (fog) { const fg = ctx.createLinearGradient(0, hz - H * 0.1, 0, hz + H * 0.2); fg.addColorStop(0, 'rgba(235,240,245,0)'); fg.addColorStop(0.5, 'rgba(235,240,245,.65)'); fg.addColorStop(1, 'rgba(235,240,245,0)'); ctx.fillStyle = fg; ctx.fillRect(0, hz - H * 0.1, W, H * 0.3); }
  // 물 밑 물고기 그림자 (기다릴 때 분위기)
  if (o.shadows) { ctx.fillStyle = 'rgba(0,20,40,.18)'; for (let i = 0; i < 3; i++) { const x = ((t * 0.03 * (i + 1) + i * 0.37) % 1.2 - 0.1) * W, y = hz + (H - hz) * (0.3 + i * 0.15); ctx.beginPath(); ctx.ellipse(x, y, W * 0.03, H * 0.01, 0, 0, TAU); ctx.fill(); } }
  // 배 앞머리 (아래쪽)
  const by = H * 0.86; ctx.fillStyle = '#E9E4DA'; ctx.beginPath(); ctx.moveTo(W * 0.18, H); ctx.quadraticCurveTo(W * 0.24, by, W * 0.5, by - H * 0.03); ctx.quadraticCurveTo(W * 0.76, by, W * 0.82, H); ctx.fill();
  ctx.fillStyle = '#C8B89A'; ctx.beginPath(); ctx.moveTo(W * 0.22, H); ctx.quadraticCurveTo(W * 0.27, by + H * 0.03, W * 0.5, by); ctx.quadraticCurveTo(W * 0.73, by + H * 0.03, W * 0.78, H); ctx.fill();
  ctx.strokeStyle = '#8A7458'; ctx.lineWidth = 2; for (let i = 1; i < 8; i++) { ctx.beginPath(); ctx.moveTo(W * (0.22 + i * 0.07), H); ctx.lineTo(W * 0.5 + (W * (0.22 + i * 0.07) - W * 0.5) * 0.75, by + H * 0.01); ctx.stroke(); }
  // 난간
  ctx.strokeStyle = '#6E7A86'; ctx.lineWidth = H * 0.012; ctx.beginPath(); ctx.moveTo(W * 0.2, H * 0.95); ctx.quadraticCurveTo(W * 0.26, by - H * 0.06, W * 0.5, by - H * 0.085); ctx.quadraticCurveTo(W * 0.74, by - H * 0.06, W * 0.8, H * 0.95); ctx.stroke();
  ctx.lineWidth = H * 0.008; for (let i = 0; i <= 8; i++) { const u = i / 8, x = W * (0.21 + u * 0.58), top = by - H * 0.085 + Math.pow(Math.abs(u - 0.5) * 2, 2) * H * 0.08; ctx.beginPath(); ctx.moveTo(x, top); ctx.lineTo(x, top + H * 0.07); ctx.stroke(); }
}

// ---------------------------------------------------------------- 낚시꾼 (뒷모습) + 아바타
/** 배 위에서 바다를 보는 뒷모습. pose: 'idle'|'cast'|'pull'. 낚싯대 끝 좌표를 돌려줘요 */
export function drawAngler(ctx, x, y, s, av, pose, t, items) {
  // 낚싯대(앞쪽이라 몸에 가려짐)를 먼저, 수채화로 칠해 둔 몸을 그 위에
  const tip = rawAngler(ctx, x, y, s, av, pose, t, items, 'rod');
  const S0 = s <= 200 ? 200 : 400, key = ['back', av.animal.id, av.hat, av.outfit, av.acc, S0].join(':');
  let sp = SPR.get(key);
  if (!sp) { const q = 2, c = document.createElement('canvas'); c.width = S0 * 1.1 * q; c.height = S0 * 1.25 * q; const b = c.getContext('2d'); b.scale(q, q); rawAngler(b, S0 * 0.55, S0 * 1.15, S0, av, 'idle', 0, items, 'body');
    sp = { c: paintify(c, [av.animal.fur, items[av.outfit].color, items[av.hat].color], S0 * q, key), S0, q }; SPR.set(key, sp); }
  const k = s / sp.S0, bob = Math.sin(t * 2) * s * 0.01;
  ctx.drawImage(sp.c, x - S0x(sp) * k, y + bob - sp.S0 * 1.15 * k, sp.c.width / sp.q * k, sp.c.height / sp.q * k);
  return tip;
}
const S0x = sp => sp.S0 * 0.55;
function rawAngler(ctx, x, y, s, av, pose, t, items, mode) {
  const BODY = mode !== 'rod', ROD = mode !== 'body';
  const A = av.animal, hat = items[av.hat], outfit = items[av.outfit], acc = items[av.acc], rod = items[av.rod];
  ctx.save(); ctx.translate(x, y); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  const bob = Math.sin(t * 2) * s * 0.01, pull = pose === 'pull' ? Math.sin(t * 18) * 0.04 : 0;
  const rodA = pose === 'aim' ? -2.05 + Math.sin(t * 7) * 0.05 : pose === 'cast' ? -2.2 : pose === 'pull' ? -1.05 + pull : pose === 'cheer' ? -1.75 + Math.sin(t * 10) * 0.05 : -1.25;   // 낚싯대 각도 (위로)
  ctx.lineWidth = s * 0.02; ctx.strokeStyle = OUT;
  if (BODY) {
  // 그림자
  ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.beginPath(); ctx.ellipse(0, s * 0.02, s * 0.32, s * 0.06, 0, 0, TAU); ctx.fill();
  // 다리
  ctx.fillStyle = A.fur; for (const sx of [-1, 1]) { ctx.beginPath(); ctx.ellipse(sx * s * 0.11, -s * 0.06, s * 0.07, s * 0.08, 0, 0, TAU); ctx.fill(); ctx.stroke(); }
  // 꼬리
  ctx.fillStyle = A.id === 'fox' ? A.fur : A.belly;
  if (A.id === 'fox') { ctx.beginPath(); ctx.ellipse(s * 0.16, -s * 0.2, s * 0.08, s * 0.16, 0.6 + Math.sin(t * 3) * 0.1, 0, TAU); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(s * 0.24, -s * 0.3, s * 0.04, s * 0.05, 0.6, 0, TAU); ctx.fill(); }
  else if (A.id === 'cat') { ctx.strokeStyle = A.fur; ctx.lineWidth = s * 0.05; ctx.beginPath(); ctx.moveTo(s * 0.1, -s * 0.12); ctx.quadraticCurveTo(s * 0.3, -s * 0.15, s * 0.26, -s * 0.35 + Math.sin(t * 3) * s * 0.03); ctx.stroke(); ctx.lineWidth = s * 0.02; ctx.strokeStyle = OUT; }
  else { ctx.beginPath(); ctx.arc(0, -s * 0.12, s * 0.05, 0, TAU); ctx.fill(); ctx.stroke(); }
  // 몸통 (옷)
  ctx.translate(0, bob);
  ctx.fillStyle = outfit.color; ctx.beginPath(); ctx.moveTo(-s * 0.2, -s * 0.1); ctx.quadraticCurveTo(-s * 0.24, -s * 0.38, -s * 0.12, -s * 0.44); ctx.lineTo(s * 0.12, -s * 0.44); ctx.quadraticCurveTo(s * 0.24, -s * 0.38, s * 0.2, -s * 0.1); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.save(); ctx.clip();
  if (outfit.id === 'outfit1') { ctx.fillStyle = '#fff'; for (let i = 0; i < 4; i++) ctx.fillRect(-s * 0.3, -s * (0.4 - i * 0.08), s * 0.6, s * 0.03); }
  if (outfit.id === 'outfit2') { ctx.fillStyle = '#F2F0E8'; ctx.fillRect(-s * 0.3, -s * 0.25, s * 0.6, s * 0.035); ctx.fillRect(-s * 0.3, -s * 0.18, s * 0.6, s * 0.035); }
  if (outfit.id === 'outfit3') { ctx.fillStyle = shade(outfit.color, -0.25); ctx.fillRect(-s * 0.12, -s * 0.44, s * 0.04, s * 0.34); ctx.fillRect(s * 0.08, -s * 0.44, s * 0.04, s * 0.34); }
  if (outfit.id === 'outfit4') { ctx.fillStyle = '#7AC2F2'; ctx.fillRect(-s * 0.3, -s * 0.3, s * 0.6, s * 0.02); ctx.fillStyle = '#F2C23A'; ctx.fillRect(-s * 0.02, -s * 0.44, s * 0.04, s * 0.34); }
  if (outfit.id === 'outfit5') { ctx.fillStyle = '#F2E680'; for (let i = 0; i < 7; i++) star(ctx, -s * 0.15 + (i % 3) * s * 0.15, -s * (0.38 - Math.floor(i / 3) * 0.1), s * 0.025, 5); }
  ctx.restore();
  if (outfit.id === 'outfit5') { ctx.fillStyle = outfit.color; ctx.beginPath(); ctx.moveTo(-s * 0.14, -s * 0.44); ctx.quadraticCurveTo(-s * 0.34, -s * 0.1 + Math.sin(t * 2) * s * 0.02, -s * 0.22, -s * 0.02); ctx.lineTo(s * 0.22, -s * 0.02); ctx.quadraticCurveTo(s * 0.34, -s * 0.1 + Math.sin(t * 2 + 1) * s * 0.02, s * 0.14, -s * 0.44); ctx.globalAlpha = 0.85; ctx.fill(); ctx.globalAlpha = 1; ctx.stroke(); }
  // 장신구 (등 뒤에서 보이는 것)
  if (acc.id === 'acc5') { ctx.save(); ctx.translate(-s * 0.02, -s * 0.28); ctx.rotate(-0.5); drawFish(ctx, { id: 'doll', look: { shape: 'fish', c1: '#7AC2F2', c2: '#E8F6FF', c3: '#F28AA0', pat: 'none' } }, 0, 0, s * 0.3); ctx.restore(); ctx.strokeStyle = '#8A6A44'; ctx.beginPath(); ctx.moveTo(-s * 0.1, -s * 0.42); ctx.lineTo(-s * 0.02, -s * 0.2); ctx.moveTo(s * 0.1, -s * 0.42); ctx.lineTo(s * 0.04, -s * 0.3); ctx.stroke(); ctx.strokeStyle = OUT; }
  if (acc.id === 'acc2' || acc.id === 'acc4') { ctx.strokeStyle = '#8A6A44'; ctx.lineWidth = s * 0.008; ctx.beginPath(); ctx.arc(0, -s * 0.47, s * 0.11, 0.2, Math.PI - 0.2); ctx.stroke(); ctx.lineWidth = s * 0.02; ctx.strokeStyle = OUT; if (acc.id === 'acc4') { ctx.save(); ctx.shadowColor = acc.color; ctx.shadowBlur = s * 0.08; ctx.fillStyle = acc.color; ctx.beginPath(); ctx.arc(s * 0.1, -s * 0.4, s * 0.03, 0, TAU); ctx.fill(); ctx.restore(); } }
  if (acc.id === 'acc3') { ctx.fillStyle = acc.color; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.arc(s * 0.1 + Math.cos(i * 1.57) * s * 0.022, -s * 0.3 + Math.sin(i * 1.57) * s * 0.022, s * 0.02, 0, TAU); ctx.fill(); } }
  ctx.fillStyle = A.fur; for (const sx of [-1, 1]) { ctx.beginPath(); ctx.ellipse(sx * s * 0.16, -s * 0.33, s * 0.05, s * 0.09, sx * 0.6, 0, TAU); ctx.fill(); ctx.stroke(); }
  }
  // 낚싯대
  const hx = s * 0.02, hy = -s * 0.36;
  const rl = s * 1.15, tipX = hx + Math.cos(rodA) * rl, tipY = hy + Math.sin(rodA) * rl;
  if (ROD) {
  ctx.strokeStyle = shade(rod.color, -0.35); ctx.lineWidth = s * 0.035; ctx.beginPath(); ctx.moveTo(hx - Math.cos(rodA) * s * 0.15, hy - Math.sin(rodA) * s * 0.15); ctx.lineTo(hx, hy); ctx.stroke();
  ctx.strokeStyle = rod.color; ctx.lineWidth = s * 0.022; ctx.beginPath(); ctx.moveTo(hx, hy); ctx.quadraticCurveTo(hx + Math.cos(rodA) * rl * 0.6, hy + Math.sin(rodA) * rl * 0.6 + (pose === 'pull' ? s * 0.12 : 0), tipX, tipY + (pose === 'pull' ? s * 0.1 : 0)); ctx.stroke();
  if (rod.id === 'rod8') { ctx.save(); ctx.shadowColor = '#9AF2FF'; ctx.shadowBlur = s * 0.1; ctx.fillStyle = '#9AF2FF'; ctx.beginPath(); ctx.arc(tipX, tipY + (pose === 'pull' ? s * 0.1 : 0), s * 0.025, 0, TAU); ctx.fill(); ctx.restore(); }
  ctx.fillStyle = '#5A5A60'; ctx.beginPath(); ctx.arc(hx - Math.cos(rodA) * s * 0.05 + s * 0.03, hy - Math.sin(rodA) * s * 0.05, s * 0.035, 0, TAU); ctx.fill();
  }
  ctx.lineWidth = s * 0.02; ctx.strokeStyle = OUT;
  if (BODY) {
  // 머리 (뒤통수)
  const head = -s * 0.62;
  ctx.fillStyle = A.fur;
  const ear = (ex, ey, ang) => { ctx.save(); ctx.translate(ex, ey); ctx.rotate(ang);
    if (A.ear === 'bunny') { ctx.beginPath(); ctx.ellipse(0, -s * 0.16, s * 0.05, s * 0.17, 0, 0, TAU); ctx.fill(); ctx.stroke(); }
    else if (A.ear === 'cat' || A.ear === 'fox') { ctx.beginPath(); ctx.moveTo(-s * 0.06, 0); ctx.lineTo(0, -s * (A.ear === 'fox' ? 0.15 : 0.11)); ctx.lineTo(s * 0.06, 0); ctx.closePath(); ctx.fill(); ctx.stroke(); }
    else { ctx.beginPath(); ctx.arc(0, -s * 0.02, s * 0.055, 0, TAU); ctx.fill(); ctx.stroke(); }
    ctx.restore(); };
  ear(-s * 0.13, head - s * 0.12, -0.35); ear(s * 0.13, head - s * 0.12, 0.35);
  ctx.beginPath(); ctx.ellipse(0, head, s * 0.2, s * 0.18, 0, 0, TAU); ctx.fill(); ctx.stroke();
  ctx.fillStyle = shade(A.fur, 0.15); ctx.beginPath(); ctx.ellipse(-s * 0.05, head - s * 0.06, s * 0.08, s * 0.05, -0.4, 0, TAU); ctx.fill();
  if (acc.id === 'acc1') { ctx.strokeStyle = '#2E2E34'; ctx.lineWidth = s * 0.012; ctx.beginPath(); ctx.moveTo(-s * 0.2, head + s * 0.01); ctx.quadraticCurveTo(0, head + s * 0.05, s * 0.2, head + s * 0.01); ctx.stroke(); ctx.lineWidth = s * 0.02; ctx.strokeStyle = OUT; }
  // 모자
  drawHat(ctx, hat, 0, head - s * 0.1, s, t);
  }
  ctx.restore();
  return { x: x + tipX, y: y + bob + tipY + (pose === 'pull' ? s * 0.1 : 0) };
}
export function drawHat(ctx, hat, x, y, s, t = 0) {
  ctx.save(); ctx.translate(x, y); ctx.lineWidth = s * 0.02; ctx.strokeStyle = OUT; ctx.fillStyle = hat.color;
  if (hat.id === 'hat1') { ctx.beginPath(); ctx.ellipse(0, s * 0.03, s * 0.3, s * 0.07, 0, 0, TAU); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.ellipse(0, -s * 0.02, s * 0.14, s * 0.1, 0, Math.PI, TAU); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#E86A5A'; ctx.fillRect(-s * 0.14, -s * 0.01, s * 0.28, s * 0.03); }
  else if (hat.id === 'hat2') { ctx.beginPath(); ctx.ellipse(0, -s * 0.02, s * 0.2, s * 0.09, 0, 0, TAU); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(0, -s * 0.06, s * 0.17, s * 0.07, 0, Math.PI, TAU); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#F2C23A'; ctx.fillRect(-s * 0.15, -s * 0.03, s * 0.3, s * 0.02); }
  else if (hat.id === 'hat3') { ctx.beginPath(); ctx.ellipse(0, 0, s * 0.18, s * 0.15, 0, Math.PI, TAU); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#fff'; ctx.fillRect(-s * 0.19, -s * 0.02, s * 0.38, s * 0.05); ctx.beginPath(); ctx.arc(0, -s * 0.17, s * 0.05, 0, TAU); ctx.fill(); ctx.stroke(); }
  else if (hat.id === 'hat4') { ctx.beginPath(); ctx.ellipse(0, 0, s * 0.2, s * 0.13, 0, Math.PI, TAU); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.moveTo(s * 0.15, -s * 0.02); ctx.quadraticCurveTo(s * 0.3, s * 0.05 + Math.sin(t * 3) * s * 0.02, s * 0.28, s * 0.12); ctx.lineTo(s * 0.2, s * 0.04); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(-s * 0.06, -s * 0.07, s * 0.02, 0, TAU); ctx.arc(s * 0.04, -s * 0.07, s * 0.02, 0, TAU); ctx.fill(); }
  else if (hat.id === 'hat5') { ctx.beginPath(); ctx.moveTo(-s * 0.17, s * 0.02); ctx.quadraticCurveTo(0, -s * 0.1, s * 0.17, s * 0.02); ctx.lineTo(s * 0.03, -s * 0.38); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#F2E680'; star(ctx, -s * 0.02, -s * 0.15, s * 0.04, 5); star(ctx, s * 0.06, -s * 0.05, s * 0.025, 5); star(ctx, s * 0.03, -s * 0.4, s * 0.04, 5); }
  else if (hat.id === 'hat6') { ctx.beginPath(); ctx.moveTo(-s * 0.15, s * 0.02); ctx.lineTo(-s * 0.16, -s * 0.12); ctx.lineTo(-s * 0.08, -s * 0.05); ctx.lineTo(0, -s * 0.16); ctx.lineTo(s * 0.08, -s * 0.05); ctx.lineTo(s * 0.16, -s * 0.12); ctx.lineTo(s * 0.15, s * 0.02); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#E8545A'; ctx.beginPath(); ctx.arc(0, -s * 0.03, s * 0.025, 0, TAU); ctx.fill(); ctx.fillStyle = '#5AB8F2'; ctx.beginPath(); ctx.arc(-s * 0.09, -s * 0.01, s * 0.018, 0, TAU); ctx.arc(s * 0.09, -s * 0.01, s * 0.018, 0, TAU); ctx.fill(); }
  ctx.restore();
}
/** 아바타 미리보기 (앞모습, 꾸미기 화면용) */
export function drawAvatarFront(ctx, x, y, s, av, items, t = 0) {
  const S0 = 300, key = ['front', av.animal.id, av.hat, av.outfit, av.acc].join(':');
  let sp = SPR.get(key);
  if (!sp) { const q = 2, c = document.createElement('canvas'); c.width = S0 * 1.0 * q; c.height = S0 * 1.25 * q; const b = c.getContext('2d'); b.scale(q, q); rawAvatarFront(b, S0 * 0.5, S0 * 1.15, S0, av, items, 0);
    sp = { c: paintify(c, [av.animal.fur, items[av.outfit].color, items[av.hat].color], S0 * q, key), q }; SPR.set(key, sp); }
  const k = s / S0; ctx.drawImage(sp.c, x - S0 * 0.5 * k, y - S0 * 1.15 * k + Math.sin(t * 2) * s * 0.01, sp.c.width / sp.q * k, sp.c.height / sp.q * k);
}
function rawAvatarFront(ctx, x, y, s, av, items, t = 0) {
  const A = av.animal, hat = items[av.hat], outfit = items[av.outfit], acc = items[av.acc];
  ctx.save(); ctx.translate(x, y + Math.sin(t * 2) * s * 0.01); ctx.lineWidth = s * 0.02; ctx.strokeStyle = OUT; ctx.lineJoin = 'round';
  ctx.fillStyle = 'rgba(0,0,0,.15)'; ctx.beginPath(); ctx.ellipse(0, s * 0.02, s * 0.3, s * 0.05, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = A.fur; for (const sx of [-1, 1]) { ctx.beginPath(); ctx.ellipse(sx * s * 0.1, -s * 0.05, s * 0.07, s * 0.07, 0, 0, TAU); ctx.fill(); ctx.stroke(); }
  if (outfit.id === 'outfit5') { ctx.fillStyle = outfit.color; ctx.beginPath(); ctx.moveTo(-s * 0.14, -s * 0.44); ctx.lineTo(-s * 0.28, -s * 0.04); ctx.lineTo(s * 0.28, -s * 0.04); ctx.lineTo(s * 0.14, -s * 0.44); ctx.fill(); ctx.stroke(); }
  ctx.fillStyle = outfit.color; ctx.beginPath(); ctx.moveTo(-s * 0.19, -s * 0.08); ctx.quadraticCurveTo(-s * 0.23, -s * 0.38, -s * 0.12, -s * 0.44); ctx.lineTo(s * 0.12, -s * 0.44); ctx.quadraticCurveTo(s * 0.23, -s * 0.38, s * 0.19, -s * 0.08); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.save(); ctx.clip(); ctx.fillStyle = A.belly; ctx.globalAlpha = outfit.id === 'outfit1' ? 0 : 0;
  if (outfit.id === 'outfit1') { ctx.globalAlpha = 1; ctx.fillStyle = '#fff'; for (let i = 0; i < 4; i++) ctx.fillRect(-s * 0.3, -s * (0.4 - i * 0.08), s * 0.6, s * 0.03); }
  if (outfit.id === 'outfit2') { ctx.globalAlpha = 1; ctx.fillStyle = '#F2F0E8'; ctx.fillRect(-s * 0.02, -s * 0.44, s * 0.04, s * 0.36); ctx.fillRect(-s * 0.3, -s * 0.22, s * 0.6, s * 0.03); }
  if (outfit.id === 'outfit3') { ctx.globalAlpha = 1; ctx.fillStyle = shade(outfit.color, 0.3); ctx.fillRect(-s * 0.1, -s * 0.3, s * 0.2, s * 0.14); ctx.fillStyle = shade(outfit.color, -0.25); ctx.fillRect(-s * 0.12, -s * 0.44, s * 0.04, s * 0.2); ctx.fillRect(s * 0.08, -s * 0.44, s * 0.04, s * 0.2); }
  if (outfit.id === 'outfit4') { ctx.globalAlpha = 1; ctx.fillStyle = '#7AC2F2'; ctx.fillRect(-s * 0.3, -s * 0.3, s * 0.6, s * 0.02); ctx.fillStyle = '#F2C23A'; ctx.fillRect(-s * 0.02, -s * 0.44, s * 0.04, s * 0.34); }
  ctx.restore(); ctx.globalAlpha = 1;
  ctx.fillStyle = A.fur; for (const sx of [-1, 1]) { ctx.beginPath(); ctx.ellipse(sx * s * 0.2, -s * 0.28, s * 0.05, s * 0.09, -sx * 0.4, 0, TAU); ctx.fill(); ctx.stroke(); }
  if (acc.id === 'acc2' || acc.id === 'acc4') { ctx.strokeStyle = '#8A6A44'; ctx.lineWidth = s * 0.008; ctx.beginPath(); ctx.arc(0, -s * 0.47, s * 0.1, 0.4, Math.PI - 0.4); ctx.stroke(); ctx.lineWidth = s * 0.02; ctx.strokeStyle = OUT; ctx.save(); if (acc.id === 'acc4') { ctx.shadowColor = acc.color; ctx.shadowBlur = s * 0.08; } ctx.fillStyle = acc.color; ctx.beginPath(); ctx.arc(0, -s * 0.37, s * 0.035, 0, TAU); ctx.fill(); ctx.restore(); }
  if (acc.id === 'acc3') { ctx.fillStyle = acc.color; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.arc(-s * 0.09 + Math.cos(i * 1.57) * s * 0.02, -s * 0.33 + Math.sin(i * 1.57) * s * 0.02, s * 0.018, 0, TAU); ctx.fill(); } }
  if (acc.id === 'acc5') { ctx.save(); ctx.translate(s * 0.22, -s * 0.32); ctx.rotate(0.6); drawFish(ctx, { id: 'doll', look: { shape: 'fish', c1: '#7AC2F2', c2: '#E8F6FF', c3: '#F28AA0', pat: 'none' } }, 0, 0, s * 0.24); ctx.restore(); }
  const head = -s * 0.62; ctx.fillStyle = A.fur;
  const ear = (ex, ey, ang) => { ctx.save(); ctx.translate(ex, ey); ctx.rotate(ang);
    if (A.ear === 'bunny') { ctx.beginPath(); ctx.ellipse(0, -s * 0.16, s * 0.05, s * 0.17, 0, 0, TAU); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#F6C2CE'; ctx.beginPath(); ctx.ellipse(0, -s * 0.16, s * 0.025, s * 0.12, 0, 0, TAU); ctx.fill(); ctx.fillStyle = A.fur; }
    else if (A.ear === 'cat' || A.ear === 'fox') { ctx.beginPath(); ctx.moveTo(-s * 0.06, 0); ctx.lineTo(0, -s * (A.ear === 'fox' ? 0.15 : 0.11)); ctx.lineTo(s * 0.06, 0); ctx.closePath(); ctx.fill(); ctx.stroke(); }
    else { ctx.beginPath(); ctx.arc(0, -s * 0.02, s * 0.055, 0, TAU); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#F6C2CE'; ctx.beginPath(); ctx.arc(0, -s * 0.02, s * 0.028, 0, TAU); ctx.fill(); ctx.fillStyle = A.fur; }
    ctx.restore(); };
  ear(-s * 0.13, head - s * 0.12, -0.35); ear(s * 0.13, head - s * 0.12, 0.35);
  ctx.beginPath(); ctx.ellipse(0, head, s * 0.2, s * 0.18, 0, 0, TAU); ctx.fill(); ctx.stroke();
  ctx.fillStyle = A.belly; ctx.beginPath(); ctx.ellipse(0, head + s * 0.06, s * 0.12, s * 0.08, 0, 0, TAU); ctx.fill();
  if (A.id === 'fox') { ctx.beginPath(); ctx.moveTo(-s * 0.18, head + s * 0.02); ctx.quadraticCurveTo(0, head + s * 0.18, s * 0.18, head + s * 0.02); ctx.quadraticCurveTo(0, head + s * 0.06, -s * 0.18, head + s * 0.02); ctx.fill(); }
  ctx.fillStyle = '#2A2028'; for (const sx of [-1, 1]) { ctx.beginPath(); ctx.ellipse(sx * s * 0.075, head - s * 0.01, s * 0.022, s * 0.028, 0, 0, TAU); ctx.fill(); }
  ctx.fillStyle = '#fff'; for (const sx of [-1, 1]) { ctx.beginPath(); ctx.arc(sx * s * 0.075 + s * 0.008, head - s * 0.02, s * 0.008, 0, TAU); ctx.fill(); }
  ctx.fillStyle = '#5A3A3A'; ctx.beginPath(); ctx.ellipse(0, head + s * 0.04, s * 0.02, s * 0.014, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = 'rgba(242,120,140,.35)'; for (const sx of [-1, 1]) { ctx.beginPath(); ctx.ellipse(sx * s * 0.13, head + s * 0.05, s * 0.03, s * 0.018, 0, 0, TAU); ctx.fill(); }
  if (acc.id === 'acc1') { ctx.fillStyle = 'rgba(30,30,40,.85)'; ctx.strokeStyle = '#2E2E34'; for (const sx of [-1, 1]) { ctx.beginPath(); ctx.arc(sx * s * 0.075, head - s * 0.01, s * 0.045, 0, TAU); ctx.fill(); } ctx.beginPath(); ctx.moveTo(-s * 0.03, head - s * 0.015); ctx.lineTo(s * 0.03, head - s * 0.015); ctx.stroke(); ctx.strokeStyle = OUT; }
  drawHat(ctx, hat, 0, head - s * 0.1, s, t);
  ctx.restore();
}
