// ── STORAGE ──────────────────────────────────
var DB = {
  get: function(k) { try { return JSON.parse(localStorage.getItem(k)); } catch(e) { return null; } },
  set: function(k, v) { localStorage.setItem(k, JSON.stringify(v)); }
};

// ── STATE ─────────────────────────────────────
var currentAgent = null; // { id, displayName, rank, rating, note }
var isAdmin = false;
var ADMIN_PASS = 'nexus2025';

// ── INIT ──────────────────────────────────────
function initData() {
  if (!DB.get('agents')) {
    DB.set('agents', [
      { id: 'demo1', displayName: 'Agent Zero', rank: 'Operative', rating: 3, note: 'Demo ucet' }
    ]);
  }
  if (!DB.get('tasks'))        DB.set('tasks', {});
  if (!DB.get('messages'))     DB.set('messages', {});
  if (!DB.get('reports'))      DB.set('reports', []);
  if (!DB.get('warehouse'))    DB.set('warehouse', defaultWarehouse());
  if (!DB.get('itemRequests')) DB.set('itemRequests', []);
  if (!DB.get('syslog'))       DB.set('syslog', []);
}

function defaultWarehouse() {
  return [
    { id: uid(), name: 'Náboje dlouhe',  cat: 'ammo',      qty: 0, min: 0,  note: 'Náboje pro dlouhé',     img: 'nabojdlouhy.png' },
    { id: uid(), name: 'Náboje krátké',  cat: 'ammo',      qty: 0, min: 0, note: 'Náboje pro krátké',   img: 'nabojpistol.png'  },
    { id: uid(), name: 'Baterka',           cat: 'equipment',  qty: 0,  min: 0,  note: 'Baterka na pistole', img: 'baterka.png'   },
    { id: uid(), name: 'Tlumic',            cat: 'weapons',    qty: 0,  min: 0,  note: 'Pro pistoli i SMG', img: 'tlumic.png'       },
    { id: uid(), name: 'Zamerovac',         cat: 'weapons',    qty: 0,  min: 0,  note: 'Opticky zamerovac', img: 'zamerovac.png'    },
    { id: uid(), name: 'Velky zasobnik',    cat: 'weapons',    qty: 0,  min: 0,  note: 'Extended mag',      img: 'velkyzasobnik.png'},
    { id: uid(), name: 'Žlutá Tráva',       cat: 'drugs',      qty: 0,  min: 0,  note: 'Specialni item',    img: 'zlutatrava.png'  }
  ];
}

