(() => {
  // ====== RANKING (JSONBin, por quiz) ======
  const BIN_ID = '69a03d0843b1c97be9a0345b';
  const API_KEY = '$2a$10$uPoUexkH5KHeuMHnDPbc0O/tP1KH4rqeSLkGjLk8R6lsV4MXfeTEG';

  // ====== ESTADO ======
  let cur = 0;
  let pts = 0;         // score visível (base + bónus [+ fogo] [+ x3])
  let correctCount = 0; // nº de respostas certas (para percentagem)
  let time = null;
  let tLeft = 120;
  let quiz = null;
  let playerName = '';
  let mathField = null;
  let MQ = null;
  let isX3 = false;
  let timerPaused = false;
  let feedbackLocked = false;
  let pwrUsed = { fifty:false, x3:false, stop:false };
  let streak = 0;      // acertos seguidos
  let wrongCount = 0;  // erradas

  // ====== HELPERS ======
  const $  = sel => document.querySelector(sel);
  const $$ = sel => Array.from(document.querySelectorAll(sel));
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const shuffle = arr => arr.map(v=>[v,Math.random()]).sort((a,b)=>a[1]-b[1]).map(x=>x[0]);

  function updatePwrButtons() {
    $('#pwr-50').disabled = pwrUsed.fifty;
    $('#pwr-x3').disabled = pwrUsed.x3;
    $('#pwr-stop').disabled = pwrUsed.stop;
  }

  function setTimerPaused(paused){
    timerPaused = paused;
    const bar = $('#timer-bar');
    if(paused){
      bar.classList.add('paused');
      $('#t-txt').innerText = `${tLeft}s ⏸`;
    } else {
      bar.classList.remove('paused');
      $('#t-txt').innerText = `${tLeft}s`;
    }
  }

  function updateT(){
    $('#timer-bar').style.width = (tLeft/120*100) + '%';
    if(!timerPaused) $('#t-txt').innerText = `${tLeft}s`;
  }

  function disableOptions(){
    $$('.opt-btn').forEach(b => b.disabled = true);
  }

  function showStreak(){
    const el = $('#streak-icon');
    if(streak > 3){ // foguinho quando >3 seguidas (4+)
      el.style.display = 'inline-block';
      el.textContent = `🔥 x${streak}`;
      el.classList.add('pop');
      setTimeout(()=>el.classList.remove('pop'), 300);
    } else {
      el.style.display = 'none';
      el.textContent = '';
    }
  }

  // ====== RESPOSTAS CURTAS ======
  function normalizeLatex(lx){
    return lx
      .replace(/\\left|\\right/g, '')
      .replace(/,/g, '.')
      .replace(/\s+/g, '');
  }

  function latexFractionToNumber(lx){
    const m = lx.match(/^\\frac\{(-?\d+(?:\.\d+)?)\}\{(-?\d+(?:\.\d+)?)\}$/);
    if(!m) return null;
    const n = parseFloat(m[1]); const d = parseFloat(m[2]);
    if(!isFinite(n) || !isFinite(d) || d === 0) return null;
    return n/d;
  }

  function tryNumberValue(s){
    const frac = latexFractionToNumber(s);
    if(frac !== null) return frac;
    const n = Number(s);
    return isFinite(n) ? n : null;
  }

  function nearlyEqual(a,b,eps=1e-6){ return Math.abs(a-b) <= eps; }

  // ====== BÓNUS POR TEMPO (PATAMARES) ======
  // <=30s -> +20, <=60s -> +15, <=90s -> +10, senão +0
  function timeBonus(){
    const used = clamp(120 - tLeft, 0, 120);
    if (used <= 30) return 20;
    if (used <= 60) return 15;
    if (used <= 90) return 10;
    return 0;
  }

  function isFireActiveBeforeAnswer(){
    // "Foguinho ativo" significa vir de >3 certas seguidas ANTES desta resposta
    return streak > 3;
  }

  /**
   * Breakdown de pontos para a questão atual (se certa):
   * - base: 50
   * - bónus tempo: patamares
   * - bónus fogo: +15 se streak >3 (antes da resposta)
   * - total: (base + tempo + fogo) * 3 se x3 ativo; senão valor simples
   */
  function pointsForQuestion(fireActive){
    const base = 50;
    const bonusTime = timeBonus();
    const bonusFire = fireActive ? 15 : 0;
    const subtotal = base + bonusTime + bonusFire;
    const total = isX3 ? subtotal * 3 : subtotal;
    return { base, bonusTime, bonusFire, subtotal, total, x3: isX3 };
  }

  // ====== FLUXO ======
  function goToMenu(){
    const input = $('#player-name-input');
    playerName = input.value.trim();
    if(!playerName) { alert('Nome sff!'); return; }
    localStorage.setItem('playerName', playerName);
    $('#login-screen').classList.add('hidden');
    $('#quiz-selection').style.display = 'block';
    renderQuizList();
  }

  function renderQuizList(){
    const list = $('#quiz-list');
    const db = window.database || [];
    list.innerHTML = db.map(q => `
      <div class="quiz-card">
        <strong>${q.title}</strong><br><small>${q.questions.length} questões</small><br>
        <button class="play-btn" data-id="${q.id}" style="background:var(--accent);color:#fff;border:none;padding:10px;border-radius:8px;cursor:pointer;margin-top:10px;width:100%;">JOGAR</button>
      </div>
    `).join('');

    $$('.play-btn').forEach(btn => {
      btn.addEventListener('click', () => startQuiz(btn.dataset.id));
    });
  }

  function startQuiz(id){
    const base = (window.database || []).find(x => x.id === id);
    if(!base){ alert('Quiz não encontrado.'); return; }

    quiz = JSON.parse(JSON.stringify(base));

    // baralhar opções e reajustar índice correto
    quiz.questions.forEach(q => {
      if(q.type === 'multiple'){
        const pairs = q.opts.map((o,i)=>({o,i}));
        const shuffled = shuffle(pairs);
        q.opts = shuffled.map(p => p.o);
        q.ans = shuffled.findIndex(p => p.i === q.ans);
      }
    });

    // baralhar perguntas
    quiz.questions = shuffle(quiz.questions);

    // reset estado
    cur = 0; pts = 0; correctCount = 0; wrongCount = 0; streak = 0;
    pwrUsed = {fifty:false, x3:false, stop:false};
    updatePwrButtons();
    showStreak();

    // UI
    $('#quiz-selection').style.display = 'none';
    $('#game-ui').classList.remove('hidden');

    loadQuestion();
  }

  function loadQuestion(){
    clearInterval(time);
    tLeft = 120;
    isX3 = false;
    setTimerPaused(false);
    updateT();
    $('#score-val').innerText = `${pts} pts`;

    const q = quiz.questions[cur];
    $('#q-info').innerText = `Questão ${cur+1}/${quiz.questions.length}`;

    const txtQ = $('#txt-q');
    txtQ.textContent = q.q;
    renderMathInElement(txtQ, { delimiters: [{left:'$', right:'$', display:false}] });

    const imgZone = $('#img-q');
    imgZone.innerHTML = '';
    if(q.img){
      const im = document.createElement('img');
      im.src = q.img;
      im.alt = 'Imagem da questão';
      imgZone.appendChild(im);
    }

    if(q.type === 'multiple'){
      $('#opt-grid').classList.remove('hidden');
      $('#short-zone').classList.add('hidden');
      renderOptions(q);
    } else {
      $('#opt-grid').classList.add('hidden');
      $('#short-zone').classList.remove('hidden');
      mathField.latex('');
    }

    time = setInterval(() => {
      if(!timerPaused){
        tLeft--;
        updateT();
        if(tLeft <= 0){
          clearInterval(time);
          const rightAns = (q.type === 'multiple') ? q.opts[q.ans] : q.ans;
          validate(false, rightAns);
        }
      }
    }, 1000);
  }

  function renderOptions(q){
    const grid = $('#opt-grid');
    grid.innerHTML = '';
    q.opts.forEach((opt, i) => {
      const btn = document.createElement('button');
      btn.className = 'opt-btn';
      btn.textContent = opt; // seguro
      btn.addEventListener('click', () => validateOption(i));
      grid.appendChild(btn);
    });
    renderMathInElement(grid, { delimiters: [{ left:'$', right:'$', display:false }] });
  }

  function validateOption(chosenIndex){
    disableOptions();
    const q = quiz.questions[cur];
    const isCorrect = chosenIndex === q.ans;
    const rightAns = q.opts[q.ans];
    validate(isCorrect, rightAns);
  }

  function use5050(){
    const q = quiz.questions[cur];
    if(q.type !== 'multiple') return;
    if(pwrUsed.fifty) return;

    pwrUsed.fifty = true; updatePwrButtons();
    const btns = $$('.opt-btn');
    const toHide = btns
      .map((b, i) => ({ b, i }))
      .filter(x => x.i !== q.ans)
      .sort(() => Math.random() - 0.5)
      .slice(0,2);
    toHide.forEach(x => x.b.classList.add('wrong-option'));
  }

  function useX3(){
    if(pwrUsed.x3) return;
    pwrUsed.x3 = true; isX3 = true; updatePwrButtons();
  }

  function useStop(){
    if(pwrUsed.stop) return;
    pwrUsed.stop = true; updatePwrButtons();
    setTimerPaused(true);
  }

  function checkShort(){
    const q = quiz.questions[cur];
    const userRaw = mathField.latex();
    const correctRaw = q.ans;

    const user = normalizeLatex(userRaw);
    const correct = normalizeLatex(correctRaw);

    if(user === correct){
      return validate(true, correctRaw);
    }

    const uNum = tryNumberValue(user);
    const cNum = tryNumberValue(correct);
    if(uNum !== null && cNum !== null && nearlyEqual(uNum, cNum)){
      return validate(true, correctRaw);
    }

    return validate(false, correctRaw);
  }

  function validate(isCorrect, rightAns){
    clearInterval(time);
    disableOptions();

    const fb = $('#feedback');
    const ansBox = $('#fb-correct-ans');
    const det = $('#fb-details');

    if(isCorrect){
      // Determina se o foguinho já estava ativo ANTES desta resposta
      const fireActive = isFireActiveBeforeAnswer();
      const { base, bonusTime, bonusFire, subtotal, total, x3 } = pointsForQuestion(fireActive);

      pts += total;          // score total visível
      correctCount += 1;     // para percentagem
      streak += 1;
      $('#score-val').innerText = `${pts} pts`;
      showStreak();

      $('#fb-icon').innerText = '🎯';
      $('#fb-msg').innerText = 'CORRETO!';

      // Mensagem detalhada
      const parts = [`Base: +${base}`, `Bónus tempo: +${bonusTime}`];
      if (bonusFire > 0) parts.push(`Bónus 🔥: +${bonusFire}`);
      if (x3) parts.push('x3 aplicado');
      det.textContent = `${parts.join(' | ')} → +${total} pts`;

      ansBox.style.display = 'none';
      fb.style.background = 'rgba(0, 167, 116, 0.98)';
    } else {
      wrongCount += 1;
      streak = 0;
      showStreak();

      $('#fb-icon').innerText = '❌';
      $('#fb-msg').innerText = 'Resposta:';
      det.textContent = '0 pts nesta questão';

      ansBox.style.display = 'block';
      ansBox.innerHTML = '';
      try {
        katex.render(String(rightAns), ansBox, { throwOnError: false });
      } catch {
        ansBox.textContent = String(rightAns);
      }
      fb.style.background = 'rgba(208, 0, 0, 0.98)';
    }

    fb.style.display = 'flex';
  }

  function closeFeedbackAndContinue(){
    if(feedbackLocked) return;
    feedbackLocked = true;
    setTimeout(() => feedbackLocked = false, 350);

    $('#feedback').style.display = 'none';
    cur++;
    if(cur < quiz.questions.length) loadQuestion(); else finish();
  }

  // ====== FIM & RANKING POR QUIZ ======
  async function finish(){
    $('#game-ui').classList.add('hidden');
    $('#rank-screen').classList.remove('hidden');

    const total = quiz.questions.length;
    const grade = Math.round((correctCount / total) * 100);

    $('#res-grade').innerText = `${grade}%`;
    const erradas = total - correctCount;
    $('#wrong-msg').innerText = `Erraste ${erradas} ${ erradas === 1 ? 'pergunta' : 'perguntas' }.`;

    try {
      const res = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
        headers: { 'X-Master-Key': API_KEY }
      });
      const data = await res.json();

      // Suporta estilos antigos (array) e novos (objeto)
      let root = data.record;
      if (root && root.record !== undefined) root = root.record;

      let store;
      if (Array.isArray(root)) {
        store = {}; // migrar de global antigo para objeto
      } else if (root && typeof root === 'object') {
        store = root;
      } else {
        store = {};
      }

      const qid = quiz.id || 'default';
      const currentList = Array.isArray(store[qid]) ? store[qid] : [];

      currentList.push({ n: playerName, p: pts, g: grade });
      currentList.sort((a,b) => (b.p ?? 0) - (a.p ?? 0));
      const top5 = currentList.slice(0, 5);
      store[qid] = top5;

      await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': API_KEY
        },
        body: JSON.stringify({ record: store })
      });

      $('#table').innerHTML =
        "<tr><th>Pos</th><th>Nome</th><th>Pontos</th><th>Nota</th></tr>" +
        top5.map((x,i)=>`<tr><td>${i+1}º</td><td>${x.n}</td><td>${x.p ?? 0}</td><td>${x.g ?? 0}%</td></tr>`).join("");

    } catch(e) {
      $('#table').innerHTML = "<tr><td>Ranking Offline</td></tr>";
    }
  }

  // ====== INICIALIZAÇÃO ======
  window.addEventListener('DOMContentLoaded', () => {
    // MathQuill
    MQ = MathQuill.getInterface(2);
    mathField = MQ.MathField($('#math-field'), { handlers: { enter: checkShort } });

    // Tabs do teclado
    $$('.kb-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        $$('.kb-tab').forEach(t => t.classList.remove('active'));
        $$('.kb-group').forEach(g => g.classList.remove('active'));
        tab.classList.add('active');
        $(`.kb-group[data-tab="${tab.dataset.tab}"]`).classList.add('active');
      });
    });

    // Botões do teclado
    $$('#math-keyboard .kb-btn').forEach(btn => {
      if(btn.dataset.write){
        btn.addEventListener('click', () => { mathField.write(btn.dataset.write); mathField.focus(); });
      }
      if(btn.dataset.key){
        btn.addEventListener('click', () => { mathField.keystroke(btn.dataset.key); mathField.focus(); });
      }
      if(btn.dataset.clear){
        btn.addEventListener('click', () => { mathField.latex(''); mathField.focus(); });
      }
    });

    // Login OK
    $('#ok-btn').addEventListener('click', goToMenu);

    // Persistir nome
    const saved = localStorage.getItem('playerName');
    if(saved) $('#player-name-input').value = saved;

    // Power-ups
    $('#pwr-50').addEventListener('click', use5050);
    $('#pwr-x3').addEventListener('click', useX3);
    $('#pwr-stop').addEventListener('click', useStop);

    // Submeter resposta curta
    $('#short-submit').addEventListener('click', checkShort);

    // Feedback overlay
    $('#feedback').addEventListener('click', closeFeedbackAndContinue);

    // Voltar
    $('#btn-back').addEventListener('click', () => location.reload());
  });
})();
