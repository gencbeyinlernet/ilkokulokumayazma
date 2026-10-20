export const stages = [
  { id: 'letter', name: 'Harfler', icon: 'a', description: 'Sesleri keşfet', items: ['a', 'e', 'i', 'ı', 'o', 'ö', 'u', 'ü', 'l', 'n', 't', 'k', 'm', 'r', 's', 'b', 'c', 'ç', 'd', 'f', 'g', 'ğ', 'h', 'j', 'p', 'ş', 'v', 'y', 'z'] },
  { id: 'syllable', name: 'Heceler', icon: 'el', description: 'Harfleri birleştir', items: ['el', 'al', 'at', 'et', 'an', 'en', 'il', 'in', 'ol', 'un', 'la', 'le', 'ma', 'me', 'ta', 'te', 'ka', 'ke'] },
  { id: 'word', name: 'Kelimeler', icon: '♪', description: 'Anlamı keşfet', items: ['elma', 'anne', 'baba', 'kalem', 'kitap', 'okul', 'kedi', 'lale', 'masa', 'kutu', 'oyun', 'balık', 'çiçek', 'üzüm', 'güneş'] },
  { id: 'sentence', name: 'Cümleler', icon: '…', description: 'Bir hikâye başlasın', items: ['Ali top al.', 'Ela kitap oku.', 'Anne elma al.', 'Kedi süt içer.', 'Lale okula gider.', 'Ece oyun oynar.', 'Baba eve gelir.', 'Oya kalem al.', 'Kuş uçar.', 'Güneş bizi ısıtır.'] }
];
export const modes = [
  { id: 'read', name: 'Oku & Birleştir', badge: 'HARFLERDEN HİKÂYELERE', description: 'Harfleri yan yana getir, yepyeni kelimeler keşfet.', color: 'purple', icon: 'Aa', action: 'Birleştirmeye başla' },
  { id: 'listen', name: 'Dinle & Bul', badge: 'KULAKLARINI AÇ', description: 'Dikkatle dinle, duyduğun sesi ve kelimeyi bul.', color: 'green', icon: '♫', action: 'Dinlemeye başla' },
  { id: 'write', name: 'Yaz & Öğren', badge: 'SIRA SENİN KALEMİNDE', description: 'Çiz, dene, yaz. Her çizgide biraz daha öğren.', color: 'peach', icon: '✎', action: 'Yazmaya başla' },
  { id: 'number', name: 'Rakamları Keşfet', badge: 'BİR, İKİ, ÜÇ… HAYDİ!', description: 'Nesneleri say, rakamları tanı ve eşleştir.', color: 'blue', icon: '123', action: 'Saymaya başla' }
];
export const numberNames = ['sıfır', 'bir', 'iki', 'üç', 'dört', 'beş', 'altı', 'yedi', 'sekiz', 'dokuz'];
export function shuffle(items, random = Math.random) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [result[i], result[j]] = [result[j], result[i]]; }
  return result;
}
export function normalize(value) { return value.normalize('NFC').trim().toLocaleLowerCase('tr-TR').replace(/[.!?]/g, '').replace(/\s+/g, ' '); }
export function units(target, stage) { return stage === 'sentence' ? target.split(' ') : Array.from(target); }
export function makeRound(mode, stageId) {
  const stage = stages.find(s => s.id === stageId) || stages[0];
  const pool = mode === 'number' ? Array.from({ length: 10 }, (_, i) => String(i)) : stage.items;
  return shuffle(pool).slice(0, 5).map(target => ({ target, options: shuffle([target, ...shuffle(pool.filter(x => x !== target)).slice(0, 3)]), tiles: shuffle(units(target, stage.id)) }));
}
