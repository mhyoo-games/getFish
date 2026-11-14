// 겟피쉬 3D 그림: 사람 낚시꾼(Kenney Mini Characters, CC0)과 같은 장난감 느낌으로 만든 물고기.
// 3D로 그린 뒤 2D 캔버스에 붙여 넣어요 (게임 화면은 2D 그대로).
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const TAU = Math.PI * 2;
function rng(seed) { let h = 2166136261; for (const c of String(seed)) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return () => ((h = Math.imul(h ^ (h >>> 15), 2246822507) ^ Math.imul(h ^ (h >>> 13), 3266489909)) >>> 0) / 4294967296; }
const col = (hex) => new THREE.Color(hex);

// 캐릭터마다 셔츠 칸(그림 조각에서 옷 색이 있는 네모): 옷을 바꾸면 이 칸만 새로 칠해요
const CHARS = {
  m: { file: 'male.glb', shirt: [256, 256, 64, 128] },
  f: { file: 'female.glb', shirt: [0, 384, 64, 128] },
};

function lights(scene, k = 1) {
  scene.add(new THREE.HemisphereLight(0xFFFFFF, 0x7A8AA0, 2.1 * k));
  const d = new THREE.DirectionalLight(0xFFF4E0, 2.2 * k); d.position.set(3, 5, 4); scene.add(d);
  const b = new THREE.DirectionalLight(0xBFD8FF, 0.8 * k); b.position.set(-4, 2, -3); scene.add(b);
}

