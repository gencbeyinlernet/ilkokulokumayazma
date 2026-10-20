import { stages, modes, shuffle, normalize, makeRound } from './data.js';
const $ = (s) => document.querySelector(s);
const app = $('#app');
const KEY = 'minik-kelimeler-v1';
function initial() { return { stars: 0, rounds: 0, solved: 0, byMode: {}, sound: true }; }
let storageAvailable = true;
function readProgress() {
  try {
    const p = JSON.parse(localStorage.getItem(KEY));
    if (!p || typeof p !== 'object') return initial();
    return { stars: Number.isFinite(p.stars) && p.stars >= 0 ? p.stars : 0, rounds: Number.isFinite(p.rounds) && p.rounds >= 0 ? p.rounds : 0, solved: Number.isFinite(p.solved) && p.solved >= 0 ? p.solved : 0, byMode: Object.fromEntries(modes.map(m => [m.id, Number.isFinite(p.byMode?.[m.id]) && p.byMode[m.id] >= 0 ? p.byMode[m.id] : 0])), sound: p.sound !== false };
  } catch { return initial(); }
}
let progress = readProgress();
let selectedStage = 'letter';
let game = null;
let screen = 'home';
function save() { try { localStorage.setItem(KEY, JSON.stringify(progress)); } catch { storageAvailable = false; announce('İlerleme bu tarayıcıda kaydedilemiyor.'); } }
function announce(message) { $('#announcer').textContent = message; }
function stopSpeech() { if ('speechSynthesis' in window) speechSynthesis.cancel(); }
function speak(text) {
  stopSpeech();
  if (!('speechSynthesis' in window)) { announce('Bu tarayıcıda seslendirme desteklenmiyor.'); return false; }
  const utterance = new SpeechSynthesisUtterance(text);
  const voice = speechSynthesis.getVoices().find(v => v.lang.toLowerCase().startsWith('tr'));
  if (voice) utterance.voice = voice;
  utterance.lang = 'tr-TR'; utterance.rate = 0.75;
  utterance.onerror = () => { announce('Ses oynatılamadı. Cihazın Türkçe ses ayarlarını kontrol edin.'); const status = $('#audio-status'); if (status) status.textContent = 'Ses oynatılamadı. Cihazda Türkçe ses bulunduğunu kontrol edin.'; };
  speechSynthesis.speak(utterance); return true;
}
function rewardSound() {
  if (!progress.sound) return;
  try { const AC = window.AudioContext || window.webkitAudioContext; const context = new AC(); const gain = context.createGain(); gain.connect(context.destination); gain.gain.setValueAtTime(0.07, context.currentTime); [523.25, 659.25, 783.99].forEach((f, i) => { const o = context.createOscillator(); o.connect(gain); o.frequency.value = f; o.start(context.currentTime + i * 0.1); o.stop(context.currentTime + i * 0.1 + 0.18); }); setTimeout(() => context.close(), 700); } catch { /* Visual feedback remains available. */ }
}
function soundLabel() { $('#sound-toggle').innerHTML = `♫ <span>Ses ${progress.sound ? 'açık' : 'kapalı'}</span>`; $('#sound-toggle').setAttribute('aria-pressed', String(progress.sound)); $('#sound-toggle').setAttribute('aria-label', `Sesli geri bildirimi ${progress.sound ? 'kapat' : 'aç'}`); }
function header(active) { screen = active; $('#home-nav').classList.toggle('nav-active', active === 'home'); $('#progress-nav').classList.toggle('nav-active', active === 'progress'); }
function focusHeading() { const h = app.querySelector('h1'); if (h) { h.tabIndex = -1; h.focus({ preventScroll: true }); } }
function home() {
  stopSpeech(); game = null; header('home');
  app.innerHTML = `<section class="hero"><div class="hero-copy"><span class="eyebrow"><span class="tiny-star">✦</span> ÖĞRENMEK GÜZEL BİR MACERA</span><h1>Küçük harfler,<br><span>kocaman dünyalar.</span></h1><p>Dinle, birleştir, yaz ve keşfet.<br>Her oyunda öğrenmeye bir adım daha yaklaş!</p><a class="primary-button" href="#games">Haydi, oynayalım <span>↗</span></a><div class="hero-note"><span class="dot"></span> Kendi hızında öğren · Her deneme çok değerli</div></div><div class="hero-art" aria-hidden="true"><span class="art-spark spark-one">✦</span><span class="art-spark spark-two">✧</span><span class="orbit orbit-one"></span><span class="orbit orbit-two"></span><div class="letter-block block-a">a<span class="eyes">••</span><span class="smile"></span></div><div class="letter-block block-b">b</div><div class="letter-block block-c">c</div><div class="art-label">Birlikte daha güzel! <span>✿</span></div><span class="art-pencil">✎</span><span class="art-dot"></span></div></section>
  <section class="journey-strip" aria-label="İlerleme özeti"><div class="journey-icon">✦</div><div><strong>Her küçük adım bir başarı!</strong><p>${progress.solved ? `${progress.solved} alıştırmayı tamamladın. Keşfetmeye devam!` : 'İlk yıldızını kazanmaya hazır mısın?'}</p></div><div class="mini-stat"><b>${progress.stars}</b><span>yıldız</span></div><div class="mini-stat"><b>${progress.rounds}</b><span>tamamlanan tur</span></div><button id="see-progress" class="text-button">Yolculuğum <span>→</span></button></section>
  <section id="games" class="games-section"><div class="section-heading"><div><span class="eyebrow">OYUN ALANIN</span><h2>Bugün ne keşfedelim?</h2></div><span class="soft-label">4 farklı öğrenme yolu <span>✦</span></span></div><div class="game-grid">${modes.map((m, i) => `<button class="game-card ${m.color}" data-mode="${m.id}"><div class="card-top"><span class="card-icon">${m.icon}</span><span class="card-number">0${i + 1}</span></div><span class="card-badge">${m.badge}</span><h3>${m.name}</h3><p>${m.description}</p><span class="card-action">${m.action}<span class="arrow-circle">↗</span></span></button>`).join('')}</div></section>
  <section class="learning-path"><div><span class="eyebrow">ADIM ADIM BÜYÜYORUZ</span><h2>Bir harften bir hikâyeye.</h2><p>İstediğin adımdan başla, kendi hızında ilerle.</p></div><div class="path-steps">${stages.map((s, i) => `<button class="path-step ${selectedStage === s.id ? 'selected' : ''}" data-stage="${s.id}" aria-pressed="${selectedStage === s.id}"><span>${s.icon}</span><strong>${s.name}</strong><small>${s.description}</small></button>${i < 3 ? '<span class="path-line" aria-hidden="true">···</span>' : ''}`).join('')}</div></section><div class="kind-note"><span>♡</span> Burada acele etmek yok. Denemek, öğrenmenin en güzel yolu.</div>`;
  app.querySelectorAll('[data-mode]').forEach(b => b.onclick = () => start(b.dataset.mode));
  app.querySelectorAll('[data-stage]').forEach(b => b.onclick = () => { selectedStage = b.dataset.stage; app.querySelectorAll('[data-stage]').forEach(x => { x.classList.toggle('selected', x === b); x.setAttribute('aria-pressed', String(x === b)); }); announce(`${stages.find(s => s.id === selectedStage).name} seçildi. Yukarıdan bir oyun seçebilirsin.`); });
  $('#see-progress').onclick = showProgress;
}
function start(mode, stage = selectedStage) {
  stopSpeech(); selectedStage = stage;
  game = { mode, stage, questions: makeRound(mode, stage), index: 0, correct: false, chosen: [], firstTry: 0, errors: 0, hints: 0 };
  header('game'); renderQuestion(); focusHeading();
}
function renderQuestion() {
  stopSpeech();
  const g = game, q = g.questions[g.index], mode = modes.find(m => m.id === g.mode);
  g.correct = false; g.chosen = []; g.errors = 0; g.hints = 0;
  const title = g.mode === 'read' ? (g.stage === 'sentence' ? 'Kelimeleri sıraya koy.' : g.stage === 'letter' ? 'Aynı harfi bul.' : 'Harfleri birleştir.') : g.mode === 'listen' ? 'Dinle, doğru olanı bul.' : g.mode === 'write' ? 'Önce çiz, sonra yaz.' : 'Say, rakamı bul.';
  app.innerHTML = `<section class="play-shell"><div class="play-top"><button id="back-home" class="text-button">← Oyun alanı</button><span class="play-tag ${mode.color}">${mode.name}</span><strong>${g.index + 1} / 5</strong></div><div class="progress-track"><div style="width:${g.index / 5 * 100}%"></div></div><div class="play-heading"><span class="eyebrow">${g.mode === 'number' ? 'RAKAMLAR · 0–9' : stages.find(s => s.id === g.stage).name.toLocaleUpperCase('tr-TR')}</span><h1>${title}</h1><p>${g.mode === 'read' ? 'Kartlara doğru sırayla dokun. Yanlış seçimi geri alabilirsin.' : g.mode === 'listen' ? 'Hoparlöre dokun ve duyduğun seçeneği işaretle.' : g.mode === 'write' ? 'Parmağınla veya farenle dene. Sonra klavye ile yanıtla.' : 'Yıldızları say ve doğru rakama dokun.'}</p></div><div id="exercise"></div><div id="feedback" class="feedback" role="status"></div><div class="play-bottom"><button id="hint" class="text-button">☼ Bir ipucu</button><button id="next" class="primary-button" disabled>Sonraki soru →</button></div><div class="level-switch"><label for="level-select">Öğrenme adımı</label><select id="level-select" ${g.mode === 'number' ? 'disabled' : ''}>${stages.map(s => `<option value="${s.id}" ${g.stage === s.id ? 'selected' : ''}>${s.name}</option>`).join('')}</select><small>Adımı değiştirmek yeni bir tur başlatır.</small></div></section>`;
  $('#back-home').onclick = () => { home(); focusHeading(); };
  $('#level-select').onchange = e => start(g.mode, e.target.value);
  $('#next').onclick = () => { if (!g.correct) return; if (g.index === 4) { progress.rounds++; save(); finish(); } else { g.index++; renderQuestion(); focusHeading(); } };
  $('#hint').onclick = () => { if (g.correct) return; g.hints++; if (g.mode === 'listen') { speak(q.target); feedback('Bir kez daha dinle. İstersen sesi tekrar oynat.'); } else feedback(g.mode === 'number' ? `Birlikte sayalım: ${Number(q.target) === 0 ? 'Hiç yıldız yok. Bu sıfır!' : Array.from({ length: Number(q.target) }, (_, i) => i + 1).join(', ')}` : `Başlangıcı: ${g.stage === 'sentence' ? q.target.split(' ')[0] : q.target[0]}`); };
  if (g.mode === 'read') renderRead(q);
  if (g.mode === 'listen') renderListen(q);
  if (g.mode === 'write') renderWrite(q);
  if (g.mode === 'number') { $('#exercise').innerHTML = `<div class="count-area" aria-label="Sayılacak yıldızlar">${Number(q.target) ? '<span aria-hidden="true">★</span>'.repeat(Number(q.target)) : '<span class="empty-basket">Bu sepet boş! 🧺</span>'}</div><div class="choices">${q.options.map(n => `<button class="choice number-choice" data-answer="${n}">${n}</button>`).join('')}</div>`; bindChoices(); }
}
function feedback(text, state = '') { const box = $('#feedback'); box.textContent = text; box.className = `feedback ${state}`; }
function check(answer) {
  if (game.correct) return;
  if (normalize(answer) !== normalize(game.questions[game.index].target)) { game.errors++; feedback('Güzel bir deneme! Bir daha bakalım. 🌱', 'retry'); return false; }
  game.correct = true; if (game.errors === 0 && game.hints === 0) game.firstTry++;
  progress.solved++; progress.stars++; progress.byMode[game.mode] = (progress.byMode[game.mode] || 0) + 1; save(); rewardSound();
  feedback(`Harika, başardın! +1 yıldız ✦${storageAvailable ? '' : ' İlerleme bu cihazda kaydedilemiyor.'}`, 'success');
  $('#next').disabled = false; $('#next').textContent = game.index === 4 ? 'Sonuçları gör ✦' : 'Sonraki soru →';
  app.querySelectorAll('[data-answer], [data-tile], #check-write, #undo').forEach(b => b.disabled = true);
  return true;
}
function bindChoices() { app.querySelectorAll('[data-answer]').forEach(b => b.onclick = () => { if (check(b.dataset.answer)) b.classList.add('correct-choice'); else { b.classList.add('wrong-choice'); b.setAttribute('aria-label', `${b.textContent}: tekrar dene`); } }); }
function renderRead(q) {
  if (game.stage === 'letter') { const stage = stages[0]; const opts = shuffle([q.target, ...shuffle(stage.items.filter(x => x !== q.target)).slice(0, 3)]); $('#exercise').innerHTML = `<div class="target-letter">${q.target}</div><div class="choices">${opts.map(x => `<button class="choice" data-answer="${x}">${x}</button>`).join('')}</div>`; bindChoices(); return; }
  $('#exercise').innerHTML = `<div class="target-word">${q.target}</div><div class="answer-slots" id="answer-slots" aria-label="Birleştirdiğin yanıt">Kartlara dokun…</div><div class="tile-bank">${q.tiles.map((x, i) => `<button class="letter-tile" data-tile="${i}">${x}</button>`).join('')}</div><button id="undo" class="text-button undo">↶ Son kartı geri al</button>`;
  const refresh = () => { $('#answer-slots').textContent = game.chosen.length ? game.chosen.map(i => q.tiles[i]).join(game.stage === 'sentence' ? ' ' : '') : 'Kartlara dokun…'; };
  app.querySelectorAll('[data-tile]').forEach(b => b.onclick = () => { if (game.correct) return; const index = Number(b.dataset.tile); game.chosen.push(index); b.disabled = true; refresh(); if (game.chosen.length === q.tiles.length) check(game.chosen.map(i => q.tiles[i]).join(game.stage === 'sentence' ? ' ' : '')); });
  $('#undo').onclick = () => { if (!game.correct && game.chosen.length) { const index = game.chosen.pop(); app.querySelector(`[data-tile="${index}"]`).disabled = false; refresh(); feedback('Yeniden deneyebilirsin.'); } };
}
function renderListen(q) {
  const supported = 'speechSynthesis' in window;
  $('#exercise').innerHTML = `<button id="listen" class="listen-orb" aria-label="Soruyu sesli dinle" ${supported ? '' : 'disabled'}>♫</button><p id="audio-status" class="audio-status">${supported ? 'Dinlemek için dokun · İstediğin kadar tekrar et' : 'Bu tarayıcı seslendirmeyi desteklemiyor. Başka bir tarayıcı kullan.'}</p><div class="choices">${q.options.map((x, i) => `<button class="choice" data-answer="${i}" ${supported ? '' : 'disabled'}>${x}</button>`).join('')}</div>`;
  $('#listen').onclick = () => speak(q.target);
  app.querySelectorAll('[data-answer]').forEach(b => b.onclick = () => { if (check(q.options[Number(b.dataset.answer)])) b.classList.add('correct-choice'); else b.classList.add('wrong-choice'); });
}
function renderWrite(q) {
  $('#exercise').innerHTML = `<div class="writing-board"><canvas id="writing-canvas" aria-label="Serbest yazma alanı. Alternatif olarak aşağıdaki klavye alanını kullanabilirsin."></canvas><span class="trace-model" aria-hidden="true">${q.target}</span><button class="clear-canvas" id="clear-canvas" aria-label="Çizimi temizle">Sil ↶</button></div><p class="writing-note">Örnek: <strong>${q.target}</strong> · Çizimini bir büyüğünle değerlendirebilirsin.</p><form id="write-form"><label for="write-answer">Şimdi gördüğünü klavyeyle yaz:</label><div class="input-row"><input id="write-answer" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Buraya yaz…" maxlength="100"><button class="primary-button" id="check-write">Kontrol et ✓</button></div></form>`;
  $('#write-form').onsubmit = e => { e.preventDefault(); const value = $('#write-answer').value; if (!value.trim()) { feedback('Önce yanıtını yaz.'); $('#write-answer').focus(); } else check(value); };
  const canvas = $('#writing-canvas'), ctx = canvas.getContext('2d');
  const rect = canvas.getBoundingClientRect(), ratio = window.devicePixelRatio || 1;
  canvas.width = rect.width * ratio; canvas.height = rect.height * ratio; ctx.scale(ratio, ratio); ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = 6; ctx.strokeStyle = '#6750a4';
  let drawing = false;
  const point = e => { const r = canvas.getBoundingClientRect(); return { x: (e.clientX - r.left) * rect.width / r.width, y: (e.clientY - r.top) * rect.height / r.height }; };
  canvas.onpointerdown = e => { e.preventDefault(); drawing = true; canvas.setPointerCapture(e.pointerId); const p = point(e); ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x + 0.1, p.y); ctx.stroke(); };
  canvas.onpointermove = e => { if (!drawing) return; const p = point(e); ctx.lineTo(p.x, p.y); ctx.stroke(); };
  canvas.onpointerup = canvas.onpointercancel = () => drawing = false;
  $('#clear-canvas').onclick = () => ctx.clearRect(0, 0, rect.width, rect.height);
}
function finish() {
  stopSpeech(); const mode = game.mode, stage = game.stage, first = game.firstTry;
  app.innerHTML = `<section class="finish-panel"><div class="finish-art">✦</div><span class="eyebrow">BİR KÜÇÜK MACERA DAHA TAMAMLANDI</span><h1>Harika iş çıkardın!</h1><p>Denediğin her soruda bir adım daha ilerledin.</p><div class="result-stats"><div><b>5</b><span>yeni yıldız</span></div><div><b>${first}/5</b><span>ilk denemede, ipucusuz</span></div><div><b>${progress.stars}</b><span>toplam yıldız</span></div></div><button id="again" class="primary-button">Bir tur daha oyna ↗</button><button id="finish-home" class="text-button">Oyun alanına dön</button></section>`;
  $('#again').onclick = () => start(mode, stage); $('#finish-home').onclick = () => { home(); focusHeading(); }; focusHeading();
}
function showProgress() {
  stopSpeech(); game = null; header('progress');
  app.innerHTML = `<section class="progress-page"><span class="eyebrow">SENİN ÖĞRENME YOLCULUĞUN</span><h1>Küçük adımların birikiyor.</h1><p>Her doğru yanıt bir yıldız. İstersen tekrar dene, istersen yeni bir oyun keşfet.</p><div class="result-stats"><div><b>${progress.stars} ✦</b><span>kazanılan yıldız</span></div><div><b>${progress.solved}</b><span>tamamlanan alıştırma</span></div><div><b>${progress.rounds}</b><span>tamamlanan tur</span></div></div><div class="progress-cards">${modes.map(m => `<div class="progress-card ${m.color}"><span class="card-icon">${m.icon}</span><div><h2>${m.name}</h2><p>${progress.byMode[m.id] || 0} alıştırma tamamlandı</p></div><button class="icon-button" data-play="${m.id}" aria-label="${m.name} oyna">↗</button></div>`).join('')}</div><p class="privacy-note">İlerleme bu cihazın tarayıcısında saklanır. Tarayıcı verileri temizlenirse silinir.</p></section>`;
  app.querySelectorAll('[data-play]').forEach(b => b.onclick = () => start(b.dataset.play)); focusHeading();
}
$('#home-nav').onclick = () => { home(); focusHeading(); };
$('#progress-nav').onclick = showProgress;
$('#guide-nav').onclick = () => { $('#reset-message').textContent = ''; $('#reset-progress').textContent = 'Bu cihazdaki ilerlemeyi sıfırla'; $('#reset-progress').dataset.confirm = ''; $('#guide').showModal(); };
$('#close-guide').onclick = () => $('#guide').close();
$('#sound-toggle').onclick = () => { progress.sound = !progress.sound; stopSpeech(); save(); soundLabel(); };
$('#reset-progress').onclick = () => { const b = $('#reset-progress'); if (b.dataset.confirm !== 'yes') { b.dataset.confirm = 'yes'; b.textContent = 'Eminsen yeniden dokun: tüm ilerlemeyi sil'; return; } progress = initial(); save(); soundLabel(); $('#reset-message').textContent = 'İlerleme sıfırlandı.'; b.dataset.confirm = ''; b.textContent = 'Bu cihazdaki ilerlemeyi sıfırla'; if (screen === 'progress') showProgress(); else { home(); } };
window.addEventListener('pagehide', stopSpeech);
soundLabel(); home();
