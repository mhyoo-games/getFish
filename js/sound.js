// 소리: 녹음 파일 없이 브라우저에서 바로 합성 (효과음 + 바다마다 다른 잔잔한 배경음)
export function createSound() {
  let ctx = null, master = null, music = null, sfx = null, on = true, timer = null, stage = 1, step = 0, nextT = 0;
  try { on = localStorage.getItem('getfish_sound') !== 'off'; } catch (e) { }
  function init() {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    ctx = new AC(); master = ctx.createGain(); master.gain.value = on ? 0.8 : 0; master.connect(ctx.destination);
    music = ctx.createGain(); music.gain.value = 0.32; music.connect(master); sfx = ctx.createGain(); sfx.gain.value = 0.9; sfx.connect(master);
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
  // 배경음: 바다마다 음계·빠르기를 달리한 짧은 반복 (모두 새로 지은 가락)
  const SONGS = {
    1: { bpm: 96, root: 261.6, sc: [0, 2, 4, 7, 9, 12, 14], mel: [0, 2, 4, 2, 5, 4, 2, -1, 3, 4, 5, 4, 2, 1, 0, -1], bass: [0, 0, 3, 3, 4, 4, 3, 3] },
    2: { bpm: 108, root: 293.7, sc: [0, 2, 4, 7, 9, 12, 14], mel: [4, -1, 4, 5, 6, 5, 4, 2, 3, -1, 3, 4, 2, 1, 0, -1], bass: [0, 0, 4, 4, 3, 3, 4, 4] },
    3: { bpm: 80, root: 220.0, sc: [0, 3, 5, 7, 10, 12, 15], mel: [0, -1, 2, 3, 4, -1, 3, 2, 1, -1, 2, 1, 0, -1, -1, -1], bass: [0, 0, 2, 2, 3, 3, 2, 2] },
    4: { bpm: 70, root: 196.0, sc: [0, 3, 5, 7, 10, 12, 15], mel: [4, -1, -1, 3, 2, -1, 1, -1, 2, -1, -1, 1, 0, -1, -1, -1], bass: [0, 0, 0, 0, 3, 3, 2, 2] },
  };
  const semi = (r, n) => r * Math.pow(2, n / 12);
  function schedule() {
    if (!ctx || !on) return; const S = SONGS[stage], q = 60 / S.bpm / 2;
    while (nextT < ctx.currentTime + 0.4) {
      const m = S.mel[step % S.mel.length]; if (m >= 0) pluck(music, semi(S.root, S.sc[m]), nextT, stage === 4 ? 0.07 : 0.1, stage >= 3 ? 1.1 : 0.6);
      if (step % 2 === 0) { const b = S.bass[(step / 2) % S.bass.length]; tone(music, semi(S.root / 2, S.sc[b]), nextT, q * 1.8, 0.07, 'sine'); }
      if (stage === 4 && step % 16 === 0) tone(music, semi(S.root * 2, 19), nextT, 2.5, 0.025, 'sine');   // 심해의 반짝이는 소리
      if (stage <= 2 && step % 8 === 4) splashN(nextT, 0.012, 600, 0.6);   // 잔물결
      step++; nextT += q;
    }
  }
  const S = {
    init, get on() { return on; },
    toggle() { on = !on; try { localStorage.setItem('getfish_sound', on ? 'on' : 'off'); } catch (e) { } if (master) master.gain.value = on ? 0.8 : 0; return on; },
    stage(n) { stage = n; step = 0; },
    cast() { if (!ctx) return; const t = ctx.currentTime; tone(sfx, 900, t, 0.25, 0.05, 'sine', 0.4); splashN(t + 0.45, 0.25, 1400, 0.4); },
    bite() { if (!ctx) return; const t = ctx.currentTime; tone(sfx, 880, t, 0.12, 0.15, 'square'); tone(sfx, 1320, t + 0.1, 0.15, 0.12, 'square'); splashN(t, 0.15, 2000, 0.2); },
    hook() { if (!ctx) return; const t = ctx.currentTime; splashN(t, 0.35, 1800, 0.5); tone(sfx, 300, t, 0.3, 0.1, 'sawtooth', 1.6); },
    hit(kind, gold) { if (!ctx) return; const t = ctx.currentTime; const f = kind === 'perfect' ? 1046 : 784; tone(sfx, f, t, 0.12, 0.16, 'triangle'); if (gold) { tone(sfx, f * 1.5, t + 0.05, 0.2, 0.12, 'triangle'); tone(sfx, f * 2, t + 0.1, 0.25, 0.08, 'sine'); } splashN(t, 0.08, 2500, 0.12); },
    miss() { if (!ctx) return; const t = ctx.currentTime; tone(sfx, 220, t, 0.25, 0.15, 'sawtooth', 0.6); },
    snap() { if (!ctx) return; const t = ctx.currentTime; splashN(t, 0.4, 3000, 0.15); tone(sfx, 400, t, 0.4, 0.12, 'square', 0.3); },
    catch() { if (!ctx) return; const t = ctx.currentTime; [0, 4, 7, 12].forEach((n, i) => pluck(sfx, semi(523.3, n), t + i * 0.09, 0.18, 0.6)); splashN(t, 0.3, 1500, 0.6); },
    coin() { if (!ctx) return; const t = ctx.currentTime; tone(sfx, 1568, t, 0.08, 0.1, 'square'); tone(sfx, 2093, t + 0.07, 0.18, 0.08, 'square'); },
    fanfare() { if (!ctx) return; const t = ctx.currentTime; [0, 4, 7, 12, 7, 12, 16].forEach((n, i) => pluck(sfx, semi(392, n), t + i * 0.11, 0.18, 0.7)); },
    click() { if (!ctx) return; tone(sfx, 660, ctx.currentTime, 0.05, 0.06, 'triangle'); },
  };
  return S;
}