// ── UTILS ─────────────────────────────────────
function uid() { return Math.random().toString(36).slice(2,9) + Date.now().toString(36).slice(-4); }
function esc(s) {
  if (!s) return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/\n/g,'<br>');
}
function nowStr() {
  return new Date().toLocaleString('cs-CZ',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'});
}
function nowFull() {
  return new Date().toLocaleString('cs-CZ',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit',second:'2-digit'});
}
function stars(r) {
  var n = parseInt(r)||0;
  return '&#9733;'.repeat(n) + '&#9734;'.repeat(Math.max(0,5-n));
}
function setText(id, v) { var e=document.getElementById(id); if(e) e.textContent=v; }
function setHtml(id, v) { var e=document.getElementById(id); if(e) e.innerHTML=v; }

var CAT = { weapons:'⚔ZBRANE', ammo:'◎ MUNICE', vehicles:'VOZIDLA', equipment:'⬢ VYBAVENI', drugs:'DROGY', other:'OSTATNI' };
var PRIO = { low:'LOW', normal:'NORMAL', high:'HIGH', urgent:'URGENT' };
var STAT = { pending:'CEKA', approved:'SCHVALENO', denied:'ZAMITNUTO' };

function itemHtml(item) {
  var qc = item.qty === 0 ? 'empty' : (item.min > 0 && item.qty <= item.min ? 'low' : '');
  var imgHtml = item.img
    ? '<div class="wh-img"><img src="images/'+esc(item.img)+'" alt="'+esc(item.name)+'" onerror="this.parentElement.innerHTML=\'<span class=wh-icon>?</span>\'"/></div>'
    : '<div class="wh-img"><span class="wh-icon">'+(item.cat==='weapons'?'W':item.cat==='ammo'?'A':item.cat==='vehicles'?'V':item.cat==='equipment'?'E':'O')+'</span></div>';
  return imgHtml +
    '<div class="wh-cat">'+(CAT[item.cat]||item.cat)+'</div>'+
    '<div class="wh-name">'+esc(item.name)+'</div>'+
    (item.note?'<div class="wh-note">'+esc(item.note)+'</div>':'')+
    '<div class="wh-qty-row"><span class="wh-qty '+qc+'">'+item.qty+'</span><span class="wh-unit"> KS</span></div>'+
    (item.min>0&&item.qty>0&&item.qty<=item.min?'<div class="wh-alert">NIZKA ZASOBA</div>':'');
}

// ── LOG ───────────────────────────────────────
function addLog(type, text) {
  var log = DB.get('syslog') || [];
  log.unshift({ time: nowFull(), type: type, text: text });
  if (log.length > 500) log = log.slice(0, 500);
  DB.set('syslog', log);
  updateLogBadge();
}

function updateLogBadge() {
  var log = DB.get('syslog') || [];
  var badge = document.getElementById('logBadge');
  if (!badge) return;
  if (log.length > 0) { badge.textContent = log.length > 99 ? '99+' : log.length; badge.classList.add('visible'); }
  else badge.classList.remove('visible');
}

// ── CLOCK ─────────────────────────────────────
function startClock() {
  function tick() {
    var s = new Date().toLocaleString('cs-CZ',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit',second:'2-digit'});
    setText('mClock', s); setText('termClock', new Date().toLocaleTimeString('cs-CZ'));
  }
  tick(); setInterval(tick, 1000);
}

// ── SCREENS ───────────────────────────────────
function showScreen(id) {
  ['selectScreen','memberScreen','adminScreen'].forEach(function(s){
    var el = document.getElementById(s);
    el.classList.remove('active');
    el.classList.add('hidden');
  });
  var target = document.getElementById(id);
  target.classList.remove('hidden');
  target.classList.add('active');
}

function goBack() {
  currentAgent = null;
  isAdmin = false;
  renderAgentSelect();
  showScreen('selectScreen');
}

// ── AGENT SELECT SCREEN ───────────────────────
function renderAgentSelect() {
  var agents = DB.get('agents') || [];
  var el = document.getElementById('agentButtons');
  if (!agents.length) {
    el.innerHTML = '<div class="no-agents">// Zatim zadni členové frakce.<br>Prihlaste se do Administrace a pridejte členy frakce.</div>';
    return;
  }
  el.innerHTML = agents.map(function(a) {
    return '<button class="agent-btn" onclick="selectAgent(\''+a.id+'\')">'+
      '<div class="agent-btn-hex">'+esc(a.displayName.charAt(0).toUpperCase())+'</div>'+
      '<div class="agent-btn-info">'+
        '<span class="agent-btn-name">'+esc(a.displayName)+'</span>'+
        '<span class="agent-btn-rank">'+esc(a.rank)+'</span>'+
      '</div></button>';
  }).join('');
}

function selectAgent(id) {
  var agents = DB.get('agents') || [];
  var agent = agents.find(function(a){ return a.id === id; });
  if (!agent) return;
  currentAgent = agent;
  isAdmin = false;
  addLog('sys', 'Člen "'+agent.displayName+'" se prihlasil.');
  showScreen('memberScreen');
  mTab('overview', document.querySelector('#memberScreen .nb'));
}

// ── ADMIN MODAL ───────────────────────────────
function openAdminModal() {
  document.getElementById('adminModal').classList.remove('hidden');
  document.getElementById('adminPassInput').value = '';
  document.getElementById('adminPassErr').textContent = '';
  setTimeout(function(){ document.getElementById('adminPassInput').focus(); }, 100);
}
function closeAdminModal() {
  document.getElementById('adminModal').classList.add('hidden');
}
function doAdminLogin() {
  var pass = document.getElementById('adminPassInput').value;
  if (pass === ADMIN_PASS) {
    closeAdminModal();
    isAdmin = true;
    currentAgent = null;
    addLog('sys', 'Admin se přihlasil.');
    showScreen('adminScreen');
    aTab('agents', document.querySelector('#adminScreen .nb'));
    updateLogBadge();
  } else {
    document.getElementById('adminPassErr').textContent = '// Špatné heslo ! V případě zapomenutí se podívej na appku.';
  }
}

// ════════════════════════════════
//  MEMBER TABS
// ════════════════════════════════
function mTab(tab, btn) {
  document.querySelectorAll('.mt').forEach(function(t){ t.classList.remove('active'); });
  document.querySelectorAll('#memberScreen .nb').forEach(function(b){ b.classList.remove('active'); });
  var el = document.getElementById('mt-'+tab);
  if (el) el.classList.add('active');
  if (btn) btn.classList.add('active');
  if (tab==='overview')  renderOverview();
  if (tab==='tasks')     renderMemberTasks();
  if (tab==='messages')  renderMemberMessages();
  if (tab==='warehouse') renderMemberWarehouse();
  if (tab==='report')    renderSentReports();
}

function renderOverview() {
  var a = currentAgent;
  setText('sbName', a.displayName);
  setText('ovName', a.displayName);
  setText('ovRank', a.rank);
  setText('ovNote', a.note || '');
  setText('termAgent', a.id);
  document.getElementById('profHex').textContent = a.displayName.charAt(0).toUpperCase();
  setHtml('ovStars', stars(a.rating));
  setHtml('ovStarsLg', stars(a.rating));

  var tasks = DB.get('tasks') || {};
  var myTasks = (tasks[a.id] || []).filter(function(t){ return !t.done; });
  setText('ovTaskCount', myTasks.length);

  var badge = document.getElementById('taskBadge');
  if (myTasks.length) { badge.textContent = myTasks.length; badge.classList.add('visible'); }
  else badge.classList.remove('visible');

  var msgs = DB.get('messages') || {};
  var myMsgs = msgs[a.id] || [];
  var mb = document.getElementById('msgBadge');
  if (myMsgs.length) { mb.textContent = myMsgs.length; mb.classList.add('visible'); }
  else mb.classList.remove('visible');

  var last = myTasks[myTasks.length-1];
  setText('ovLastTask', last ? '['+PRIO[last.priority]+'] '+last.title+' — '+last.date : '// Žádné aktivní ukoly');
}

function renderMemberTasks() {
  var tasks = DB.get('tasks') || {};
  var myTasks = (tasks[currentAgent.id] || []).filter(function(t){ return !t.done; });
  var el = document.getElementById('mTaskList');
  if (!myTasks.length) { el.innerHTML = '<div class="empty-s">// ZADNE AKTIVNI UKOLY</div>'; return; }
  el.innerHTML = myTasks.map(function(t, i){
    return '<div class="task-card '+t.priority+'">'+
      '<div class="task-top"><span class="task-name">'+esc(t.title)+'</span><span class="pchip '+t.priority+'">'+PRIO[t.priority]+'</span></div>'+
      '<div class="task-desc">'+esc(t.desc)+'</div>'+
      '<div class="task-meta"><span class="task-date">'+t.date+'</span>'+
      '<button class="btn-done" onclick="markDone(\''+currentAgent.id+'\','+i+')">SPLNENO</button></div></div>';
  }).join('');
}

function markDone(agentId, idx) {
  var tasks = DB.get('tasks') || {};
  if (tasks[agentId]) {
    var t = tasks[agentId][idx];
    tasks[agentId][idx].done = true;
    DB.set('tasks', tasks);
    addLog('task', 'Člen "'+currentAgent.displayName+'" splnil ukol: "'+t.title+'".');
    renderMemberTasks();
    renderOverview();
  }
}

function renderMemberMessages() {
  var msgs = DB.get('messages') || {};
  var myMsgs = msgs[currentAgent.id] || [];
  var el = document.getElementById('mMsgList');
  if (!myMsgs.length) { el.innerHTML = '<div class="empty-s">// Žádné Zprávy</div>'; return; }
  el.innerHTML = myMsgs.slice().reverse().map(function(m){
    return '<div class="msg-card"><div class="msg-subject">'+esc(m.subject)+'</div><div class="msg-body">'+esc(m.body)+'</div><div class="msg-from">// OD: Vedení — '+m.date+'</div></div>';
  }).join('');
}

function submitReport() {
  var text = document.getElementById('reportText').value.trim();
  var st = document.getElementById('reportStatus');
  if (!text) { st.textContent = '// PRAZDNA ZPRAVA'; return; }
  var reports = DB.get('reports') || [];
  reports.push({ agentId: currentAgent.id, agentName: currentAgent.displayName, body: text, date: nowStr() });
  DB.set('reports', reports);
  addLog('msg', 'Člen "'+currentAgent.displayName+'" odeslal hlaseni.');
  document.getElementById('reportText').value = '';
  st.textContent = '// ODESLANO';
  setTimeout(function(){ st.textContent=''; }, 3000);
  renderSentReports();
}

function renderSentReports() {
  var reports = DB.get('reports') || [];
  var mine = reports.filter(function(r){ return r.agentId === currentAgent.id; });
  var el = document.getElementById('mSentReports');
  if (!mine.length) { el.innerHTML = '<div class="empty-s">// Žádné odeslané zprávy</div>'; return; }
  el.innerHTML = mine.slice().reverse().map(function(r){
    return '<div class="sent-entry"><span class="sent-date">'+r.date+'</span>'+esc(r.body)+'</div>';
  }).join('');
}

// ── MEMBER WAREHOUSE ──────────────────────────
var mWhCat = 'all';

function renderMemberWarehouse() {
  var items = DB.get('warehouse') || [];
  var filtered = mWhCat==='all' ? items : items.filter(function(i){ return i.cat===mWhCat; });
  var el = document.getElementById('mWhGrid');

  if (!filtered.length) {
    el.innerHTML = '<div class="empty-s" style="grid-column:1/-1">// Žádné věci ve skladu</div>';
  } else {
    el.innerHTML = filtered.map(function(item){
      return '<div class="wh-item">'+itemHtml(item)+
        '<div class="wh-evidence">'+
          '<input class="wh-ev-input" type="text" placeholder="Jméno..." id="ev-'+item.id+'"/>'+
          '<button class="btn-evidence" onclick="evidenceItem(\''+item.id+'\')">EVIDOVAT</button>'+
        '</div></div>';
    }).join('');
  }

  // populate request select
  var avail = items.filter(function(i){ return i.qty>0; });
  var sel = document.getElementById('reqItem');
  sel.innerHTML = avail.length
    ? avail.map(function(i){ return '<option value="'+i.id+'">'+esc(i.name)+' ('+i.qty+' ks)</option>'; }).join('')
    : '<option value="">-- Žádné dostupne itemy --</option>';

  renderMyReqs();
}

function mWhFilter(cat, btn) {
  mWhCat = cat;
  document.querySelectorAll('#mt-warehouse .wf').forEach(function(b){ b.classList.remove('active'); });
  btn.classList.add('active');
  renderMemberWarehouse();
}

function evidenceItem(itemId) {
  var nameEl = document.getElementById('ev-'+itemId);
  var jmeno = nameEl ? nameEl.value.trim() : '';
  if (!jmeno) { nameEl.style.borderColor='var(--red)'; setTimeout(function(){ nameEl.style.borderColor=''; },1500); return; }

  var items = DB.get('warehouse') || [];
  var item = items.find(function(i){ return i.id===itemId; });
  if (!item) return;

  addLog('ev', 'EVIDENCE: "'+jmeno+'" prevzal/a "'+item.name+'" — Zaznam v skladu. Člen: '+currentAgent.displayName+'.');
  nameEl.value = '';
  nameEl.placeholder = 'Zaznamenano!';
  setTimeout(function(){ nameEl.placeholder='Jméno...'; }, 2000);
}

function submitReq() {
  var itemId = document.getElementById('reqItem').value;
  var amt = parseInt(document.getElementById('reqAmt').value)||1;
  var reason = document.getElementById('reqReason').value.trim();
  var st = document.getElementById('reqStatus');
  if (!itemId) { st.textContent='// VYBERTE ITEM'; return; }
  if (!reason) { st.textContent='// ZADEJTE DUVOD'; return; }
  var items = DB.get('warehouse') || [];
  var item = items.find(function(i){ return i.id===itemId; });
  if (!item) { st.textContent='// ITEM NENALEZEN'; return; }
  if (amt>item.qty) { st.textContent='// MAX '+item.qty; return; }
  var reqs = DB.get('itemRequests') || [];
  reqs.push({ id:uid(), agentId:currentAgent.id, agentName:currentAgent.displayName, itemId:itemId, itemName:item.name, amt:amt, reason:reason, status:'pending', date:nowStr() });
  DB.set('itemRequests', reqs);
  addLog('req', 'Člen "'+currentAgent.displayName+'" požadal o vydej: '+amt+'x "'+item.name+'" — důvod: '+reason);
  document.getElementById('reqReason').value='';
  document.getElementById('reqAmt').value='1';
  st.textContent='// Žádost odeslaná';
  setTimeout(function(){ st.textContent=''; },3000);
  renderMyReqs();
}

function renderMyReqs() {
  var reqs = DB.get('itemRequests') || [];
  var mine = reqs.filter(function(r){ return r.agentId===currentAgent.id; });
  var el = document.getElementById('mMyReqs');
  if (!mine.length) { el.innerHTML='<div class="empty-s">// ZADNE ZADOSTI</div>'; return; }
  el.innerHTML = mine.slice().reverse().map(function(r){
    return '<div class="myreq-entry"><div class="myreq-info"><span class="myreq-date">'+r.date+'</span>'+
      '<strong style="color:var(--textb)">'+esc(r.itemName)+'</strong> — '+r.amt+' ks'+
      '<br><span style="font-style:italic;font-size:.82rem">'+esc(r.reason)+'</span></div>'+
      '<span class="status-chip '+r.status+'">'+STAT[r.status]+'</span></div>';
  }).join('');
}

// ════════════════════════════════
//  ADMIN TABS
// ════════════════════════════════
function aTab(tab, btn) {
  document.querySelectorAll('.at').forEach(function(t){ t.classList.remove('active'); });
  document.querySelectorAll('#adminScreen .nb').forEach(function(b){ b.classList.remove('active'); });
  var el = document.getElementById('at-'+tab);
  if (el) el.classList.add('active');
  if (btn) btn.classList.add('active');
  if (tab==='agents')    renderAdminAgents();
  if (tab==='tasks')     fillAgentSelects();
  if (tab==='messages')  fillAgentSelects();
  if (tab==='warehouse') renderAdminWarehouse();
  if (tab==='reports')   renderAdminReports();
  if (tab==='log')       renderLog();
}

// ── AGENTS ────────────────────────────────────
function toggleNewAgent() { document.getElementById('newAgentPanel').classList.toggle('hidden'); }

function createAgent() {
  var login = document.getElementById('na-login').value.trim();
  var name  = document.getElementById('na-name').value.trim();
  var rank  = document.getElementById('na-rank').value;
  var rating= parseInt(document.getElementById('na-rating').value);
  var note  = document.getElementById('na-note').value.trim();
  var st = document.getElementById('createStatus');
  if (!login||!name) { st.textContent='// VYPLNTE POVINNE POLE'; return; }
  var agents = DB.get('agents') || [];
  if (agents.find(function(a){ return a.id===login; })) { st.textContent='// LOGIN JIZ EXISTUJE'; return; }
  agents.push({ id:login, displayName:name, rank:rank, rating:rating, note:note });
  DB.set('agents', agents);
  addLog('agent', 'Admin vytvoril agenta "'+name+'" (ID: '+login+', rank: '+rank+').');
  st.textContent='// AGENT "'+name+'" REGISTROVAN';
  setTimeout(function(){ st.textContent=''; },3000);
  ['na-login','na-name','na-note'].forEach(function(id){ document.getElementById(id).value=''; });
  renderAdminAgents();
  renderAgentSelect();
}

function renderAdminAgents() {
  var agents = DB.get('agents') || [];
  var el = document.getElementById('agentGrid');
  if (!agents.length) { el.innerHTML='<div class="empty-s">// ZADNI AGENTI — PRIDEJTE PRVNIHO</div>'; return; }
  el.innerHTML = agents.map(function(a){
    return '<div class="agent-card">'+
      '<div class="ac-head"><div><div class="ac-name">'+esc(a.displayName)+'</div><div class="ac-login">ID: '+a.id+'</div></div>'+
      '<div class="rank-chip">'+esc(a.rank)+'</div></div>'+
      '<div class="ac-stars" id="acs-'+a.id+'"></div>'+
      (a.note?'<div class="ac-note">'+esc(a.note)+'</div>':'')+
      '<div class="ac-actions">'+
        '<button class="btn-micro" onclick="editAgentRating(\''+a.id+'\')">RATING</button>'+
        '<button class="btn-micro" onclick="editAgentRank(\''+a.id+'\')">RANK</button>'+
        '<button class="btn-micro" onclick="editAgentNote(\''+a.id+'\')">POZNAMKA</button>'+
        '<button class="btn-micro del" onclick="deleteAgent(\''+a.id+'\')">SMAZAT</button>'+
      '</div></div>';
  }).join('');
  agents.forEach(function(a){ setHtml('acs-'+a.id, stars(a.rating)); });
}

function editAgentRating(id) {
  var agents = DB.get('agents')||[];
  var a = agents.find(function(x){ return x.id===id; });
  var r = prompt('Hodnoceni pro '+a.displayName+' (1-5):',a.rating);
  var n = parseInt(r);
  if (r!==null&&n>=1&&n<=5) { a.rating=n; DB.set('agents',agents); addLog('agent','Admin zmenil rating agenta "'+a.displayName+'" na '+n+'.'); renderAdminAgents(); renderAgentSelect(); }
}
function editAgentRank(id) {
  var ranks=['Recruit','Operative','Agent','Field Lead','Commander','Director'];
  var agents=DB.get('agents')||[];
  var a=agents.find(function(x){ return x.id===id; });
  var r=prompt('Rank ('+ranks.join(' / ')+'):',a.rank);
  if (r!==null&&ranks.indexOf(r)!==-1) { a.rank=r; DB.set('agents',agents); addLog('agent','Admin zmenil rank agenta "'+a.displayName+'" na "'+r+'".'); renderAdminAgents(); renderAgentSelect(); }
  else if (r!==null) alert('Neplatny rank.');
}
function editAgentNote(id) {
  var agents=DB.get('agents')||[];
  var a=agents.find(function(x){ return x.id===id; });
  var r=prompt('Poznamka:',a.note||'');
  if (r!==null) { a.note=r; DB.set('agents',agents); addLog('agent','Admin upravil poznamku agenta "'+a.displayName+'".'); renderAdminAgents(); }
}
function deleteAgent(id) {
  if (!confirm('Smazat agenta?')) return;
  var agents=DB.get('agents')||[];
  var a=agents.find(function(x){ return x.id===id; });
  DB.set('agents',agents.filter(function(x){ return x.id!==id; }));
  addLog('agent','Admin smazal agenta "'+(a?a.displayName:id)+'".');
  renderAdminAgents();
  renderAgentSelect();
}

function fillAgentSelects() {
  var agents=DB.get('agents')||[];
  var opts='<option value="">-- Vyberte agenta --</option>'+
    agents.map(function(a){ return '<option value="'+a.id+'">'+esc(a.displayName)+'</option>'; }).join('');
  ['taskTarget','msgTarget'].forEach(function(id){ var e=document.getElementById(id); if(e) e.innerHTML=opts; });
}

// ── TASKS ADMIN ───────────────────────────────
function assignTask() {
  var agentId=document.getElementById('taskTarget').value;
  var title=document.getElementById('taskTitle').value.trim();
  var desc=document.getElementById('taskDesc').value.trim();
  var prio=document.getElementById('taskPrio').value;
  var st=document.getElementById('taskStatus');
  if (!agentId||!title) { st.textContent='// VYPLNTE POLE'; return; }
  var agents=DB.get('agents')||[];
  var agent=agents.find(function(a){ return a.id===agentId; });
  var tasks=DB.get('tasks')||{};
  if (!tasks[agentId]) tasks[agentId]=[];
  tasks[agentId].push({title:title,desc:desc,priority:prio,date:nowStr(),done:false});
  DB.set('tasks',tasks);
  addLog('task','Admin pridelil ukol ["'+PRIO[prio]+'] '+title+'" agentovi "'+(agent?agent.displayName:agentId)+'".');
  st.textContent='// ROZKAZ ODESLAN';
  setTimeout(function(){ st.textContent=''; },3000);
  document.getElementById('taskTitle').value='';
  document.getElementById('taskDesc').value='';
}

// ── MESSAGES ADMIN ────────────────────────────
function sendMsg() {
  var agentId=document.getElementById('msgTarget').value;
  var subject=document.getElementById('msgSubject').value.trim();
  var body=document.getElementById('msgBody').value.trim();
  var st=document.getElementById('msgStatus');
  if (!agentId||!subject||!body) { st.textContent='// VYPLNTE POLE'; return; }
  var agents=DB.get('agents')||[];
  var agent=agents.find(function(a){ return a.id===agentId; });
  var msgs=DB.get('messages')||{};
  if (!msgs[agentId]) msgs[agentId]=[];
  msgs[agentId].push({subject:subject,body:body,date:nowStr()});
  DB.set('messages',msgs);
  addLog('msg','Admin odeslal zpravu ["'+subject+'"] agentovi "'+(agent?agent.displayName:agentId)+'".');
  st.textContent='// ODESLANO';
  setTimeout(function(){ st.textContent=''; },3000);
  document.getElementById('msgSubject').value='';
  document.getElementById('msgBody').value='';
}

// ── WAREHOUSE ADMIN ───────────────────────────
var aWhCat='all';

function toggleAddItem() { document.getElementById('addItemPanel').classList.toggle('hidden'); }

function previewImg(val) {
  var el=document.getElementById('wi-preview');
  if (!el) return;
  if (!val.trim()) { el.innerHTML='—'; return; }
  el.innerHTML='<img src="images/'+esc(val)+'" alt="preview" onerror="this.parentElement.innerHTML=\'<span style=color:var(--red)>chyba</span>\'"/>';
}

function addItem() {
  var name=document.getElementById('wi-name').value.trim();
  var cat=document.getElementById('wi-cat').value;
  var qty=parseInt(document.getElementById('wi-qty').value)||0;
  var min=parseInt(document.getElementById('wi-min').value)||0;
  var img=document.getElementById('wi-img').value.trim();
  var note=document.getElementById('wi-note').value.trim();
  var st=document.getElementById('addItemStatus');
  if (!name) { st.textContent='// ZADEJTE NAZEV'; return; }
  var items=DB.get('warehouse')||[];
  var newItem={id:uid(),name:name,cat:cat,qty:qty,min:min,img:img,note:note};
  items.push(newItem);
  DB.set('warehouse',items);
  addLog('wh','Admin pridal do skladu: "'+name+'" (kat: '+(CAT[cat]||cat)+', mnozstvi: '+qty+').');
  st.textContent='// "'+name+'" PRIDAN';
  setTimeout(function(){ st.textContent=''; },3000);
  ['wi-name','wi-img','wi-note'].forEach(function(id){ document.getElementById(id).value=''; });
  document.getElementById('wi-qty').value='1';
  document.getElementById('wi-min').value='0';
  document.getElementById('wi-preview').innerHTML='—';
  renderAdminWarehouse();
}

function renderAdminWarehouse() {
  var items=DB.get('warehouse')||[];
  var filtered=aWhCat==='all'?items:items.filter(function(i){ return i.cat===aWhCat; });
  var el=document.getElementById('aWhGrid');
  if (!filtered.length) { el.innerHTML='<div class="empty-s" style="grid-column:1/-1">// PRAZDNY SKLAD</div>'; }
  else {
    el.innerHTML=filtered.map(function(item){
      return '<div class="wh-item">'+itemHtml(item)+
        '<div class="wh-adm-ctrl">'+
          '<input type="number" class="qty-inp" id="qi-'+item.id+'" value="1" min="1"/>'+
          '<button class="btn-micro" onclick="adjQty(\''+item.id+'\',1)">+</button>'+
          '<button class="btn-micro" onclick="adjQty(\''+item.id+'\',-1)">-</button>'+
          '<button class="btn-micro del" onclick="delItem(\''+item.id+'\')">X</button>'+
        '</div></div>';
    }).join('');
  }
  renderAdminReqs();
}

function aWhFilter(cat, btn) {
  aWhCat=cat;
  document.querySelectorAll('#at-warehouse .wf').forEach(function(b){ b.classList.remove('active'); });
  btn.classList.add('active');
  renderAdminWarehouse();
}

function adjQty(itemId, dir) {
  var inp=document.getElementById('qi-'+itemId);
  var amt=parseInt(inp?inp.value:1)||1;
  var items=DB.get('warehouse')||[];
  var item=items.find(function(i){ return i.id===itemId; });
  if (!item) return;
  var before=item.qty;
  item.qty=Math.max(0,item.qty+dir*amt);
  DB.set('warehouse',items);
  addLog('wh','Admin upravil zasob "'+item.name+'": '+before+' → '+item.qty+' ks.');
  renderAdminWarehouse();
}

function delItem(itemId) {
  if (!confirm('Smazat item ze skladu?')) return;
  var items=DB.get('warehouse')||[];
  var item=items.find(function(i){ return i.id===itemId; });
  DB.set('warehouse',items.filter(function(i){ return i.id!==itemId; }));
  addLog('wh','Admin smazal item "'+(item?item.name:itemId)+'" ze skladu.');
  renderAdminWarehouse();
}

function renderAdminReqs() {
  var reqs=DB.get('itemRequests')||[];
  var el=document.getElementById('aReqList');
  if (!reqs.length) { el.innerHTML='<div class="empty-s">// ZADNE ZADOSTI</div>'; return; }
  el.innerHTML=reqs.slice().reverse().map(function(r){
    return '<div class="req-card '+r.status+'">'+
      '<div class="req-info">'+
        '<div class="req-item-name">'+esc(r.itemName)+' — '+r.amt+' ks</div>'+
        '<div class="req-meta">AGENT: '+esc(r.agentName)+' · '+r.date+'</div>'+
        '<div class="req-reason">'+esc(r.reason)+'</div>'+
      '</div>'+
      (r.status==='pending'
        ? '<div class="req-actions"><button class="btn-approve" onclick="resolveReq(\''+r.id+'\',\'approved\')">SCHVALIT</button><button class="btn-deny" onclick="resolveReq(\''+r.id+'\',\'denied\')">ZAMITIT</button></div>'
        : '<span class="status-chip '+r.status+'">'+STAT[r.status]+'</span>')+
      '</div>';
  }).join('');
}

function resolveReq(reqId, decision) {
  var reqs=DB.get('itemRequests')||[];
  var req=reqs.find(function(r){ return r.id===reqId; });
  if (!req) return;
  req.status=decision;
  if (decision==='approved') {
    var items=DB.get('warehouse')||[];
    var item=items.find(function(i){ return i.id===req.itemId; });
    if (item) { item.qty=Math.max(0,item.qty-req.amt); DB.set('warehouse',items); }
    var msgs=DB.get('messages')||{};
    if (!msgs[req.agentId]) msgs[req.agentId]=[];
    msgs[req.agentId].push({subject:'Zadost schvalena: '+req.itemName,body:'Vase zadost o vydej '+req.amt+'x '+req.itemName+' byla schvalena. Vyzvednete si to u veleni.',date:nowStr()});
    DB.set('messages',msgs);
    addLog('req','Admin SCHVALIL zadost: '+req.amt+'x "'+req.itemName+'" pro agenta "'+req.agentName+'". Zasoba odectena.');
  } else {
    addLog('req','Admin ZAMITL zadost: '+req.amt+'x "'+req.itemName+'" od agenta "'+req.agentName+'".');
  }
  DB.set('itemRequests',reqs);
  renderAdminReqs();
  renderAdminWarehouse();
}

// ── REPORTS ───────────────────────────────────
function renderAdminReports() {
  var reports=DB.get('reports')||[];
  var el=document.getElementById('aReports');
  if (!reports.length) { el.innerHTML='<div class="empty-s">// ZADNA HLASENI</div>'; return; }
  el.innerHTML=reports.slice().reverse().map(function(r){
    return '<div class="rep-card"><div class="rep-from">// OD: '+esc(r.agentName)+' — '+r.date+'</div><div class="rep-body">'+esc(r.body)+'</div></div>';
  }).join('');
}

// ── LOG ───────────────────────────────────────
var LOG_TYPES = {
  ev:    'EVIDENCE',
  wh:    'SKLAD',
  req:   'ZADOST',
  task:  'UKOL',
  msg:   'ZPRAVA',
  agent: 'AGENT',
  sys:   'SYSTEM'
};

function renderLog() {
  var log=DB.get('syslog')||[];
  var el=document.getElementById('aLog');
  if (!log.length) { el.innerHTML='<div class="empty-s">// LOG JE PRAZDNY</div>'; return; }
  el.innerHTML=log.map(function(e){
    return '<div class="log-entry">'+
      '<span class="log-time">'+e.time+'</span>'+
      '<span class="log-type '+e.type+'">'+(LOG_TYPES[e.type]||e.type)+'</span>'+
      '<span class="log-text">'+esc(e.text)+'</span>'+
      '</div>';
  }).join('');
  updateLogBadge();
}

function clearLog() {
  if (!confirm('Opravdu vymazat cely log?')) return;
  DB.set('syslog',[]);
  renderLog();
  updateLogBadge();
}

// ── START ─────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
  initData();
  startClock();
  renderAgentSelect();
  updateLogBadge();

  document.getElementById('adminPassInput').addEventListener('keydown', function(e){
    if (e.key==='Enter') doAdminLogin();
  });
});