export async function createToy(base = 'assets/chars/') {
  const loader = new GLTFLoader();
  const load = (f) => loader.loadAsync(base + f);
  const [gm, gf, gsun, ggl] = await Promise.all([load(CHARS.m.file), load(CHARS.f.file), load('aid-sunglasses.glb'), load('aid-glasses.glb')]);
  const src = { m: gm, f: gf };
  // 원래 그림 조각(색 팔레트)을 2D 캔버스로 — 옷 색을 바꿀 때 씀
  const texImg = gm.scene.getObjectByProperty('type', 'SkinnedMesh').material.map.image;
  const palette = document.createElement('canvas'); palette.width = texImg.width; palette.height = texImg.height; palette.getContext('2d').drawImage(texImg, 0, 0);

  // ------------------------------------------------ 렌더러 (화면 밖)
  const rCv = document.createElement('canvas');
  const R = new THREE.WebGLRenderer({ canvas: rCv, alpha: true, antialias: true, preserveDrawingBuffer: true });
  R.setPixelRatio(1); R.outputColorSpace = THREE.SRGBColorSpace; R.setClearColor(0x000000, 0);

  // ------------------------------------------------ 캐릭터
  const texCache = new Map();
  function outfitTex(g, color) {   // 셔츠 칸을 옷 색으로 (밝기 결은 그대로)
    const key = g + color; if (texCache.has(key)) return texCache.get(key);
    const c = document.createElement('canvas'); c.width = palette.width; c.height = palette.height; const x = c.getContext('2d'); x.drawImage(palette, 0, 0);
    if (color) {
      const [sx, sy, sw, sh] = CHARS[g].shirt, d = x.getImageData(sx, sy, sw, sh), tc = col(color); tc.convertSRGBToLinear();
      const t = new THREE.Color(color);
      let avg = 0; for (let i = 0; i < d.data.length; i += 4) avg += (d.data[i] * 0.3 + d.data[i + 1] * 0.59 + d.data[i + 2] * 0.11); avg /= d.data.length / 4;
      for (let i = 0; i < d.data.length; i += 4) { const l = (d.data[i] * 0.3 + d.data[i + 1] * 0.59 + d.data[i + 2] * 0.11) / avg; d.data[i] = Math.min(255, t.r * 255 * l); d.data[i + 1] = Math.min(255, t.g * 255 * l); d.data[i + 2] = Math.min(255, t.b * 255 * l); }
      x.putImageData(d, sx, sy);
    }
    const tex = new THREE.CanvasTexture(c); tex.flipY = false; tex.colorSpace = THREE.SRGBColorSpace; tex.magFilter = THREE.NearestFilter; tex.needsUpdate = true;
    texCache.set(key, tex); return tex;
  }
  function makeChar(g) {
    const s = src[g], root = cloneSkinned(s.scene), mixer = new THREE.AnimationMixer(root), acts = {};
    for (const a of s.animations) acts[a.name] = mixer.clipAction(a);
    const mats = []; root.traverse(o => { if (o.isSkinnedMesh || o.isMesh) { o.material = o.material.clone(); mats.push(o.material); o.frustumCulled = false; } });
    const bone = n => root.getObjectByName(n);
    return { g, root, mixer, acts, mats, bone, head: bone('head'), armR: bone('arm-right'), armL: bone('arm-left'), torso: bone('torso'), cur: null, wear: {} };
  }
  function play(ch, name, { fade = 0.15, once = false, speed = 1 } = {}) {
    const a = ch.acts[name] || ch.acts.idle; if (ch.cur === a) return a;
    a.reset(); a.setLoop(once ? THREE.LoopOnce : THREE.LoopRepeat); a.clampWhenFinished = once; a.timeScale = speed; a.enabled = true; a.setEffectiveWeight(1);
    if (ch.cur) a.crossFadeFrom(ch.cur, fade, false); a.play(); ch.cur = a; return a;
  }

  // 모자 · 장신구 · 낚싯대 (작은 상자로 만든 장난감 소품)
  const M = (c, o = {}) => new THREE.MeshStandardMaterial({ color: col(c), roughness: 0.75, metalness: 0, flatShading: true, ...o });
  const box = (w, h, d, c, o) => new THREE.Mesh(new THREE.BoxGeometry(w, h, d), typeof c === 'string' ? M(c, o) : c);
  const cyl = (r1, r2, h, n, c, o) => new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, h, n), typeof c === 'string' ? M(c, o) : c);
  // 머리 크기 (모델 단위): 머리 뼈 기준으로 붙임
  const HAT_Y = { m: 0.29, f: 0.3 };
  function hatMesh(id, c) {
    const g = new THREE.Group();
    if (id === 'hat1') { g.add(cyl(0.6, 0.6, 0.04, 14, c)); const t = cyl(0.34, 0.37, 0.24, 14, c); t.position.y = 0.13; g.add(t); const band = cyl(0.375, 0.375, 0.07, 14, '#C8503A'); band.position.y = 0.05; g.add(band); }
    else if (id === 'hat2') { const t = box(0.7, 0.2, 0.7, c); t.position.y = 0.1; g.add(t); const top = box(0.78, 0.08, 0.78, '#F4F4F4'); top.position.y = 0.22; g.add(top); const v = box(0.62, 0.04, 0.3, '#1A1E2A'); v.position.set(0, 0.02, 0.45); g.add(v); const e = box(0.16, 0.12, 0.04, '#F2C23A'); e.position.set(0, 0.12, 0.36); g.add(e); }
    else if (id === 'hat3') { const t = box(0.72, 0.3, 0.72, c); t.position.y = 0.12; g.add(t); const r = box(0.76, 0.1, 0.76, '#F4F0E8'); r.position.y = 0.0; g.add(r); const p = new THREE.Mesh(new THREE.IcosahedronGeometry(0.13, 0), M('#F4F0E8')); p.position.y = 0.36; g.add(p); }
    else if (id === 'hat4') { const t = box(0.72, 0.16, 0.72, c); t.position.y = 0.04; g.add(t); const k = box(0.16, 0.16, 0.2, c); k.position.set(-0.3, -0.04, -0.42); k.rotation.z = 0.5; g.add(k); const sk = box(0.14, 0.12, 0.02, '#F4F0E8'); sk.position.set(0, 0.06, 0.37); g.add(sk); }
    else if (id === 'hat5') { const cone = cyl(0.0, 0.36, 0.62, 8, c); cone.position.y = 0.3; g.add(cone); const st = new THREE.Mesh(new THREE.OctahedronGeometry(0.1, 0), M('#FFE27A', { emissive: col('#806000') })); st.position.y = 0.66; g.add(st); for (let i = 0; i < 5; i++) { const d = box(0.05, 0.05, 0.05, '#FFE27A'); const a = i * 1.3; d.position.set(Math.cos(a) * 0.22, 0.15 + i * 0.07, Math.sin(a) * 0.22); g.add(d); } }
    else if (id === 'hat6') { const ring = cyl(0.36, 0.36, 0.16, 8, c, { metalness: 0.4, roughness: 0.4 }); ring.position.y = 0.08; g.add(ring); for (let i = 0; i < 8; i++) { const a = i / 8 * TAU, sp = cyl(0, 0.07, 0.2, 4, c, { metalness: 0.4, roughness: 0.4 }); sp.position.set(Math.cos(a) * 0.33, 0.26, Math.sin(a) * 0.33); g.add(sp); const gem = box(0.06, 0.06, 0.03, i % 2 ? '#E8545A' : '#5AB8F2'); gem.position.set(Math.cos(a) * 0.37, 0.08, Math.sin(a) * 0.37); gem.lookAt(0, 0.08, 0); g.add(gem); } }
    else if (id === 'hat7') { const t = box(0.74, 0.14, 0.74, c); t.position.y = 0.05; g.add(t); const v = box(0.66, 0.04, 0.34, c); v.position.set(0, 0.0, 0.48); g.add(v); const lg = box(0.2, 0.12, 0.02, '#FFFFFF'); lg.position.set(0, 0.07, 0.38); g.add(lg); }
    else if (id === 'hat8') { g.add(cyl(0.62, 0.62, 0.04, 10, c)); const t = cyl(0.3, 0.36, 0.28, 10, c); t.position.y = 0.15; g.add(t); for (const s of [-1, 1]) { const h = cyl(0.03, 0.05, 0.3, 5, '#F4E8C8'); h.position.set(s * 0.3, 0.32, 0); h.rotation.z = -s * 0.6; g.add(h); } }
    else if (id === 'hat9') { const t = box(0.8, 0.12, 0.8, c, { emissive: col(c).multiplyScalar(0.25) }); t.position.y = 0.02; g.add(t); for (let i = 0; i < 6; i++) { const a = i / 6 * TAU, sp = new THREE.Mesh(new THREE.OctahedronGeometry(0.09, 0), M('#E8F6FF', { emissive: col('#4A7AA0') })); sp.scale.y = 2.4; sp.position.set(Math.cos(a) * 0.34, 0.2, Math.sin(a) * 0.34); g.add(sp); } }
    else if (id === 'hat10') { // 용왕 투구
      const t = box(0.78, 0.22, 0.78, c, { metalness: 0.5, roughness: 0.35 }); t.position.y = 0.08; g.add(t);
      for (const s of [-1, 1]) { const h = cyl(0.02, 0.07, 0.42, 5, '#F4E8C8'); h.position.set(s * 0.26, 0.38, -0.05); h.rotation.z = -s * 0.35; h.rotation.x = -0.3; g.add(h); }
      const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.08, 0), M('#5AF2C8', { emissive: col('#1A8A70') })); gem.position.set(0, 0.12, 0.42); g.add(gem);
    }
    return g;
  }
  function accMesh(id, c) {
    if (id === 'acc1' || id === 'acc6') { const o = (id === 'acc1' ? gsun : ggl).scene.clone(true); const drop = []; o.traverse(m => { if (m.isMesh) { m.geometry.computeBoundingBox(); const b = m.geometry.boundingBox; if (b.max.x - b.min.x > 1) drop.push(m); } }); drop.forEach(m => m.parent.remove(m)); return { obj: o, at: 'face' }; }
    const g = new THREE.Group();
    if (id === 'acc2') { for (let i = 0; i < 7; i++) { const a = -0.9 + i * 0.3, s = box(0.08, 0.06, 0.04, i === 3 ? '#F2A2B2' : c); s.position.set(Math.sin(a) * 0.28, -Math.cos(a) * 0.1, 0.22); g.add(s); } return { obj: g, at: 'chest' }; }
    if (id === 'acc3') { const b = box(0.16, 0.16, 0.04, c); b.rotation.z = 0.78; g.add(b); const l = box(0.06, 0.06, 0.05, '#2E7A2E'); g.add(l); g.position.set(0.16, 0.05, 0.24); return { obj: g, at: 'chest' }; }
    if (id === 'acc4') { const ch = box(0.02, 0.18, 0.02, '#C8C8D2'); ch.position.y = 0.06; g.add(ch); const p = new THREE.Mesh(new THREE.OctahedronGeometry(0.08, 0), M(c, { emissive: col(c).multiplyScalar(0.6) })); p.position.y = -0.06; g.add(p); g.position.set(0, -0.02, 0.24); return { obj: g, at: 'chest' }; }
    if (id === 'acc5') { const f = toyFishMesh({ id: 'plush', look: { shape: 'fish', c1: '#7AC2F2', c2: '#E8F6FF', c3: '#F2A24A', pat: 'none' } }); f.scale.setScalar(0.42); f.rotation.set(0, Math.PI / 2, 0.2); f.position.set(0.05, 0.05, -0.32); g.add(f); return { obj: g, at: 'chest' }; }
    if (id === 'acc7') { const sc = box(0.72, 0.14, 0.12, c); sc.position.set(0, 0.0, 0.02); g.add(sc); const tail = box(0.14, 0.3, 0.06, c); tail.position.set(0.2, -0.16, 0.2); tail.rotation.z = 0.2; g.add(tail); return { obj: g, at: 'neck' }; }
    if (id === 'acc8') { const o = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.03, 5, 10), M(c, { metalness: 0.6, roughness: 0.3, emissive: col(c).multiplyScalar(0.3) })); o.position.set(0, -0.02, 0.24); g.add(o); const pearl = new THREE.Mesh(new THREE.IcosahedronGeometry(0.06, 1), M('#FFFFFF', { roughness: 0.2, emissive: col('#606060') })); pearl.position.set(0, -0.02, 0.26); g.add(pearl); return { obj: g, at: 'chest' }; }
    return null;
  }
  function rodMesh(c, len = 2.2) {
    const g = new THREE.Group();
    const grip = cyl(0.045, 0.05, 0.36, 6, '#3A2A24'); grip.position.y = 0.0; g.add(grip);
    const reel = cyl(0.09, 0.09, 0.08, 8, '#B8C0CA', { metalness: 0.5, roughness: 0.4 }); reel.rotation.z = Math.PI / 2; reel.position.set(0.08, 0.1, 0); g.add(reel);
    const sh = cyl(0.012, 0.035, len, 6, c); sh.position.y = 0.18 + len / 2; g.add(sh);
    for (let i = 1; i < 5; i++) { const r = new THREE.Mesh(new THREE.TorusGeometry(0.025, 0.007, 4, 8), M('#D8DCE2')); r.position.set(0.035, 0.18 + len * i / 5, 0); r.rotation.y = Math.PI / 2; g.add(r); }
    const tip = new THREE.Object3D(); tip.position.y = 0.18 + len; g.add(tip); g.userData.tip = tip;
    return g;
  }
  function dress(ch, av, items) {
    const key = [av.hat, av.outfit, av.acc, av.rod].join(); if (ch.wearKey === key) return; ch.wearKey = key;
    for (const k of ['hat', 'acc', 'rod']) if (ch.wear[k]) { ch.wear[k].parent && ch.wear[k].parent.remove(ch.wear[k]); ch.wear[k] = null; }
    const it = id => items[id] || {};
    const tex = outfitTex(ch.g, av.outfit && it(av.outfit).color ? it(av.outfit).color : null);
    for (const m of ch.mats) { m.map = tex; m.needsUpdate = true; }
    // 소품은 '머리 폭 0.62' 기준으로 만들었고, 모델 머리는 폭 0.33 정도라 줄여서 붙여요
    if (av.hat && it(av.hat).color) { const h = hatMesh(av.hat, it(av.hat).color); h.scale.setScalar(0.55); h.position.set(0, HAT_Y[ch.g], 0.0); ch.head.add(h); ch.wear.hat = h; }
    const a = av.acc && accMesh(av.acc, it(av.acc).color || '#888');
    if (a) { const o = a.obj; if (a.at === 'face') { o.position.set(0, 0.105, 0.085); ch.head.add(o); } else { const w = new THREE.Group(); w.add(o); w.scale.setScalar(0.5); w.position.set(0, 0.075, 0); ch.torso.add(w); ch.wear.acc = w; } if (a.at === 'face') ch.wear.acc = o; }
    if (av.rod !== undefined) { const r = rodMesh(it(av.rod).color || '#C8A25A'); r.scale.setScalar(0.42); const hold = new THREE.Group(); hold.position.set(-0.125, -0.005, 0); hold.add(r); ch.armR.add(hold); ch.wear.rod = hold; hold.userData.tip = r.userData.tip; hold.userData.rod = r; }
  }

  // ------------------------------------------------ 낚시꾼 화면 (뒷모습, 매 프레임)
  const A = { scene: new THREE.Scene(), cam: new THREE.PerspectiveCamera(30, 1, 0.1, 100), chars: {}, size: 0 };
  lights(A.scene);
  const pivot = new THREE.Group(); A.scene.add(pivot);
  const charOf = g => A.chars[g] || (A.chars[g] = makeChar(g));
  const v3 = new THREE.Vector3();
  /** 뒷모습 낚시꾼을 그려 캔버스를 돌려줘요. pose: idle|aim|cast|wait|pull|cheer. tip: 낚싯대 끝(캔버스 비율 0~1) */
  function angler(av, items, pose, t, dt, w = 768, h = 512) {
    const ch = charOf(av.g || 'm'); dress(ch, av, items);
    if (pivot.children[0] !== ch.root) { pivot.clear(); pivot.add(ch.root); ch.root.scale.setScalar(1); }
    const P = { idle: ['holding-right'], wait: ['holding-right'], aim: ['holding-right'], cast: ['attack-melee-right', true, 1.1], pull: ['holding-both'], cheer: ['emote-yes', false, 0.9], walk: ['walk'] }[pose] || ['idle'];
    play(ch, P[0], { once: !!P[1], speed: P[2] || 1 }); ch.mixer.update(dt);
    // 몸짓: 당길 때 뒤로 기울고 흔들림, 기다릴 땐 숨쉬기
    pivot.rotation.set(0, -0.45, 0); pivot.position.set(0, 0, 0); pivot.scale.setScalar(2.5);
    if (pose === 'pull') { pivot.rotation.x = -0.18 + Math.sin(t * 18) * 0.03; pivot.rotation.z = Math.sin(t * 9) * 0.05; }
    if (pose === 'idle' || pose === 'wait') pivot.position.y = Math.sin(t * 2.2) * 0.012;
    if (pose === 'aim') { pivot.rotation.x = 0.08 + Math.sin(t * 6) * 0.02; }
    if (ch.wear.rod) { const r = ch.wear.rod; let el = 0.75;   // 팔 앞쪽(-x)으로, el만큼 위로
      if (pose === 'aim') el = 1.9 + Math.sin(t * 6) * 0.05;   // 머리 뒤로 젖힘
      if (pose === 'pull') el = 1.05 + Math.sin(t * 20) * 0.08;
      if (pose === 'cheer') el = 1.3;
      r.rotation.set(0, 0, Math.PI / 2 - el); }
    A.cam.aspect = w / h; A.cam.position.set(0.3, 2.2, -8.4); A.cam.lookAt(1.55, 1.6, 0); A.cam.updateProjectionMatrix();
    A.scene.updateMatrixWorld(true);
    R.setSize(w, h, false); R.render(A.scene, A.cam);
    let tip = null; if (ch.wear.rod) { ch.wear.rod.userData.tip.getWorldPosition(v3); v3.project(A.cam); tip = { x: (v3.x + 1) / 2, y: (1 - v3.y) / 2 }; }
    return { canvas: rCv, tip };
  }

  // ------------------------------------------------ 앞모습 (꾸미기 · 고르기)
  const F = { scene: new THREE.Scene(), cam: new THREE.PerspectiveCamera(26, 1, 0.1, 100), chars: {} };
  lights(F.scene, 1.05);
  const fpiv = new THREE.Group(); F.scene.add(fpiv);
  function portrait(av, items, out, { t = 0, pose = 'idle', turn = 0.35 } = {}) {
    const key = 'p' + (av.g || 'm'); const ch = F.chars[key] || (F.chars[key] = makeChar(av.g || 'm'));
    dress(ch, { ...av, rod: undefined }, items);
    if (fpiv.children[0] !== ch.root) { fpiv.clear(); fpiv.add(ch.root); }
    play(ch, pose === 'cheer' ? 'emote-yes' : 'idle', { fade: 0 }); ch.mixer.setTime(t);
    fpiv.rotation.set(0, turn, 0); fpiv.scale.setScalar(2.5);
    F.cam.position.set(0, 1.35, 6.2); F.cam.lookAt(0, 1.0, 0); F.cam.updateProjectionMatrix();
    const w = out.width, h = out.height; F.cam.aspect = w / h; F.cam.updateProjectionMatrix();
    R.setSize(w, h, false); R.render(F.scene, F.cam);
    const x = out.getContext('2d'); x.clearRect(0, 0, w, h); x.drawImage(rCv, 0, 0, w, h);
    return out;
  }

  // ------------------------------------------------ 물고기 (장난감 블록 느낌)
  const FS = { scene: new THREE.Scene(), cam: new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 50) };
  lights(FS.scene, 1.0);
  const fishCache = new Map();
  /** 물고기 그림(옆모습, 오른쪽을 봄) — {c, L, q}: 캔버스, 몸길이(px), 배율 */
  function fishSprite(f, L0) {
    const L = L0 <= 90 ? 96 : L0 <= 180 ? 192 : 384, key = f.id + ':' + L;
    if (fishCache.has(key)) return fishCache.get(key);
    const q = 2, Wc = Math.ceil(L * 1.6 * q), Hc = Math.ceil(L * 1.5 * q);
    const m = toyFishMesh(f); FS.scene.add(m);
    const sh = f.look.shape;
    if (sh === 'flat') m.rotation.set(0.9, -0.12, 0); else if (sh === 'crab') m.rotation.set(0.55, 0.25, 0); else m.rotation.set(0.18, -0.42, 0);
    // 몸길이 1 = 화면 L px. 캔버스 폭은 1.6L
    FS.cam.left = -0.8; FS.cam.right = 0.8; FS.cam.top = 0.75; FS.cam.bottom = -0.75; FS.cam.position.set(0, 0, 10); FS.cam.lookAt(0, 0, 0); FS.cam.updateProjectionMatrix();
    R.setSize(Wc, Hc, false); R.render(FS.scene, FS.cam);
    const c = document.createElement('canvas'); c.width = Wc; c.height = Hc; c.getContext('2d').drawImage(rCv, 0, 0);
    FS.scene.remove(m); m.traverse(o => { if (o.geometry) o.geometry.dispose(); });
    const out = { c, L, q }; fishCache.set(key, out); return out;
  }
  return { angler, portrait, fishSprite, ready: true, gl: R };
}

