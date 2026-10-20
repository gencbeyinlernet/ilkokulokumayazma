import test from 'node:test';
import assert from 'node:assert/strict';
import { stages, modes, normalize, shuffle, units, makeRound, numberNames } from '../data.js';
test('Türkçe büyük harfler, noktalama ve boşluklar doğru karşılaştırılır', () => {
  assert.equal(normalize('  IŞIK  '), 'ışık');
  assert.equal(normalize('İNCİ'), 'inci');
  assert.equal(normalize('  Ali   top al. '), normalize('ali top al'));
  assert.notEqual(normalize('sık'), normalize('sik'));
  assert.equal(normalize('s\u0327'), normalize('ş'));
});
test('Her oyun ve adım 5 farklı ve çözülebilir soru üretir', () => {
  for (const mode of modes) for (const stage of stages) for (let n = 0; n < 30; n++) {
    const round = makeRound(mode.id, stage.id);
    assert.equal(round.length, 5);
    assert.equal(new Set(round.map(q => q.target)).size, 5);
    for (const q of round) {
      assert.equal(q.options.length, 4);
      assert.equal(new Set(q.options).size, 4);
      assert.equal(q.options.filter(x => x === q.target).length, 1);
      assert.deepEqual([...q.tiles].sort(), units(q.target, stage.id).sort());
      if (mode.id === 'number') assert.ok(Number(q.target) >= 0 && Number(q.target) <= 9);
    }
  }
});
test('Tekrarlanan harfler ve cümle birimleri kaybolmaz', () => {
  assert.deepEqual(units('anne', 'word'), ['a', 'n', 'n', 'e']);
  assert.deepEqual(units('Ali top al.', 'sentence'), ['Ali', 'top', 'al.']);
  const source = ['a', 'n', 'n', 'e'];
  const result = shuffle(source, () => 0);
  assert.deepEqual(source, ['a', 'n', 'n', 'e']);
  assert.deepEqual(result.sort(), [...source].sort());
});
test('Türk alfabesinin 29 harfi ve 10 rakam adı vardır', () => {
  assert.equal(new Set(stages[0].items).size, 29);
  assert.equal(numberNames.length, 10);
});
