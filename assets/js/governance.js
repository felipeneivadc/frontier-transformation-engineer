(function(){
  'use strict';
  var T = window.NEIVA_I18N, UI = T.ui;
  document.documentElement.classList.remove('no-js');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function(s, r){ return (r||document).querySelector(s); };
  var $$ = function(s, r){ return Array.prototype.slice.call((r||document).querySelectorAll(s)); };
  function store(k, v){ return v === undefined ? window.NEIVA_SITE.readStorage(k) : window.NEIVA_SITE.writeStorage(k, v); }
  function unstore(k){ return window.NEIVA_SITE.removeStorage(k); }
  function esc(s){ return String(s).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }

  /* ---------- Toast ---------- */
  var toast = $('#toast'), toastTimer;
  function showToast(msg){ toast.textContent = msg; toast.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(function(){ toast.classList.remove('show'); }, 2600); }

  /* ---------- Barra de progresso, topo, voltar ao topo ---------- */
  var progress = $('#progress'), toTop = $('#toTop'), nav = $('#nav');
  function onScroll(){
    var h = document.documentElement, max = h.scrollHeight - h.clientHeight;
    progress.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + '%';
    toTop.hidden = h.scrollTop <= 600;
    toTop.classList.toggle('show', h.scrollTop > 600);
  }
  window.addEventListener('scroll', onScroll, {passive:true}); onScroll();
  toTop.addEventListener('click', function(){ window.scrollTo({top:0, behavior: reduce ? 'auto' : 'smooth'}); });

  /* ---------- Modo Executivo / Técnico ---------- */
  var MODE_KEY = 'neiva-gov-mode';
  function setMode(mode, announce){
    document.body.setAttribute('data-mode', mode);
    $$('.mode-btn').forEach(function(b){ b.setAttribute('aria-pressed', String(b.getAttribute('data-mode') === mode)); });
    store(MODE_KEY, mode);
    if (announce) showToast(mode === 'exec' ? UI.modeExec : UI.modeTech);
  }
  var savedMode = store(MODE_KEY); if (savedMode === 'exec' || savedMode === 'tech') setMode(savedMode, false);
  $$('.mode-btn, .mode-switch').forEach(function(b){ b.addEventListener('click', function(){ setMode(b.getAttribute('data-mode'), true); }); });

  /* ---------- Abas dos pilares ---------- */
  var tabs = $$('[role="tab"]'), panels = $$('.panel');
  function activate(id, focusTab){
    if (!tabs.some(function(t){ return t.getAttribute('data-pillar') === id; })) return;
    tabs.forEach(function(t){ var on = t.getAttribute('data-pillar') === id; t.setAttribute('aria-selected', String(on)); t.setAttribute('tabindex', on ? '0' : '-1'); if (on && focusTab) t.focus(); });
    panels.forEach(function(p){ var on = p.id === 'panel-' + id; p.hidden = !on; p.classList.toggle('show', on); });
  }
  tabs.forEach(function(t, i){
    t.addEventListener('click', function(){ activate(t.getAttribute('data-pillar'), false); });
    t.addEventListener('keydown', function(e){
      var dir = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!dir && e.key !== 'Home' && e.key !== 'End') return;
      e.preventDefault();
      var next = e.key === 'Home' ? tabs[0] : e.key === 'End' ? tabs[tabs.length - 1] : tabs[(i + dir + tabs.length) % tabs.length];
      activate(next.getAttribute('data-pillar'), true);
    });
    function activateHash(){
      var match = window.location.hash.match(/^#(?:panel|tab)-(seg|ops|cost|perf|rel)$/);
      if (match) activate(match[1], false);
    }
    window.addEventListener('hashchange', activateHash);
    activateHash();
  });
  document.addEventListener('click', function(e){
    var el = e.target.closest('[data-pillar]');
    if (!el || el.getAttribute('role') === 'tab') return;
    activate(el.getAttribute('data-pillar'), false);
    var sec = $('#pilares');
    if (sec){ e.preventDefault(); sec.scrollIntoView({behavior: reduce ? 'auto' : 'smooth', block:'start'}); if (history.replaceState) history.replaceState(null, '', '#pilares'); }
  });

  /* ---------- Acordeões ---------- */
  $$('.acc-btn').forEach(function(btn, index){
    var panel = btn.nextElementSibling;
    panel.id = 'accordion-' + index;
    btn.setAttribute('aria-controls', panel.id);
    panel.setAttribute('aria-hidden', 'true');
    panel.inert = true;
    btn.addEventListener('click', function(){
      var open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      panel.classList.toggle('open', !open);
      panel.setAttribute('aria-hidden', String(open));
      panel.inert = open;
    });
  });

  /* ---------- Flip cards ---------- */
  $$('.flip').forEach(function(card){
    var front = $('.flip-front', card), back = $('.flip-back', card), term = $('h4', front).textContent;
    back.setAttribute('aria-hidden', 'true');
    card.setAttribute('aria-label', term + ': ver definição');
    function toggle(){
      var on = card.classList.toggle('flipped');
      card.setAttribute('aria-pressed', String(on));
      front.setAttribute('aria-hidden', String(on));
      back.setAttribute('aria-hidden', String(!on));
      card.setAttribute('aria-label', term + (on ? ': ' + $('p', back).textContent + ' Voltar ao termo.' : ': ver definição'));
    }
    card.addEventListener('click', toggle);
    card.addEventListener('keydown', function(e){ if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); toggle(); } });
  });

  /* ---------- Revelação ao rolar + seção ativa ---------- */
  var reveals = $$('.reveal');
  if ('IntersectionObserver' in window && !reduce){
    var io = new IntersectionObserver(function(entries){ entries.forEach(function(en){ if (en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target); } }); }, {threshold:0, rootMargin:'0px 0px -6% 0px'});
    reveals.forEach(function(r){ io.observe(r); });
  } else { reveals.forEach(function(r){ r.classList.add('in'); }); }
  var navLinks = $$('a[href^="#"]', nav);
  var sections = navLinks.map(function(a){ return $(a.getAttribute('href')); }).filter(Boolean);
  if ('IntersectionObserver' in window){
    var spy = new IntersectionObserver(function(entries){
      entries.forEach(function(en){ if (!en.isIntersecting) return; navLinks.forEach(function(a){ a.classList.toggle('active', a.getAttribute('href') === '#' + en.target.id); }); });
    }, {rootMargin:'-38% 0px -55% 0px', threshold:0});
    sections.forEach(function(s){ spy.observe(s); });
  }

  /* =====================================================
     MAPA DE ZONAS + CLASSIFICADOR
     ===================================================== */
  var zoneInfo = $('#zoneInfo'), zoneRings = $$('.zring');
  function showZone(z, fromClassifier){
    var d = T.zones[z]; if (!d) return;
    zoneRings.forEach(function(r){
      var active = r.getAttribute('data-zone') === String(z);
      r.classList.toggle('active', active);
      r.setAttribute('aria-pressed', String(active));
    });
    zoneInfo.className = 'zinfo ' + d.cls;
    zoneInfo.innerHTML = '<span class="label">' + esc(d.label) + '</span><h4>' + esc(d.title) + '</h4><p class="who">' + esc(d.who) + '</p><ul>' +
      d.items.map(function(i){ return '<li>' + esc(i) + '</li>'; }).join('') + '</ul><div class="zbadges">' + d.badges.map(function(b){ return '<span class="badge">' + esc(b) + '</span>'; }).join('') + '</div>';
    if (!fromClassifier) zoneInfo.style.animation = 'none', void zoneInfo.offsetWidth, zoneInfo.style.animation = '';
  }
  zoneRings.forEach(function(r){
    r.setAttribute('aria-pressed', String(r.classList.contains('active')));
    r.addEventListener('click', function(){ showZone(+r.getAttribute('data-zone'), false); });
    r.addEventListener('keydown', function(e){ if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); showZone(+r.getAttribute('data-zone'), false); } });
  });
  var classifier = $('#classifier'), classResult = $('#classResult');
  var CLS_BY_ZONE = {1:'p-perf', 2:'p-ops', 3:'p-cost'};
  function classify(){
    var on = {}; $$('.ctoggle', classifier).forEach(function(b){ on[b.getAttribute('data-rule')] = b.getAttribute('aria-pressed') === 'true'; });
    var hit = null;
    for (var i = 0; i < T.classifier.rules.length; i++){ var r = T.classifier.rules[i]; if (on[r.key]){ hit = r; break; } }
    var zone = hit ? hit.zone : 1, text = hit ? hit.text : T.classifier.base;
    classResult.className = 'cresult ' + CLS_BY_ZONE[zone];
    classResult.innerHTML = '<span class="cz">' + esc(T.classifier.zoneWord) + ' ' + zone + '</span><p>' + text + '</p>';
    showZone(zone, true);
  }
  classifier.addEventListener('click', function(e){
    var b = e.target.closest('.ctoggle'); if (!b) return;
    b.setAttribute('aria-pressed', String(b.getAttribute('aria-pressed') !== 'true')); classify();
  });

  /* =====================================================
     AUTOAVALIAÇÃO DE MATURIDADE
     ===================================================== */
  var PILLARS = T.pillars, SCALE = T.scale, LEVELS = T.levels;
  var STORE_KEY = 'neiva-gov-assessment-v1';
  var answers = PILLARS.map(function(){ return [0,0,0]; });
  var saved = store(STORE_KEY);
  if (saved !== null){
    var valid = Array.isArray(saved) && saved.length === PILLARS.length && saved.every(function(row, i){
      return Array.isArray(row) && row.length === PILLARS[i].questions.length && row.every(function(value){
        return Number.isInteger(value) && value >= 0 && value <= 5;
      });
    });
    if (valid) answers = saved;
    else window.NEIVA_SITE.announce('As respostas salvas têm um formato inválido. Refaça a autoavaliação; nenhuma pontuação foi restaurada.');
  }
  var qWrap = $('#questions'), html = '';
  PILLARS.forEach(function(p, pi){
    html += '<div class="qgroup ' + p.cls + '"><h4><span class="label">' + esc(UI.pillarWord || 'Pilar') + ' ' + p.num + '</span>' + esc(p.name) + '</h4>';
    p.questions.forEach(function(q, qi){
      html += '<div class="q"><p id="question-' + pi + '-' + qi + '">' + (pi*3+qi+1) + '. ' + esc(q) + '</p><div class="scale" role="radiogroup" aria-labelledby="question-' + pi + '-' + qi + '">';
      SCALE.forEach(function(s){ html += '<button class="opt" role="radio" type="button" aria-checked="false" data-p="' + pi + '" data-q="' + qi + '" data-v="' + s.n + '"><b>' + s.n + '</b><span>' + esc(s.l) + '</span></button>'; });
      html += '</div></div>';
    });
    html += '</div>';
  });
  qWrap.innerHTML = html;
  function paintAnswers(){
    $$('.opt', qWrap).forEach(function(b){
      var value = +b.getAttribute('data-v'), answer = answers[+b.getAttribute('data-p')][+b.getAttribute('data-q')];
      b.setAttribute('aria-checked', String(answer === value));
      b.tabIndex = (answer || 1) === value ? 0 : -1;
    });
  }
  qWrap.addEventListener('click', function(e){
    var b = e.target.closest('.opt'); if (!b) return;
    var pi = +b.getAttribute('data-p'), qi = +b.getAttribute('data-q'), v = +b.getAttribute('data-v');
    answers[pi][qi] = (answers[pi][qi] === v) ? 0 : v; store(STORE_KEY, answers); paintAnswers(); update();
  });
  qWrap.addEventListener('keydown', function(e){
    var b = e.target.closest('.opt'); if (!b) return;
    var dir = (e.key === 'ArrowRight' || e.key === 'ArrowDown') ? 1 : (e.key === 'ArrowLeft' || e.key === 'ArrowUp') ? -1 : 0;
    if (!dir && e.key !== 'Home' && e.key !== 'End') return;
    e.preventDefault();
    var opts = $$('.opt', b.parentElement), index = opts.indexOf(b);
    var next = e.key === 'Home' ? opts[0] : e.key === 'End' ? opts[opts.length - 1] : opts[(index + dir + opts.length) % opts.length];
    answers[+next.getAttribute('data-p')][+next.getAttribute('data-q')] = +next.getAttribute('data-v');
    store(STORE_KEY, answers); paintAnswers(); update(); next.focus();
  });
  var CX = 210, CY = 210, R = 150, N = 5;
  function pt(i, val){ var ang = -Math.PI/2 + i * (2*Math.PI/N), r = R * (val/5); return [CX + r*Math.cos(ang), CY + r*Math.sin(ang)]; }
  var grid = $('#radarGrid'), labels = $('#radarLabels'), ptsG = $('#radarPts'), area = $('#radarArea'), g = '';
  for (var k = 1; k <= 5; k++){
    var pts = []; for (var i = 0; i < N; i++) pts.push(pt(i, k).join(','));
    g += '<polygon class="grid-line" points="' + pts.join(' ') + '"/>';
    var lp = pt(0, k); g += '<text class="lvl" x="' + (lp[0] + 6) + '" y="' + (lp[1] + 3) + '">' + k + '</text>';
  }
  for (var a = 0; a < N; a++){ var e5 = pt(a, 5); g += '<line class="axis" x1="' + CX + '" y1="' + CY + '" x2="' + e5[0] + '" y2="' + e5[1] + '"/>'; }
  grid.innerHTML = g;
  var labelPositions = [[210,28,'middle'],[409,143,'end'],[326,383,'middle'],[94,383,'middle'],[11,143,'start']];
  labels.innerHTML = PILLARS.map(function(p, i){
    var position = labelPositions[i];
    return '<text x="' + position[0] + '" y="' + position[1] + '" text-anchor="' + position[2] + '" style="fill:var(--accent-text)" class="' + p.cls + '">' + esc(p.short) + '</text>';
  }).join('');
  var cur = [0,0,0,0,0], tgt = [0,0,0,0,0], raf;
  function draw(vals){
    var pts = [], dots = '';
    vals.forEach(function(v, i){ var q = pt(i, v); pts.push(q[0].toFixed(1) + ',' + q[1].toFixed(1)); dots += '<circle class="pt ' + PILLARS[i].cls + '" cx="' + q[0].toFixed(1) + '" cy="' + q[1].toFixed(1) + '" r="5" style="fill:var(--accent)"/>'; });
    area.setAttribute('points', pts.join(' ')); ptsG.innerHTML = dots;
  }
  function tween(){
    cancelAnimationFrame(raf);
    if (reduce){ cur = tgt.slice(); draw(cur); return; }
    var from = cur.slice(), start = null, dur = 550;
    function step(ts){ if (!start) start = ts; var t = Math.min(1, (ts - start)/dur), e = 1 - Math.pow(1 - t, 3); cur = from.map(function(f, i){ return f + (tgt[i] - f) * e; }); draw(cur); if (t < 1) raf = requestAnimationFrame(step); }
    raf = requestAnimationFrame(step);
  }
  var bars = $('#bars'), recs = $('#recs'), levelScore = $('#levelScore'), levelName = $('#levelName'), levelDesc = $('#levelDesc'), progressText = $('#progressText'), progressFill = $('#progressFill');
  function avg(arr){ var f = arr.filter(function(v){ return v > 0; }); return f.length ? f.reduce(function(s, v){ return s + v; }, 0) / f.length : 0; }
  function levelFor(score, L){ var out = L[0]; L.forEach(function(l){ if (score >= l.min) out = l; }); return out; }
  var dec = T.lang === 'pt-BR' ? ',' : '.';
  function fmt(n){ return n.toFixed(1).replace('.', dec); }
  var lastSummary = '';
  function update(){
    var answered = 0; answers.forEach(function(ar){ ar.forEach(function(v){ if (v > 0) answered++; }); });
    progressText.textContent = UI.answered(answered, 15); progressFill.style.width = (answered/15*100) + '%';
    var pillarAvg = answers.map(avg); tgt = pillarAvg.slice(); tween();
    bars.innerHTML = PILLARS.map(function(p, i){ return '<div class="bar ' + p.cls + '"><span>' + esc(p.short) + '</span><div class="track"><span style="width:' + (pillarAvg[i]/5*100) + '%"></span></div><span class="val">' + (pillarAvg[i] ? fmt(pillarAvg[i]) : '–') + '</span></div>'; }).join('');
    var answeredPillars = pillarAvg.filter(function(v){ return v > 0; });
    if (!answeredPillars.length){ levelScore.textContent = '–'; levelName.textContent = UI.levelPrompt; levelDesc.textContent = UI.levelHint; recs.innerHTML = ''; lastSummary = ''; return; }
    var overall = avg(answeredPillars), L = levelFor(overall, LEVELS);
    levelScore.textContent = fmt(overall); levelName.textContent = UI.levelPrefix + L.name + (answered < 15 ? UI.partial : ''); levelDesc.textContent = L.desc;
    var weak = PILLARS.map(function(p, i){ return {p:p, v:pillarAvg[i]}; }).filter(function(x){ return x.v > 0 && x.v < 4; }).sort(function(x, y){ return x.v - y.v; }).slice(0, 3);
    recs.innerHTML = weak.length ? '<span class="label" style="--accent:#6030C0;--accent-text:var(--violet-text)">' + esc(UI.nextSteps) + '</span>' + weak.map(function(x){
      return '<div class="rec ' + x.p.cls + '"><span class="label">' + esc(x.p.name) + ' · ' + fmt(x.v) + '/5</span><ul>' + x.p.recs.map(function(r){ return '<li>' + esc(r) + '</li>'; }).join('') + '</ul><a href="#pilares" data-pillar="' + x.p.id + '">' + esc(UI.openPillar(x.p.num)) + '</a></div>';
    }).join('') : '<div class="rec" style="--accent:#10A0C0"><span class="label" style="--accent-text:var(--indigo-text)">' + esc(UI.congratsTitle) + '</span><p style="margin:0;font-size:.92rem">' + esc(UI.congrats) + '</p></div>';
    lastSummary = UI.summaryTitle + '\n' + UI.overall + ': ' + L.name + ' (' + fmt(overall) + '/5) · ' + answered + '/15 ' + UI.questionsWord + '\n' +
      PILLARS.map(function(p, i){ return '- ' + p.name + ': ' + (pillarAvg[i] ? fmt(pillarAvg[i]) + '/5' : UI.notRated); }).join('\n') +
      (weak.length ? '\n' + UI.priorities + '\n' + weak.map(function(x){ return '- ' + x.p.name + ': ' + x.p.recs[0]; }).join('\n') : '') + '\n\n' + UI.tagline;
  }
  paintAnswers(); update();
  function copyText(text, okMsg){
    function done(){ showToast(okMsg); } function fail(){ showToast(UI.copyFail); }
    if (navigator.clipboard && navigator.clipboard.writeText){ navigator.clipboard.writeText(text).then(done, fail); }
    else {
      var ta = document.createElement('textarea');
      try {
        ta.value = text; ta.setAttribute('readonly',''); ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.select();
        if (document.execCommand('copy')) done(); else fail();
      } catch(e){ fail(); }
      finally { ta.remove(); }
    }
  }
  $('#resetBtn').addEventListener('click', function(){ answers = PILLARS.map(function(){ return [0,0,0]; }); unstore(STORE_KEY); paintAnswers(); update(); showToast(UI.resetDone); });
  $('#printBtn').addEventListener('click', function(){ window.print(); });
  $('#copyBtn').addEventListener('click', function(){ if (!lastSummary){ showToast(UI.copyNeed); return; } copyText(lastSummary, UI.copied); });

  /* =====================================================
     CHECKLIST
     ===================================================== */
  var CK_KEY = 'neiva-gov-checklist-v1', CK = T.checklist;
  var storedChecklist = store(CK_KEY);
  var ckState = storedChecklist === null ? {} : storedChecklist, ckFilter = 'all';
  if (typeof ckState !== 'object' || Array.isArray(ckState) || !Object.keys(ckState).every(function(key){ return typeof ckState[key] === 'boolean'; })){
    ckState = {};
    window.NEIVA_SITE.announce('O checklist salvo tem um formato inválido. Nenhum controle foi restaurado.');
  }
  var ckGroups = $('#ckGroups'), ckTotal = CK.reduce(function(s, g){ return s + g.items.length; }, 0);
  ckGroups.innerHTML = CK.map(function(g, gi){
    return '<div class="ck-group ' + g.cls + '" data-group="' + g.id + '"><header><h4><span class="label">' + esc(UI.pillarWord || 'Pilar') + ' ' + (gi + 1) + '</span>' + esc(g.title) + '</h4><div class="mini"><div class="track"><span></span></div><span class="mcount"></span></div></header>' +
      g.items.map(function(item, i){ var id = g.id + '-' + i; return '<div class="ck-item" data-id="' + id + '"><button class="ck-box" type="button" role="checkbox" aria-checked="false" aria-labelledby="lbl-' + id + '"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2.5 8.5l3.5 3.5 7.5-8"/></svg></button><span class="ck-label"><span id="lbl-' + id + '">' + esc(item) + '</span><a class="ck-src" href="#pilares" data-pillar="' + g.id + '">' + esc(UI.ckSrc) + '</a></span></div>'; }).join('') + '</div>';
  }).join('');
  function ckRender(){
    var done = 0;
    CK.forEach(function(g){
      var gEl = $('.ck-group[data-group="' + g.id + '"]', ckGroups), gd = 0;
      g.items.forEach(function(_, i){
        var id = g.id + '-' + i, on = !!ckState[id], item = $('.ck-item[data-id="' + id + '"]', gEl);
        $('.ck-box', item).setAttribute('aria-checked', String(on)); item.classList.toggle('done', on);
        item.style.display = (ckFilter === 'open' && on) ? 'none' : '';
        if (on){ gd++; done++; }
      });
      $('.mini .track span', gEl).style.width = (gd / g.items.length * 100) + '%';
      $('.mini .mcount', gEl).textContent = gd + '/' + g.items.length;
      var show = ckFilter === 'all' || ckFilter === 'open' || ckFilter === g.id;
      if (ckFilter === 'open' && gd === g.items.length) show = false;
      gEl.classList.toggle('hide', !show);
    });
    var pct = Math.round(done / ckTotal * 100);
    $('#ckPct').textContent = pct + '%'; $('#ckFill').style.width = pct + '%'; $('#ckCount').textContent = UI.ckCount(done, ckTotal);
  }
  ckGroups.addEventListener('click', function(e){
    var box = e.target.closest('.ck-box'); var lab = e.target.closest('.ck-label');
    if (!box && lab && !e.target.closest('a')) box = $('.ck-box', lab.parentElement);
    if (!box) return;
    var id = box.parentElement.getAttribute('data-id'); ckState[id] = !ckState[id]; store(CK_KEY, ckState); ckRender();
  });
  $('#ckFilters').addEventListener('click', function(e){
    var b = e.target.closest('.fchip'); if (!b) return;
    ckFilter = b.getAttribute('data-filter'); $$('.fchip', $('#ckFilters')).forEach(function(x){ x.setAttribute('aria-pressed', String(x === b)); }); ckRender();
  });
  $('#ckReset').addEventListener('click', function(){ ckState = {}; unstore(CK_KEY); ckRender(); showToast(UI.ckReset); });
  $('#ckCopy').addEventListener('click', function(){
    var lines = [];
    CK.forEach(function(g){ var open = g.items.filter(function(_, i){ return !ckState[g.id + '-' + i]; }); if (open.length){ lines.push('\n' + g.title + ' (' + open.length + ')'); open.forEach(function(it){ lines.push('[ ] ' + it); }); } });
    var text = UI.ckCopyTitle + '\n' + (lines.length ? lines.join('\n') : UI.ckNone) + '\n\n' + UI.tagline;
    copyText(text, UI.ckCopied);
  });
  ckRender();

  /* =====================================================
     RACI
     ===================================================== */
  var RACI = T.raci, raciTable = $('#raciTable'), tbody = $('tbody', raciTable), raciRole = 'all', raciPillar = 'all';
  var RNAMES = {R:'R', A:'A', AR:'A/R', C:'C', I:'I'};
  tbody.innerHTML = RACI.rows.map(function(r){
    return '<tr data-p="' + r.p + '"><td class="proc p-' + r.p + '">' + esc(r.name) + '<span class="ptag">' + esc(RACI.pillarNames[r.p]) + '</span></td>' +
      r.cells.map(function(c, i){ return '<td class="cell" data-role="' + i + '" data-v="' + c + '"><span class="rc ' + c + '" title="' + esc(RACI.roles[i]) + '">' + RNAMES[c] + '</span></td>'; }).join('') + '</tr>';
  }).join('');
  function raciRender(){
    raciTable.classList.toggle('focus', raciRole !== 'all');
    $$('th.role', raciTable).forEach(function(th){ th.classList.toggle('hit', th.getAttribute('data-role') === raciRole); });
    var counts = {R:0, A:0, C:0, I:0};
    $$('tr', tbody).forEach(function(tr){
      var show = raciPillar === 'all' || tr.getAttribute('data-p') === raciPillar; tr.classList.toggle('hide', !show);
      $$('td.cell', tr).forEach(function(td){
        var hit = td.getAttribute('data-role') === raciRole; td.classList.toggle('hit', hit);
        if (hit && show){ var v = td.getAttribute('data-v'); if (v === 'AR'){ counts.R++; counts.A++; } else counts[v]++; }
      });
    });
    $('#raciSummary').innerHTML = raciRole === 'all' ? esc(UI.raciAll) : UI.raciLoad(esc(RACI.roles[+raciRole]), counts.R, counts.A, counts.C, counts.I);
  }
  $('#raciFilters').addEventListener('click', function(e){
    var b = e.target.closest('.fchip'); if (!b) return;
    if (b.hasAttribute('data-role')){ raciRole = b.getAttribute('data-role'); $$('[data-role]', $('#raciFilters')).forEach(function(x){ x.setAttribute('aria-pressed', String(x === b)); }); }
    else { raciPillar = b.getAttribute('data-pillar-filter'); $$('[data-pillar-filter]', $('#raciFilters')).forEach(function(x){ x.setAttribute('aria-pressed', String(x === b)); }); }
    raciRender();
  });
  raciRender();

  /* =====================================================
     QUIZ
     ===================================================== */
  var QUIZ = T.quiz, qCard = $('#quizCard'), qRing = $('#qRing'), qNum = $('#qScoreNum'), qOf = $('#qScoreOf'), qResName = $('#qResName'), qResDesc = $('#qResDesc');
  var qIdx = 0, qAnswers = QUIZ.map(function(){ return null; }), qDone = false;
  qOf.textContent = UI.qOf + ' ' + QUIZ.length;
  var LETTERS = ['A','B','C','D'];
  function qScore(){ return qAnswers.filter(function(a, i){ return a !== null && a === QUIZ[i].a; }).length; }
  function qRenderScore(){
    var s = qScore(); qNum.textContent = s;
    qRing.style.strokeDashoffset = String(408.4 - 408.4 * (s / QUIZ.length));
    var answered = qAnswers.filter(function(a){ return a !== null; }).length;
    if (!answered){ qResName.textContent = UI.qStart; qResDesc.textContent = UI.qStartHint; return; }
    var L = levelFor(s, UI.qLevels); qResName.textContent = L.name + (qDone ? '' : ' · ' + UI.qHits(s, answered)); qResDesc.textContent = L.desc;
  }
  function qRender(){
    if (qDone){
      var s = qScore(), L = levelFor(s, UI.qLevels);
      qCard.innerHTML = '<div class="qfinal"><span class="label" style="--accent:#6030C0;--accent-text:var(--violet-text);justify-content:center">' + esc(UI.qFinalTitle) + '</span><div class="big">' + s + '/' + QUIZ.length + '</div><p style="margin:.4rem 0 0;font-weight:700;color:var(--indigo-text)">' + esc(L.name) + '</p><p class="muted small">' + esc(L.desc) + '</p>' +
        '<div class="review"><span class="label">' + esc(UI.qReview) + '</span>' + QUIZ.map(function(q, i){ var ok = qAnswers[i] === q.a; return '<div><span class="k ' + (ok ? 'ok' : 'bad') + '">' + (ok ? '✓' : '✕') + '</span><span>' + esc(q.q) + (ok ? '' : ' <a href="#pilares" data-pillar="' + q.p + '">→</a>') + '</span></div>'; }).join('') + '</div>' +
        '<div class="qnav" style="justify-content:center"><button class="btn btn-primary btn-sm" id="qRestart" type="button">' + esc(UI.qRestart) + '</button></div></div>';
      qRenderScore(); return;
    }
    var q = QUIZ[qIdx], ans = qAnswers[qIdx];
    var prog = QUIZ.map(function(qq, i){ var c = i === qIdx ? ' cur' : (qAnswers[i] === null ? '' : (qAnswers[i] === qq.a ? ' ok' : ' bad')); return '<i class="' + c.trim() + '"></i>'; }).join('');
    var h = '<div class="qmeta"><span class="label p-' + q.p + '">' + esc(UI.qProgress(qIdx + 1, QUIZ.length)) + ' · ' + esc(RACI.pillarNames[q.p]) + '</span><div class="qprog">' + prog + '</div></div><h4>' + esc(q.q) + '</h4><div class="qopts">';
    q.opts.forEach(function(o, i){
      var cls = ''; if (ans !== null){ if (i === q.a) cls = ' correct'; else if (i === ans) cls = ' wrong'; }
      h += '<button class="qopt' + cls + '" type="button" data-i="' + i + '"' + (ans !== null ? ' disabled' : '') + '><span class="k">' + LETTERS[i] + '</span><span>' + esc(o) + '</span></button>';
    });
    h += '</div>';
    if (ans !== null){ h += '<div class="qfeed' + (ans === q.a ? '' : ' bad') + '"><b>' + esc(ans === q.a ? UI.qCorrect : UI.qWrong) + '</b> ' + esc(q.why) + ' <a href="' + q.src + '" target="_blank" rel="noopener noreferrer">' + esc(UI.qSource) + ': ' + esc(q.srcName) + ' ↗</a></div>'; }
    h += '<div class="qnav"><span class="small muted">' + esc(UI.qHits(qScore(), qAnswers.filter(function(x){ return x !== null; }).length)) + '</span>' + (ans !== null ? '<button class="btn btn-primary btn-sm" id="qNext" type="button">' + esc(qIdx === QUIZ.length - 1 ? UI.qFinish : UI.qNext) + '</button>' : '') + '</div>';
    qCard.innerHTML = h; qRenderScore();
  }
  qCard.addEventListener('click', function(e){
    var opt = e.target.closest('.qopt');
    if (opt && !opt.disabled){
      qAnswers[qIdx] = +opt.getAttribute('data-i'); qRender();
      var feedback = $('.qfeed', qCard); feedback.tabIndex = -1; feedback.focus({preventScroll:true}); return;
    }
    if (e.target.closest('#qNext')){
      if (qIdx === QUIZ.length - 1) qDone = true; else qIdx++;
      qRender(); qCard.tabIndex = -1; qCard.focus({preventScroll:true});
      qCard.scrollIntoView({behavior: reduce ? 'auto' : 'smooth', block:'nearest'}); return;
    }
    if (e.target.closest('#qRestart')){
      qIdx = 0; qDone = false; qAnswers = QUIZ.map(function(){ return null; });
      qRender(); qCard.tabIndex = -1; qCard.focus({preventScroll:true});
    }
  });
  qRender();
})();