// ---------------------------------------------------------------- 장난감 물고기 만들기
// 몸통: 마디가 있는 상자를 모양 곡선대로 눌러서 각진 장난감처럼. 무늬는 면마다 색을 칠해요.
const mat = (o = {}) => new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.7, metalness: 0, flatShading: true, ...o });
const solid = (c, o = {}) => new THREE.MeshStandardMaterial({ color: new THREE.Color(c), roughness: 0.7, flatShading: true, ...o });
function bodyGeo(nx, prof, opt = {}) {
  // x: -0.5(꼬리) ~ 0.5(머리). prof(u) → [높이, 두께, 위치y]
  const g = new THREE.BoxGeometry(1, 1, 1, nx, opt.ny || 4, opt.nz || 2).toNonIndexed(), p = g.attributes.position;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), u = x + 0.5, [h, d, cy = 0] = prof(u); let y = p.getY(i), z = p.getZ(i);
    // 모서리를 둥글게 (위아래 끝으로 갈수록 두께를 줄임)
    const ry = Math.abs(y) * 2; z *= 1 - 0.35 * ry * ry; p.setXYZ(i, x * (opt.len || 1), y * h + cy, z * d); }
  g.computeVertexNormals(); return g;
}
function paintFaces(g, fn) {   // 삼각형마다 색
  const p = g.attributes.position, n = p.count, c = new Float32Array(n * 3), v = new THREE.Vector3();
  for (let i = 0; i < n; i += 6) {   // 네모(삼각형 두 개)마다 한 색
    const m = Math.min(6, n - i); v.set(0, 0, 0); for (let k = 0; k < m; k++) v.add(new THREE.Vector3(p.getX(i + k), p.getY(i + k), p.getZ(i + k))); v.multiplyScalar(1 / m);
    const cc = fn(v, i / 6); for (let k = 0; k < m; k++) { c[(i + k) * 3] = cc.r; c[(i + k) * 3 + 1] = cc.g; c[(i + k) * 3 + 2] = cc.b; } }
  g.setAttribute('color', new THREE.BufferAttribute(c, 3)); return g;
}
function finGeo(pts, th = 0.02) {   // 납작한 지느러미 (점들로 모양)
  const s = new THREE.Shape(); s.moveTo(pts[0][0], pts[0][1]); for (const q of pts.slice(1)) s.lineTo(q[0], q[1]);
  const g = new THREE.ExtrudeGeometry(s, { depth: th, bevelEnabled: false }); g.translate(0, 0, -th / 2); return g;
}
export function toyFishMesh(f) {
  const lk = f.look, R = rng(f.id), G = new THREE.Group(), c1 = new THREE.Color(lk.c1), c2 = new THREE.Color(lk.c2), c3 = new THREE.Color(lk.c3 || lk.c1);
  const glow = /glow/.test(lk.pat || ''), clear = lk.pat === 'clear' || lk.shape === 'jelly';
  const bodyMat = mat(clear ? { transparent: true, opacity: 0.72 } : glow ? { emissive: new THREE.Color(lk.c3).multiplyScalar(0.0) } : {});
  const finMat = solid(lk.c3 || lk.c1, clear ? { transparent: true, opacity: 0.6 } : {});
  const darkFin = solid(new THREE.Color(lk.c1).multiplyScalar(0.75).getStyle());
  const eyeMat = solid('#1E1A24', { roughness: 0.3 }), white = solid('#FFFFFF', { roughness: 0.3 });
  const glowMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(lk.c3), emissive: new THREE.Color(lk.c3), emissiveIntensity: 1.2, flatShading: true });
  const sh = lk.shape;
  // 모양별 몸통 곡선 [높이, 두께]
  const P = {
    fish: u => [0.42 * Math.pow(Math.sin(Math.PI * Math.pow(u, 0.8)), 0.75) + 0.06, 0.22 * Math.pow(Math.sin(Math.PI * Math.pow(u, 0.8)), 0.6) + 0.03],
    tall: u => [0.68 * Math.pow(Math.sin(Math.PI * Math.pow(u, 0.85)), 0.7) + 0.06, 0.15 * Math.sin(Math.PI * u) + 0.03],
    long: u => [0.17 * (u < 0.85 ? 1 : 1 - (u - 0.85) * 2.5) * (0.5 + 0.5 * Math.sqrt(u)) + 0.02, 0.1 * (0.5 + 0.5 * u) + 0.02],
    round: u => [0.66 * Math.pow(Math.sin(Math.PI * (0.08 + u * 0.88)), 0.55), 0.6 * Math.pow(Math.sin(Math.PI * (0.08 + u * 0.88)), 0.6)],
    shark: u => [0.3 * Math.pow(Math.sin(Math.PI * Math.pow(u, 0.75)), 0.8) + 0.04, 0.24 * Math.pow(Math.sin(Math.PI * Math.pow(u, 0.75)), 0.7) + 0.03],
    angler: u => [0.6 * Math.pow(Math.sin(Math.PI * Math.pow(u, 0.6)), 0.6) + 0.05, 0.5 * Math.pow(Math.sin(Math.PI * Math.pow(u, 0.6)), 0.6) + 0.04],
    cat: u => [0.26 * Math.pow(Math.sin(Math.PI * Math.pow(u, 0.6)), 0.7) + 0.05, 0.3 * Math.pow(Math.sin(Math.PI * Math.pow(u, 0.6)), 0.6) + 0.04],
    sword: u => [0.32 * Math.pow(Math.sin(Math.PI * Math.pow(u, 0.8)), 0.8) + 0.04, 0.16 * Math.sin(Math.PI * u) + 0.03],
  };
  const pattern = (v, i) => {   // 면 가운데 v → 색
    const u = v.x + 0.5, yy = v.y, top = yy > 0.02;
    let c = top ? c1.clone() : c1.clone().lerp(c2, Math.min(1, -yy * 6 + 0.3));
    const pat = lk.pat, rr = rng(f.id + ':' + i)();
    if (pat === 'bars' && Math.floor(u * 9) % 2 === 1 && u > 0.12 && u < 0.85) c = c3.clone();
    if (pat === 'bands' && [0.32, 0.6, 0.82].some(b => Math.abs(u - b) < 0.05)) c = c3.clone();
    if (pat === 'line' && Math.abs(yy) < 0.035) c = c3.clone();
    if ((pat === 'spots' || pat === 'dots') && top && rr < 0.18) c = c3.clone();
    if (pat === 'blotch' && rr < 0.3) c = c1.clone().multiplyScalar(0.72);
    if (pat === 'scale' && top && i % 2) c = c1.clone().lerp(c3, 0.35);
    if (pat === 'rainbow' && Math.abs(yy) < 0.07) c = c3.clone();
    if (pat === 'stars' && top && rr < 0.1) c = new THREE.Color('#FFFFFF');
    if (pat === 'rings' && top && Math.floor(u * 6) % 2) c = c1.clone().lerp(c3, 0.5);
    if (pat === 'frost' && top && rr < 0.25) c = new THREE.Color('#EAF6FF');
    if (pat === 'eyespot' && Math.abs(u - 0.25) < 0.06 && Math.abs(yy - 0.06) < 0.08) c = c3.clone();
    if (pat === 'glowdots' && !top && rr < 0.35) c = c3.clone().multiplyScalar(1.6);
    if (pat === 'glowline' && Math.abs(yy) < 0.03) c = c3.clone().multiplyScalar(1.6);
    if (pat === 'glow' && rr < 0.15) c = c3.clone().multiplyScalar(1.4);
    if (pat === 'lava' && rr < 0.22) c = c3.clone().multiplyScalar(1.5);
    if (pat === 'gold' && top && rr < 0.25) c = new THREE.Color('#FFE27A');
    if (pat === 'zigzag' && Math.abs(yy - 0.06 * Math.sin(u * 30)) < 0.03) c = c3.clone();
    return c;
  };
  const addEyes = (x, y, z, r, o = {}) => { for (const s of [-1, 1]) { const e = new THREE.Mesh(new THREE.BoxGeometry(r * 0.9, r * 1.2, 0.02), o.glowEye ? glowMat : eyeMat); e.position.set(x, y, s * z); G.add(e); const hl = new THREE.Mesh(new THREE.BoxGeometry(r * 0.35, r * 0.35, 0.025), white); hl.position.set(x + r * 0.15, y + r * 0.25, s * (z + 0.002)); G.add(hl); } };
  const tail = (x0, h, kind = 'fork', m = finMat) => {
    const pts = kind === 'round' ? [[0, 0.03], [-0.16, h * 0.5], [-0.22, h * 0.2], [-0.22, -h * 0.2], [-0.16, -h * 0.5], [0, -0.03]]
      : kind === 'shark' ? [[0, 0.04], [-0.12, h * 0.75], [-0.18, h * 0.8], [-0.08, 0], [-0.12, -h * 0.35], [0, -0.04]]
      : [[0, 0.03], [-0.18, h * 0.6], [-0.12, 0.02], [-0.12, -0.02], [-0.18, -h * 0.6], [0, -0.03]];
    const t = new THREE.Mesh(finGeo(pts, 0.03), m); t.position.x = x0; G.add(t); return t;
  };
  const dorsal = (x, w, h, m = finMat) => { const d = new THREE.Mesh(finGeo([[w * 0.5, 0], [w * 0.1, h], [-w * 0.5, h * 0.4], [-w * 0.5, 0]], 0.025), m); d.position.set(x, 0, 0); return d; };
  let L = 1, eyeX = 0.36, eyeY = 0.05, eyeZ = 0.1, er = 0.06, headTop = 0.2;
  if (P[sh]) {
    const prof = P[sh]; const geo = paintFaces(bodyGeo(sh === 'long' ? 16 : 8, u => prof(u), { ny: 5, nz: 3 }), pattern);
    const body = new THREE.Mesh(geo, bodyMat); G.add(body);
    const hAt = u => prof(u)[0], dAt = u => prof(u)[1];
    eyeX = sh === 'angler' ? 0.28 : sh === 'cat' ? 0.38 : sh === 'round' ? 0.3 : 0.34; eyeY = sh === 'cat' ? hAt(0.88) * 0.25 : hAt(0.84) * 0.18; eyeZ = dAt(eyeX + 0.5) * 0.5 + 0.012; er = Math.max(0.06, Math.min(0.1, hAt(0.84) * 0.32));
    headTop = hAt(0.8) / 2;
    if (sh !== 'long') tail(-0.48, sh === 'tall' ? 0.5 : sh === 'round' ? 0.34 : 0.42, sh === 'shark' ? 'shark' : sh === 'round' || sh === 'angler' ? 'round' : 'fork');
    else { const t = tail(-0.49, 0.12, 'round'); t.scale.set(0.6, 1, 1); }
    // 등지느러미
    if (sh === 'shark') { const d = new THREE.Mesh(finGeo([[0.1, 0], [-0.05, 0.26], [-0.12, 0.24], [-0.1, 0]], 0.03), darkFin); d.position.set(0.02, hAt(0.52) / 2 - 0.02, 0); G.add(d); }
    else if (sh === 'long') { const d = dorsal(-0.05, 0.8, 0.05); d.position.y = hAt(0.45) / 2 - 0.01; G.add(d); }
    else if (lk.spiky || lk.frill) { for (let k = 0; k < 6; k++) { const x = 0.15 - k * 0.08, s = new THREE.Mesh(new THREE.ConeGeometry(0.018, lk.frill ? 0.32 : 0.16, 4), finMat); s.position.set(x, hAt(x + 0.5) / 2 + (lk.frill ? 0.12 : 0.06), 0); s.rotation.z = 0.35; G.add(s); } }
    else if (sh !== 'round') { const d = dorsal(-0.02, 0.42, sh === 'tall' ? 0.2 : 0.14); d.position.y = hAt(0.48) / 2 - 0.02; G.add(d); }
    // 배지느러미 · 가슴지느러미
    if (!['round', 'long'].includes(sh)) { const v = dorsal(-0.12, 0.2, sh === 'tall' ? 0.14 : 0.08); v.rotation.x = Math.PI; v.position.y = -hAt(0.38) / 2 + 0.02; G.add(v); }
    for (const s of [-1, 1]) { const p = new THREE.Mesh(finGeo([[0, 0], [-0.14, 0.05], [-0.12, -0.05]], 0.02), finMat); p.position.set(eyeX - 0.12, -hAt(0.75) * 0.15, s * (dAt(0.72) / 2 + 0.01)); p.rotation.y = s * 0.4; G.add(p); }
    if (sh === 'round' && lk.spiky) for (let k = 0; k < 26; k++) { const a = R() * TAU, b = (R() - 0.5) * 2.4, x = (R() - 0.5) * 0.6; const s = new THREE.Mesh(new THREE.ConeGeometry(0.02, 0.09, 4), solid(lk.c3)); const ny = Math.cos(b), nz = Math.sin(b); s.position.set(x, ny * hAt(x + 0.5) / 2, nz * dAt(x + 0.5) / 2); s.lookAt(s.position.clone().multiplyScalar(2)); s.rotateX(Math.PI / 2); G.add(s); }
    if (sh === 'sword') { const bill = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.5, 4), solid(lk.c1)); bill.rotation.z = -Math.PI / 2; bill.position.set(0.72, 0.02, 0); G.add(bill); L = 1.3; const d = new THREE.Mesh(finGeo([[0.25, 0], [0.15, 0.3], [-0.2, 0.06], [-0.2, 0]], 0.025), finMat); d.position.y = hAt(0.6) / 2 - 0.02; G.add(d); }
    if (lk.whisker || sh === 'cat') for (const s of [-1, 1]) for (const k of [0, 1]) { const w = new THREE.Mesh(new THREE.BoxGeometry(sh === 'cat' ? 0.34 : 0.18, 0.012, 0.012), solid(lk.c3)); w.position.set(0.5 + (sh === 'cat' ? 0.1 : 0.03), -0.02 - k * 0.04, s * (0.04 + k * 0.02)); w.rotation.z = -0.4 - k * 0.3; w.rotation.y = s * 0.4; G.add(w); }
    if (lk.chin) { const b = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.08, 0.012), solid(lk.c3)); b.position.set(0.42, -0.12, 0); G.add(b); }
    if (lk.teeth) { const n = sh === 'angler' ? 6 : 4; for (let k = 0; k < n; k++) { const tt = new THREE.Mesh(new THREE.ConeGeometry(0.014, 0.05, 3), white); tt.position.set(0.47 - k * 0.025, -0.02 + (k % 2 ? 0.0 : -0.02), (k % 2 ? 1 : -1) * 0.03); tt.rotation.z = k % 2 ? Math.PI : 0; G.add(tt); } }
    if (sh === 'angler') { const st = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.3, 0.015), solid(lk.c1)); st.position.set(0.32, hAt(0.8) / 2 + 0.12, 0); st.rotation.z = -0.5; G.add(st); const lamp = new THREE.Mesh(new THREE.IcosahedronGeometry(0.055, 0), glowMat); lamp.position.set(0.45, hAt(0.8) / 2 + 0.24, 0); G.add(lamp); }
    if (lk.beak) { const b = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.08), solid('#F4F0E0')); b.position.set(0.5, -0.01, 0); G.add(b); }
    if (lk.blade) { const d = dorsal(0, 0.9, 0.06); d.position.y = hAt(0.5) / 2; G.add(d); }
    if (lk.hatchet) { const k = new THREE.Mesh(finGeo([[0.2, 0], [0.1, -0.22], [-0.2, -0.05], [-0.2, 0]], 0.02), mat()); G.add(k); }
    if (lk.stub) { eyeY = headTop * 0.8; }
  } else if (sh === 'flat') {   // 가오리 (위에서 본 마름모)
    const geo = new THREE.BoxGeometry(1, 1, 1, 8, 2, 8).toNonIndexed(), p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i), y = p.getY(i); const wz = (1 - Math.abs(x + 0.08) * 1.6); p.setXYZ(i, x * 0.8, y * 0.07 * (1 - Math.abs(z) * 1.4) + (lk.flounder ? 0 : Math.abs(z) * 0.04), z * Math.max(0.05, wz) * (lk.flounder ? 0.7 : 1.15)); }
    geo.computeVertexNormals(); paintFaces(geo, (v, i) => { const t = v.y > 0; const r = rng(f.id + i)(); let c = t ? c1.clone() : c2.clone(); if (t && ['stars', 'glowdots', 'spots', 'blotch'].includes(lk.pat) && r < 0.2) c = lk.pat === 'blotch' ? c1.clone().multiplyScalar(0.7) : c3.clone(); if (t && lk.pat === 'rings' && Math.floor(Math.hypot(v.x, v.z) * 12) % 2) c = c1.clone().lerp(c3, 0.4); return c; });
    G.add(new THREE.Mesh(geo, bodyMat));
    const tl = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.02, 0.02), solid(lk.c1)); tl.position.set(-0.6, 0, 0); G.add(tl);
    addEyes(0.18, 0.05, 0.08, 0.05); eyeX = null; L = 1.1;
  } else if (sh === 'squid') {
    const m = new THREE.Mesh(paintFaces(new THREE.ConeGeometry(0.16, 0.6, 7, 3).toNonIndexed(), (v, i) => (rng(f.id + i)() < 0.2 && lk.pat !== 'clear' ? c3 : v.y > 0 ? c1 : c1.clone().lerp(c2, 0.4))), bodyMat);
    m.rotation.z = Math.PI / 2; m.position.x = -0.18; G.add(m);
    for (const s of [-1, 1]) { const fin = new THREE.Mesh(finGeo([[0, 0], [0.12, 0.1 * s], [0.18, 0]], 0.02), finMat); fin.rotation.x = Math.PI / 2; fin.position.x = -0.46; G.add(fin); }
    for (let k = 0; k < 8; k++) { const a = k / 8 * TAU, tt = new THREE.Mesh(new THREE.BoxGeometry(k < 2 ? 0.46 : 0.3, 0.03, 0.03), solid(lk.c1, clear ? { transparent: true, opacity: 0.7 } : {})); tt.position.set(0.25 + (k < 2 ? 0.08 : 0), Math.cos(a) * 0.05, Math.sin(a) * 0.05); tt.rotation.z = Math.cos(a) * 0.25; tt.rotation.y = Math.sin(a) * 0.25; G.add(tt); }
    eyeX = 0.1; eyeY = 0.04; eyeZ = 0.12; er = 0.06;
  } else if (sh === 'jelly') {
    const dome = new THREE.Mesh(paintFaces(new THREE.SphereGeometry(0.3, 8, 5, 0, TAU, 0, Math.PI / 2).toNonIndexed(), (v, i) => (glow && rng(f.id + i)() < 0.2 ? c3.clone().multiplyScalar(1.4) : v.y > 0.2 ? c1 : c2)), bodyMat);
    dome.position.y = 0.05; G.add(dome);
    for (let k = 0; k < 9; k++) { const a = k / 9 * TAU, len = 0.25 + R() * 0.35, tt = new THREE.Mesh(new THREE.BoxGeometry(0.025, len, 0.025), solid(lk.c3, { transparent: true, opacity: 0.75 })); tt.position.set(Math.cos(a) * 0.2, 0.05 - len / 2, Math.sin(a) * 0.2); tt.rotation.z = (R() - 0.5) * 0.3; G.add(tt); }
    eyeX = 0.24; eyeY = 0.15; eyeZ = 0.09; er = 0.05; G.rotation.z = 0; L = 0.8;
  } else if (sh === 'horse') {
    const pts = [[0.05, 0.32], [0.1, 0.2], [0.08, 0.05], [0.02, -0.1], [-0.04, -0.22], [0.02, -0.3], [0.1, -0.3], [0.08, -0.24]];
    pts.forEach(([x, y], k) => { const r = k < 2 ? 0.1 : k < 4 ? 0.12 - k * 0.012 : 0.06 - (k - 4) * 0.01; const b = new THREE.Mesh(paintFaces(new THREE.BoxGeometry(r * 1.6, 0.14, r * 1.2).toNonIndexed(), (v, i) => (lk.pat !== 'none' && rng(f.id + k + ':' + i)() < 0.18 ? c3 : v.x > 0.02 ? c2 : c1)), bodyMat); b.position.set(x, y, 0); b.rotation.z = -0.3 + k * 0.15; G.add(b); });
    const sn = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.05, 0.05), solid(lk.c1)); sn.position.set(0.2, 0.32, 0); sn.rotation.z = -0.2; G.add(sn);
    const df = new THREE.Mesh(finGeo([[0, 0], [-0.08, 0.06], [-0.08, -0.08]], 0.02), finMat); df.position.set(-0.05, 0.0, 0); G.add(df);
    eyeX = 0.08; eyeY = 0.34; eyeZ = 0.07; er = 0.045; L = 0.75;
  } else if (sh === 'crab') {   // 게: 앞에서 조금 위로 본 모습
    const geo = new THREE.BoxGeometry(0.62, 0.2, 0.44, 4, 2, 3).toNonIndexed(), p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i), r = Math.hypot(x / 0.31, z / 0.22); p.setXYZ(i, x * (1 - 0.15 * Math.abs(z / 0.22)), y * (y > 0 ? 1.2 - 0.5 * r * r : 0.8), z); }
    geo.computeVertexNormals(); paintFaces(geo, (v) => (v.y > 0 ? c1.clone() : c2.clone()));
    G.add(new THREE.Mesh(geo, bodyMat));
    const legL = lk.leggy ? 0.5 : 0.24, legM = solid(lk.c1);
    for (const s of [-1, 1]) for (let k = 0; k < 3; k++) { const lg = new THREE.Mesh(new THREE.BoxGeometry(legL, 0.035, 0.035), legM); lg.position.set(s * (0.3 + legL * 0.4), -0.08, -0.14 + k * 0.1); lg.rotation.z = s * -0.55; lg.rotation.y = s * (k - 1) * -0.35; G.add(lg); }
    for (const s of [-1, 1]) { const arm = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.05, 0.05), legM); arm.position.set(s * 0.3, 0.0, 0.2); arm.rotation.y = s * -0.7; G.add(arm);
      const cl = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.12, 0.13), solid(lk.c3)); cl.position.set(s * 0.38, 0.03, 0.3); cl.rotation.y = s * -0.4; G.add(cl);
      const cl2 = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.045, 0.06), solid(lk.c3)); cl2.position.set(s * 0.36, 0.1, 0.38); cl2.rotation.y = s * -0.4; G.add(cl2); }
    for (const s of [-1, 1]) { const st = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.12, 0.025), legM); st.position.set(s * 0.08, 0.16, 0.16); G.add(st); const e = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.065, 0.065), eyeMat); e.position.set(s * 0.08, 0.24, 0.16); G.add(e); const hl = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.025, 0.02), white); hl.position.set(s * 0.08 + 0.012, 0.255, 0.195); G.add(hl); }
    const mo = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.02, 0.02), solid(new THREE.Color(lk.c1).multiplyScalar(0.5).getStyle())); mo.position.set(0, 0.04, 0.225); G.add(mo);
    eyeX = null; L = 1;
  }
  if (eyeX !== null) addEyes(eyeX, eyeY, eyeZ, er, { glowEye: f.tier === 'boss' });
  if (sh === 'long') { // 뱀처럼 살짝 굽힘
    G.traverse(o => { if (o.isMesh && o.geometry.attributes.position.count > 200) { const p = o.geometry.attributes.position; for (let i = 0; i < p.count; i++) p.setZ(i, p.getZ(i) + Math.sin(p.getX(i) * 7) * 0.04); o.geometry.computeVertexNormals(); } });
  }
  return finish(G, f, L);
}
// 보스는 더 웅장하게: 금 왕관 · 빛나는 눈 · 등의 가시
function finish(G, f, L) {
  const lk = f.look;
  if (f.tier === 'boss') {
    const gold = new THREE.MeshStandardMaterial({ color: new THREE.Color('#F2C23A'), metalness: 0.6, roughness: 0.3, emissive: new THREE.Color('#6A4A00'), flatShading: true });
    const cr = new THREE.Group(); const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.11, 0.06, 6), gold); cr.add(ring);
    for (let i = 0; i < 6; i++) { const a = i / 6 * TAU, s = new THREE.Mesh(new THREE.ConeGeometry(0.025, 0.09, 4), gold); s.position.set(Math.cos(a) * 0.09, 0.07, Math.sin(a) * 0.09); cr.add(s); }
    const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.03, 0), new THREE.MeshStandardMaterial({ color: '#E8304A', emissive: '#801020', flatShading: true })); gem.position.set(0.1, 0.0, 0); cr.add(gem);
    const pos = { crab: [0, 0.22, 0.05], flat: [0.2, 0.1, 0], jelly: [0, 0.4, 0], squid: [-0.45, 0.06, 0], horse: [0.04, 0.44, 0] }[lk.shape] || [0.3, 0.22 + (lk.shape === 'round' ? 0.12 : lk.shape === 'angler' ? 0.14 : lk.shape === 'tall' ? 0.14 : 0), 0];
    cr.position.set(...pos); cr.rotation.z = -0.25; cr.scale.setScalar(1.3); G.add(cr);
  }
  // 크기를 1(몸길이)에 맞춤
  const box = new THREE.Box3().setFromObject(G), sz = box.getSize(new THREE.Vector3()), c = box.getCenter(new THREE.Vector3());
  const k = 1 / Math.max(sz.x, sz.y * 1.25, 0.3) * (L > 1 ? 1 : 1);
  const wrap = new THREE.Group(); G.position.sub(c); wrap.add(G); wrap.scale.setScalar(k);
  return wrap;
}

// SkinnedMesh 복제 (SkeletonUtils.clone 과 같은 일)
function cloneSkinned(source) {
  const sourceLookup = new Map(), cloneLookup = new Map(), clone = source.clone(true);
  (function par(a, b, fn) { fn(a, b); for (let i = 0; i < a.children.length; i++) par(a.children[i], b.children[i], fn); })(source, clone, (s, c) => { sourceLookup.set(c, s); cloneLookup.set(s, c); });
  clone.traverse(node => { if (!node.isSkinnedMesh) return; const sm = sourceLookup.get(node), bones = sm.skeleton.bones;
    node.skeleton = sm.skeleton.clone(); node.bindMatrix.copy(sm.bindMatrix); node.skeleton.bones = bones.map(b => cloneLookup.get(b)); node.bind(node.skeleton, node.bindMatrix); });
  return clone;
}
