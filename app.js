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

  // ====== FUNÇÕES GLOBAIS (PARA O HTML ENCONTRAR) ======
  window.mqWrite = (latex) => {
    if (!mathField) return;
    mathField.write(latex);
    mathField.focus();
  };

  window.mqKey = (key) => {
    if (!mathField) return;
    mathField.keystroke(key);
    mathField.focus();
  };

  window.mqClear = () => {
    if (!mathField) return;
    mathField.latex('');
    mathField.focus();
  };

  window.checkShort = () => {
    checkShortInternal();
  };

  // ====== RENDERIZAÇÃO MELHORADA (CORRIGE GRAUS E LATEX) ======
  function safeRender(el, txt) {
    if (!txt) return;
    // Corrige formatos comuns de graus e garante barras duplas
    let cleanTxt = txt.replace(/circ/g, '^{\\circ}').replace(/\\\\/g, '\\');
    el.innerHTML = cleanTxt;
    renderMathInElement(el, {
      delimiters: [
        {left: "$$", right: "$$", display: true},
        {left: "$", right: "$", display: false},
        {left: "\\(", right: "\\)", display: false}
      ],
      throwOnError: false
    });
  }

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
    if(!el) return;
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
  function timeBonus(){
    const used = clamp(120 - tLeft, 0, 120);
    if (used <= 30) return 20;
    if (used <= 60) return 15;
    if (used <= 90) return 10;
    return 0;
  }

  function isFireActiveBeforeAnswer(){
    return streak > 3;
  }

  function pointsForQuestion(fireActive){
    const base = 50;
    const bonusTime = timeBonus();
    const bonusFire = fireActive ? 15 : 0;
    const subtotal = base + bonusTime + bonusFire;
    const total = isX3 ? subtotal * 3 : subtotal;
    return { base, bonusTime, bonusFire, subtotal, total, x3: isX3 };
  }

  // ====== FLUXO ======
  window.goToMenu = () => {
    const input = $('#player-name-input');
    playerName = input.value.trim();
    if(!playerName) { alert('Nome sff!'); return; }
    localStorage.setItem('playerName', playerName);
    $('#login-screen').classList.add('hidden');
    $('#quiz-selection').style.display = 'block';
    renderQuizList();
  };

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

    quiz.questions.forEach(q => {
      if(q.type === 'multiple'){
        const pairs = q.opts.map((o,i)=>({o,i}));
        const shuffled = shuffle(pairs);
        q.opts = shuffled.map(p => p.o);
        q.ans = shuffled.findIndex(p => p.i === q.ans);
      }
    });

    quiz.questions = shuffle(quiz.questions);

    cur = 0; pts = 0; correctCount = 0; wrongCount = 0; streak = 0;
    pwrUsed = {fifty:false, x3:false, stop:false};
    updatePwrButtons();
    showStreak();

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
    safeRender(txtQ, q.q); // Renderização segura com correção de graus

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
      safeRender(btn, opt); // Renderização segura nas opções
      btn.addEventListener('click', () => validateOption(i));
      grid.appendChild(btn);
    });
  }

  function validateOption(chosenIndex){
    disableOptions();
    const q = quiz.questions[cur];
    const isCorrect = chosenIndex === q.ans;
    const rightAns = q.opts[q.ans];
    validate(isCorrect, rightAns);
  }

  window.use5050 = () => {
    const q = quiz.questions[cur];
    if(q.type !== 'multiple' || pwrUsed.fifty) return;

    pwrUsed.fifty = true; updatePwrButtons();
    const btns = $$('.opt-btn');
    const toHide = btns
      .map((b, i) => ({ b, i }))
      .filter(x => x.i !== q.ans)
      .sort(() => Math.random() - 0.5)
      .slice(0,2);
    toHide.forEach(x => x.b.classList.add('wrong-option'));
  };

  window.useX3 = () => {
    if(pwrUsed.x3) return;
    pwrUsed.x3 = true; isX3 = true; updatePwrButtons();
  };

  window.useStop = () => {
    if(pwrUsed.stop) return;
    pwrUsed.stop = true; updatePwrButtons();
    setTimerPaused(true);
  };

  function checkShortInternal(){
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
      const fireActive = isFireActiveBeforeAnswer();
      const { base, bonusTime, bonusFire, total, x3 } = pointsForQuestion(fireActive);

      pts += total;
      correctCount += 1;
      streak += 1;
      $('#score-val').innerText = `${pts} pts`;
      showStreak();

      $('#fb-icon').innerText = '🎯';
      $('#fb-msg').innerText = 'CORRETO!';

      const parts = [`Base: +${base}`, `Bónus tempo: +${bonusTime}`];
      if (bonusFire > 0) parts.push(`🔥: +${bonusFire}`);
      if (x3) parts.push('x3!');
      det.textContent = `${parts.join(' | ')} → +${total} pts`;

      ansBox.style.display = 'none';
      fb.style.background = 'rgba(0, 167, 116, 0.98)';
    } else {
      wrongCount += 1;
      streak = 0;
      showStreak();

      $('#fb-icon').innerText = '❌';
      $('#fb-msg').innerText = 'Resposta:';
      det.textContent = '0 pts';

      ansBox.style.display = 'block';
      // Garante que a resposta de erro seja renderizada matematicamente e corrija graus
      let formattedAns = String(rightAns).includes('$') ? rightAns : `$${rightAns}$`;
      safeRender(ansBox, formattedAns);
      
      fb.style.background = 'rgba(208, 0, 0, 0.98)';
    }

    fb.style.display = 'flex';
  }

  window.closeFeedbackAndContinue = () => {
    if(feedbackLocked) return;
    feedbackLocked = true;
    setTimeout(() => feedbackLocked = false, 350);

    $('#feedback').style.display = 'none';
    cur++;
    if(cur < quiz.questions.length) loadQuestion(); else finish();
  };

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

      let root = data.record;
      if (root && root.record !== undefined) root = root.record;

      let store = (root && typeof root === 'object' && !Array.isArray(root)) ? root : {};

      const qid = quiz.id || 'default';
      const currentList = Array.isArray(store[qid]) ? store[qid] : [];

      currentList.push({ n: playerName, p: pts, g: grade });
      currentList.sort((a,b) => (b.p ?? 0) - (a.p ?? 0));
      const top5 = currentList.slice(0, 5);
      store[qid] = top5;

      await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'X-Master-Key': API_KEY },
        body: JSON.stringify({ record: store })
      });

      $('#table').innerHTML =
        "<tr><th>Pos</th><th>Nome</th><th>Pontos</th><th>Nota</th></tr>" +
        top5.map((x,i)=>`<tr><td>${i+1}º</td><td>${x.n}</td><td>${x.p ?? 0}</td><td>${x.g ?? 0}%</td></tr>`).join("");

    } catch(e) {
      $('#table').innerHTML = "<tr><td>Ranking Offline</td></tr>";
    }
  }

  window.addEventListener('DOMContentLoaded', () => {
    MQ = MathQuill.getInterface(2);
    const mf = $('#math-field');
    if(mf) {
      mathField = MQ.MathField(mf, { handlers: { enter: checkShortInternal } });
    }

    // Tabs do teclado
    $$('.kb-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        $$('.kb-tab').forEach(t => t.classList.remove('active'));
        $$('.kb-group').forEach(g => g.classList.remove('active'));
        tab.classList.add('active');
        const group = $(`.kb-group[data-tab="${tab.dataset.tab}"]`);
        if(group) group.classList.add('active');
      });
    });

    // Login OK
    const okBtn = $('#ok-btn');
    if(okBtn) okBtn.addEventListener('click', goToMenu);

    const saved = localStorage.getItem('playerName');
    if(saved && $('#player-name-input')) $('#player-name-input').value = saved;

    // LIGAR OS BOTÕES DE POWER-UP (Importante para que funcionem)
    if($('#pwr-50')) $('#pwr-50').onclick = use5050;
    if($('#pwr-x3')) $('#pwr-x3').onclick = useX3;
    if($('#pwr-stop')) $('#pwr-stop').onclick = useStop;

    if($('#short-submit')) $('#short-submit').addEventListener('click', checkShortInternal);
    if($('#feedback')) $('#feedback').addEventListener('click', window.closeFeedbackAndContinue);
    if($('#btn-back')) $('#btn-back').addEventListener('click', () => location.reload());
  });
})();
