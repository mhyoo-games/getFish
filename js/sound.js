// 소리: 녹음 파일 없이 브라우저에서 바로 합성 (효과음 + 바다마다 다른 잔잔한 배경음)
export function createSound() {
  let ctx = null, master = null, music = null, sfx = null, on = true, timer = null, stage = 1, step = 0, nextT = 0;
  try { on = localStorage.getItem('getfish_sound') !== 'off'; } catch (e) { }
  function init() {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    ctx = new AC(); master = ctx.createGain(); master.gain.value = on ? 0.8 : 0; master.connect(ctx.destination);
    music = ctx.createGain(); music.gain.value = 0.42; music.connect(master); sfx = ctx.createGain(); sfx.gain.value = 0.9; sfx.connect(master);
    nextT = ctx.currentTime + 0.1; timer = setInterval(schedule, 100);
    document.addEventListener('visibilitychange', () => { if (!ctx) return; document.hidden ? ctx.suspend() : ctx.resume(); });
  }
  const tone = (dest, f, t, d, v = 0.2, type = 'sine', slide = 0) => {
    const o = ctx.createOscillator(), g = ctx.createGain(); o.type = type; o.frequency.setValueAtTime(f, t); if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, f * slide), t + d);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + 0.008); g.gain.exponentialRampToValueAtTime(0.0005, t + d); o.connect(g).connect(dest); o.start(t); o.stop(t + d + 0.05);
  };
  const pluck = (dest, f, t, v = 0.12, d = 0.5) => { tone(dest, f, t, d, v, 'triangle'); tone(dest, f * 2, t, d * 0.4, v * 0.25, 'sine'); };
  let nb = null; const noise = () => { if (nb) return nb; nb = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate); const d = nb.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return nb; };
  const splashN = (t, v = 0.2, f = 1200, d = 0.35) => { const s = ctx.createBufferSource(); s.buffer = noise(); const fl = ctx.createBiquadFilter(); fl.type = 'bandpass'; fl.frequency.setValueAtTime(f, t); fl.frequency.exponentialRampToValueAtTime(f * 0.3, t + d); const g = ctx.createGain(); g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.0005, t + d); s.connect(fl).connect(g).connect(sfx); s.start(t, Math.random()); s.stop(t + d + 0.05); };
  // 배경음 「바닷바람 메모리」: 90년대 J-pop 느낌의 경쾌한 8비트 곡 (멜로디·코드 진행 모두 새로 지음)
  // 구성: 인트로 4마디 → A 8 → B 8 → 후렴 8 → 후렴2 8 → (인트로부터 다시). 바다마다 조를 옮기고 심해는 조금 차분하게.
  const semi = (r, n) => r * Math.pow(2, n / 12);
  const BPM = 98, SIX = 60 / BPM / 4;   // 16분음표 길이
  const CH = {   // 코드: 근음(D=0 기준 반음) + 구성음
    D: [0, [0, 4, 7]], 'A/C#': [-1, [7, 11, 14]], Bm: [-3, [9, 14, 18]], 'F#m': [4, [4, 9, 13]], G: [-5, [7, 11, 14]], 'D/F#': [4, [2, 6, 9]], Em7: [-10, [4, 7, 11, 14]],
    A: [-5, [9, 13, 16]], Asus: [-5, [9, 14, 16]], Em: [-10, [4, 7, 11]], D7: [0, [0, 4, 7, 12]],
  };
  const SEC = [
    { n: 'intro', ch: ['G', 'A', 'F#m', 'Bm'], pad: 0.4, lead: [] },
    { n: 'A', ch: ['D', 'A/C#', 'Bm', 'F#m', 'G', 'D/F#', 'Em7', 'A'], pad: 0, lead: [
      [[0, 66, 2], [2, 66, 2], [4, 69, 2], [6, 66, 2], [8, 64, 4], [12, 62, 4]], [[0, 64, 2], [2, 64, 2], [4, 66, 2], [6, 64, 2], [8, 61, 4], [12, 57, 4]],
      [[0, 62, 2], [2, 66, 2], [4, 71, 4], [8, 69, 2], [10, 66, 2], [12, 64, 4]], [[0, 61, 4], [4, 64, 4], [8, 66, 8]],
      [[0, 67, 2], [2, 67, 2], [4, 71, 2], [6, 69, 2], [8, 67, 4], [12, 66, 4]], [[0, 66, 2], [2, 69, 2], [4, 74, 4], [8, 73, 2], [10, 69, 2], [12, 66, 4]],
      [[0, 64, 2], [2, 67, 2], [4, 71, 2], [6, 69, 2], [8, 67, 2], [10, 66, 2], [12, 64, 4]], [[0, 64, 4], [4, 66, 2], [6, 67, 2], [8, 69, 8]]] },
    { n: 'B', ch: ['G', 'A', 'F#m', 'Bm', 'Em', 'F#m', 'G', 'Asus'], pad: 0.7, lead: [
      [[0, 71, 4], [4, 69, 2], [6, 67, 2], [8, 69, 4], [12, 71, 4]], [[0, 73, 4], [4, 71, 2], [6, 69, 2], [8, 64, 8]],
      [[0, 69, 4], [4, 67, 2], [6, 66, 2], [8, 67, 4], [12, 69, 4]], [[0, 71, 8], [8, 74, 4], [12, 73, 4]],
      [[0, 71, 4], [4, 69, 2], [6, 67, 2], [8, 64, 4], [12, 67, 4]], [[0, 69, 4], [4, 67, 2], [6, 66, 2], [8, 61, 4], [12, 66, 4]],
      [[0, 67, 4], [4, 69, 4], [8, 71, 4], [12, 74, 4]], [[0, 76, 10], [12, 69, 2], [14, 71, 2]]] },
    { n: 'C', ch: ['G', 'A', 'F#m', 'Bm', 'G', 'A', 'D', 'D'], pad: 1, lead: [
      [[0, 69, 2], [2, 71, 2], [4, 74, 4], [8, 71, 2], [10, 69, 2], [12, 71, 4]], [[0, 73, 2], [2, 74, 2], [4, 76, 4], [8, 74, 2], [10, 73, 2], [12, 69, 4]],
      [[0, 78, 6], [6, 76, 2], [8, 74, 4], [12, 73, 4]], [[0, 74, 8], [8, 71, 2], [10, 73, 2], [12, 74, 2], [14, 76, 2]],
      [[0, 78, 3], [3, 76, 3], [6, 74, 2], [8, 71, 4], [12, 74, 4]], [[0, 76, 3], [3, 74, 3], [6, 73, 2], [8, 69, 4], [12, 71, 2], [14, 73, 2]],
      [[0, 74, 12]], [[12, 69, 2], [14, 71, 2]]] },
    { n: 'C2', ch: ['G', 'A', 'F#m', 'Bm', 'Em', 'A', 'D', 'D7'], pad: 1, lead: [
      [[0, 69, 2], [2, 71, 2], [4, 74, 4], [8, 71, 2], [10, 69, 2], [12, 71, 4]], [[0, 73, 2], [2, 74, 2], [4, 76, 4], [8, 74, 2], [10, 73, 2], [12, 69, 4]],
      [[0, 78, 6], [6, 76, 2], [8, 74, 4], [12, 78, 4]], [[0, 81, 6], [6, 78, 2], [8, 76, 4], [12, 74, 4]],
      [[0, 76, 4], [4, 74, 2], [6, 71, 2], [8, 74, 4], [12, 76, 4]], [[0, 78, 4], [4, 76, 2], [6, 73, 2], [8, 69, 8]],
      [[0, 74, 16]], [[0, 74, 8]]] },
  ];
  const BARS = []; for (const s of SEC) s.ch.forEach((c, i) => BARS.push({ s, c, i, lead: s.lead[i] || [], first: i === 0 }));
  const KEY = { 1: 0, 2: 2, 3: -2, 4: -3 };
  const mf = m => 440 * Math.pow(2, (m - 69) / 12);
  let delay = null;
  function bus() {   // 리드용 메아리 (가벼운 딜레이)
    if (delay) return delay; const d = ctx.createDelay(1), fb = ctx.createGain(), wet = ctx.createGain(), inp = ctx.createGain();
    d.delayTime.value = SIX * 3; fb.gain.value = 0.28; wet.gain.value = 0.25; inp.connect(music); inp.connect(d); d.connect(fb).connect(d); d.connect(wet).connect(music); return (delay = inp);
  }
  const kick = t => { const o = ctx.createOscillator(), g = ctx.createGain(); o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.18); g.gain.setValueAtTime(0.55, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.32); o.connect(g).connect(music); o.start(t); o.stop(t + 0.35); };
  const snare = (t, v = 0.22) => { const s = ctx.createBufferSource(); s.buffer = noise(); const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 1900; f.Q.value = 0.7; const g = ctx.createGain(); g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.18); s.connect(f).connect(g).connect(music); s.start(t, Math.random()); s.stop(t + 0.2); tone(music, 190, t, 0.1, v * 0.5, 'triangle', 0.7); };
  const hat = (t, v = 0.05, open = false) => { const s = ctx.createBufferSource(); s.buffer = noise(); const f = ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 7500; const g = ctx.createGain(); g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.001, t + (open ? 0.25 : 0.05)); s.connect(f).connect(g).connect(music); s.start(t, Math.random()); s.stop(t + 0.3); };
  const crash = t => { const s = ctx.createBufferSource(); s.buffer = noise(); const f = ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 4000; const g = ctx.createGain(); g.gain.setValueAtTime(0.08, t); g.gain.exponentialRampToValueAtTime(0.001, t + 1.4); s.connect(f).connect(g).connect(music); s.start(t, Math.random() * 0.5); s.stop(t + 1.5); };
  const bassN = (t, f, d) => { const o = ctx.createOscillator(), fl = ctx.createBiquadFilter(), g = ctx.createGain(); o.type = 'sawtooth'; o.frequency.value = f; fl.type = 'lowpass'; fl.frequency.setValueAtTime(900, t); fl.frequency.exponentialRampToValueAtTime(260, t + d); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.13, t + 0.01); g.gain.exponentialRampToValueAtTime(0.002, t + d); o.connect(fl).connect(g).connect(music); o.start(t); o.stop(t + d + 0.02); };
  const ep = (t, f, d, v) => { tone(music, f, t, d, v, 'sine'); tone(music, f * 2, t, d * 0.35, v * 0.35, 'triangle'); tone(music, f * 3.01, t, 0.08, v * 0.12, 'sine'); };   // 일렉 피아노
  const pad = (t, f, d, v) => { const g = ctx.createGain(), fl = ctx.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = 1600; g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(v, t + 0.35); g.gain.setValueAtTime(v, t + d - 0.2); g.gain.linearRampToValueAtTime(0.0001, t + d + 0.3); fl.connect(g).connect(music);
    for (const det of [-6, 0, 7]) { const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f; o.detune.value = det; o.connect(fl); o.start(t); o.stop(t + d + 0.35); } };
  const lead = (t, f, d, v) => { const o = ctx.createOscillator(), o2 = ctx.createOscillator(), g = ctx.createGain(), fl = ctx.createBiquadFilter(), lfo = ctx.createOscillator(), lg = ctx.createGain();
    o.type = 'triangle'; o2.type = 'square'; o.frequency.value = f; o2.frequency.value = f; fl.type = 'lowpass'; fl.frequency.value = 2600;
    lfo.frequency.value = 5.5; lg.gain.setValueAtTime(0, t); lg.gain.linearRampToValueAtTime(f * 0.012, t + Math.min(d, 0.35)); lfo.connect(lg); lg.connect(o.frequency); lg.connect(o2.frequency);   // 늦게 들어오는 비브라토 (노래하듯)
    const g2 = ctx.createGain(); g2.gain.value = 0.18; o2.connect(g2).connect(fl); o.connect(fl); fl.connect(g);
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(v, t + 0.03); g.gain.setValueAtTime(v * 0.85, t + Math.max(0.05, d - 0.06)); g.gain.linearRampToValueAtTime(0.0001, t + d + 0.08);
    g.connect(bus()); [o, o2, lfo].forEach(x => { x.start(t); x.stop(t + d + 0.1); }); };
  let bar = 0;
  function schedule(until) {
    if (!ctx || !on) return;
    while (nextT < (until ?? ctx.currentTime + 0.5)) {
      const B = BARS[bar % BARS.length], k = KEY[stage] || 0, soft = stage === 4 ? 0.7 : 1, i16 = step % 16, t = nextT;
      const [root, notes] = CH[B.c], R0 = 50 + k;   // D3 = 50
      // 드럼 (인트로 첫 마디·심해는 가볍게)
      const sec = B.s.n, full = sec !== 'intro' || B.i >= 1;
      if (i16 === 0 && B.first && sec !== 'A') crash(t);
      if (full) {
        if (i16 === 0 || i16 === 8 || i16 === 7 || (sec.startsWith('C') && i16 === 10)) kick(t);
        if (i16 === 4 || i16 === 12) snare(t, 0.2 * soft);
        if (sec === 'B' && B.i === 7 && i16 >= 12) snare(t, 0.12);   // 후렴 들어가기 전 필인
        if (i16 % 2 === 0) hat(t, (i16 % 4 === 2 ? 0.055 : 0.035) * soft, sec.startsWith('C') && i16 % 8 === 6);
      }
      // 베이스: 8분음표, 가끔 옥타브
      if (i16 % 2 === 0) bassN(t, mf(R0 - 12 + root + (i16 === 6 || i16 === 14 ? 12 : 0)), SIX * 1.8);
      // 일렉 피아노 엇박 반주
      if ([0, 3, 6, 10, 12].includes(i16)) for (const n of notes) ep(t, mf(R0 + 12 + n), SIX * (i16 === 12 ? 4 : 2.6), 0.035 * soft);
      if (sec === 'intro' && i16 % 2 === 1) ep(t, mf(R0 + 24 + notes[(i16 >> 1) % notes.length]), SIX * 2, 0.03);   // 인트로 반짝이는 아르페지오
      // 스트링
      if (i16 === 0 && B.s.pad) for (const n of notes) pad(t, mf(R0 + n), SIX * 16, 0.018 * B.s.pad * soft);
      // 멜로디
      for (const [at, m, len] of B.lead) if (at === i16) lead(t, mf(m + k), SIX * len * 0.95, 0.07 * soft);
      step++; nextT += SIX; if (step % 16 === 0) bar++;
    }
  }
  const S = {
    init, get on() { return on; },
    toggle() { on = !on; try { localStorage.setItem('getfish_sound', on ? 'on' : 'off'); } catch (e) { } if (master) master.gain.value = on ? 0.8 : 0; return on; },
    stage(n) { if (n !== stage) { stage = n; } },
    cast() { if (!ctx) return; const t = ctx.currentTime; tone(sfx, 900, t, 0.25, 0.05, 'sine', 0.4); splashN(t + 0.45, 0.25, 1400, 0.4); },
    bite() { if (!ctx) return; const t = ctx.currentTime; tone(sfx, 880, t, 0.12, 0.15, 'square'); tone(sfx, 1320, t + 0.1, 0.15, 0.12, 'square'); splashN(t, 0.15, 2000, 0.2); },
    hook() { if (!ctx) return; const t = ctx.currentTime; splashN(t, 0.35, 1800, 0.5); tone(sfx, 300, t, 0.3, 0.1, 'sawtooth', 1.6); },
    hit(kind, gold) { if (!ctx) return; const t = ctx.currentTime; const f = kind === 'perfect' ? 1046 : 784; tone(sfx, f, t, 0.12, 0.16, 'triangle'); if (gold) { tone(sfx, f * 1.5, t + 0.05, 0.2, 0.12, 'triangle'); tone(sfx, f * 2, t + 0.1, 0.25, 0.08, 'sine'); } splashN(t, 0.08, 2500, 0.12); },
    miss() { if (!ctx) return; const t = ctx.currentTime; tone(sfx, 220, t, 0.25, 0.15, 'sawtooth', 0.6); },
    snap() { if (!ctx) return; const t = ctx.currentTime; splashN(t, 0.4, 3000, 0.15); tone(sfx, 400, t, 0.4, 0.12, 'square', 0.3); },
    catch() { if (!ctx) return; const t = ctx.currentTime; [0, 4, 7, 12].forEach((n, i) => pluck(sfx, semi(523.3, n), t + i * 0.09, 0.18, 0.6)); splashN(t, 0.3, 1500, 0.6); },
    coin() { if (!ctx) return; const t = ctx.currentTime; tone(sfx, 1568, t, 0.08, 0.1, 'square'); tone(sfx, 2093, t + 0.07, 0.18, 0.08, 'square'); },
    fanfare() { if (!ctx) return; const t = ctx.currentTime; [0, 4, 7, 12, 7, 12, 16].forEach((n, i) => pluck(sfx, semi(392, n), t + i * 0.11, 0.18, 0.7)); },
    /** 확인용: 배경음을 n초 녹음해 WAV로 (브라우저 오프라인 렌더) */
    async preview(sec = 40, st = 1) {
      const off = new OfflineAudioContext(2, 44100 * sec, 44100), keep = [ctx, master, music, sfx, delay, nb, nextT, step, bar, stage, on];
      ctx = off; master = ctx.createGain(); master.gain.value = 0.8; master.connect(ctx.destination); music = ctx.createGain(); music.gain.value = 0.42; music.connect(master); sfx = ctx.createGain(); sfx.connect(master);
      delay = null; nb = null; nextT = 0.05; step = 0; bar = 0; stage = st; on = true; schedule(sec - 0.5);
      const buf = await off.startRendering(); [ctx, master, music, sfx, delay, nb, nextT, step, bar, stage, on] = keep; return buf;
    },
    click() { if (!ctx) return; tone(sfx, 660, ctx.currentTime, 0.05, 0.06, 'triangle'); },
  };
  return S;
}
