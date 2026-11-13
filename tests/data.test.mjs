// 데이터 모양 검사: 물고기 50종 이상, id 겹침 없음, 스테이지마다 보스 하나, 장비는 상점·드랍·세트·처음 중 하나로 얻을 수 있음
import assert from 'node:assert/strict';
import { STAGES, FISH, ITEMS, ITEM_BY_ID, BAITS, DROPS, SETS, GRADES, START, FISH_BY_ID } from '../js/data.js';

assert.ok(FISH.length >= 50, `물고기 ${FISH.length}종 (50종 이상)`);
assert.equal(new Set(FISH.map(f => f.id)).size, FISH.length, '물고기 id 겹침');
assert.equal(new Set(FISH.map(f => f.name)).size, FISH.length, '물고기 이름 겹침');
for (const s of STAGES) {
  const list = FISH.filter(f => f.stage === s.id);
  assert.ok(list.length >= 10, `${s.name} 물고기 수`);
  assert.equal(list.filter(f => f.tier === 'boss').length, 1, `${s.name} 보스는 하나`);
  assert.equal(FISH_BY_ID[s.boss].tier, 'boss', `${s.name} boss id`);
  for (const t of ['c', 'u', 'r', 'e']) assert.ok(list.some(f => f.tier === t), `${s.name}에 ${t} 등급 물고기`);
}
for (const f of FISH) {
  assert.ok(f.size[0] > 0 && f.size[1] > f.size[0], `${f.name} 크기`);
  assert.ok(f.hp > 0 && f.spd > 0 && f.price > 0, `${f.name} 숫자`);
  assert.ok(f.look && f.look.shape && f.look.c1, `${f.name} 그림 정보`);
  assert.ok(f.desc && f.desc.length > 5, `${f.name} 설명`);
}
assert.deepEqual(GRADES.map(g => g.g), ['C', 'B', 'A', 'S', 'SS']);
assert.equal(new Set(ITEMS.map(i => i.id)).size, ITEMS.length, '장비 id 겹침');
const fromSet = new Set(SETS.flatMap(s => Object.keys(s.reward.items || {})));
const fromDrop = new Set(DROPS.map(d => d.item));
for (const it of ITEMS) {
  assert.ok(it.start || it.shop || it.drop || it.set, `${it.name}: 얻을 방법`);
  if (it.drop) assert.ok(fromDrop.has(it.id), `${it.name}: 드랍 전용인데 DROPS에 없음`);
  if (it.set) assert.ok(fromSet.has(it.id), `${it.name}: 세트 보상인데 SETS에 없음`);
  if (it.drop || it.set) assert.ok(!it.shop, `${it.name}: 드랍·세트 전용은 상점에 없음`);
}
for (const d of DROPS) assert.ok(ITEM_BY_ID[d.item] || BAITS.find(b => b.id === d.item), `드랍 ${d.item}`);
for (const s of SETS) { if (s.fish) { assert.ok(s.fish.length > 0, s.name); s.fish.forEach(id => assert.ok(FISH_BY_ID[id], `${s.name}: ${id}`)); } }
for (const [k, v] of Object.entries(START.eq)) assert.ok(START.items[v] || k === 'bait', `처음 장비 ${k}`);
const shopRods = ITEMS.filter(i => i.slot === 'rod' && i.shop).length, dropRods = ITEMS.filter(i => i.slot === 'rod' && i.drop).length;
assert.ok(shopRods >= 3 && dropRods >= 3, '낚싯대는 상점·드랍 둘 다');
console.log(`data ok: 물고기 ${FISH.length}종, 장비 ${ITEMS.length}개, 미끼 ${BAITS.length}종, 세트 ${SETS.length}개`);
